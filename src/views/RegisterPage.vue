<template>
  <div class="register-page">
    <div class="bg-decoration">
      <div class="bg-orb orb-1"></div>
      <div class="bg-orb orb-2"></div>
      <div class="bg-orb orb-3"></div>
    </div>
    
    <div class="register-container">
      <div class="brand-panel">
        <div class="brand-content">
          <div class="brand-logo">
            <span class="logo-icon">🎬</span>
            <span class="logo-text">智剧AI</span>
          </div>
          <h1 class="brand-title">开启你的创作之旅</h1>
          <p class="brand-desc">注册账号，免费体验 AI 短剧创作</p>
          <div class="brand-perks">
            <div class="perk-item">
              <span class="perk-icon">🆓</span>
              <span>新用户免费额度</span>
            </div>
            <div class="perk-item">
              <span class="perk-icon">🚀</span>
              <span>无限次剧本创作</span>
            </div>
            <div class="perk-item">
              <span class="perk-icon">🎨</span>
              <span>专业级视频生成</span>
            </div>
          </div>
        </div>
      </div>
      
      <div class="form-panel">
        <div class="form-container">
          <div class="form-header">
            <h2 class="form-title">创建账号</h2>
            <p class="form-subtitle">已有账号？<router-link to="/login" class="login-link">立即登录</router-link></p>
          </div>
          
          <div class="register-error" v-if="error">
            <span class="error-icon">⚠️</span>
            <span>{{ error }}</span>
          </div>
          
          <div class="register-form">
            <div class="form-group">
              <label class="form-label">用户名</label>
              <div class="input-wrapper">
                <span class="input-icon">👤</span>
                <input 
                  v-model="username" 
                  type="text" 
                  class="form-input"
                  placeholder="请输入用户名"
                  @input="error = ''"
                  autocomplete="username"
                />
              </div>
            </div>
            
            <div class="form-group">
              <label class="form-label">邮箱</label>
              <div class="input-wrapper">
                <span class="input-icon">📧</span>
                <input 
                  v-model="email" 
                  type="email" 
                  class="form-input"
                  placeholder="请输入邮箱"
                  @input="error = ''"
                  autocomplete="email"
                />
              </div>
            </div>
            
            <div class="form-group">
              <label class="form-label">密码</label>
              <div class="input-wrapper">
                <span class="input-icon">🔒</span>
                <input 
                  v-model="password" 
                  :type="showPwd ? 'text' : 'password'" 
                  class="form-input"
                  placeholder="请设置密码（至少6位）"
                  @input="checkPasswordStrength()"
                  autocomplete="new-password"
                />
                <span class="pwd-toggle" @click="showPwd = !showPwd">
                  {{ showPwd ? '🙈' : '👁' }}
                </span>
              </div>
              <div class="password-strength" v-if="password">
                <div class="strength-bar" :class="strengthClass"></div>
                <span class="strength-text">{{ strengthText }}</span>
              </div>
            </div>
            
            <div class="form-group">
              <label class="form-label">确认密码</label>
              <div class="input-wrapper">
                <span class="input-icon">🔐</span>
                <input 
                  v-model="confirmPassword" 
                  :type="showPwd ? 'text' : 'password'" 
                  class="form-input"
                  placeholder="请再次输入密码"
                  @input="error = ''"
                  autocomplete="new-password"
                />
              </div>
              <div class="confirm-hint" :class="confirmHintClass">
                {{ confirmPassword ? confirmHint : '' }}
              </div>
            </div>
            
            <button 
              class="register-btn" 
              @click="doRegister" 
              :disabled="registering || !isValid"
            >
              <span v-if="registering" class="spinner"></span>
              <span v-else>注册账号</span>
            </button>
            
            <div class="form-footer">
              <span>注册即表示同意我们的</span>
              <a href="#" class="terms-link">服务条款</a>
              <span>和</span>
              <a href="#" class="terms-link">隐私政策</a>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import axios from 'axios'

export default {
  name: 'RegisterPage',
  data() {
    return {
      username: '',
      email: '',
      password: '',
      confirmPassword: '',
      showPwd: false,
      error: '',
      registering: false,
      strength: 0,
    }
  },
  computed: {
    strengthText() {
      const texts = ['', '弱', '一般', '较强', '强']
      return texts[this.strength] || ''
    },
    strengthClass() {
      return `strength-${this.strength}`
    },
    isValid() {
      return this.username.trim() && 
             this.email.trim() && 
             this.password.length >= 6 && 
             this.password === this.confirmPassword
    },
    confirmHint() {
      if (this.confirmPassword.length < 6) return '密码至少6位'
      if (this.password !== this.confirmPassword) return '两次密码不一致'
      return '✅ 密码一致'
    },
    confirmHintClass() {
      if (!this.confirmPassword) return ''
      if (this.password !== this.confirmPassword) return 'hint-error'
      return 'hint-success'
    },
  },
  methods: {
    checkPasswordStrength() {
      let s = 0
      if (this.password.length >= 6) s++
      if (this.password.length >= 8) s++
      if (/[A-Z]/.test(this.password) && /[a-z]/.test(this.password)) s++
      if (/[0-9]/.test(this.password) && /[^A-Za-z0-9]/.test(this.password)) s++
      this.strength = s
    },
    
    async doRegister() {
      if (!this.username.trim()) { this.error = '请输入用户名'; return }
      if (!this.email.trim()) { this.error = '请输入邮箱'; return }
      if (this.password.length < 6) { this.error = '密码至少6位'; return }
      if (this.password !== this.confirmPassword) { this.error = '两次密码不一致'; return }
      
      this.error = ''
      this.registering = true
      
      try {
        const resp = await axios.post('/api/register', {
          username: this.username.trim(),
          email: this.email.trim(),
          password: this.password,
        }, { timeout: 15000 })
        
        const data = resp.data
        const token = data.token || data.data?.token || data.access_token
        
        if (token) {
          localStorage.setItem('token', token)
          localStorage.setItem('username', this.username)
          this.$router.push('/')
        } else {
          this.error = data.error || data.message || '注册失败'
        }
      } catch (err) {
        const resp = err.response?.data
        if (resp?.error || resp?.message) {
          this.error = resp.error || resp.message
        } else if (err.code === 'ECONNABORTED') {
          this.error = '请求超时，请检查网络连接'
        } else {
          this.error = '网络异常，请重试'
        }
      } finally {
        this.registering = false
      }
    },
  },
}
</script>

<style scoped>
.register-page {
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 100vh;
  background: linear-gradient(135deg, #0a0a0f 0%, #1a1a2e 50%, #16213e 100%);
  position: relative;
  overflow: hidden;
  font-family: 'Inter', 'Noto Sans SC', -apple-system, sans-serif;
}

.bg-decoration {
  position: absolute;
  inset: 0;
  overflow: hidden;
  pointer-events: none;
}

.bg-orb {
  position: absolute;
  border-radius: 50%;
  filter: blur(80px);
  opacity: 0.15;
  animation: float 20s infinite ease-in-out;
}

.orb-1 {
  width: 400px;
  height: 400px;
  background: #22c55e;
  top: -100px;
  right: -100px;
  animation-delay: 0s;
}

.orb-2 {
  width: 300px;
  height: 300px;
  background: #6366f1;
  bottom: -50px;
  left: -50px;
  animation-delay: -7s;
}

.orb-3 {
  width: 200px;
  height: 200px;
  background: #c49b4a;
  top: 50%;
  left: 50%;
  animation-delay: -14s;
}

@keyframes float {
  0%, 100% { transform: translate(0, 0) scale(1); }
  25% { transform: translate(30px, -30px) scale(1.1); }
  50% { transform: translate(-20px, 20px) scale(0.9); }
  75% { transform: translate(20px, 10px) scale(1.05); }
}

.register-container {
  display: flex;
  width: 900px;
  max-width: 95vw;
  background: rgba(18, 18, 26, 0.8);
  backdrop-filter: blur(20px);
  border: 1px solid rgba(255, 255, 255, 0.08);
  border-radius: 24px;
  overflow: hidden;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.5);
  position: relative;
  z-index: 1;
}

.brand-panel {
  flex: 1;
  padding: 48px;
  background: linear-gradient(135deg, rgba(34, 197, 94, 0.1) 0%, rgba(34, 197, 94, 0.05) 100%);
  display: flex;
  align-items: center;
  justify-content: center;
}

.brand-content {
  text-align: center;
}

.brand-logo {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 12px;
  margin-bottom: 24px;
}

.logo-icon { font-size: 36px; }

.logo-text {
  font-size: 24px;
  font-weight: 800;
  background: linear-gradient(135deg, #22c55e, #4ade80);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.brand-title {
  font-size: 28px;
  font-weight: 700;
  color: #f0f0f5;
  margin-bottom: 12px;
}

.brand-desc {
  font-size: 14px;
  color: #a0a0b8;
  margin-bottom: 32px;
}

.brand-perks {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.perk-item {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 10px 16px;
  background: rgba(255, 255, 255, 0.03);
  border: 1px solid rgba(255, 255, 255, 0.06);
  border-radius: 12px;
  font-size: 13px;
  color: #b1b5c3;
}

.perk-icon { font-size: 16px; }

.form-panel {
  flex: 1;
  padding: 48px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.form-container {
  width: 100%;
  max-width: 380px;
}

.form-header {
  text-align: center;
  margin-bottom: 28px;
}

.form-title {
  font-size: 24px;
  font-weight: 700;
  color: #f0f0f5;
  margin-bottom: 8px;
}

.login-link {
  color: #6366f1;
  font-weight: 600;
  text-decoration: none;
}

.login-link:hover {
  text-decoration: underline;
}

.register-error {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 12px 16px;
  background: rgba(248, 113, 113, 0.1);
  border: 1px solid rgba(248, 113, 113, 0.2);
  border-radius: 12px;
  font-size: 13px;
  color: #f87171;
  margin-bottom: 20px;
}

.register-form {
  display: flex;
  flex-direction: column;
  gap: 18px;
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.form-label {
  font-size: 13px;
  font-weight: 600;
  color: #b1b5c3;
}

.input-wrapper {
  position: relative;
  display: flex;
  align-items: center;
}

.input-icon {
  position: absolute;
  left: 14px;
  font-size: 16px;
  z-index: 1;
}

.form-input {
  width: 100%;
  padding: 12px 14px 12px 42px;
  background: rgba(255, 255, 255, 0.04);
  border: 1px solid rgba(255, 255, 255, 0.08);
  border-radius: 12px;
  font-size: 14px;
  color: #f0f0f5;
  outline: none;
  transition: all 0.2s ease;
}

.form-input::placeholder { color: #6b6b80; }

.form-input:focus {
  border-color: #6366f1;
  background: rgba(99, 102, 241, 0.05);
  box-shadow: 0 0 0 3px rgba(99, 102, 241, 0.15);
}

.pwd-toggle {
  position: absolute;
  right: 14px;
  cursor: pointer;
  font-size: 16px;
  user-select: none;
}

.password-strength {
  margin-top: 4px;
  display: flex;
  align-items: center;
  gap: 8px;
}

.strength-bar {
  flex: 1;
  height: 4px;
  border-radius: 2px;
  background: rgba(255, 255, 255, 0.06);
  transition: all 0.3s;
}

.strength-1 .strength-bar { background: #f87171; }
.strength-2 .strength-bar { background: #fbbf24; }
.strength-3 .strength-bar { background: #34d399; }
.strength-4 .strength-bar { background: #22c55e; }

.strength-text {
  font-size: 11px;
  color: #86909c;
  min-width: 24px;
}

.confirm-hint {
  font-size: 11px;
  margin-top: 2px;
  transition: color 0.2s;
}

.hint-error { color: #f87171; }
.hint-success { color: #22c55e; }

.register-btn {
  width: 100%;
  padding: 12px;
  background: linear-gradient(135deg, #22c55e, #4ade80);
  color: #fff;
  border: none;
  border-radius: 12px;
  font-size: 15px;
  font-weight: 700;
  cursor: pointer;
  transition: all 0.2s ease;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
}

.register-btn:hover:not(:disabled) {
  transform: translateY(-1px);
  box-shadow: 0 8px 24px rgba(34, 197, 94, 0.3);
}

.register-btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.spinner {
  width: 18px;
  height: 18px;
  border: 2px solid rgba(255, 255, 255, 0.3);
  border-top-color: #fff;
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
}

@keyframes spin { to { transform: rotate(360deg); } }

.form-footer {
  text-align: center;
  font-size: 12px;
  color: #6b6b80;
}

.terms-link {
  color: #6366f1;
  text-decoration: none;
  font-weight: 600;
}

.terms-link:hover { text-decoration: underline; }

@media (max-width: 768px) {
  .register-container { flex-direction: column; max-width: 95vw; border-radius: 16px; }
  .brand-panel { padding: 32px 24px; }
  .brand-title { font-size: 22px; }
  .brand-perks { display: none; }
  .form-panel { padding: 32px 24px; }
}
</style>
