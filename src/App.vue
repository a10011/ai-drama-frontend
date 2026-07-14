<template>
  <div id="app">
    <!-- 顶部导航栏（登录/注册页不显示） -->
    <header class="topbar" v-if="$route.path !== '/login' && $route.path !== '/register'">
      <div class="topbar-inner">
        <!-- 左侧 Logo -->
        <router-link to="/" class="logo">智剧AI</router-link>

        <!-- 中部菜单 -->
        <nav class="nav-center">
          <router-link to="/" class="nav-item" exact-active-class="active">首页</router-link>
          <router-link to="/create" class="nav-item" active-class="active">创作工作台</router-link>
          <router-link to="/media" class="nav-item">素材库</router-link>
          <router-link to="/market" class="nav-item">灵感社区</router-link>
        </nav>

        <!-- 右侧区域 -->
        <div class="nav-right">
          <!-- 算力胶囊 -->
          <div class="power-badge" :class="{ 'power-guest': !token }">
            <span class="power-icon">👑</span>
            <span v-if="token">
              <span class="power-label">{{ userTier || 'Pro' }}</span>
              <span class="power-divider">|</span>
              <span class="power-value">剩余 {{ creditDisplay }} 算力</span>
            </span>
            <span v-else class="power-value">点击登录</span>
          </div>

          <!-- 通知铃铛 -->
          <div class="notify-bell" @click="showNotifications = !showNotifications">
            <span class="bell-icon">🔔</span>
            <span class="bell-dot" v-if="hasUnread"></span>
            <!-- 通知弹窗 -->
            <div class="notifications-panel" v-if="showNotifications" @click.stop>
              <div class="notif-header">通知</div>
              <div class="notif-empty">暂无新通知</div>
            </div>
          </div>

          <!-- 用户下拉 -->
          <div class="user-dropdown" @click="showUserMenu = !showUserMenu" ref="userMenuRef">
            <div class="avatar">{{ userInitial }}</div>
            <div class="dropdown-menu" v-if="showUserMenu">
              <div class="dropdown-item" @click="$router.push('/profile')">个人中心</div>
              <div class="dropdown-item" @click="$router.push('/profile')">账号设置</div>
              <div class="dropdown-divider"></div>
              <div class="dropdown-item danger" @click="logout">退出登录</div>
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
      token: '',
      showUserMenu: false,
      showNotifications: false,
      hasUnread: true,
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
  --bg-primary: #0a0a0a;
  --bg-card: #141414;
  --bg-input: #1a1a1a;
  --border: rgba(196,155,74,.12);
  --border-focus: rgba(196,155,74,.5);
  --accent: #c49b4a;
  --accent-glow: rgba(196,155,74,0.25);
  --highlight: #c49b4a;
  --text-primary: #e8e4dc;
  --text-secondary: #888888;
  --text-muted: #666666;
  --success: #4ade80;
  --danger: #ef4444;
  --warning: #f59e0b;
  --radius: 12px;
  --radius-sm: 8px;
  --transition: all 0.2s ease;
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
  height: 56px;
  background: #0d0d0d;
  border-bottom: 1px solid var(--border);
  position: sticky;
  top: 0;
  z-index: 100;
  backdrop-filter: blur(12px);
}

.topbar-inner {
  max-width: 1200px;
  margin: 0 auto;
  height: 100%;
  display: flex;
  align-items: center;
  padding: 0 32px;
}

.logo {
  font-size: 18px;
  font-weight: 700;
  letter-spacing: 2px;
  color: var(--highlight);
  text-decoration: none;
  flex-shrink: 0;
}

.nav-center {
  display: flex;
  align-items: center;
  gap: 4px;
  margin-left: 48px;
  flex: 1;
}

.nav-item {
  padding: 8px 16px;
  font-size: 14px;
  font-weight: 500;
  color: var(--text-secondary);
  text-decoration: none;
  border-radius: 8px;
  position: relative;
  transition: var(--transition);
}

.nav-item:hover {
  color: var(--text-primary);
}

.nav-item.active {
  color: var(--highlight);
}

.nav-item.active::after {
  content: '';
  position: absolute;
  bottom: -1px;
  left: 50%;
  transform: translateX(-50%);
  width: 24px;
  height: 2px;
  background: var(--highlight);
  border-radius: 1px;
}

.nav-right {
  display: flex;
  align-items: center;
  gap: 16px;
  flex-shrink: 0;
}

/* 算力胶囊 */
.power-badge {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 6px 14px;
  border-radius: 20px;
  background: rgba(30, 30, 46, 0.6);
  border: 1px solid rgba(196, 155, 74, 0.25);
  position: relative;
  font-size: 12px;
  color: var(--text-secondary);
}

.power-icon {
  font-size: 14px;
}

.power-label {
  color: var(--accent);
  font-weight: 700;
  font-size: 12px;
  text-transform: capitalize;
}

.power-divider {
  color: var(--text-muted);
}

.power-value {
  color: var(--text-primary);
  font-weight: 500;
}

/* 通知弹窗 */
.notifications-panel {
  position: absolute;
  top: 40px;
  right: -8px;
  width: 300px;
  background: #141414;
  border: 1px solid var(--border);
  border-radius: var(--radius);
  overflow: hidden;
  box-shadow: 0 8px 32px rgba(0,0,0,0.4);
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

.power-guest {
  cursor: pointer;
}

.power-guest:hover {
  border-color: var(--accent);
}

/* 通知铃铛 */
.notify-bell {
  position: relative;
  cursor: pointer;
  padding: 4px;
  width: 32px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 8px;
  transition: var(--transition);
}

.notify-bell:hover {
  background: rgba(196, 155, 74, 0.08);
}

.bell-icon {
  font-size: 18px;
}

.bell-dot {
  position: absolute;
  top: 4px;
  right: 4px;
  width: 8px;
  height: 8px;
  background: var(--danger);
  border-radius: 50%;
  border: 2px solid #0d0d0d;
}

/* 用户下拉 */
.user-dropdown {
  position: relative;
  cursor: pointer;
}

.avatar {
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
  transition: var(--transition);
}

.avatar:hover {
  box-shadow: 0 0 12px var(--accent-glow);
}

.dropdown-menu {
  position: absolute;
  top: 40px;
  right: 0;
  width: 180px;
  background: #141414;
  border: 1px solid var(--border);
  border-radius: var(--radius);
  overflow: hidden;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.4);
  z-index: 200;
}

.dropdown-item {
  padding: 12px 16px;
  font-size: 13px;
  color: var(--text-primary);
  cursor: pointer;
  transition: var(--transition);
}

.dropdown-item:hover {
  background: rgba(196, 155, 74, 0.1);
  color: var(--accent);
}

.dropdown-item.danger {
  color: var(--danger);
}

.dropdown-item.danger:hover {
  background: rgba(239, 68, 68, 0.1);
}

.dropdown-divider {
  height: 1px;
  background: var(--border);
  margin: 0;
}

/* ===== 主内容区 ===== */
.main-content {
  max-width: 1200px;
  margin: 0 auto;
  padding: 24px 32px;
  min-height: calc(100vh - 56px);
}
</style>
