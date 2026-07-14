<template>
  <div id="app-root">
    <!-- 背景动画 -->
    <div class="bg-animated"></div>

    <!-- 导航栏 -->
    <nav class="nav-glass fixed top-0 left-0 right-0 z-50">
      <div class="max-w-[1600px] mx-auto px-6 py-3">
        <div class="flex items-center justify-between">
          <div class="flex items-center gap-3 cursor-pointer" @click="$router.push('/')">
            <div class="w-10 h-10 rounded-xl bg-gradient-to-br from-violet-500 via-fuchsia-500 to-cyan-500 flex items-center justify-center shadow-lg shadow-violet-500/30">
              <i class="fas fa-film text-white text-lg"></i>
            </div>
            <div>
              <h1 class="text-lg font-bold text-white tracking-tight">AI短剧工坊</h1>
              <p class="text-[10px] text-gray-500 -mt-0.5">v2.0 智能创作 · 一键成片</p>
            </div>
          </div>

          <div class="hidden md:flex items-center gap-1">
            <button @click="navigate('/')" class="nav-item px-4 py-2 rounded-lg text-sm transition flex items-center gap-2"
              :class="currentRoute === '/' ? 'text-white bg-white/5' : 'text-gray-400 hover:text-white hover:bg-white/5'"
            ><i class="fas fa-home"></i> 工作台</button>
            <button @click="navigate('/create')" class="nav-item px-4 py-2 rounded-lg text-sm transition flex items-center gap-2"
              :class="currentRoute === '/create' ? 'text-white bg-white/5' : 'text-gray-400 hover:text-white hover:bg-white/5'"
            ><i class="fas fa-plus-circle"></i> 新建项目</button>
            <button class="nav-item px-4 py-2 rounded-lg text-sm text-gray-400 hover:text-white hover:bg-white/5 transition flex items-center gap-2">
              <i class="fas fa-images"></i> 素材库
            </button>
            <button @click="navigate('/tasks')" class="nav-item px-4 py-2 rounded-lg text-sm transition flex items-center gap-2"
              :class="currentRoute === '/tasks' ? 'text-white bg-white/5' : 'text-gray-400 hover:text-white hover:bg-white/5'"
            ><i class="fas fa-tasks"></i> 任务队列<span class="ml-1 px-2 py-0.5 rounded-full bg-red-500/20 text-red-400 text-xs">2</span></button>
            <button class="nav-item px-4 py-2 rounded-lg text-sm text-gray-400 hover:text-white hover:bg-white/5 transition flex items-center gap-2">
              <i class="fas fa-users"></i> 社区
            </button>
          </div>

          <div class="flex items-center gap-3">
            <div class="search-box hidden lg:flex items-center rounded-xl px-3 py-2 w-64">
              <i class="fas fa-search text-gray-500 text-sm mr-2"></i>
              <input type="text" placeholder="搜索项目、素材..." class="bg-transparent border-none outline-none text-sm text-white w-full placeholder-gray-600" />
            </div>
            <div class="relative">
              <button @click="toggleNotif" class="w-10 h-10 rounded-xl glass flex items-center justify-center text-gray-400 hover:text-white transition relative">
                <i class="fas fa-bell"></i>
                <span class="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-gradient-to-r from-red-500 to-pink-500 text-white text-[10px] flex items-center justify-center font-bold">3</span>
              </button>
              <div v-show="showNotif" class="absolute right-0 top-12 w-80 dropdown-menu rounded-2xl p-4 z-50">
                <h3 class="text-sm font-bold text-white mb-3">通知</h3>
                <div class="space-y-3">
                  <div class="flex gap-3 p-2 rounded-xl hover:bg-white/5 cursor-pointer transition">
                    <div class="w-10 h-10 rounded-lg bg-red-500/20 flex items-center justify-center flex-shrink-0"><i class="fas fa-exclamation-triangle text-red-400 text-sm"></i></div>
                    <div><p class="text-sm text-white">视频生成失败</p><p class="text-xs text-gray-500">《西游漫剧》第3镜头渲染中断</p><p class="text-xs text-gray-600 mt-1">刚刚</p></div>
                  </div>
                  <div class="flex gap-3 p-2 rounded-xl hover:bg-white/5 cursor-pointer transition">
                    <div class="w-10 h-10 rounded-lg bg-green-500/20 flex items-center justify-center flex-shrink-0"><i class="fas fa-check-circle text-green-400 text-sm"></i></div>
                    <div><p class="text-sm text-white">自动保存成功</p><p class="text-xs text-gray-500">项目已保存至云端</p><p class="text-xs text-gray-600 mt-1">2分钟前</p></div>
                  </div>
                </div>
              </div>
            </div>
            <div class="relative">
              <button @click="showUserMenu = !showUserMenu" class="flex items-center gap-2 p-1 rounded-xl hover:bg-white/5 transition">
                <img :src="'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100&h=100&fit=crop'" class="w-9 h-9 rounded-lg object-cover border border-white/10" alt="用户头像" />
                <div class="hidden md:block text-left"><p class="text-sm text-white font-medium">创作者小明</p><p class="text-[10px] text-gray-500">VIP会员</p></div>
                <i class="fas fa-chevron-down text-gray-500 text-xs hidden md:block"></i>
              </button>
              <div v-show="showUserMenu" class="absolute right-0 top-12 w-56 dropdown-menu rounded-2xl p-2 z-50">
                <div class="p-3 border-b border-white/10"><p class="text-sm font-bold text-white">创作者小明</p><p class="text-xs text-gray-500">xiaoming@example.com</p></div>
                <div class="py-2">
                  <button @click="navigate('/profile')" class="w-full text-left px-3 py-2 rounded-xl text-sm text-gray-300 hover:text-white hover:bg-white/5 transition flex items-center gap-2"><i class="fas fa-user text-violet-400"></i> 个人中心</button>
                  <button class="w-full text-left px-3 py-2 rounded-xl text-sm text-gray-300 hover:text-white hover:bg-white/5 transition flex items-center gap-2"><i class="fas fa-cog text-cyan-400"></i> 设置</button>
                  <button class="w-full text-left px-3 py-2 rounded-xl text-sm text-gray-300 hover:text-white hover:bg-white/5 transition flex items-center gap-2"><i class="fas fa-credit-card text-pink-400"></i> 会员与账单</button>
                </div>
                <div class="border-t border-white/10 pt-2">
                  <button class="w-full text-left px-3 py-2 rounded-xl text-sm text-red-400 hover:bg-red-500/10 transition flex items-center gap-2"><i class="fas fa-sign-out-alt"></i> 退出登录</button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </nav>

    <!-- 主要内容 -->
    <main class="pt-20 pb-12 px-6 max-w-[1600px] mx-auto">
      <router-view />
    </main>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useRouter, useRoute } from 'vue-router'

const router = useRouter()
const route = useRoute()
const showNotif = ref(false)
const showUserMenu = ref(false)

const currentRoute = computed(() => route.path)

function navigate(path) {
  showNotif.value = false
  showUserMenu.value = false
  router.push(path)
}

function toggleNotif() {
  showNotif.value = !showNotif.value
}

// Close dropdowns on outside click
if (typeof document !== 'undefined') {
  document.addEventListener('click', function(e) {
    if (!e.target.closest('.relative')) {
      showNotif.value = false
      showUserMenu.value = false
    }
  })
}
</script>

<style>
* { margin: 0; padding: 0; box-sizing: border-box; }
body { font-family: 'Noto Sans SC', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background: #050508; color: #e2e8f0; overflow-x: hidden; }
.bg-animated { position: fixed; top: 0; left: 0; right: 0; bottom: 0; z-index: -1; background:
  radial-gradient(ellipse at 20% 20%, rgba(139, 92, 246, 0.15) 0%, transparent 50%),
  radial-gradient(ellipse at 80% 80%, rgba(236, 72, 153, 0.1) 0%, transparent 50%),
  radial-gradient(ellipse at 50% 50%, rgba(6, 182, 212, 0.05) 0%, transparent 70%); }
.glass { background: rgba(20, 20, 40, 0.7); backdrop-filter: blur(20px); border: 1px solid rgba(255, 255, 255, 0.08); }
.nav-glass { background: rgba(5, 5, 8, 0.8); backdrop-filter: blur(20px); border-bottom: 1px solid rgba(255, 255, 255, 0.06); }
.dropdown-menu { background: rgba(30, 30, 58, 0.95); backdrop-filter: blur(20px); border: 1px solid rgba(255, 255, 255, 0.1); box-shadow: 0 20px 60px rgba(0, 0, 0, 0.5); }
.search-box { background: rgba(0, 0, 0, 0.4); border: 1px solid rgba(255, 255, 255, 0.08); transition: all 0.3s; }
.search-box:focus-within { border-color: rgba(139, 92, 246, 0.5); box-shadow: 0 0 20px rgba(139, 92, 246, 0.1); }
::-webkit-scrollbar { width: 6px; height: 6px; }
::-webkit-scrollbar-thumb { background: rgba(139, 92, 246, 0.3); border-radius: 3px; }
</style>
