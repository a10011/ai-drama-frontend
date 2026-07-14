<template>
  <div class="login-page">
    <div class="login-card">
      <div class="login-brand">
        <svg width="22" height="22" viewBox="0 0 24 24">
          <rect x="2" y="2" width="20" height="20" rx="3" fill="var(--accent)"/>
          <path d="M7 8h10v2H7zm0 4h8v2H7zm0 4h6v2H7z" fill="#fff"/>
        </svg>
        <span>短剧创作工作台</span>
      </div>
      <div class="login-sub">批量生成短剧 / 带货 / 宣传片，一键解析爆款镜头</div>

      <div class="login-error" v-if="error"><span>⚠</span> {{ error }}</div>

      <div class="login-form">
        <div class="field">
          <input v-model="username" type="text" placeholder="用户名"
            @input="err=''" autocomplete="username" />
        </div>
        <div class="field">
          <div class="pwd-wrap">
            <input v-model="password" :type="showPwd?'text':'password'" placeholder="密码"
              @input="err=''" autocomplete="current-password" />
            <span class="pwd-eye" @click="showPwd=!showPwd">{{ showPwd?'🙈':'👁' }}</span>
          </div>
        </div>

        <button class="login-btn" @click="doLogin" :disabled="logging">
          {{ logging ? '登录中...' : '登录 / 自动注册' }}
        </button>

        <button class="guest-btn" @click="enterAsGuest">👁 先看看</button>

        <div class="login-foot">
          未注册账号将自动创建
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import axios from 'axios'

export default {
  name: 'LoginPage',
  data() {
    return {
      username: '', password: '', showPwd: false,
      error: '', logging: false,
      showGuestModal: false,
    }
  },
  methods: {
    async doLogin() {
      if (!this.username.trim()) { this.error = '请输入用户名'; return }
      this.error = ''; this.logging = true
      try {
        const resp = await axios.post('/api/login', {
          username: this.username.trim(), password: this.password,
        }, { timeout: 15000 })
        const data = resp.data
        const token = data.token || data.data?.token || data.access_token
        if (token) {
          localStorage.setItem('token', token)
          this.$router.push('/')
        } else {
          this.error = data.error || data.message || '登录失败'
        }
      } catch (err) {
        const resp = err.response?.data
        if (resp?.error || resp?.message) this.error = resp.error || resp.message
        else if (err.code === 'ECONNABORTED') this.error = '请求超时'
        else if (err.response?.status === 401) this.error = '用户名或密码错误'
        else this.error = '网络异常，请重试'
      } finally { this.logging = false }
    },
    enterAsGuest() {
      localStorage.setItem('guest_token', 'guest_' + Date.now())
      this.$router.push('/')
    },
  },
}
</script>

<style scoped>
.login-page {
  display: flex; align-items: center; justify-content: center;
  min-height: 100vh;
  background: var(--bg-deep);
}
.login-card {
  width: 360px; max-width: 90vw;
  padding: 36px 32px 28px;
  background: var(--bg-surface);
  border: 1px solid var(--border-main);
  border-radius: var(--radius);
}
.login-brand {
  display: flex; align-items: center; gap: 8px;
  font-size: 16px; font-weight: 700;
  margin-bottom: 4px;
}
.login-sub {
  font-size: 12px; color: var(--text-muted);
  margin-bottom: 24px; line-height: 1.5;
}

.login-error {
  background: rgba(245,63,63,0.1);
  border: 1px solid rgba(245,63,63,0.25);
  border-radius: var(--radius-sm);
  padding: 8px 12px; font-size: 12px;
  color: var(--red); margin-bottom: 14px;
  display: flex; gap: 6px; align-items: center;
}

.login-form { display: flex; flex-direction: column; gap: 12px; }
.field input {
  width: 100%; padding: 10px 12px;
  background: var(--bg-panel);
  border: 1px solid var(--border-main);
  border-radius: var(--radius-sm);
  font-size: 13px; color: var(--text-primary);
  outline: none; transition: border-color 0.2s;
  box-sizing: border-box;
}
.field input:focus { border-color: var(--accent); }
.field input::placeholder { color: var(--text-muted); opacity: 0.5; }

.pwd-wrap { position: relative; }
.pwd-eye {
  position: absolute; right: 10px; top: 50%; transform: translateY(-50%);
  cursor: pointer; font-size: 14px; user-select: none;
}

.login-btn {
  width: 100%; padding: 10px;
  background: var(--accent); color: #fff;
  border: none; border-radius: var(--radius-sm);
  font-size: 14px; font-weight: 600;
  cursor: pointer; transition: filter 0.2s;
}
.login-btn:hover { filter: brightness(1.15); }
.login-btn:disabled { opacity: 0.5; cursor: not-allowed; filter: none; }

.guest-btn {
  width: 100%; padding: 8px;
  background: none; border: 1px solid var(--border-main);
  border-radius: var(--radius-sm);
  color: var(--text-secondary); font-size: 12px;
  cursor: pointer; transition: all 0.2s;
}
.guest-btn:hover { border-color: var(--border-light); color: var(--text-primary); }

.login-foot {
  text-align: center; font-size: 11px;
  color: var(--text-muted); padding-top: 4px;
}
</style>
