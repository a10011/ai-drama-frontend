<template>
  <div class="create-drama-page">
    <div class="page-header">
      <h2>创建新短剧</h2>
      <el-steps :active="currentStep" finish-status="success" simple>
        <el-step title="选择模式" />
        <el-step title="输入剧本" />
        <el-step title="角色配置" />
        <el-step title="确认生成" />
      </el-steps>
    </div>

    <!-- Step 1: 选择创作模式 -->
    <div v-if="currentStep === 0" class="step-content">
      <div class="mode-cards">
        <div 
          v-for="mode in modes" 
          :key="mode.value"
          class="mode-card"
          :class="{ active: form.mode === mode.value }"
          @click="selectMode(mode.value)"
        >
          <el-icon :size="40"><component :is="mode.icon" /></el-icon>
          <h3>{{ mode.label }}</h3>
          <p>{{ mode.desc }}</p>
          <el-tag :type="mode.tagType" size="small">{{ mode.tag }}</el-tag>
        </div>
      </div>
    </div>

    <!-- Step 2: 输入剧本 -->
    <div v-if="currentStep === 1" class="step-content">
      <el-form :model="form" label-position="top">
        <el-form-item label="短剧标题">
          <el-input v-model="form.title" placeholder="给你的短剧起个名字" maxlength="50" show-word-limit />
        </el-form-item>

        <el-form-item label="剧本内容">
          <el-input
            v-model="form.script"
            type="textarea"
            :rows="8"
            placeholder="输入你的短剧剧本，AI将根据内容生成视频...

建议格式：
[场景1] 公园长椅，夕阳西下...
角色A：今天天气真好...
角色B：是啊，适合散步..."
            maxlength="2000"
            show-word-limit
          />
          <div class="form-tip">
            <el-icon><InfoFilled /></el-icon>
            建议每段场景用空行分隔，AI会自动分镜处理
          </div>
        </el-form-item>

        <el-form-item label="视频时长">
          <el-slider v-model="form.duration" :max="maxDuration" :step="1" show-stops />
          <div class="duration-info">
            <span>{{ form.duration }} 秒</span>
            <el-tag :type="quotaInfo.type" size="small">
              剩余配额: {{ quotaInfo.remaining }}秒
            </el-tag>
          </div>
        </el-form-item>
      </el-form>
    </div>

    <!-- Step 3: 角色配置 -->
    <div v-if="currentStep === 2" class="step-content">
      <el-form :model="form" label-position="top">
        <el-form-item label="选择AI演员">
          <div class="actor-grid">
            <div 
              v-for="actor in actors" 
              :key="actor.id"
              class="actor-card"
              :class="{ active: form.actorId === actor.id }"
              @click="form.actorId = actor.id"
            >
              <img :src="actor.avatar" :alt="actor.name" />
              <span>{{ actor.name }}</span>
              <el-tag size="small" :type="actor.gender === 'male' ? 'primary' : 'danger'">
                {{ actor.gender === 'male' ? '男' : '女' }}
              </el-tag>
            </div>
          </div>
        </el-form-item>

        <el-form-item label="配音风格">
          <el-select v-model="form.voiceStyle" placeholder="选择配音">
            <el-option 
              v-for="voice in voices" 
              :key="voice.value"
              :label="voice.label"
              :value="voice.value"
            />
          </el-select>
        </el-form-item>

        <el-form-item label="画面风格">
          <el-radio-group v-model="form.style">
            <el-radio-button label="realistic">写实</el-radio-button>
            <el-radio-button label="anime">动漫</el-radio-button>
            <el-radio-button label="cinematic">电影感</el-radio-button>
            <el-radio-button label="vintage">复古</el-radio-button>
          </el-radio-group>
        </el-form-item>
      </el-form>
    </div>

    <!-- Step 4: 确认生成 -->
    <div v-if="currentStep === 3" class="step-content">
      <el-card class="confirm-card">
        <template #header>
          <div class="card-header">
            <span>生成确认</span>
          </div>
        </template>

        <div class="confirm-item">
          <label>创作模式：</label>
          <span>{{ getModeLabel(form.mode) }}</span>
        </div>
        <div class="confirm-item">
          <label>短剧标题：</label>
          <span>{{ form.title }}</span>
        </div>
        <div class="confirm-item">
          <label>视频时长：</label>
          <span>{{ form.duration }} 秒</span>
        </div>
        <div class="confirm-item">
          <label>AI演员：</label>
          <span>{{ getActorName(form.actorId) }}</span>
        </div>
        <div class="confirm-item">
          <label>预计消耗：</label>
          <span class="cost">{{ form.duration }} 秒配额</span>
        </div>

        <el-divider />

        <div class="cost-summary">
          <div class="cost-row">
            <span>当前会员等级：</span>
            <el-tag>{{ userStore.memberLevel }}</el-tag>
          </div>
          <div class="cost-row">
            <span>剩余视频配额：</span>
            <span :class="{ 'text-danger': quotaInfo.remaining < form.duration }">
              {{ quotaInfo.remaining }} 秒
            </span>
          </div>
        </div>

        <el-alert
          v-if="quotaInfo.remaining < form.duration"
          title="配额不足，请升级会员或购买配额包"
          type="error"
          :closable="false"
          show-icon
        />
      </el-card>
    </div>

    <!-- 底部操作按钮 -->
    <div class="step-actions">
      <el-button v-if="currentStep > 0" @click="prevStep">上一步</el-button>
      <el-button 
        v-if="currentStep < 3" 
        type="primary" 
        @click="nextStep"
        :disabled="!canNext"
      >
        下一步
      </el-button>
      <el-button 
        v-if="currentStep === 3" 
        type="primary" 
        @click="submitGenerate"
        :loading="submitting"
        :disabled="quotaInfo.remaining < form.duration"
      >
        确认生成
      </el-button>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useUserStore } from '@/stores/user'
import { useQuotaStore } from '@/stores/quota'
import { VideoCamera, Document, Picture, InfoFilled } from '@element-plus/icons-vue'
import { ElMessage } from 'element-plus'
import { createDrama } from '@/api/drama'

const router = useRouter()
const userStore = useUserStore()
const quotaStore = useQuotaStore()

const currentStep = ref(0)
const submitting = ref(false)

const modes = [
  { 
    value: 'ai_real', 
    label: 'AI真人', 
    desc: '使用AI生成真人形象视频，适合剧情类短剧',
    icon: 'VideoCamera',
    tag: '推荐',
    tagType: 'success'
  },
  { 
    value: 'ai_anime', 
    label: 'AI动画', 
    desc: '生成动漫风格视频，适合二次元内容',
    icon: 'Picture',
    tag: '热门',
    tagType: 'warning'
  },
  { 
    value: 'text_to_video', 
    label: '图文转视频', 
    desc: '上传图片和文案，自动生成视频',
    icon: 'Document',
    tag: '简单',
    tagType: 'info'
  }
]

const actors = ref([
  { id: 1, name: '小艾', gender: 'female', avatar: '/avatars/actor1.jpg' },
  { id: 2, name: '阿杰', gender: 'male', avatar: '/avatars/actor2.jpg' },
  { id: 3, name: '莉莉', gender: 'female', avatar: '/avatars/actor3.jpg' },
  { id: 4, name: '大伟', gender: 'male', avatar: '/avatars/actor4.jpg' },
])

const voices = [
  { value: 'gentle', label: '温柔女声' },
  { value: 'energetic', label: '活力男声' },
  { value: 'mature', label: '成熟御姐' },
  { value: 'youth', label: '少年音' },
]

const maxDuration = computed(() => {
  const limits = { free: 3, basic: 5, pro: 10, enterprise: 30, unlimited: 60 }
  return limits[userStore.memberLevel] || 3
})

const quotaInfo = computed(() => {
  const remaining = quotaStore.videoQuota?.remaining || 0
  return {
    remaining,
    type: remaining > 60 ? 'success' : remaining > 10 ? 'warning' : 'danger'
  }
})

const form = reactive({
  mode: '',
  title: '',
  script: '',
  duration: 5,
  actorId: null,
  voiceStyle: 'gentle',
  style: 'realistic'
})

const canNext = computed(() => {
  switch(currentStep.value) {
    case 0: return !!form.mode
    case 1: return !!form.title && !!form.script && form.duration <= maxDuration.value
    case 2: return !!form.actorId
    default: return true
  }
})

const selectMode = (mode) => {
  form.mode = mode
}

const getModeLabel = (val) => modes.find(m => m.value === val)?.label || val
const getActorName = (id) => actors.value.find(a => a.id === id)?.name || ''

const nextStep = () => {
  if (currentStep.value === 1 && form.duration > quotaInfo.value.remaining) {
    ElMessage.warning('视频时长超过剩余配额，请调整时长或升级会员')
    return
  }
  currentStep.value++
}

const prevStep = () => {
  currentStep.value--
}

const submitGenerate = async () => {
  if (quotaInfo.value.remaining < form.duration) {
    ElMessage.error('配额不足，无法生成')
    return
  }

  submitting.value = true
  try {
    const res = await createDrama({
      title: form.title,
      mode: form.mode,
      script: form.script,
      duration: form.duration,
      actor_id: form.actorId,
      voice_style: form.voiceStyle,
      style: form.style
    })

    // 扣除配额（乐观更新）
    quotaStore.consumeVideoQuota(form.duration)

    ElMessage.success('短剧创建成功，正在生成中...')

    // 跳转到作品详情/进度页
    router.push(`/drama/${res.data.id}/progress`)
  } catch (error) {
    ElMessage.error(error.message || '创建失败')
  } finally {
    submitting.value = false
  }
}

onMounted(() => {
  quotaStore.fetchQuota()
})
</script>

<style scoped>
.create-drama-page {
  max-width: 900px;
  margin: 0 auto;
  padding: 20px;
}

.page-header {
  margin-bottom: 30px;
}

.page-header h2 {
  margin-bottom: 20px;
}

.step-content {
  min-height: 400px;
  margin: 30px 0;
}

.mode-cards {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 20px;
}

.mode-card {
  border: 2px solid #e4e7ed;
  border-radius: 12px;
  padding: 30px;
  text-align: center;
  cursor: pointer;
  transition: all 0.3s;
}

.mode-card:hover {
  border-color: #409eff;
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0,0,0,0.1);
}

.mode-card.active {
  border-color: #409eff;
  background: #f0f9ff;
}

.mode-card h3 {
  margin: 15px 0 10px;
}

.mode-card p {
  color: #909399;
  font-size: 14px;
  margin-bottom: 10px;
}

.actor-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 15px;
}

.actor-card {
  border: 2px solid #e4e7ed;
  border-radius: 8px;
  padding: 15px;
  text-align: center;
  cursor: pointer;
  transition: all 0.3s;
}

.actor-card:hover {
  border-color: #409eff;
}

.actor-card.active {
  border-color: #409eff;
  background: #f0f9ff;
}

.actor-card img {
  width: 60px;
  height: 60px;
  border-radius: 50%;
  object-fit: cover;
  margin-bottom: 8px;
}

.actor-card span {
  display: block;
  margin: 5px 0;
}

.duration-info {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: 10px;
}

.form-tip {
  margin-top: 8px;
  color: #909399;
  font-size: 12px;
  display: flex;
  align-items: center;
  gap: 5px;
}

.confirm-card {
  max-width: 500px;
  margin: 0 auto;
}

.confirm-item {
  display: flex;
  justify-content: space-between;
  padding: 12px 0;
  border-bottom: 1px solid #ebeef5;
}

.confirm-item label {
  color: #606266;
}

.confirm-item .cost {
  color: #f56c6c;
  font-weight: bold;
}

.cost-summary {
  margin-top: 15px;
}

.cost-row {
  display: flex;
  justify-content: space-between;
  padding: 8px 0;
}

.text-danger {
  color: #f56c6c;
}

.step-actions {
  display: flex;
  justify-content: center;
  gap: 15px;
  margin-top: 30px;
  padding-top: 20px;
  border-top: 1px solid #ebeef5;
}
</style>
