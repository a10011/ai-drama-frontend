<template>
  <div class="fm-app">
    <!-- 顶部导航 -->
    <header class="fm-topbar" v-if="$route.path !== '/login' && $route.path !== '/register'">
      <div class="fm-topbar-inner">
        <router-link to="/" class="fm-logo">
          <span class="fm-logo-icon">🎬</span>
          <span class="fm-logo-text">AI面剧场</span>
        </router-link>

        <nav class="fm-nav">
          <router-link to="/mode" class="fm-nav-item">短剧工作台</router-link>
          <router-link to="/script-chat" class="fm-nav-item">写剧本</router-link>
          <router-link to="/create/ad" class="fm-nav-item">广告片</router-link>
          <router-link to="/create/promo" class="fm-nav-item">宣传片</router-link>
          <router-link to="/projects" class="fm-nav-item">我的作品</router-link>
          <router-link to="/media" class="fm-nav-item">素材库</router-link>
        </nav>

        <div class="fm-user-area">
          <div v-if="!token" class="fm-auth-buttons">
            <button class="fm-btn fm-btn-ghost" @click="$router.push('/login')">登录</button>
            <button class="fm-btn fm-btn-primary" @click="$router.push('/register')">注册</button>
          </div>
          <div v-else class="fm-user-dropdown">
            <div class="fm-avatar">{{ userInitial }}</div>
            <div class="fm-user-info">
              <div class="fm-username">{{ username }}</div>
              <div class="fm-tier">{{ tierName }}</div>
            </div>
            <button class="fm-btn fm-btn-ghost fm-btn-sm" @click="logout">退出</button>
          </div>
        </div>
      </div>
    </header>

    <main class="fm-main">
      <router-view />
    </main>
  </div>
</template>

<script>
export default {
  data() {
    return {
      token: localStorage.getItem('token') || '',
      username: localStorage.getItem('username') || '',
      tier: localStorage.getItem('tier') || '免费版',
    }
  },
  computed: {
    userInitial() {
      return (this.username || 'U').charAt(0).toUpperCase()
    },
    tierName() {
      return this.tier || '免费版'
    }
  },
  methods: {
    logout() {
      localStorage.removeItem('token')
      localStorage.removeItem('username')
      this.token = ''
      this.username = ''
      this.$router.push('/login')
    }
  }
}
</script>

<style scoped>
.fm-app {
  min-height: 100vh;
  background: #0A0A0A;
  color: #FFFFFF;
}

/* 顶部导航 */
.fm-topbar {
  position: sticky;
  top: 0;
  z-index: 100;
  background: rgba(10,10,10,0.95);
  border-bottom: 1px solid #2A2A2A;
  backdrop-filter: blur(20px);
}
.fm-topbar-inner {
  max-width: 1400px;
  margin: 0 auto;
  padding: 0 24px;
  height: 60px;
  display: flex;
  align-items: center;
  gap: 24px;
}

.fm-logo {
  display: flex;
  align-items: center;
  gap: 8px;
  text-decoration: none;
  color: white;
  flex-shrink: 0;
}
.fm-logo-icon { font-size: 24px; }
.fm-logo-text {
  font-size: 18px;
  font-weight: 800;
  background: linear-gradient(90deg, #E53935, #FFD600);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
}

.fm-nav {
  display: flex;
  gap: 4px;
  flex: 1;
}
.fm-nav-item {
  color: #9E9E9E;
  text-decoration: none;
  padding: 8px 14px;
  border-radius: 8px;
  font-size: 14px;
  transition: all 0.2s;
}
.fm-nav-item:hover, .fm-nav-item.active {
  color: white;
  background: rgba(229,57,53,0.15);
}

.fm-user-area {
  display: flex;
  align-items: center;
  gap: 12px;
}
.fm-auth-buttons {
  display: flex;
  gap: 8px;
}
.fm-avatar {
  width: 36px;
  height: 36px;
  border-radius: 50%;
  background: linear-gradient(135deg, #E53935, #FF6F00);
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 700;
  font-size: 14px;
}
.fm-user-info {
  display: flex;
  flex-direction: column;
}
.fm-username { font-size: 14px; font-weight: 600; }
.fm-tier { font-size: 12px; color: #9E9E9E; }

/* 按钮 */
.fm-btn {
  padding: 8px 16px;
  border-radius: 8px;
  font-size: 14px;
  font-weight: 600;
  transition: all 0.2s;
}
.fm-btn-primary {
  background: linear-gradient(135deg, #E53935, #FF6F00);
  color: white;
  border: none;
}
.fm-btn-primary:hover { transform: translateY(-1px); box-shadow: 0 4px 12px rgba(229,57,53,0.4); }
.fm-btn-ghost {
  background: transparent;
  color: #9E9E9E;
  border: 1px solid #2A2A2A;
}
.fm-btn-ghost:hover { color: white; border-color: #555; }
.fm-btn-sm { padding: 6px 12px; font-size: 13px; }

/* 主内容区 */
.fm-main {
  min-height: calc(100vh - 60px);
  padding-top: 60px;
}

@media (max-width: 768px) {
  .fm-topbar-inner { padding: 0 16px; gap: 12px; }
  .fm-nav { display: none; }
}
</style>
