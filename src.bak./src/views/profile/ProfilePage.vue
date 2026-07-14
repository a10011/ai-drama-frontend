<template>
  <div class="profile-page">
    <div class="glass-card rounded-3xl p-8 relative overflow-hidden">
      <div class="absolute top-0 right-0 w-96 h-96 bg-gradient-to-br from-violet-500/20 to-fuchsia-500/20 rounded-full blur-3xl -translate-y-1/2 translate-x-1/4"></div>
      <div class="relative z-10 flex items-center gap-6 flex-wrap">
        <div class="relative">
          <img :src="user.avatar || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=200&h=200&fit=crop'" class="w-24 h-24 rounded-2xl object-cover border-2 border-violet-500/50" alt="头像" />
          <div class="absolute -bottom-2 -right-2 w-8 h-8 rounded-lg bg-gradient-to-r from-violet-500 to-fuchsia-500 flex items-center justify-center cursor-pointer">
            <i class="fas fa-camera text-white text-xs"></i>
          </div>
        </div>
        <div class="flex-1 min-w-[200px]">
          <h2 class="text-3xl font-bold text-white mb-1">{{ user.name }}</h2>
          <p class="text-gray-400 mb-2">{{ user.email }} · {{ user.memberLevel }}</p>
          <div class="flex gap-2 flex-wrap">
            <span v-for="(tag, idx) in user.tags" :key="idx" class="fancy-tag" :class="tag.class">{{ tag.icon }} {{ tag.label }}</span>
          </div>
        </div>
        <div class="text-right">
          <button class="px-6 py-2.5 rounded-xl bg-gradient-to-r from-violet-600 to-fuchsia-600 text-white text-sm font-medium hover:shadow-lg transition" @click="editProfile">
            <i class="fas fa-pen mr-2"></i>编辑资料
          </button>
        </div>
      </div>
    </div>
    <div class="grid grid-cols-1 md:grid-cols-3 gap-6 mt-6">
      <div class="glass-card rounded-2xl p-6">
        <h3 class="text-lg font-semibold text-white mb-4 flex items-center gap-2"><i class="fas fa-chart-line text-violet-400"></i>创作统计</h3>
        <div class="space-y-4">
          <div v-for="(stat, key) in stats.creation" :key="key" class="flex items-center justify-between">
            <span class="text-sm text-gray-400">{{ stat.label }}</span>
            <span class="text-xl font-bold text-white">{{ stat.value }}</span>
          </div>
        </div>
      </div>
      <div class="glass-card rounded-2xl p-6">
        <h3 class="text-lg font-semibold text-white mb-4 flex items-center gap-2"><i class="fas fa-coins text-amber-400"></i>金币与积分</h3>
        <div class="space-y-4">
          <div v-for="(stat, key) in stats.coins" :key="key" class="flex items-center justify-between">
            <span class="text-sm text-gray-400">{{ stat.label }}</span>
            <span class="text-xl font-bold" :class="stat.color || 'text-white'">{{ stat.value }}</span>
          </div>
        </div>
      </div>
      <div class="glass-card rounded-2xl p-6">
        <h3 class="text-lg font-semibold text-white mb-4 flex items-center gap-2"><i class="fas fa-history text-cyan-400"></i>最近活动</h3>
        <div class="space-y-3">
          <div v-for="(act, idx) in recentActivities" :key="idx" class="flex items-center gap-3">
            <div class="w-2 h-2 rounded-full" :class="act.color"></div>
            <p class="text-sm text-gray-300">{{ act.text }}</p>
            <span class="text-xs text-gray-500 ml-auto">{{ act.time }}</span>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { ElMessage } from 'element-plus'

const user = ref({
  name: '创作者小明',
  email: 'xiaoming@example.com',
  memberLevel: 'VIP会员',
  avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=200&h=200&fit=crop',
  tags: [
    { icon: 'fas fa-crown', label: 'VIP', class: 'bg-violet-500/20 text-violet-300 border-violet-500/30' },
    { icon: 'fas fa-medal', label: '创作达人', class: 'bg-amber-500/20 text-amber-300 border-amber-500/30' },
    { icon: 'fas fa-star', label: '4.9评分', class: 'bg-cyan-500/20 text-cyan-300 border-cyan-500/30' }
  ]
})

const stats = ref({
  creation: [
    { label: '总作品', value: '24' },
    { label: '总播放', value: '12.5k' },
    { label: '获赞', value: '856' },
    { label: '粉丝', value: '1.2k' }
  ],
  coins: [
    { label: '当前金币', value: '2,340', color: 'text-amber-400' },
    { label: '累计消费', value: '15,600' },
    { label: '创作积分', value: '8,920' },
    { label: '等级', value: 'Lv.12', color: 'text-violet-400' }
  ]
})

const recentActivities = ref([
  { text: '创建了《西游漫剧》', time: '2小时前', color: 'bg-violet-500' },
  { text: '完成了《都市爱情》', time: '昨天', color: 'bg-fuchsia-500' },
  { text: '获得128个点赞', time: '3天前', color: 'bg-cyan-500' }
])

function editProfile() {
  ElMessage.info('编辑个人资料')
}
</script>

<style scoped>
.profile-page { max-width: 1200px; margin: 0 auto; }
.glass-card { background: rgba(30, 30, 58, 0.6); backdrop-filter: blur(16px); border: 1px solid rgba(255, 255, 255, 0.06); transition: all 0.3s; }
.fancy-tag { display: inline-flex; align-items: center; padding: 4px 10px; border-radius: 100px; font-size: 12px; font-weight: 500; border: 1px solid; gap: 4px; }
</style>
