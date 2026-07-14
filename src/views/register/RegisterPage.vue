<template>
  <div class="register-page">
    <div class="register-bg"></div>
    <div class="register-container">
      <div class="register-card">
        <div class="register-header">
          <div class="register-logo-wrap">
            <div class="register-logo-glow"></div>
            <span class="register-logo-icon">🎬</span>
          </div>
          <h2>创建账号</h2>
          <p>加入 AI面短剧 STUDIOS</p>
        </div>

        <el-form :model="form" label-position="top" class="register-form" @keyup.enter="register">
          <el-form-item label="用户名">
            <el-input v-model="form.username" placeholder="3-20位字母/数字/下划线" />
          </el-form-item>
          <el-form-item label="邮箱">
            <el-input v-model="form.email" placeholder="请输入邮箱" type="email" />
          </el-form-item>
          <el-form-item label="密码">
            <el-input v-model="form.password" type="password" placeholder="至少6位" show-password />
          </el-form-item>
          <el-form-item label="确认密码">
            <el-input v-model="form.confirm" type="password" placeholder="再次输入密码" show-password />
          </el-form-item>
          <el-form-item>
            <button class="btn-register" :disabled="loading" @click="register">
              <span v-if="loading"><i class="fas fa-spinner fa-spin"></i> 注册中...</span>
              <span v-else><i class="fas fa-user-plus"></i> 立即注册</span>
            </button>
          </el-form-item>
        </el-form>

        <div class="register-footer">
          <span>已有账号？<a href="/login" class="footer-link">立即登录</a></span>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { reactive, ref } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import request from '@/utils/request'

const router = useRouter()
const loading = ref(false)
const form = reactive({ username: '', email: '', password: '', confirm: '' })

const register = async () => {
  if (!form.username || !form.email || !form.password || !form.confirm) {
    ElMessage.warning('请填写完整信息'); return
  }
  if (form.password.length < 6) { ElMessage.warning('密码至少6位'); return }
  if (form.password !== form.confirm) { ElMessage.warning('两次密码不一致'); return }

  loading.value = true
  try {
    const data = await request({ url: '/api/v1/auth/register', method: 'POST', data: {
      username: form.username, email: form.email, password: form.password
    }})
    if (data.success) {
      const token = data.data.access_token
      if (token) {
        localStorage.setItem('token', token)
        for (let k of Object.keys(localStorage)) {
          if (k.startsWith('__DRAMA') || k.startsWith('__CREATE') || k.startsWith('__PREVIEW') || k.startsWith('__PIPELINE')) {
            localStorage.removeItem(k)
          }
        }
      }
      ElMessage.success('注册成功！')
      router.push('/')
    } else {
      ElMessage.error(data.error || data.detail || '注册失败')
    }
  } catch (e) { ElMessage.error(e?.response?.data?.detail || e?.message || '网络错误')
  } finally { loading.value = false }
}
</script>

<style scoped>
.register-page{min-height:100vh;background:var(--bg-primary);display:flex;align-items:center;justify-content:center;padding:20px}
.register-bg{display:none}
.register-container{width:100%;display:flex;justify-content:center}
.register-card{width:420px;max-width:100%;background:var(--bg-card);border:1px solid var(--border);border-radius:var(--radius);padding:40px}
.register-header{text-align:center;margin-bottom:30px}
.register-logo-wrap{position:relative;display:inline-block;margin-bottom:12px}
.register-logo-glow{position:absolute;inset:-10px;background:var(--accent-glow);border-radius:50%;filter:blur(20px);opacity:0.6}
.register-logo-icon{font-size:28px;position:relative;z-index:1}
.register-header h2{color:var(--text-primary);font-family:'Inter','Noto Sans SC',-apple-system,sans-serif;font-size:20px;margin:0 0 4px}
.register-header p{color:var(--text-muted);font-size:13px;margin:0}
.register-form :deep(.el-form-item__label){color:var(--text-secondary)!important;font-family:'Inter','Noto Sans SC',-apple-system,sans-serif;font-size:12px!important}
.register-form :deep(.el-input__wrapper){background:var(--bg-input)!important;border:1px solid var(--border)!important;box-shadow:none!important;border-radius:var(--radius-sm)!important}
.register-form :deep(.el-input__wrapper:hover){border-color:var(--highlight)!important}
.register-form :deep(.el-input__inner){color:var(--text-primary)!important}
.btn-register{width:100%;background:linear-gradient(135deg,var(--accent),var(--highlight));color:#fff;border:none;padding:12px;border-radius:var(--radius-sm);font-family:'Inter','Noto Sans SC',-apple-system,sans-serif;font-size:15px;font-weight:bold;cursor:pointer;transition:.25s}
.btn-register:hover{box-shadow:0 0 20px var(--accent-glow)}.btn-register:disabled{opacity:.5}
.register-footer{text-align:center;margin-top:16px;color:var(--text-muted);font-size:12px}
.register-footer a,.footer-link{color:var(--highlight);text-decoration:none}

/* ===== Mobile Responsive ===== */
@media (max-width: 768px) {
  .track-page, .result-page, .history-page, .profile-page, .cert-page { padding-bottom: 72px !important; }
  .page-wrap, .page-container, .container { padding: 0 12px 72px !important; }
}

</style>