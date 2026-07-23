<template>
  <div id="app">
    <header class="topbar" v-if="$route.path !== '/login' && $route.path !== '/register'">
      <div class="topbar-inner">
        <!-- Logo -->
        <router-link to="/" class="logo">
          🎬 AI短剧
        </router-link>

        <!-- 导航菜单 -->
        <nav class="nav-menu">
          <router-link to="/" class="nav-item" active-class="active">首页</router-link>
          <router-link to="/projects" class="nav-item" active-class="active">我的作品</router-link>
          <router-link to="/payment" class="nav-item" active-class="active">充值中心</router-link>
          <router-link to="/media" class="nav-item" active-class="active">素材库</router-link>
          <a href="https://mzsh.top" class="nav-item" target="_blank">帮助中心</a>
        </nav>

        <!-- 右侧操作区 -->
        <div class="nav-right">
          <button v-if="!token" class="btn btn-secondary" @click="$router.push('/login')">登录</button>
          <button v-if="!token" class="btn btn-primary" @click="$router.push('/register')">注册</button>

          <template v-else>
            <!-- 算力 -->
            <div class="power-badge" :class="{ 'power-guest': !token }" @click="token ? null : $router.push('/login')">
              <span class="power-icon">⚡</span>
              <span v-if="token" class="power-value">{{ creditDisplay }}</span>
              <span v-else class="power-value">登录</span>
            </div>

            <!-- 用户头像下拉 -->
            <div class="user-dropdown" @click="showUserMenu = !showUserMenu" ref="userMenuRef">
              <div class="avatar" :style="{ background: avatarGradient }">{{ userInitial }}</div>
              <div class="dropdown-menu" v-if="showUserMenu" @click.stop>
                <div class="dropdown-user-info">
                  <div class="dropdown-avatar">{{ userInitial }}</div>
                  <div class="dropdown-user-detail">
                    <div class="dropdown-username">{{ username || '用户' }}</div>
                    <div class="dropdown-tier">{{ tierName }}</div>
                  </div>
                </div>
                <div class="dropdown-divider"></div>
                <div class="dropdown-item" @click="$router.push('/profile')">👤 个人中心</div>
                <div class="dropdown-divider"></div>
                <div class="dropdown-item danger" @click="logout">🔓 退出登录</div>
              </div>
            </div>
          </template>
        </div>
      </div>
    </header>

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
        const r = await fetch('/v2/balance/check', { headers: this.authHeaders() }).then(r => r.json())
        if (r.success) this.creditBalance = r.data.balance
      } catch (e) {}
    },
    async loadUserInfo() {
      try {
        if (!this.token) return
        const r = await fetch('/v2/auth/me', { headers: this.authHeaders() }).then(r => r.json())
        if (r.success) {
          this.username = r.data.username || ''
          this.userTier = r.data.tier || ''
          localStorage.setItem('username', this.username)
        }
      } catch (e) {}
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
* { margin: 0; padding: 0; box-sizing: border-box; }
body {
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
  background: #f5f7fa;
  color: #333;
}

/* ===== 顶部导航 ===== */
.topbar {
  background: white;
  box-shadow: 0 2px 4px rgba(0,0,0,0.1);
  position: sticky;
  top: 0;
  z-index: 100;
}
.topbar-inner {
  max-width: 1400px;
  margin: 0 auto;
  padding: 25px 30px;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.logo {
  font-size: 42px;
  font-weight: bold;
  color: #2563eb;
  text-decoration: none;
}

.nav-menu {
  display: flex;
  gap: 50px;
}

.nav-item {
  color: #475569;
  text-decoration: none;
  font-size: 24px;
  font-weight: 700;
  transition: color 0.2s;
  cursor: pointer;
}
.nav-item:hover { color: #2563eb; }
.nav-item.active { color: #2563eb; }

.nav-right {
  display: flex;
  gap: 25px;
  align-items: center;
}

.btn {
  padding: 18px 40px;
  border-radius: 12px;
  cursor: pointer;
  font-size: 22px;
  transition: all 0.2s;
}
.btn-primary { background: #2563eb; color: white; border: none; }
.btn-primary:hover { background: #1d4ed8; }
.btn-secondary { background: white; color: #2563eb; border: 1px solid #2563eb; }
.btn-secondary:hover { background: #eff6ff; }

.power-badge {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 10px 18px;
  border-radius: 20px;
  background: #f1f5f9;
  font-size: 16px;
  font-weight: 600;
  cursor: default;
}
.power-value { color: #1e293b; }

.avatar {
  width: 42px;
  height: 42px;
  border-radius: 50%;
  color: #fff;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 18px;
  font-weight: 700;
  cursor: pointer;
}

.dropdown-menu {
  position: absolute;
  top: 50px;
  right: 0;
  width: 220px;
  background: white;
  border: 1px solid #e2e8f0;
  border-radius: 12px;
  overflow: hidden;
  box-shadow: 0 8px 24px rgba(0,0,0,0.12);
  z-index: 200;
}

.dropdown-user-info {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 16px;
  background: #f8fafc;
}

.dropdown-avatar {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  background: linear-gradient(135deg, #2563eb, #7c3aed);
  color: #fff;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 16px;
  font-weight: 700;
}

.dropdown-user-detail { flex: 1; min-width: 0; }
.dropdown-username { font-size: 14px; font-weight: 600; color: #1e293b; }
.dropdown-tier { font-size: 12px; color: #64748b; margin-top: 2px; }

.dropdown-divider {
  height: 1px;
  background: #e2e8f0;
  margin: 0;
}

.dropdown-item {
  display: flex;
  align-items: center;
  padding: 10px 16px;
  font-size: 14px;
  color: #475569;
  cursor: pointer;
  transition: all 0.2s;
}
.dropdown-item:hover { background: #eff6ff; color: #2563eb; }
.dropdown-item.danger { color: #ef4444; }
.dropdown-item.danger:hover { background: #fef2f2; color: #dc2626; }

/* ===== 主内容区 ===== */
.main-content {
  max-width: 1400px;
  margin: 0 auto;
  padding: 60px 30px;
}

@media (max-width: 768px) {
  .topbar-inner { padding: 16px; }
  .logo { font-size: 28px; }
  .nav-menu { display: none; }
  .main-content { padding: 24px 16px; }
}
</style>
