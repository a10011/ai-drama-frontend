<template>
  <div class="director-chat">
    <!-- 头部 -->
    <div class="chat-header">
      <div class="director-info">
        <span class="director-avatar">🎬</span>
        <div>
          <div class="director-name">总导演 <span class="mode-tag" :class="mode">{{ mode === '大片' ? '🎥 大片' : '📱 短剧' }}</span></div>
          <div class="director-status">{{ knowledgeCount }} 知识库 · {{ expCount }} 项目经验</div>
        </div>
      </div>
      <div class="header-actions">
        <button class="mode-btn" @click="toggleMode" :title="mode === '短剧' ? '切换大片模式' : '切换短剧模式'">
          {{ mode === '短剧' ? '🎥' : '📱' }}
        </button>
        <button class="mode-btn" @click="showKnowledge = !showKnowledge" title="知识库">📚</button>
      </div>
    </div>

    <!-- 消息列表 -->
    <div class="messages" ref="messagesRef">
      <div v-for="(msg, i) in messages" :key="i" class="msg-row" :class="msg.role">
        <div class="msg-avatar">{{ msg.role === 'user' ? '👤' : '🎬' }}</div>
        <div class="msg-bubble">
          <div class="msg-text" v-html="renderMarkdown(msg.content)"></div>
          <div v-if="msg.role === 'assistant' && msg.knowledge_used" class="knowledge-tag">
            📖 {{ msg.knowledge_used }}
          </div>
        </div>
      </div>
      <!-- 打字中 -->
      <div v-if="loading" class="msg-row assistant">
        <div class="msg-avatar">🎬</div>
        <div class="msg-bubble typing-dots">
          <span></span><span></span><span></span>
        </div>
      </div>
    </div>

    <!-- 知识库侧面板 -->
    <div class="knowledge-panel" v-if="showKnowledge">
      <div class="kp-header">
        <span>📚 知识库</span>
        <button class="close-btn" @click="showKnowledge = false">✕</button>
      </div>
      <div class="kp-list">
        <div v-for="k in knowledgeFiles" :key="k.name" class="kp-item" @click="viewKnowledge(k.name)">
          📄 {{ k.name.replace(/_/g, ' ') }}
          <span class="kp-size">{{ (k.size / 1024).toFixed(1) }}KB</span>
        </div>
      </div>
      <div class="kp-exp" v-if="experiences">
        <div class="kp-exp-title">📋 近期经验</div>
        <div class="kp-exp-text">{{ experiences.substring(0, 500) }}</div>
      </div>
    </div>

    <!-- 输入框 -->
    <div class="chat-input-bar">
      <textarea
        v-model="inputText"
        @keydown.enter.exact="sendMessage"
        @keydown.enter.shift.exact.prevent="inputText += '\n'"
        placeholder="跟导演聊聊剧本、喂知识、聊分镜..."
        rows="1"
        ref="inputRef"
        :disabled="loading"
        class="chat-input"
      ></textarea>
      <button class="send-btn" @click="sendMessage" :disabled="!inputText.trim() || loading">
        ➤
      </button>
    </div>
  </div>
</template>

<script>
import request from '@/utils/request'
import { marked } from 'marked'

const API_BASE = '/api/v1'

export default {
  data() {
    return {
      blockNonMember: false,
    messages: [
        {
          role: 'assistant',
          content: '🎬 你好，我是总导演。可以跟我聊剧本、喂知识、讨论分镜。\n\n**我能帮你做什么：**\n- 📝 分析剧本情绪和节奏\n- 🎭 讨论角色演绎\n- 📚 喂我专业知识\n- 🎥 切换大片/短剧模式\n- 💡 看看我学到的经验\n\n你想聊什么？'
        }
      ],
      inputText: '',
      loading: false,
      mode: '短剧',
      showKnowledge: false,
      knowledgeFiles: [],
      experiences: '',
      knowledgeCount: 0,
      expCount: 0,
    }
  },
  mounted() {
    this.checkMembership()
    this.loadStatus()
    this.loadKnowledge()
    this.$nextTick(() => this.scrollToBottom())
  },
  methods: {
    async loadStatus() {
      try {
        const d = await request({ url: `${API_BASE}/director/status` })
        this.knowledgeCount = d.knowledge_files || 0
        this.expCount = d.experience_count || 0
      } catch (e) { console.error("[DirectorChat] error:", e) }
    },
    async loadKnowledge() {
      try {
        const d = await request({ url: `${API_BASE}/director/knowledge` })
        this.knowledgeFiles = d.files || []
      } catch (e) { console.error("[DirectorChat] error:", e) }
      try {
        const d = await request({ url: `${API_BASE}/director/experiences` })
        this.experiences = d.recent_summary || ''
        this.expCount = d.count || 0
      } catch (e) { console.error("[DirectorChat] error:", e) }
    },
    async viewKnowledge(name) {
      try {
        const d = await request({ url: `${API_BASE}/director/knowledge/${name}` })
        this.messages.push({
          role: 'assistant',
          content: `**📚 ${name.replace(/_/g, ' ')}**\n\n${d.content.substring(0, 3000)}${d.total_chars > 3000 ? '\n\n*(内容过长已截断)*' : ''}`
        })
      } catch(e) {
        this.messages.push({ role: 'assistant', content: '加载失败' })
      }
      this.scrollToBottom()
    },
    async sendMessage() {
      const text = this.inputText.trim()
      if (!text || this.loading) return

      this.messages.push({ role: 'user', content: text })
      this.inputText = ''
      this.loading = true
      this.scrollToBottom()

      try {
        // 检测意图：喂知识
        if (text.includes('学') || text.includes('记住') || text.includes('喂知识') ||
            text.startsWith('导演你学') || text.startsWith('记下来') ||
            text.includes('这是') && text.length > 80) {
          const d = await request({
            url: `${API_BASE}/director/learn`, method: 'POST',
            data: { text, mode: this.mode }
          })
          if (d.success) {
            this.messages.push({
              role: 'assistant',
              content: `✅ 已收录！文件名: \`${d.file}\`\n分类: ${d.topics?.join(', ') || '通用'}`
            })
            this.loadStatus()
            this.loadKnowledge()
          } else {
            this.messages.push({ role: 'assistant', content: `❌ 收录失败: ${d.error}` })
          }
          this.loading = false
          this.scrollToBottom()
          return
        }

        // 常规聊天 — 调用导演分析接口
        const d = await request({
          url: `${API_BASE}/director/chat`, method: 'POST',
          data: {
            message: text,
            mode: this.mode,
            history: this.messages.slice(-10).map(m => ({ role: m.role, content: m.content }))
          }
        })
        if (d.success) {
          this.messages.push({ role: 'assistant', content: d.reply, knowledge_used: d.knowledge_used })
        } else {
          this.messages.push({ role: 'assistant', content: `抱歉，我刚才走神了：${d.error || '未知错误'}` })
        }
      } catch(e) {
        this.messages.push({ role: 'assistant', content: `网络开小差了: ${e.message}` })
      }
      this.loading = false
      this.scrollToBottom()
    },
    toggleMode() {
      this.mode = this.mode === '短剧' ? '大片' : '短剧'
      this.messages.push({
        role: 'assistant',
        content: this.mode === '大片'
          ? '🎥 切换到大片模式！我会用电影级别的镜头语言和构图规范来思考。'
          : '📱 切换到短剧模式！我会按短剧赛道套路和节奏来思考。'
      })
    },
    renderMarkdown(text) {
      if (!text) return ''
      try {
        return marked(text)
      } catch {
        return text.replace(/\n/g, '<br>')
      }
    },
    scrollToBottom() {
      this.$nextTick(() => {
        const el = this.$refs.messagesRef
        if (el) el.scrollTop = el.scrollHeight
      })
    }
  }
}
</script>

<style scoped>
.director-chat {
  display: flex;
  flex-direction: column;
  height: calc(100vh - 56px);
  max-width: 900px;
  margin: 0 auto;
  position: relative;
}

.chat-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 12px 20px;
  border-bottom: 1px solid rgba(255,255,255,0.06);
  background: rgba(255,255,255,0.02);
  border-radius: 12px 12px 0 0;
  flex-shrink: 0;
}

.director-info {
  display: flex;
  align-items: center;
  gap: 12px;
}

.director-avatar {
  font-size: 32px;
}

.director-name {
  font-size: 15px;
  font-weight: 600;
  color: #fff;
  display: flex;
  align-items: center;
  gap: 8px;
}

.mode-tag {
  font-size: 11px;
  padding: 2px 8px;
  border-radius: 4px;
  font-weight: 500;
}

.mode-tag.短剧 { background: rgba(64,224,233,0.15); color: #40E0E9; }
.mode-tag.大片 { background: rgba(236,72,153,0.15); color: #f472b6; }

.director-status {
  font-size: 11px;
  color: rgba(255,255,255,0.35);
  margin-top: 2px;
}

.header-actions {
  display: flex;
  gap: 6px;
}

.mode-btn {
  background: rgba(255,255,255,0.05);
  border: 1px solid rgba(255,255,255,0.08);
  color: #ccc;
  padding: 6px 12px;
  border-radius: 8px;
  cursor: pointer;
  font-size: 16px;
  transition: all 0.15s;
}

.mode-btn:hover {
  background: rgba(255,255,255,0.1);
}

/* 消息区域 */
.messages {
  flex: 1;
  overflow-y: auto;
  padding: 16px 20px;
  display: flex;
  flex-direction: column;
  gap: 16px;
  scroll-behavior: smooth;
}

.messages::-webkit-scrollbar { width: 4px; }
.messages::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.08); border-radius: 2px; }

.msg-row {
  display: flex;
  gap: 10px;
  max-width: 85%;
}

.msg-row.user {
  align-self: flex-end;
  flex-direction: row-reverse;
}

.msg-avatar {
  width: 32px;
  height: 32px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 16px;
  flex-shrink: 0;
  background: rgba(255,255,255,0.05);
}

.msg-bubble {
  padding: 10px 14px;
  border-radius: 12px;
  font-size: 13.5px;
  line-height: 1.6;
}

.msg-row.assistant .msg-bubble {
  background: rgba(255,255,255,0.04);
  border: 1px solid rgba(255,255,255,0.06);
  color: #d1d5db;
}

.msg-row.user .msg-bubble {
  background: rgba(64,224,233,0.15);
  border: 1px solid rgba(64,224,233,0.2);
  color: #e0e7ff;
}

.msg-text :deep(p) { margin: 6px 0; }
.msg-text :deep(strong) { color: #f0f0f0; }
.msg-text :deep(code) {
  background: rgba(255,255,255,0.06);
  padding: 1px 5px;
  border-radius: 3px;
  font-size: 12px;
}
.msg-text :deep(pre) {
  background: rgba(0,0,0,0.3);
  padding: 10px;
  border-radius: 8px;
  overflow-x: auto;
  font-size: 12px;
  margin: 8px 0;
}
.msg-text :deep(ul), .msg-text :deep(ol) { padding-left: 20px; margin: 6px 0; }
.msg-text :deep(li) { margin: 3px 0; }
.msg-text :deep(h3) { color: #f0f0f0; margin: 10px 0 4px; font-size: 14px; }

.knowledge-tag {
  margin-top: 6px;
  font-size: 11px;
  color: rgba(255,255,255,0.3);
}

/* 打字动画 */
.typing-dots {
  display: flex;
  gap: 4px;
  padding: 16px 20px !important;
}

.typing-dots span {
  width: 6px;
  height: 6px;
  border-radius: 50%;
  background: rgba(255,255,255,0.3);
  animation: typing 1.4s infinite ease-in-out;
}

.typing-dots span:nth-child(2) { animation-delay: 0.2s; }
.typing-dots span:nth-child(3) { animation-delay: 0.4s; }

@keyframes typing {
  0%, 60%, 100% { transform: translateY(0); opacity: 0.3; }
  30% { transform: translateY(-8px); opacity: 1; }
}

/* 知识库侧面板 */
.knowledge-panel {
  position: absolute;
  right: 0;
  top: 0;
  bottom: 0;
  width: 320px;
  background: rgba(12,12,22,0.98);
  border-left: 1px solid rgba(255,255,255,0.06);
  padding: 16px;
  overflow-y: auto;
  z-index: 10;
}

.kp-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
  font-size: 14px;
  font-weight: 600;
}

.close-btn {
  background: none;
  border: none;
  color: rgba(255,255,255,0.4);
  cursor: pointer;
  font-size: 16px;
}

.kp-list { margin-bottom: 16px; }

.kp-item {
  padding: 8px 10px;
  border-radius: 6px;
  font-size: 12px;
  cursor: pointer;
  display: flex;
  justify-content: space-between;
  align-items: center;
  color: rgba(255,255,255,0.7);
  transition: background 0.15s;
}

.kp-item:hover { background: rgba(64,224,233,0.08); color: #fff; }

.kp-size {
  font-size: 10px;
  color: rgba(255,255,255,0.3);
}

.kp-exp-title {
  font-size: 13px;
  font-weight: 600;
  margin-bottom: 8px;
  color: #40E0E9;
}

.kp-exp-text {
  font-size: 11px;
  line-height: 1.6;
  color: rgba(255,255,255,0.5);
  white-space: pre-wrap;
}

/* 输入框 */
.chat-input-bar {
  display: flex;
  align-items: flex-end;
  gap: 8px;
  padding: 12px 20px;
  border-top: 1px solid rgba(255,255,255,0.06);
  background: rgba(255,255,255,0.02);
  border-radius: 0 0 12px 12px;
  flex-shrink: 0;
}

.chat-input {
  flex: 1;
  background: rgba(255,255,255,0.04);
  border: 1px solid rgba(255,255,255,0.08);
  border-radius: 10px;
  padding: 10px 14px;
  color: #e5e7eb;
  font-size: 13px;
  resize: none;
  outline: none;
  min-height: 40px;
  max-height: 120px;
  transition: border-color 0.15s;
}

.chat-input:focus {
  border-color: rgba(64,224,233,0.4);
}

.chat-input::placeholder {
  color: rgba(255,255,255,0.2);
}

.send-btn {
  width: 40px;
  height: 40px;
  border-radius: 10px;
  border: none;
  background: rgba(64,224,233,0.2);
  color: #40E0E9;
  font-size: 18px;
  cursor: pointer;
  transition: all 0.15s;
  flex-shrink: 0;
  display: flex;
  align-items: center;
  justify-content: center;
}

.send-btn:hover:not(:disabled) {
  background: rgba(64,224,233,0.35);
}

.send-btn:disabled {
  opacity: 0.3;
  cursor: not-allowed;
}

@media (max-width: 480px) {
  .director-chat { height: calc(100vh - 80px); }
  .knowledge-panel { width: 100%; }
  .msg-row { max-width: 95%; }
}

/* ===== Mobile Responsive ===== */
@media (max-width: 768px) {
  .track-page, .result-page, .history-page, .profile-page, .cert-page { padding-bottom: 72px !important; }
  .page-wrap, .page-container, .container { padding: 0 12px 72px !important; }
}

</style>
