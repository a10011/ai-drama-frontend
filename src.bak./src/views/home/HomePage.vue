<template>
  <div class="dashboard-page">
    <!-- 欢迎横幅+统计卡片 -->
    <div class="glass-card rounded-3xl p-8 relative overflow-hidden welcome-section">
      <div class="absolute top-0 right-0 w-96 h-96 bg-gradient-to-br from-violet-500/20 to-fuchsia-500/20 rounded-full blur-3xl -translate-y-1/2 translate-x-1/4"></div>
      <div class="relative z-10">
        <div class="flex items-center justify-between">
          <div>
            <h2 class="text-3xl font-bold text-white mb-2">欢迎回来，创作者 👋</h2>
            <p class="text-gray-400">你本月已创作 <span class="text-violet-400 font-bold">{{ currentMonthWorks }}</span> 部作品，获得 <span class="text-fuchsia-400 font-bold">{{ formatNumber(currentMonthPlays) }}</span> 次播放</p>
          </div>
          <button @click="$router.push('/create')" class="btn-primary px-6 py-3 rounded-xl text-white font-medium flex items-center gap-2">
            <i class="fas fa-plus"></i> 新建短剧
          </button>
        </div>
        <div class="grid grid-cols-2 md:grid-cols-4 gap-4 mt-8">
          <div class="glass rounded-2xl p-4">
            <div class="flex items-center gap-3">
              <div class="w-10 h-10 rounded-xl bg-violet-500/20 flex items-center justify-center"><i class="fas fa-film text-violet-400"></i></div>
              <div><p class="text-2xl font-bold text-white">{{ stats.totalWorks }}</p><p class="text-xs text-gray-500">总作品</p></div>
            </div>
          </div>
          <div class="glass rounded-2xl p-4">
            <div class="flex items-center gap-3">
              <div class="w-10 h-10 rounded-xl bg-fuchsia-500/20 flex items-center justify-center"><i class="fas fa-eye text-fuchsia-400"></i></div>
              <div><p class="text-2xl font-bold text-white">{{ formatNumber(stats.totalPlays) }}</p><p class="text-xs text-gray-500">总播放</p></div>
            </div>
          </div>
          <div class="glass rounded-2xl p-4">
            <div class="flex items-center gap-3">
              <div class="w-10 h-10 rounded-xl bg-cyan-500/20 flex items-center justify-center"><i class="fas fa-heart text-cyan-400"></i></div>
              <div><p class="text-2xl font-bold text-white">{{ formatNumber(stats.totalLikes) }}</p><p class="text-xs text-gray-500">获赞</p></div>
            </div>
          </div>
          <div class="glass rounded-2xl p-4">
            <div class="flex items-center gap-3">
              <div class="w-10 h-10 rounded-xl bg-amber-500/20 flex items-center justify-center"><i class="fas fa-coins text-amber-400"></i></div>
              <div><p class="text-2xl font-bold text-white">{{ formatNumber(stats.totalCoins) }}</p><p class="text-xs text-gray-500">金币</p></div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- 可恢复的任务 -->
    <div v-if="recoverableTasks.length > 0" class="mt-8">
      <div class="flex items-center justify-between mb-6">
        <h3 class="text-xl font-bold text-white flex items-center gap-2">
          <i class="fas fa-sync-alt text-amber-400"></i> 可恢复的任务
          <span class="fancy-tag bg-amber-500/20 text-amber-300 border-amber-500/30">{{ recoverableTasks.length }}个任务中断</span>
        </h3>
        <button class="text-sm text-amber-400 hover:text-amber-300 transition" @click="$router.push('/tasks')">查看全部</button>
      </div>
      <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div v-for="task in recoverableTasks" :key="task.id"
          class="glass-card rounded-2xl p-6"
          :class="task.status === 'failed' ? 'border-l-4 border-red-500' : 'border-l-4 border-amber-500'"
        >
          <div class="flex items-start justify-between mb-4">
            <div class="flex items-center gap-3">
              <div class="w-12 h-12 rounded-xl flex items-center justify-center"
                :class="task.status === 'failed' ? 'bg-red-500/20' : 'bg-amber-500/20'"
              >
                <i class="fas text-xl" :class="task.status === 'failed' ? 'fa-exclamation-triangle text-red-400' : 'fa-pause-circle text-amber-400'"></i>
              </div>
              <div>
                <h4 class="text-lg font-bold text-white">{{ task.title }}</h4>
                <p class="text-sm text-gray-400">{{ task.description }}</p>
              </div>
            </div>
            <span class="fancy-tag text-xs"
              :class="task.status === 'failed' ? 'bg-red-500/20 text-red-400 border-red-500/30' : 'bg-amber-500/20 text-amber-400 border-amber-500/30'"
            >{{ task.status === 'failed' ? '失败' : '等待中' }}</span>
          </div>
          <div class="space-y-3 mb-4">
            <div class="flex items-center justify-between text-sm">
              <span class="text-gray-500">{{ task.status === 'failed' ? '失败原因' : '中断原因' }}</span>
              <span :class="task.status === 'failed' ? 'text-red-400' : 'text-amber-400'">{{ task.errorMsg || '用户主动暂停' }}</span>
            </div>
            <div class="flex items-center justify-between text-sm">
              <span class="text-gray-500">已生成进度</span>
              <span class="text-white">{{ task.progress }}%</span>
            </div>
            <div class="flex items-center justify-between text-sm">
              <span class="text-gray-500">最后保存</span>
              <span class="text-green-400">{{ formatTime(task.updatedAt) }}</span>
            </div>
          </div>
          <div class="w-full bg-gray-800 rounded-full h-2 mb-4">
            <div class="h-full rounded-full" :style="{ width: task.progress + '%' }"
              :class="task.status === 'failed' ? 'bg-gradient-to-r from-red-500 to-amber-500' : 'bg-gradient-to-r from-amber-500 to-violet-500'"
            ></div>
          </div>
          <div class="flex gap-3">
            <button class="flex-1 py-2.5 rounded-xl bg-gradient-to-r from-violet-600 to-fuchsia-600 text-white text-sm font-medium hover:shadow-lg transition flex items-center justify-center gap-2" @click="resumeTask(task.id)">
              <i class="fas fa-play"></i> 断点续传
            </button>
            <button class="px-4 py-2.5 rounded-xl glass text-sm text-gray-400 hover:text-white transition" @click="saveDraft(task.id)">
              <i class="fas fa-save"></i> 存为草稿
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- 进行中的项目 -->
    <div class="mt-8">
      <div class="flex items-center justify-between mb-6">
        <h3 class="text-xl font-bold text-white flex items-center gap-2">
          <i class="fas fa-clock-rotate-left text-violet-400"></i> 进行中的项目
        </h3>
        <button class="text-sm text-violet-400 hover:text-violet-300 transition" @click="$router.push('/projects')">查看全部</button>
      </div>
      <div v-if="currentProjects.length === 0" class="glass-card rounded-2xl p-12 text-center">
        <i class="fas fa-film text-4xl text-gray-600 mb-4"></i>
        <p class="text-gray-400">还没有进行中的项目</p>
        <button @click="$router.push('/create')" class="mt-4 btn-primary px-6 py-3 rounded-xl text-white font-medium">开始创作</button>
      </div>
      <div v-else class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <div v-for="project in currentProjects" :key="project.id"
          class="project-card glass-card rounded-2xl overflow-hidden cursor-pointer"
          @click="goToProgress(project.id)"
        >
          <div class="relative h-48">
            <img :src="project.cover || 'https://images.unsplash.com/photo-1618336753974-aae8e04506aa?w=600&h=400&fit=crop'" class="w-full h-full object-cover" :alt="project.title">
            <div class="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent"></div>
            <div class="absolute bottom-4 left-4 right-4">
              <div class="flex items-center justify-between mb-2">
                <span class="fancy-tag" :class="stepTagClass(project.currentStep)">{{ stepLabel(project.currentStep) }}</span>
                <span class="text-xs text-gray-400">第 {{ project.currentStep || 1 }}/3 步</span>
              </div>
              <h4 class="text-lg font-bold text-white">{{ project.title }}</h4>
              <p class="text-xs text-gray-400 mt-1">上次编辑：{{ formatTime(project.updatedAt) }}</p>
            </div>
            <div class="absolute top-4 right-4">
              <div class="relative w-12 h-12">
                <svg class="progress-ring w-12 h-12" viewBox="0 0 48 48">
                  <circle cx="24" cy="24" r="20" fill="none" stroke="rgba(255,255,255,0.1)" stroke-width="3"/>
                  <circle cx="24" cy="24" r="20" fill="none" stroke="url(#gradient)" stroke-width="3"
                    :stroke-dasharray="project.progressPct * 1.256 || 125.6"
                    :stroke-dashoffset="125.6 - (project.progressPct || 0) * 1.256"
                    stroke-linecap="round" class="progress-ring-circle"/>
                  <defs><linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="0%"><stop offset="0%" stop-color="#8b5cf6"/><stop offset="100%" stop-color="#ec4899"/></linearGradient></defs>
                </svg>
                <span class="absolute inset-0 flex items-center justify-center text-xs font-bold text-white">{{ project.progressPct || 0 }}%</span>
              </div>
            </div>
          </div>
          <div class="p-4 flex items-center justify-between">
            <div class="flex items-center gap-2">
              <img :src="userAvatar || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=40&h=40&fit=crop'" class="w-6 h-6 rounded-full object-cover">
              <span class="text-xs text-gray-400">{{ userName || '创作者' }}</span>
            </div>
            <button class="px-4 py-1.5 rounded-lg bg-violet-500/20 text-violet-300 text-sm hover:bg-violet-500/30 transition">继续创作</button>
          </div>
        </div>
      </div>
    </div>

    <!-- 最近作品 -->
    <div class="mt-8">
      <div class="flex items-center justify-between mb-6">
        <h3 class="text-xl font-bold text-white flex items-center gap-2">
          <i class="fas fa-folder text-violet-400"></i> 最近作品
        </h3>
        <button class="text-sm text-violet-400 hover:text-violet-300 transition" @click="$router.push('/projects')">查看全部</button>
      </div>
      <div v-if="recentWorks.length === 0" class="glass-card rounded-2xl p-12 text-center">
        <p class="text-gray-400">还没有完成的作品</p>
      </div>
      <div v-else class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <div v-for="work in recentWorks" :key="work.id" class="glass-card rounded-2xl overflow-hidden">
          <div v-if="work.videoUrl" class="relative h-48">
            <video :src="work.videoUrl" class="w-full h-full object-cover" controls></video>
          </div>
          <div v-else class="h-48 bg-black/40 flex items-center justify-center">
            <i class="fas fa-video text-3xl text-gray-600"></i>
          </div>
          <div class="p-4">
            <h4 class="text-lg font-bold text-white">{{ work.title }}</h4>
            <div class="flex items-center gap-4 mt-2 text-sm text-gray-500">
              <span><i class="fas fa-heart text-pink-400 mr-1"></i>{{ work.likes || 0 }}</span>
              <span><i class="fas fa-eye text-cyan-400 mr-1"></i>{{ work.plays || 0 }}</span>
              <span>{{ formatTime(work.createdAt) }}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useUserStore } from '@/stores/user'
import { getDramaList } from '@/api/drama'

const router = useRouter()
const userStore = useUserStore()

const userName = ref('创作者小明')
const userAvatar = ref('https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=40&h=40&fit=crop')
const currentMonthWorks = ref(12)
const currentMonthPlays = ref(3200)

const stats = reactive({
  totalWorks: 24,
  totalPlays: 12500,
  totalLikes: 856,
  totalCoins: 2340
})

const recoverableTasks = ref([])
const currentProjects = ref([])
const recentWorks = ref([])

function formatNumber(n) {
  if (!n) return '0'
  if (n >= 10000) return (n / 10000).toFixed(1) + 'w'
  if (n >= 1000) return (n / 1000).toFixed(1) + 'k'
  return n.toString()
}

function formatTime(time) {
  if (!time) return ''
  const d = new Date(time)
  const now = new Date()
  const diff = now - d
  if (diff < 60000) return '刚刚'
  if (diff < 3600000) return `${Math.floor(diff / 60000)}分钟前`
  if (diff < 86400000) return `${Math.floor(diff / 3600000)}小时前`
  return `${d.getMonth() + 1}/${d.getDate()}`
}

function stepTagClass(step) {
  const map = { 1: 'bg-cyan-500/20 text-cyan-300 border-cyan-500/30', 2: 'bg-violet-500/20 text-violet-300 border-violet-500/30', 3: 'bg-fuchsia-500/20 text-fuchsia-300 border-fuchsia-500/30' }
  return map[step] || 'bg-gray-500/20 text-gray-300'
}

function stepLabel(step) {
  const map = { 1: '剧本导入', 2: '角色建模', 3: '分镜编辑' }
  return map[step] || '未知'
}

function goToProgress(id) {
  router.push(`/drama/${id}/progress`)
}

function resumeTask(id) {
  router.push(`/drama/${id}/progress`)
}

function saveDraft(id) {
  // 调用API存为草稿
  console.log('Save draft:', id)
}

onMounted(async () => {
  try {
    const res = await getDramaList({ page: 1, limit: 20 })
    if (res && res.data) {
      const list = res.data.list || res.data || []
      stats.totalWorks = list.length
      currentProjects.value = list.filter(d => d.status === 'processing' || d.status === 'pending').slice(0, 6)
      recentWorks.value = list.filter(d => d.status === 'completed').slice(0, 6)
      recoverableTasks.value = list.filter(d => d.status === 'failed').slice(0, 4)
    }
  } catch (e) {
    // Fallback to sample data if API fails
    recoverableTasks.value = [
      { id: '1', title: '西游漫剧 · 第一集', status: 'failed', description: '视频生成失败 · 第12/24镜头', progress: 50, errorMsg: '网络连接超时', updatedAt: new Date(Date.now() - 120000).toISOString() },
      { id: '2', title: '都市爱情 · 转角遇到你', status: 'pending', description: '角色生成中断 · 4/6角色', progress: 67, errorMsg: '用户主动暂停', updatedAt: new Date(Date.now() - 3600000).toISOString() }
    ]
    currentProjects.value = [
      { id: 'p1', title: '西游漫剧 · 第一集', cover: 'https://images.unsplash.com/photo-1618336753974-aae8e04506aa?w=600&h=400&fit=crop', currentStep: 2, progressPct: 67, updatedAt: new Date(Date.now() - 7200000).toISOString() },
      { id: 'p2', title: '都市爱情 · 转角遇到你', cover: 'https://images.unsplash.com/photo-1633613286991-611fe299c4be?w=600&h=400&fit=crop', currentStep: 3, progressPct: 90, updatedAt: new Date(Date.now() - 86400000).toISOString() },
      { id: 'p3', title: '古风仙侠 · 剑破苍穹', cover: 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?w=600&h=400&fit=crop', currentStep: 1, progressPct: 20, updatedAt: new Date(Date.now() - 259200000).toISOString() }
    ]
  }
})
</script>

<style scoped>
.dashboard-page {
  max-width: 1200px;
  margin: 0 auto;
}

.glass-card {
  background: rgba(30, 30, 58, 0.6);
  backdrop-filter: blur(16px);
  border: 1px solid rgba(255, 255, 255, 0.06);
  transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
}

.glass-card:hover {
  border-color: rgba(139, 92, 246, 0.3);
  transform: translateY(-4px);
  box-shadow: 0 20px 60px rgba(139, 92, 246, 0.15);
}

.glass {
  background: rgba(20, 20, 40, 0.7);
  backdrop-filter: blur(20px);
  border: 1px solid rgba(255, 255, 255, 0.08);
}

.btn-primary {
  background: linear-gradient(135deg, #7c3aed, #db2777);
  box-shadow: 0 4px 20px rgba(124, 58, 237, 0.4);
  transition: all 0.3s ease;
}

.btn-primary:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 30px rgba(124, 58, 237, 0.6);
}

.fancy-tag {
  display: inline-flex;
  align-items: center;
  padding: 4px 10px;
  border-radius: 100px;
  font-size: 12px;
  font-weight: 500;
  border: 1px solid;
}

.project-card::after {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 3px;
  background: linear-gradient(90deg, #8b5cf6, #ec4899);
  transform: scaleX(0);
  transition: transform 0.4s;
}

.project-card:hover::after {
  transform: scaleX(1);
}

.progress-ring-circle {
  transition: stroke-dashoffset 0.5s;
}
</style>
