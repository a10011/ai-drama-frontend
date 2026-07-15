<template>
  <div id="app">
    <!-- 顶部导航栏（登录/注册页不显示） -->
    <header class="topbar" v-if="$route.path !== '/login' && $route.path !== '/register'">
      <div class="topbar-inner">
        <!-- 左侧 Logo -->
        <router-link to="/" class="logo">智剧AI</router-link>

        <!-- 中部菜单 -->
        <nav class="nav-center">
          <router-link to="/" class="nav-item" exact-active-class="active">文件</router-link>
          <router-link to="/media" class="nav-item" exact-active-class="active">素材库</router-link>
          <router-link to="/create/pro" class="nav-item" exact-active-class="active">分镜编辑</router-link>
        </nav>

        <!-- 右侧区域 -->
        <div class="nav-right">
          <!-- 项目标题 -->
          <div class="project-title" v-if="projectName">
            项目名称：{{ projectName }}
          </div>

          <!-- 会员标签 -->
          <div class="member-badge" :class="{ 'member-pro': userTier === 'pro' || userTier === 'enterprise' }">
            {{ userTier === 'enterprise' ? '企业版' : (userTier === 'pro' ? '专业会员' : '免费版') }}
          </div>

          <!-- 算力胶囊 -->
          <div class="power-badge" :class="{ 'power-guest': !token }">
            <span class="power-icon">⚡</span>
            <span v-if="token">
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
      projectName: '',
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
          this.projectName = r.data.current_project || '都市复仇短剧第 01 集'
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
/* ===== CSS 变量（UI 规范） ===== */
:root {
  --bg-primary: #14161F;
  --bg-card: #1D202C;
  --bg-input: #1D202C;
  --border: rgba(255,255,255,0.08);
  --border-focus: rgba(41,123,255,0.5);
  --accent: #297BFF;
  --accent-glow: rgba(41,123,255,0.25);
  --text-primary: #E6E8EC;
  --text-secondary: #B1B5C3;
  --text-muted: #86909C;
  --success: #4ADE80;
  --danger: #EF4444;
  --warning: #F59E0B;
  --radius: 8px;
  --radius-sm: 6px;
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
  background: #14161F;
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
  gap: 24px;
}

.logo {
  font-size: 16px;
  font-weight: 600;
  color: var(--text-primary);
  text-decoration: none;
  flex-shrink: 0;
}

.nav-center {
  display: flex;
  align-items: center;
  gap: 0;
  margin-left: 0;
  flex: 1;
}

.nav-item {
  padding: 0 16px;
  height: 56px;
  display: flex;
  align-items: center;
  font-size: 16px;
  font-weight: 500;
  color: var(--text-secondary);
  text-decoration: none;
  position: relative;
  transition: var(--transition);
}

.nav-item:hover {
  color: var(--text-primary);
}

.nav-item.active {
  color: #FFFFFF;
}

.nav-item.active::after {
  content: '';
  position: absolute;
  bottom: 0;
  left: 50%;
  transform: translateX(-50%);
  width: 100%;
  height: 2px;
  background: var(--accent);
}

.nav-right {
  display: flex;
  align-items: center;
  gap: 16px;
  flex-shrink: 0;
}

/* 项目标题 */
.project-title {
  font-size: 15px;
  font-weight: 400;
  color: var(--text-secondary);
  white-space: nowrap;
}

/* 会员标签 */
.member-badge {
  padding: 4px 12px;
  border-radius: 4px;
  font-size: 14px;
  font-weight: 600;
  background: rgba(41,123,255,0.1);
  color: var(--text-muted);
  border: 1px solid var(--border);
}

.member-badge.member-pro {
  background: rgba(41,123,255,0.15);
  color: var(--accent);
  border-color: rgba(41,123,255,0.3);
}

/* 算力胶囊 */
.power-badge {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 6px 14px;
  border-radius: var(--radius);
  background: var(--bg-card);
  border: 1px solid var(--border);
  position: relative;
  font-size: 14px;
  color: var(--text-secondary);
}

.power-icon {
  font-size: 14px;
}

.power-value {
  color: var(--text-primary);
  font-weight: 500;
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
  border-radius: var(--radius-sm);
  transition: var(--transition);
}

.notify-bell:hover {
  background: rgba(41,123,255,0.08);
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
  border: 2px solid var(--bg-primary);
}

/* 通知弹窗 */
.notifications-panel {
  position: absolute;
  top: 40px;
  right: -8px;
  width: 300px;
  background: var(--bg-card);
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
  background: var(--bg-card);
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
  background: rgba(41,123,255,0.1);
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
  margin: 0 auto;
  padding: 16px 24px;
  min-height: calc(100vh - 56px);
}
</style>
