<template>
  <div class="cb-page">
    <!-- 角色提取加载遮罩 -->
    <div v-if="extractingChars" class="cb-loading-overlay">
      <div class="cb-loading-box">
        <div class="cb-loading-spinner"></div>
        <h2>🔍 正在从剧本提取角色...</h2>
        <p>AI正在分析剧本中的角色信息，请稍候</p>
      </div>
    </div>
    <!-- 左侧 -->
    <div class="cb-left">
      <div class="cb-lh"><h3>🎭 角色列表 <span style="font-size:9px;color:#666">v220646</span></h3><span v-if="genre" class="cb-genre">{{ genre }}</span><button class="cb-add" @click="addChar">+ 添加</button></div>
      <div class="cb-cards">
        <div v-for="c in chars" :key="c.id" class="cb-card" :class="{active:sel?.id===c.id}" @click="selectChar(c)">
          <div class="cb-avatar"><img v-if="c.avatar" :src="c.avatar"/><span v-else>{{ (c.name||'?')[0] }}</span></div>
          <div class="cb-cname">{{ c.name||'未命名' }}</div>
          <span v-if="c.avatar" class="cb-dot">●</span>
        </div>
      </div>
      <button class="cb-ai-btn" @click="aiAll" :disabled="busy">{{ busy?'生成中...':'🤖 一键生成全部' }}</button>
    </div>

    <!-- 中 -->
    <div class="cb-mid">
      <div v-if="sel" class="cb-details">
        <h3>{{ sel.name||'角色详情' }}</h3>
        <div class="cb-photo-row">
          <div class="cb-photo-box" :class="{beautified: sel._beauty}" @click="viewLargeImg">
            <img v-if="sel.avatar" :src="sel.avatar" ref="photoPreview"/>
            <span v-else>📷</span>
            <div class="cb-photo-hint">点击看大图</div>
          </div>
          <div class="cb-photo-btns">
            <button class="cb-photo-btn" @click="showPhotoMenu=true">📷 换照片</button>
            <button class="cb-photo-btn" @click="viewLargeImg" v-if="sel.avatar">🔍 大图</button>
            <button class="cb-photo-btn" :class="{on: sel._beauty}" :disabled="busy" @click="toggleBeauty">{{ busy && genStatus.includes('美颜') ? '⏳ 美颜中…' : '✨ 美颜' }}</button>
            <button class="cb-photo-btn cb-face-swap" @click="openFaceSwap">👗 换装</button>
            <button class="cb-btn-save" @click="saveChar">💾 保存</button>
          </div>
        </div>
        <div class="cb-fg"><label>姓名</label><input v-model="sel.name" placeholder="角色姓名"/></div>
        <div class="cb-row">
          <div class="cb-fg"><label>性别</label>
            <select v-model="sel.gender"><option value="">请选择</option><option value="male">男</option><option value="female">女</option></select>
          </div>
          <div class="cb-fg"><label>年龄</label><input v-model="sel.age" placeholder="如：25岁"/></div>
        </div>
        <div class="cb-fg"><label>性格</label><textarea v-model="sel.personality" rows="2" placeholder="如：冷静果断、外冷内热"></textarea></div>
        <div class="cb-fg"><label>外貌</label><textarea v-model="sel.appearance" rows="3" placeholder="如：剑眉星目、白衣胜雪"></textarea></div>
        <div class="cb-actions">
          <button class="cb-gen" @click="genImage" :disabled="busy||!sel.appearance">{{ busy?'生成中...':'🎨 AI生成形象' }}</button>
          <button class="cb-ai-one" @click="aiFillOne" :disabled="busy||!sel.name">✨ AI补全</button>
        </div>
      </div>
      <div v-else class="cb-empty">请选择或添加角色</div>
    </div>

    <!-- 右：预览 -->
    <div class="cb-right">
      <h3>生成预览</h3>
      <div class="cb-preview">
        <div v-if="preview" class="cb-pimg" @click="viewLargeImg">
          <img :src="preview"/>
          <div class="cb-pbtns">
            <button class="cb-apply" @click="applyImg">✅ 保存为头像</button>
            <button class="cb-regen" @click="genImage" :disabled="busy">🔄 重新生成</button>
          </div>
        </div>
        <div v-else class="cb-pempty">点击"AI生成形象"查看效果</div>
      </div>
      <div class="cb-status" :class="genStatusClass" v-if="genStatus">{{ genStatus }}</div>
    </div>

    <!-- 底部 -->
    <div class="cb-footer">
      <button class="cb-btn-retry" @click="$emit('retry')">重新开始</button>
      <button class="cb-btn-next" @click="handleNext" :disabled="!canGo">
        下一步 ({{ readyCount }}/{{ chars.length }})
      </button>
    </div>

    <!-- 照片菜单弹窗 -->
    <div class="cb-overlay" v-if="showPhotoMenu" @click.self="showPhotoMenu=false">
      <div class="cb-popup">
        <div class="cb-popup-title">选择照片来源</div>
        <label class="cb-popup-btn">📁 本地上传<input type="file" accept="image/*" @change="onUpload" hidden ref="upInput"/></label>
        <button class="cb-popup-btn" @click="showMediaLib=true;showPhotoMenu=false">🖼️ 素材库</button>
        <button class="cb-popup-btn" @click="genImage;showPhotoMenu=false">🎨 AI生成</button>
        <button class="cb-popup-cancel" @click="showPhotoMenu=false">取消</button>
      </div>
    </div>

    <!-- 素材库弹窗 -->
    <div class="cb-overlay" v-if="showMediaLib" @click.self="showMediaLib=false">
      <div class="cb-popup cb-popup-wide">
        <div class="cb-popup-title">素材库</div>
        <div class="cb-media-grid">
          <div v-for="(m,i) in mediaItems" :key="i" class="cb-media-item" @click="pickMedia(m)">
            <img :src="m.url||m.path||m.thumbnail"/>
            <div class="cb-media-name">{{ m.name||m.filename||'素材' }}</div>
          </div>
          <div v-if="medLoading" class="cb-media-loading">加载中...</div>
          <div v-if="!medLoading&&!mediaItems.length" class="cb-media-empty">暂无素材</div>
          <div v-if="medHasMore" class="cb-media-more" @click="loadMediaLib">📥 加载更多...</div>
        </div>
        <button class="cb-popup-cancel" @click="showMediaLib=false">关闭</button>
      </div>
    </div>

    <!-- 大图弹窗 -->
    <div class="cb-overlay" v-if="showLargeImg" @click.self="showLargeImg=false">
      <div class="cb-large-wrap">
        <img :src="showLargeImg" class="cb-large-img"/>
        <button class="cb-large-close" @click="showLargeImg=false">✕</button>
      </div>
    </div>
  </div>
</template>

<script setup>
import request from '@/utils/request'
import storage from '@/utils/storage'
import { ref, computed, onMounted, watch } from 'vue'
import { useRouter } from 'vue-router'

const props = defineProps({ taskId: String, projectId: [String, Number] })
const router = useRouter()
const emit = defineEmits(['next','retry'])

const chars = ref([])
const sel = ref(null)
const preview = ref(null)
const busy = ref(false)
const extractingChars = ref(false)  // loading overlay for initial extraction
const genStatus = ref('')
const genStatusType = ref('') // 'success' | 'error' | 'warning' | ''
const upInput = ref(null)
const photoPreview = ref(null)
const showPhotoMenu = ref(false)
const showMediaLib = ref(false)
const mediaItems = ref([])
const medLoading = ref(false)
const medPage = ref(1)
const medHasMore = ref(true)
const showLargeImg = ref(null)
let saveToastTimer = null  // timer handle for save toast cleanup

const genStatusClass = computed(() => {
  if (!genStatusType.value) return ''
  return 'cb-status-' + genStatusType.value
})

const genre = computed(() => {
  const g = localStorage.getItem('__DRAMA_GENRE__') || ''
  const map = {xianxia:'🧚 仙侠',wuxia:'⚔️ 武侠',gufeng:'🏮 古风',xuanhuan:'🔮 玄幻',gongting:'👑 宫廷',dushi:'🏙️ 都市',yanqing:'💕 言情','xuan yi':'🎭 悬疑',kehuan:'🚀 科幻',mohe:'😂 魔合'}
  return map[g] || (g || '')
})

const canGo = computed(() => chars.value.length > 0 && chars.value.every(c => c.name && (c.avatar || c.image_url || c.portrait_url)))
const readyCount = computed(() => chars.value.filter(c => c.name && (c.avatar || c.image_url || c.portrait_url)).length)

onMounted(loadChars)
watch(showMediaLib, v => { if (v) { medPage.value=1; mediaItems.value=[]; medHasMore.value=true; loadMediaLib() } })

function setStatus(msg, type) {
  // 清除之前的计时器
  if (saveToastTimer) { clearTimeout(saveToastTimer); saveToastTimer = null }
  genStatus.value = msg
  genStatusType.value = type || ''
}

function flashStatus(msg, type, ms) {
  setStatus(msg, type)
  saveToastTimer = setTimeout(() => {
    if (genStatus.value === msg) {
      genStatus.value = ''
      genStatusType.value = ''
    }
    saveToastTimer = null
  }, ms || 2500)
}

async function loadChars() {
  let src = null
  extractingChars.value = true
  const pid = props.projectId || 'default'

  // Check project-scoped cache
  if (!storage.isStale(pid, 'chars', 30 * 60 * 1000)) {
    const cached = storage.get(pid, 'chars')
    if (cached) src = cached.data
  }

  // 从剧本自动提取（无缓存或已过期时）
  if (!src || !src.length) {
    const script = localStorage.getItem('__DRAMA_SCRIPT__') || ''
    if (script) {
      setStatus('🔍 正在从剧本提取角色...')
      try {
        const d = await request({
          url: '/api/v1/agents/execute', method: 'POST',
          data: {agent_id:'script',action:'extract',params:{script}}
        })
        const extracted = d.data?.characters || d.characters || []
        if (extracted.length) {
          src = extracted
          storage.set(pid, 'chars', extracted)
          setStatus('✅ 已提取 ' + extracted.length + ' 个角色', 'success')
        }
      } catch(e) { /* 提取失败不阻塞 */ }
    }
  }

  // 填充 chars（兼容 CharacterEditor 的 photo 字段名）
  if (src && src.length) {
    chars.value = src.map(function(c,i) {
      var g = c.gender || c.Gender || c.sex || ''
      if (g === '男') g = 'male'
      if (g === '女') g = 'female'
      return {
        id: i + 1,
        name: c.name || c.Name || '角色' + (i + 1),
        gender: g,
        age: c.age || c.Age || c.age_group || '',
        personality: c.personality || c.Personality || '',
        appearance: c.appearance || c.Appearance || c.desc || c.description || '',
        avatar: c.avatar || c.photo || c.image_url || null,
        _beauty: c._beauty || c.beauty || false,
        _manual: c._manual || false
      }
    })
  } else {
    chars.value = [{id:1,name:'主角',gender:'',age:'',personality:'',appearance:'',avatar:null,_beauty:false}]
  }
  sel.value = chars.value[0]
  extractingChars.value = false
}

function addChar() {
  chars.value.push({id:Date.now(),name:'',gender:'',age:'',personality:'',appearance:'',avatar:null,_beauty:false})
  sel.value = chars.value[chars.value.length-1]
}

function selectChar(c) { sel.value = c; preview.value = null; setStatus('') }

function viewLargeImg() {
  showLargeImg.value = preview.value || sel.value?.avatar || null
}

// ── 照片相关 ──
function onUpload(e) {
  const file = e.target.files?.[0]
  if (!file) return
  // 先预览
  const reader = new FileReader()
  reader.onload = ev => {
    if (sel.value) { sel.value.avatar = ev.target.result; sel.value._manual = true }
    preview.value = ev.target.result
    showPhotoMenu.value = false
  }
  reader.readAsDataURL(file)
  e.target.value = ''
  // 异步上传到公共素材库
  uploadToLibrary(file)
}

async function uploadToLibrary(file) {
  setStatus('📤 上传到素材库...')
  try {
    const fd = new FormData()
    fd.append('file', file)
    fd.append('media_type', 'figures')
    fd.append('share_to_library', 'true')
    fd.append('tags', sel.value?.name||'角色')
    const d = await request({ url: '/api/v1/media/library/upload', method:'POST', data:fd })
    if (d.success && d.data?.url) {
      sel.value.avatar = d.data.url
      preview.value = d.data.url
      setStatus('✅ 已上传到公共素材库', 'success')
    }
  } catch(e) { setStatus('⚠️ 上传素材库失败，但本地预览已就绪', 'warning') }
}

async function loadMediaLib() {
  medLoading.value = true
  try {
    const d = await request({ url: `/api/v1/media/library?page=${medPage.value}&page_size=30&media_type=figures&type=image`, method:'GET' })
    const items = (d.data?.items||d.items||d.data||[]).filter(m => m.url||m.file_path||m.path||m.thumbnail)
    if (items.length < 30) medHasMore.value = false
    mediaItems.value.push(...items)
    medPage.value++
  } catch(e) { mediaItems.value = [] }
  medLoading.value = false
}

function pickMedia(m) {
  let url = m.url || m.file_path || m.path || m.thumbnail
  // 服务器路径 → 完整URL
  if (url && url.startsWith('/www/wwwroot')) url = url.replace('/www/wwwroot', '')
  if (sel.value) { sel.value.avatar = url; sel.value._manual = true }
  preview.value = url
  showMediaLib.value = false
  setStatus('🖼️ 素材库照片已选，可直接保存', 'success')
}

// ── 美颜 ──
async function toggleBeauty() {
  if (!sel.value || !sel.value.name) { setStatus('⚠️ 请先选择左侧一个角色', 'warning'); return }
  // 如果已有美颜图，切换回原图
  if (sel.value._beauty) {
    sel.value._beauty = false
    if (sel.value._orig_avatar) {
      sel.value.avatar = sel.value._orig_avatar
      sel.value._orig_avatar = null
      preview.value = sel.value.avatar
    }
    setStatus('美颜已关闭')
    return
  }
  if (!sel.value.avatar) { setStatus('请先选择照片', 'warning'); return }
  // data URL 不能用，需等上传完成
  if (sel.value.avatar.startsWith('data:')) { setStatus('⚠️ 照片上传中，请稍后再试美颜', 'warning'); return }
  // 调 AI 美颜接口
  busy.value = true; setStatus('✨ AI磨皮美颜中...')
  try {
    const d = await request({
      url: '/api/v1/agents/execute', method: 'POST',
      data: {
        agent_id:'character', action:'beautify',
        params: {
          char_name: sel.value.name,
          ref_image: sel.value.avatar,
          age: sel.value.age||'',
          gender: sel.value.gender||'',
          style: localStorage.getItem('__DRAMA_GENRE__')||'古风',
          description: sel.value.appearance||''
        }
      }
    })
    if (d.success && d.data?.figure_url) {
      sel.value._orig_avatar = sel.value.avatar
      sel.value.avatar = d.data.figure_url
      preview.value = d.data.figure_url
      sel.value._beauty = true
      setStatus('✅ 美颜完成 — 点"💾 保存"生效', 'success')
    } else {
      setStatus('❌ 美颜失败: ' + (d.error||'未知错误'), 'error')
    }
  } catch(e) { setStatus('❌ 美颜请求失败', 'error') }
  busy.value = false
}

// ── 保存单个角色 ──
function openFaceSwap() {
  if (sel.value) {
    const cid = sel.value.id || sel.value.name
    if (cid) router.push("/create/faceswap/" + encodeURIComponent(cid))
  }
}
function saveChar() {
  if (!sel.value) { flashStatus('⚠️ 请先选择左侧一个角色', 'warning'); return }
  // 有照片才标记_manual，阻止一键生成覆盖
  if (sel.value.avatar) sel.value._manual = true
  storage.set(props.projectId || 'default', 'chars', JSON.parse(JSON.stringify(chars.value)))
  flashStatus('✅ 角色「' + (sel.value.name||'未命名') + '」已保存', 'success')
}

// ── AI ──
async function genImage() {
  if (!sel.value?.appearance) { setStatus('请先填写外貌描述', 'warning'); return }
  busy.value = true; preview.value = null; setStatus('正在生成形象...')
  try {
    const genre = localStorage.getItem('__DRAMA_GENRE__') || ''
    const d = await request({
      url: '/api/v1/pipeline/character-design', method: 'POST',
      data: {name:sel.value.name,gender:sel.value.gender||'male',personality:sel.value.personality||'',appearance:sel.value.appearance||'',genre}
    })
    preview.value = d.data?.image_url || d.image_url || ''
    if (preview.value) {
      setStatus('✅ 生成完成，点"保存为头像"', 'success')
      setTimeout(() => { if (preview.value && sel.value) { sel.value.avatar = preview.value; setStatus('✅ 已自动保存', 'success') } }, 800)
    } else {
      setStatus('❌ 生成失败，请重试', 'error')
    }
  } catch(e) { setStatus('❌ 网络错误', 'error') }
  busy.value = false
}

function applyImg() {
  if (sel.value && preview.value) {
    sel.value.avatar = preview.value
    genStatus.value = '✅ 形象已应用，点"💾 保存"持久化'
    setTimeout(() => { if (genStatus.value && genStatus.value.startsWith('✅ 形象已应用')) genStatus.value = '' }, 3000)
  }
}

async function aiFillOne() {
  if (!sel.value?.name) return
  busy.value = true; setStatus('AI补全中...')
  try {
    const d = await request({
      url: '/api/v1/agents/execute', method: 'POST',
      data: {agent_id:'character',action:'complete',params:{name:sel.value.name,script_context:localStorage.getItem('__DRAMA_SCRIPT__')||''}}
    })
    const fill = d.data || d
    // Map Chinese gender to frontend values
    if (fill.gender === '男') fill.gender = 'male'
    if (fill.gender === '女') fill.gender = 'female'
    if (!sel.value.personality && fill.personality) sel.value.personality = fill.personality
    if (!sel.value.appearance && fill.appearance) sel.value.appearance = fill.appearance
    if (!sel.value.age && fill.age) sel.value.age = fill.age
    if (!sel.value.gender && fill.gender) sel.value.gender = fill.gender
    setStatus('✅ 字段已补全，点"AI生成形象"生图', 'success')
  } catch(e) { setStatus('❌ 补全失败', 'error') }
  busy.value = false
}

async function aiAll() {
  busy.value = true; setStatus('一键生成中...')
  const genre = localStorage.getItem('__DRAMA_GENRE__') || ''
  for (const c of chars.value) {
    sel.value = c
    // 跳过已手动保存的角色（用户上传/素材库选的图不覆盖）
    // 已手动保存且有照片的跳过，没有照片的照样生成
    if ((c._manual || c._generated) && c.avatar) { setStatus('⏭️ 跳过 ' + c.name + '（已有肖像）'); continue }
    if (!c.personality || !c.appearance) await aiFillOneSilent(c)
    if (c.appearance) await genImageSilent(c, genre)
  }
  setStatus('✅ 全部生成完成', 'success')
  busy.value = false
}

async function aiFillOneSilent(c) {
  if (!c.name || (c.personality && c.appearance)) return
  try {
    const d = await request({
      url: '/api/v1/agents/execute', method: 'POST',
      data: {agent_id:'character',action:'complete',params:{name:c.name,script_context:localStorage.getItem('__DRAMA_SCRIPT__')||''}}
    })
    const fill = d.data || d
    if (fill.gender === '男') fill.gender = 'male'
    if (fill.gender === '女') fill.gender = 'female'
    if (!c.personality && fill.personality) c.personality = fill.personality
    if (!c.appearance && fill.appearance) c.appearance = fill.appearance
    if (!c.age && fill.age) c.age = fill.age
    if (!c.gender && fill.gender) c.gender = fill.gender
  } catch(e) {}
}

async function genImageSilent(c, genre) {
  if (!c.appearance) return
  try {
    const d = await request({
      url: '/api/v1/pipeline/character-design', method: 'POST',
      data: {name:c.name,gender:c.gender||'male',personality:c.personality||'',appearance:c.appearance||'',genre:genre||''}
    })
    c._preview = d.data?.image_url || d.image_url || ''
    c._generated = true  # 标记已生成，一键生成跳过
    if (!c.avatar && c._preview) c.avatar = c._preview  # 第一次生成才自动写入
  } catch(e) {}
}

async function handleNext() {
  // 检查有没有角色没有肖像图
  const emptyChars = chars.value.filter(c => !c.avatar && !c.image_url && !c.portrait_url)
  if (emptyChars.length > 0) {
    setStatus(`🎭 角色建模中 (0/${emptyChars.length})，请稍后...`, 'info')
    let done = 0
    for (const c of emptyChars) {
      sel.value = c
      // AI补全信息
      if (!c.personality || !c.appearance) await aiFillOneSilent(c)
      // 生成肖像
      if (c.appearance) {
        const genre = localStorage.getItem('__DRAMA_GENRE__') || ''
        try {
          const d = await request({
            url: '/api/v1/pipeline/character-design', method: 'POST',
            data: {name:c.name,gender:c.gender||'male',personality:c.personality||'',appearance:c.appearance||'',genre}
          })
          const url = d.data?.image_url || d.image_url || ''
          if (url) {
            c.avatar = url
            c._generated = true
          }
        } catch(e) {}
      }
      done++
      setStatus(`🎭 角色建模中 (${done}/${emptyChars.length})，请稍后...`, 'info')
    }
  }
  // 保存并进入下一步
  storage.set(props.projectId || 'default', 'chars', JSON.parse(JSON.stringify(chars.value)))
  emit('next', chars.value)
}
</script>

<style scoped>
.cb-page {
  display:grid;grid-template-columns:200px 1fr 280px;gap:16px;
  height:calc(100vh-200px);background:#1a1a1a;color:#e0e0e0;padding:16px;
  position:relative;font-family:Consolas,monospace;overflow:hidden
}
.cb-left,.cb-mid,.cb-right {background:#242424;border-radius:8px;padding:14px;overflow-y:auto}
.cb-lh {display:flex;justify-content:space-between;align-items:center;margin-bottom:12px}
.cb-lh h3,.cb-mid h3,.cb-right h3 {color:#c49b4a;font-size:14px;margin:0}
.cb-genre {font-size:10px;background:#2a1f0a;color:#c49b4a;padding:2px 8px;border-radius:10px;border:1px solid #c49b4a}
.cb-add {background:#c49b4a;color:#1a1a1a;border:none;padding:4px 10px;border-radius:4px;cursor:pointer;font-size:12px}
.cb-ai-btn {width:100%;margin-top:12px;background:linear-gradient(135deg,#c49b4a,#a08030);color:#1a1a1a;border:none;padding:10px;border-radius:6px;cursor:pointer;font-size:13px;font-weight:bold}
.cb-ai-btn:disabled {opacity:0.5;cursor:not-allowed}

.cb-cards {display:flex;flex-direction:column;gap:8px}
.cb-card {background:#2a2a2a;border:2px solid transparent;border-radius:6px;padding:10px;cursor:pointer;display:flex;align-items:center;gap:8px;transition:all 0.3s}
.cb-card:hover,.cb-card.active {border-color:#c49b4a}
.cb-avatar {width:36px;height:36px;border-radius:50%;background:#3a3a3a;display:flex;align-items:center;justify-content:center;font-size:16px;color:#c49b4a;overflow:hidden;flex-shrink:0}
.cb-avatar img {width:100%;height:100%;object-fit:cover}
.cb-cname {font-size:12px;flex:1;min-width:0;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
.cb-dot {color:#10b981;font-size:8px}

/* 照片行 */
.cb-photo-row {display:flex;align-items:center;gap:12px;margin-bottom:8px}
.cb-photo-box {width:64px;height:76px;border-radius:8px;overflow:hidden;background:#2a2a2a;border:2px solid #3a3a3a;cursor:pointer;display:flex;align-items:center;justify-content:center;flex-shrink:0;position:relative}
.cb-photo-box img {width:100%;height:100%;object-fit:cover;object-position:50% 15%}
.cb-photo-box span {font-size:24px}
.cb-photo-box.beautified img {filter:brightness(1.12) contrast(0.94) saturate(1.06) blur(0.6px)}
.cb-pimg {cursor:pointer}
.cb-photo-hint {position:absolute;inset:0;background:rgba(0,0,0,0.6);display:flex;align-items:center;justify-content:center;font-size:9px;opacity:0;transition:.2s}
.cb-photo-box:hover .cb-photo-hint {opacity:1}
.cb-photo-btns {display:flex;flex-direction:column;gap:3px}
.cb-photo-btn {padding:4px 10px;border-radius:4px;border:1px solid #3a3a3a;background:#2a2a2a;color:#aaa;font-size:10px;cursor:pointer}
.cb-photo-btn:hover,.cb-photo-btn.on {border-color:#c49b4a;color:#c49b4a}
.cb-btn-save {padding:4px 10px;border-radius:4px;border:1px solid #10b981;background:rgba(16,185,129,0.1);color:#10b981;font-size:10px;cursor:pointer}
.cb-btn-save:hover {background:rgba(16,185,129,0.2)}

.cb-details {display:flex;flex-direction:column;gap:8px}
.cb-fg {display:flex;flex-direction:column;gap:3px}
.cb-fg label {color:#c49b4a;font-size:11px}
.cb-fg input,.cb-fg select,.cb-fg textarea {width:100%;background:#2a2a2a;border:1px solid #3a3a3a;border-radius:4px;padding:6px 10px;color:#e0e0e0;font-family:Consolas,monospace;font-size:12px;box-sizing:border-box}
.cb-fg input:focus,.cb-fg select:focus,.cb-fg textarea:focus {outline:none;border-color:#c49b4a}
.cb-row {display:grid;grid-template-columns:1fr 1fr;gap:10px}
.cb-actions {display:flex;gap:8px;margin-top:4px}
.cb-gen {flex:1;background:#c49b4a;color:#1a1a1a;border:none;padding:8px;border-radius:6px;cursor:pointer;font-size:12px;font-weight:bold}
.cb-gen:disabled {opacity:0.5}
.cb-ai-one {padding:8px 14px;background:#2a2a2a;color:#c49b4a;border:1px solid #3a3a3a;border-radius:6px;cursor:pointer;font-size:11px}
.cb-ai-one:hover {border-color:#c49b4a}
.cb-ai-one:disabled {opacity:0.5}
.cb-empty {color:#666;text-align:center;padding:40px}

.cb-preview {min-height:180px;display:flex;align-items:center;justify-content:center}
.cb-pimg {width:100%;display:flex;flex-direction:column;gap:8px}
.cb-pimg img {width:100%;height:220px;object-fit:cover;object-position:50% 15%;border-radius:8px;border:2px solid #c49b4a}
.cb-pbtns {display:flex;gap:6px}
.cb-apply,.cb-regen {flex:1;padding:8px;border-radius:6px;cursor:pointer;font-size:12px}
.cb-apply {background:#10b981;color:#fff;border:none}
.cb-regen {background:#2a2a2a;color:#c49b4a;border:1px solid #3a3a3a}
.cb-regen:disabled {opacity:0.5}
.cb-pempty {color:#666;text-align:center;padding:40px}

/* genStatus — 默认（信息/进行中） */
.cb-status {margin-top:8px;font-size:13px;font-weight:600;color:#818cf8;text-align:center;padding:6px 12px;background:rgba(99,102,241,0.08);border-radius:6px;animation:cbFadeIn 0.3s}
/* 成功 */
.cb-status-success {color:#10b981;background:rgba(16,185,129,0.08)}
/* 错误 */
.cb-status-error {color:#ef4444;background:rgba(239,68,68,0.08)}
/* 警告 */
.cb-status-warning {color:#f59e0b;background:rgba(245,158,11,0.08)}

.cb-footer {position:absolute;bottom:16px;right:16px;display:flex;gap:8px}
.cb-footer button {padding:8px 20px;border-radius:6px;border:none;cursor:pointer;font-size:13px}
.cb-btn-retry {background:#2a2a2a;color:#e0e0e0;border:1px solid #3a3a3a}
.cb-btn-next {background:#c49b4a;color:#1a1a1a;font-weight:bold}
.cb-btn-next:disabled {opacity:0.5;cursor:not-allowed}

/* 弹窗 */
.cb-overlay {position:fixed;inset:0;background:rgba(0,0,0,0.7);display:flex;align-items:center;justify-content:center;z-index:1000}
.cb-popup {background:#1e1e1e;border:1px solid #3a3a3a;border-radius:12px;padding:16px;min-width:240px;display:flex;flex-direction:column;gap:8px}
.cb-popup-wide {min-width:360px;max-width:480px;max-height:70vh;overflow-y:auto}
.cb-popup-title {color:#c49b4a;font-size:13px;font-weight:600;text-align:center;margin-bottom:4px}
.cb-popup-btn {padding:10px 14px;border-radius:6px;border:1px solid #3a3a3a;background:#2a2a2a;color:#e0e0e0;font-size:12px;cursor:pointer;display:flex;align-items:center;gap:6px}
.cb-popup-btn:hover {border-color:#c49b4a;color:#c49b4a}
.cb-popup-btn input {width:0;height:0;opacity:0;position:absolute}
.cb-popup-cancel {padding:8px;background:transparent;border:none;color:#666;font-size:11px;cursor:pointer;text-align:center}
.cb-popup-cancel:hover {color:#aaa}
.cb-media-grid {display:grid;grid-template-columns:1fr 1fr 1fr;gap:6px;max-height:280px;overflow-y:auto}
.cb-media-item {border-radius:6px;overflow:hidden;border:1px solid #3a3a3a;cursor:pointer}
.cb-media-item:hover {border-color:#c49b4a}
.cb-media-item img {width:100%;height:80px;object-fit:cover;display:block}
.cb-media-name {font-size:9px;padding:2px 4px;color:#888;text-align:center;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
.cb-media-loading,.cb-media-empty {grid-column:1/-1;text-align:center;padding:20px;font-size:11px;color:#666}
.cb-media-more {grid-column:1/-1;text-align:center;padding:10px;cursor:pointer;color:#c49b4a;font-size:12px;border-top:1px solid #333;transition:color .2s}
.cb-media-more:hover {color:#e0b860}

/* 大图 */
.cb-large-wrap {position:relative;max-width:90vw;max-height:90vh}
.cb-large-img {max-width:90vw;max-height:85vh;border-radius:12px;border:2px solid #c49b4a;object-fit:contain}
.cb-large-close {position:absolute;top:-12px;right:-12px;width:32px;height:32px;border-radius:50%;background:#e53e3e;color:#fff;border:none;font-size:16px;cursor:pointer;display:flex;align-items:center;justify-content:center}
.cb-large-close:hover {background:#c53030}

@keyframes cbFadeIn{from{opacity:0;transform:translateY(-4px)}to{opacity:1;transform:translateY(0)}}
/* 角色提取加载遮罩 */
.cb-loading-overlay {
  position: absolute; top: 0; left: 0; right: 0; bottom: 0;
  background: rgba(10, 10, 10, 0.92);
  z-index: 100;
  display: flex; align-items: center; justify-content: center;
}
.cb-loading-box {
  text-align: center;
  animation: cbFadeIn 0.4s ease;
}
.cb-loading-spinner {
  width: 56px; height: 56px;
  border: 3px solid rgba(196, 155, 74, 0.15);
  border-top-color: #c49b4a;
  border-radius: 50%;
  animation: cbSpin 0.8s linear infinite;
  margin: 0 auto 20px;
}
.cb-loading-box h2 {
  color: #c49b4a;
  font-size: 20px;
  font-family: Consolas, monospace;
  margin: 0 0 8px;
}
.cb-loading-box p {
  color: #666;
  font-size: 13px;
  font-family: Consolas, monospace;
  margin: 0;
}
@keyframes cbSpin { to { transform: rotate(360deg); } }
@keyframes cbFadeIn { from { opacity: 0; } to { opacity: 1; } }

.cb-page { position: relative; }

.cb-face-swap { background: rgba(138,43,226,0.1); border: 1px solid var(--accent); color: var(--accent); }
.cb-face-swap:hover { background: var(--accent-glow); box-shadow: 0 0 8px var(--accent-glow); }
</style>
