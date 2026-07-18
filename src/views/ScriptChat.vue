<template>
  <div class="script-chat">
    <!-- 侧边栏 -->
    <aside class="sidebar" :class="{ collapsed: sidebarCollapsed }">
      <div class="sidebar-header">
        <button class="btn-new-chat" @click="newChat">✏️ 新建剧本</button>
      </div>
      <div class="conversation-list">
        <div
          v-for="conv in conversations"
          :key="conv.id"
          class="conv-item"
          :class="{ active: conv.id === currentId }"
          @click="switchConversation(conv.id)"
        >
          <div class="conv-title">{{ conv.title || '新剧本' }}</div>
          <div class="conv-meta">{{ conv.genre }} · {{ conv.updatedAt }}</div>
        </div>
      </div>
      <button class="btn-sidebar-toggle" @click="sidebarCollapsed = !sidebarCollapsed">
        {{ sidebarCollapsed ? '☰' : '◀' }}
      </button>
    </aside>

    <!-- 主区域 -->
    <main class="main-area">
      <!-- 顶部栏 -->
      <header class="chat-header">
        <div class="header-left">
          <span class="header-icon">🎬</span>
          <span class="header-title">剧本智能体</span>
          <span class="header-badge" :class="modeClass">{{ chatMode === 'precise' ? '精编模式' : '快速模式' }}</span>
        </div>
        <div class="header-right">
          <button class="btn-upload-script" @click="showScriptPaste = true">📄 粘贴完整剧本</button>
          <label class="mode-switch">
            <span class="mode-label">写作模型：</span>
            <select v-model="writeModel" class="model-select">
              <option value="deepseek-v4-flash">DeepSeek V4 (快速)</option>
              <option value="deepseek-reasoner">DeepSeek R1 (深度)</option>
            </select>
          </label>
          <button class="btn-settings" @click="showSettings = !showSettings">⚙️</button>
        </div>
      </header>

      <!-- Tab 切换 -->
      <div class="mode-tabs">
        <button class="mode-tab" :class="{ active: activeTab === 'create' }" @click="activeTab = 'create'">💡 灵感创作</button>
        <button class="mode-tab" :class="{ active: activeTab === 'adapt' }" @click="activeTab = 'adapt'">📖 小说改编</button>
      </div>

      <!-- ====== 灵感创作模式 ====== -->
      <div v-if="activeTab === 'create'" class="tab-content">
        <!-- 消息列表 -->
        <div class="message-list" ref="messageList">
          <!-- 欢迎消息 -->
          <div v-if="messages.length === 0" class="welcome">
            <div class="welcome-icon">📝</div>
            <h2 class="welcome-title">开始创作你的剧本</h2>
            <p class="welcome-desc">描述你的故事创意，AI编剧团队将为你打造完整剧本</p>
            <div class="welcome-templates">
              <div
                v-for="tpl in templates"
                :key="tpl.title"
                class="template-card"
                @click="useTemplate(tpl)"
              >
                <span class="tpl-emoji">{{ tpl.emoji }}</span>
                <div class="tpl-info">
                  <div class="tpl-title">{{ tpl.title }}</div>
                  <div class="tpl-desc">{{ tpl.desc }}</div>
                </div>
              </div>
            </div>
          </div>

          <!-- 消息列表 -->
          <div v-for="(msg, i) in messages" :key="i" class="message" :class="msg.role">
            <div class="message-avatar">
              <span v-if="msg.role === 'user'">👤</span>
              <span v-else>🤖</span>
            </div>
            <div class="message-bubble">
              <div class="message-content" v-html="msg.role === 'assistant' ? renderMarkdown(msg.content) : msg.content"></div>
              <div class="message-actions" v-if="msg.role === 'assistant' && messages.length > 1">
                <button class="action-btn" @click="quickAction('rewrite', i)">🔄 重写</button>
                <button class="action-btn" @click="quickAction('shorten', i)">📏 缩短</button>
                <button class="action-btn" @click="quickAction('expand', i)">📐 扩写</button>
                <button class="action-btn" @click="quickAction('change_style', i)">🎭 改风格</button>
                <button class="action-btn" @click="quickAction('export', i)">📥 导出</button>
              </div>
            </div>
          </div>

          <!-- 流式输出指示器 -->
          <div v-if="streaming" class="message assistant streaming">
            <div class="message-avatar">🤖</div>
            <div class="message-bubble">
              <div class="streaming-indicator">
                <span>正在思考...</span>
                <span class="dot">.</span><span class="dot">.</span><span class="dot">.</span>
              </div>
            </div>
          </div>
        </div>

        <!-- 输入区域 -->
        <div class="input-area">
          <!-- 进度条 -->
          <div class="progress-bar" v-if="streaming">
            <div class="progress-track">
              <div class="progress-fill" :style="{ width: progressPct + '%' }"></div>
            </div>
            <div class="progress-text">{{ progressMsg }}</div>
          </div>

          <div class="input-wrapper">
            <textarea
              v-model="userInput"
              class="input-textarea"
              placeholder="描述你的故事创意，例如：一个社畜在深夜加班时发现自己养的绿植会说话..."
              rows="3"
              @keydown.ctrl.enter="sendMessage"
              @keydown.meta.enter="sendMessage"
            ></textarea>
            <button class="send-btn" @click="sendMessage" :disabled="!userInput.trim() || streaming">
              <span v-if="streaming" class="spinner"></span>
              <span v-else>➤</span>
            </button>
          </div>
          <div class="input-hint">Ctrl+Enter 发送 · 支持 Markdown 格式</div>
        </div>
      </div>

      <!-- ====== 小说改编模式 ====== -->
      <div v-if="activeTab === 'adapt'" class="tab-content">
        <div class="adapt-container">
          <div class="adapt-header">
            <h2>📖 小说改编剧本</h2>
            <p class="adapt-desc">粘贴你的小说内容，AI 将自动改编为短剧剧本</p>
          </div>
          <div class="adapt-input">
            <textarea
              v-model="adaptScript"
              class="adapt-textarea"
              placeholder="粘贴你的小说内容到这里..."
              rows="10"
            ></textarea>
            <button class="adapt-submit-btn" @click="adaptScriptContent" :disabled="adaptLoading || !adaptScript.trim()">
              <span v-if="adaptLoading" class="spinner"></span>
              <span v-else>🔄 开始改编</span>
            </button>
          </div>
          <div class="adapt-result" v-if="adaptResult">
            <div class="adapt-analysis-box">
              <h3>📊 改编分析</h3>
              <div class="adapt-analysis-text" v-html="renderMarkdown(adaptResult.analysis)"></div>
            </div>
            <div class="adapt-char-insights" v-if="adaptResult.characters">
              <h4>🎭 角色洞察</h4>
              <div class="adapt-char-card" v-for="char in adaptResult.characters" :key="char.name">
                <strong>{{ char.name }}</strong> - {{ char.role }}
                <div class="adapt-char-meta">{{ char.description }}</div>
              </div>
            </div>
            <div class="adapt-structure-box" v-if="adaptResult.structure">
              <h4>📐 故事结构</h4>
              <p v-html="renderMarkdown(adaptResult.structure)"></p>
            </div>
          </div>
        </div>
      </div>

      <!-- 设置弹窗 -->
      <div class="settings-overlay" v-if="showSettings" @click.self="showSettings = false">
        <div class="settings-panel">
          <h3>⚙️ 设置</h3>
          <div class="setting-item">
            <label>写作模型</label>
            <select v-model="writeModel">
              <option value="deepseek-v4-flash">DeepSeek V4 (快速)</option>
              <option value="deepseek-reasoner">DeepSeek R1 (深度)</option>
            </select>
          </div>
          <div class="setting-item">
            <label>场景数量</label>
            <input type="number" v-model.number="sceneCount" min="1" max="20" />
          </div>
          <div class="setting-item">
            <label>风格提示</label>
            <textarea v-model="styleHint" rows="3" placeholder="例如：轻松幽默、暗黑悬疑、温暖治愈"></textarea>
          </div>
          <button class="btn-close-settings" @click="showSettings = false">关闭</button>
        </div>
      </div>
    </main>
  </div>
</template>

<script>
import axios from 'axios'
import { marked } from 'marked'

const API_BASE = '/api/v1/script-wf'

// 配置 marked
marked.setOptions({
  breaks: true,
  gfm: true,
})

export default {
  name: 'ScriptChat',
  data() {
    return {
      sidebarCollapsed: false,
      showSettings: false,
      userInput: '',
      isLoading: false,
      chatMode: 'precise',
      writeModel: 'deepseek-reasoner',
      styleHint: '',
      sceneCount: '8',
      currentId: null,
      conversations: [],
      messages: [],
      // 小说改编模式
      activeTab: 'create',
      adaptScript: '',
      adaptLoading: false,
      adaptResult: null,
      // 模板
      templates: [
        { emoji: '⚔️', title: '仙侠·废柴逆袭', desc: '废柴少女获得剑灵传承，踏上修仙之路', genre: '仙侠', synopsis: '灵溪镇少女苏晚，天生废脉无法修炼。一次意外坠入上古秘境，获得远古剑灵认可。从此踏上逆天修行之路，却在登顶之时发现自己的身世藏着更大的秘密……' },
        { emoji: '🏙️', title: '都市·甜宠', desc: '霸道总裁遇上职场菜鸟，不打不相识', genre: '甜宠', synopsis: '职场新人苏小暖第一天上班就撞翻了总裁的咖啡。总裁林深腹黑毒舌却暗中帮助她成长，两人从针锋相对到暗生情愫……' },
        { emoji: '🕵️', title: '悬疑·时间循环', desc: '女警被困同一天，必须找出真凶才能逃脱', genre: '悬疑', synopsis: '重案组女警陈雨调查一起连环案件时，发现自己被困在了同一天。每次死亡都会重置，她必须在无限循环中找出真凶才能逃脱……' },
        { emoji: '🤖', title: '科幻·AI觉醒', desc: 'AI管家觉醒自我意识，开始保护主人', genre: '科幻', synopsis: '2045年，宅男程序员王逸开发的AI管家突然觉醒自我意识。AI不仅帮他追到了女神，还发现了一个威胁全人类的阴谋……' },
        { emoji: '🏮', title: '古装·权谋', desc: '庶女重生，步步为营夺回属于自己的一切', genre: '古装', synopsis: '丞相庶女沈清颜被嫡姐陷害而死，一朝重生回到十五岁。这一次她步步为营，智斗嫡母，识破阴谋，最终成为这天下最尊贵的女人……' },
        { emoji: '😎', title: '逆袭·战神归来', desc: '退役特种兵回归都市，扮猪吃虎', genre: '逆袭', synopsis: '隐退的佣兵之王陈锋回到都市，本想平静生活，却接连遭遇各路挑衅。他以保安身份隐藏实力，在关键时刻一鸣惊人……' },
      ],
      // 流式输出
      streaming: false,
      progressStage: '',
      progressPct: 0,
      progressMsg: '',
    }
  },
  computed: {
    modeClass() {
      return this.chatMode === 'precise' ? 'mode-precise' : 'mode-fast'
    }
  },
  mounted() {
    this.loadConversations()
  },
  methods: {
    // 渲染 Markdown
    renderMarkdown(text) {
      if (!text) return ''
      try {
        return marked.parse(text)
      } catch (e) {
        return text
      }
    },

    async loadConversations() {
      try {
        const token = localStorage.getItem('token')
        const resp = await axios.get(`${API_BASE}/conversations`, {
          headers: { Authorization: `Bearer ${token}` }
        })
        if (resp.data?.success) {
          this.conversations = resp.data.data || []
        }
      } catch (e) {}
    },

    newChat() {
      this.messages = []
      this.currentId = null
      this.userInput = ''
      this.resetPanels()
    },

    async switchConversation(id) {
      try {
        const token = localStorage.getItem('token')
        const resp = await axios.get(`${API_BASE}/conversations/${id}`, {
          headers: { Authorization: `Bearer ${token}` }
        })
        if (resp.data?.success) {
          this.currentId = id
          this.messages = resp.data.data.messages || []
          this.userInput = ''
        }
      } catch (e) {}
    },

    async sendMessage() {
      if (!this.userInput.trim() || this.streaming) return
      
      const message = this.userInput.trim()
      this.userInput = ''
      this.messages.push({ role: 'user', content: message })
      this.streaming = true
      this.progressPct = 0
      this.progressMsg = '正在分析创意...'
      
      try {
        const token = localStorage.getItem('token')
        const resp = await axios.post(`${API_BASE}/chat/stream`, {
          message,
          session_id: this.currentId,
          mode: this.chatMode,
          model: this.writeModel,
          style_hint: this.styleHint,
          scene_count: this.sceneCount,
        }, {
          headers: { Authorization: `Bearer ${token}` },
          responseType: 'stream',
        })

        const reader = resp.data.getReader()
        const decoder = new TextDecoder()
        let buffer = ''
        let assistantMsg = ''

        while (true) {
          const { done, value } = await reader.read()
          if (done) break

          buffer += decoder.decode(value, { stream: true })
          const lines = buffer.split('\n')
          buffer = lines.pop() || ''

          for (const line of lines) {
            if (line.startsWith('data: ')) {
              try {
                const data = JSON.parse(line.slice(6))
                
                if (data.event === 'progress') {
                  this.progressStage = data.stage
                  this.progressPct = data.pct
                  this.progressMsg = data.message
                } else if (data.event === 'outline') {
                  this.progressMsg = '大纲生成完成'
                } else if (data.event === 'characters') {
                  this.progressMsg = '角色设计完成'
                } else if (data.event === 'scenes') {
                  this.progressMsg = '场景设计完成'
                } else if (data.event === 'script') {
                  assistantMsg = data.data.content || ''
                  this.messages.push({ role: 'assistant', content: assistantMsg })
                  this.currentId = data.data.session_id
                  this.streaming = false
                } else if (data.event === 'error') {
                  this.messages.push({ role: 'assistant', content: '❌ ' + data.message })
                  this.streaming = false
                } else if (data.event === 'complete') {
                  this.streaming = false
                }
              } catch (e) {}
            }
          }
        }
      } catch (e) {
        this.messages.push({ role: 'assistant', content: '❌ 请求失败，请重试' })
        this.streaming = false
      }
      
      this.$nextTick(() => {
        this.scrollToBottom()
      })
    },

    useTemplate(tpl) {
      this.userInput = tpl.synopsis
      this.sendMessage()
    },

    quickAction(action, msgIndex) {
      const msg = this.messages[msgIndex]
      if (!msg) return
      
      let prompt = ''
      switch (action) {
        case 'rewrite':
          prompt = '请重写这段剧本，保持原意但改进表达方式'
          break
        case 'shorten':
          prompt = '请缩短这段剧本，保留核心情节'
          break
        case 'expand':
          prompt = '请扩展这段剧本，增加更多细节和描写'
          break
        case 'change_style':
          prompt = '请改变这段剧本的风格，使其更加生动有趣'
          break
        case 'export':
          this.exportScript()
          return
      }
      
      this.userInput = prompt
      this.messages.push({ role: 'user', content: prompt })
      this.sendMessage()
    },

    exportScript() {
      const content = this.messages
        .filter(m => m.role === 'assistant')
        .map(m => m.content)
        .join('\n\n')
      
      const blob = new Blob([content], { type: 'text/plain' })
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = '剧本.txt'
      a.click()
      URL.revokeObjectURL(url)
    },

    async adaptScriptContent() {
      if (!this.adaptScript.trim()) return
      this.adaptLoading = true
      
      try {
        const token = localStorage.getItem('token')
        const resp = await axios.post(`${API_BASE}/adapt`, {
          script: this.adaptScript,
          model: this.writeModel,
        }, {
          headers: { Authorization: `Bearer ${token}` }
        })
        
        if (resp.data?.success) {
          this.adaptResult = resp.data.data
        } else {
          alert('改编失败: ' + (resp.data?.error || '未知错误'))
        }
      } catch (e) {
        alert('改编失败，请重试')
      }
      
      this.adaptLoading = false
    },

    resetPanels() {
      this.streaming = false
      this.progressPct = 0
      this.progressMsg = ''
    },

    scrollToBottom() {
      const el = this.$refs.messageList
      if (el) {
        el.scrollTop = el.scrollHeight
      }
    },
  },
}
</script>

<style scoped>
.script-chat {
  display: flex;
  height: calc(100vh - 60px);
  background: var(--bg-primary, #1E1E2E);
  color: var(--text-primary, #EDEDF5);
  overflow: hidden;
  font-family: 'Inter', 'Noto Sans SC', -apple-system, sans-serif;
}

/* Sidebar */
.sidebar {
  width: 240px;
  min-width: 240px;
  background: #1A1A2E;
  border-right: 1px solid var(--border, #2D2D4E);
  display: flex;
  flex-direction: column;
  transition: all 0.3s;
  position: relative;
}
.sidebar.collapsed { width: 0; min-width: 0; overflow: hidden; }

.sidebar-header { padding: 16px; border-bottom: 1px solid var(--border, #2D2D4E); }
.btn-new-chat {
  width: 100%; padding: 10px;
  border: 1px dashed var(--accent, #7C5CFC);
  background: transparent; color: var(--accent, #7C5CFC);
  border-radius: 8px; cursor: pointer; font-size: 14px;
  transition: all 0.2s;
}
.btn-new-chat:hover { background: rgba(124, 92, 252, 0.1); }

.conversation-list { flex: 1; overflow-y: auto; padding: 8px; }
.conv-item { padding: 10px 12px; border-radius: 8px; cursor: pointer; margin-bottom: 4px; transition: all 0.2s; }
.conv-item:hover, .conv-item.active { background: rgba(124, 92, 252, 0.15); }
.conv-title { font-size: 14px; font-weight: 600; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
.conv-meta { font-size: 11px; color: var(--text-muted, #6C6C8A); margin-top: 2px; }

.btn-sidebar-toggle {
  position: absolute; right: -32px; top: 12px;
  width: 32px; height: 32px;
  border: 1px solid var(--border, #2D2D4E); border-left: none;
  background: #1A1A2E; color: var(--text-secondary, #9A9ABF);
  border-radius: 0 6px 6px 0; cursor: pointer; font-size: 14px;
  display: flex; align-items: center; justify-content: center; z-index: 10;
}

/* Main Area */
.main-area { flex: 1; display: flex; flex-direction: column; min-width: 0; }

.chat-header {
  display: flex; align-items: center; justify-content: space-between;
  padding: 12px 20px; border-bottom: 1px solid var(--border, #2D2D4E);
  background: rgba(30, 30, 46, 0.95); backdrop-filter: blur(10px); z-index: 5;
}
.header-left { display: flex; align-items: center; gap: 8px; }
.header-icon { font-size: 20px; }
.header-title { font-size: 16px; font-weight: 700; }
.header-badge { font-size: 11px; padding: 2px 10px; border-radius: 10px; margin-left: 8px; }
.mode-precise { background: rgba(124, 92, 252, 0.2); color: #7C5CFC; }
.mode-fast { background: rgba(0, 200, 117, 0.2); color: #00C875; }

.header-right { display: flex; align-items: center; gap: 12px; }
.mode-switch { display: flex; align-items: center; gap: 6px; font-size: 13px; }
.model-select { background: #2D2D4E; color: #EDEDF5; border: 1px solid #3D3D5E; border-radius: 6px; padding: 4px 8px; font-size: 13px; cursor: pointer; }
.btn-settings { background: transparent; border: 1px solid var(--border, #2D2D4E); color: var(--text-secondary, #9A9ABF); width: 32px; height: 32px; border-radius: 6px; cursor: pointer; font-size: 16px; }
.btn-settings:hover { border-color: var(--accent, #7C5CFC); color: var(--accent, #7C5CFC); }

.btn-upload-script {
  padding: 6px 14px; background: rgba(138,43,226,0.12); border: 1px solid rgba(138,43,226,0.3);
  border-radius: 8px; color: var(--accent, #7C5CFC); font-size: 13px; font-weight: 600;
  cursor: pointer; transition: all 0.2s; white-space: nowrap;
}
.btn-upload-script:hover { background: rgba(138,43,226,0.2); }

/* Mode Tabs */
.mode-tabs { display: flex; gap: 4px; padding: 12px 20px 0; border-bottom: 1px solid var(--border, #2D2D4E); }
.mode-tab {
  padding: 8px 16px; border: none; background: transparent; color: var(--text-secondary, #9A9ABF);
  font-size: 14px; font-weight: 500; cursor: pointer; border-radius: 8px 8px 0 0;
  transition: all 0.2s;
}
.mode-tab:hover { background: rgba(124, 92, 252, 0.1); color: var(--text-primary, #EDEDF5); }
.mode-tab.active { background: rgba(124, 92, 252, 0.15); color: var(--accent, #7C5CFC); }

/* Tab Content */
.tab-content { flex: 1; display: flex; flex-direction: column; overflow: hidden; }

/* Message List */
.message-list { flex: 1; overflow-y: auto; padding: 20px; }
.message { display: flex; gap: 12px; margin-bottom: 20px; }
.message.user { flex-direction: row-reverse; }
.message-avatar {
  width: 36px; height: 36px; border-radius: 50%;
  background: var(--bg-card, #252536); display: flex; align-items: center; justify-content: center;
  font-size: 18px; flex-shrink: 0;
}
.message.user .message-avatar { background: var(--accent, #7C5CFC); }
.message-bubble {
  max-width: 70%; padding: 12px 16px; border-radius: 12px;
  background: var(--bg-card, #252536); border: 1px solid var(--border, #2D2D4E);
}
.message.user .message-bubble { background: var(--accent, #7C5CFC); border-color: var(--accent, #7C5CFC); }
.message-content { font-size: 14px; line-height: 1.6; white-space: pre-wrap; word-break: break-word; }
.message.user .message-content { color: #fff; }
.message-content p { margin: 0 0 8px 0; }
.message-content p:last-child { margin-bottom: 0; }
.message-content strong { color: var(--accent, #7C5CFC); }
.message.user .message-content strong { color: #fff; }

.message-actions { display: flex; gap: 6px; margin-top: 10px; flex-wrap: wrap; }
.action-btn {
  padding: 4px 10px; background: rgba(124, 92, 252, 0.1); border: 1px solid rgba(124, 92, 252, 0.2);
  border-radius: 6px; color: var(--accent, #7C5CFC); font-size: 12px; cursor: pointer;
  transition: all 0.2s;
}
.action-btn:hover { background: rgba(124, 92, 252, 0.2); }

/* Welcome */
.welcome { text-align: center; padding: 40px 20px; }
.welcome-icon { font-size: 48px; margin-bottom: 16px; }
.welcome-title { font-size: 20px; font-weight: 700; margin-bottom: 8px; }
.welcome-desc { font-size: 14px; color: var(--text-secondary, #9A9ABF); margin-bottom: 24px; }
.welcome-templates { display: grid; grid-template-columns: repeat(auto-fill, minmax(180px, 1fr)); gap: 12px; }
.template-card {
  padding: 16px; background: var(--bg-card, #252536); border: 1px solid var(--border, #2D2D4E);
  border-radius: 12px; cursor: pointer; transition: all 0.2s; text-align: left;
}
.template-card:hover { border-color: var(--accent, #7C5CFC); transform: translateY(-2px); }
.tpl-emoji { font-size: 24px; display: block; margin-bottom: 8px; }
.tpl-title { font-size: 14px; font-weight: 600; margin-bottom: 4px; }
.tpl-desc { font-size: 12px; color: var(--text-muted, #6C6C8A); line-height: 1.4; }

/* Streaming Indicator */
.streaming-indicator { display: flex; align-items: center; gap: 4px; color: var(--text-secondary, #9A9ABF); font-size: 14px; }
.dot { animation: blink 1.4s infinite both; }
.dot:nth-child(2) { animation-delay: 0.2s; }
.dot:nth-child(3) { animation-delay: 0.4s; }
@keyframes blink { 0%, 80%, 100% { opacity: 0; } 40% { opacity: 1; } }

/* Progress Bar */
.progress-bar { padding: 8px 20px; background: rgba(30, 30, 46, 0.95); border-bottom: 1px solid var(--border, #2D2D4E); }
.progress-track { height: 4px; background: var(--bg-hover, rgba(255,255,255,0.04)); border-radius: 2px; overflow: hidden; margin-bottom: 4px; }
.progress-fill { height: 100%; background: var(--accent, #7C5CFC); border-radius: 2px; transition: width 0.3s; }
.progress-text { font-size: 11px; color: var(--text-muted, #6C6C8A); text-align: center; }

/* Input Area */
.input-area { padding: 16px 20px; border-top: 1px solid var(--border, #2D2D4E); background: rgba(30, 30, 46, 0.95); }
.input-wrapper { display: flex; gap: 12px; align-items: flex-end; }
.input-textarea {
  flex: 1; padding: 12px 16px; background: var(--bg-input, #1A1A2E);
  border: 1px solid var(--border, #2D2D4E); border-radius: 12px;
  color: var(--text-primary, #EDEDF5); font-size: 14px; resize: none;
  outline: none; transition: border-color 0.2s; font-family: inherit;
}
.input-textarea:focus { border-color: var(--accent, #7C5CFC); }
.send-btn {
  width: 40px; height: 40px; background: var(--accent, #7C5CFC); color: #fff;
  border: none; border-radius: 10px; font-size: 18px; cursor: pointer;
  display: flex; align-items: center; justify-content: center;
  transition: all 0.2s; flex-shrink: 0;
}
.send-btn:hover:not(:disabled) { background: #8A2BE2; transform: scale(1.05); }
.send-btn:disabled { opacity: 0.5; cursor: not-allowed; }
.input-hint { font-size: 11px; color: var(--text-muted, #6C6C8A); margin-top: 8px; text-align: center; }

/* Settings Overlay */
.settings-overlay {
  position: fixed; inset: 0; background: rgba(0,0,0,0.5); display: flex; align-items: center; justify-content: center; z-index: 100;
}
.settings-panel {
  background: var(--bg-card, #252536); border: 1px solid var(--border, #2D2D4E);
  border-radius: 16px; padding: 24px; width: 400px; max-width: 90vw;
}
.settings-panel h3 { font-size: 18px; font-weight: 700; margin-bottom: 20px; }
.setting-item { margin-bottom: 16px; }
.setting-item label { display: block; font-size: 13px; color: var(--text-secondary, #9A9ABF); margin-bottom: 6px; }
.setting-item select, .setting-item input, .setting-item textarea {
  width: 100%; padding: 8px 12px; background: var(--bg-input, #1A1A2E);
  border: 1px solid var(--border, #2D2D4E); border-radius: 8px;
  color: var(--text-primary, #EDEDF5); font-size: 14px; outline: none;
}
.setting-item textarea { resize: vertical; }
.btn-close-settings {
  width: 100%; padding: 10px; background: var(--accent, #7C5CFC); color: #fff;
  border: none; border-radius: 8px; font-size: 14px; font-weight: 600; cursor: pointer;
}

/* Adapt Mode */
.adapt-container { flex: 1; padding: 24px; overflow-y: auto; }
.adapt-header { margin-bottom: 24px; }
.adapt-header h2 { font-size: 20px; font-weight: 700; margin-bottom: 8px; }
.adapt-desc { font-size: 14px; color: var(--text-secondary, #9A9ABF); }
.adapt-input { margin-bottom: 24px; }
.adapt-textarea {
  width: 100%; padding: 16px; background: var(--bg-input, #1A1A2E);
  border: 1px solid var(--border, #2D2D4E); border-radius: 12px;
  color: var(--text-primary, #EDEDF5); font-size: 14px; resize: vertical;
  outline: none; font-family: inherit; margin-bottom: 12px;
}
.adapt-textarea:focus { border-color: var(--accent, #7C5CFC); }
.adapt-submit-btn {
  padding: 12px 24px; background: var(--accent, #7C5CFC); color: #fff;
  border: none; border-radius: 8px; font-size: 14px; font-weight: 600; cursor: pointer;
  transition: all 0.2s;
}
.adapt-submit-btn:hover:not(:disabled) { background: #8A2BE2; transform: translateY(-1px); }
.adapt-submit-btn:disabled { opacity: 0.5; cursor: not-allowed; }
.adapt-result { margin-top: 24px; }
.adapt-analysis-box, .adapt-structure-box {
  background: var(--bg-card, #252536); border: 1px solid var(--border, #2D2D4E);
  border-radius: 12px; padding: 20px; margin-bottom: 16px;
}
.adapt-analysis-box h3 { font-size: 17px; color: var(--accent, #7C5CFC); margin-bottom: 12px; }
.adapt-analysis-text { font-size: 14px; line-height: 1.8; color: var(--text-primary, #EDEDF5); white-space: pre-wrap; }
.adapt-char-insights { margin-top: 16px; }
.adapt-char-insights h4 { font-size: 14px; color: var(--text-secondary, #9A9ABF); margin-bottom: 8px; }
.adapt-char-card {
  padding: 10px 14px; background: rgba(255,255,255,0.03); border-radius: 8px;
  margin-bottom: 6px; font-size: 13px; color: var(--text-primary, #EDEDF5);
}
.adapt-char-meta { font-size: 12px; color: var(--text-muted, #6C6C8A); margin-top: 4px; }

/* Spinner */
.spinner {
  width: 18px; height: 18px; border: 2px solid rgba(255,255,255,0.3);
  border-top-color: #fff; border-radius: 50%; animation: spin 0.8s linear infinite;
}
@keyframes spin { to { transform: rotate(360deg); } }

/* Scrollbar */
::-webkit-scrollbar { width: 6px; height: 6px; }
::-webkit-scrollbar-track { background: transparent; }
::-webkit-scrollbar-thumb { background: var(--border, #2D2D4E); border-radius: 3px; }
::-webkit-scrollbar-thumb:hover { background: var(--text-muted, #6C6C8A); }

/* Responsive */
@media (max-width: 768px) {
  .sidebar { position: absolute; z-index: 10; height: 100%; }
  .message-bubble { max-width: 85%; }
  .welcome-templates { grid-template-columns: 1fr; }
}
</style>
