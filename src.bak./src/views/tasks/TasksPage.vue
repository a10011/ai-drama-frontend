<template>
  <div class="tasks-page">
    <div class="flex items-center justify-between mb-6">
      <div>
        <h2 class="text-3xl font-bold text-white mb-2">任务队列</h2>
        <p class="text-gray-400">管理所有生成任务，支持断点续传和失败恢复</p>
      </div>
      <div class="flex items-center gap-3">
        <button class="px-4 py-2 rounded-xl glass text-sm text-gray-400 hover:text-white transition" @click="clearCompleted"><i class="fas fa-broom mr-2"></i>清理已完成</button>
        <button class="px-4 py-2 rounded-xl glass text-sm text-gray-400 hover:text-white transition" @click="retryAllFailed"><i class="fas fa-redo mr-2"></i>重试全部失败</button>
      </div>
    </div>
    <div class="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
      <div class="glass rounded-2xl p-4">
        <div class="flex items-center gap-3">
          <div class="w-10 h-10 rounded-xl bg-blue-500/20 flex items-center justify-center"><i class="fas fa-tasks text-blue-400"></i></div>
          <div><p class="text-2xl font-bold text-white">{{ taskStats.total }}</p><p class="text-xs text-gray-500">总任务</p></div>
        </div>
      </div>
      <div class="glass rounded-2xl p-4">
        <div class="flex items-center gap-3">
          <div class="w-10 h-10 rounded-xl bg-green-500/20 flex items-center justify-center"><i class="fas fa-check-circle text-green-400"></i></div>
          <div><p class="text-2xl font-bold text-white">{{ taskStats.completed }}</p><p class="text-xs text-gray-500">已完成</p></div>
        </div>
      </div>
      <div class="glass rounded-2xl p-4">
        <div class="flex items-center gap-3">
          <div class="w-10 h-10 rounded-xl bg-amber-500/20 flex items-center justify-center"><i class="fas fa-clock text-amber-400"></i></div>
          <div><p class="text-2xl font-bold text-white">{{ taskStats.running }}</p><p class="text-xs text-gray-500">进行中</p></div>
        </div>
      </div>
      <div class="glass rounded-2xl p-4">
        <div class="flex items-center gap-3">
          <div class="w-10 h-10 rounded-xl bg-red-500/20 flex items-center justify-center"><i class="fas fa-exclamation-circle text-red-400"></i></div>
          <div><p class="text-2xl font-bold text-white">{{ taskStats.failed }}</p><p class="text-xs text-gray-500">失败/可恢复</p></div>
        </div>
      </div>
    </div>
    <div class="flex gap-2 mb-6 overflow-x-auto pb-2">
      <button v-for="(f, i) in filters" :key="f.key"
        class="fancy-tag cursor-pointer"
        :class="activeFilter === f.key ? f.activeClass : 'bg-white/5 text-gray-400 border-white/10'"
        @click="activeFilter = f.key"
      >{{ f.label }} ({{ f.count }})</button>
    </div>
    <div class="space-y-4">
      <div v-for="task in filteredTasks" :key="task.id"
        class="task-item rounded-2xl p-6"
        :class="[task.status === 'failed' ? 'task-failed' : task.status === 'completed' ? 'task-completed' : 'task-default']"
      >
        <div class="flex items-start gap-4">
          <div :class="['w-16 h-16 rounded-xl flex items-center justify-center flex-shrink-0',
            task.status === 'failed' ? 'bg-red-500/10' : task.status === 'completed' ? 'bg-green-500/10' : 'bg-amber-500/10']">
            <i :class="['fas text-2xl',
              task.status === 'failed' ? 'fa-film text-red-400' : task.status === 'completed' ? 'fa-check-circle text-green-400' : 'fa-spinner fa-spin text-amber-400']"></i>
          </div>
          <div class="flex-1">
            <div class="flex items-center justify-between mb-2">
              <div class="flex items-center gap-3">
                <h4 class="text-lg font-bold text-white">{{ task.title }}</h4>
                <span v-if="task.status === 'failed'" class="fancy-tag bg-red-500/20 text-red-400 border-red-500/30 text-xs">渲染失败</span>
                <span v-if="task.status === 'failed' || task.status === 'paused'" class="fancy-tag bg-blue-500/20 text-blue-300 border-blue-500/30 text-xs">可恢复</span>
                <span v-if="task.status === 'completed'" class="fancy-tag bg-green-500/20 text-green-400 border-green-500/30 text-xs">已完成</span>
                <span v-if="task.status === 'running'" class="fancy-tag bg-amber-500/20 text-amber-400 border-amber-500/30 text-xs">生成中</span>
              </div>
              <span class="text-xs text-gray-500">{{ formatTime(task.updatedAt) }}</span>
            </div>
            <p class="text-sm text-gray-400 mb-3">{{ task.description }}</p>
            <div class="flex items-center gap-6 mb-3">
              <div class="flex items-center gap-2"><span class="text-xs text-gray-500">进度</span><span class="text-sm text-white font-medium">{{ task.progress }}%</span></div>
              <div class="flex items-center gap-2"><span class="text-xs text-gray-500">已生成</span><span class="text-sm text-white">{{ task.done }}/{{ task.total }} 镜头</span></div>
              <div class="flex items-center gap-2"><span class="text-xs text-gray-500">预计恢复</span><span class="text-sm text-green-400">{{ task.eta }}</span></div>
              <div class="flex items-center gap-2"><span class="text-xs text-gray-500">保存点</span><span class="text-sm text-green-400">{{ task.checkpoint }}</span></div>
            </div>
            <div class="w-full bg-gray-800 rounded-full h-2 mb-4">
              <div class="h-full rounded-full" :style="{ width: task.progress + '%' }"
                :class="task.status === 'failed' ? 'bg-gradient-to-r from-red-500 via-amber-500 to-violet-500' : task.status === 'completed' ? 'bg-gradient-to-r from-green-500 to-emerald-500' : 'bg-gradient-to-r from-amber-500 to-violet-500'"
              ></div>
            </div>
            <div class="flex items-center gap-3">
              <button v-if="task.status === 'failed' || task.status === 'paused'"
                class="px-6 py-2.5 rounded-xl bg-gradient-to-r from-violet-600 to-fuchsia-600 text-white text-sm font-medium hover:shadow-lg transition flex items-center gap-2"
                @click="resumeTask(task.id)"><i class="fas fa-play"></i> 断点续传</button>
              <button v-if="task.status === 'failed' || task.status === 'paused'"
                class="px-4 py-2.5 rounded-xl glass text-sm text-gray-400 hover:text-white transition"
                @click="previewCheckpoint(task.id)"><i class="fas fa-eye mr-1"></i> 预览检查点</button>
              <button v-if="task.status === 'failed'"
                class="px-4 py-2.5 rounded-xl glass text-sm text-gray-400 hover:text-white transition"
                @click="downloadPartial(task.id)"><i class="fas fa-download mr-1"></i> 下载半成品</button>
              <button v-if="task.status === 'completed'"
                class="px-4 py-2.5 rounded-xl glass text-sm text-gray-400 hover:text-white transition"
                @click="downloadResult(task.id)"><i class="fas fa-download mr-1"></i> 下载成品</button>
              <button class="px-4 py-2.5 rounded-xl glass text-sm text-gray-400 hover:text-red-400 transition ml-auto"
                @click="deleteTask(task.id)"><i class="fas fa-trash"></i></button>
            </div>
          </div>
        </div>
      </div>
      <div v-if="filteredTasks.length === 0" class="glass-card rounded-2xl p-12 text-center">
        <i class="fas fa-inbox text-4xl text-gray-600 mb-4"></i>
        <p class="text-gray-400">暂无任务</p>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'

const router = useRouter()
const activeFilter = ref('all')

const allTasks = ref([
  { id: '1', title: '西游漫剧 · 第一集', status: 'failed', description: '视频生成 · 第12/24镜头渲染中断 · 网络连接超时', progress: 50, done: 12, total: 24, eta: '约6分钟', checkpoint: '自动保存', updatedAt: new Date(Date.now() - 120000).toISOString() },
  { id: '2', title: '都市爱情 · 转角遇到你', status: 'paused', description: '角色生成中断 · 4/6角色 · 用户主动暂停', progress: 67, done: 4, total: 6, eta: '约3分钟', checkpoint: '自动保存', updatedAt: new Date(Date.now() - 3600000).toISOString() },
  { id: '3', title: '古风仙侠 · 剑破苍穹', status: 'running', description: 'AI分镜生成中 ...', progress: 35, done: 8, total: 24, eta: '约15分钟', checkpoint: '手动保存', updatedAt: new Date(Date.now() - 7200000).toISOString() },
  { id: '4', title: '校园青春 · 那年夏天', status: 'completed', description: '视频生成完成 · 24/24镜头', progress: 100, done: 24, total: 24, eta: '-', checkpoint: '自动保存', updatedAt: new Date(Date.now() - 86400000).toISOString() },
  { id: '5', title: '悬疑短剧 · 消失的她', status: 'completed', description: '视频生成完成 · 18/18镜头', progress: 100, done: 18, total: 18, eta: '-', checkpoint: '自动保存', updatedAt: new Date(Date.now() - 172800000).toISOString() }
])

const taskStats = computed(() => ({
  total: allTasks.value.length,
  completed: allTasks.value.filter(t => t.status === 'completed').length,
  running: allTasks.value.filter(t => t.status === 'running').length,
  failed: allTasks.value.filter(t => t.status === 'failed' || t.status === 'paused').length
}))

const filters = computed(() => [
  { key: 'all', label: '全部', count: allTasks.value.length, activeClass: 'bg-violet-500/20 text-violet-300 border-violet-500/30' },
  { key: 'running', label: '进行中', count: allTasks.value.filter(t => t.status === 'running').length, activeClass: 'bg-amber-500/20 text-amber-300 border-amber-500/30' },
  { key: 'failed', label: '失败可恢复', count: allTasks.value.filter(t => t.status === 'failed' || t.status === 'paused').length, activeClass: 'bg-red-500/20 text-red-400 border-red-500/30' },
  { key: 'completed', label: '已完成', count: allTasks.value.filter(t => t.status === 'completed').length, activeClass: 'bg-green-500/20 text-green-400 border-green-500/30' },
  { key: 'draft', label: '草稿保存', count: allTasks.value.filter(t => t.status === 'draft').length, activeClass: 'bg-gray-500/20 text-gray-300 border-gray-500/30' }
])

const filteredTasks = computed(() => {
  if (activeFilter.value === 'all') return allTasks.value
  return allTasks.value.filter(t => t.status === activeFilter.value)
})

function formatTime(time) {
  if (!time) return ''
  const d = new Date(time)
  const now = new Date()
  const diff = now - d
  if (diff < 60000) return '刚刚'
  if (diff < 3600000) return Math.floor(diff / 60000) + '分钟前'
  if (diff < 86400000) return Math.floor(diff / 3600000) + '小时前'
  return (d.getMonth() + 1) + '/' + d.getDate()
}

function resumeTask(id) { router.push('/drama/' + id + '/progress') }
function previewCheckpoint(id) { ElMessage.info('预览检查点: ' + id) }
function downloadPartial(id) { ElMessage.info('下载半成品: ' + id) }
function downloadResult(id) { ElMessage.info('下载成品: ' + id) }
function deleteTask(id) { allTasks.value = allTasks.value.filter(t => t.id !== id); ElMessage.success('已删除') }
function clearCompleted() { allTasks.value = allTasks.value.filter(t => t.status !== 'completed'); ElMessage.success('已清理') }
function retryAllFailed() { ElMessage.info('重试所有失败任务') }
</script>

<style scoped>
.tasks-page { max-width: 1200px; margin: 0 auto; }
.glass-card { background: rgba(30, 30, 58, 0.6); backdrop-filter: blur(16px); border: 1px solid rgba(255, 255, 255, 0.06); }
.glass { background: rgba(20, 20, 40, 0.7); backdrop-filter: blur(20px); border: 1px solid rgba(255, 255, 255, 0.08); }
.fancy-tag { display: inline-flex; align-items: center; padding: 6px 14px; border-radius: 100px; font-size: 12px; font-weight: 500; border: 1px solid; }
.task-item { background: rgba(30, 30, 58, 0.8); border: 1px solid rgba(255, 255, 255, 0.06); transition: all 0.3s; }
.task-item:hover { border-color: rgba(139, 92, 246, 0.3); }
.task-failed { border-color: rgba(239, 68, 68, 0.3); background: rgba(239, 68, 68, 0.05); }
.task-completed { border-color: rgba(16, 185, 129, 0.3); background: rgba(16, 185, 129, 0.05); }
</style>
