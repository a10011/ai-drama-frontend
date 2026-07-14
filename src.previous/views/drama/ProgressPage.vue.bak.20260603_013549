<template>
  <div class="progress-page">
    <div class="progress-header">
      <h2>{{ drama.title }}</h2>
      <el-tag :type="statusType" effect="dark">{{ statusText }}</el-tag>
    </div>

    <div class="progress-container">
      <!-- 进度条 -->
      <div class="progress-section">
        <el-progress 
          :percentage="progress" 
          :status="progressStatus"
          :stroke-width="20"
          :text-inside="true"
        />
        <p class="progress-desc">{{ progressDesc }}</p>
      </div>

      <!-- 步骤详情 -->
      <div class="steps-detail">
        <div 
          v-for="(step, index) in steps" 
          :key="index"
          class="step-item"
          :class="{ 
            active: currentStepIndex === index,
            completed: currentStepIndex > index,
            pending: currentStepIndex < index 
          }"
        >
          <div class="step-icon">
            <el-icon v-if="currentStepIndex > index"><Check /></el-icon>
            <el-icon v-else-if="currentStepIndex === index"><Loading /></el-icon>
            <span v-else>{{ index + 1 }}</span>
          </div>
          <div class="step-info">
            <h4>{{ step.name }}</h4>
            <p>{{ step.desc }}</p>
          </div>
        </div>
      </div>

      <!-- 视频预览（生成完成后） -->
      <div v-if="drama.status === 'completed'" class="video-preview">
        <video :src="drama.videoUrl" controls class="preview-player" />
        <div class="video-actions">
          <el-button type="primary" @click="downloadVideo">
            <el-icon><Download /></el-icon> 下载视频
          </el-button>
          <el-button @click="shareVideo">
            <el-icon><Share /></el-icon> 分享
          </el-button>
          <el-button @click="goBack">返回列表</el-button>
        </div>
      </div>

      <!-- 错误重试 -->
      <div v-if="drama.status === 'failed'" class="error-section">
        <el-result
          icon="error"
          title="生成失败"
          :sub-title="drama.errorMsg || '请检查网络或联系客服'"
        >
          <template #extra>
            <el-button type="primary" @click="retryGenerate" :loading="retrying">重新生成</el-button>
            <el-button @click="goBack">返回列表</el-button>
          </template>
        </el-result>
      </div>

      <!-- 取消按钮（处理中） -->
      <div v-if="drama.status === 'processing' || drama.status === 'pending'" class="cancel-section">
        <el-button @click="goBack">返回列表</el-button>
      </div>
    </div>

    <!-- 实时日志 -->
    <el-collapse v-if="logs.length > 0" class="log-collapse">
      <el-collapse-item title="生成日志" name="logs">
        <div class="log-container">
          <p v-for="(log, i) in logs" :key="i" class="log-line">
            <span class="log-time">{{ log.time }}</span>
            <span :class="['log-level', log.level]">{{ log.level }}</span>
            <span class="log-msg">{{ log.message }}</span>
          </p>
        </div>
      </el-collapse-item>
    </el-collapse>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { Check, Loading, Download, Share } from '@element-plus/icons-vue'
import { ElMessage } from 'element-plus'
import { getDramaDetail, retryDrama } from '@/api/drama'

const route = useRoute()
const router = useRouter()
const dramaId = route.params.id

const drama = ref({
  title: '',
  status: 'pending',
  progress: 0,
  videoUrl: '',
  errorMsg: ''
})

const logs = ref([])
const retrying = ref(false)
let pollTimer = null
let ws = null

const steps = [
  { name: '剧本解析', desc: 'AI分析剧本内容，提取场景和角色' },
  { name: '分镜生成', desc: '根据剧本生成分镜脚本和画面描述' },
  { name: '画面生成', desc: '调用AI模型生成视频画面' },
  { name: '配音合成', desc: '合成角色配音和背景音乐' },
  { name: '视频合成', desc: '合成最终视频并添加特效' }
]

const progress = computed(() => drama.value.progress || 0)
const currentStepIndex = computed(() => Math.min(Math.floor(progress.value / 20), 4))

const statusType = computed(() => {
  const map = { pending: 'info', processing: 'primary', completed: 'success', failed: 'danger' }
  return map[drama.value.status] || 'info'
})

const statusText = computed(() => {
  const map = { pending: '排队中', processing: '生成中', completed: '已完成', failed: '失败' }
  return map[drama.value.status] || '未知'
})

const progressStatus = computed(() => {
  if (drama.value.status === 'completed') return 'success'
  if (drama.value.status === 'failed') return 'exception'
  return ''
})

const progressDesc = computed(() => {
  if (drama.value.status === 'pending') return '任务排队中，请稍候...'
  if (drama.value.status === 'processing') {
    return `正在${steps[currentStepIndex.value]?.name || '处理'}...`
  }
  if (drama.value.status === 'completed') return '视频生成完成！'
  if (drama.value.status === 'failed') return '生成失败，请重试'
  return ''
})

// 轮询获取进度
const fetchProgress = async () => {
  try {
    const res = await getDramaDetail(dramaId)
    drama.value = res.data

    if (drama.value.status === 'processing') {
      logs.value.push({
        time: new Date().toLocaleTimeString(),
        level: 'info',
        message: `进度更新: ${drama.value.progress}%`
      })
      if (logs.value.length > 50) logs.value.shift()
    }

    if (['completed', 'failed'].includes(drama.value.status)) {
      clearInterval(pollTimer)
      if (drama.value.status === 'completed') {
        ElMessage.success('视频生成完成！')
      }
    }
  } catch (error) {
    console.error('获取进度失败:', error)
  }
}

const retryGenerate = async () => {
  retrying.value = true
  try {
    await retryDrama(dramaId)
    drama.value.status = 'pending'
    drama.value.progress = 0
    logs.value = []
    startPolling()
    ElMessage.success('已重新提交生成任务')
  } catch (error) {
    ElMessage.error('重试失败')
  } finally {
    retrying.value = false
  }
}

const downloadVideo = () => {
  if (drama.value.videoUrl) {
    const a = document.createElement('a')
    a.href = drama.value.videoUrl
    a.download = `${drama.value.title}.mp4`
    a.click()
  }
}

const shareVideo = () => {
  const shareUrl = `https://ai.mzsh.top/drama/${dramaId}`
  navigator.clipboard.writeText(shareUrl)
  ElMessage.success('分享链接已复制')
}

const goBack = () => {
  router.push('/projects')
}

const startPolling = () => {
  fetchProgress()
  pollTimer = setInterval(fetchProgress, 3000)
}

// WebSocket
const connectWebSocket = () => {
  const token = localStorage.getItem('token')
  if (!token) return

  const wsUrl = `wss://api.mzsh.top/ws?token=${token}`
  ws = new WebSocket(wsUrl)

  ws.onmessage = (event) => {
    const data = JSON.parse(event.data)
    if (data.dramaId === dramaId) {
      if (data.type === 'drama_progress') {
        drama.value.progress = data.progress
        drama.value.status = data.status
        logs.value.push({
          time: new Date().toLocaleTimeString(),
          level: data.level || 'info',
          message: data.message
        })
      }
      if (data.type === 'drama_completed') {
        drama.value.status = 'completed'
        drama.value.progress = 100
        drama.value.videoUrl = data.videoUrl
        clearInterval(pollTimer)
        ElMessage.success('视频生成完成！')
      }
      if (data.type === 'drama_failed') {
        drama.value.status = 'failed'
        drama.value.errorMsg = data.error
        clearInterval(pollTimer)
      }
    }
  }
}

onMounted(() => {
  startPolling()
  connectWebSocket()
})

onUnmounted(() => {
  clearInterval(pollTimer)
  if (ws) ws.close()
})
</script>

<style scoped>
.progress-page {
  max-width: 800px;
  margin: 0 auto;
  padding: 20px;
}

.progress-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 30px;
}

.progress-container {
  background: #fff;
  border-radius: 12px;
  padding: 30px;
  box-shadow: 0 2px 12px rgba(0,0,0,0.1);
}

.progress-section {
  margin-bottom: 40px;
}

.progress-desc {
  text-align: center;
  color: #606266;
  margin-top: 15px;
}

.steps-detail {
  margin: 30px 0;
}

.step-item {
  display: flex;
  align-items: flex-start;
  padding: 15px;
  margin-bottom: 10px;
  border-radius: 8px;
  transition: all 0.3s;
}

.step-item.active {
  background: #f0f9ff;
  border-left: 3px solid #409eff;
}

.step-item.completed {
  opacity: 0.7;
}

.step-item.pending {
  opacity: 0.5;
}

.step-icon {
  width: 36px;
  height: 36px;
  border-radius: 50%;
  background: #e4e7ed;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-right: 15px;
  flex-shrink: 0;
}

.step-item.active .step-icon {
  background: #409eff;
  color: #fff;
}

.step-item.completed .step-icon {
  background: #67c23a;
  color: #fff;
}

.step-info h4 {
  margin: 0 0 5px;
  font-size: 16px;
}

.step-info p {
  margin: 0;
  color: #909399;
  font-size: 14px;
}

.video-preview {
  margin-top: 30px;
  text-align: center;
}

.preview-player {
  width: 100%;
  max-height: 400px;
  border-radius: 8px;
  background: #000;
}

.video-actions {
  margin-top: 20px;
  display: flex;
  justify-content: center;
  gap: 15px;
}

.error-section {
  margin-top: 30px;
}

.cancel-section {
  margin-top: 20px;
  text-align: center;
}

.log-collapse {
  margin-top: 20px;
}

.log-container {
  max-height: 300px;
  overflow-y: auto;
  background: #1e1e1e;
  color: #d4d4d4;
  padding: 15px;
  border-radius: 8px;
  font-family: 'Courier New', monospace;
  font-size: 13px;
}

.log-line {
  margin: 5px 0;
  line-height: 1.6;
}

.log-time {
  color: #858585;
  margin-right: 10px;
}

.log-level {
  padding: 2px 6px;
  border-radius: 3px;
  margin-right: 10px;
  font-size: 12px;
}

.log-level.info { background: #0e639c; color: #fff; }
.log-level.success { background: #16825d; color: #fff; }
.log-level.error { background: #c72c0c; color: #fff; }
</style>
