<template>
<div class="faceswap-page">
  <div class="fs-header">
    <button class="fs-back-btn" @click="$router.back()">← 返回</button>
    <h2>👗 角色换装</h2>
    <p class="fs-sub">选择角色，锁定面容，换装/换发型/换场景</p>
  </div>

  <div class="fs-layout">
    <!-- 左侧：角色选择器 + 原始形象卡 -->
    <div class="fs-left">
      <div class="fs-section">
        <label class="fs-label">选择角色</label>
        <select v-model="selectedCharId" class="fs-select" @change="onCharChange">
          <option value="">-- 选择角色 --</option>
          <option v-for="c in characters" :key="c.id || c.name" :value="c.id || c.name">
            {{ c.name }}
          </option>
        </select>
      </div>

      <div class="fs-section" v-if="selectedChar">
        <label class="fs-label">原始形象</label>
        <div class="fs-original-card">
          <img v-if="selectedChar.image_url" :src="selectedChar.image_url" class="fs-original-img" alt="角色定妆照" />
          <div v-else class="fs-original-placeholder">
            <span class="fs-placeholder-icon">👤</span>
            <span>暂无定妆照</span>
          </div>
          <div class="fs-char-name">{{ selectedChar.name }}</div>
        </div>
      </div>
    </div>

    <!-- 右侧：换装操作区 -->
    <div class="fs-right">
      <div v-if="!selectedChar" class="fs-empty-state">
        <span class="fs-empty-icon">👈</span>
        <p>请先在左侧选择一个角色</p>
      </div>

      <template v-else>
        <!-- Tab 切换 -->
        <div class="fs-tabs" v-if="tabs.length > 0">
          <button
            v-for="tab in tabs"
            :key="tab.key"
            class="fs-tab-btn"
            :class="{ active: activeTab === tab.key }"
            @click="activeTab = tab.key"
          >
            {{ tab.label }}
          </button>
        </div>

        <!-- 预设选项卡片流 -->
        <div class="fs-presets-section">
          <label class="fs-label">{{ activeTabLabel }}预设</label>
          <div class="fs-presets-scroll" v-if="activePresets.length > 0">
            <div
              v-for="(preset, idx) in activePresets"
              :key="preset.id || idx"
              class="fs-preset-card"
              :class="{ selected: selectedPreset === preset }"
              @click="selectPreset(preset)"
            >
              <span class="fs-preset-icon">{{ preset.icon }}</span>
              <span class="fs-preset-name">{{ preset.name }}</span>
            </div>
          </div>
          <div v-else class="fs-presets-loading">加载预设中...</div>

          <!-- 自定义描述 -->
          <div class="fs-custom-desc" v-if="selectedPreset">
            <label class="fs-label">自定义描述（可选）</label>
            <textarea
              v-model="customDesc"
              class="fs-textarea"
              :placeholder="'例如: ' + selectedPreset.desc"
              rows="3"
            ></textarea>
          </div>
        </div>

        <!-- 面部锁定开关 -->
        <div class="fs-lock-section">
          <label class="fs-toggle-label">
            <span class="fs-toggle-text">🔒 锁定面部特征</span>
            <span class="fs-toggle-switch" :class="{ on: lockFace }" @click="lockFace = !lockFace">
              <span class="fs-toggle-knob"></span>
            </span>
          </label>
          <p class="fs-lock-hint" v-if="lockFace">开启后 AI 将保持角色面部一致，仅更换服装/发型/场景</p>
        </div>

        <!-- 生成按钮 -->
        <div class="fs-generate-section">
          <button
            class="fs-generate-btn"
            :disabled="!selectedPreset || generating"
            @click="handleGenerate"
          >
            <span v-if="generating" class="spinner"></span>
            {{ generating ? '⏳ 生成中...' : '✨ 一键换装' }}
          </button>
          <p v-if="genError" class="fs-gen-error">{{ genError }}</p>
        </div>

        <!-- 生成结果对比 -->
        <div v-if="genResultUrl" class="fs-compare-section">
          <label class="fs-label">生成结果对比</label>
          <div class="fs-compare-row">
            <div class="fs-compare-item">
              <div class="fs-compare-label">原图</div>
              <div class="fs-compare-img-wrap">
                <img v-if="selectedChar.image_url" :src="selectedChar.image_url" alt="原图" />
                <div v-else class="fs-no-img">无原图</div>
              </div>
            </div>
            <div class="fs-compare-arrow">→</div>
            <div class="fs-compare-item">
              <div class="fs-compare-label">换装后</div>
              <div class="fs-compare-img-wrap">
                <img :src="genResultUrl" alt="换装结果" />
              </div>
              <button class="fs-set-main-btn" @click="setAsMain">设为主形象</button>
            </div>
          </div>
        </div>

        <!-- 历史版本 -->
        <div class="fs-history-section" v-if="historyVersions.length > 0">
          <label class="fs-label">历史版本</label>
          <div class="fs-history-scroll">
            <div
              v-for="(v, idx) in historyVersions"
              :key="idx"
              class="fs-history-item"
              :class="{ active: previewVersion === v }"
              @click="previewVersion = v"
            >
              <img :src="v.url" class="fs-history-thumb" alt="历史版本" />
              <div class="fs-history-actions">
                <button class="fs-hist-set-btn" @click.stop="setAsMainFromHistory(v)" title="设为主形象">⭐</button>
                <button class="fs-hist-del-btn" @click.stop="deleteVersion(idx)" title="删除">🗑️</button>
              </div>
            </div>
          </div>
          <!-- 大图预览 -->
          <div v-if="previewVersion" class="fs-preview-overlay" @click="previewVersion = null">
            <div class="fs-preview-modal" @click.stop>
              <img :src="previewVersion.url" alt="预览" />
              <div class="fs-preview-actions">
                <button class="fs-set-main-btn" @click="setAsMainFromHistory(previewVersion); previewVersion = null">⭐ 设为主形象</button>
                <button class="fs-hist-del-btn" @click="deleteVersion(historyVersions.indexOf(previewVersion)); previewVersion = null">🗑️ 删除</button>
              </div>
            </div>
          </div>
        </div>
      </template>
    </div>
  </div>
</div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRoute } from 'vue-router'

const route = useRoute()
const characterId = route.params.characterId

// 从服务器加载预设
const tabs = ref([])
const allPresets = ref({})

async function loadPresets() {
  try {
    const token = localStorage.getItem('token')
    const resp = await fetch('/api/v1/faceswap/presets', {
      headers: { 'Authorization': 'Bearer ' + token }
    })
    const data = await resp.json()
    if (data.success && data.data) {
      tabs.value = data.data.tabs || []
      allPresets.value = data.data.presets || {}
    }
  } catch (e) {
    console.warn('加载预设失败，使用默认配置:', e)
    // 兜底：使用默认预设
    tabs.value = [
      { key: 'outfit', label: '👗 换装' },
      { key: 'hair', label: '💇 换发型' },
      { key: 'scene', label: '🏞️ 换场景' },
    ]
    allPresets.value = {
      outfit: [{ id: 'default', icon: '👘', name: '古装', desc: '古装风格' }],
      hair: [{ id: 'default', icon: '💇', name: '短发', desc: '清爽短发' }],
      scene: [{ id: 'default', icon: '🏛️', name: '宫殿', desc: '古代宫殿' }],
    }
  }
}

// 状态
const selectedCharId = ref(characterId || '')
const selectedChar = ref(null)
const characters = ref([])
const activeTab = ref('outfit')
const selectedPreset = ref(null)
const customDesc = ref('')
const lockFace = ref(true)
const generating = ref(false)
const genResultUrl = ref('')
const genError = ref('')
const historyVersions = ref([])
const previewVersion = ref(null)

const activeTabLabel = computed(() => {
  const tab = tabs.value.find(t => t.key === activeTab.value)
  return tab ? tab.label + ' ' : ''
})

const activePresets = computed(() => {
  return allPresets.value[activeTab.value] || []
})

// 加载角色列表 - 从服务器API
onMounted(async () => {
  await loadPresets()
  await loadCharacters()
  loadHistory()
})

async function loadCharacters() {
  try {
    const token = localStorage.getItem('token')
    const resp = await fetch('/api/v1/characters/personal', {
      headers: { 'Authorization': 'Bearer ' + token }
    })
    const data = await resp.json()
    if (data.success && data.data) {
      const chars = data.data.characters || data.data || []
      characters.value = chars.map(c => ({
        id: c.id || c.name,
        name: c.name || c.character_name || '',
        image_url: c.image_url || c.avatar_url || '',
      }))
    }
  } catch (e) {
    console.warn('加载角色失败，尝试本地缓存:', e)
    // Fallback to localStorage
    try {
      const charsRaw = localStorage.getItem('__DRAMA_CHARS__')
      if (charsRaw) characters.value = JSON.parse(charsRaw)
    } catch (e2) {}
  }

  // 如果传入 characterId，自动选中
  if (characterId) {
    const found = characters.value.find(c => (c.id || c.name) === characterId)
    if (found) {
      selectedCharId.value = characterId
      selectedChar.value = found
    }
  }
}

function onCharChange() {
  const found = characters.value.find(c => (c.id || c.name) === selectedCharId.value)
  selectedChar.value = found || null
  // 重置状态
  selectedPreset.value = null
  customDesc.value = ''
  genResultUrl.value = ''
  genError.value = ''
  loadHistory()
}

function selectPreset(preset) {
  selectedPreset.value = preset
  customDesc.value = ''
}

async function handleGenerate() {
  if (!selectedPreset.value) return
  generating.value = true
  genError.value = ''
  genResultUrl.value = ''

  const prompt = customDesc.value || selectedPreset.value.desc
  const fullPrompt = `${prompt}${lockFace.value ? ', keep the face exactly the same, same facial features, same identity' : ''}`

  try {
    const token = localStorage.getItem('token')
    const resp = await fetch('/api/v1/characters/outfit-swap', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer ' + token,
      },
      body: JSON.stringify({
        character_id: selectedChar.value?.id || selectedChar.value?.name,
        outfit_desc: fullPrompt,
        lock_face: lockFace.value,
        outfit_type: activeTab.value,
      }),
    })

    const data = await resp.json()
    if (data.success && data.url) {
      genResultUrl.value = data.url
      addToHistory(data.url)
    } else {
      genError.value = data.message || data.detail || '生成失败，请重试'
    }
  } catch (e) {
    console.warn('换装 API 调用失败:', e.message)
    genError.value = '生成失败：网络错误，请稍后重试'
  } finally {
    generating.value = false
  }
}

function addToHistory(url) {
  historyVersions.value.unshift({
    url,
    timestamp: Date.now(),
    outfit: selectedPreset.value?.name || '',
    type: activeTab.value,
  })
  saveHistory()
}

function setAsMain() {
  if (genResultUrl.value && selectedChar.value) {
    selectedChar.value.image_url = genResultUrl.value
    saveCharacters()
  }
}

function setAsMainFromHistory(version) {
  if (version && selectedChar.value) {
    selectedChar.value.image_url = version.url
    saveCharacters()
  }
}

function deleteVersion(idx) {
  if (idx >= 0 && idx < historyVersions.value.length) {
    historyVersions.value.splice(idx, 1)
    saveHistory()
  }
}

async function saveCharacters() {
  try {
    const token = localStorage.getItem('token')
    const name = selectedChar.value?.name || selectedChar.value?.id || ''
    if (name) {
      await fetch('/api/v1/characters/personal/' + encodeURIComponent(name), {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer ' + token,
        },
        body: JSON.stringify({ image_url: selectedChar.value.image_url }),
      })
    }
  } catch (e) {
    console.warn('保存角色到服务器失败:', e)
  }
  // 同时更新本地缓存
  try {
    localStorage.setItem('__DRAMA_CHARS__', JSON.stringify(characters.value))
  } catch (e) {}
}

function loadHistory() {
  if (!selectedChar.value) return
  try {
    const key = '__FACESWAP_HISTORY__' + (selectedChar.value.id || selectedChar.value.name)
    const raw = localStorage.getItem(key)
    if (raw) {
      historyVersions.value = JSON.parse(raw)
    } else {
      historyVersions.value = []
    }
  } catch (e) {
    historyVersions.value = []
  }
}

function saveHistory() {
  if (!selectedChar.value) return
  try {
    const key = '__FACESWAP_HISTORY__' + (selectedChar.value.id || selectedChar.value.name)
    localStorage.setItem(key, JSON.stringify(historyVersions.value.slice(0, 50)))
  } catch (e) {}
}
</script>

<style scoped>
.faceswap-page {
  min-height: 100vh;
  background: var(--bg-primary);
  color: var(--text-primary);
  font-family: 'Inter','Noto Sans SC',-apple-system,sans-serif;
  padding: 24px 32px;
}

.fs-header {
  margin-bottom: 24px;
}

.fs-back-btn {
  background: var(--bg-card);
  border: 1px solid var(--border);
  color: var(--text-secondary);
  padding: 6px 16px;
  border-radius: var(--radius-sm);
  cursor: pointer;
  font-size: 13px;
  transition: .25s;
  font-family: 'Inter','Noto Sans SC',-apple-system,sans-serif;
}

.fs-back-btn:hover {
  border-color: var(--highlight);
  color: var(--highlight);
}

.fs-header h2 {
  margin: 12px 0 4px;
  font-size: 24px;
  color: var(--highlight);
}

.fs-sub {
  margin: 0;
  color: var(--text-muted);
  font-size: 13px;
}

.fs-layout {
  display: flex;
  gap: 24px;
  align-items: flex-start;
}

.fs-left {
  width: 260px;
  min-width: 260px;
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.fs-right {
  flex: 1;
  min-width: 0;
}

.fs-section {
  background: var(--bg-card);
  border: 1px solid var(--border);
  border-radius: var(--radius);
  padding: 16px;
}

.fs-label {
  display: block;
  font-size: 12px;
  color: var(--text-muted);
  text-transform: uppercase;
  letter-spacing: 0.05em;
  margin-bottom: 8px;
}

.fs-select {
  width: 100%;
  padding: 10px 12px;
  background: var(--bg-input);
  border: 1px solid var(--border);
  border-radius: var(--radius-sm);
  color: var(--text-primary);
  font-size: 14px;
  font-family: 'Inter','Noto Sans SC',-apple-system,sans-serif;
  cursor: pointer;
  outline: none;
}

.fs-select:focus {
  border-color: var(--border-focus);
}

.fs-original-card {
  text-align: center;
}

.fs-original-img {
  width: 200px;
  height: 280px;
  object-fit: cover;
  border-radius: var(--radius-sm);
  border: 1px solid var(--border);
}

.fs-original-placeholder {
  width: 200px;
  height: 280px;
  margin: 0 auto;
  background: var(--bg-input);
  border: 1px dashed var(--border);
  border-radius: var(--radius-sm);
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 8px;
  color: var(--text-muted);
  font-size: 13px;
}

.fs-placeholder-icon {
  font-size: 48px;
}

.fs-char-name {
  margin-top: 8px;
  font-size: 14px;
  color: var(--highlight);
  font-weight: 600;
}

/* Tabs */
.fs-tabs {
  display: flex;
  gap: 8px;
  margin-bottom: 16px;
  background: var(--bg-card);
  border: 1px solid var(--border);
  border-radius: var(--radius);
  padding: 6px;
}

.fs-tab-btn {
  flex: 1;
  padding: 10px 16px;
  background: transparent;
  border: none;
  border-radius: var(--radius-sm);
  color: var(--text-secondary);
  font-size: 13px;
  cursor: pointer;
  transition: all 0.25s;
  font-family: 'Inter','Noto Sans SC',-apple-system,sans-serif;
}

.fs-tab-btn:hover {
  color: var(--text-primary);
  background: var(--bg-input);
}

.fs-tab-btn.active {
  background: linear-gradient(135deg, var(--accent), var(--highlight));
  color: #fff;
  font-weight: 600;
}

/* 预设 */
.fs-presets-section {
  background: var(--bg-card);
  border: 1px solid var(--border);
  border-radius: var(--radius);
  padding: 16px;
  margin-bottom: 16px;
}

.fs-presets-loading {
  text-align: center;
  padding: 20px;
  color: var(--text-muted);
}

.fs-presets-scroll {
  display: flex;
  gap: 10px;
  overflow-x: auto;
  padding-bottom: 8px;
  scrollbar-width: thin;
  scrollbar-color: var(--border) transparent;
}

.fs-presets-scroll::-webkit-scrollbar {
  height: 6px;
}

.fs-presets-scroll::-webkit-scrollbar-thumb {
  background: var(--border);
  border-radius: 3px;
}

.fs-preset-card {
  flex-shrink: 0;
  width: 100px;
  padding: 12px 8px;
  background: var(--bg-input);
  border: 1px solid var(--border);
  border-radius: var(--radius-sm);
  text-align: center;
  cursor: pointer;
  transition: all 0.25s;
}

.fs-preset-card:hover {
  border-color: var(--highlight);
  background: var(--accent-glow);
}

.fs-preset-card.selected {
  border-color: var(--highlight);
  background: var(--accent-glow);
  box-shadow: 0 0 12px var(--accent-glow);
}

.fs-preset-icon {
  font-size: 28px;
  display: block;
  margin-bottom: 4px;
}

.fs-preset-name {
  font-size: 11px;
  color: var(--text-secondary);
  line-height: 1.3;
}

.fs-custom-desc {
  margin-top: 12px;
}

.fs-textarea {
  width: 100%;
  padding: 10px 12px;
  background: var(--bg-input);
  border: 1px solid var(--border);
  border-radius: var(--radius-sm);
  color: var(--text-primary);
  font-size: 13px;
  font-family: 'Inter','Noto Sans SC',-apple-system,sans-serif;
  resize: vertical;
  outline: none;
  box-sizing: border-box;
}

.fs-textarea:focus {
  border-color: var(--border-focus);
}

.fs-textarea::placeholder {
  color: var(--text-muted);
}

/* 锁定开关 */
.fs-lock-section {
  background: var(--bg-card);
  border: 1px solid var(--border);
  border-radius: var(--radius);
  padding: 16px;
  margin-bottom: 16px;
}

.fs-toggle-label {
  display: flex;
  align-items: center;
  justify-content: space-between;
  cursor: pointer;
}

.fs-toggle-text {
  font-size: 14px;
  font-weight: 600;
  color: var(--text-primary);
}

.fs-toggle-switch {
  width: 48px;
  height: 26px;
  background: var(--border);
  border-radius: 13px;
  position: relative;
  transition: background 0.3s;
}

.fs-toggle-switch.on {
  background: linear-gradient(135deg, var(--accent), var(--highlight));
}

.fs-toggle-knob {
  width: 22px;
  height: 22px;
  background: #fff;
  border-radius: 50%;
  position: absolute;
  top: 2px;
  left: 2px;
  transition: left 0.3s;
  box-shadow: 0 1px 3px rgba(0,0,0,.3);
}

.fs-toggle-switch.on .fs-toggle-knob {
  left: 24px;
}

.fs-lock-hint {
  margin: 8px 0 0;
  font-size: 11px;
  color: var(--text-muted);
}

/* 生成按钮 */
.fs-generate-section {
  margin-bottom: 16px;
  text-align: center;
}

.fs-generate-btn {
  width: 100%;
  padding: 14px 24px;
  background: linear-gradient(135deg, var(--accent), var(--highlight));
  color: #fff;
  border: none;
  border-radius: var(--radius);
  font-size: 16px;
  font-weight: bold;
  cursor: pointer;
  transition: all 0.25s;
  font-family: 'Inter','Noto Sans SC',-apple-system,sans-serif;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
}

.fs-generate-btn:hover:not(:disabled) {
  box-shadow: 0 0 20px var(--accent-glow);
  transform: scale(1.02);
}

.fs-generate-btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.fs-gen-error {
  margin-top: 8px;
  color: var(--text-muted);
  font-size: 13px;
  padding: 8px 12px;
  background: var(--bg-card);
  border: 1px solid var(--border);
  border-radius: var(--radius-sm);
}

/* 对比区 */
.fs-compare-section {
  background: var(--bg-card);
  border: 1px solid var(--border);
  border-radius: var(--radius);
  padding: 16px;
  margin-bottom: 16px;
}

.fs-compare-row {
  display: flex;
  gap: 16px;
  align-items: center;
  justify-content: center;
}

.fs-compare-item {
  text-align: center;
}

.fs-compare-label {
  font-size: 11px;
  color: var(--text-muted);
  margin-bottom: 8px;
  text-transform: uppercase;
}

.fs-compare-img-wrap {
  width: 160px;
  height: 220px;
  border-radius: var(--radius-sm);
  overflow: hidden;
  border: 1px solid var(--border);
  background: var(--bg-input);
}

.fs-compare-img-wrap img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.fs-no-img {
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--text-muted);
  font-size: 12px;
}

.fs-compare-arrow {
  font-size: 24px;
  color: var(--highlight);
  font-weight: bold;
}

.fs-set-main-btn {
  margin-top: 8px;
  padding: 6px 16px;
  background: linear-gradient(135deg, var(--accent), var(--highlight));
  color: #fff;
  border: none;
  border-radius: var(--radius-sm);
  font-size: 12px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.25s;
  font-family: 'Inter','Noto Sans SC',-apple-system,sans-serif;
}

.fs-set-main-btn:hover {
  box-shadow: 0 0 12px var(--accent-glow);
}

/* 历史版本 */
.fs-history-section {
  background: var(--bg-card);
  border: 1px solid var(--border);
  border-radius: var(--radius);
  padding: 16px;
}

.fs-history-scroll {
  display: flex;
  gap: 10px;
  overflow-x: auto;
  padding-bottom: 8px;
  scrollbar-width: thin;
  scrollbar-color: var(--border) transparent;
}

.fs-history-scroll::-webkit-scrollbar {
  height: 6px;
}

.fs-history-scroll::-webkit-scrollbar-thumb {
  background: var(--border);
  border-radius: 3px;
}

.fs-history-item {
  flex-shrink: 0;
  width: 80px;
  height: 100px;
  border: 1px solid var(--border);
  border-radius: var(--radius-sm);
  overflow: hidden;
  cursor: pointer;
  transition: all 0.25s;
  position: relative;
}

.fs-history-item:hover,
.fs-history-item.active {
  border-color: var(--highlight);
  box-shadow: 0 0 8px var(--accent-glow);
}

.fs-history-thumb {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.fs-history-actions {
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  display: flex;
  gap: 2px;
  padding: 2px;
  background: rgba(0,0,0,.7);
  opacity: 0;
  transition: opacity 0.2s;
}

.fs-history-item:hover .fs-history-actions {
  opacity: 1;
}

.fs-hist-set-btn,
.fs-hist-del-btn {
  flex: 1;
  border: none;
  font-size: 12px;
  padding: 2px 4px;
  cursor: pointer;
  border-radius: 3px;
  background: transparent;
  color: #fff;
}

.fs-hist-set-btn:hover {
  background: rgba(0,255,255,.2);
}

.fs-hist-del-btn:hover {
  background: rgba(255,82,82,.2);
}

/* 预览弹窗 */
.fs-preview-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0,0,0,.8);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
}

.fs-preview-modal {
  background: var(--bg-card);
  border: 1px solid var(--border);
  border-radius: var(--radius);
  padding: 24px;
  max-width: 500px;
  width: 90%;
  text-align: center;
}

.fs-preview-modal img {
  max-width: 100%;
  max-height: 60vh;
  border-radius: var(--radius-sm);
}

.fs-preview-actions {
  display: flex;
  gap: 12px;
  justify-content: center;
  margin-top: 16px;
}

/* Empty state */
.fs-empty-state {
  text-align: center;
  padding: 80px 20px;
  color: var(--text-muted);
}

.fs-empty-icon {
  font-size: 48px;
  display: block;
  margin-bottom: 12px;
}

.fs-empty-state p {
  font-size: 14px;
}

/* Spinner */
.spinner {
  display: inline-block;
  width: 16px;
  height: 16px;
  border: 2px solid transparent;
  border-top-color: #fff;
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

/* Responsive */
@media (max-width: 768px) {
  .fs-layout {
    flex-direction: column;
  }
  .fs-left {
    width: 100%;
    min-width: auto;
  }
  .fs-compare-row {
    flex-direction: column;
  }
  .fs-compare-arrow {
    transform: rotate(90deg);
  }
}

/* ===== Mobile Responsive ===== */
@media (max-width: 768px) {
  .track-page, .result-page, .history-page, .profile-page, .cert-page { padding-bottom: 72px !important; }
  .page-wrap, .page-container, .container { padding: 0 12px 72px !important; }
}

</style>
