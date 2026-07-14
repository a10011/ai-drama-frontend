<template>
  <div class="projects-page">
    <div class="page-header">
      <h1>我的作品</h1>
      <el-button type="primary" size="large" @click="goCreate">
        <el-icon><Plus /></el-icon>
        创建新短剧
      </el-button>
    </div>

    <div class="projects-container">
      <el-empty v-if="!loading && list.length === 0" description="暂无作品，点击上方按钮创建" />

      <div v-else class="drama-list">
        <div 
          v-for="item in list" 
          :key="item.id"
          class="drama-card"
          @click="viewDrama(item)"
        >
          <div class="drama-cover">
            <div class="cover-placeholder" :class="item.mode">
              <el-icon :size="40"><VideoCamera /></el-icon>
              <span>{{ getModeLabel(item.mode) }}</span>
            </div>
            <!-- 视频预览（完成后） -->
            <video 
              v-if="item.status === 'completed' && item.videoUrl" 
              :src="item.videoUrl" 
              class="cover-video"
              muted
              preload="metadata"
            />
          </div>

          <div class="drama-info">
            <h3 class="drama-title">{{ item.title }}</h3>
            <div class="drama-meta">
              <span class="meta-item">
                <el-icon><Timer /></el-icon>
                {{ item.duration }}秒
              </span>
              <span class="meta-item">
                <el-icon><Calendar /></el-icon>
                {{ formatDate(item.createdAt) }}
              </span>
            </div>

            <div class="drama-status">
              <el-tag 
                :type="getStatusType(item.status)" 
                effect="dark"
                size="small"
                class="status-tag"
              >
                <el-icon v-if="item.status === 'processing' || item.status === 'pending'" class="is-loading"><Loading /></el-icon>
                {{ getStatusText(item.status) }}
              </el-tag>

              <!-- 进度条（处理中） -->
              <el-progress 
                v-if="item.status === 'processing'" 
                :percentage="item.progress" 
                :stroke-width="4"
                :show-text="false"
                class="mini-progress"
              />
            </div>
          </div>

          <div class="drama-actions">
            <el-button 
              v-if="item.status === 'completed'" 
              type="primary" 
              size="small"
              @click.stop="playVideo(item)"
            >
              <el-icon><VideoPlay /></el-icon> 播放
            </el-button>

            <el-button 
              v-if="item.status === 'processing' || item.status === 'pending'" 
              type="warning" 
              size="small"
              @click.stop="viewProgress(item)"
            >
              <el-icon><View /></el-icon> 查看进度
            </el-button>

            <el-button 
              v-if="item.status === 'failed'" 
              type="danger" 
              size="small"
              @click.stop="retryDramaItem(item)"
              :loading="retryLoading[item.id]"
            >
              <el-icon><RefreshRight /></el-icon> 重试
            </el-button>

            <el-dropdown @command="handleCommand($event, item)" @click.stop>
              <el-button size="small">
                <el-icon><MoreFilled /></el-icon>
              </el-button>
              <template #dropdown>
                <el-dropdown-menu>
                  <el-dropdown-item command="detail">
                    <el-icon><Document /></el-icon> 详情
                  </el-dropdown-item>
                  <el-dropdown-item command="download" v-if="item.status === 'completed'">
                    <el-icon><Download /></el-icon> 下载
                  </el-dropdown-item>
                  <el-dropdown-item command="share" v-if="item.status === 'completed'">
                    <el-icon><Share /></el-icon> 分享
                  </el-dropdown-item>
                  <el-dropdown-item command="delete" divided>
                    <el-icon><Delete /></el-icon> 删除
                  </el-dropdown-item>
                </el-dropdown-menu>
              </template>
            </el-dropdown>
          </div>
        </div>
      </div>

      <!-- 分页 -->
      <el-pagination
        v-if="total > limit"
        v-model:current-page="page"
        v-model:page-size="limit"
        :total="total"
        :page-sizes="[10, 20, 50]"
        layout="total, sizes, prev, pager, next"
        @change="fetchList"
        class="pagination"
      />
    </div>

    <!-- 视频播放弹窗 -->
    <el-dialog
      v-model="videoDialog.visible"
      :title="videoDialog.title"
      width="800px"
      destroy-on-close
    >
      <video 
        v-if="videoDialog.url" 
        :src="videoDialog.url" 
        controls 
        autoplay
        class="dialog-video"
      />
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted, onUnmounted } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage, ElMessageBox } from 'element-plus'
import { 
  Plus, VideoCamera, Timer, Calendar, Loading, 
  VideoPlay, View, RefreshRight, MoreFilled,
  Document, Download, Share, Delete
} from '@element-plus/icons-vue'
import { getDramaList, deleteDrama, retryDrama } from '@/api/drama'

const router = useRouter()
const loading = ref(false)
const list = ref([])
const page = ref(1)
const limit = ref(10)
const total = ref(0)
const retryLoading = reactive({})

const videoDialog = reactive({
  visible: false,
  title: '',
  url: ''
})

let pollTimer = null
let ws = null

const modes = {
  ai_real: 'AI真人',
  ai_anime: 'AI动画',
  text_to_video: '图文转视频'
}

const statusMap = {
  pending: { text: '排队中', type: 'info' },
  processing: { text: '生成中', type: 'warning' },
  completed: { text: '已完成', type: 'success' },
  failed: { text: '失败', type: 'danger' }
}

const getModeLabel = (mode) => modes[mode] || mode
const getStatusText = (status) => statusMap[status]?.text || status
const getStatusType = (status) => statusMap[status]?.type || 'info'

const formatDate = (date) => {
  if (!date) return ''
  const d = new Date(date)
  return `${d.getFullYear()}/${d.getMonth()+1}/${d.getDate()}`
}

const fetchList = async () => {
  loading.value = true
  try {
    const res = await getDramaList({ page: page.value, limit: limit.value })
    list.value = res.data.list
    total.value = res.data.total
  } catch (error) {
    ElMessage.error('获取作品列表失败')
  } finally {
    loading.value = false
  }
}

const goCreate = () => {
  router.push('/create')
}

const viewDrama = (item) => {
  if (item.status === 'processing' || item.status === 'pending') {
    viewProgress(item)
  } else if (item.status === 'completed') {
    playVideo(item)
  }
}

const viewProgress = (item) => {
  router.push(`/drama/${item.id}/progress`)
}

const playVideo = (item) => {
  videoDialog.title = item.title
  videoDialog.url = item.videoUrl
  videoDialog.visible = true
}

const retryDramaItem = async (item) => {
  retryLoading[item.id] = true
  try {
    await retryDrama(item.id)
    ElMessage.success('已重新提交生成')
    fetchList()
  } catch (error) {
    ElMessage.error('重试失败')
  } finally {
    retryLoading[item.id] = false
  }
}

const handleCommand = (command, item) => {
  switch (command) {
    case 'detail':
      router.push(`/drama/${item.id}/progress`)
      break
    case 'download':
      if (item.videoUrl) {
        const a = document.createElement('a')
        a.href = item.videoUrl
        a.download = `${item.title}.mp4`
        a.click()
      }
      break
    case 'share':
      const shareUrl = `https://ai.mzsh.top/drama/${item.id}`
      navigator.clipboard.writeText(shareUrl)
      ElMessage.success('分享链接已复制')
      break
    case 'delete':
      ElMessageBox.confirm('确定删除该作品？此操作不可恢复', '提示', {
        confirmButtonText: '删除',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(async () => {
        await deleteDrama(item.id)
        ElMessage.success('删除成功')
        fetchList()
      }).catch(() => {})
      break
  }
}

// 轮询更新状态
const startPolling = () => {
  pollTimer = setInterval(() => {
    const hasProcessing = list.value.some(item => 
      item.status === 'processing' || item.status === 'pending'
    )
    if (hasProcessing) {
      fetchList()
    }
  }, 5000)
}

// WebSocket连接
const connectWebSocket = () => {
  const token = localStorage.getItem('token')
  if (!token) return

  const wsUrl = `wss://api.mzsh.top/ws?token=${token}`
  ws = new WebSocket(wsUrl)

  ws.onmessage = (event) => {
    const data = JSON.parse(event.data)
    if (data.type === 'drama_progress' || data.type === 'drama_completed' || data.type === 'drama_failed') {
      const item = list.value.find(i => i.id === data.dramaId)
      if (item) {
        item.status = data.status || (data.type === 'drama_completed' ? 'completed' : 'failed')
        item.progress = data.progress || 100
        if (data.videoUrl) item.videoUrl = data.videoUrl
      }
    }
  }

  ws.onerror = () => {
    console.log('WebSocket连接失败')
  }
}

onMounted(() => {
  fetchList()
  startPolling()
  connectWebSocket()
})

onUnmounted(() => {
  clearInterval(pollTimer)
  if (ws) ws.close()
})
</script>

<style scoped>
.projects-page {
  max-width: 1200px;
  margin: 0 auto;
  padding: 20px;
}

.page-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 30px;
}

.page-header h1 {
  margin: 0;
  font-size: 28px;
}

.drama-list {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 20px;
}

.drama-card {
  background: #fff;
  border-radius: 12px;
  overflow: hidden;
  box-shadow: 0 2px 8px rgba(0,0,0,0.08);
  transition: all 0.3s;
  cursor: pointer;
}

.drama-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 16px rgba(0,0,0,0.12);
}

.drama-cover {
  position: relative;
  height: 180px;
  overflow: hidden;
}

.cover-placeholder {
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  color: #fff;
  gap: 8px;
}

.cover-placeholder.ai_real { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); }
.cover-placeholder.ai_anime { background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%); }
.cover-placeholder.text_to_video { background: linear-gradient(135deg, #4facfe 0%, #00f2fe 100%); }

.cover-video {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.drama-info {
  padding: 15px;
}

.drama-title {
  margin: 0 0 10px;
  font-size: 16px;
  font-weight: 600;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.drama-meta {
  display: flex;
  gap: 15px;
  margin-bottom: 12px;
  color: #909399;
  font-size: 13px;
}

.meta-item {
  display: flex;
  align-items: center;
  gap: 4px;
}

.drama-status {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.status-tag {
  align-self: flex-start;
}

.mini-progress {
  margin-top: 4px;
}

.drama-actions {
  display: flex;
  gap: 8px;
  padding: 12px 15px;
  border-top: 1px solid #ebeef5;
}

.pagination {
  margin-top: 30px;
  justify-content: center;
}

.dialog-video {
  width: 100%;
  border-radius: 8px;
}

.is-loading {
  animation: rotating 2s linear infinite;
}

@keyframes rotating {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}
</style>
