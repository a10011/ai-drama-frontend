<template>
  <div class="dashboard-page">
    <!-- 顶部统计面板 -->
    <div class="stats-grid">
      <div class="stat-card glass-card">
        <div class="stat-icon"><el-icon :size="28"><VideoCamera /></el-icon></div>
        <div class="stat-info">
          <span class="stat-value">{{ stats.totalWorks }}</span>
          <span class="stat-label">总作品</span>
        </div>
      </div>
      <div class="stat-card glass-card">
        <div class="stat-icon"><el-icon :size="28"><View /></el-icon></div>
        <div class="stat-info">
          <span class="stat-value">{{ stats.totalPlays }}</span>
          <span class="stat-label">总播放</span>
        </div>
      </div>
      <div class="stat-card glass-card">
        <div class="stat-icon"><el-icon :size="28"><Star /></el-icon></div>
        <div class="stat-info">
          <span class="stat-value">{{ stats.totalLikes }}</span>
          <span class="stat-label">获赞</span>
        </div>
      </div>
      <div class="stat-card glass-card">
        <div class="stat-icon"><el-icon :size="28"><Coin /></el-icon></div>
        <div class="stat-info">
          <span class="stat-value">{{ stats.totalCoins }}</span>
          <span class="stat-label">金币</span>
        </div>
      </div>
    </div>

    <!-- 可恢复任务区域 -->
    <div v-if="recoverableTasks.length > 0" class="section">
      <div class="section-header">
        <h3><el-icon><Refresh /></el-icon> 可恢复的任务</h3>
        <el-button text type="primary" @click="recoverAll">全部恢复</el-button>
      </div>
      <div class="tasks-list">
        <div v-for="task in recoverableTasks" :key="task.id" class="task-card glass-card">
          <div class="task-info">
            <h4>{{ task.title }}</h4>
            <div class="task-meta">
              <el-tag :type="task.status === 'failed' ? 'danger' : 'warning'" size="small">
                {{ task.status === 'failed' ? '失败' : '等待中' }}
              </el-tag>
              <span class="task-progress">{{ task.progress }}%</span>
              <span class="task-time">{{ formatTime(task.updatedAt) }}</span>
            </div>
            <p v-if="task.errorMsg" class="task-error">{{ task.errorMsg }}</p>
          </div>
          <div class="task-actions">
            <el-button type="primary" size="small" @click="recoverTask(task.id)">断点续传</el-button>
            <el-button size="small" @click="saveDraft(task.id)">存为草稿</el-button>
          </div>
        </div>
      </div>
    </div>

    <!-- 进行中的项目 -->
    <div class="section">
      <div class="section-header">
        <h3><el-icon><Loading /></el-icon> 进行中的项目</h3>
        <el-button text type="primary" @click="goCreate">＋ 新建项目</el-button>
      </div>
      <div v-if="currentProjects.length === 0" class="empty-state glass-card">
        <el-icon :size="48"><VideoCamera /></el-icon>
        <p>还没有进行中的项目</p>
        <el-button type="primary" @click="goCreate">开始创作</el-button>
      </div>
      <div v-else class="project-grid">
        <div v-for="project in currentProjects" :key="project.id" class="project-card glass-card" @click="goProgress(project.id)">
          <div class="project-cover">
            <img :src="project.cover || '/default-cover.jpg'" :alt="project.title" />
            <div class="project-status">
              <el-tag :type="statusTag(project.status)" size="small">{{ statusLabel(project.status) }}</el-tag>
            </div>
          </div>
          <div class="project-body">
            <h4>{{ project.title }}</h4>
            <div class="progress-ring">
              <svg viewBox="0 0 36 36" class="ring-svg">
                <path class="ring-bg" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" />
                <path class="ring-fill" :stroke-dasharray="`${project.progress}, 100`" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" />
                <text x="18" y="20.5" class="ring-text">{{ project.progress }}%</text>
              </svg>
            </div>
            <div class="project-meta">
              <span><el-icon><Clock /></el-icon> {{ formatTime(project.updatedAt) }}</span>
              <span><el-icon><VideoCamera /></el-icon> {{ project.mode === 'ai_real' ? 'AI真人' : project.mode }}</span>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- 作品列表 -->
    <div class="section">
      <div class="section-header">
        <h3><el-icon><Folder /></el-icon> 最近作品</h3>
        <el-button text type="primary" @click="$router.push('/projects')">查看全部</el-button>
      </div>
      <div v-if="recentWorks.length === 0" class="empty-state glass-card">
        <p>还没有完成的作品</p>
      </div>
      <div v-else class="works-grid">
        <div v-for="work in recentWorks" :key="work.id" class="work-card glass-card">
          <video v-if="work.videoUrl" :src="work.videoUrl" controls class="work-video"></video>
          <div v-else class="work-no-video">
            <el-icon :size="40"><VideoCamera /></el-icon>
            <p>视频生成中...</p>
          </div>
          <div class="work-info">
            <h4>{{ work.title }}</h4>
            <div class="work-stats">
              <span>❤️ {{ work.likes || 0 }}</span>
              <span>👁️ {{ work.plays || 0 }}</span>
              <span>{{ formatTime(work.createdAt) }}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { getDramaList } from '@/api/drama'
import { VideoCamera, View, Star, Coin, Refresh, Loading, Clock, Folder } from '@element-plus/icons-vue'

const router = useRouter()

const stats = ref({
  totalWorks: 0,
  totalPlays: 1250,
  totalLikes: 328,
  totalCoins: 156
})

const recoverableTasks = ref([])
const currentProjects = ref([])
const recentWorks = ref([])

function statusTag(status) {
  const map = { pending: 'info', processing: 'warning', completed: 'success', failed: 'danger' }
  return map[status] || 'info'
}

function statusLabel(status) {
  const map = { pending: '等待中', processing: '生成中', completed: '已完成', failed: '失败' }
  return map[status] || status
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

function goCreate() {
  router.push('/create')
}

function goProgress(id) {
  router.push(`/drama/${id}/progress`)
}

function recoverTask(id) {
  // 断点续传逻辑
  console.log('Recover task:', id)
}

function recoverAll() {
  recoverableTasks.value.forEach(t => recoverTask(t.id))
}

function saveDraft(id) {
  // 存为草稿
  console.log('Save draft:', id)
}

onMounted(async () => {
  try {
    const res = await getDramaList({ page: 1, limit: 20 })
    if (res.data) {
      const list = res.data.list || res.data || []
      stats.value.totalWorks = list.length
      currentProjects.value = list.filter(d => d.status === 'processing' || d.status === 'pending')
      recentWorks.value = list.filter(d => d.status === 'completed').slice(0, 6)
      recoverableTasks.value = list.filter(d => d.status === 'failed')
    }
  } catch (e) {
    // silent
  }
})
</script>

<style scoped>
.dashboard-page {
  max-width: 1200px;
  margin: 0 auto;
  padding: 20px;
}

.section {
  margin-bottom: 32px;
}

.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
}

.section-header h3 {
  font-size: 18px;
  font-weight: 600;
  display: flex;
  align-items: center;
  gap: 8px;
  color: #1a1a2e;
}

/* Glass card */
.glass-card {
  background: rgba(255, 255, 255, 0.85);
  backdrop-filter: blur(12px);
  -webkit-backdrop-filter: blur(12px);
  border: 1px solid rgba(255, 255, 255, 0.3);
  border-radius: 16px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.06);
  transition: all 0.3s ease;
}

.glass-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 30px rgba(0, 0, 0, 0.1);
}

/* Stats grid */
.stats-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 16px;
  margin-bottom: 32px;
}

.stat-card {
  display: flex;
  align-items: center;
  padding: 20px;
  gap: 16px;
}

.stat-icon {
  width: 52px;
  height: 52px;
  border-radius: 14px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: #fff;
}

.stat-info {
  display: flex;
  flex-direction: column;
}

.stat-value {
  font-size: 24px;
  font-weight: 700;
  color: #1a1a2e;
}

.stat-label {
  font-size: 13px;
  color: #909399;
  margin-top: 2px;
}

/* Tasks */
.tasks-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.task-card {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px 20px;
}

.task-info h4 {
  margin: 0 0 8px 0;
  font-size: 15px;
}

.task-meta {
  display: flex;
  align-items: center;
  gap: 10px;
  font-size: 13px;
  color: #909399;
}

.task-error {
  color: #f56c6c;
  font-size: 12px;
  margin: 6px 0 0;
}

.task-actions {
  display: flex;
  gap: 8px;
}

/* Projects */
.project-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(240px, 1fr));
  gap: 16px;
}

.project-card {
  cursor: pointer;
  overflow: hidden;
}

.project-cover {
  position: relative;
  height: 140px;
  background: linear-gradient(135deg, #667eea33, #764ba233);
  overflow: hidden;
}

.project-cover img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.project-status {
  position: absolute;
  top: 10px;
  right: 10px;
}

.project-body {
  padding: 14px;
}

.project-body h4 {
  margin: 0 0 10px 0;
  font-size: 15px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.progress-ring {
  display: flex;
  justify-content: center;
  margin-bottom: 10px;
}

.ring-svg {
  width: 48px;
  height: 48px;
}

.ring-bg {
  fill: none;
  stroke: #eee;
  stroke-width: 3;
}

.ring-fill {
  fill: none;
  stroke: #667eea;
  stroke-width: 3;
  stroke-linecap: round;
  transition: stroke-dasharray 0.5s;
}

.ring-text {
  font-size: 8px;
  text-anchor: middle;
  fill: #667eea;
  font-weight: 700;
}

.project-meta {
  display: flex;
  justify-content: space-between;
  font-size: 12px;
  color: #909399;
}

.project-meta span {
  display: flex;
  align-items: center;
  gap: 4px;
}

/* Works */
.works-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
  gap: 16px;
}

.work-card {
  overflow: hidden;
}

.work-video {
  width: 100%;
  height: 140px;
  object-fit: cover;
  display: block;
}

.work-no-video {
  height: 140px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  background: #f5f7fa;
  color: #c0c4cc;
}

.work-no-video p {
  margin-top: 8px;
  font-size: 13px;
}

.work-info {
  padding: 12px;
}

.work-info h4 {
  margin: 0 0 6px;
  font-size: 14px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.work-stats {
  display: flex;
  gap: 12px;
  font-size: 12px;
  color: #909399;
}

/* Empty */
.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 60px 20px;
  color: #c0c4cc;
}

.empty-state p {
  margin: 16px 0;
  font-size: 15px;
}

/* Responsive */
@media (max-width: 768px) {
  .stats-grid {
    grid-template-columns: repeat(2, 1fr);
  }
}
</style>
