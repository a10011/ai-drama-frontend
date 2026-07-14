<template>
  <div class="generate-page">
    <div class="max-w-3xl mx-auto space-y-6">
      <div class="flex items-center justify-between mb-6">
        <div>
          <h2 class="text-3xl font-bold text-white mb-2 gradient-text">{{ dramaTitle }}</h2>
          <p class="text-gray-400">AI智能体流水线生成中...</p>
        </div>
        <span class="px-3 py-1 rounded-full bg-blue-100 text-blue-700 text-sm font-medium">生成中</span>
      </div>

      <!-- 总体进度 -->
      <div class="glass-card rounded-2xl p-6">
        <div class="flex items-center justify-between mb-2">
          <span class="text-sm font-medium text-gray-400">总体进度</span>
          <span class="text-sm font-bold text-violet-400">{{ totalPercent }}%</span>
        </div>
        <div class="w-full bg-gray-800 rounded-full h-3 mb-3">
          <div class="h-full bg-gradient-to-r from-violet-500 via-fuchsia-500 to-cyan-500 rounded-full transition-all duration-500" :style="{ width: totalPercent + '%' }"></div>
        </div>
        <p class="text-sm text-gray-500 text-center">{{ currentStatusText }}</p>
      </div>

      <!-- 智能体列表 -->
      <div class="space-y-3">
        <div v-for="(agent, idx) in agents" :key="idx"
          class="agent-card rounded-xl p-4 border-l-4"
          :class="agent.status === 'completed' ? 'border-green-500' : agent.status === 'active' ? 'border-violet-500' : 'border-gray-700 opacity-60'"
        >
          <div class="flex items-start gap-4">
            <div class="w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 relative"
              :class="agent.status === 'completed' ? 'bg-green-500/20' : agent.status === 'active' ? 'bg-violet-500/20' : 'bg-gray-700/50'"
            >
              <div v-if="agent.status === 'active'" class="absolute inset-0 rounded-full border-2 border-violet-500 animate-ping"></div>
              <i v-if="agent.status === 'completed'" class="fas fa-check text-green-400"></i>
              <i v-else-if="agent.status === 'active'" class="fas fa-spinner fa-spin text-violet-400 relative z-10"></i>
              <span v-else class="text-sm font-bold text-gray-500">{{ idx + 1 }}</span>
            </div>
            <div class="flex-1">
              <div class="flex items-center justify-between mb-1">
                <div class="flex items-center gap-2 flex-wrap">
                  <h3 class="font-semibold" :class="agent.status === 'pending' ? 'text-gray-500' : 'text-white'">{{ agent.name }}</h3>
                  <span class="agent-tag text-xs"><i class="fas fa-robot mr-1"></i>{{ agent.agentType }}</span>
                  <span v-if="agent.memory" class="memory-badge"><i class="fas fa-brain text-xs"></i>记忆 {{ agent.memory }} 条</span>
                  <span v-if="agent.status === 'active' && agent.learning" class="learning-badge"><i class="fas fa-brain text-xs"></i>深度学习</span>
                </div>
                <span class="text-xs" :class="agent.status === 'completed' ? 'text-green-400' : agent.status === 'active' ? 'text-violet-400' : 'text-gray-600'">
                  {{ agent.status === 'completed' ? '已完成' : agent.status === 'active' ? '进行中' : '等待中' }}
                </span>
              </div>
              <p class="text-sm" :class="agent.status === 'pending' ? 'text-gray-600' : 'text-gray-400'">{{ agent.description }}</p>

              <!-- 技能矩阵 (active agent only) -->
              <div v-if="agent.status === 'active' && agent.skills" class="mt-2 flex flex-wrap gap-1">
                <span v-for="(skill, sidx) in agent.skills" :key="sidx"
                  class="skill-tag text-xs"
                  :class="skill.color || 'bg-white/5 text-gray-400 border-white/10'"
                ><i :class="skill.icon + ' mr-1'"></i>{{ skill.name }}</span>
              </div>

              <!-- 学习记录 -->
              <div v-if="agent.status === 'active' && agent.learningText" class="mt-2 flex items-center gap-2">
                <span class="learning-indicator">{{ agent.learningText }}</span>
                <span class="text-xs text-gray-500">已记忆 {{ agent.learnedCount }} 个特征</span>
              </div>

              <!-- 子进度条 -->
              <div v-if="agent.status === 'active' && agent.subProgress !== undefined" class="mt-3">
                <div class="flex items-center justify-between mb-1">
                  <span class="text-xs text-gray-500">{{ agent.subLabel }}</span>
                  <span class="text-xs font-bold text-violet-400">{{ agent.subProgress }}%</span>
                </div>
                <div class="w-full bg-gray-800 rounded-full h-1.5">
                  <div class="h-full bg-gradient-to-r from-violet-500 to-fuchsia-500 rounded-full transition-all" :style="{ width: agent.subProgress + '%' }"></div>
                </div>
              </div>

              <!-- 照片建模详情 -->
              <div v-if="agent.photoModel" class="mt-3 bg-black/30 rounded-lg p-3">
                <div class="flex items-center justify-between mb-2">
                  <span class="text-xs font-medium text-white">{{ agent.photoModel.label }}</span>
                  <span class="modeling-type photo"><i class="fas fa-camera text-xs"></i>照片驱动建模</span>
                </div>
                <div class="flex gap-3">
                  <div class="photo-compare">
                    <div class="photo-box"><img :src="agent.photoModel.uploadPhoto" alt="用户照片"><div class="photo-label">用户上传</div></div>
                    <i class="fas fa-arrow-right arrow-icon"></i>
                    <div class="photo-box" v-if="agent.photoModel.aiGenerated">
                      <img :src="agent.photoModel.aiGenerated" alt="AI生成"><div class="photo-label">AI生成</div>
                    </div>
                    <div v-else class="w-16 h-16 rounded-lg bg-gradient-to-br from-green-500/20 to-emerald-500/20 border-2 border-green-500/50 flex items-center justify-center">
                      <i class="fas fa-male text-green-400 text-2xl"></i>
                    </div>
                  </div>
                  <div class="flex-1">
                    <div class="info-grid">
                      <div v-for="(val, key) in agent.photoModel.details" :key="key" class="info-row">
                        <span class="info-label">{{ key }}</span><span class="info-value">{{ val }}</span>
                      </div>
                    </div>
                  </div>
                </div>
                <div v-if="agent.photoModel.aiNote" class="mt-2 bg-blue-500/10 border border-blue-500/20 rounded-lg p-2">
                  <div class="flex items-start gap-2">
                    <i class="fas fa-info-circle text-blue-400 mt-0.5 text-xs"></i>
                    <p class="text-xs text-blue-300">{{ agent.photoModel.aiNote }}</p>
                  </div>
                </div>
              </div>

              <!-- 时间 -->
              <div v-if="agent.timeAgo" class="mt-1 text-xs text-gray-500">{{ agent.timeAgo }}</div>
            </div>
          </div>
        </div>
      </div>

      <!-- 日志面板 -->
      <div class="glass-card rounded-2xl overflow-hidden">
        <button @click="showLogs = !showLogs" class="w-full p-4 flex items-center justify-between hover:bg-white/5 transition">
          <div class="flex items-center gap-2">
            <i class="fas fa-terminal text-gray-500"></i>
            <span class="font-medium text-white">生成日志</span>
            <span class="px-2 py-0.5 rounded-full bg-gray-700 text-gray-400 text-xs">实时</span>
          </div>
          <i class="fas fa-chevron-down text-gray-500 transition-transform" :class="{ 'rotate-180': showLogs }"></i>
        </button>
        <div v-show="showLogs" class="border-t border-white/10">
          <div class="log-panel p-4 max-h-64 overflow-y-auto">
            <div v-for="(log, lIdx) in logs" :key="lIdx" class="log-entry" :class="log.level">
              [{{ log.time }}] {{ log.message }}
            </div>
            <div v-if="logs.length === 0" class="text-gray-500 text-center py-8">等待日志输出...</div>
          </div>
        </div>
      </div>

      <div class="flex items-center justify-center gap-4 py-4">
        <button class="px-6 py-2.5 rounded-xl border border-gray-700 text-gray-400 text-sm hover:bg-white/5 transition" @click="$router.push('/')">返回工作台</button>
        <button class="px-6 py-2.5 rounded-xl bg-gray-800 text-gray-600 text-sm cursor-not-allowed" disabled><i class="fas fa-download mr-2"></i>下载视频（完成后可用）</button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted, onUnmounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { getDramaDetail } from '@/api/drama'

const route = useRoute()
const router = useRouter()

const showLogs = ref(true)
const totalPercent = ref(35)
const dramaTitle = ref('蜀山')
const currentStatusText = ref('正在角色建模 - 根据照片生成男主角3D模型...')
let progressTimer = null
let subProgress = ref(60)

const logs = ref([
  { time: '14:30:01', level: 'info', message: '编剧智能体 启动剧本解析...' },
  { time: '14:30:02', level: 'success', message: '识别场景：12个' },
  { time: '14:30:03', level: 'success', message: '提取角色：8个（含年龄/身高/体型描述）' },
  { time: '14:30:08', level: 'info', message: '分镜师智能体 启动分镜生成...' },
  { time: '14:30:12', level: 'success', message: '生成镜头：36个' },
  { time: '14:30:20', level: 'info', message: '建模智能体 启动角色建模...' },
  { time: '14:30:25', level: 'info', message: '检测到用户上传照片：男主角李逍遥' },
  { time: '14:30:26', level: 'info', message: '读取角色描述：年龄22岁/身高178cm/精瘦型/丹凤眼' },
  { time: '14:30:30', level: 'info', message: '照片驱动建模：提取面部特征点 128个' },
  { time: '14:30:35', level: 'info', message: '年龄还原处理：照片年龄约25岁 → 调整至22岁' },
  { time: '14:30:40', level: 'success', message: '面部年轻化处理完成' }
])

const agents = ref([
  { name: '剧本解析', agentType: '编剧智能体', status: 'completed', timeAgo: '10分钟前', memory: 156,
    skills: [{ name: '剧本分析', icon: 'fa-book', color: 'bg-white/5 text-gray-400 border-white/10' }, { name: '角色提取', icon: 'fa-users' }, { name: '场景识别', icon: 'fa-map' }, { name: '情感分析', icon: 'fa-heart' }, { name: '节奏把控', icon: 'fa-clock' }],
    description: 'AI分析剧本内容，提取场景和角色' },
  { name: '分镜生成', agentType: '分镜师智能体', status: 'completed', timeAgo: '8分钟前', memory: 48,
    skills: [{ name: '镜头语言', icon: 'fa-camera' }, { name: '构图设计', icon: 'fa-ruler-combined' }, { name: '转场设计', icon: 'fa-exchange-alt' }, { name: '色彩规划', icon: 'fa-palette' }, { name: '蒙太奇', icon: 'fa-film' }],
    description: '根据剧本生成分镜脚本和画面描述' },
  { name: '角色建模', agentType: '建模智能体', status: 'active', memory: 24, learning: true, learningText: '正在学习用户审美偏好', learnedCount: 24,
    subLabel: '建模进度', subProgress: 60,
    skills: [
      { name: '3D建模', icon: 'fa-cube', color: 'bg-green-500/20 text-green-300 border-green-500/30' },
      { name: '骨骼绑定', icon: 'fa-bone' }, { name: '表情系统', icon: 'fa-smile' },
      { name: '服装材质', icon: 'fa-tshirt' }, { name: '纹理绘制', icon: 'fa-paint-brush' },
      { name: '毛发模拟', icon: 'fa-wind' }, { name: '体型比例', icon: 'fa-ruler' },
      { name: '面部特征', icon: 'fa-eye' }, { name: '年龄还原', icon: 'fa-user-circle', color: 'bg-amber-500/20 text-amber-300' },
      { name: '照片建模', icon: 'fa-camera', color: 'bg-green-500/20 text-green-300' }
    ],
    photoModel: {
      label: '当前建模：男主角 - 李逍遥',
      uploadPhoto: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&h=200&fit=crop',
      aiGenerated: '',
      details: { '姓名': '李逍遥', '性别': '男', '年龄': '22岁', '身高': '178cm', '体型': '精瘦型 / 肌肉线条', '脸型': '瓜子脸，棱角分明', '发型': '黑色短发，微卷', '眼睛': '丹凤眼，深邃有神', '特殊标记': '左眉疤痕，古铜肤色', '服装': '青色长袍，腰悬玉佩' },
      aiNote: '建模智能体已读取用户上传照片，结合角色描述（年龄22岁、身高178cm、精瘦型等）进行智能建模。自动调整：面部比例年轻化、体型精瘦化、添加古风服装与玉佩配饰。'
    },
    description: '3D角色建模、骨骼绑定、表情系统、服装材质' },
  { name: '画面生成', agentType: '视觉智能体', status: 'pending', description: '调用AI模型生成视频画面' },
  { name: '台词生成', agentType: '台词智能体', status: 'pending', description: '根据角色性格生成个性化台词' },
  { name: '配音合成', agentType: '配音智能体', status: 'pending', description: '将台词转化为语音，匹配角色声线' },
  { name: '音效音乐', agentType: '音频智能体', status: 'pending', description: '生成背景音乐、环境音效' },
  { name: '视频合成', agentType: '剪辑智能体', status: 'pending', description: '合成画面、配音、音乐、字幕' },
  { name: '后期特效', agentType: '特效智能体', status: 'pending', description: '添加视觉特效、片头片尾' }
])

function updateProgress() {
  if (subProgress.value < 100) {
    subProgress.value += Math.random() * 1.5
    if (subProgress.value > 100) subProgress.value = 100
    agents.value[2].subProgress = Math.floor(subProgress.value)
    totalPercent.value = Math.floor(25 + (subProgress.value * 0.25))
    if (Math.random() > 0.8) {
      const now = new Date()
      logs.value.push({
        time: now.toLocaleTimeString('zh-CN', { hour12: false }),
        level: 'info',
        message: '建模智能体 正在处理... ' + Math.floor(subProgress.value) + '%'
      })
    }
  }
}

onMounted(() => {
  progressTimer = setInterval(updateProgress, 2000)
})

onUnmounted(() => {
  if (progressTimer) clearInterval(progressTimer)
})
</script>

<style scoped>
.generate-page { max-width: 1200px; margin: 0 auto; }
.glass-card { background: rgba(30, 30, 58, 0.6); backdrop-filter: blur(16px); border: 1px solid rgba(255, 255, 255, 0.06); }
.gradient-text { background: linear-gradient(135deg, #8b5cf6, #ec4899, #06b6d4); -webkit-background-clip: text; -webkit-text-fill-color: transparent; background-clip: text; }
.agent-card { background: rgba(30, 30, 58, 0.6); backdrop-filter: blur(16px); border: 1px solid rgba(255, 255, 255, 0.06); transition: all 0.3s; }
.agent-tag { display: inline-flex; align-items: center; padding: 2px 8px; border-radius: 100px; background: rgba(139, 92, 246, 0.15); color: #a78bfa; border: 1px solid rgba(139, 92, 246, 0.25); }
.memory-badge { display: inline-flex; align-items: center; gap: 4px; padding: 2px 8px; border-radius: 100px; font-size: 10px; font-weight: 500; background: #fef3c7; color: #92400e; border: 1px solid #fde68a; }
.learning-badge { display: inline-flex; align-items: center; gap: 4px; padding: 2px 8px; border-radius: 100px; font-size: 10px; font-weight: 500; background: #dbeafe; color: #1e40af; border: 1px solid #bfdbfe; animation: pulse-memory 2s infinite; }
@keyframes pulse-memory { 0%, 100% { opacity: 1; } 50% { opacity: 0.7; } }
.learning-indicator { display: inline-flex; align-items: center; gap: 4px; font-size: 10px; color: #3b82f6; }
.learning-indicator::before { content: ''; width: 6px; height: 6px; border-radius: 50%; background: #3b82f6; animation: blink 1.5s infinite; }
@keyframes blink { 0%, 100% { opacity: 1; } 50% { opacity: 0.3; } }
.skill-tag { display: inline-flex; align-items: center; padding: 2px 8px; border-radius: 100px; border: 1px solid rgba(255,255,255,0.1); }
.modeling-type { display: inline-flex; align-items: center; gap: 4px; padding: 2px 8px; border-radius: 4px; font-size: 10px; font-weight: 500; }
.modeling-type.photo { background: #d1fae5; color: #065f46; }
.photo-compare { display: flex; gap: 12px; align-items: center; }
.photo-box { width: 80px; height: 80px; border-radius: 8px; overflow: hidden; border: 2px solid rgba(255,255,255,0.1); position: relative; }
.photo-box img { width: 100%; height: 100%; object-fit: cover; }
.photo-label { position: absolute; bottom: 0; left: 0; right: 0; background: rgba(0,0,0,0.6); color: white; font-size: 10px; padding: 2px 4px; text-align: center; }
.arrow-icon { color: #9ca3af; font-size: 20px; }
.info-grid { display: flex; flex-direction: column; gap: 1px; }
.info-row { display: flex; justify-content: space-between; padding: 2px 4px; font-size: 11px; border-bottom: 1px solid rgba(255,255,255,0.05); }
.info-label { color: #9ca3af; }
.info-value { color: #e2e8f0; font-weight: 500; }
.log-panel { background: rgba(0, 0, 0, 0.6); border: 1px solid rgba(255, 255, 255, 0.06); font-family: 'Courier New', monospace; font-size: 13px; }
.log-entry { padding: 4px 8px; border-left: 2px solid transparent; }
.log-entry.info { border-left-color: #3b82f6; color: #93c5fd; }
.log-entry.success { border-left-color: #10b981; color: #6ee7b7; }
.log-entry.error { border-left-color: #ef4444; color: #fca5a5; }
</style>
