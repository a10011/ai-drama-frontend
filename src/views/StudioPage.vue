<template>
  <div class="studio-page">
    <!-- 顶部工具栏 -->
    <div class="toolbar">
      <div class="toolbar-left">
        <router-link to="/" class="logo">🎬 智剧AI</router-link>
        <div class="project-name">{{ projectTitle || '未命名项目' }}</div>
        <div class="project-id" v-if="projectId">#{{ projectId }}</div>
      </div>
      <div class="toolbar-right">
        <div class="credit-badge" v-if="token">
          <span class="credit-icon">⚡</span>
          <span class="credit-value">{{ creditBalance }}</span>
        </div>
        <div class="member-badge" :class="{ 'member-pro': userTier === 'pro' || userTier === 'enterprise' }">
          {{ memberLabel }}
        </div>
        <div class="avatar" :style="{ background: avatarGradient }" @click="showUserMenu = !showUserMenu">
          {{ userInitial }}
          <div class="user-dropdown" v-if="showUserMenu">
            <div @click="$router.push('/profile')">👤 个人中心</div>
            <div @click="$router.push('/membership')">💎 会员中心</div>
            <div class="divider"></div>
            <div class="danger" @click="logout">🚪 退出登录</div>
          </div>
        </div>
      </div>
    </div>

    <!-- 主体布局 -->
    <div class="studio-body">
      <!-- 左侧：步骤导航 -->
      <div class="steps-panel">
        <div class="steps-header">
          <span>📋 创作步骤</span>
          <span class="steps-total">{{ totalTime }}s</span>
        </div>
        <div class="steps-list">
          <div 
            v-for="(step, i) in steps" 
            :key="step.key"
            class="step-item"
            :class="{ 
              active: currentStep === i, 
              done: step.done, 
              running: step.running 
            }"
            @click="currentStep = i"
          >
            <div class="step-indicator">
              <span v-if="step.done" class="step-check">✅</span>
              <span v-else class="step-num">{{ i + 1 }}</span>
            </div>
            <div class="step-info">
              <span class="step-label">{{ step.icon }} {{ step.label }}</span>
              <div class="step-progress">
                <div class="step-bar" :style="{ width: (step.progress || 0) + '%' }"></div>
              </div>
            </div>
          </div>
        </div>
        
        <!-- 一键生成 -->
        <div class="auto-generate" v-if="currentStep === 0 && scriptInput">
          <button class="btn-auto" @click="autoGenerateAll" :disabled="autoGenerating">
            <span v-if="autoGenerating" class="spinner-sm"></span>
            <span v-else>🚀</span>
            {{ autoGenerating ? '生成中...' : '一键生成全部' }}
          </button>
        </div>
      </div>

      <!-- 中间：编辑区 -->
      <div class="editor-panel">
        <!-- Step 1: 剧本 -->
        <div v-if="currentStep === 0" class="editor-content">
          <div class="editor-header">
            <h2>📝 剧本编辑</h2>
            <div class="editor-actions">
              <button class="btn btn-ghost" @click="aiRefineScript" :disabled="aiRefining">
                ✨ AI 润色
              </button>
              <button class="btn btn-primary" @click="saveScriptAndContinue" :disabled="!scriptInput.trim()">
                保存并继续 →
              </button>
            </div>
          </div>
          <div class="editor-body">
            <textarea 
              v-model="scriptInput" 
              class="script-editor" 
              placeholder="输入故事梗概，例如：一个社畜在深夜加班时发现自己养的绿植会说话..."
            ></textarea>
            <div class="word-count">{{ scriptInput.length }} 字</div>
          </div>
        </div>

        <!-- Step 2: 角色 -->
        <div v-if="currentStep === 1" class="editor-content">
          <div class="editor-header">
            <h2>👤 角色设计</h2>
            <div class="editor-actions">
              <button class="btn btn-ghost" @click="extractChars" :disabled="extracting">
                🤖 提取角色
              </button>
              <button class="btn btn-primary" @click="saveCharsAndContinue" :disabled="!hasValidChars()">
                保存并继续 →
              </button>
            </div>
          </div>
          <div class="editor-body">
            <div class="char-grid">
              <div v-for="(ch, i) in characters" :key="i" class="char-card">
                <div class="char-portrait" v-if="ch.portrait_url">
                  <img :src="ch.portrait_url" />
                </div>
                <div class="char-portrait empty" v-else>
                  <span class="portrait-placeholder">{{ ch.name ? ch.name[0] : '?' }}</span>
                  <div class="portrait-actions">
                    <button class="btn btn-ghost btn-xs" @click="uploadRefImage(i)" :disabled="uploading === i">📷 上传</button>
                    <button class="btn btn-primary btn-xs" @click="generatePortrait(i)" :disabled="generatingPortrait === i">🎨 AI 生成</button>
                  </div>
                </div>
                <div class="char-info">
                  <input v-model="ch.name" placeholder="角色名" />
                  <input v-model="ch.age" placeholder="年龄" />
                  <input v-model="ch.features" placeholder="五官特征（锁脸）" />
                  <input v-model="ch.hair_accessory" placeholder="发型+头饰" />
                </div>
                <button class="btn btn-danger btn-sm" @click="removeChar(i)" v-if="characters.length > 1">✕</button>
              </div>
            </div>
            <button class="btn btn-ghost add-char-btn" @click="addChar">+ 添加角色</button>
          </div>
        </div>

        <!-- Step 3: 分镜 -->
        <div v-if="currentStep === 2" class="editor-content">
          <div class="editor-header">
            <h2>🎞 分镜规划</h2>
            <div class="editor-actions">
              <button class="btn btn-primary" @click="generateStoryboard" :disabled="generatingShots">
                {{ generatingShots ? '⏳ 生成中...' : '🤖 AI 生成分镜' }}
              </button>
              <button class="btn btn-primary" @click="generateSceneImages" :disabled="batchGeneratingScenes || !shots.length">
                🖼 生成场景图
              </button>
              <button class="btn btn-primary" @click="saveShotsAndContinue" :disabled="!shots.length">
                保存并继续 →
              </button>
            </div>
          </div>
          <div class="editor-body">
            <div v-if="!shots.length" class="empty-state">
              <span>🎞</span>
              <p>点击下方按钮生成分镜</p>
            </div>
            <div v-else class="shot-timeline">
              <div 
                v-for="(shot, i) in shots" 
                :key="i" 
                class="shot-block"
                :class="{ selected: selectedShot === i }"
                @click="selectedShot = i"
              >
                <div class="shot-thumb" v-if="shot.scene_image_url">
                  <img :src="shot.scene_image_url" />
                </div>
                <div class="shot-thumb empty" v-else>🎬</div>
                <div class="shot-info">
                  <div class="shot-num">{{ i + 1 }}</div>
                  <div class="shot-type">{{ shot.shot_type || '中景' }}</div>
                  <div class="shot-desc">{{ shot.description }}</div>
                  <div class="shot-dialogue" v-if="shot.dialogue">💬 {{ shot.dialogue }}</div>
                  <div class="shot-duration">{{ shot.duration }}</div>
                </div>
              </div>
            </div>
            <div class="shot-total-bar">总计: {{ totalDuration }}s</div>
          </div>
        </div>

        <!-- Step 4: 视频 -->
        <div v-if="currentStep === 3" class="editor-content">
          <div class="editor-header">
            <h2>🎥 视频生成</h2>
            <div class="editor-actions">
              <button class="btn btn-primary btn-lg" @click="generateAllVideos" :disabled="generatingVideo">
                {{ generatingVideo ? '⏳ 生成中...' : '🎥 一键生成所有视频' }}
              </button>
            </div>
          </div>
          <div class="editor-body">
            <div class="video-grid">
              <div v-for="(shot, i) in shots" :key="i" class="video-card">
                <div class="video-preview">
                  <img v-if="shot.scene_image_url" :src="shot.scene_image_url" />
                  <div v-else class="preview-empty">🎬</div>
                  <div class="video-overlay" v-if="shot.videoStatus === 'running'">
                    <div class="spinner"></div>
                    <span>生成中...</span>
                  </div>
                  <div class="video-overlay success" v-if="shot.videoStatus === 'completed'">
                    <span>✅</span>
                  </div>
                </div>
                <div class="video-info">
                  <div class="video-title">镜{{ i + 1 }}</div>
                  <div class="video-status" :class="shot.videoStatus">{{ videoStatusText(shot.videoStatus) }}</div>
                </div>
                <div class="video-result" v-if="shot.video_url">
                  <video :src="shot.video_url" controls></video>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Step 5: 合成 -->
        <div v-if="currentStep === 4" class="editor-content">
          <div class="editor-header">
            <h2>🎬 合成发布</h2>
            <div class="editor-actions">
              <button class="btn btn-primary btn-lg" @click="startComposite" :disabled="compositing">
                {{ compositing ? '⏳ 合成中...' : '🎞 合成视频' }}
              </button>
            </div>
          </div>
          <div class="editor-body">
            <div class="composite-preview">
              <div v-if="!finalVideoUrl" class="composite-empty">
                <span>🎬</span>
                <p>点击"合成视频"按钮生成最终成片</p>
              </div>
              <div v-else class="final-video-wrap">
                <video :src="finalVideoUrl" controls class="final-video" autoplay></video>
                <div class="final-actions">
                  <button class="btn btn-ghost" @click="downloadVideo">📥 下载</button>
                  <button class="btn btn-ghost" @click="shareVideo">📤 分享</button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- 右侧：属性面板 -->
      <div class="properties-panel">
        <div class="panel-title">属性</div>
        <div v-if="selectedShot !== null && shots[selectedShot]" class="property-editor">
          <h3>镜{{ selectedShot + 1 }}</h3>
          <div class="prop-group">
            <label>景别</label>
            <select v-model="shots[selectedShot].shot_type">
              <option>全景</option>
              <option>中景</option>
              <option>近景</option>
              <option>特写</option>
              <option>远景</option>
            </select>
          </div>
          <div class="prop-group">
            <label>画面描述</label>
            <textarea v-model="shots[selectedShot].description" rows="4"></textarea>
          </div>
          <div class="prop-group">
            <label>台词</label>
            <textarea v-model="shots[selectedShot].dialogue" rows="2"></textarea>
          </div>
          <div class="prop-group">
            <label>时长(秒)</label>
            <input type="number" v-model.number="shots[selectedShot].duration_sec" min="2" max="15" />
          </div>
          <div class="prop-group">
            <label>运镜</label>
            <select v-model="shots[selectedShot].camera">
              <option>固定</option>
              <option>缓推</option>
              <option>横移</option>
              <option>升降</option>
            </select>
          </div>
        </div>
        <div v-else class="panel-empty">
          <p>选择一个分镜查看属性</p>
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
      selectedShot: null,
      projectId: '',
      v2PipelineId: '',
      scriptInput: '',
      projectTitle: '',
      characters: [],
      shots: [],
      aiRefining: false,
      extracting: false,
      generatingShots: false,
      batchGeneratingScenes: false,
      generatingVideo: false,
      compositing: false,
      uploading: null,
      generatingPortrait: null,
      finalVideoUrl: '',
      autoGenerating: false,
      creditBalance: 0,
      userTier: '',
      username: '',
      token: '',
      showUserMenu: false,
    }
  },
  computed: {
    totalTime() {
      return this.shots.reduce((sum, s) => sum + (parseInt(s.duration) || parseInt(s.duration_sec) || 0), 0)
    },
    hasValidChars() {
      return this.characters.some(c => c.name)
    },
    memberLabel() {
      return { pro: '专业会员', enterprise: '企业版' }[this.userTier] || '免费版'
    },
    userInitial() {
      return (this.username || 'U').charAt(0).toUpperCase()
    },
    avatarGradient() {
      const gradients = [
        'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
        'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)',
        'linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)',
      ]
      const hash = (this.username || 'U').split('').reduce((a, b) => a + b.charCodeAt(0), 0)
      return gradients[hash % gradients.length]
    },
    steps() {
      return [
        { key: 'script', label: '剧本', icon: '📝', done: false, running: false, progress: 0 },
        { key: 'character', label: '角色', icon: '👤', done: false, running: false, progress: 0 },
        { key: 'storyboard', label: '分镜', icon: '🎞', done: false, running: false, progress: 0 },
        { key: 'video', label: '视频', icon: '🎥', done: false, running: false, progress: 0 },
        { key: 'composite', label: '合成', icon: '🎬', done: false, running: false, progress: 0 },
      ]
    },
  },
  methods: {
    apiReq(method, path, body, timeout) {
      return fetch('/api/v1' + path, {
        method,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer ' + this.token,
        },
        body: body ? JSON.stringify(body) : undefined,
        signal: timeout ? AbortSignal.timeout(timeout) : undefined,
      }).then(r => r.json())
    },

    async saveScriptAndContinue() {
      const res = await this.apiReq('POST', '/projects/create', {
        script_text: this.scriptInput,
        title: this.scriptInput.slice(0, 20),
      })
      if (res.success) {
        this.projectId = res.project_id || res.id
        this.projectTitle = res.title || this.scriptInput.slice(0, 20)
        const dirRes = await this.apiReq('POST', '/pipeline/step/' + this.projectId, {
          stage: 'director',
          params: { script_text: this.scriptInput },
        })
        if (dirRes && dirRes.v2_pipeline_id) this.v2PipelineId = dirRes.v2_pipeline_id
        await this.extractChars()
        this.steps[0].done = true
        this.steps[0].progress = 100
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

    async extractChars() {
      this.extracting = true
      try {
        const res = await this.apiReq('POST', '/pipeline/step/' + this.projectId, {
          stage: 'character',
          params: { script_text: this.scriptInput },
        })
        if (res && res.v2_pipeline_id) this.v2PipelineId = res.v2_pipeline_id
        const chars = await this.pollV2ForChars()
        if (chars && chars.length) {
          this.characters = chars.map(c => ({
            name: c.name || '',
            age: c.age || '',
            features: c.features || c.appearance || '',
            hair_accessory: c.hair_accessory || '',
            portrait_url: c.portrait_url || '',
          }))
          this.steps[1].progress = 100
        }
      } catch (e) {
        alert('角色提取失败')
      }
      this.extracting = false
    },

    async pollV2ForChars() {
      for (let i = 0; i < 30; i++) {
        await new Promise(r => setTimeout(r, 3000))
        try {
          if (!this.v2PipelineId) continue
          const res = await this.apiReq('GET', '/v2/pipeline/status/' + this.v2PipelineId)
          if (res.success && res.data) {
            if (res.data.status === 'completed') {
              const dbres = await this.apiReq('GET', '/v2/pipeline/assets/' + this.v2PipelineId)
              if (dbres.success && dbres.data) {
                const charAsset = dbres.data.find(a => a.type === 'character' || a.asset_type === 'character')
                if (charAsset && charAsset.url) return JSON.parse(charAsset.url)
              }
              return null
            }
            if (res.data.status === 'failed') return null
          }
        } catch (e) {}
      }
      return null
    },

    addChar() {
      this.characters.push({ name: '', age: '', features: '', hair_accessory: '', portrait_url: '' })
    },
    removeChar(i) {
      this.characters.splice(i, 1)
    },

    async generateStoryboard() {
      this.generatingShots = true
      this.steps[2].running = true
      this.steps[2].progress = 30
      try {
        const res = await this.apiReq('POST', '/pipeline/step/' + this.projectId, {
          stage: 'storyboard',
          params: { script_text: this.scriptInput, characters: this.characters },
        })
        if (res.success) {
          if (res.v2_pipeline_id) this.v2PipelineId = res.v2_pipeline_id
          const shots = await this.pollStep('storyboard')
          if (shots && shots.length) {
            this.shots = shots.map(s => ({
              ...s,
              duration: (s.duration_sec || 8) + 's',
              duration_sec: s.duration_sec || 8,
              videoStatus: 'pending',
              video_url: '',
            }))
            this.steps[2].progress = 100
          }
        }
      } catch (e) {
        alert('分镜生成失败')
      }
      this.generatingShots = false
      this.steps[2].running = false
    },

    async pollStep(stage) {
      for (let i = 0; i < 60; i++) {
        await new Promise(r => setTimeout(r, 3000))
        try {
          if (this.v2PipelineId) {
            const v2res = await this.apiReq('GET', '/v2/pipeline/status/' + this.v2PipelineId)
            if (v2res.success && v2res.data) {
              const status = v2res.data.status
              if (status === 'completed') {
                const dbres = await this.apiReq('GET', '/v2/pipeline/assets/' + this.v2PipelineId)
                if (dbres.success && dbres.data) {
                  const sbAsset = dbres.data.find(a => a.type === 'storyboard' || a.asset_type === 'storyboard')
                  if (sbAsset && sbAsset.url) return JSON.parse(sbAsset.url)
                }
                return null
              }
              if (status === 'failed') return null
            }
          }
        } catch (e) {}
      }
      return null
    },

    saveShotsAndContinue() {
      this.steps[2].done = true
      this.currentStep = 3
    },

    async generateAllVideos() {
      this.generatingVideo = true
      this.steps[3].running = true
      this.steps[3].progress = 20
      try {
        const res = await this.apiReq('POST', '/pipeline/step/' + this.projectId, {
          stage: 'video',
          params: { shots: this.shots },
        })
        if (res.success) {
          if (res.v2_pipeline_id) this.v2PipelineId = res.v2PipelineId
          await this.pollV2Status()
        }
      } catch (e) {
        alert('视频生成失败')
      }
      this.generatingVideo = false
      this.steps[3].running = false
    },

    async pollV2Status() {
      for (let i = 0; i < 120; i++) {
        await new Promise(r => setTimeout(r, 5000))
        try {
          const res = await this.apiReq('GET', '/v2/pipeline/status/' + this.v2PipelineId)
          if (res.success && res.data) {
            const status = res.data.status
            if (status === 'completed') {
              this.steps[3].done = true
              this.steps[3].progress = 100
              break
            }
            if (status.startsWith('running:')) {
              const stage = status.replace('running:', '')
              const order = ['script','director','character','storyboard','scene','video','composite']
              const idx = order.indexOf(stage)
              this.steps[3].progress = Math.min(80, Math.round((idx / order.length) * 100))
            }
          }
        } catch (e) {}
      }
    },

    videoStatusText(status) {
      return { pending: '待生成', running: '生成中...', completed: '✅ 已完成', failed: '❌ 失败' }[status] || status
    },

    async startComposite() {
      this.compositing = true
      this.steps[4].running = true
      this.steps[4].progress = 30
      try {
        const res = await this.apiReq('POST', '/pipeline/step/' + this.projectId, {
          stage: 'composite',
          params: {
            clips: this.shots.map(s => ({
              video: s.video_url,
              description: s.description,
              duration_sec: parseInt(s.duration) || parseInt(s.duration_sec) || 8,
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
      this.steps[4].running = false
    },

    async pollComposite(taskId) {
      for (let i = 0; i < 120; i++) {
        await new Promise(r => setTimeout(r, 2000))
        try {
          const res = await this.apiReq('GET', '/video/composite/progress/' + taskId)
          if (res.success && res.data) {
            if (res.data.finished) {
              this.finalVideoUrl = res.data.video_url
              this.steps[4].progress = 100
              this.steps[4].done = true
              return
            }
            this.steps[4].progress = res.data.progress || 50
          }
        } catch (e) {}
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

    logout() {
      localStorage.removeItem('token')
      localStorage.removeItem('username')
      this.token = ''
      this.username = ''
      this.$router.push('/login')
    },

    loadUserInfo() {
      this.token = localStorage.getItem('token') || ''
      this.username = localStorage.getItem('username') || ''
      if (this.token) {
        fetch('/api/v1/auth/me', {
          headers: { 'Authorization': 'Bearer ' + this.token },
        }).then(r => r.json()).then(res => {
          if (res.success) {
            this.username = res.data.username || ''
            this.userTier = res.data.tier || ''
          }
        }).catch(() => {})
        fetch('/api/v1/billing/balance', {
          headers: { 'Authorization': 'Bearer ' + this.token },
        }).then(r => r.json()).then(res => {
          if (res.success) this.creditBalance = res.data?.balance || 0
        }).catch(() => {})
      }
    },

    async loadProject(id) {
      try {
        const res = await this.apiReq('GET', '/projects/' + id)
        if (res.success && res.project) {
          const data = res.project
          this.scriptInput = data.script || data.script_text || ''
          this.projectTitle = data.title || this.projectTitle
          if (data.v2_pipeline_id) this.v2PipelineId = data.v2_pipeline_id
        }
      } catch(e) {}
    },

    async autoGenerateAll() {
      this.autoGenerating = true
      try {
        await this.saveScriptAndContinue()
        await this.saveCharsAndContinue()
        await this.generateStoryboard()
        this.saveShotsAndContinue()
        await this.generateAllVideos()
        await this.startComposite()
      } catch (e) {
        alert('一键生成失败: ' + e.message)
      }
      this.autoGenerating = false
    },

    async saveCharsAndContinue() {
      this.steps[1].running = true
      this.steps[1].progress = 50
      const res = await this.apiReq('POST', '/pipeline/step/' + this.projectId, {
        stage: 'character',
        params: { characters: this.characters, script_text: this.scriptInput },
      })
      if (res && res.v2_pipeline_id) this.v2PipelineId = res.v2_pipeline_id
      await this.pollV2ForChars()
      this.steps[1].done = true
      this.steps[1].running = false
      this.steps[1].progress = 100
      this.currentStep = 2
    },

    uploadRefImage(idx) {
      const input = document.createElement('input')
      input.type = 'file'
      input.accept = 'image/*'
      input.onchange = async (e) => {
        const file = e.target.files[0]
        if (!file) return
        this.uploading = idx
        try {
          const formData = new FormData()
          formData.append('file', file)
          formData.append('media_type', 'figures')
          const res = await fetch('/api/v1/media/library/upload', {
            method: 'POST',
            headers: { 'Authorization': 'Bearer ' + this.token },
            body: formData,
          }).then(r => r.json())
          if (res.success) {
            this.characters[idx].portrait_url = res.data?.url || res.data?.image_url || ''
          }
        } catch (err) {
          alert('上传失败')
        }
        this.uploading = null
      }
      input.click()
    },

    async generatePortrait(idx) {
      this.generatingPortrait = idx
      try {
        const ch = this.characters[idx]
        const res = await this.apiReq('POST', '/v2/pipeline/portrait', {
          project_id: this.projectId,
          character: ch,
        })
        if (res.success && res.data) {
          this.characters[idx].portrait_url = res.data.url || ''
        }
      } catch (e) {
        alert('肖像生成失败')
      }
      this.generatingPortrait = null
    },
  },
  mounted() {
    this.loadUserInfo()
    const route = this.$route
    if (route.query.project_id) {
      this.projectId = route.query.project_id
      this.projectTitle = route.query.title || '恢复项目'
    }
    if (route.query.v2_pipeline_id) {
      this.v2PipelineId = route.query.v2_pipeline_id
    }
    if (this.projectId) {
      this.loadProject(this.projectId)
    }
  },
}
</script>

<style scoped>
.studio-page {
  height: 100vh;
  display: flex;
  flex-direction: column;
  background: var(--bg-primary);
  color: var(--text-primary);
  font-family: 'Inter', 'Noto Sans SC', -apple-system, sans-serif;
  overflow: hidden;
}

/* ===== 顶部工具栏 ===== */
.toolbar {
  height: 52px;
  background: var(--bg-surface);
  border-bottom: 1px solid var(--border);
  display: flex;
  align-items: center;
  padding: 0 20px;
  gap: 16px;
  flex-shrink: 0;
}

.toolbar-left {
  display: flex;
  align-items: center;
  gap: 12px;
}

.logo {
  font-size: 16px;
  font-weight: 700;
  color: var(--text-primary);
  text-decoration: none;
}

.project-name {
  font-size: 13px;
  color: var(--text-secondary);
  font-weight: 500;
}

.project-id {
  font-size: 11px;
  color: var(--text-muted);
  background: var(--bg-hover);
  padding: 2px 8px;
  border-radius: 4px;
}

.toolbar-right {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-left: auto;
}

.credit-badge {
  display: flex;
  align-items: center;
  gap: 4px;
  padding: 4px 10px;
  background: var(--bg-hover);
  border-radius: 12px;
  font-size: 12px;
  color: var(--text-secondary);
}

.credit-icon { font-size: 14px; }
.credit-value { font-weight: 600; color: var(--gold); }

.member-badge {
  padding: 3px 10px;
  border-radius: 12px;
  font-size: 11px;
  font-weight: 600;
  background: var(--bg-hover);
  color: var(--text-muted);
  border: 1px solid var(--border);
}

.member-badge.member-pro {
  background: rgba(196,155,74,0.1);
  color: var(--gold);
  border-color: rgba(196,155,74,0.3);
}

.avatar {
  width: 32px;
  height: 32px;
  border-radius: 50%;
  color: #fff;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 13px;
  font-weight: 700;
  cursor: pointer;
  position: relative;
}

.user-dropdown {
  position: absolute;
  top: 40px;
  right: 0;
  width: 160px;
  background: var(--bg-surface);
  border: 1px solid var(--border);
  border-radius: 8px;
  overflow: hidden;
  box-shadow: var(--shadow-lg);
  z-index: 100;
}

.user-dropdown div {
  padding: 10px 14px;
  font-size: 13px;
  color: var(--text-secondary);
  cursor: pointer;
  transition: background 0.2s;
}

.user-dropdown div:hover {
  background: var(--bg-hover);
  color: var(--text-primary);
}

.user-dropdown .danger {
  color: var(--danger);
  border-top: 1px solid var(--border);
}

.user-dropdown .danger:hover {
  background: rgba(248, 113, 113, 0.1);
}

.user-dropdown .divider {
  height: 1px;
  background: var(--border);
  margin: 0;
}

/* ===== 主体布局 ===== */
.studio-body {
  flex: 1;
  display: flex;
  overflow: hidden;
}

/* 左侧步骤导航 */
.steps-panel {
  width: 240px;
  background: var(--bg-surface);
  border-right: 1px solid var(--border);
  display: flex;
  flex-direction: column;
  flex-shrink: 0;
}

.steps-header {
  padding: 14px 16px;
  font-size: 12px;
  font-weight: 600;
  color: var(--text-muted);
  border-bottom: 1px solid var(--border);
  display: flex;
  justify-content: space-between;
}

.steps-total {
  color: var(--gold);
  font-weight: 700;
}

.steps-list {
  flex: 1;
  padding: 12px 0;
  overflow-y: auto;
}

.step-item {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 10px 16px;
  cursor: pointer;
  transition: background 0.2s;
}

.step-item:hover {
  background: var(--bg-hover);
}

.step-item.active {
  background: rgba(99, 102, 241, 0.08);
}

.step-indicator {
  width: 24px;
  height: 24px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 11px;
  flex-shrink: 0;
  background: var(--bg-hover);
  border: 1px solid var(--border);
}

.step-item.active .step-indicator {
  background: var(--accent);
  border-color: var(--accent);
  color: #fff;
}

.step-item.done .step-indicator {
  background: var(--success);
  border-color: var(--success);
  color: #fff;
}

.step-info {
  flex: 1;
  min-width: 0;
}

.step-label {
  display: block;
  font-size: 12px;
  font-weight: 500;
  color: var(--text-secondary);
  margin-bottom: 4px;
}

.step-item.active .step-label {
  color: var(--accent-light);
  font-weight: 600;
}

.step-progress {
  height: 3px;
  background: var(--bg-hover);
  border-radius: 2px;
  overflow: hidden;
}

.step-bar {
  height: 100%;
  background: var(--accent);
  border-radius: 2px;
  transition: width 0.5s;
}

.step-item.done .step-bar {
  background: var(--success);
}

.auto-generate {
  padding: 12px 16px;
  border-top: 1px solid var(--border);
}

.btn-auto {
  width: 100%;
  padding: 10px;
  background: linear-gradient(135deg, #c49b4a, #d4b35a);
  color: #fff;
  border: none;
  border-radius: 8px;
  font-size: 13px;
  font-weight: 600;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
  transition: all 0.2s;
}

.btn-auto:hover:not(:disabled) {
  transform: translateY(-1px);
  box-shadow: 0 4px 16px rgba(196,155,74,0.3);
}

.btn-auto:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.spinner-sm {
  width: 14px;
  height: 14px;
  border: 2px solid rgba(255,255,255,0.3);
  border-top-color: #fff;
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
}

@keyframes spin { to { transform: rotate(360deg); } }

/* 中间编辑区 */
.editor-panel {
  flex: 1;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

.editor-content {
  flex: 1;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

.editor-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px 24px;
  border-bottom: 1px solid var(--border);
  flex-shrink: 0;
}

.editor-header h2 {
  font-size: 16px;
  font-weight: 600;
}

.editor-actions {
  display: flex;
  gap: 8px;
}

.editor-body {
  flex: 1;
  overflow-y: auto;
  padding: 20px 24px;
}

.script-editor {
  width: 100%;
  height: 100%;
  min-height: 400px;
  padding: 16px;
  background: var(--bg-surface);
  border: 1px solid var(--border);
  border-radius: 8px;
  color: var(--text-primary);
  font-size: 14px;
  line-height: 1.8;
  resize: none;
  outline: none;
  font-family: inherit;
}

.script-editor:focus {
  border-color: var(--accent);
}

.word-count {
  text-align: right;
  font-size: 12px;
  color: var(--text-muted);
  margin-top: 8px;
}

/* 角色网格 */
.char-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(240px, 1fr));
  gap: 16px;
}

.char-card {
  background: var(--bg-surface);
  border: 1px solid var(--border);
  border-radius: 10px;
  padding: 16px;
  position: relative;
}

.char-portrait {
  width: 100%;
  height: 120px;
  border-radius: 8px;
  background: var(--bg-primary);
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 12px;
  overflow: hidden;
}

.char-portrait img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.portrait-placeholder {
  font-size: 36px;
  color: var(--text-muted);
}

.portrait-actions {
  display: flex;
  flex-direction: column;
  gap: 6px;
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
  font-size: 12px;
  outline: none;
}

.char-info input:focus {
  border-color: var(--accent);
}

.add-char-btn {
  margin-top: 16px;
  width: 100%;
}

/* 分镜时间线 */
.shot-timeline {
  display: flex;
  gap: 8px;
  overflow-x: auto;
  padding-bottom: 8px;
}

.shot-block {
  min-width: 180px;
  max-width: 180px;
  background: var(--bg-surface);
  border: 2px solid var(--border);
  border-radius: 8px;
  overflow: hidden;
  cursor: pointer;
  transition: border-color 0.2s;
}

.shot-block.selected {
  border-color: var(--accent);
}

.shot-thumb {
  height: 100px;
  background: var(--bg-primary);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 32px;
  overflow: hidden;
}

.shot-thumb img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.shot-info {
  padding: 8px;
}

.shot-num {
  font-size: 10px;
  color: var(--accent);
  font-weight: 700;
  margin-bottom: 2px;
}

.shot-type {
  font-size: 11px;
  color: var(--text-muted);
  margin-bottom: 4px;
}

.shot-desc {
  font-size: 11px;
  color: var(--text-secondary);
  line-height: 1.4;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.shot-dialogue {
  font-size: 11px;
  color: var(--gold);
  margin-top: 4px;
}

.shot-duration {
  font-size: 10px;
  color: var(--text-muted);
  margin-top: 4px;
}

.shot-total-bar {
  text-align: right;
  font-size: 12px;
  color: var(--text-muted);
  margin-top: 12px;
  font-weight: 600;
}

/* 视频网格 */
.video-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
  gap: 16px;
}

.video-card {
  background: var(--bg-surface);
  border: 1px solid var(--border);
  border-radius: 10px;
  overflow: hidden;
}

.video-preview {
  height: 120px;
  background: var(--bg-primary);
  position: relative;
  overflow: hidden;
}

.video-preview img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.preview-empty {
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 36px;
}

.video-overlay {
  position: absolute;
  inset: 0;
  background: rgba(0,0,0,0.6);
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 8px;
  color: #fff;
  font-size: 12px;
}

.video-overlay.success {
  background: rgba(52, 211, 153, 0.2);
}

.video-info {
  padding: 10px;
}

.video-title {
  font-size: 13px;
  font-weight: 600;
  margin-bottom: 4px;
}

.video-status {
  font-size: 11px;
}

.video-status.pending { color: var(--text-muted); }
.video-status.running { color: var(--accent); }
.video-status.completed { color: var(--success); }
.video-status.failed { color: var(--danger); }

.video-result {
  padding: 8px;
}

.video-result video {
  width: 100%;
  border-radius: 4px;
}

/* 合成预览 */
.composite-preview {
  text-align: center;
}

.composite-empty {
  padding: 80px 20px;
  color: var(--text-muted);
}

.composite-empty span {
  font-size: 48px;
  display: block;
  margin-bottom: 12px;
}

.final-video-wrap {
  max-width: 640px;
  margin: 0 auto;
}

.final-video {
  width: 100%;
  border-radius: 12px;
  margin-bottom: 16px;
}

.final-actions {
  display: flex;
  gap: 12px;
  justify-content: center;
}

/* 右侧属性面板 */
.properties-panel {
  width: 260px;
  background: var(--bg-surface);
  border-left: 1px solid var(--border);
  display: flex;
  flex-direction: column;
  flex-shrink: 0;
}

.panel-title {
  padding: 12px 14px;
  font-size: 12px;
  font-weight: 600;
  color: var(--text-muted);
  border-bottom: 1px solid var(--border);
}

.property-editor {
  flex: 1;
  padding: 14px;
  overflow-y: auto;
}

.property-editor h3 {
  font-size: 13px;
  font-weight: 600;
  margin-bottom: 12px;
}

.prop-group {
  margin-bottom: 12px;
}

.prop-group label {
  display: block;
  font-size: 11px;
  color: var(--text-muted);
  margin-bottom: 4px;
}

.prop-group select,
.prop-group input,
.prop-group textarea {
  width: 100%;
  padding: 6px 10px;
  background: var(--bg-primary);
  border: 1px solid var(--border);
  border-radius: 4px;
  color: var(--text-primary);
  font-size: 12px;
  outline: none;
  font-family: inherit;
}

.prop-group select:focus,
.prop-group input:focus,
.prop-group textarea:focus {
  border-color: var(--accent);
}

.panel-empty {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--text-muted);
  font-size: 12px;
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

/* 按钮 */
.btn {
  padding: 8px 16px;
  border-radius: 6px;
  font-size: 13px;
  font-weight: 600;
  cursor: pointer;
  border: none;
  transition: all 0.2s;
}

.btn-primary {
  background: var(--accent);
  color: #fff;
}

.btn-primary:hover:not(:disabled) {
  background: var(--accent-light);
}

.btn-primary:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.btn-ghost {
  background: var(--bg-hover);
  color: var(--text-secondary);
  border: 1px solid var(--border);
}

.btn-ghost:hover:not(:disabled) {
  background: var(--bg-active);
}

.btn-danger {
  background: var(--danger);
  color: #fff;
}

.btn-sm {
  padding: 4px 10px;
  font-size: 11px;
}

.btn-xs {
  padding: 4px 8px;
  font-size: 11px;
}

.btn-lg {
  padding: 10px 24px;
  font-size: 14px;
}

/* 滚动条 */
::-webkit-scrollbar { width: 6px; height: 6px; }
::-webkit-scrollbar-track { background: transparent; }
::-webkit-scrollbar-thumb { background: var(--border); border-radius: 3px; }
::-webkit-scrollbar-thumb:hover { background: var(--text-muted); }

/* 响应式 */
@media (max-width: 1024px) {
  .properties-panel { display: none; }
  .steps-panel { width: 200px; }
}

@media (max-width: 768px) {
  .steps-panel { display: none; }
  .toolbar { padding: 0 12px; }
  .editor-header { flex-direction: column; gap: 12px; }
  .editor-actions { flex-wrap: wrap; }
  .char-grid { grid-template-columns: 1fr; }
  .video-grid { grid-template-columns: 1fr; }
}
</style>
