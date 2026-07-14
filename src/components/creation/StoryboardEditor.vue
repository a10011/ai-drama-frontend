<template>
<div class="storyboard-editor">
  <div class="title-row">
    <h2 class="title">分镜编辑器</h2>
    <button class="toggle-adv" :class="{on: showAdvanced}" @click="showAdvanced=!showAdvanced">
      ⚙️ {{ showAdvanced ? '收起高级设置' : '展开高级设置' }}
    </button>
  </div>
  <div v-if="autoGenerating" class="auto-generating">
      <div class="spinner"></div>
      <p>🤖 AI 正在分析剧本，自动生成分镜脚本...</p>
      <p class="auto-sub">根据角色、场景、题材自动分配镜头与运镜</p>
    </div>
    <div class="grid" v-else>
    <div v-for="(s,i) in scenes" :key="s.id" class="card" draggable="true" @dragstart="ds(i,$event)" @dragover.prevent @drop="dp(i)">
      <div class="num">#{{ pad(i+1) }}</div>
      <div class="preview" :class="{ loading: s._generating, hasImg: !!s.scene_image }">
        <img v-if="s.scene_image" :src="s.scene_image" alt="场景预览" class="preview-img" />
        <div v-else-if="s._generating" class="generating-overlay">
          <div class="spinner"></div>
          <span>AI 绘图生成中...</span>
          <div class="gen-progress-bar">
            <div class="gen-progress-fill" :style="{ width: s._genProgress + '%' }"></div>
          </div>
          <span class="gen-progress-text">{{ s._genProgress }}%</span>
        </div>
        <span v-else class="placeholder-text">点击下方按钮生成场景图</span>
      </div>
      <textarea v-model="s.desc" class="desc" placeholder="场景描述..." rows="2"></textarea>
      <div class="dialogue-line">
        <span class="dl-icon">💬</span>
        <input v-model="s.dialogue" class="dl-input" placeholder="台词..." />
      </div>
      <div class="cam-row">
        <label>运镜：</label>
        <select v-model="s.cam">
          <option v-for="opt in CAM_OPTIONS" :key="opt.value" :value="opt.value">{{ opt.label }}</option>
        </select>
        <label>景别：</label>
        <select v-model="s.shotType">
          <option v-for="opt in SHOT_TYPES" :key="opt" :value="opt">{{ opt }}</option>
        </select>
        <label>角度：</label>
        <select v-model="s.angle">
          <option v-for="opt in ANGLES" :key="opt" :value="opt">{{ opt }}</option>
        </select>
      </div>
      <!-- 高级设置（会员可见/折叠） -->
      <div v-if="showAdvanced" class="advanced">
        <div class="adv-row">
          <div class="adv-fg"><label>光线：</label><input v-model="s.lighting" placeholder="如：柔光"/></div>
          <div class="adv-fg"><label>时长：</label><input v-model="s.duration" type="number" min="2" max="30" class="dur-input"/><span class="unit">秒</span></div>
        </div>
        <div class="adv-row">
          <div class="adv-fg"><label>情绪：</label><input v-model="s.emotion" placeholder="如：紧张、温馨"/></div>
          <div class="adv-fg"><label>转场：</label>
            <select v-model="s.transition">
              <option v-for="opt in TRANSITIONS" :key="opt" :value="opt">{{ opt }}</option>
            </select>
          </div>
        </div>
      </div>
      <button class="del" @click="del(i)" title="删除">&times;</button>
      <button class="gen-img" @click="genSceneImg(i)" :disabled="s._generating">
        <span v-if="s._generating">⏳ 生成中...</span>
        <span v-else-if="s.scene_image">🔄 重新生成</span>
        <span v-else>🎨 生成场景图</span>
      </button>
    </div>
  </div>
  <button class="add" @click="add">+ 添加分镜</button>
  <div class="bar">
    <button class="next" @click="handleNextClick" :disabled="batchGenerating">{{ nextButtonText }}</button>
  </div>
</div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import request from '@/utils/request'

const props = defineProps({
  taskId: { type: String, default: '' },
  sceneData: { type: Array, default: () => [] }
})

const emit = defineEmits(['next', 'retry'])

// 运镜选项
const CAM_OPTIONS = [
  { value: 'fixed', label: '固定' },
  { value: 'push', label: '推' },
  { value: 'pull', label: '拉' },
  { value: 'pan', label: '摇' },
  { value: 'tilt', label: '移' },
  { value: 'follow', label: '跟' },
  { value: 'crane', label: '升降' },
  { value: 'orbit', label: '环绕' },
]

// 状态
const autoGenerating = ref(false)
const showAdvanced = ref(false)
const batchGenerating = ref(false)
const batchCompleted = ref(0)
// 默认至少一张空卡片
const scenes = ref([{ id: Date.now(), desc: '', cam: 'fixed', scene_image: '', _generating: false, _genProgress: 0 }])
let di = null

function pad(n) { return String(n).padStart(2, '0') }

function add() {
  scenes.value.push({ id: Date.now(), desc: '', cam: 'fixed', scene_image: '', _generating: false, _genProgress: 0 })
}

function del(i) {
  if (scenes.value.length > 1) scenes.value.splice(i, 1)
}

function ds(i, e) { di = i; e.dataTransfer.effectAllowed = 'move' }

function dp(i) {
  if (di != null && di !== i) {
    const t = scenes.value[di]
    scenes.value.splice(di, 1)
    scenes.value.splice(i, 0, t)
  }
  di = null
}

function go() {
  if (scenes.value.some(s => !s.desc.trim())) return alert('请填写所有描述')
  if (shotsNeedingImage.value > 0) return alert(`还有 ${shotsNeedingImage.value} 个镜头未生成场景图，请先生成`)
  emit('next', scenes.value)
}

// ───── 还需要生成场景图的镜头数 ─────
const shotsNeedingImage = computed(() =>
  scenes.value.filter(s => s.desc.trim() && !s.scene_image).length
)

// ───── 按钮动态文字 ─────
const nextButtonText = computed(() => {
  if (batchGenerating.value) {
    return `⏳ 生成中... (${batchCompleted.value}/${scenes.value.filter(s => s._generating).length + batchCompleted.value})`
  }
  const need = shotsNeedingImage.value
  if (need > 0) return `🎨 批量生成场景图 (${need}个)`
  return '✅ 下一步：配音合成'
})

// ───── 按钮点击分发 ─────
function handleNextClick() {
  if (batchGenerating.value) return
  if (shotsNeedingImage.value > 0) {
    batchGenerateAll()
  } else {
    go()
  }
}

// ───── 批量生成所有镜头的场景图 ─────
async function batchGenerateAll() {
  const pending = scenes.value
    .map((s, i) => ({ shot: s, index: i }))
    .filter(({ shot }) => !shot.scene_image && shot.desc.trim())

  if (pending.length === 0) return

  batchGenerating.value = true
  batchCompleted.value = 0

  // 所有待生成镜头进入 loading 状态
  pending.forEach(({ shot }) => {
    shot._generating = true
    shot._genProgress = 0
  })

  let genre = localStorage.getItem('__DRAMA_GENRE__') || ''
  let script = localStorage.getItem('__DRAMA_SCRIPT__') || ''
  let characters = []
  const taskId = props.taskId || localStorage.getItem('__DRAMA_TASK_ID__') || ''
  if (taskId) {
    try {
      const projRes = await request({ url: '/api/v1/projects/' + taskId, method: 'get', timeout: 10000 })
      if (projRes && projRes.data) {
        if (projRes.data.script || projRes.data.script_text) script = projRes.data.script || projRes.data.script_text
        if (projRes.data.characters) {
          try { characters = typeof projRes.data.characters === 'string' ? JSON.parse(projRes.data.characters) : projRes.data.characters } catch(e) {}
        }
        if (projRes.data.genre) genre = projRes.data.genre
      }
    } catch(e) {
      console.warn('[StoryboardEditor] 获取项目数据失败:', e.message || e)
    }
  }
  const charsStr = localStorage.getItem('__DRAMA_CHARS__') || '[]'
  try { characters = JSON.parse(charsStr) } catch (e) { console.error("[StoryboardEditor] error:", e) }

  // ───── 先尝试 batch 调用 ─────
  let batchResults = null
  try {
    const batchRes = await request({
      url: '/api/v1/agents/execute',
      method: 'post',
      timeout: 300000,
      data: {
        agent_id: 'scene',
        action: 'batch_generate',
        params: {
          shots: scenes.value.map(s => {
            const refs = getRefCharactersForShot(s)
            const shot = {
              description: s.desc || '',
              dialogue: s.dialogue || '',
              camera_movement: s.cam || '',
              camera_angle: s.angle || '',
              shot_type: s.shotType || '',
              scene: s.scene || '',
              emotion: s.emotion || '',
              lighting: s.lighting || '',
              transition: s.transition || '',
              duration_sec: s.duration || 5,
            }
            if (refs.length > 0) shot.reference_image = refs[0]
            return shot
          }),
          genre, script, characters
        }
      }
    })
    // 解析 batch 返回：{ results: [{ scene_image: "url" }, ...] } 或 { data: { results: [...] } }
    // batch_generate 返回 {data: {images: [{shot_index,image_url}, ...]}}
    const raw = batchRes?.data?.images || batchRes?.results || batchRes?.data?.results
    if (Array.isArray(raw)) {
      batchResults = raw
    } else if (raw && raw.images && Array.isArray(raw.images)) {
      batchResults = raw.images
    }
  } catch(e) {
    console.warn(.batch_generate 调用失败:', e.message || e)
  }

  // 如果有 batch 结果，分配图片到各镜头
  if (batchResults && batchResults.length > 0) {
    // 按 shot_index 分配（复用图也会带 shot_index），确保所有镜头都有图
    batchResults.forEach((r) => {
      const si = r.shot_index
      if (si === undefined || si === null) return
      const imgUrl = r.image_url || r.url || r.scene_image || (typeof r === 'string' ? r : '')
      if (imgUrl && si < scenes.value.length) {
        scenes.value[si].scene_image = imgUrl
      }
    })
    pending.forEach(({ shot }) => {
      shot._genProgress = 100
      setTimeout(() => {
        shot._generating = false
        shot._genProgress = 0
      }, 400)
    })
    batchCompleted.value = pending.length
    persistSceneImages()
    batchGenerating.value = false
    return
  }

  // ───── 逐张并发调用 ─────
  const total = pending.length
  const promises = pending.map(async ({ shot, index: origIndex }) => {
    const progressStart = Date.now()
    const estimatedDuration = 60000
    const progressTimer = setInterval(() => {
      const elapsed = Date.now() - progressStart
      const pct = Math.min(90, Math.round((elapsed / estimatedDuration) * 90))
      shot._genProgress = pct
    }, 500)

    try {
      const refs = getRefCharactersForShot(shot)
      const res = await request({
        url: '/api/v1/agents/execute',
        method: 'post',
        timeout: 120000,
        data: {
          agent_id: 'scene',
          action: 'generate',
          params: {
            script, characters,
            scene_index: origIndex,
            shot_description: shot.desc,
            ...(refs.length > 0 ? { reference_image: refs[0] } : {})
          }
        }
      })

      if (res.data?.image_url) shot.scene_image = res.data.image_url
      else if (res.image_url) shot.scene_image = res.image_url
      else if (res.scene_image) shot.scene_image = res.scene_image
      else if (res.data?.image_url) shot.scene_image = res.data.image_url
      else if (res.data?.scene_image) shot.scene_image = res.data.scene_image
      else if (res.url) shot.scene_image = res.url
      else if (typeof res === 'string' && res.startsWith('http')) shot.scene_image = res
    } catch(e) {
      console.warn(`镜头 #${origIndex + 1} 场景图生成失败:`, e.message || e)
    } finally {
      clearInterval(progressTimer)
      shot._genProgress = 100
      setTimeout(() => {
        shot._generating = false
        shot._genProgress = 0
      }, 400)
      batchCompleted.value++
    }
  })

  await Promise.allSettled(promises)
  persistSceneImages()
  batchGenerating.value = false
}

/* ───── 持久化 scene_image 到 localStorage ───── */
function persistSceneImages() {
  try {
    // 从 __DRAMA_STORYBOARD__ 读
    let raw = localStorage.getItem('__DRAMA_STORYBOARD__')
    if (!raw) raw = localStorage.getItem('__DRAMA_SCRIPT__')
    if (!raw) return
    let data
    try { data = JSON.parse(raw) } catch(e) { data = null }
    if (!data) return

    // 尝试多种数据结构
    const shots = Array.isArray(data) ? data : (data.shots || data.scenes || data.storyboard || [])
    if (shots.length === 0) return

    // 更新对应镜头的 scene_image（按索引匹配作为保底）
    scenes.value.forEach((s, si) => {
      if (!s.scene_image) return
      if (s.id) {
        const match = shots.findIndex(sh => sh.id === s.id)
        if (match !== -1) { shots[match].scene_image = s.scene_image; return }
      }
      // 按索引匹配
      if (si < shots.length) shots[si].scene_image = s.scene_image
    })

    // 写回 localStorage
    if (Array.isArray(data)) {
      localStorage.setItem('__DRAMA_STORYBOARD__', JSON.stringify(shots))
    } else if (data.shots) {
      data.shots = shots
      localStorage.setItem('__DRAMA_STORYBOARD__', JSON.stringify(data))
    } else if (data.scenes) {
      data.scenes = shots
      localStorage.setItem('__DRAMA_STORYBOARD__', JSON.stringify(data))
    } else if (data.storyboard) {
      data.storyboard = shots
      localStorage.setItem('__DRAMA_STORYBOARD__', JSON.stringify(data))
    }
  } catch(e) {
    console.warn('持久化场景图失败:', e)
  }
}

/* Helper: extract usable character photo URLs (non-data-URL only) */
function getRefCharacters() {
  try {
    const charsStr = localStorage.getItem('__DRAMA_CHARS__') || '[]'
    const chars = JSON.parse(charsStr)
    if (!Array.isArray(chars)) return []
    return chars
      .map(c => c.photo)
      .filter(p => p && typeof p === 'string' && !p.startsWith('data:') && p.trim() !== '')
  } catch(e) {
    console.warn('[StoryboardEditor] getRefCharacters error:', e)
    return []
  }
}

function getRefCharactersForShot(shot) {
  const chars = JSON.parse(localStorage.getItem('__DRAMA_CHARS__') || '[]')
  if (!Array.isArray(chars) || chars.length === 0) return []
  const text = (shot.desc || shot.description || '') + ' ' + (shot.dialogue || '')
  return chars
    .filter(c => c.name && c.photo && !c.photo.startsWith('data:'))
    .filter(c => text.includes(c.name))
    .map(c => c.photo)
}

/* Helper: check whether a shot contains characters */
function shotHasCharacters(shot) {
  try {
    if (shot.char_ages || shot.outfit || shot.props) return true
    if (shot.characters && Array.isArray(shot.characters) && shot.characters.length > 0) return true
    const charsStr = localStorage.getItem('__DRAMA_CHARS__') || '[]'
    const chars = JSON.parse(charsStr)
    if (!Array.isArray(chars)) return false
    const names = chars.map(c => c.name).filter(Boolean)
    if (names.length === 0) return false
    const text = (shot.desc || '') + ' ' + (shot.dialogue || '')
    return names.some(name => text.includes(name))
  } catch(e) {
    return false
  }
}

/* ───── 自动调用 storyboard agent 生成分镜 ───── */
async function autoGenerateStoryboard() {
  try {
    // 优先从项目API获取剧本（项目DB的剧本才是用户上传的）
    let script = ''
    let characters = []
    let genre = localStorage.getItem('__DRAMA_GENRE__') || ''
    const taskId = props.taskId || localStorage.getItem('__DRAMA_TASK_ID__') || ''
    if (taskId) {
      try {
        const projRes = await request({ url: '/api/v1/projects/' + taskId, method: 'get', timeout: 10000 })
        if (projRes && projRes.data) {
          script = projRes.data.script || projRes.data.script_text || ''
          if (projRes.data.characters) {
            try { characters = typeof projRes.data.characters === 'string' ? JSON.parse(projRes.data.characters) : projRes.data.characters } catch(e) {}
          }
        }
      } catch(e) {
        console.warn(.[StoryboardEditor].获取项目剧本失败:', e.message || e)
      }
    }
    if (!script || characters.length === 0) return false

    const res = await request({
      url: '/api/v1/agents/execute',
      method: 'post',
      timeout: 180000,
      data: {
        agent_id: 'storyboard',
        action: 'generate',
        params: { script, characters, scenes: [], genre }
      }
    })

    // 兼容后端返回格式: {success, data:{shots:[...]}} 或 {shots:[...]} 或 [...]
    let shots = []
    if (res.data?.shots) shots = res.data.shots
    else if (res.shots) shots = res.shots
    else if (res.data) shots = Array.isArray(res.data) ? res.data : []
    else if (Array.isArray(res)) shots = res

    if (shots.length > 0) {
      scenes.value = shots.map((s, i) => normalizeShot(s, i))
      return true
    }
    return false
  } catch(e) {
    console.warn('自动生成分镜失败:', e.message || e)
    return false
  }
}

/* ───── 从 props 或 localStorage 加载分镜数据 ───── */
async function loadStoryboardData() {
  // 1️⃣ 优先使用父组件传入的 pipeline sceneData
  if (props.sceneData && props.sceneData.length > 0) {
    scenes.value = props.sceneData.map((s, i) => normalizeShot(s, i))
    return
  }

  // 3️⃣ 从后端 pipeline API 获取分镜数据（断点续跑场景）
  const taskId = props.taskId || localStorage.getItem('__DRAMA_TASK_ID__') || ''
  if (taskId) {
    try {
      const res = await request({ url: '/api/v1/pipeline/progress/' + taskId, method: 'get', timeout: 10000 })
      if (res && res.data && res.data.stages) {
        const storyboardStage = res.data.stages.find(s => s.stage === 'storyboard')
        if (storyboardStage && storyboardStage.data) {
          const shots = storyboardStage.data.shots || storyboardStage.data.scenes || storyboardStage.data.storyboard || []
          if (shots.length > 0) {
            scenes.value = shots.map((s, i) => normalizeShot(s, i))
            return
          }
        }
        // Also try scene stage for images
        const sceneStage = res.data.stages.find(s => s.stage === 'scene')
        if (sceneStage && sceneStage.data) {
          const images = sceneStage.data.images || sceneStage.data.scene_images || []
          if (images.length > 0 && scenes.value.length > 0) {
            scenes.value.forEach((s, i) => {
              if (images[i]) s.scene_image = images[i]
            })
          }
        }
      }
    } catch (e) {
      console.warn('[StoryboardEditor] pipeline API fetch failed:', e.message || e)
    }
  }

  // 4️⃣ 从后端 API 直接获取分镜数据（场景描述、台词、运镜）
  try {
    const script = localStorage.getItem('__DRAMA_SCRIPT__') || ''
    const charsStr = localStorage.getItem('__DRAMA_CHARS__') || '[]'
    let characters = []
    try { characters = JSON.parse(charsStr) } catch(e) {}
    const genre = localStorage.getItem('__DRAMA_GENRE__') || ''

    const res = await request({
      url: '/api/v1/storyboard',
      method: 'get',
      timeout: 30000,
      params: { task_id: taskId, genre }
    })

    let shots = []
    if (res && res.data) {
      shots = res.data.shots || res.data.scenes || res.data.storyboard || (Array.isArray(res.data) ? res.data : [])
    } else if (Array.isArray(res)) {
      shots = res
    }

    if (shots.length > 0) {
      scenes.value = shots.map((s, i) => normalizeShot(s, i))
      console.log(`[StoryboardEditor] 从后端 API 加载了 ${shots.length} 个分镜`)
      return
    }
  } catch (e) {
    console.warn('[StoryboardEditor] storyboard API fetch failed:', e.message || e)
  }
}

/** 将后端返回的分镜字段统一映射到组件内部字段 */
// 中文运镜名→英文值
const CAM_MAP_CN = {
  '固定':'fixed', '推':'push', '拉':'pull', '摇':'pan',
  '移':'tilt', '跟':'follow', '升降':'crane', '环绕':'orbit',
  '推拉':'push', '摇移':'pan', '跟拍':'follow',
}

// 景别选项
const SHOT_TYPES = ['远景','全景','中景','近景','特写','大特写']
// 拍摄角度选项
const ANGLES = ['平视','俯视','仰视','倾斜','鸟瞰']
// 转场选项
const TRANSITIONS = ['切入','淡入','淡出','叠化','划像','翻转','闪白']

function normalizeShot(s, idx) {
  const rawCam = s.camera_movement || s.camera || s.cam || 'fixed'
  const camValue = CAM_MAP_CN[rawCam] || rawCam
  return {
    id: s.id || Date.now() + idx,
    desc: s.description || s.desc || '',
    cam: camValue,
    shotType: s.shot_type || s.shotType || '中景',
    angle: s.camera_angle || s.angle || '平视',
    lighting: s.lighting || '',
    duration: s.duration_sec || s.duration || 5,
    emotion: s.emotion || '',
    transition: s.transition || '切入',
    importance: s.importance || 'medium',
    characters: s.characters || [],
    dialogue: s.dialogue || '',
    scene_image: s.scene_image || s.image_url || '',
    _generating: false,
    _genProgress: 0
  }
}

/* ───── 调用 scene agent 生成场景图 ───── */
async function genSceneImg(i) {
  const shot = scenes.value[i]
  if (!shot.desc.trim()) return alert('请先填写场景描述')

  shot._generating = true
  shot._genProgress = 0

  // ───── 进度条模拟（约60秒内线性增长到90%，等结果回来跳到100%）─────
  const progressStart = Date.now()
  const estimatedDuration = 60000 // 预估 60 秒
  let progressTimer = setInterval(() => {
    const elapsed = Date.now() - progressStart
    const pct = Math.min(90, Math.round((elapsed / estimatedDuration) * 90))
    shot._genProgress = pct
  }, 500)

  try {
    const refs = getRefCharactersForShot(shot)
    const script = localStorage.getItem('__DRAMA_SCRIPT__') || ''
    const charsStr = localStorage.getItem('__DRAMA_CHARS__') || '[]'
    let characters = []
    try { characters = JSON.parse(charsStr) } catch (e) { console.error("[StoryboardEditor] error:", e) }

    const res = await request({
      url: '/api/v1/agents/execute',
      method: 'post',
      timeout: 120000,  // 场景图生成较慢（30-60s），放宽到 2 分钟
      data: {
        agent_id: 'scene',
        action: 'generate',
        params: {
          script,
          characters,
          scene_index: i,
          shot_description: shot.desc,
          ...(refs.length > 0 ? { reference_image: refs[0] } : {})
        }
      }
    })

    // 兼容多种后端返回格式
    if (res.image_url) shot.scene_image = res.image_url
    else if (res.scene_image) shot.scene_image = res.scene_image
    else if (res.data?.image_url) shot.scene_image = res.data.image_url
    else if (res.data?.scene_image) shot.scene_image = res.data.scene_image
    else if (res.url) shot.scene_image = res.url
    // 如果以上都没有匹配到，尝试作为字符串
    else if (typeof res === 'string' && res.startsWith('http')) shot.scene_image = res

    // ✅ 持久化到 localStorage
    if (shot.scene_image) {
      persistSceneImages()
    }
  } catch(e) {
    alert('场景图生成失败: ' + (e.message || e?.response?.data?.detail || '未知错误'))
  } finally {
    clearInterval(progressTimer)
    shot._genProgress = 100  // 跳到100%
    setTimeout(() => {
      shot._generating = false
      shot._genProgress = 0
    }, 400) // 短暂显示100%后重置
  }
}

onMounted(async () => {
  await loadStoryboardData()
  // 如果没加载到分镜数据，自动调 storyboard agent 生成
  const hasData = scenes.value.length > 0 && scenes.value.some(s => s.desc.trim())
  if (!hasData) {
    autoGenerating.value = true
    const ok = await autoGenerateStoryboard()
    autoGenerating.value = false
  }
})
</script>

<style scoped>
.storyboard-editor { padding:20px; background:#1a1a1a; color:#e0e0e0; font-family:Consolas,monospace; min-height:0 }
.title-row { display:flex; align-items:center; justify-content:space-between; margin-bottom:24px; gap:12px }
.title { color:#c49b4a; margin:0 }
.toggle-adv { padding:6px 14px; background:rgba(196,155,74,0.08); border:1px solid rgba(196,155,74,0.3); color:#c49b4a; border-radius:6px; font-family:Consolas,monospace; font-size:12px; cursor:pointer; white-space:nowrap; transition:all 0.2s }
.toggle-adv:hover { background:rgba(196,155,74,0.15); border-color:#c49b4a }
.toggle-adv.on { background:#c49b4a; color:#1a1a1a; border-color:#c49b4a }
.auto-generating { display:flex; flex-direction:column; align-items:center; justify-content:center; padding:60px 20px; color:#c49b4a; font-size:15px; gap:12px }
.auto-generating .spinner { width:40px; height:40px; border:3px solid #3a3a3a; border-top-color:#c49b4a; border-radius:50%; animation:spin 0.8s linear infinite }
.auto-sub { font-size:12px; color:#666 }
.grid { display:grid; grid-template-columns:repeat(2,1fr); gap:16px; margin-bottom:16px }
.card { background:#2a2a2a; border:2px solid #3a3a3a; border-radius:8px; padding:14px; position:relative; cursor:move; transition:all 0.3s; display:flex; flex-direction:column }
.card:hover { border-color:#c49b4a; box-shadow:0 0 12px rgba(196,155,74,0.3) }
.num { position:absolute; top:8px; right:8px; background:#c49b4a; color:#1a1a1a; padding:3px 8px; border-radius:3px; font-weight:bold; font-size:12px; z-index:1 }

/* ───── 预览区 ───── */
.preview { width:100%; aspect-ratio:16/9; background:#3a3a3a; border-radius:4px; display:flex; flex-direction:column; align-items:center; justify-content:center; margin:28px 0 12px; color:#666; font-size:13px; overflow:hidden; position:relative }
.preview.hasImg { background:#111 }
.preview-img { width:100%; height:100%; object-fit:cover; display:block }
.preview.loading { background:#1a1a1a; border:1px dashed #c49b4a }
.placeholder-text { opacity:0.5; text-align:center; padding:0 16px; line-height:1.5; color:#888 }

/* ───── 生成中 loading ───── */
.generating-overlay { display:flex; flex-direction:column; align-items:center; gap:10px; color:#c49b4a; font-size:12px; padding:12px }
.spinner { width:28px; height:28px; border:3px solid #3a3a3a; border-top-color:#c49b4a; border-radius:50%; animation:spin 0.8s linear infinite }
@keyframes spin { to{transform:rotate(360deg)} }

/* ───── 进度条 ───── */
.gen-progress-bar { width:80%; height:4px; background:#2a2a2a; border-radius:2px; overflow:hidden; margin-top:2px }
.gen-progress-fill { height:100%; background:linear-gradient(90deg,#c49b4a,#d4ab5a); border-radius:2px; transition:width 0.4s ease }
.gen-progress-text { font-size:10px; color:#888; font-variant-numeric:tabular-nums }

.dialogue-line { display: flex; align-items: flex-start; gap: 4px; margin: 4px 0; padding: 5px 8px; background: #fffbe6; border-radius: 6px; border-left: 3px solid #e6c300; }
.dl-icon { font-size: 14px; line-height: 1.4; }
.dl-input { flex: 1; border: 1px solid #d0d7de; border-radius: 4px; padding: 4px 8px; font-size: 13px; color: #333; background: #fff; outline: none; }
.dl-input:focus { border-color: #4a90d9; box-shadow: 0 0 0 2px rgba(74,144,217,0.15); }
.dl-input::placeholder { color: #aaa; }
.desc { width:100%; background:#1a1a1a; border:1px solid #3a3a3a; color:#e0e0e0; padding:8px; border-radius:4px; font-family:Consolas,monospace; resize:vertical; margin-bottom:8px; box-sizing:border-box }
.desc:focus { outline:none; border-color:#c49b4a }
.cam-row { display:flex; align-items:center; gap:6px; font-size:11px; color:#888; margin-bottom:8px; flex-wrap:wrap }
.cam-row label { white-space:nowrap }
.cam-row select { background:#1a1a1a; border:1px solid #3a3a3a; color:#c49b4a; padding:4px; border-radius:4px; font-family:Consolas,monospace; font-size:11px; min-width:0 }
.advanced { background:#222; border:1px solid #333; border-radius:6px; padding:10px; margin-bottom:8px; transition:all 0.3s }
.adv-row { display:flex; gap:8px; margin-bottom:6px; align-items:center }
.adv-row:last-child { margin-bottom:0 }
.adv-fg { display:flex; align-items:center; gap:4px; font-size:11px; color:#888; flex:1 }
.adv-fg label { white-space:nowrap; min-width:32px }
.adv-fg input, .adv-fg select { flex:1; background:#1a1a1a; border:1px solid #3a3a3a; color:#e0e0e0; padding:4px 6px; border-radius:3px; font-family:Consolas,monospace; font-size:11px }
.adv-fg select { color:#c49b4a }
.adv-fg input:focus { outline:none; border-color:#c49b4a }
.dur-input { width:50px; text-align:center }
.unit { font-size:10px; color:#555 }
.del { position:absolute; top:8px; left:8px; background:#ef4444; color:#fff; border:none; border-radius:50%; width:22px; height:22px; cursor:pointer; font-size:14px; line-height:1; z-index:1 }

/* ───── 生成场景图按钮 ───── */
.gen-img { width:100%; padding:8px; background:rgba(196,155,74,0.08); border:1px solid rgba(196,155,74,0.25); color:#c49b4a; border-radius:4px; font-family:Consolas,monospace; font-size:12px; cursor:pointer; transition:all 0.2s }
.gen-img:hover:not(:disabled) { background:rgba(196,155,74,0.15); border-color:#c49b4a }
.gen-img:disabled { opacity:0.5; cursor:not-allowed }

.add { width:100%; padding:14px; background:#2a2a2a; border:2px dashed #3a3a3a; color:#c49b4a; font-family:Consolas,monospace; font-size:15px; cursor:pointer; border-radius:8px; transition:all 0.3s }
.add:hover { border-color:#c49b4a; background:#333 }
.bar { margin-top:24px; text-align:center; position:sticky; bottom:0; background:#1a1a1a; padding:16px 0; z-index:10; border-top:1px solid #2a2a2a }
.next { padding:14px 36px; background:#c49b4a; color:#1a1a1a; border:none; border-radius:8px; font-family:Consolas,monospace; font-size:15px; font-weight:bold; cursor:pointer }
.next:hover:not(:disabled) { background:#d4ab5a; transform:translateY(-2px) }
.next:disabled { opacity:0.5; cursor:not-allowed }
@media(max-width:768px){ .grid{grid-template-columns:1fr} }
</style>
