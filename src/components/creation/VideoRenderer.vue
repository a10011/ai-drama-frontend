<template>
<div class="video-renderer">
  <h2 class="title">🎥 视频渲染</h2>
  <p class="sub">自动生成最终视频</p>

  <!-- 进度环 -->
  <div class="progress-section">
    <div class="progress-ring">
      <svg width="200" height="200" viewBox="0 0 200 200">
        <circle cx="100" cy="100" :r="radius" fill="none" stroke="rgba(255,255,255,0.05)" stroke-width="8" />
        <circle cx="100" cy="100" :r="radius" fill="none" :stroke="status==='completed'?'#4ade80':status==='failed'?'#ef4444':'#00d4ff'" stroke-width="8" stroke-linecap="round" :stroke-dasharray="circumference" :stroke-dashoffset="progressOffset" transform="rotate(-90 100 100)" style="transition: stroke-dashoffset 0.5s ease" />
      </svg>
      <div class="ring-center">
        <div class="percentage">{{ progress }}%</div>
        <div class="time-remaining">
          <template v-if="status === 'processing'">预计剩余 {{ formatTime(timeRemaining) }}</template>
          <template v-else-if="status === 'completed'">渲染完成！</template>
          <template v-else-if="status === 'failed'">渲染失败</template>
          <template v-else>准备中...</template>
        </div>
      </div>
    </div>
  </div>

  <!-- 阶段进度 -->
  <div class="stages" v-if="stages.length > 0">
    <div v-for="st in stages" :key="st.key" class="stage-row">
      <div class="st-icon">
        <span v-if="st.done">✅</span>
        <span v-else-if="st.current">🔄</span>
        <span v-else>⏳</span>
      </div>
      <div class="st-label">{{ st.label }}</div>
      <div v-if="st.current" class="st-progress">
        <div class="st-fill" :style="{width:(st.data?.progress||0)+'%'}"></div>
      </div>
    </div>
  </div>

  <!-- 视频预览 -->
  <div class="preview-container" v-if="status === 'processing' || status === 'completed'">
    <div class="preview-label">实时预览</div>
    <div class="preview-frame">
      <video v-if="videoUrl && status==='completed'" :src="videoUrl" controls class="final-video"></video>
      <div class="download-section" v-if="videoUrl && status==='completed'">
        <button class="download-btn" @click="downloadVideo">⬇️ 下载成片</button>
      </div>
      <img v-else-if="previewUrl" :src="previewUrl" alt="渲染预览" @error="handlePreviewError" />
      <div v-else class="preview-placeholder">
        <div class="loading-spinner"></div>
        <span>等待预览帧...</span>
      </div>
    </div>
  </div>

  <!-- 失败重试 -->
  <div class="action-container" v-if="status === 'failed'">
    <button class="retry-btn" @click="handleRetry">
      <span class="retry-icon">↻</span> 重新渲染
    </button>
  </div>

  <!-- 状态信息 -->
  <div class="status-info" v-if="statusMessage">{{ statusMessage }}</div>

  <!-- 下一步按钮 -->
  <div class="ftr" v-if="status === 'completed'">
    <button class="btn gold next" @click="go">下一步 →</button>
  </div>
</div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue'
import request from '@/utils/request'

const props = defineProps({
  taskId: { type: String, required: true },
  estimatedTime: { type: Number, default: 600 }
})
const emit = defineEmits(['next', 'retry'])

const progress = ref(0)
const status = ref('idle')
const statusMessage = ref('正在初始化...')
const timeRemaining = ref(props.estimatedTime)
const previewUrl = ref('')
const videoUrl = ref('')
const pipelineId = ref('')
const stages = ref([])

let statusTimer = null
let countdownTimer = null

const radius = 80
const circumference = 2 * Math.PI * radius
const progressOffset = computed(() => circumference - (progress.value / 100) * circumference)
const formatTime = (s) => String(Math.floor(s / 60)).padStart(2, '0') + ':' + String(s % 60).padStart(2, '0')

onMounted(async () => {
  await startPipeline()
})

onUnmounted(() => {
  clearInterval(statusTimer)
  clearInterval(countdownTimer)
})

async function startPipeline() {
  status.value = 'processing'
  statusMessage.value = '正在启动渲染管线...'

  try {
    const script = localStorage.getItem('__DRAMA_SCRIPT__') || ''
    const charsRaw = localStorage.getItem('__DRAMA_CHARS__') || '[]'
    const genre = localStorage.getItem('__DRAMA_GENRE__') || ''
    const scenesRaw = localStorage.getItem('__DRAMA_STORYBOARD__') || '[]'

    let characters = []
    try { characters = JSON.parse(charsRaw) } catch (e) { characters = [] }
    let scenes = []
    try { scenes = JSON.parse(scenesRaw) } catch (e) { scenes = [] }
    const res = await request({
      url: '/api/v1/pipeline/start',
      method: 'POST',
      data: {
        project_id: props.taskId,
        script_text: script,
        genre: genre,
        characters: characters,
        max_shots: scenes.length || 8
      },
      timeout: 30000
    })

    if (res && res.success && res.data) {
      pipelineId.value = res.data.pipeline_id || res.data.id || ''
      statusMessage.value = '管线已启动，正在渲染...'
      startCountdown()
      startPolling()
    } else {
      status.value = 'failed'
      statusMessage.value = '启动渲染管线失败'
    }
  } catch (e) {
    console.error('启动管线失败:', e)
    status.value = 'failed'
    statusMessage.value = '启动渲染管线失败: ' + (e.message || '网络错误')
  }

}
function startCountdown() {
  countdownTimer = setInterval(() => {
    if (timeRemaining.value > 0 && status.value === 'processing') {
      timeRemaining.value = Math.max(0, timeRemaining.value - 1)
    }
  }, 1000)
}

function startPolling() {
  pollStatus()
  statusTimer = setInterval(pollStatus, 5000)
}

async function pollStatus() {
  if (!pipelineId.value) return

  try {
    const res = await request({
      url: '/api/v1/pipeline/status/' + pipelineId.value,
      method: 'GET',
      timeout: 15000
    })

    if (res && res.success && res.data) {
      const d = res.data

      // 更新进度
      if (d.progress !== undefined) {
        progress.value = Math.min(Math.round(d.progress), 100)
      }

      // 更新阶段
      if (d.shots && Array.isArray(d.shots)) {
        stages.value = d.shots
      }

      // 更新状态消息
      if (d.message) {
        statusMessage.value = d.message
      } else if (d.current_stage) {
        statusMessage.value = '正在执行: ' + d.current_stage
      }

      // 更新状态
      if (d.status === 'completed' || d.status === 'done') {
        status.value = 'completed'
        statusMessage.value = '渲染完成！'
        progress.value = 100
        clearInterval(statusTimer)
        clearInterval(countdownTimer)
        if (d.video_url) {
          videoUrl.value = d.video_url
        }
      } else if (d.status === 'failed' || d.status === 'error') {
        status.value = 'failed'
        statusMessage.value = d.message || '渲染失败'
        clearInterval(statusTimer)
        clearInterval(countdownTimer)
      }
    }
  } catch (e) {
    console.error('轮询状态失败:', e)
  }

}
function handlePreviewError() {
  previewUrl.value = ''
}

function handleRetry() {
  clearInterval(statusTimer)
  clearInterval(countdownTimer)
  progress.value = 0
  status.value = 'idle'
  statusMessage.value = '正在重新启动...'
  timeRemaining.value = props.estimatedTime
  stages.value = []
  pipelineId.value = ''
  startPipeline()
  emit('retry')
}

function downloadVideo() {
  const a = document.createElement('a')
  a.href = videoUrl.value
  a.download = 'short-drama.mp4'
  a.click()
}

function go() {
  emit('next', videoUrl.value || previewUrl.value || '')
}
</script>

<style scoped>
.download-btn {
  margin-top: 16px;
  padding: 10px 24px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  border: none;
  border-radius: 8px;
  font-size: 16px;
  cursor: pointer;
  transition: transform 0.2s;
}
.download-btn:hover { transform: scale(1.05); }
.download-section { text-align: center; margin: 12px 0; }
.video-renderer {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 40px 20px;
  color: #e8e4dc;
  font-family: Consolas, monospace;
  min-height: 100%;
  box-sizing: border-box;
}
.title { color: #c49b4a; font-size: 18px; margin-bottom: 4px; }
.sub { color: #666; font-size: 12px; margin-bottom: 30px; }

.progress-section { margin-bottom: 30px; }
.progress-ring { position: relative; width: 200px; height: 200px; }
.ring-center {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  text-align: center;
}
.percentage {
  font-size: 48px;
  font-weight: bold;
  color: #00d4ff;
  text-shadow: 0 0 20px rgba(0, 212, 255, 0.5);
  margin-bottom: 8px;
}
.time-remaining { font-size: 14px; color: rgba(255, 255, 255, 0.7); white-space: nowrap; }

.stages {
  width: 100%;
  max-width: 800px;
  margin-bottom: 30px;
  display: flex;
  flex-direction: column;
  gap: 8px;
}
.stage-row {
  display: flex;
  align-items: center;
  gap: 10px;
  background: rgba(255, 255, 255, 0.03);
  padding: 8px 16px;
  border-radius: 6px;
  font-size: 13px;
}
.st-icon { font-size: 14px; min-width: 24px; }
.st-label { flex: 1; color: #ccc; }
.st-progress { flex: 1; max-width: 120px; height: 4px; background: #222; border-radius: 2px; overflow: hidden; }
.st-fill { height: 100%; background: #c49b4a; border-radius: 2px; transition: width 0.3s; }

.preview-container { width: 100%; max-width: 900px; margin-bottom: 30px; }
.preview-label { font-size: 14px; color: rgba(255, 255, 255, 0.6); margin-bottom: 12px; text-align: center; }
.preview-frame {
  width: 100%;
  aspect-ratio: 16/9;
  background: rgba(0, 0, 0, 0.3);
  border-radius: 12px;
  overflow: hidden;
  border: 2px solid rgba(0, 212, 255, 0.2);
  display: flex;
  align-items: center;
  justify-content: center;
}
.preview-frame img { width: 100%; height: 100%; object-fit: contain; }
.final-video { width: 100%; height: 100%; }
.preview-placeholder { display: flex; flex-direction: column; align-items: center; gap: 16px; color: rgba(255, 255, 255, 0.5); }
.loading-spinner {
  width: 40px;
  height: 40px;
  border: 3px solid rgba(0, 212, 255, 0.2);
  border-top-color: #00d4ff;
  border-radius: 50%;
  animation: spin 1s linear infinite;
}
@keyframes spin { to { transform: rotate(360deg) } }

.action-container { margin-bottom: 20px; }
.retry-btn {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 14px 32px;
  background: linear-gradient(135deg, #ef4444, #dc2626);
  color: white;
  border: none;
  border-radius: 8px;
  font-size: 16px;
  font-weight: 600;
  cursor: pointer;
  box-shadow: 0 4px 15px rgba(239, 68, 68, 0.3);
  transition: all 0.3s;
}
.retry-btn:hover { transform: translateY(-2px); box-shadow: 0 6px 20px rgba(239, 68, 68, 0.4); }
.retry-icon { font-size: 20px; animation: rotate 2s linear infinite; }
@keyframes rotate { from { transform: rotate(0deg) } to { transform: rotate(360deg) } }

.status-info {
  margin-top: 20px;
  padding: 12px 24px;
  background: rgba(0, 212, 255, 0.1);
  border: 1px solid rgba(0, 212, 255, 0.3);
  border-radius: 8px;
  color: rgba(255, 255, 255, 0.8);
  font-size: 14px;
  text-align: center;
  max-width: 800px;
}

.ftr {
  margin-top: 20px;
  padding: 16px;
  text-align: center;
  position: sticky;
  bottom: 0;
  background: #0a0a0a;
  z-index: 10;
  border-top: 1px solid #1a1a1a;
}
.btn {
  padding: 10px 24px;
  border: 1px solid #333;
  background: #171717;
  color: #e8e4dc;
  border-radius: 6px;
  cursor: pointer;
  font-family: Consolas, monospace;
  font-size: 13px;
  transition: .25s;
}
.btn.gold {
  background: linear-gradient(135deg, #c49b4a, #9a7b2e);
  color: #0a0a0a;
  font-weight: bold;
  border: none;
}
.btn.gold:hover { box-shadow: 0 4px 16px rgba(196, 155, 74, .4); }
.btn.next { font-size: 14px; padding: 10px 36px; }

@media (max-width: 768px) {
  .download-btn {
  margin-top: 16px;
  padding: 10px 24px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  border: none;
  border-radius: 8px;
  font-size: 16px;
  cursor: pointer;
  transition: transform 0.2s;
}
.download-btn:hover { transform: scale(1.05); }
.download-section { text-align: center; margin: 12px 0; }
.video-renderer { padding: 30px 15px; }
  .percentage { font-size: 36px; }
  .time-remaining { font-size: 12px; }
  .preview-container { max-width: 100%; }
  .retry-btn { padding: 12px 24px; font-size: 14px; }
}
</style>
