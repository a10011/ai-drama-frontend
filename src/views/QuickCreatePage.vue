<template>
  <div class="one-click-page">
    <!-- ========== 步骤1: 选择内容类型 ========== -->
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
      <div v-if="selectedType" class="input-area" style="margin-bottom:12px">
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

    <!-- ========== 步骤2: 排队+进度 ========== -->
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
              <span class="si">{{ item.icon }}</span><span class="sl">{{ item.label }}</span><span class="ss">{{ statusMap[item.status] }}</span>
            </div>
          </div>
        </div>
        <div class="done-info" v-if="done">
          <div class="done-icon">✅</div>
          <p class="done-text">生成完成！</p>
          <video v-if="videoUrl" :src="videoUrl" controls playsinline class="result-video"></video>
          <div class="done-actions">
            <button class="btn" @click="goHome">🏠 返回</button>
            <button class="btn btn-primary" @click="downloadVideo">📥 下载</button>
            <button class="btn" @click="reset">🔄 重新创作</button>
          </div>
        </div>
        <div class="fail-info" v-if="failed">
          <div class="fail-icon">❌</div>
          <p class="fail-text">{{ errMsg }}</p>
          <button class="btn" @click="reset">🔄 重新开始</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
const API = '/api/v1'
async function api(method, path, body) {
  const t = localStorage.getItem('token')
  const o = { method, headers: { 'Content-Type': 'application/json' } }
  if (t) o.headers['Authorization'] = 'Bearer ' + t
  if (body) o.body = JSON.stringify(body)
  const r = await fetch(path, o)
  return r.json()
}

export default {
  name: 'QuickCreatePage',
  data() {
    return {
      step: 'select',
      selectedType: null,
      prompt: '', title: '',
      submitting: false,
      queuePos: 0,
      overallProgress: 0,
      projectId: '',
      pollTimer: null,
      done: false,
      failed: false,
      errMsg: '',
      videoUrl: '',
      stageList: [],
      statusText: '正在处理...',
      statusMap: { pending: '⏳', running: '🔄 进行中', completed: '✅ 完成', failed: '❌ 失败' },
      contentTypes: [
        { key: 'ad', icon: '📺', label: '广告片', desc: '产品展示/品牌短片，15-60秒', badge: '极速' },
        { key: 'drama', icon: '🎬', label: '剧情短片', desc: 'AI短剧/故事短片，2-5分钟', badge: '深度' },
        { key: 'promo', icon: '📢', label: '宣传片', desc: '企业/活动宣传视频，1-3分钟', badge: '高效' },
      ],
      recentTemplates: [],
    }
  },
  computed: {
    promptPlaceholder() {
      const m = { ad: '输入广告主题，如：智能水杯，主打便携与科技感', drama: '输入故事梗概，如：将军与白衣女子的诀别', promo: '输入宣传目标，如：新店开业活动推广' }
      return m[this.selectedType] || '输入你的创意...'
    },
    ringOffset() {
      const c = 2 * Math.PI * 52
      return c - (Math.max(0, Math.min(100, this.overallProgress)) / 100) * c
    },
  },
  mounted() {
    const q = this.$route.query
    if (q.type && ['ad','drama','promo'].includes(q.type)) this.selectedType = q.type
    if (q.prompt) this.prompt = q.prompt
    if (q.auto) this.submitTask()
    this.loadTemplates()
  },
  beforeUnmount() { this.stopPoll() },
  methods: {
    async loadTemplates() {
      try {
        const res = await api('GET', API + '/templates?type=' + (this.selectedType || 'drama'))
        if (res.success && res.data) this.recentTemplates = res.data.slice(0, 5)
      } catch(e) { this.recentTemplates = ['古风诀别', '都市甜宠', '悬疑反转'] }
    },
    async submitTask() {
      if (!this.prompt.trim() || this.submitting) return
      this.submitting = true
      try {
        const res = await api('POST', API + '/queue/submit', {
          type: this.selectedType,
          prompt: this.prompt.trim(),
        })
        if (res.success) {
          this.projectId = res.data.project_id || res.data.id || ''
          this.queuePos = res.data.queue_position || 0
          this.step = 'progress'
          if (this.queuePos === 0) this.startPoll()
          else this.pollQueue()
        } else {
          alert(res.error || '提交失败')
        }
      } catch(e) {
        alert('提交失败: 网络错误')
      }
      this.submitting = false
    },
    pollQueue() {
      this.stopPoll()
      this.pollTimer = setInterval(async () => {
        try {
          const res = await api('GET', API + '/queue/status/' + this.projectId)
          if (res.success) {
            this.queuePos = res.data.queue_position || 0
            this.projectId = res.data.project_id || this.projectId
            if (this.queuePos === 0) {
              this.stopPoll()
              this.startPoll()
            }
          }
        } catch(e) {}
      }, 3000)
    },
    startPoll() {
      this.stopPoll()
      this.pollTimer = setInterval(() => this.pollProgress(), 3000)
      this.pollProgress()
    },
    stopPoll() { if (this.pollTimer) { clearInterval(this.pollTimer); this.pollTimer = null } },
    async pollProgress() {
      if (!this.projectId) return
      try {
        const res = await api('GET', API + '/queue/progress/' + this.projectId)
        if (!res.success) return
        const data = res.data || {}
        const stages = data.stages || []
        if (stages.length) {
          this.stageList = stages.map(s => ({ key: s.stage, label: s.label || s.stage, icon: s.icon || '●', status: s.status || 'pending' }))
          let ok = 0, fail = false
          for (const s of stages) {
            if (s.status === 'completed') ok++
            if (s.status === 'failed') fail = true
          }
          this.overallProgress = data.finished ? 100 : Math.round((ok / Math.max(stages.length, 1)) * 100)
          if (data.finished) { this.done = true; this.stopPoll(); if (data.video_url) this.videoUrl = data.video_url; return }
          if (fail) { this.failed = true; this.errMsg = '有阶段失败'; this.stopPoll(); return }
        }
      } catch(e) {}
    },
    downloadVideo() {
      if (this.videoUrl) { const a = document.createElement('a'); a.href = this.videoUrl; a.download = 'output.mp4'; a.click() }
    },
    goHome() { this.$router.push('/') },
    reset() { this.step = 'select'; this.selectedType = null; this.prompt = ''; this.submitting = false; this.queuePos = 0; this.overallProgress = 0; this.done = false; this.failed = false; this.videoUrl = ''; this.stageList = []; this.stopPoll() },
  }
}
</script>

<style scoped>
.one-click-page { max-width: 680px; margin: 0 auto; padding: 24px 16px; min-height: 100vh; background: var(--bg, #0f0f1a); color: #e0e0e0 }
.fade-in { animation: fadeIn .35s ease }
@keyframes fadeIn { from { opacity: 0; transform: translateY(12px) } to { opacity: 1; transform: translateY(0) } }
.slide-enter-active, .slide-leave-active { transition: all .3s ease }
.slide-enter-from, .slide-leave-to { opacity: 0; transform: translateY(10px) }
.page-header { text-align: center; margin-bottom: 32px }
.page-header h1 { font-size: 26px; margin: 0 0 6px }
.subtitle { color: #999; font-size: 14px; margin: 0 }
.card-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 12px; margin-bottom: 24px }
.type-card { background: #1a1a2e; border: 2px solid #2a2a4e; border-radius: 14px; padding: 20px 14px; text-align: center; cursor: pointer; transition: all .25s }
.type-card:hover { border-color: #4a4a8e; transform: translateY(-2px) }
.type-card.active { border-color: #6c5ce7; background: #1e1a3e; box-shadow: 0 0 20px rgba(108,92,231,.25) }
.card-icon { font-size: 36px; display: block; margin-bottom: 8px }
.type-card h3 { font-size: 16px; margin: 0 0 4px; color: #fff }
.card-desc { font-size: 12px; color: #888; margin: 0; line-height: 1.4 }
.card-badge { display: inline-block; margin-top: 8px; padding: 2px 10px; border-radius: 10px; font-size: 11px; background: #6c5ce7; color: #fff }
.input-area { background: #1a1a2e; border-radius: 14px; padding: 16px }
.prompt-input { width: 100%; background: #12122a; border: 1px solid #333; border-radius: 10px; padding: 12px; color: #e0e0e0; font-size: 14px; resize: none; outline: none; box-sizing: border-box }
.prompt-input:focus { border-color: #6c5ce7 }
.input-meta { display: flex; justify-content: space-between; align-items: center; margin-top: 10px }
.char-count { font-size: 12px; color: #666 }
.btn-submit { padding: 10px 28px; border: none; border-radius: 10px; background: #6c5ce7; color: #fff; font-size: 15px; cursor: pointer; transition: all .2s }
.btn-submit:hover:not(:disabled) { background: #7c6df7; transform: translateY(-1px) }
.btn-submit:disabled { opacity: .4; cursor: default }
.recent-templates { margin-top: 12px; display: flex; align-items: center; gap: 8px; flex-wrap: wrap }
.recent-templates .label { font-size: 12px; color: #666 }
.chip { padding: 4px 12px; border-radius: 12px; border: 1px solid #333; background: transparent; color: #aaa; font-size: 12px; cursor: pointer }
.chip:hover { border-color: #6c5ce7; color: #fff }
.progress-card { background: #1a1a2e; border-radius: 14px; padding: 24px; text-align: center }
.queue-info { padding: 20px }
.queue-icon { font-size: 40px; display: block; margin-bottom: 8px }
.queue-text { font-size: 15px; color: #ccc }
.status-ring { position: relative; width: 120px; height: 120px; margin: 0 auto 16px }
.ring-bg { fill: none; stroke: #2a2a4e; stroke-width: 8 }
.ring-fill { fill: none; stroke: #6c5ce7; stroke-width: 8; stroke-dasharray: 326.7; stroke-linecap: round; transform: rotate(-90deg); transform-origin: center; transition: stroke-dashoffset .5s }
.ring-center { position: absolute; top: 0; left: 0; width: 100%; height: 100%; display: flex; align-items: center; justify-content: center }
.ring-pct { font-size: 22px; font-weight: 700; color: #fff }
.status-text { font-size: 14px; color: #999; margin-bottom: 16px }
.stage-list { text-align: left; max-height: 240px; overflow-y: auto }
.stage-row { display: flex; align-items: center; gap: 8px; padding: 6px 0; font-size: 13px }
.stage-row.completed { color: #4ade80 }
.stage-row.running { color: #60a5fa }
.stage-row.failed { color: #f87171 }
.stage-row.pending { color: #666 }
.si { font-size: 14px; width: 20px }
.sl { flex: 1 }
.ss { font-size: 12px }
.done-icon, .fail-icon { font-size: 48px; margin-bottom: 8px }
.done-text { font-size: 18px; color: #4ade80; margin: 0 0 12px }
.fail-text { font-size: 14px; color: #f87171; margin: 0 0 12px }
.result-video { width: 100%; max-height: 400px; border-radius: 10px; margin-bottom: 12px }
.done-actions { display: flex; gap: 10px; justify-content: center; flex-wrap: wrap }
.btn { padding: 10px 20px; border: 1px solid #333; border-radius: 10px; background: transparent; color: #ccc; font-size: 14px; cursor: pointer }
.btn-primary { background: #6c5ce7; border-color: #6c5ce7; color: #fff }

@media (max-width: 768px) {
  .one-click-page { padding: 16px 12px 72px; }
  .page-header h1 { font-size: 22px; }
  .card-grid { grid-template-columns: 1fr; gap: 10px; }
  .type-card { padding: 16px; display: flex; align-items: center; gap: 12px; text-align: left; }
  .card-icon { font-size: 28px; margin-bottom: 0; flex-shrink: 0; }
  .type-card h3 { font-size: 15px; margin-bottom: 2px; }
  .card-desc { font-size: 11px; }
  .card-badge { margin-top: 0; }
  .prompt-input { font-size: 14px; padding: 10px; }
  .btn-submit { width: 100%; padding: 12px; }
  .input-meta { flex-direction: column; gap: 8px; }
  .progress-card { padding: 16px; }
  .result-video { max-height: 250px; }
  .done-actions { flex-direction: column; }
  .done-actions .btn { width: 100%; }
  .stage-list { max-height: 180px; }
}

/* ===== Mobile Responsive ===== */
@media (max-width: 768px) {
  .main-content { padding-bottom: 72px !important; }
}

</style>
