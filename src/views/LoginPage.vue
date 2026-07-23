<template>
  <div class="login-page">
    <!-- 背景装饰 -->
    <div class="bg-decoration">
      <div class="bg-orb orb-1"></div>
      <div class="bg-orb orb-2"></div>
      <div class="bg-orb orb-3"></div>
    </div>
    
    <div class="login-container">
      <!-- 左侧品牌区 -->
      <div class="brand-panel">
        <div class="brand-content">
          <div class="brand-logo">
            <span class="logo-icon">🎬</span>
            <span class="logo-text">智剧AI</span>
          </div>
          <h1 class="brand-title">AI 短剧创作平台</h1>
          <p class="brand-desc">从创意到成片，一键生成专业级短剧</p>
          <div class="brand-features">
            <div class="feature-item">
              <span class="feature-icon">✨</span>
              <span>AI 智能剧本创作</span>
            </div>
            <div class="feature-item">
              <span class="feature-icon">🎭</span>
              <span>角色一致性肖像生成</span>
            </div>
            <div class="feature-item">
              <span class="feature-icon">🎥</span>
              <span>专业级视频合成</span>
            </div>
          </div>
        </div>
      </div>
      
      <!-- 右侧登录表单 -->
      <div class="form-panel">
        <div class="form-container">
          <div class="form-header">
            <h2 class="form-title">欢迎回来</h2>
            <p class="form-subtitle">登录你的账号，继续创作之旅</p>
          </div>
          
          <div class="login-error" v-if="error">
            <span class="error-icon">⚠️</span>
            <span>{{ error }}</span>
          </div>
          
          <div class="login-form">
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
                  @keyup.enter="doLogin"
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
                  placeholder="请输入密码"
                  @input="error = ''"
                  autocomplete="current-password"
                  @keyup.enter="doLogin"
                />
                <span class="pwd-toggle" @click="showPwd = !showPwd">
                  {{ showPwd ? '🙈' : '👁' }}
                </span>
              </div>
            </div>
            
            <button 
              class="login-btn" 
              @click="doLogin" 
              :disabled="logging"
            >
              <span v-if="logging" class="spinner"></span>
              <span v-else>登录 / 自动注册</span>
            </button>
            
            <div class="form-divider">
              <span>或者</span>
            </div>
            
            <button class="guest-btn" @click="enterAsGuest">
              👁 先看看（游客模式）
            </button>
            
            <div class="form-footer">
              <span>还没有账号？</span>
              <router-link to="/register" class="register-link">立即注册</router-link>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import request from '@/utils/request'

export default {
  name: 'LoginPage',
  data() {
    return {
      username: '',
      password: '',
      showPwd: false,
      error: '',
      logging: false,
    }
  },
  methods: {
    async doLogin() {
      if (!this.username.trim()) {
        this.error = '请输入用户名'
        return
      }
      this.error = ''
      this.logging = true
      
      try {
        const resp = await request.post('/api/login', {
          username: this.username.trim(),
          password: this.password,
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
        if (resp?.error || resp?.message) {
          this.error = resp.error || resp.message
        } else if (err.code === 'ECONNABORTED') {
          this.error = '请求超时，请检查网络连接'
        } else if (err.response?.status === 401) {
          this.error = '用户名或密码错误'
        } else {
          this.error = '网络异常，请重试'
        }
      } finally {
        this.logging = false
      }
    },
    
    enterAsGuest() {
      localStorage.setItem('guest_token', 'guest_' + crypto.randomUUID())
      this.$router.push('/')
    },
  },
}
</script>

<style scoped>
.login-page {
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 100vh;
  background: linear-gradient(135deg, #0a0a0f 0%, #1a1a2e 50%, #16213e 100%);
  position: relative;
  overflow: hidden;
  font-family: 'Inter', 'Noto Sans SC', -apple-system, sans-serif;
}

/* 背景装饰 */
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
  background: #6366f1;
  top: -100px;
  right: -100px;
  animation-delay: 0s;
}

.orb-2 {
  width: 300px;
  height: 300px;
  background: #8b5cf6;
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

/* 主容器 */
.login-container {
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

/* 左侧品牌区 */
.brand-panel {
  flex: 1;
  padding: 48px;
  background: linear-gradient(135deg, rgba(99, 102, 241, 0.1) 0%, rgba(139, 92, 246, 0.05) 100%);
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

.logo-icon {
  font-size: 36px;
}

.logo-text {
  font-size: 24px;
  font-weight: 800;
  background: linear-gradient(135deg, #6366f1, #8b5cf6);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.brand-title {
  font-size: 28px;
  font-weight: 700;
  color: #f0f0f5;
  margin-bottom: 12px;
  line-height: 1.3;
}

.brand-desc {
  font-size: 14px;
  color: #a0a0b8;
  margin-bottom: 32px;
  line-height: 1.6;
}

.brand-features {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.feature-item {
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

.feature-icon {
  font-size: 16px;
}

/* 右侧表单区 */
.form-panel {
  flex: 1;
  padding: 48px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.form-container {
  width: 100%;
  max-width: 360px;
}

.form-header {
  text-align: center;
  margin-bottom: 32px;
}

.form-title {
  font-size: 24px;
  font-weight: 700;
  color: #f0f0f5;
  margin-bottom: 8px;
}

.form-subtitle {
  font-size: 13px;
  color: #86909c;
}

/* 错误提示 */
.login-error {
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

.error-icon {
  font-size: 16px;
}

/* 表单 */
.login-form {
  display: flex;
  flex-direction: column;
  gap: 20px;
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

.form-input::placeholder {
  color: #6b6b80;
}

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
  transition: opacity 0.2s;
}

.pwd-toggle:hover {
  opacity: 0.7;
}

/* 登录按钮 */
.login-btn {
  width: 100%;
  padding: 12px;
  background: linear-gradient(135deg, #6366f1, #8b5cf6);
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

.login-btn:hover:not(:disabled) {
  transform: translateY(-1px);
  box-shadow: 0 8px 24px rgba(99, 102, 241, 0.3);
}

.login-btn:active:not(:disabled) {
  transform: translateY(0);
}

.login-btn:disabled {
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

@keyframes spin {
  to { transform: rotate(360deg); }
}

/* 分割线 */
.form-divider {
  text-align: center;
  position: relative;
  margin: 4px 0;
}

.form-divider::before,
.form-divider::after {
  content: '';
  position: absolute;
  top: 50%;
  width: calc(50% - 30px);
  height: 1px;
  background: rgba(255, 255, 255, 0.06);
}

.form-divider::before { left: 0; }
.form-divider::after { right: 0; }

.form-divider span {
  font-size: 12px;
  color: #6b6b80;
  background: rgba(18, 18, 26, 0.9);
  padding: 0 12px;
}

/* 游客按钮 */
.guest-btn {
  width: 100%;
  padding: 10px;
  background: rgba(255, 255, 255, 0.04);
  border: 1px solid rgba(255, 255, 255, 0.08);
  border-radius: 12px;
  color: #b1b5c3;
  font-size: 13px;
  cursor: pointer;
  transition: all 0.2s ease;
}

.guest-btn:hover {
  background: rgba(255, 255, 255, 0.08);
  border-color: rgba(255, 255, 255, 0.12);
  color: #f0f0f5;
}

/* 底部链接 */
.form-footer {
  text-align: center;
  font-size: 13px;
  color: #6b6b80;
}

.register-link {
  color: #6366f1;
  font-weight: 600;
  text-decoration: none;
  transition: color 0.2s;
}

.register-link:hover {
  color: #818cf8;
  text-decoration: underline;
}

/* 响应式 */
@media (max-width: 768px) {
  .login-container {
    flex-direction: column;
    max-width: 95vw;
    border-radius: 16px;
  }
  
  .brand-panel {
    padding: 32px 24px;
  }
  
  .brand-title {
    font-size: 22px;
  }
  
  .brand-features {
    display: none;
  }
  
  .form-panel {
    padding: 32px 24px;
  }
}
</style>
