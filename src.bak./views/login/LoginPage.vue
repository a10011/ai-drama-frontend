<<template>
  <div class="login-page">
    <el-card class="login-card">
      <h2>登录</h2>
      <el-form :model="form" label-position="top">
        <el-form-item label="邮箱"><el-input v-model="form.email" placeholder="请输入邮箱" /></el-form-item>
        <el-form-item label="密码"><el-input v-model="form.password" type="password" placeholder="请输入密码" /></el-form-item>
        <el-form-item><el-button type="primary" @click="login" style="width:100%">登录</el-button></el-form-item>
      </el-form>
      <div class="links"><el-link @click="goRegister">还没有账号？去注册</el-link></div>
    </el-card>
  </div>
</template>
<script setup>
import { reactive } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
const router = useRouter()
const form = reactive({ email: '', password: '' })
const login = () => { localStorage.setItem('token','demo-token'); ElMessage.success('登录成功'); router.push('/') }
const goRegister = () => router.push('/register')
</script>
<style scoped>
.login-page { display:flex; justify-content:center; align-items:center; min-height:100vh; background:#f5f7fa; }
.login-card { width:400px; padding:20px; }
.login-card h2 { text-align:center; margin-bottom:20px; }
.links { text-align:center; margin-top:15px; }
</style>
