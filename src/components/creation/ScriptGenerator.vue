<template>
  <div class="script-generator">
    <div class="header">
      <div class="stage-info">
        <h2 class="stage-title">{{ stageTitle }}</h2>
        <span class="stage-desc">{{ stageDesc }}</span>
      </div>
      <div class="progress-bar">
        <div class="progress-fill" :style="{ width: progress + '%' }"></div>
      </div>
    </div>
    <div class="script-content" ref="contentRef">
      <div class="script-lines">
        <div v-for="(line, index) in displayedLines" :key="index" :class="getLineClass(line)">
          <template v-if="line.type === 'dialogue'">
            <span class="character-name">{{ line.character }}：</span>
            <span class="dialogue-text">{{ line.text }}</span>
          </template>
          <template v-else-if="line.type === 'narration'">
            <span class="narration-text">{{ line.text }}</span>
          </template>
          <template v-else-if="line.type === 'scene'">
            <span class="scene-text">{{ line.text }}</span>
          </template>
          <template v-else-if="line.type === 'code'">
            <pre class="code-block"><code>{{ line.text }}</code></pre>
          </template>
          <template v-else>
            <span class="normal-text">{{ line.text }}</span>
          </template>
        </div>
        <div v-if="isGenerating" class="typing-cursor">&#x258A;</div>
        <div v-if="!isGenerating && displayedLines.length === 0" class="empty-state">
          <p class="empty-text">暂无剧本内容</p>
          <p class="empty-hint">点击顶部「⚡ 一键生成」按钮开始创作，或输入剧本后点击「确认继续」</p>
        </div>
      </div>
    </div>
    <div class="footer">
      <button class="btn btn-secondary" @click="handleRetry" :disabled="isGenerating || confirmLoading">
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor"><path d="M1 4v6h6M23 20v-6h-6"/><path d="M20.49 9A9 9 0 0 0 5.64 5.64L1 10m22 4l-4.64 4.36A9 9 0 0 1 3.51 15"/></svg>
        重新生成
      </button>
      <button
        class="btn btn-primary"
        :class="{ 'btn-loading': confirmLoading }"
        @click="handleConfirm"
        :disabled="isGenerating || confirmLoading"
      >
        <span v-if="confirmLoading" class="spinner-sm"></span>
        <span v-if="confirmLoading">{{ confirmLoadingText }}</span>
        <span v-else>确认继续</span>
      </button>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted, nextTick, watch, computed } from 'vue'
import request from '@/utils/request'

const props = defineProps({
  taskId: { type: String, default: 'default' },
  stageTitle: { type: String, default: '剧本生成中' },
  stageDesc: { type: String, default: 'AI 正在创作您的短剧剧本...' },
  stageId: { type: String, default: '' }
})
const emit = defineEmits(['next', 'retry', 'error'])

const contentRef = ref(null)
const isGenerating = ref(false)
const progress = ref(0)
const rawLines = ref([])
const displayedLines = ref([])
const fullScriptText = ref('')
const confirmLoading = ref(false)
let eventSource = null
let typingTimer = null
let currentLineIndex = 0

// ───── 确认按钮加载文案 ─────
const confirmLoadingText = computed(() => {
  switch (props.stageId) {
    case 'director_analysis': return 'AI分析中...'
    case 'script_creation': return 'AI润色中...'
    default: return '处理中...'
  }
})

function parseLine(text) {
  const t = text.trim()
  if (!t) return { type: 'empty', text: '' }
  if (/^[\u3010\u3011\[\]]/.test(t) && /[\u3010\u3011\[\]]$/.test(t)) return { type: 'scene', text: t }
  const m = t.match(/^([^\uff1a:]+)[\uff1a:](.+)$/)
  if (m) return { type: 'dialogue', character: m[1].trim(), text: m[2].trim() }
  if (t.startsWith('```')) return { type: 'code', text: t }
  if (t.startsWith('(') || t.startsWith('\uff08')) return { type: 'narration', text: t }
  return { type: 'normal', text: t }
}
function getLineClass(line) { return 'script-line line-' + line.type }

function startTypingEffect() {
  if (currentLineIndex >= rawLines.value.length) return
  displayedLines.value.push(rawLines.value[currentLineIndex])
  currentLineIndex++
  nextTick(() => { if (contentRef.value) contentRef.value.scrollTop = contentRef.value.scrollHeight })
  if (currentLineIndex < rawLines.value.length) typingTimer = setTimeout(startTypingEffect, 30)
}

function startSSE() {
  isGenerating.value = true; progress.value = 10
  const url = '/api/v1/pipeline/script/stream?task_id=' + props.taskId
  eventSource = new EventSource(url)
  eventSource.onmessage = (event) => {
    try {
      const data = JSON.parse(event.data)
      if (data.progress !== undefined) progress.value = Math.min(data.progress, 95)
      if (data.line) {
        const p = parseLine(data.line)
        rawLines.value.push(p)
        fullScriptText.value += data.line + '\n'
        if (rawLines.value.length === 1) startTypingEffect()
      }
      if (data.status === 'completed') { progress.value = 100; isGenerating.value = false; eventSource.close() }
    } catch(e) { console.error('SSE parse error:', e) }
  }
  eventSource.onerror = () => { isGenerating.value = false; eventSource.close(); emit('error', '剧本生成失败') }
}

function handleRetry() {
  rawLines.value = []; displayedLines.value = []; fullScriptText.value = ''
  currentLineIndex = 0; progress.value = 0
  if (typingTimer) { clearTimeout(typingTimer); typingTimer = null }
  if (eventSource) eventSource.close()
  emit('retry')
  setTimeout(startSSE, 300)
}

async function handleConfirm() {
  if (confirmLoading.value) return  // 防重复提交

  confirmLoading.value = true

  // 根据阶段调用对应的后端 API
  const scriptContent = fullScriptText.value
  const genre = localStorage.getItem('__DRAMA_GENRE__') || ''

  let apiFailed = false
  try {
    switch (props.stageId) {
      case 'director_analysis': {
        // 导演分析：调用 director agent
        const res = await request({
          url: '/api/v1/agents/execute',
          method: 'post',
          timeout: 120000,
          data: {
            agent_id: 'director',
            action: 'analyze',
            params: { script: scriptContent, genre }
          }
        })
        // 保存分析结果（如有）
        if (res?.analysis) {
          localStorage.setItem('__DRAMA_ANALYSIS__', JSON.stringify(res.analysis))
        }
        if (res?.data?.analysis) {
          localStorage.setItem('__DRAMA_ANALYSIS__', JSON.stringify(res.data.analysis))
        }
        break
      }
      case 'script_creation': {
        // 剧本润色：调用 script agent
        const res = await request({
          url: '/api/v1/agents/execute',
          method: 'post',
          timeout: 120000,
          data: {
            agent_id: 'script',
            action: 'polish',
            params: { script: scriptContent, genre }
          }
        })
        // 保存润色结果
        if (res?.polished_script || res?.script) {
          const polished = res.polished_script || res.script
          localStorage.setItem('__DRAMA_SCRIPT__', polished)
        }
        if (res?.data?.polished_script || res?.data?.script) {
          const polished = res.data.polished_script || res.data.script
          localStorage.setItem('__DRAMA_SCRIPT__', polished)
        }
        break
      }
      default:
        // 无特定阶段，直接通过
        break
    }
  } catch(e) {
    console.warn(`${props.stageId} API 调用失败:`, e.message || e)
    apiFailed = true
  }

  if (apiFailed) {
    confirmLoading.value = false
    return
  }

  // 保存当前剧本到 localStorage（如果脚本创作阶段已保存润色结果则不覆盖）
  if (scriptContent) {
    if (props.stageId !== 'script_creation') {
      localStorage.setItem('__DRAMA_SCRIPT__', scriptContent)
    }
  }

  // 从剧本提取角色名，存入 __DRAMA_CHARS__（CharactersPage/CharacterEditor 从它读）
  const _scriptExtract = scriptContent || ''
  const _charNames = []
  const _nameSet = new Set()
  // 匹配"角色名："格式
  const _re = /^([^\s：:]{1,10}?)[：:]/gm
  let _m
  while ((_m = _re.exec(_scriptExtract)) !== null) {
    const _n = _m[1].trim().replace(/说$/,'').replace(/道$/,'')
    if (_n && _n.length >= 1 && _n.length <= 8 && !['旁白','独白','字幕','画外音','OS'].includes(_n) && !_nameSet.has(_n)) {
      _nameSet.add(_n)
      _charNames.push({
        name: _n,
        gender: '',
        role_type: _charNames.length === 0 ? '主角' : '配角',
        age: '25岁',
        personality: '',
        appearance: ''
      })
    }
  }
  if (_charNames.length > 0) {
    localStorage.setItem('__DRAMA_CHARS__', JSON.stringify(_charNames))
  }

  // 确保 __DRAMA_GENRE__ 已设置（以便后续管线拿到正确的类型）
  let savedGenre = localStorage.getItem('__DRAMA_GENRE__') || ''
  if (!savedGenre) {
    // 尝试从剧本文本自动检测
    const scriptLower = scriptContent.toLowerCase()
    if (scriptLower.includes('仙') || scriptLower.includes('修') || scriptLower.includes('古') || scriptLower.includes('侠') || scriptLower.includes('江湖')) {
      savedGenre = '仙侠'
    } else if (scriptLower.includes('都') || scriptLower.includes('市') || scriptLower.includes('现代')) {
      savedGenre = '都市'
    } else if (scriptLower.includes('科幻') || scriptLower.includes('未来') || scriptLower.includes('外星')) {
      savedGenre = '科幻'
    } else if (scriptLower.includes('民国')) {
      savedGenre = '民国'
    } else if (scriptLower.includes('悬疑') || scriptLower.includes('侦探') || scriptLower.includes('推理')) {
      savedGenre = '悬疑'
    }
    if (savedGenre) {
      localStorage.setItem('__DRAMA_GENRE__', savedGenre)
    }
  }

  confirmLoading.value = false
  emit('next', scriptContent)
}

onMounted(() => {
  // 先查localStorage，有剧本直接用
  let cached = localStorage.getItem('__DRAMA_SCRIPT__')

  // 回退：如果 __DRAMA_SCRIPT__ 没有，尝试从 __CREATE_STATE__ 恢复
  if (!cached || cached.length <= 20) {
    try {
      const state = JSON.parse(localStorage.getItem('__CREATE_STATE__') || '{}')
      if (state.script && state.script.length > 20) {
        cached = state.script
        localStorage.setItem('__DRAMA_SCRIPT__', cached)
      }
    } catch (e) { console.error("[ScriptGenerator] error:", e) }
  }

  if (cached && cached.length > 20) {
    const lines = cached.split('\n').filter(l => l.trim())
    lines.forEach(l => {
      rawLines.value.push(parseLine(l))
      fullScriptText.value += l + '\n'
    })
    progress.value = 100
    isGenerating.value = false
    if (rawLines.value.length > 0) startTypingEffect()

    // Auto-detect genre from cached script if not set
    if (!localStorage.getItem('__DRAMA_GENRE__')) {
      const lower = cached.toLowerCase()
      let detected = ''
      if (lower.includes('仙') || lower.includes('修') || lower.includes('古') || lower.includes('侠') || lower.includes('江湖')) detected = '仙侠'
      else if (lower.includes('都') || lower.includes('市') || lower.includes('现代')) detected = '都市'
      else if (lower.includes('科幻') || lower.includes('未来') || lower.includes('外星')) detected = '科幻'
      if (detected) localStorage.setItem('__DRAMA_GENRE__', detected)
    }
  } else {
    // 无缓存剧本：不自动调 SSE（SSE 只读已完成管线，不是生成器）
    // 用户需点「一键生成」或输入后点确认
    progress.value = 0
    isGenerating.value = false
  }
})
onUnmounted(() => {
  if (eventSource) eventSource.close()
  if (typingTimer) clearTimeout(typingTimer)
})
watch(() => rawLines.value.length, (n, o) => {
  if (n > o && !typingTimer && currentLineIndex < n) startTypingEffect()
})
</script>

<style scoped>
.script-generator { display:flex; flex-direction:column; height:100%; background:#1a1a1a; border-radius:12px; overflow:hidden }
.header { padding:24px 32px; background:linear-gradient(135deg,#2d2d2d,#1f1f1f); border-bottom:1px solid #333 }
.stage-title { font-size:24px; font-weight:600; color:#fff; margin:0 0 8px }
.stage-desc { font-size:14px; color:#999 }
.progress-bar { height:4px; background:#333; border-radius:2px; overflow:hidden; margin-top:12px }
.progress-fill { height:100%; background:linear-gradient(90deg,#667eea,#764ba2); transition:width 0.3s; border-radius:2px }
.script-content { flex:1; overflow-y:auto; padding:32px; background:#0f0f0f; line-height:1.8 }
.script-content::-webkit-scrollbar { width:8px }
.script-content::-webkit-scrollbar-track { background:#1a1a1a }
.script-content::-webkit-scrollbar-thumb { background:#444; border-radius:4px }
.script-lines { max-width:800px; margin:0 auto }
.script-line { margin-bottom:16px; animation:fadeInUp 0.3s ease }
@keyframes fadeInUp { from { opacity:0; transform:translateY(10px) } to { opacity:1; transform:translateY(0) } }
.line-dialogue { padding:12px 16px; background:rgba(102,126,234,0.05); border-left:3px solid #667eea; border-radius:4px }
.character-name { font-weight:600; color:#667eea; font-size:16px; margin-right:8px }
.dialogue-text { color:#e0e0e0; font-size:15px }
.line-narration { padding:8px 16px; font-style:italic }
.narration-text { color:#888; font-size:14px }
.line-scene { padding:12px 0; text-align:center; margin:24px 0 }
.scene-text { color:#ffd700; font-size:16px; font-weight:600; background:rgba(255,215,0,0.1); padding:8px 24px; border-radius:20px; display:inline-block }
.line-code { margin:16px 0 }
.code-block { background:#1e1e1e; border:1px solid #333; border-radius:6px; padding:16px; overflow-x:auto; font-family:Consolas,monospace; font-size:13px; color:#d4d4d4; line-height:1.6 }
.line-normal { padding:4px 0 }
.normal-text { color:#ccc; font-size:15px }
.line-empty { height:8px }
.typing-cursor { display:inline-block; color:#667eea; font-size:18px; animation:blink 1s infinite; margin-left:4px }
@keyframes blink { 0%,50%{opacity:1} 51%,100%{opacity:0} }
.footer { display:flex; justify-content:center; gap:16px; padding:24px 32px; background:#1a1a1a; border-top:1px solid #333 }
.btn { display:flex; align-items:center; gap:8px; padding:12px 32px; font-size:15px; font-weight:500; border:none; border-radius:8px; cursor:pointer; transition:all 0.3s }
.btn:disabled { opacity:0.5; cursor:not-allowed }
.btn-secondary { background:#2d2d2d; color:#fff }
.btn-secondary:hover:not(:disabled) { background:#3d3d3d }
.btn-primary { background:linear-gradient(135deg,#667eea,#764ba2); color:#fff }
.btn-primary:hover:not(:disabled) { background:linear-gradient(135deg,#5a6fd6,#6a41a2) }

/* ───── 确认按钮 loading 态 ───── */
.btn-loading { opacity:0.85; cursor:wait }
.spinner-sm { display:inline-block; width:16px; height:16px; border:2.5px solid rgba(255,255,255,0.3); border-top-color:#fff; border-radius:50%; animation:spin 0.7s linear infinite }
@keyframes spin { to{transform:rotate(360deg)} }
</style>
