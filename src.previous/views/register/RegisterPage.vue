<<template>
  <div class="register-page">
    <el-card class="register-card">
      <h2>注册</h2>
      <el-form :model="form" label-position="top">
        <el-form-item label="邮箱"><el-input v-model="form.email" placeholder="请输入邮箱" /></el-form-item>
        <el-form-item label="密码"><el-input v-model="form.password" type="password" placeholder="请输入密码" /></el-form-item>
        <el-form-item><el-button type="primary" @click="register" style="width:100%">注册</el-button></el-form-item>
      </el-form>
      <div class="links"><el-link @click="goLogin">已有账号？去登录</el-link></div>
    </el-card>
  </div>
</template>
<script setup>
import { reactive } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
const router = useRouter()
const form = reactive({ email: '', password: '' })
const register = () => { ElMessage.success('注册成功'); router.push('/login') }
const goLogin = () => router.push('/login')
</script>
<style scoped>
.register-page { display:flex; justify-content:center; align-items:center; min-height:100vh; background:#f5f7fa; }
.register-card { width:400px; padding:20px; }
.register-card h2 { text-align:center; margin-bottom:20px; }
.links { text-align:center; margin-top:15px; }
</style>
