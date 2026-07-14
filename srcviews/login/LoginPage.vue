<template>
  <div class="min-h-screen flex items-center justify-center px-4">
    <div class="glass-card rounded-3xl p-8 w-full max-w-md">
      <div class="text-center mb-8">
        <div class="w-16 h-16 rounded-xl bg-gradient-to-br from-violet-500 via-fuchsia-500 to-cyan-500 flex items-center justify-center mx-auto mb-4 shadow-lg shadow-violet-500/30">
          <i class="fas fa-film text-white text-2xl"></i>
        </div>
        <h2 class="text-2xl font-bold text-white">欢迎回来</h2>
        <p class="text-gray-400 text-sm">登录AI短剧工坊，开始创作之旅</p>
      </div>
      <div class="space-y-4">
        <div><label class="text-sm text-gray-300 block mb-1">邮箱</label><input v-model="form.email" class="fancy-input w-full rounded-xl p-3 text-sm" placeholder="请输入邮箱"></div>
        <div><label class="text-sm text-gray-300 block mb-1">密码</label><input v-model="form.password" type="password" class="fancy-input w-full rounded-xl p-3 text-sm" placeholder="请输入密码" @keyup.enter="handleLogin"></div>
        <div class="flex items-center justify-between"><label class="flex items-center gap-2 text-sm text-gray-400"><input type="checkbox" v-model="form.remember" class="accent-violet-500">记住登录</label><a @click="$router.push('/login')" class="text-sm text-violet-400 hover:text-violet-300 cursor-pointer">忘记密码？</a></div>
        <button class="w-full py-3 rounded-xl btn-primary text-white font-medium flex items-center justify-center gap-2" :disabled="loading" @click="handleLogin">
          <i v-if="loading" class="fas fa-spinner fa-spin"></i>{{ loading ? '登录中...' : '登录' }}
        </button>
        <p class="text-center text-sm text-gray-500">还没有账号？<router-link to="/register" class="text-violet-400 hover:text-violet-300">立即注册</router-link></p>
      </div>
      <div class="mt-6 pt-6 border-t border-white/10">
        <p class="text-xs text-gray-600 text-center mb-3">社交账号登录（即将上线）</p>
        <div class="flex justify-center gap-3">
          <button class="w-10 h-10 rounded-xl glass text-gray-400 cursor-not-allowed opacity-50" disabled><i class="fab fa-weixin"></i></button>
          <button class="w-10 h-10 rounded-xl glass text-gray-400 cursor-not-allowed opacity-50" disabled><i class="fab fa-qq"></i></button>
          <button class="w-10 h-10 rounded-xl glass text-gray-400 cursor-not-allowed opacity-50" disabled><i class="fab fa-weibo"></i></button>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name:'LoginPage',
  data(){return{loading:false,form:{email:'',password:'',remember:false}}},
  methods:{
    handleLogin(){
      if(!this.form.email||!this.form.password){this.$message({message:'请输入邮箱和密码',type:'warning'});return}
      this.loading=true
      setTimeout(()=>{
        this.loading=false
        this.$message({message:'登录成功！欢迎回来',type:'success'})
        this.$router.push('/')
      },1500)
    }
  }
}
</script>
