<template>
  <div class="profile-page">
    <!-- 顶部用户信息卡片 -->
    <div class="profile-header">
      <div class="profile-avatar">
        <div class="avatar-circle">{{ userInitial }}</div>
        <div class="user-info">
          <div class="username">{{ username || '用户' }}</div>
          <div class="user-tier"><span class="tag" :class="tierTag">{{ tierName }}</span></div>
        </div>
      </div>
      <div class="profile-stats">
        <div class="stat-item">
          <div class="stat-value">{{ creditBalance }}</div>
          <div class="stat-label">算力余额</div>
        </div>
        <div class="stat-item">
          <div class="stat-value">{{ worksCount }}</div>
          <div class="stat-label">作品数</div>
        </div>
        <div class="stat-item">
          <div class="stat-value">{{ materialsCount }}</div>
          <div class="stat-label">素材数</div>
        </div>
      </div>
    </div>

    <!-- 功能网格 -->
    <div class="profile-grid">
      <!-- 我的作品 -->
      <div class="grid-card" @click="$router.push('/projects')">
        <div class="card-icon">🎬</div>
        <div class="card-title">我的作品</div>
        <div class="card-desc">查看所有短剧项目</div>
        <div class="card-arrow">→</div>
      </div>

      <!-- 素材库 -->
      <div class="grid-card" @click="$router.push('/media')">
        <div class="card-icon">🖼</div>
        <div class="card-title">素材库</div>
        <div class="card-desc">图片、音频、视频管理</div>
        <div class="card-arrow">→</div>
      </div>

      <!-- 钱包 -->
      <div class="grid-card" @click="$router.push('/membership')">
        <div class="card-icon">💰</div>
        <div class="card-title">钱包</div>
        <div class="card-desc">算力、会员、订单</div>
        <div class="card-arrow">→</div>
      </div>

      <!-- API Key -->
      <div class="grid-card" @click="$router.push('/api-keys')">
        <div class="card-icon">🔑</div>
        <div class="card-title">API Key</div>
        <div class="card-desc">配置第三方服务密钥</div>
        <div class="card-arrow">→</div>
      </div>

      <!-- 历史记录 -->
      <div class="grid-card" @click="$router.push('/history')">
        <div class="card-icon">📋</div>
        <div class="card-title">历史记录</div>
        <div class="card-desc">查看任务执行历史</div>
        <div class="card-arrow">→</div>
      </div>

      <!-- 安全设置 -->
      <div class="grid-card" @click="showChangePwd = true">
        <div class="card-icon">⚙️</div>
        <div class="card-title">安全设置</div>
        <div class="card-desc">修改密码、退出登录</div>
        <div class="card-arrow">→</div>
      </div>
    </div>

    <!-- 最近作品 -->
    <div class="recent-section">
      <div class="section-header">
        <span class="section-title">最近作品</span>
        <router-link to="/projects" class="view-all">查看全部 →</router-link>
      </div>
      <div class="recent-list">
        <div v-for="w in recentWorks" :key="w.id" class="recent-item" @click="$router.push('/track/'+w.id)">
          <div class="recent-thumb">🎬</div>
          <div class="recent-info">
            <div class="recent-name">{{ w.title || '未命名' }}</div>
            <div class="recent-meta">{{ w.createdAt || '--' }} · {{ w.statusText || '进行中' }}</div>
          </div>
          <div class="recent-status" :class="w.displayStatus">{{ w.statusText || '进行中' }}</div>
        </div>
        <div v-if="recentWorks.length === 0" class="empty-hint">暂无作品</div>
      </div>
    </div>

    <!-- 修改密码弹窗 -->
    <div class="modal-overlay" v-if="showChangePwd" @click.self="showChangePwd = false">
      <div class="modal-panel sm">
        <div class="modal-header">
          <span class="modal-title">修改密码</span>
          <button class="modal-close" @click="showChangePwd = false">✕</button>
        </div>
        <div class="modal-body">
          <div class="form-group">
            <label class="form-label">当前密码</label>
            <input class="input" type="password" v-model="pwdForm.old" placeholder="请输入当前密码" />
          </div>
          <div class="form-group">
            <label class="form-label">新密码</label>
            <input class="input" type="password" v-model="pwdForm.new1" placeholder="请输入新密码" />
          </div>
          <div class="form-group">
            <label class="form-label">确认密码</label>
            <input class="input" type="password" v-model="pwdForm.new2" placeholder="请再次输入新密码" />
          </div>
        </div>
        <div class="modal-footer">
          <button class="btn btn-ghost" @click="showChangePwd = false">取消</button>
          <button class="btn btn-primary" @click="changePassword">保存</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import axios from 'axios'

export default {
  name: 'ProfilePage',
  data() {
    return {
      token: '',
      username: '',
      userTier: '',
      creditBalance: 0,
      worksCount: 0,
      materialsCount: 0,
      dailyUsed: 0,
      dailyLimit: 3,
      analysisUsed: 0,
      analysisLimit: 2,
      recentWorks: [],
      showChangePwd: false,
      pwdForm: { old: '', new1: '', new2: '' },
    }
  },
  computed: {
    userInitial() {
      return (this.username || 'U').charAt(0).toUpperCase()
    },
    tierName() {
      return { pro: '专业会员', enterprise: '企业版' }[this.userTier] || '免费版'
    },
    tierTag() {
      return { pro: 'tag-blue', enterprise: 'tag-orange' }[this.userTier] || 'tag-muted'
    },
  },
  methods: {
    authHeaders() {
      return { 'Authorization': 'Bearer ' + this.token }
    },
    async loadData() {
      this.token = localStorage.getItem('token') || ''
      if (!this.token) return
      
      try {
        const r = await fetch('/api/v1/auth/me', { headers: this.authHeaders() }).then(r => r.json())
        if (r.success) {
          this.username = r.data.username || ''
          this.userTier = r.data.tier || ''
        }
      } catch (e) {}
      
      try {
        const r = await fetch('/api/v1/billing/balance', { headers: this.authHeaders() }).then(r => r.json())
        if (r.success) this.creditBalance = r.data?.balance || 0
      } catch (e) {}
      
      try {
        const r = await fetch('/api/v1/projects', { headers: this.authHeaders() }).then(r => r.json())
        if (r.success && r.projects) {
          this.worksCount = r.projects.length
          this.recentWorks = r.projects.slice(0, 5).map(p => ({
            id: p.id,
            title: p.title,
            createdAt: p.created ? new Date(p.created * 1000).toLocaleDateString('zh-CN') : '--',
            statusText: { active: '进行中', processing: '进行中', completed: '已完成', draft: '草稿' }[p.status] || p.status,
            displayStatus: p.status || 'active',
          }))
        }
      } catch (e) {}
    },
    async changePassword() {
      if (this.pwdForm.new1 !== this.pwdForm.new2) { alert('两次密码不一致'); return }
      try {
        await axios.post('/api/v1/auth/change-password', this.pwdForm, { headers: this.authHeaders() })
        alert('密码已修改')
        this.showChangePwd = false
      } catch (e) { alert('修改失败: ' + (e.message || e)) }
    },
    logout() {
      localStorage.removeItem('token')
      localStorage.removeItem('username')
      this.$router.push('/login')
    },
  },
  mounted() { this.loadData() },
}
</script>

<style scoped>
.profile-page {
  padding: 24px;
  max-width: 1200px;
  margin: 0 auto;
}

/* 顶部用户信息 */
.profile-header {
  background: var(--bg-surface);
  border: 1px solid var(--border-main);
  border-radius: var(--radius);
  padding: 24px;
  margin-bottom: 24px;
}

.profile-avatar {
  display: flex;
  align-items: center;
  gap: 16px;
  margin-bottom: 20px;
}

.avatar-circle {
  width: 64px;
  height: 64px;
  border-radius: 50%;
  background: var(--blue);
  color: #fff;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 28px;
  font-weight: 700;
  flex-shrink: 0;
}

.user-info {
  flex: 1;
}

.username {
  font-size: 20px;
  font-weight: 600;
  color: var(--text-primary);
  margin-bottom: 4px;
}

.profile-stats {
  display: flex;
  gap: 32px;
}

.stat-item {
  text-align: center;
}

.stat-value {
  font-size: 24px;
  font-weight: 700;
  color: var(--text-primary);
  margin-bottom: 4px;
}

.stat-label {
  font-size: 12px;
  color: var(--text-muted);
}

/* 功能网格 */
.profile-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
  gap: 16px;
  margin-bottom: 32px;
}

.grid-card {
  background: var(--bg-surface);
  border: 1px solid var(--border-main);
  border-radius: var(--radius);
  padding: 24px;
  cursor: pointer;
  transition: all 0.2s;
  position: relative;
}

.grid-card:hover {
  border-color: var(--blue);
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(41, 123, 255, 0.15);
}

.card-icon {
  font-size: 32px;
  margin-bottom: 12px;
}

.card-title {
  font-size: 16px;
  font-weight: 600;
  color: var(--text-primary);
  margin-bottom: 8px;
}

.card-desc {
  font-size: 12px;
  color: var(--text-muted);
  margin-bottom: 12px;
}

.card-arrow {
  position: absolute;
  top: 24px;
  right: 24px;
  font-size: 18px;
  color: var(--text-muted);
}

/* 最近作品 */
.recent-section {
  background: var(--bg-surface);
  border: 1px solid var(--border-main);
  border-radius: var(--radius);
  padding: 20px;
}

.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
}

.section-title {
  font-size: 16px;
  font-weight: 600;
  color: var(--text-primary);
}

.view-all {
  font-size: 13px;
  color: var(--blue);
  text-decoration: none;
}

.recent-list {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.recent-item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px;
  border-radius: var(--radius-sm);
  cursor: pointer;
  transition: background 0.2s;
}

.recent-item:hover {
  background: var(--bg-hover);
}

.recent-thumb {
  width: 40px;
  height: 40px;
  border-radius: var(--radius-sm);
  background: var(--bg-input);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 20px;
  flex-shrink: 0;
}

.recent-info {
  flex: 1;
  min-width: 0;
}

.recent-name {
  font-size: 14px;
  font-weight: 500;
  color: var(--text-primary);
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.recent-meta {
  font-size: 12px;
  color: var(--text-muted);
  margin-top: 2px;
}

.recent-status {
  font-size: 12px;
  padding: 2px 8px;
  border-radius: 12px;
  flex-shrink: 0;
}

.recent-status.completed {
  background: rgba(74, 222, 128, 0.1);
  color: #4ade80;
}

.recent-status.active, .recent-status.processing {
  background: rgba(41, 123, 255, 0.1);
  color: var(--blue);
}

.recent-status.draft {
  background: rgba(245, 158, 11, 0.1);
  color: #f59e0b;
}

.empty-hint {
  padding: 40px;
  text-align: center;
  color: var(--text-muted);
  font-size: 14px;
}

/* 弹窗 */
.modal-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.6);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
}

.modal-panel {
  background: var(--bg-surface);
  border: 1px solid var(--border-main);
  border-radius: var(--radius);
  width: 90%;
  max-width: 400px;
}

.modal-panel.sm {
  max-width: 400px;
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px 20px;
  border-bottom: 1px solid var(--border-main);
}

.modal-title {
  font-size: 16px;
  font-weight: 600;
  color: var(--text-primary);
}

.modal-close {
  background: none;
  border: none;
  font-size: 20px;
  color: var(--text-muted);
  cursor: pointer;
  padding: 4px;
}

.modal-body {
  padding: 20px;
}

.modal-footer {
  display: flex;
  justify-content: flex-end;
  gap: 8px;
  padding: 16px 20px;
  border-top: 1px solid var(--border-main);
}

.form-group {
  margin-bottom: 16px;
}

.form-group:last-child {
  margin-bottom: 0;
}

.form-label {
  display: block;
  font-size: 13px;
  color: var(--text-secondary);
  margin-bottom: 6px;
}

.input {
  width: 100%;
  padding: 10px 12px;
  background: var(--bg-input);
  border: 1px solid var(--border-main);
  border-radius: var(--radius-sm);
  color: var(--text-primary);
  font-size: 14px;
  outline: none;
  transition: border-color 0.2s;
}

.input:focus {
  border-color: var(--blue);
}

.btn {
  padding: 8px 16px;
  border-radius: var(--radius-sm);
  font-size: 14px;
  cursor: pointer;
  transition: all 0.2s;
  border: none;
  font-weight: 500;
}

.btn-primary {
  background: var(--blue);
  color: #fff;
}

.btn-primary:hover {
  opacity: 0.9;
}

.btn-ghost {
  background: transparent;
  color: var(--text-secondary);
  border: 1px solid var(--border-main);
}

.btn-ghost:hover {
  background: var(--bg-hover);
}

.btn-sm {
  padding: 6px 12px;
  font-size: 12px;
}

.tag {
  display: inline-block;
  padding: 2px 8px;
  border-radius: 12px;
  font-size: 11px;
  font-weight: 500;
}

.tag-blue {
  background: rgba(41, 123, 255, 0.1);
  color: var(--blue);
}

.tag-orange {
  background: rgba(245, 158, 11, 0.1);
  color: #f59e0b;
}

.tag-muted {
  background: var(--bg-input);
  color: var(--text-muted);
}

.tag-green {
  background: rgba(74, 222, 128, 0.1);
  color: #4ade80;
}

@media (max-width: 768px) {
  .profile-page {
    padding: 16px;
  }
  
  .profile-grid {
    grid-template-columns: repeat(2, 1fr);
  }
  
  .profile-stats {
    gap: 16px;
  }
  
  .stat-value {
    font-size: 20px;
  }
}
</style>
