<template>
  <div class="merchant-login-page">
    <div class="login-card">
      <!-- Logo + 标题 -->
      <div class="header">
        <div class="logo-icon">🎬</div>
        <h1 class="title">智剧AI · 商户端</h1>
        <p class="subtitle">AI短剧商业化平台</p>
      </div>

      <!-- 手机号 -->
      <div class="input-group">
        <label class="input-label">📱 手机号</label>
        <div class="phone-input-wrapper">
          <span class="phone-prefix">+86</span>
          <input
            v-model="phone"
            type="tel"
            class="phone-input"
            placeholder="输入手机号码"
            maxlength="11"
            @input="onPhoneInput"
          />
        </div>
        <p v-if="phoneError" class="error-msg">{{ phoneError }}</p>
      </div>

      <!-- 验证码 -->
      <div class="input-group">
        <label class="input-label">🔐 验证码</label>
        <div class="code-row">
          <input
            v-model="code"
            type="text"
            class="code-input"
            placeholder="输入验证码"
            maxlength="6"
            @input="codeError = ''"
          />
          <button
            class="send-btn"
            :disabled="countdown > 0 || !phoneValid"
            @click="sendCode"
          >
            {{ countdown > 0 ? countdown + '秒后重发' : '获取验证码' }}
          </button>
        </div>
        <p v-if="codeError" class="error-msg">{{ codeError }}</p>
      </div>

      <!-- 登录按钮 -->
      <button class="submit-btn" :disabled="loading" @click="handleLogin">
        {{ loading ? '请稍候...' : '登录 / 注册  一键进入' }}
      </button>

      <!-- 网络错误 -->
      <p v-if="netError" class="error-msg centered">{{ netError }}</p>

      <!-- 底部提示 -->
      <div class="divider"></div>
      <p class="tip-text">首次登录自动注册，即登即用</p>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useRouter, useRoute } from 'vue-router'

const router = useRouter()
const route = useRoute()

const phone = ref('')
const code = ref('')
const phoneError = ref('')
const codeError = ref('')
const netError = ref('')
const countdown = ref(0)
const loading = ref(false)

let timer = null

const phoneValid = computed(() => {
  return phone.value.length === 11 && /^1\d{10}$/.test(phone.value)
})

function onPhoneInput() {
  phone.value = phone.value.replace(/\D/g, '')
  if (phoneError.value) {
    if (phoneValid.value) phoneError.value = ''
  }
}

function sendCode() {
  if (!phoneValid.value) {
    phoneError.value = '请输入正确的11位手机号码'
    return
  }
  phoneError.value = ''
  codeError.value = ''
  netError.value = ''

  fetch('/api/merchant/send-code', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ phone: phone.value })
  })
    .then(res => res.json())
    .then(data => {
      if (data.success) {
        countdown.value = 60
        timer = setInterval(() => {
          countdown.value--
          if (countdown.value <= 0) {
            clearInterval(timer)
            timer = null
          }
        }, 1000)
      } else {
        netError.value = data.detail || '发送失败，请重试'
      }
    })
    .catch(() => {
      netError.value = '网络错误，请检查连接'
    })
}

function handleLogin() {
  if (!phoneValid.value) {
    phoneError.value = '请输入正确的11位手机号码'
    return
  }
  if (!code.value) {
    codeError.value = '请输入验证码'
    return
  }
  codeError.value = ''
  netError.value = ''
  loading.value = true

  fetch('/api/merchant/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ phone: phone.value, code: code.value })
  })
    .then(res => res.json())
    .then(data => {
      loading.value = false
      if (data.success) {
        localStorage.setItem('merchant_token', data.data.access_token)
        localStorage.setItem('merchant_phone', data.data.phone)
        const redirect = route.query.redirect || '/merchant/dashboard'
        router.push(redirect)
      } else {
        codeError.value = data.detail || '登录失败，请重试'
      }
    })
    .catch(() => {
      loading.value = false
      netError.value = '网络错误，请检查连接'
    })
}
</script>

<style scoped>
.merchant-login-page {
  background: #000000;
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
}

.login-card {
  background: #0a0a0a;
  border: 1px solid #222;
  border-radius: 16px;
  padding: 48px 40px;
  width: 100%;
  max-width: 420px;
  box-sizing: border-box;
}

.header {
  text-align: center;
  margin-bottom: 40px;
}

.logo-icon {
  font-size: 40px;
  margin-bottom: 12px;
}

.title {
  color: #ffffff;
  font-size: 24px;
  font-weight: 700;
  margin: 0 0 8px 0;
  letter-spacing: 1px;
}

.subtitle {
  color: #666666;
  font-size: 14px;
  margin: 0;
}

/* ── 输入框 ── */
.input-group {
  margin-bottom: 24px;
}

.input-label {
  display: block;
  color: #999;
  font-size: 13px;
  margin-bottom: 8px;
}

.phone-input-wrapper {
  display: flex;
  align-items: center;
  background: #111111;
  border: 1px solid #333333;
  border-radius: 8px;
  overflow: hidden;
  transition: border-color 0.2s;
}

.phone-input-wrapper:focus-within {
  border-color: #ffffff;
}

.phone-prefix {
  color: #666;
  font-size: 15px;
  padding: 0 12px;
  border-right: 1px solid #222;
  line-height: 44px;
  flex-shrink: 0;
}

.phone-input {
  flex: 1;
  background: transparent;
  border: none;
  outline: none;
  color: #ffffff;
  font-size: 16px;
  padding: 12px 14px;
  width: 100%;
}

.phone-input::placeholder {
  color: #444;
}

.code-row {
  display: flex;
  gap: 12px;
}

.code-input {
  flex: 1;
  background: #111111;
  border: 1px solid #333333;
  border-radius: 8px;
  outline: none;
  color: #ffffff;
  font-size: 16px;
  padding: 12px 14px;
  transition: border-color 0.2s;
}

.code-input:focus {
  border-color: #ffffff;
}

.code-input::placeholder {
  color: #444;
}

.send-btn {
  flex-shrink: 0;
  background: transparent;
  border: 1px solid #333333;
  color: #999999;
  border-radius: 8px;
  padding: 0 16px;
  font-size: 14px;
  cursor: pointer;
  white-space: nowrap;
  transition: all 0.2s;
}

.send-btn:hover:not(:disabled) {
  border-color: #666;
  color: #ccc;
}

.send-btn:disabled {
  opacity: 0.4;
  cursor: not-allowed;
}

/* ── 提交按钮 ── */
.submit-btn {
  width: 100%;
  background: #ffffff;
  color: #000000;
  border: none;
  border-radius: 8px;
  padding: 14px 0;
  font-size: 18px;
  font-weight: 600;
  cursor: pointer;
  margin-top: 8px;
  transition: background 0.2s, transform 0.1s;
  letter-spacing: 2px;
}

.submit-btn:hover:not(:disabled) {
  background: #cccccc;
}

.submit-btn:active:not(:disabled) {
  transform: scale(0.98);
}

.submit-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

/* ── 错误提示 ── */
.error-msg {
  color: #ff4444;
  font-size: 12px;
  margin: 6px 0 0 0;
}

.error-msg.centered {
  text-align: center;
  margin-top: 12px;
}

/* ── 底部 ── */
.divider {
  height: 1px;
  background: #1a1a1a;
  margin: 28px 0 16px 0;
}

.tip-text {
  color: #444;
  font-size: 12px;
  text-align: center;
  margin: 0;
}

/* ===== Mobile Responsive ===== */
@media (max-width: 768px) {
  .page-container, .container, .card, .wrap { padding: 0 12px 72px !important; }
}

</style>
