<template>
  <div class="fm-script-chat">
    <!-- 页面顶部 -->
    <header class="fm-sc-header">
      <div class="fm-sc-header-inner">
        <h1 class="fm-sc-title">✍️ 写剧本</h1>
        <p class="fm-sc-desc">AI 对话式创作 · 快速产出 · 自动质检 · 每步可迭代修改</p>
      </div>
    </header>

    <div class="fm-sc-body">
      <!-- 左侧：对话列表 -->
      <aside class="fm-sc-sidebar">
        <button class="fm-sc-new-chat" @click="newChat">
          ✏️ 新建剧本
        </button>

        <div class="fm-sc-conv-list">
          <div v-for="conv in conversations" :key="conv.id"
               class="fm-sc-conv-item"
               :class="{ active: conv.id === currentId }"
               @click="switchConversation(conv.id)">
            <div class="fm-sc-conv-title">{{ conv.title || '新剧本' }}</div>
            <div class="fm-sc-conv-meta">{{ conv.genre }} · {{ conv.updatedAt }}</div>
          </div>
        </div>

        <button class="fm-sc-toggle-sidebar" @click="sidebarCollapsed = !sidebarCollapsed">
          {{ sidebarCollapsed ? '▶' : '◀' }}
        </button>
      </aside>

      <!-- 右侧：聊天区域 -->
      <main class="fm-sc-main">
        <div class="fm-sc-messages">
          <div v-for="(msg, i) in chatMessages" :key="i"
               class="fm-sc-message" :class="{ 'msg-user': msg.role === 'user', 'msg-assistant': msg.role === 'assistant' }">
            <div class="fm-sc-msg-avatar">{{ msg.role === 'user' ? '👤' : '🤖' }}</div>
            <div class="fm-sc-msg-content">
              <div class="fm-sc-msg-text">{{ msg.text }}</div>
            </div>
          </div>
          <div v-if="chatLoading" class="fm-sc-message msg-assistant">
            <div class="fm-sc-msg-avatar">🤖</div>
            <div class="fm-sc-msg-content">
              <div class="fm-sc-loading-dots"><span></span><span></span><span></span></div>
            </div>
          </div>
        </div>

        <div class="fm-sc-input-area">
          <textarea v-model="chatInput" class="fm-sc-input" placeholder="输入你的创意、要求或修改意见..." rows="3" @keyup.enter.ctrl="sendChat"></textarea>
          <button class="fm-sc-send-btn" @click="sendChat" :disabled="!chatInput.trim() || chatLoading">
            {{ chatLoading ? '生成中...' : '发送' }}
          </button>
        </div>
      </main>
    </div>
  </div>
</template>
<style scoped>
/* ===== 全局布局 ===== */
.fm-script-chat {
  height: calc(100vh - 60px);
  display: flex;
  flex-direction: column;
  background: #0A0A0A;
}

/* 顶部 */
.fm-sc-header {
  padding: 20px 24px;
  border-bottom: 1px solid #2A2A2A;
  background: linear-gradient(180deg, rgba(229,57,53,0.08), transparent);
}
.fm-sc-header-inner { max-width: 1400px; margin: 0 auto; }
.fm-sc-title { font-size: 28px; font-weight: 800; margin-bottom: 4px; }
.fm-sc-desc { color: #9E9E9E; font-size: 14px; }

/* 主体 */
.fm-sc-body {
  flex: 1;
  display: flex;
  overflow: hidden;
}

/* 侧边栏 */
.fm-sc-sidebar {
  width: 280px;
  border-right: 1px solid #2A2A2A;
  display: flex;
  flex-direction: column;
  transition: width 0.3s;
  overflow: hidden;
}
.fm-sc-sidebar.collapsed { width: 0; border-right: none; }

.fm-sc-new-chat {
  padding: 14px 16px;
  background: transparent;
  border: 1px solid #2A2A2A;
  border-radius: 12px;
  color: #FFFFFF;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  text-align: left;
  flex-shrink: 0;
}
.fm-sc-new-chat:hover { background: rgba(229,57,53,0.1); border-color: #E53935; }

.fm-sc-conv-list {
  flex: 1;
  overflow-y: auto;
  padding: 8px;
}
.fm-sc-conv-item {
  padding: 14px 16px;
  border-radius: 10px;
  cursor: pointer;
  transition: all 0.2s;
  margin-bottom: 4px;
}
.fm-sc-conv-item:hover { background: var(--fm-card-hover); }
.fm-sc-conv-item.active { background: rgba(229,57,53,0.15); border-left: 3px solid #E53935; }
.fm-sc-conv-title { font-size: 15px; font-weight: 600; margin-bottom: 4px; }
.fm-sc-conv-meta { font-size: 12px; color: #9E9E9E; }

.fm-sc-toggle-sidebar {
  padding: 10px;
  background: transparent;
  border: none;
  color: #9E9E9E;
  cursor: pointer;
  font-size: 12px;
  flex-shrink: 0;
}

/* 主聊天区 */
.fm-sc-main {
  flex: 1;
  display: flex;
  flex-direction: column;
  min-width: 0;
}

.fm-sc-messages {
  flex: 1;
  overflow-y: auto;
  padding: 24px;
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.fm-sc-message {
  display: flex;
  gap: 14px;
  max-width: 90%;
}
.fm-sc-message.msg-user { align-self: flex-end; flex-direction: row-reverse; }
.fm-sc-msg-avatar {
  width: 36px;
  height: 36px;
  border-radius: 50%;
  background: var(--fm-card);
  border: 1px solid var(--fm-border);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 18px;
  flex-shrink: 0;
}
.fm-sc-msg-content {
  flex: 1;
  min-width: 0;
}
.fm-sc-msg-text {
  background: var(--fm-card);
  padding: 14px 18px;
  border-radius: 12px;
  border: 1px solid var(--fm-border);
  font-size: 15px;
  line-height: 1.7;
  white-space: pre-wrap;
  word-break: break-word;
}
.fm-sc-message.msg-user .fm-sc-msg-text {
  background: rgba(229,57,53,0.15);
  border-color: rgba(229,57,53,0.3);
}

/* Loading */
.fm-sc-loading-dots span {
  display: inline-block;
  width: 8px;
  height: 8px;
  background: #9E9E9E;
  border-radius: 50%;
  margin: 0 2px;
  animation: fm-bounce 1.4s infinite both;
}
.fm-sc-loading-dots span:nth-child(2) { animation-delay: 0.16s; }
.fm-sc-loading-dots span:nth-child(3) { animation-delay: 0.32s; }
@keyframes fm-bounce {
  0%, 80%, 100% { transform: translateY(0); opacity: 0.4; }
  40% { transform: translateY(-8px); opacity: 1; }
}

/* 输入区 */
.fm-sc-input-area {
  padding: 16px 24px;
  border-top: 1px solid #2A2A2A;
  background: #0D0D0D;
}
.fm-sc-input {
  width: 100%;
  min-height: 80px;
  padding: 14px 18px;
  background: var(--fm-card);
  border: 1px solid var(--fm-border);
  border-radius: 12px;
  color: white;
  font-size: 15px;
  resize: vertical;
  outline: none;
  font-family: inherit;
  margin-bottom: 10px;
}
.fm-sc-input:focus { border-color: #E53935; }
.fm-sc-input::placeholder { color: #666; }

.fm-sc-send-btn {
  padding: 10px 28px;
  background: linear-gradient(135deg, #E53935, #FF6F00);
  color: white;
  border: none;
  border-radius: 10px;
  font-size: 15px;
  font-weight: 700;
  cursor: pointer;
  transition: all 0.2s;
}
.fm-sc-send-btn:hover { transform: translateY(-1px); box-shadow: 0 4px 12px rgba(229,57,53,0.4); }
.fm-sc-send-btn:disabled { opacity: 0.5; cursor: not-allowed; transform: none; }

@media (max-width: 768px) {
  .fm-sc-sidebar { width: 100%; position: absolute; z-index: 50; }
  .fm-sc-sidebar.collapsed { display: none; }
  .fm-sc-header { padding: 16px; }
  .fm-sc-input-area { padding: 12px 16px; }
  .fm-sc-messages { padding: 16px; }
}
</style>
