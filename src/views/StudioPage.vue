<template>
  <div class="studio-page">
    <!-- 顶部进度条 -->
    <div class="studio-header">
      <div class="studio-title">
        <span class="title-icon">🎬</span>
        <span>AI 短剧创作</span>
      </div>
      <div class="stage-bar">
        <div v-for="(s, i) in stages" :key="s.key"
          class="stage-node"
          :class="{ done: s.done, running: s.running, current: s.current }"
          @click="goToStep(i)">
          <div class="stage-icon">{{ s.icon }}</div>
          <div class="stage-label">{{ s.label }}</div>
          <div class="stage-line" v-if="i < stages.length - 1"></div>
        </div>
      </div>
    </div>

    <!-- Step 1: 剧本 -->
    <div v-if="currentStep === 0" class="step-panel">
      <div class="panel-title">第一步：写剧本</div>
      <div class="panel-desc">输入故事梗概，AI 帮你写成标准短剧剧本</div>
      <textarea v-model="scriptInput" class="script-input" placeholder="输入故事梗概，例如：一个社畜在深夜加班时发现自己养的绿植会说话..."></textarea>
      <div class="panel-actions">
        <button class="btn btn-ghost" @click="aiRefineScript" :disabled="aiRefining">✨ AI 润色</button>
        <button class="btn btn-primary" @click="saveScriptAndContinue" :disabled="!scriptInput.trim()">保存并继续 →</button>
      </div>
    </div>

    <!-- Step 2: 角色 -->
    <div v-if="currentStep === 1" class="step-panel">
      <div class="panel-title">第二步：角色设计</div>
      <div class="panel-desc">提取角色并设计肖像</div>
      <div class="char-grid">
        <div v-for="(ch, i) in characters" :key="i" class="char-card">
          <div class="char-portrait" v-if="ch.portrait_url">
            <img :src="ch.portrait_url" />
          </div>
          <div class="char-portrait empty" v-else @click="extractChars">
            <span>📷</span>
            <span>点击提取角色</span>
          </div>
          <div class="char-info">
            <input v-model="ch.name" placeholder="角色名" class="char-name" />
            <input v-model="ch.age" placeholder="年龄" class="char-age" />
            <input v-model="ch.wardrobe" placeholder="服装" class="char-wardrobe" />
            <input v-model="ch.features" placeholder="五官特征" class="char-features" />
            <input v-model="ch.hair_accessory" placeholder="发型+头饰" class="char-hair" />
          </div>
          <button class="btn btn-danger btn-sm" @click="removeChar(i)" v-if="characters.length > 1">✕</button>
        </div>
      </div>
      <button class="btn btn-ghost" @click="addChar">+ 添加角色</button>
      <div class="panel-actions">
        <button class="btn btn-primary" @click="saveCharsAndContinue" :disabled="!hasValidChars()">保存并继续 →</button>
      </div>
    </div>

    <!-- Step 3: 分镜 -->
    <div v-if="currentStep === 2" class="step-panel">
      <div class="panel-title">第三步：分镜规划</div>
      <div class="panel-desc">AI 自动拆分分镜，可手动调整</div>
      <div v-if="!shots.length" class="empty-state">
        <span>🎞</span>
        <p>点击下方按钮生成分镜</p>
        <button class="btn btn-primary" @click="generateStoryboard">🤖 AI 生成分镜</button>
      </div>
      <div v-else class="shot-list">
        <div v-for="(shot, i) in shots" :key="i" class="shot-item">
          <div class="shot-num">{{ i + 1 }}</div>
          <div class="shot-content">
            <div class="shot-type">{{ shot.shot_type || '中景' }}</div>
            <div class="shot-desc">{{ shot.description }}</div>
            <div class="shot-dialogue" v-if="shot.dialogue">💬 {{ shot.dialogue }}</div>
          </div>
          <div class="shot-actions">
            <span class="shot-duration">{{ shot.duration }}</span>
            <button class="btn btn-ghost btn-sm" @click="editShot(i)">编辑</button>
          </div>
        </div>
        <div class="shot-total">总计: {{ totalDuration }}s</div>
      </div>
      <div class="panel-actions">
        <button class="btn btn-primary" @click="saveShotsAndContinue" :disabled="!shots.length">保存并继续 →</button>
      </div>
    </div>

    <!-- Step 4: 视频生成 -->
    <div v-if="currentStep === 3" class="step-panel">
      <div class="panel-title">第四步：视频生成</div>
      <div class="panel-desc">AI 逐镜生成视频</div>
      <div class="panel-actions">
        <button class="btn btn-primary btn-lg" @click="generateAllVideos" :disabled="generatingVideo">
          {{ generatingVideo ? '⏳ 生成中...' : '🎥 一键生成所有视频' }}
        </button>
      </div>
      <div class="video-progress" v-if="shots.length">
        <div v-for="(shot, i) in shots" :key="i" class="video-item">
          <div class="video-thumb">
            <img v-if="shot.scene_image_url" :src="shot.scene_image_url" />
            <div v-else class="thumb-empty">🎬</div>
          </div>
          <div class="video-info">
            <div class="video-title">镜{{ i + 1 }}</div>
            <div class="video-status" :class="shot.videoStatus">
              {{ videoStatusText(shot.videoStatus) }}
            </div>
          </div>
          <div class="video-result" v-if="shot.video_url">
            <video :src="shot.video_url" controls></video>
          </div>
        </div>
      </div>
      <div class="panel-actions" v-if="allVideosReady">
        <button class="btn btn-primary" @click="saveVideosAndContinue">保存并继续 →</button>
      </div>
    </div>

    <!-- Step 5: 合成 -->
    <div v-if="currentStep === 4" class="step-panel">
      <div class="panel-title">第五步：合成发布</div>
      <div class="panel-desc">将所有视频片段合成为完整短剧</div>
      <div class="panel-actions">
        <button class="btn btn-primary btn-lg" @click="startComposite" :disabled="compositing">
          {{ compositing ? '⏳ 合成中...' : '🎞 合成视频' }}
        </button>
      </div>
      <div class="composite-result" v-if="finalVideoUrl">
        <video :src="finalVideoUrl" controls class="final-video"></video>
        <div class="final-actions">
          <button class="btn btn-ghost" @click="downloadVideo">📥 下载</button>
          <button class="btn btn-ghost" @click="shareVideo">📤 分享</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'StudioPage',
  data() {
    return {
      currentStep: 0,
      projectId: '',
      v2PipelineId: '',
      scriptInput: '',
      characters: [],
      shots: [],
      aiRefining: false,
      generatingVideo: false,
      compositing: false,
      finalVideoUrl: '',
      stages: [
        { key: 'script', label: '剧本', icon: '📝', done: false, running: false, current: true },
        { key: 'character', label: '角色', icon: '👤', done: false, running: false, current: false },
        { key: 'storyboard', label: '分镜', icon: '🎞', done: false, running: false, current: false },
        { key: 'video', label: '视频', icon: '🎥', done: false, running: false, current: false },
        { key: 'composite', label: '合成', icon: '🎬', done: false, running: false, current: false },
      ],
    }
  },
  computed: {
    totalDuration() {
      return this.shots.reduce((sum, s) => sum + (parseInt(s.duration) || 0), 0)
    },
    allVideosReady() {
      return this.shots.length > 0 && this.shots.every(s => s.videoStatus === 'completed')
    },
  },
  methods: {
    apiReq(method, path, body, timeout) {
      return fetch('/api/v1' + path, {
        method,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer ' + localStorage.getItem('token'),
        },
        body: body ? JSON.stringify(body) : undefined,
        signal: timeout ? AbortSignal.timeout(timeout) : undefined,
      }).then(r => r.json())
    },

    // Step 1: 剧本
    async saveScriptAndContinue() {
      const res = await this.apiReq('POST', '/projects/create', {
        script_text: this.scriptInput,
        title: this.scriptInput.slice(0, 20),
      })
      if (res.success) {
        this.projectId = res.project_id || res.id
        // 触发 V2 导演分析
        await this.apiReq('POST', '/pipeline/step/' + this.projectId, {
          stage: 'director',
          params: { script_text: this.scriptInput },
        })
        this.markStepDone(0)
        this.currentStep = 1
      } else {
        alert('保存失败: ' + (res.message || '请重试'))
      }
    },

    async aiRefineScript() {
      this.aiRefining = true
      try {
        const res = await this.apiReq('POST', '/script/generate', { prompt: this.scriptInput })
        if (res.success) this.scriptInput = res.script || res.data
      } catch (e) {
        alert('AI 润色失败')
      }
      this.aiRefining = false
    },

    // Step 2: 角色
    async extractChars() {
      try {
        const res = await this.apiReq('POST', '/characters/extract', {
          project_id: this.projectId,
          script_text: this.scriptInput,
        })
        if (res.success && res.characters) {
          this.characters = res.characters.map(c => ({
            name: c.name || '',
            age: c.age || '',
            wardrobe: c.wardrobe || '',
            features: c.features || c.appearance || '',
            hair_accessory: c.hair_accessory || '',
            portrait_url: c.portrait_url || '',
          }))
        }
      } catch (e) {
        alert('角色提取失败')
      }
    },

    addChar() {
      this.characters.push({ name: '', age: '', wardrobe: '', features: '', hair_accessory: '', portrait_url: '' })
    },
    removeChar(i) {
      this.characters.splice(i, 1)
    },
    hasValidChars() {
      return this.characters.some(c => c.name)
    },

    async saveCharsAndContinue() {
      // 触发 V2 角色设计
      await this.apiReq('POST', '/pipeline/step/' + this.projectId, {
        stage: 'character',
        params: { characters: this.characters, script_text: this.scriptInput },
      })
      this.markStepDone(1)
      this.currentStep = 2
    },

    // Step 3: 分镜
    async generateStoryboard() {
      try {
        const res = await this.apiReq('POST', '/pipeline/step/' + this.projectId, {
          stage: 'storyboard',
          params: {
            script_text: this.scriptInput,
            characters: this.characters,
          },
        })
        if (res.success) {
          // 轮询等待结果
          const shots = await this.pollStep('storyboard')
          if (shots && shots.length) {
            this.shots = shots.map(s => ({
              ...s,
              duration: (s.duration_sec || 8) + 's',
              videoStatus: 'pending',
              video_url: '',
            }))
          }
        }
      } catch (e) {
        alert('分镜生成失败')
      }
    },

    async pollStep(stage) {
      for (let i = 0; i < 60; i++) {
        await new Promise(r => setTimeout(r, 3000))
        try {
          // 先查 V2 状态
          if (this.v2PipelineId) {
            const v2res = await this.apiReq('GET', '/v2/pipeline/status/' + this.v2PipelineId)
            if (v2res.success && v2res.data) {
              const status = v2res.data.status
              if (status === 'completed') {
                // 完成后查 DB 拿数据
                const dbres = await this.apiReq('GET', '/v2/pipeline/assets/' + this.v2PipelineId)
                if (dbres.success && dbres.data) {
                  // 从 assets 里找 storyboard 数据
                  const sbAsset = dbres.data.find(a => a.type === 'storyboard' || a.asset_type === 'storyboard')
                  if (sbAsset && sbAsset.url) {
                    return JSON.parse(sbAsset.url)
                  }
                }
                return null
              }
              if (status === 'failed') return null
            }
          }
          // V2 没完成，fallback 到 V1 轮询
          const res = await this.apiReq('GET', '/pipeline/progress/' + this.projectId)
          if (res.success && res.data) {
            const stages = res.data.stages || []
            const found = stages.find(s => s.stage === stage || s.key === stage)
            if (found && found.status === 'completed' && found.data) {
              return found.data.shots || found.data
            }
            if (found && found.status === 'failed') return null
          }
        } catch (e) {}
      }
      return null
    },

    saveShotsAndContinue() {
      this.markStepDone(2)
      this.currentStep = 3
    },

    // Step 4: 视频
    async generateAllVideos() {
      this.generatingVideo = true
      try {
        const res = await this.apiReq('POST', '/pipeline/step/' + this.projectId, {
          stage: 'video',
          params: { shots: this.shots },
        })
        if (res.success) {
          if (res.v2_pipeline_id) {
            this.v2PipelineId = res.v2_pipeline_id
          }
          // 轮询 V2 状态直到完成
          await this.pollV2Status()
          // 完成后从 assets 拿视频 URL
          const dbres = await this.apiReq('GET', '/v2/pipeline/assets/' + this.v2PipelineId)
          if (dbres.success && dbres.data) {
            this.shots.forEach((s, i) => {
              const videoAsset = dbres.data.find(a => a.type === 'video' || a.asset_type === 'video')
              if (videoAsset && videoAsset.url) {
                s.video_url = videoAsset.url
                s.videoStatus = 'completed'
              }
            })
          }
        }
      } catch (e) {
        alert('视频生成失败')
      }
      this.generatingVideo = false
    },

    async pollV2Status() {
      for (let i = 0; i < 120; i++) {
        await new Promise(r => setTimeout(r, 5000))
        try {
          const res = await this.apiReq('GET', '/v2/pipeline/status/' + this.v2PipelineId)
          if (res.success && res.data) {
            const status = res.data.status
            if (status === 'completed') {
              this.markStepDone(3)
              break
            }
          }
        } catch (e) {}
      }
    },

    videoStatusText(status) {
      return { pending: '待生成', running: '生成中...', completed: '✅ 已完成', failed: '❌ 失败' }[status] || status
    },

    saveVideosAndContinue() {
      this.markStepDone(3)
      this.currentStep = 4
    },

    // Step 5: 合成
    async startComposite() {
      this.compositing = true
      try {
        const res = await this.apiReq('POST', '/pipeline/step/' + this.projectId, {
          stage: 'composite',
          params: {
            clips: this.shots.map(s => ({
              video: s.video_url,
              description: s.description,
              duration_sec: parseInt(s.duration) || 8,
            })),
          },
        })
        if (res.success) {
          await this.pollComposite(res.task_id)
        }
      } catch (e) {
        alert('合成失败')
      }
      this.compositing = false
    },

    async pollComposite(taskId) {
      for (let i = 0; i < 120; i++) {
        await new Promise(r => setTimeout(r, 2000))
        try {
          const res = await this.apiReq('GET', '/video/composite/progress/' + taskId)
          if (res.success && res.data) {
            if (res.data.finished) {
              this.finalVideoUrl = res.data.video_url
              this.markStepDone(4)
              return
            }
          }
        } catch (e) {}
      }
    },

    // 通用
    markStepDone(stepIdx) {
      this.stages[stepIdx].done = true
      this.stages[stepIdx].current = false
      if (stepIdx + 1 < this.stages.length) {
        this.stages[stepIdx + 1].current = true
      }
    },
    goToStep(idx) {
      if (idx <= this.currentStep) {
        this.currentStep = idx
      }
    },
    downloadVideo() {
      if (this.finalVideoUrl) window.open(this.finalVideoUrl)
    },
    shareVideo() {
      if (navigator.share) {
        navigator.share({ title: '我的短剧', url: this.finalVideoUrl })
      } else {
        navigator.clipboard.writeText(this.finalVideoUrl)
        alert('链接已复制')
      }
    },
  },
}
</script>

<style scoped>
.studio-page {
  max-width: 900px;
  margin: 0 auto;
  padding: 24px;
}

/* 顶部进度条 */
.studio-header {
  margin-bottom: 32px;
}

.studio-title {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 20px;
  font-weight: 700;
  margin-bottom: 24px;
}

.stage-bar {
  display: flex;
  align-items: flex-start;
  gap: 0;
}

.stage-node {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
  cursor: pointer;
  flex: 1;
  position: relative;
}

.stage-icon {
  width: 48px;
  height: 48px;
  border-radius: 50%;
  background: var(--bg-card);
  border: 2px solid var(--border);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 20px;
  transition: var(--transition);
}

.stage-node.done .stage-icon {
  background: var(--success);
  border-color: var(--success);
}

.stage-node.running .stage-icon {
  background: var(--accent);
  border-color: var(--accent);
  animation: pulse 1.5s infinite;
}

.stage-node.current .stage-icon {
  border-color: var(--accent);
  box-shadow: 0 0 12px var(--accent-glow);
}

.stage-label {
  font-size: 12px;
  color: var(--text-muted);
  font-weight: 500;
}

.stage-node.done .stage-label,
.stage-node.current .stage-label {
  color: var(--text-primary);
}

.stage-line {
  position: absolute;
  top: 24px;
  left: 50%;
  width: 100%;
  height: 2px;
  background: var(--border);
  z-index: -1;
}

.stage-node.done .stage-line {
  background: var(--success);
}

@keyframes pulse {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.6; }
}

/* 步骤面板 */
.step-panel {
  background: var(--bg-card);
  border: 1px solid var(--border);
  border-radius: var(--radius);
  padding: 24px;
}

.panel-title {
  font-size: 18px;
  font-weight: 700;
  margin-bottom: 4px;
}

.panel-desc {
  font-size: 13px;
  color: var(--text-muted);
  margin-bottom: 20px;
}

/* 剧本输入 */
.script-input {
  width: 100%;
  min-height: 200px;
  padding: 16px;
  background: var(--bg-input);
  border: 1px solid var(--border);
  border-radius: var(--radius-sm);
  color: var(--text-primary);
  font-size: 14px;
  line-height: 1.8;
  resize: vertical;
  outline: none;
  font-family: inherit;
}

.script-input:focus {
  border-color: var(--accent);
}

/* 角色网格 */
.char-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 16px;
  margin-bottom: 16px;
}

.char-card {
  background: var(--bg-input);
  border: 1px solid var(--border);
  border-radius: var(--radius);
  padding: 16px;
  position: relative;
}

.char-portrait {
  width: 100%;
  height: 160px;
  border-radius: var(--radius-sm);
  background: var(--bg-primary);
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 12px;
  cursor: pointer;
  overflow: hidden;
}

.char-portrait img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.char-portrait.empty span {
  font-size: 32px;
  color: var(--text-muted);
}

.char-portrait.empty span:last-child {
  font-size: 12px;
  display: block;
  margin-top: 4px;
}

.char-info {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.char-info input {
  padding: 6px 10px;
  background: var(--bg-primary);
  border: 1px solid var(--border);
  border-radius: 4px;
  color: var(--text-primary);
  font-size: 13px;
  outline: none;
}

.char-info input:focus {
  border-color: var(--accent);
}

.char-name { font-weight: 600; }

.char-card .btn-danger {
  position: absolute;
  top: 8px;
  right: 8px;
}

/* 分镜列表 */
.shot-list {
  display: flex;
  flex-direction: column;
  gap: 8px;
  margin-bottom: 16px;
}

.shot-item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px;
  background: var(--bg-input);
  border: 1px solid var(--border);
  border-radius: var(--radius-sm);
}

.shot-num {
  width: 32px;
  height: 32px;
  border-radius: 50%;
  background: var(--accent);
  color: #fff;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 14px;
  font-weight: 700;
  flex-shrink: 0;
}

.shot-content { flex: 1; min-width: 0; }
.shot-type { font-size: 11px; color: var(--accent); margin-bottom: 2px; }
.shot-desc { font-size: 13px; color: var(--text-primary); }
.shot-dialogue { font-size: 12px; color: var(--text-muted); margin-top: 2px; }
.shot-actions { flex-shrink: 0; }
.shot-duration { font-size: 12px; color: var(--text-muted); display: block; margin-bottom: 4px; }
.shot-total { font-size: 13px; color: var(--text-muted); text-align: right; margin-top: 8px; }

/* 视频进度 */
.video-progress {
  display: flex;
  flex-direction: column;
  gap: 12px;
  margin: 16px 0;
}

.video-item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px;
  background: var(--bg-input);
  border: 1px solid var(--border);
  border-radius: var(--radius-sm);
}

.video-thumb {
  width: 80px;
  height: 60px;
  border-radius: 4px;
  overflow: hidden;
  flex-shrink: 0;
}

.video-thumb img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.thumb-empty {
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 24px;
  background: var(--bg-primary);
}

.video-info { flex: 1; }
.video-title { font-size: 14px; font-weight: 600; margin-bottom: 4px; }
.video-status { font-size: 12px; }
.video-status.pending { color: var(--text-muted); }
.video-status.running { color: var(--accent); }
.video-status.completed { color: var(--success); }
.video-status.failed { color: var(--danger); }

.video-result video {
  width: 100%;
  max-width: 200px;
  border-radius: 4px;
}

/* 合成 */
.composite-result {
  text-align: center;
  margin-top: 24px;
}

.final-video {
  max-width: 640px;
  border-radius: var(--radius);
  margin-bottom: 16px;
}

.final-actions {
  display: flex;
  gap: 12px;
  justify-content: center;
}

/* 按钮 */
.panel-actions {
  display: flex;
  gap: 12px;
  margin-top: 20px;
  justify-content: flex-end;
}

.btn {
  padding: 10px 20px;
  border-radius: var(--radius-sm);
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  border: none;
  transition: var(--transition);
}

.btn-primary {
  background: var(--accent-gradient);
  color: #fff;
}

.btn-primary:hover:not(:disabled) {
  box-shadow: var(--glow-accent);
  transform: translateY(-1px);
}

.btn-primary:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.btn-ghost {
  background: var(--bg-input);
  color: var(--text-secondary);
  border: 1px solid var(--border);
}

.btn-ghost:hover:not(:disabled) {
  background: var(--bg-hover);
}

.btn-danger {
  background: var(--danger);
  color: #fff;
}

.btn-sm {
  padding: 4px 10px;
  font-size: 12px;
}

.btn-lg {
  padding: 12px 32px;
  font-size: 15px;
}

/* 空状态 */
.empty-state {
  text-align: center;
  padding: 60px 20px;
  color: var(--text-muted);
}

.empty-state span {
  font-size: 48px;
  display: block;
  margin-bottom: 12px;
}

.empty-state p {
  font-size: 14px;
  margin-bottom: 16px;
}

@media (max-width: 768px) {
  .studio-page { padding: 16px; }
  .stage-label { display: none; }
  .char-grid { grid-template-columns: 1fr; }
  .video-item { flex-direction: column; }
  .panel-actions { flex-direction: column; }
}
</style>
