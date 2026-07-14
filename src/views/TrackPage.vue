<template>
  <div class="track-page">
    <!-- 头部信息 -->
    <div class="tp-header">
      <div class="tp-header-left">
        <button class="tp-back" @click="$router.push('/')">← 返回</button>
        <div class="tp-info">
          <h1 class="tp-title">{{ title || '未命名' }}</h1>
          <div class="tp-meta">
            <span class="tp-badge" :class="projectStatus">{{ statusText(projectStatus) }}</span>
            <span class="tp-progress-num">{{ Math.round(progressPercent) }}%</span>
          </div>
        </div>
      </div>
      <div class="tp-header-right">
        <button class="btn-continue-ep" @click="showScriptUpload = true">📝 续写下一集</button>
        <button v-if="isFinished" class="tp-btn-download" @click="downloadVideo">📥 下载成品</button>
        <button v-if="id" class="tp-btn-download" @click="$router.push('/cert/' + id)">📜 原创证明</button>
      </div>
    </div>

    <!-- 整体进度条 -->
    <div class="tp-progress-bar-wrap">
      <div class="tp-progress-bar">
        <div class="tp-progress-fill" :style="{ width: progressPercent + '%' }"></div>
      </div>
      <div class="tp-progress-labels">
        <span>{{ completedCount }}/{{ totalStages }} 阶段完成</span>
        <span v-if="isFinished" class="tp-done-text">✅ 已完成</span>
      </div>
    </div>

    <!-- 加载态 -->
    <div v-if="loading && !stages.length" class="tp-empty">加载中...</div>
    <div v-else-if="loadError" class="tp-empty">
      <span>⚠️</span>
      <p>加载进度失败</p>
      <button class="tp-retry" @click="poll">重试</button>
    </div>

    <!-- 阶段列表 -->
    <div v-else class="tp-stage-list">
      <div v-for="(s, i) in stages" :key="i" class="tp-stage" :class="s.status">
        <div class="tp-stage-icon">{{ STAGE_ICONS[s.stage] || STAGE_ICONS[s.name] || '●' }}</div>
        <div class="tp-stage-body">
          <div class="tp-stage-header">
            <span class="tp-stage-name">{{ STAGE_LABELS[s.stage] || STAGE_LABELS[s.name] || s.stage || s.name }}</span>
            <span class="tp-stage-status" :class="s.status">{{ statusText(s.status) }}</span>
          </div>
          <div v-if="s.status==='running' && s.progress!=null" class="tp-stage-track">
            <div class="tp-stage-fill" :style="{ width: (s.progress||0) + '%' }"></div>
          </div>
          <div v-if="s.status==='failed' && s.error" class="tp-stage-error">{{ s.error }}</div>
          <div v-if="s.status==='completed' && s.data" class="tp-stage-preview">
            <span v-if="s.data.video_url" class="tp-preview-link" @click.stop="openUrl(s.data.video_url)">🎬 查看视频</span>
            <span v-if="s.data.image_url" class="tp-preview-link" @click.stop="openUrl(s.data.image_url)">🖼️ 查看图片</span>
            <span v-if="s.data.text" class="tp-preview-text">{{ s.data.text.substring(0, 100) }}...</span>
          </div>
        </div>
        <div class="tp-stage-check" v-if="s.status==='completed'">✓</div>
      </div>
    </div>

    <!-- 无阶段 -->
    <div v-if="!loading && !loadError && stages.length===0" class="tp-empty">
      <span>📋</span>
      <p>暂无进度数据，请先创建项目</p>
    </div>

    <!-- 集数列表 -->
    <div class="episode-bar" v-if="episodes.length > 0">
      <span class="ep-label">📚 剧集：</span>
      <button
        v-for="ep in episodes"
        :key="ep.episode"
        class="ep-chip"
        :class="{ active: ep.is_current }"
        @click="switchEpisode(ep.episode)"
      >
        第{{ ep.episode }}集
        <span v-if="ep.is_current" class="ep-badge">当前</span>
      </button>
    </div>

    <!-- 续写剧本模态框 -->
    <div class="modal-overlay" v-if="showScriptUpload" @click.self="showScriptUpload = false">
      <div class="modal-box">
        <h3>📝 续写第 {{ nextEpisode }} 集</h3>
        <p style="color:#999;font-size:13px;margin-bottom:12px">当前集将自动归档保存，新一集从头开拍</p>
        <textarea v-model="newScript" class="script-input" rows="10" placeholder="粘贴新一集完整剧本..."></textarea>
        <div class="btn-row" style="margin-top:12px">
          <button class="btn-primary" @click="submitNewEpisode" :disabled="!newScript.trim()">续写下一集</button>
          <button class="btn-ghost" @click="showScriptUpload = false">取消</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
const STAGE_NAMES = ['director','script','character','storyboard','cinematographer','wardrobe','scene','sfx','tts','subtitle','bgm','video','composite']
const STAGE_LABELS = {
  script:'剧本', director:'导演分析', character:'角色设计',
  storyboard:'分镜', scene:'场景', tts:'配音',
  subtitle:'字幕', bgm:'配乐', video:'视频', composite:'合成'
}
const STAGE_ICONS = {
  script:'📝', director:'🎬', character:'👤',
  storyboard:'📋', scene:'🌄', tts:'🎙️',
  subtitle:'💬', bgm:'🎵', video:'🎥', composite:'🎞️'
}
const STATUS_LABELS = {
  pending:'等待中', queued:'排队中', running:'运行中',
  completed:'已完成', succeeded:'已完成', failed:'失败',
  skipped:'跳过', paused:'已暂停', draft:'草稿'
}
const POLL_INTERVAL = 5000

export default {
  data() {
    return {
      id: this.$route.params.id,
      title: '',
      projectStatus: 'draft',
      stages: [],
      loading: true,
      loadError: false,
      timer: null,
      showScriptUpload: false,
      newScript: '',
      shots: [],
      episodes: [],
    }
  },
  computed: {
    nextEpisode() {
      const eps = this.shots?.filter(s => s.episode).map(s => s.episode) || []
      return eps.length ? Math.max(...eps) + 1 : 1
    },
    totalStages() { return this.stages.length || STAGE_NAMES.length },
    completedCount() {
      return this.stages.filter(s =>
        s.status === 'completed' || s.status === 'succeeded'
      ).length
    },
    progressPercent() {
      const total = this.stages.length
      if (!total) return 0
      return Math.round((this.completedCount / total) * 100)
    },
    isFinished() {
      return this.projectStatus === 'completed' ||
             this.progressPercent >= 100 ||
             (this.stages.length > 0 && this.stages.every(s => s.status === 'completed' || s.status === 'skipped'))
    },
    finalVideoUrl() {
      const composite = this.stages.find(s =>
        (s.stage === 'composite' || s.name === 'composite') &&
        (s.status === 'completed' || s.status === 'succeeded') &&
        s.data
      )
      return composite?.data?.video_url || composite?.data?.final_video_url || ''
    }
  },
  methods: {
    statusText(s) { return STATUS_LABELS[s] || s || '未知' },
    async poll() {
      this.loading = this.stages.length === 0
      this.loadError = false
      try {
        const token = localStorage.getItem('token')
        const r = await (await fetch('/api/v1/pipeline/progress/' + this.id, {
          headers: { 'Authorization': 'Bearer ' + token }
        })).json()
        if (r.success) {
          const data = r.data || {}
          this.projectStatus = r.project_status || data.status || 'draft'
          this.title = data.title || this.title
          if (data.stages) {
            this.stages = data.stages
          } else if (data.stage_progress) {
            const progs = data.stage_progress
            this.stages = STAGE_NAMES.map(s => ({
              stage: s, name: s,
              status: progs[s]?.status || 'pending',
              progress: progs[s]?.progress || 0,
              data: progs[s]?.data || {}
            }))
          }
          if (this.isFinished || this.projectStatus === 'completed' || this.projectStatus === 'failed') {
            if (this.timer) { clearInterval(this.timer); this.timer = null }
          }
        }
      } catch (e) {
        console.error('加载进度失败', e)
        this.loadError = true
      }
      this.loading = false
    },
    async submitNewEpisode() {
      if (!this.newScript.trim()) return alert('请输入剧本')
      const token = localStorage.getItem('token')
      try {
        const res = await fetch('/api/v1/pipeline/continue-episode', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', 'Authorization': 'Bearer ' + token },
          body: JSON.stringify({ project_id: this.id, script_text: this.newScript })
        })
        const d = await res.json()
        if (d.success) {
          this.showScriptUpload = false
          this.newScript = ''
          alert(d.message || '续写成功')
          await this.loadEpisodes()
          await this.poll()
        } else {
          alert('失败:' + (d.error || d.message || ''))
        }
      } catch (e) {
        alert('请求失败: ' + e.message)
      }
    },
    async loadEpisodes() {
      try {
        const res = await fetch('/api/v1/pipeline/episodes/' + this.id)
        const d = await res.json()
        if (d.success) {
          this.episodes = d.episodes || []
        }
      } catch (e) { /* silent */ }
    },
    async switchEpisode(episodeNum) {
      try {
        const res = await fetch('/api/v1/pipeline/episode/' + this.id + '/' + episodeNum)
        const d = await res.json()
        if (d.success && d.data) {
          const data = d.data
          this.title = data.title || this.title
          if (data.shots && data.shots.length) {
            this.stages = data.shots.map(s => ({
              stage: 'storyboard', name: 'storyboard',
              status: data.is_archived ? 'completed' : 'pending',
              data: s,
            }))
          }
        }
      } catch (e) { /* silent */ }
    },
    downloadVideo() {
      const url = this.finalVideoUrl
      if (!url) { alert('暂无下载链接'); return }
      const a = document.createElement('a')
      a.href = url
      a.download = (this.title || '短剧') + '.mp4'
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
    },
    openUrl(url) { window.open(url, '_blank') },
    async loadSceneImages() {
      try {
        const res = await fetch('/api/v1/character/scene-images/' + this.id)
        const data = await res.json()
        if (data.success && data.data?.assignments) {
          data.data.assignments.forEach((a, i) => {
            if (this.shots[i]) this.shots[i].sceneImages = a.scene_images
          })
        }
      } catch (e) { /* silent */ }
    },
  },
  mounted() {
    this.poll()
    this.timer = setInterval(() => this.poll(), POLL_INTERVAL)
    this.loadEpisodes()
  },
  beforeUnmount() {
    if (this.timer) clearInterval(this.timer)
  }
}
</script>

<style scoped>
.track-page {
  max-width: 900px;
  margin: 0 auto;
  padding: 24px 20px;
  color: var(--text-primary);
  font-family: 'Inter', 'Noto Sans SC', -apple-system, sans-serif;
}
.tp-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 24px;
  gap: 16px;
  flex-wrap: wrap;
}
.tp-header-left {
  display: flex;
  align-items: flex-start;
  gap: 16px;
  min-width: 0;
}
.tp-back {
  padding: 6px 14px;
  background: var(--bg-input);
  border: 1px solid var(--border);
  border-radius: var(--radius-sm, 8px);
  color: var(--text-secondary);
  font-size: 13px;
  cursor: pointer;
  flex-shrink: 0;
  transition: all 0.2s;
}
.tp-back:hover { background: var(--accent-glow); border-color: var(--highlight); color: var(--highlight); }
.tp-info { min-width: 0; }
.tp-title {
  font-size: 24px;
  font-weight: 800;
  color: var(--text-primary);
  margin: 0 0 8px 0;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
.tp-meta { display: flex; align-items: center; gap: 12px; }
.tp-badge {
  padding: 3px 12px;
  border-radius: 12px;
  font-size: 12px;
  font-weight: 600;
}
.tp-badge.completed { background: rgba(0,230,118,.1); color: var(--success, #00E676); }
.tp-badge.running,
.tp-badge.processing { background: var(--accent-glow); color: var(--highlight); }
.tp-badge.draft { background: rgba(255,193,7,.1); color: var(--warning, #FFC107); }
.tp-badge.failed { background: rgba(255,82,82,.1); color: var(--danger, #FF5252); }
.tp-progress-num {
  font-size: 20px;
  font-weight: 800;
  color: var(--highlight);
}
.tp-header-right { flex-shrink: 0; display: flex; gap: 8px; flex-wrap: wrap; }
.tp-btn-download {
  padding: 10px 24px;
  background: linear-gradient(135deg, #00C853, #00E676);
  color: #fff;
  border: none;
  border-radius: var(--radius-sm, 8px);
  font-size: 14px;
  font-weight: 700;
  cursor: pointer;
  transition: all 0.25s;
  white-space: nowrap;
}
.tp-btn-download:hover {
  box-shadow: 0 4px 20px rgba(0,200,83,.3);
  transform: translateY(-1px);
}
.btn-continue-ep {
  padding: 10px 20px;
  background: var(--bg-card);
  border: 1px solid var(--border);
  border-radius: var(--radius-sm, 8px);
  color: var(--text-secondary);
  font-size: 14px;
  cursor: pointer;
  transition: all 0.2s;
  white-space: nowrap;
}
.btn-continue-ep:hover { border-color: var(--highlight); color: var(--highlight); }

/* 进度条 */
.tp-progress-bar-wrap {
  background: var(--bg-card);
  border: 1px solid var(--border);
  border-radius: var(--radius);
  padding: 20px 24px;
  margin-bottom: 20px;
}
.tp-progress-bar {
  height: 8px;
  background: var(--border);
  border-radius: 4px;
  overflow: hidden;
  margin-bottom: 10px;
}
.tp-progress-fill {
  height: 100%;
  background: linear-gradient(90deg, var(--accent), var(--highlight));
  border-radius: 4px;
  transition: width 0.5s ease;
}
.tp-progress-labels {
  display: flex;
  justify-content: space-between;
  font-size: 13px;
  color: var(--text-muted);
}
.tp-done-text { color: var(--success); font-weight: 600; }

/* 空/错误 */
.tp-empty {
  text-align: center;
  padding: 60px 0;
  color: var(--text-muted);
}
.tp-empty span { font-size: 48px; display: block; margin-bottom: 12px; }
.tp-retry {
  margin-top: 12px;
  padding: 8px 20px;
  background: linear-gradient(135deg, var(--accent), var(--highlight));
  color: var(--text-primary);
  border: none;
  border-radius: var(--radius-sm);
  font-size: 13px;
  cursor: pointer;
}

/* 阶段列表 */
.tp-stage-list {
  display: flex;
  flex-direction: column;
  gap: 8px;
}
.tp-stage {
  display: flex;
  align-items: flex-start;
  gap: 14px;
  padding: 14px 18px;
  background: var(--bg-card);
  border: 1px solid var(--border);
  border-radius: var(--radius);
  transition: all 0.2s;
  border-left: 3px solid var(--border);
}
.tp-stage.completed { border-left-color: var(--success); background: rgba(0,230,118,.03); }
.tp-stage.running { border-left-color: var(--highlight); background: var(--accent-glow); }
.tp-stage.failed { border-left-color: var(--danger); background: rgba(255,82,82,.03); }
.tp-stage.succeeded { border-left-color: var(--success); }
.tp-stage.paused { border-left-color: var(--warning); }
.tp-stage-icon { font-size: 22px; width: 32px; text-align: center; flex-shrink: 0; padding-top: 2px; }
.tp-stage-body { flex: 1; min-width: 0; }
.tp-stage-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 4px;
}
.tp-stage-name { font-size: 15px; font-weight: 600; color: var(--text-primary); }
.tp-stage-status {
  font-size: 12px;
  padding: 2px 10px;
  border-radius: 10px;
  font-weight: 500;
}
.tp-stage-status.completed,
.tp-stage-status.succeeded { color: var(--success); background: rgba(0,230,118,.1); }
.tp-stage-status.running { color: var(--highlight); background: var(--accent-glow); }
.tp-stage-status.failed { color: var(--danger); background: rgba(255,82,82,.1); }
.tp-stage-status.pending { color: var(--text-muted); background: rgba(108,108,138,.1); }
.tp-stage-track {
  height: 4px;
  background: var(--border);
  border-radius: 2px;
  overflow: hidden;
  margin-top: 6px;
}
.tp-stage-fill {
  height: 100%;
  background: linear-gradient(90deg, var(--accent), var(--highlight));
  border-radius: 2px;
  transition: width 0.5s;
}
.tp-stage-error {
  font-size: 12px;
  color: var(--danger);
  margin-top: 6px;
  padding: 6px 10px;
  background: rgba(255,82,82,.08);
  border-radius: 6px;
  word-break: break-all;
}
.tp-stage-preview {
  margin-top: 6px;
  display: flex;
  gap: 12px;
  flex-wrap: wrap;
}
.tp-preview-link {
  font-size: 12px;
  color: var(--accent);
  cursor: pointer;
  padding: 2px 8px;
  background: var(--accent-glow);
  border-radius: 6px;
  transition: all 0.2s;
}
.tp-preview-link:hover { color: var(--highlight); }
.tp-preview-text {
  font-size: 12px;
  color: var(--text-muted);
  overflow: hidden;
  text-overflow: ellipsis;
  max-width: 300px;
}
.tp-stage-check {
  font-size: 18px;
  color: var(--success);
  font-weight: 700;
  padding-top: 2px;
  flex-shrink: 0;
}

/* 集数列表 */
.episode-bar {
  display: flex; align-items: center; gap: 8px;
  padding: 12px 0; flex-wrap: wrap;
}
.ep-label { font-size: 14px; color: var(--text-muted, #6C6C8A); flex-shrink: 0; }
.ep-chip {
  padding: 6px 14px; border-radius: 20px;
  background: var(--bg-card, #252536);
  border: 1px solid var(--border, #2D2D4E);
  color: var(--text-secondary, #9A9ABF);
  font-size: 13px; cursor: pointer; transition: all 0.2s;
}
.ep-chip:hover { border-color: var(--accent, #7C5CFC); color: var(--accent, #7C5CFC); }
.ep-chip.active { background: var(--accent, #7C5CFC); color: #fff; border-color: var(--accent); }
.ep-badge { font-size: 10px; padding: 1px 6px; background: rgba(255,255,255,0.2); border-radius: 8px; margin-left: 4px; }

/* 模态框 */
.modal-overlay {
  position: fixed; top: 0; left: 0; right: 0; bottom: 0;
  background: rgba(0,0,0,.6);
  display: flex; align-items: center; justify-content: center;
  z-index: 999;
}
.modal-box {
  background: var(--bg-card, #252536);
  border: 1px solid var(--border, #333355);
  border-radius: 12px;
  padding: 24px;
  width: 90%; max-width: 600px;
}
.script-input {
  width: 100%;
  background: var(--bg-input, #1A1A2E);
  border: 1px solid var(--border, #333355);
  border-radius: 8px;
  color: var(--text-primary, #EDEDF5);
  padding: 12px;
  font-size: 14px;
  resize: vertical;
}
.btn-row { display: flex; gap: 8px; }
.btn-primary {
  padding: 10px 24px;
  background: linear-gradient(135deg, var(--accent), var(--highlight));
  color: #fff; border: none; border-radius: 8px;
  font-weight: 600; cursor: pointer;
}
.btn-ghost {
  padding: 10px 24px;
  background: transparent;
  border: 1px solid var(--border, #333355);
  color: var(--text-secondary); border-radius: 8px;
  cursor: pointer;
}

@media (max-width: 600px) {
  .tp-title { font-size: 20px; }
  .tp-header { flex-direction: column; }
  .tp-btn-download { width: 100%; text-align: center; }
}

@media (max-width: 768px) {
  .track-page { padding: 0 12px 72px; }
  .tp-header { align-items: flex-start; gap: 8px; }
  .tp-header-left { width: 100%; }
  .tp-header-right { width: 100%; }
  .tp-btn-download { width: 100%; text-align: center; }
  .tp-title { font-size: 18px; }
  .tp-stage { flex-direction: column; gap: 6px; padding: 10px; }
  .tp-stage-preview { gap: 6px; }
  .tp-preview-link { font-size: 11px; padding: 2px 6px; }
  .tp-stage-error { font-size: 11px; }
}
</style>
