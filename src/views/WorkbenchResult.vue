<template>
  <div class="result-page">
    <div class="result-header">
      <div class="result-title">{{ title || '创作成果' }}</div>
      <div class="result-actions">
        <button class="btn btn-ghost btn-sm" @click="copyText">📋 复制文本</button>
        <button class="btn btn-ghost btn-sm" :disabled="!isMember" @click="exportWord">📄 导出 Word</button>
        <button class="btn btn-ghost btn-sm" :disabled="!isMember" @click="exportTable">📊 导出表格</button>
        <button class="btn btn-primary btn-sm" @click="saveToLibrary">💾 保存素材库</button>
      </div>
    </div>

    <div class="result-body">
      <!-- 上：时间轴 -->
      <div class="result-timeline">
        <div class="timeline-ruler">
          <div class="timeline-tick" v-for="(shot, i) in shots" :key="i"
            :style="{ width: shot.dur + '%', background: shotColor(shot.type) }">
            <span class="tick-num">{{ i + 1 }}</span>
          </div>
        </div>
        <div class="timeline-meta">
          <span>总镜头 {{ shots.length }} | 估算时长 {{ totalDuration }}s</span>
        </div>
      </div>

      <!-- 下：完整文本 -->
      <div class="result-text" v-if="scriptText">
        <pre class="output-text" v-html="highlightedText"></pre>
      </div>
      <div v-else class="result-empty">
        <div class="empty-icon">🎬</div>
        <div>暂无成果数据</div>
      </div>
    </div>

    <div class="result-footer">
      <button class="btn btn-ghost" @click="$router.push('/')">← 返回工作台</button>
      <button class="btn btn-ghost" @click="regenerate">🔄 重新生成</button>
    </div>
  </div>
</template>

<script>
import axios from 'axios'

export default {
  name: 'WorkbenchResult',
  props: {
    taskId: { type: String, default: '' },
    embedded: { type: Boolean, default: false },
  },
  data() {
    return {
      title: '',
      scriptText: '',
      shots: [],
      totalDuration: 0,
      token: '',
      isMember: false,
    }
  },
  computed: {
    highlightedText() {
      if (!this.scriptText) return ''
      return this.scriptText
        .replace(/(违规|敏感|低俗|暴力|色情|赌博)/g, '<span class="hl-red">$1</span>')
        .replace(/(套路化|平庸|老套)/g, '<span class="hl-yellow">$1</span>')
        .replace(/(优质|爆款|精彩|亮点|黄金|经典|妙用)/g, '<span class="hl-blue">$1</span>')
    },
  },
  methods: {
    shotColor(type) {
      const m = { open: '#165DFF', hook: '#FF7D00', dialogue: '#3B82F6', action: '#8B5CF6', close: '#22C55E', product: '#FFAA00' }
      return m[type] || '#536170'
    },
    authHeaders() {
      return { 'Authorization': '***' + this.token }
    },
    async loadResult() {
      if (!this.taskId) return
      try {
        const r = await axios.get('/api/v1/pipeline/status/' + this.taskId, { headers: this.authHeaders() })
        if (r.data.success) {
          const d = r.data.data || r.data
          this.title = d.title || '创作成果'
          this.scriptText = d.script || d.script_text || d.text || ''
          if (d.shots) this.shots = d.shots
          else this.generateMockShots()
        }
      } catch (e) {
        this.generateMockShots()
      }
    },
    generateMockShots() {
      if (!this.scriptText) return
      const n = Math.min(Math.ceil(this.scriptText.length / 300), 15)
      const types = ['open', 'hook', 'dialogue', 'action', 'dialogue', 'close']
      this.shots = []
      for (let i = 0; i < n; i++) {
        this.shots.push({ type: types[i % types.length], dur: Math.round(100 / n) })
      }
      this.totalDuration = n * 8
    },
    async copyText() {
      try {
        await navigator.clipboard.writeText(this.scriptText)
        alert('已复制到剪贴板')
      } catch (e) { alert('复制失败') }
    },
    exportWord() { alert('导出功能需开通会员') },
    exportTable() { alert('导出功能需开通会员') },
    async saveToLibrary() {
      try {
        await axios.post('/api/v1/media/library/register', { text: this.scriptText, title: this.title, type: 'script' }, { headers: this.authHeaders() })
        alert('已保存到素材库')
      } catch (e) { alert('保存失败: ' + (e.message || e)) }
    },
    regenerate() {
      this.$router.push('/')
    },
    loadUser() {
      this.token = localStorage.getItem('token') || ''
      this.isMember = !!localStorage.getItem('token')
    },
  },
  mounted() {
    this.loadUser()
    this.loadResult()
  },
}
</script>

<style scoped>
.result-page { padding: 20px 24px; }
.result-header {
  display: flex; justify-content: space-between; align-items: center;
  margin-bottom: 16px;
}
.result-title { font-size: 16px; font-weight: 700; }
.result-actions { display: flex; gap: 6px; flex-wrap: wrap; }

.result-body { flex: 1; }
.result-timeline { margin-bottom: 16px; }
.timeline-ruler {
  display: flex; height: 20px;
  border-radius: 3px; overflow: hidden;
  background: var(--bg-deep);
}
.timeline-tick {
  display: flex; align-items: center; justify-content: center;
  min-width: 16px;
  border-right: 1px solid rgba(0,0,0,0.2);
}
.tick-num { font-size: 9px; color: rgba(255,255,255,0.7); font-weight: 600; }
.timeline-meta { margin-top: 4px; font-size: 10px; color: var(--text-muted); }

.result-text {
  background: var(--bg-surface);
  border: 1px solid var(--border-main);
  border-radius: var(--radius);
  padding: 16px;
  max-height: 400px; overflow-y: auto;
}
.output-text {
  font-family: 'Consolas', 'Courier New', monospace;
  font-size: 12px; line-height: 1.8;
  white-space: pre-wrap; word-wrap: break-word;
  color: var(--text-primary);
}
.result-empty {
  display: flex; flex-direction: column; align-items: center;
  justify-content: center; height: 200px;
  color: var(--text-muted);
}
.empty-icon { font-size: 48px; opacity: 0.3; margin-bottom: 12px; }

.result-footer {
  margin-top: 16px;
  display: flex; justify-content: space-between;
}

.hl-red { background: rgba(245,63,63,0.2); color: var(--red); border-radius: 2px; padding: 0 2px; }
.hl-yellow { background: rgba(255,170,0,0.2); color: var(--yellow); border-radius: 2px; padding: 0 2px; }
.hl-blue { background: rgba(22,93,255,0.2); color: var(--blue); border-radius: 2px; padding: 0 2px; }

@media (max-width: 768px) {
  .result-header { flex-direction: column; align-items: flex-start; gap: 10px; }
}
</style>
