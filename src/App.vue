<template>
  <div id="app">
    <!-- 顶部导航栏 -->
    <header class="topbar" v-if="$route.path !== '/login' && $route.path !== '/register'">
      <div class="topbar-inner">
        <!-- 左侧 Logo -->
        <router-link to="/" class="logo">
          <span class="logo-icon">🎬</span>
          <span class="logo-text">智剧AI</span>
        </router-link>

        <!-- 中部菜单 -->
        <nav class="nav-center">
          <router-link to="/" class="nav-item" exact-active-class="active">
            <svg class="nav-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>
            工作台
          </router-link>
          <router-link to="/create" class="nav-item" exact-active-class="active">
            <svg class="nav-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polygon points="12 2 2 7 12 12 22 7 12 2"/><polyline points="2 17 12 22 22 17"/><polyline points="2 12 12 17 22 12"/></svg>
            创作
          </router-link>
          <router-link to="/projects" class="nav-item" exact-active-class="active">
            <svg class="nav-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="2" y="3" width="20" height="14" rx="2" ry="2"/><line x1="8" y1="21" x2="16" y2="21"/><line x1="12" y1="17" x2="12" y2="21"/></svg>
            作品
          </router-link>
          <router-link to="/media" class="nav-item" exact-active-class="active">
            <svg class="nav-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21 15 16 10 5 21"/></svg>
            素材库
          </router-link>
          <router-link to="/market" class="nav-item" exact-active-class="active">
            <svg class="nav-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/></svg>
            灵感
          </router-link>
        </nav>

        <!-- 右侧区域 -->
        <div class="nav-right">
          <!-- 会员标签 -->
          <div class="member-badge" :class="{ 'member-pro': userTier === 'pro' || userTier === 'enterprise' }">
            {{ userTier === 'enterprise' ? '企业版' : (userTier === 'pro' ? '专业会员' : '免费版') }}
          </div>

          <!-- 算力胶囊 -->
          <div class="power-badge" :class="{ 'power-guest': !token }" @click="token ? null : $router.push('/login')">
            <span class="power-icon">⚡</span>
            <span v-if="token" class="power-value">{{ creditDisplay }}</span>
            <span v-else class="power-value">登录</span>
          </div>

          <!-- 通知铃铛 -->
          <div class="notify-bell" @click="showNotifications = !showNotifications">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 0 1-3.46 0"/></svg>
            <span class="bell-dot" v-if="hasUnread"></span>
            <div class="notifications-panel" v-if="showNotifications" @click.stop>
              <div class="notif-header">通知</div>
              <div class="notif-empty">暂无新通知</div>
            </div>
          </div>

          <!-- 用户头像 -->
          <div class="user-dropdown" @click="showUserMenu = !showUserMenu" ref="userMenuRef">
            <div class="avatar" :style="{ background: avatarGradient }">{{ userInitial }}</div>
            <div class="dropdown-menu" v-if="showUserMenu">
              <div class="dropdown-user-info">
                <div class="dropdown-avatar">{{ userInitial }}</div>
                <div class="dropdown-user-detail">
                  <div class="dropdown-username">{{ username || '用户' }}</div>
                  <div class="dropdown-tier">{{ tierName }}</div>
                </div>
              </div>
              <div class="dropdown-divider"></div>
              <div class="dropdown-item" @click="$router.push('/profile')">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="margin-right:8px"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"/></svg>
                个人中心
              </div>
              <div class="dropdown-item" @click="$router.push('/membership')">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="margin-right:8px"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
                会员中心
              </div>
              <div class="dropdown-divider"></div>
              <div class="dropdown-item danger" @click="logout">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="margin-right:8px"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/></svg>
                退出登录
              </div>
            </div>
          </div>
        </div>
      </div>
    </header>

    <!-- 主内容区 -->
    <main class="main-content">
      <router-view />
    </main>
  </div>
</template>

<script>
export default {
  data() {
    return {
      creditBalance: 0,
      userTier: '',
      username: '',
      projectName: '',
      token: '',
      showUserMenu: false,
      showNotifications: false,
      hasUnread: false,
    }
  },
  computed: {
    creditDisplay() {
      if (!this.token) return '—'
      return this.creditBalance
    },
    userInitial() {
      const name = this.username || localStorage.getItem('username') || 'U'
      return name.charAt(0).toUpperCase()
    },
    tierName() {
      return { pro: '专业会员', enterprise: '企业版' }[this.userTier] || '免费版'
    },
    avatarGradient() {
      const gradients = [
        'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
        'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)',
        'linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)',
        'linear-gradient(135deg, #fa709a 0%, #fee140 100%)',
        'linear-gradient(135deg, #a18cd1 0%, #fbc2eb 100%)',
      ]
      const hash = (this.username || 'U').split('').reduce((a, b) => a + b.charCodeAt(0), 0)
      return gradients[hash % gradients.length]
    }
  },
  methods: {
    authHeaders() {
      return { 'Authorization': 'Bearer ' + this.token }
    },
    async loadBalance() {
      try {
        if (!this.token) return
        const r = await fetch('/api/v1/billing/balance', {
          headers: this.authHeaders()
        }).then(r => r.json())
        if (r.success) this.creditBalance = r.data.balance
      } catch (e) { /* silent */ }
    },
    async loadUserInfo() {
      try {
        if (!this.token) return
        const r = await fetch('/api/v1/auth/me', {
          headers: this.authHeaders()
        }).then(r => r.json())
        if (r.success) {
          this.username = r.data.username || ''
          this.userTier = r.data.tier || ''
          this.projectName = r.data.current_project || ''
          localStorage.setItem('username', this.username)
        }
      } catch (e) { /* silent */ }
    },
    logout() {
      localStorage.removeItem('token')
      localStorage.removeItem('username')
      this.token = ''
      this.username = ''
      this.creditBalance = 0
      this.$router.push('/login')
      this.showUserMenu = false
    },
    handleClickOutside(e) {
      if (this.$refs.userMenuRef && !this.$refs.userMenuRef.contains(e.target)) {
        this.showUserMenu = false
      }
    }
  },
  mounted() {
    this.token = localStorage.getItem('token') || ''
    if (this.token) {
      this.loadBalance()
      this.loadUserInfo()
    }
    document.addEventListener('click', this.handleClickOutside)
  },
  beforeUnmount() {
    document.removeEventListener('click', this.handleClickOutside)
  }
}
</script>

<style>
/* ===== CSS 变量 ===== */
:root {
  --bg-primary: #0a0a0f;
  --bg-surface: #12121a;
  --bg-card: #1a1a2e;
  --bg-input: #16162a;
  --bg-hover: rgba(255,255,255,0.04);
  --bg-active: rgba(255,255,255,0.08);
  --border: rgba(255,255,255,0.06);
  --border-light: rgba(255,255,255,0.1);
  --border-focus: rgba(99,102,241,0.5);
  --accent: #6366f1;
  --accent-light: #818cf8;
  --accent-glow: rgba(99,102,241,0.3);
  --accent-gradient: linear-gradient(135deg, #6366f1, #8b5cf6);
  --gold: #c49b4a;
  --gold-gradient: linear-gradient(135deg, #c49b4a, #d4b35a);
  --text-primary: #f0f0f5;
  --text-secondary: #a0a0b8;
  --text-muted: #6b6b80;
  --success: #34d399;
  --danger: #f87171;
  --warning: #fbbf24;
  --radius: 12px;
  --radius-sm: 8px;
  --radius-lg: 16px;
  --shadow-sm: 0 2px 8px rgba(0,0,0,0.3);
  --shadow-md: 0 4px 16px rgba(0,0,0,0.4);
  --shadow-lg: 0 8px 32px rgba(0,0,0,0.5);
  --glow-accent: 0 0 20px rgba(99,102,241,0.3);
  --glow-gold: 0 0 20px rgba(196,155,74,0.3);
  --transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
}

* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

body {
  background: var(--bg-primary);
  color: var(--text-primary);
  font-family: 'Inter', 'Noto Sans SC', -apple-system, sans-serif;
  line-height: 1.6;
  -webkit-font-smoothing: antialiased;
}

/* ===== 顶部导航栏 ===== */
.topbar {
  height: 60px;
  background: rgba(10,10,15,0.85);
  backdrop-filter: blur(20px);
  -webkit-backdrop-filter: blur(20px);
  border-bottom: 1px solid var(--border);
  position: sticky;
  top: 0;
  z-index: 100;
}

.topbar-inner {
  height: 100%;
  display: flex;
  align-items: center;
  padding: 0 24px;
  gap: 32px;
  max-width: 1440px;
  margin: 0 auto;
}

.logo {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 18px;
  font-weight: 700;
  color: var(--text-primary);
  text-decoration: none;
  flex-shrink: 0;
  transition: var(--transition);
}

.logo:hover {
  color: var(--accent-light);
}

.logo-icon {
  font-size: 22px;
}

.nav-center {
  display: flex;
  align-items: center;
  gap: 4px;
  flex: 1;
}

.nav-item {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 8px 14px;
  height: auto;
  font-size: 14px;
  font-weight: 500;
  color: var(--text-secondary);
  text-decoration: none;
  border-radius: var(--radius-sm);
  transition: var(--transition);
  white-space: nowrap;
}

.nav-item:hover {
  color: var(--text-primary);
  background: var(--bg-hover);
}

.nav-item.active {
  color: var(--accent-light);
  background: rgba(99,102,241,0.1);
}

.nav-icon {
  width: 16px;
  height: 16px;
}

.nav-right {
  display: flex;
  align-items: center;
  gap: 12px;
  flex-shrink: 0;
}

/* 会员标签 */
.member-badge {
  padding: 4px 12px;
  border-radius: 20px;
  font-size: 12px;
  font-weight: 600;
  background: rgba(255,255,255,0.05);
  color: var(--text-muted);
  border: 1px solid var(--border);
}

.member-badge.member-pro {
  background: rgba(196,155,74,0.1);
  color: var(--gold);
  border-color: rgba(196,155,74,0.3);
}

/* 算力胶囊 */
.power-badge {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 6px 14px;
  border-radius: 20px;
  background: var(--bg-card);
  border: 1px solid var(--border);
  font-size: 13px;
  color: var(--text-secondary);
  cursor: default;
  transition: var(--transition);
}

.power-badge:hover {
  border-color: var(--accent);
  box-shadow: var(--glow-accent);
}

.power-badge.power-guest {
  cursor: pointer;
}

.power-icon {
  font-size: 14px;
}

.power-value {
  color: var(--text-primary);
  font-weight: 600;
}

/* 通知铃铛 */
.notify-bell {
  position: relative;
  cursor: pointer;
  padding: 6px;
  width: 36px;
  height: 36px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: var(--radius-sm);
  transition: var(--transition);
  color: var(--text-secondary);
}

.notify-bell:hover {
  background: var(--bg-hover);
  color: var(--text-primary);
}

.bell-dot {
  position: absolute;
  top: 4px;
  right: 4px;
  width: 8px;
  height: 8px;
  background: var(--danger);
  border-radius: 50%;
  border: 2px solid var(--bg-primary);
}

/* 通知弹窗 */
.notifications-panel {
  position: absolute;
  top: 44px;
  right: 0;
  width: 300px;
  background: var(--bg-surface);
  border: 1px solid var(--border);
  border-radius: var(--radius);
  overflow: hidden;
  box-shadow: var(--shadow-lg);
  z-index: 200;
}

.notif-header {
  padding: 12px 16px;
  font-size: 14px;
  font-weight: 600;
  border-bottom: 1px solid var(--border);
  color: var(--text-primary);
}

.notif-empty {
  padding: 32px 16px;
  text-align: center;
  color: var(--text-muted);
  font-size: 13px;
}

/* 用户头像 */
.user-dropdown {
  position: relative;
  cursor: pointer;
}

.avatar {
  width: 36px;
  height: 36px;
  border-radius: 50%;
  color: #fff;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 14px;
  font-weight: 700;
  transition: var(--transition);
  border: 2px solid transparent;
}

.avatar:hover {
  border-color: var(--accent);
  box-shadow: var(--glow-accent);
  transform: scale(1.05);
}

.dropdown-menu {
  position: absolute;
  top: 48px;
  right: 0;
  width: 240px;
  background: var(--bg-surface);
  border: 1px solid var(--border);
  border-radius: var(--radius);
  overflow: hidden;
  box-shadow: var(--shadow-lg);
  z-index: 200;
}

.dropdown-user-info {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 16px;
  background: var(--bg-hover);
}

.dropdown-avatar {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  background: var(--accent-gradient);
  color: #fff;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 16px;
  font-weight: 700;
  flex-shrink: 0;
}

.dropdown-user-detail {
  flex: 1;
  min-width: 0;
}

.dropdown-username {
  font-size: 14px;
  font-weight: 600;
  color: var(--text-primary);
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.dropdown-tier {
  font-size: 11px;
  color: var(--text-muted);
  margin-top: 2px;
}

.dropdown-divider {
  height: 1px;
  background: var(--border);
  margin: 0;
}

.dropdown-item {
  display: flex;
  align-items: center;
  padding: 10px 16px;
  font-size: 13px;
  color: var(--text-secondary);
  cursor: pointer;
  transition: var(--transition);
}

.dropdown-item:hover {
  background: var(--bg-hover);
  color: var(--text-primary);
}

.dropdown-item.danger {
  color: var(--danger);
  border-top: 1px solid var(--border);
}

.dropdown-item.danger:hover {
  background: rgba(248,113,113,0.1);
  color: #fca5a5;
}

/* ===== 主内容区 ===== */
.main-content {
  max-width: 1440px;
  margin: 0 auto;
  padding: 24px;
  min-height: calc(100vh - 60px);
}

@media (max-width: 768px) {
  .topbar-inner {
    padding: 0 16px;
    gap: 16px;
  }
  .nav-center {
    display: none;
  }
  .main-content {
    padding: 16px;
  }
}
</style>
