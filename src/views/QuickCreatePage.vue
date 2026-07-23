<template>
  <div class="quick-create-page">
    <!-- 步骤 1: 选择类型 -->
    <div v-if="step === 'select'" class="step-select fade-in">
      <div class="page-header">
        <h1>🪄 极简一键模式</h1>
        <p class="subtitle">选择类型，输入主题，坐等出片</p>
      </div>
      <div class="card-grid">
        <div v-for="t in contentTypes" :key="t.key" class="type-card" :class="{ active: selectedType === t.key }" @click="selectedType = t.key">
          <span class="card-icon">{{ t.icon }}</span>
          <h3>{{ t.label }}</h3>
          <p class="card-desc">{{ t.desc }}</p>
          <span class="card-badge" v-if="t.badge">{{ t.badge }}</span>
        </div>
      </div>
      <div v-if="selectedType" class="input-area">
        <label style="display:block;margin-bottom:6px;font-size:14px;color:#ccc">剧名</label>
        <input v-model="title" class="prompt-input" style="height:40px" placeholder="给你的短剧起个名字" maxlength="50" />
        <div class="input-meta"><span class="char-count">{{ title.length }}/50</span></div>
      </div>
      <transition name="slide">
        <div v-if="selectedType" class="input-area">
          <textarea v-model="prompt" class="prompt-input" :placeholder="promptPlaceholder" rows="3" maxlength="500"></textarea>
          <div class="input-meta">
            <span class="char-count">{{ prompt.length }}/500</span>
            <button class="btn-submit" :disabled="!title.trim() || !prompt.trim() || submitting" @click="submitTask">
              <template v-if="submitting">⏳ 提交中...</template>
              <template v-else>🚀 一键生成</template>
            </button>
          </div>
          <div class="recent-templates" v-if="recentTemplates.length">
            <span class="label">试试：</span>
            <button v-for="tpl in recentTemplates" :key="tpl" class="chip" @click="prompt = tpl">{{ tpl }}</button>
          </div>
        </div>
      </transition>
    </div>

    <!-- 步骤 2: 排队+进度 -->
    <div v-if="step === 'progress'" class="step-progress fade-in">
      <div class="progress-card">
        <div class="queue-info" v-if="queuePos > 0">
          <span class="queue-icon">⏳</span>
          <span class="queue-text">排队中，前方还有 <strong>{{ queuePos }}</strong> 个任务</span>
        </div>
        <div class="processing-info" v-if="queuePos === 0 && !done">
          <div class="status-ring">
            <svg viewBox="0 0 120 120"><circle class="ring-bg" cx="60" cy="60" r="52"/><circle class="ring-fill" :style="{ strokeDashoffset: ringOffset }" cx="60" cy="60" r="52"/></svg>
            <div class="ring-center"><span class="ring-pct">{{ overallProgress }}%</span></div>
          </div>
          <p class="status-text">{{ statusText }}</p>
          <div class="stage-list">
            <div v-for="item in stageList" :key="item.key" class="stage-row" :class="item.status">
              <span class="si">{{ item.icon }}</span><span class="sl">{{ item.label }}</span>
              <span class="ss" v-if="item.status==='done'">✅</span>
              <span class="ss spinner-sm" v-else-if="item.status==='running'">⏳</span>
            </div>
          </div>
        </div>
        <div class="result-area" v-if="done">
          <p class="result-title">🎉 生成完成！</p>
          <video v-if="videoUrl" :src="videoUrl" controls class="result-video"></video>
          <div class="result-actions">
            <button class="btn-download" @click="downloadVideo">📥 下载视频</button>
            <button class="btn-share" @click="shareVideo">📤 分享</button>
            <button class="btn-new" @click="reset">🪄 再来一个</button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import request from '@/utils/request'

export default {
  data() {
    return {
      step: 'select',
      selectedType: '',
      title: '',
      prompt: '',
      submitting: false,
      taskId: null,
      queuePos: 0,
      done: false,
      overallProgress: 0,
      statusText: '',
      videoUrl: '',
      recentTemplates: [],
    }
  },
  computed: {
    promptPlaceholder() {
      const ph = {
        'short_drama': '输入故事创意，例如：一个社畜在深夜加班时发现自己养的绿植会说话...',
        'ad': '输入广告产品描述，例如：一款面向年轻人的智能手表...',
        'promo': '输入宣传片主题，例如：某科技公司新品发布会宣传片...',
      }
      return ph[this.selectedType] || '输入你的创意...'
    },
    ringOffset() {
      const circumference = 2 * Math.PI * 52
      return circumference - (this.overallProgress / 100) * circumference
    },
    stageList() {
      return [
        { key: 'script', label: '剧本', icon: '📝', status: this.overallProgress < 20 ? 'running' : 'done' },
        { key: 'character', label: '角色', icon: '👤', status: this.overallProgress < 40 ? 'running' : 'done' },
        { key: 'storyboard', label: '分镜', icon: '🎞', status: this.overallProgress < 60 ? 'running' : 'done' },
        { key: 'video', label: '视频', icon: '🎥', status: this.overallProgress < 80 ? 'running' : 'done' },
        { key: 'composite', label: '合成', icon: '🎬', status: this.overallProgress >= 80 ? 'running' : 'done' },
      ]
    },
  },
  mounted() {
    // 加载最近模板
    const saved = localStorage.getItem('recent_templates')
    if (saved) this.recentTemplates = JSON.parse(saved)
    // URL 参数
    const tpl = this.$route.query.template
    if (tpl) this.prompt = decodeURIComponent(tpl)
    const prm = this.$route.query.prompt
    if (prm) this.prompt = decodeURIComponent(prm)
  },
  methods: {
    async submitTask() {
      this.submitting = true
      this.step = 'progress'
      this.done = false
      this.overallProgress = 0
      this.statusText = '正在提交任务...'
      
      try {
        const token = localStorage.getItem('token') || localStorage.getItem('guest_token')
        const resp = await request.post('/api/v1/quick-create', {
          type: this.selectedType,
          title: this.title,
          prompt: this.prompt,
        }, {
          headers: { Authorization: `Bearer ${token}` },
        })
        
        if (resp.data?.success) {
          this.taskId = resp.data.task_id
          this.pollProgress()
        } else {
          this.statusText = '提交失败: ' + (resp.data?.error || '未知错误')
        }
      } catch (e) {
        this.statusText = '网络错误，请重试'
      }
      
      this.submitting = false
    },
    
    async pollProgress() {
      const poll = async () => {
        try {
          const token = localStorage.getItem('token') || localStorage.getItem('guest_token')
          const resp = await request.get(`/api/v1/quick-create/${this.taskId}/progress`, {
            headers: { Authorization: `Bearer ${token}` },
          })
          
          const data = resp.data
          if (data.queue_pos !== undefined) this.queuePos = data.queue_pos
          if (data.progress !== undefined) this.overallProgress = data.progress
          if (data.status_text) this.statusText = data.status_text
          if (data.video_url) this.videoUrl = data.video_url
          
          if (data.done) {
            this.done = true
            // 保存模板
            this.saveTemplate()
          } else {
            setTimeout(poll, 3000)
          }
        } catch (e) {
          setTimeout(poll, 5000)
        }
      }
      poll()
    },
    
    saveTemplate() {
      if (!this.prompt) return
      const idx = this.recentTemplates.indexOf(this.prompt)
      if (idx >= 0) this.recentTemplates.splice(idx, 1)
      this.recentTemplates.unshift(this.prompt)
      this.recentTemplates = this.recentTemplates.slice(0, 5)
      localStorage.setItem('recent_templates', JSON.stringify(this.recentTemplates))
    },
    
    downloadVideo() {
      if (this.videoUrl) window.open(this.videoUrl)
    },
    
    shareVideo() {
      if (navigator.share && this.videoUrl) {
        navigator.share({ title: '我的短剧', url: this.videoUrl })
      } else if (this.videoUrl) {
        navigator.clipboard.writeText(this.videoUrl)
        alert('链接已复制')
      }
    },
    
    reset() {
      this.step = 'select'
      this.selectedType = ''
      this.title = ''
      this.prompt = ''
      this.taskId = null
      this.queuePos = 0
      this.done = false
      this.overallProgress = 0
      this.statusText = ''
      this.videoUrl = ''
    },
  },
}
</script>

<style scoped>
.quick-create-page {
  min-height: 100vh;
  background: var(--bg-primary, #0a0a0f);
  color: var(--text-primary, #f0f0f5);
  font-family: 'Inter', 'Noto Sans SC', -apple-system, sans-serif;
  padding: 40px 20px;
}

.page-header { text-align: center; margin-bottom: 40px; }
.page-header h1 { font-size: 32px; font-weight: 800; margin-bottom: 8px; }
.subtitle { font-size: 16px; color: var(--text-secondary, #a0a0b8); }

.card-grid {
  display: grid; grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
  gap: 16px; max-width: 800px; margin: 0 auto 32px;
}
.type-card {
  padding: 24px 16px; background: var(--bg-card, #1a1a2e);
  border: 2px solid var(--border, rgba(255,255,255,0.06));
  border-radius: 16px; text-align: center; cursor: pointer;
  transition: all 0.3s; position: relative;
}
.type-card:hover { border-color: var(--accent, #6366f1); transform: translateY(-2px); }
.type-card.active { border-color: var(--accent, #6366f1); background: rgba(99,102,241,0.1); }
.card-icon { font-size: 40px; display: block; margin-bottom: 12px; }
.type-card h3 { font-size: 16px; font-weight: 700; margin-bottom: 6px; }
.card-desc { font-size: 12px; color: var(--text-muted, #6b6b80); margin-bottom: 8px; }
.card-badge {
  position: absolute; top: 12px; right: 12px; padding: 2px 8px;
  background: var(--accent, #6366f1); color: #fff; border-radius: 10px;
  font-size: 10px; font-weight: 600;
}

.input-area { max-width: 600px; margin: 0 auto 24px; }
.prompt-input {
  width: 100%; padding: 12px 16px; background: var(--bg-input, #16162a);
  border: 1px solid var(--border, rgba(255,255,255,0.06));
  border-radius: 12px; color: var(--text-primary, #f0f0f5);
  font-size: 14px; outline: none; resize: vertical; font-family: inherit;
}
.prompt-input:focus { border-color: var(--accent, #6366f1); }
.input-meta { display: flex; justify-content: space-between; align-items: center; margin-top: 8px; }
.char-count { font-size: 12px; color: var(--text-muted, #6b6b80); }
.btn-submit {
  padding: 10px 24px; background: linear-gradient(135deg, #c49b4a, #d4b35a);
  color: #fff; border: none; border-radius: 8px; font-size: 14px; font-weight: 700;
  cursor: pointer; transition: all 0.2s;
}
.btn-submit:hover:not(:disabled) { transform: translateY(-1px); box-shadow: 0 4px 16px rgba(196,155,74,0.3); }
.btn-submit:disabled { opacity: 0.5; cursor: not-allowed; }

.recent-templates { margin-top: 16px; }
.recent-templates .label { font-size: 12px; color: var(--text-muted, #6b6b80); margin-right: 8px; }
.chip {
  padding: 4px 12px; background: var(--bg-hover, rgba(255,255,255,0.04));
  border: 1px solid var(--border, rgba(255,255,255,0.06));
  border-radius: 16px; color: var(--text-secondary, #a0a0b8);
  font-size: 12px; cursor: pointer; margin-right: 6px; margin-bottom: 6px;
  transition: all 0.2s;
}
.chip:hover { background: var(--bg-active, rgba(255,255,255,0.08)); color: var(--text-primary, #f0f0f5); }

/* Progress */
.progress-card {
  max-width: 500px; margin: 0 auto; padding: 40px 24px;
  background: var(--bg-card, #1a1a2e); border: 1px solid var(--border, rgba(255,255,255,0.06));
  border-radius: 20px; text-align: center;
}
.queue-info { margin-bottom: 24px; }
.queue-icon { font-size: 24px; }
.queue-text { font-size: 14px; color: var(--text-secondary, #a0a0b8); margin-top: 8px; }
.queue-text strong { color: var(--accent, #6366f1); }

.status-ring { position: relative; width: 120px; height: 120px; margin: 0 auto 20px; }
.ring-bg { fill: none; stroke: var(--bg-hover, rgba(255,255,255,0.04)); stroke-width: 6; }
.ring-fill { fill: none; stroke: var(--accent, #6366f1); stroke-width: 6; stroke-linecap: round; transform: rotate(-90deg); transform-origin: center; transition: stroke-dashoffset 0.5s; }
.ring-center { position: absolute; inset: 0; display: flex; align-items: center; justify-content: center; font-size: 20px; font-weight: 700; }
.status-text { font-size: 14px; color: var(--text-secondary, #a0a0b8); margin-bottom: 20px; }

.stage-list { display: flex; flex-direction: column; gap: 8px; text-align: left; }
.stage-row { display: flex; align-items: center; gap: 8px; font-size: 13px; padding: 6px 12px; border-radius: 8px; }
.stage-row.running { background: rgba(99,102,241,0.1); color: var(--accent, #6366f1); }
.stage-row.done { color: var(--success, #34d399); }
.si { font-size: 16px; }
.ss { margin-left: auto; font-size: 14px; }
.spinner-sm { width: 14px; height: 14px; border: 2px solid rgba(99,102,241,0.3); border-top-color: var(--accent, #6366f1); border-radius: 50%; animation: spin 0.8s linear infinite; display: inline-block; }
@keyframes spin { to { transform: rotate(360deg); } }

.result-area { margin-top: 24px; }
.result-title { font-size: 20px; font-weight: 700; margin-bottom: 16px; color: var(--success, #34d399); }
.result-video { width: 100%; max-width: 480px; border-radius: 12px; margin-bottom: 16px; }
.result-actions { display: flex; gap: 12px; justify-content: center; flex-wrap: wrap; }
.btn-download, .btn-share, .btn-new {
  padding: 10px 20px; border-radius: 8px; font-size: 14px; font-weight: 600;
  cursor: pointer; border: none; transition: all 0.2s;
}
.btn-download { background: var(--accent, #6366f1); color: #fff; }
.btn-share { background: var(--bg-hover, rgba(255,255,255,0.04)); color: var(--text-secondary, #a0a0b8); border: 1px solid var(--border, rgba(255,255,255,0.06)); }
.btn-new { background: linear-gradient(135deg, #c49b4a, #d4b35a); color: #fff; }
.btn-download:hover, .btn-new:hover { transform: translateY(-1px); }

.fade-in { animation: fadeIn 0.3s ease; }
@keyframes fadeIn { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
.slide-enter-active { transition: all 0.3s ease; }
.slide-leave-active { transition: all 0.2s ease; }
.slide-enter-from { opacity: 0; transform: translateY(20px); }
.slide-leave-to { opacity: 0; transform: translateY(-10px); }

@media (max-width: 768px) {
  .card-grid { grid-template-columns: 1fr; }
  .result-actions { flex-direction: column; }
}
</style>
