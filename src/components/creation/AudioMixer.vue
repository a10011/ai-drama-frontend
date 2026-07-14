<template>
<div class="audio-mixer">
  <h2 class="title">🎚️ 音频混音器</h2>
  <p class="sub">AI 自动生成配音与配乐，调整各音轨音量</p>

  <!-- 加载状态 -->
  <div v-if="loading" class="loading-wrap">
    <div class="spinner"></div>
    <span class="loading-text">{{ loadingText }}</span>
  </div>

  <!-- 音轨列表 -->
  <div class="tracks" v-show="!loading">
    <!-- 配音轨 -->
    <div class="track">
      <div class="t-hd">
        <span class="t-icon">🎙️</span><span class="t-label">配音轨</span>
        <span v-if="genStatus.voice==='generating'" class="gen-badge">生成中...</span>
        <span v-else-if="genStatus.voice==='done'" class="gen-badge done">✓</span>
        <span v-else-if="genStatus.voice==='error'" class="gen-badge err">✗</span>
        <div class="t-ctls">
          <button class="ctl play-btn" @click="togglePlay('voice')" :disabled="!tracks.voice.hasAudio">
            {{ tracks.voice.playing ? '⏸' : '▶' }}
          </button>
          <button class="ctl mute-btn" :class="{on:tracks.voice.muted}" @click="tracks.voice.muted=!tracks.voice.muted" :disabled="!tracks.voice.hasAudio">
            {{ tracks.voice.muted ? '🔇' : '🔊' }}
          </button>
        </div>
      </div>
      <div class="wf-wrap">
        <div class="wf" :class="{play:tracks.voice.playing, muted:tracks.voice.muted, empty:!tracks.voice.hasAudio}">
          <div v-if="tracks.voice.hasAudio" class="bars">
            <div v-for="i in 40" :key="i" class="bar" :style="{height:barH(i)}"></div>
          </div>
          <span v-else class="empty-text">暂无配音</span>
        </div>
        <input type="range" class="vol" v-model="tracks.voice.volume" min="0" max="100" :disabled="!tracks.voice.hasAudio" />
        <span class="pct">{{ tracks.voice.volume }}%</span>
      </div>
      <audio ref="voiceAudio" v-if="tracks.voice.url" :src="tracks.voice.url" @ended="tracks.voice.playing=false" @error="onAudioError('voice')"></audio>
    </div>

    <!-- BGM轨 -->
    <div class="track">
      <div class="t-hd">
        <span class="t-icon">🎵</span><span class="t-label">BGM轨</span>
        <span v-if="genStatus.bgm==='generating'" class="gen-badge">生成中...</span>
        <span v-else-if="genStatus.bgm==='done'" class="gen-badge done">✓</span>
        <span v-else-if="genStatus.bgm==='error'" class="gen-badge err">✗</span>
        <div class="t-ctls">
          <button class="ctl play-btn" @click="togglePlay('bgm')" :disabled="!tracks.bgm.hasAudio">
            {{ tracks.bgm.playing ? '⏸' : '▶' }}
          </button>
          <button class="ctl mute-btn" :class="{on:tracks.bgm.muted}" @click="tracks.bgm.muted=!tracks.bgm.muted" :disabled="!tracks.bgm.hasAudio">
            {{ tracks.bgm.muted ? '🔇' : '🔊' }}
          </button>
        </div>
      </div>
      <div class="wf-wrap">
        <div class="wf" :class="{play:tracks.bgm.playing, muted:tracks.bgm.muted, empty:!tracks.bgm.hasAudio}">
          <div v-if="tracks.bgm.hasAudio" class="bars"><div v-for="i in 40" :key="i" class="bar" :style="{height:barH(i,0.6)}"></div></div>
          <span v-else class="empty-text">暂无BGM</span>
        </div>
        <input type="range" class="vol" v-model="tracks.bgm.volume" min="0" max="100" :disabled="!tracks.bgm.hasAudio" />
        <span class="pct">{{ tracks.bgm.volume }}%</span>
      </div>
      <audio ref="bgmAudio" v-if="tracks.bgm.url" :src="tracks.bgm.url" @ended="tracks.bgm.playing=false"></audio>
    </div>

    <!-- 音效轨 -->
    <div class="track">
      <div class="t-hd">
        <span class="t-icon">🔊</span><span class="t-label">音效轨</span>
        <div class="t-ctls">
          <button class="ctl play-btn" @click="togglePlay('sfx')" :disabled="!tracks.sfx.hasAudio">
            {{ tracks.sfx.playing ? '⏸' : '▶' }}
          </button>
          <button class="ctl mute-btn" :class="{on:tracks.sfx.muted}" @click="tracks.sfx.muted=!tracks.sfx.muted" :disabled="!tracks.sfx.hasAudio">
            {{ tracks.sfx.muted ? '🔇' : '🔊' }}
          </button>
        </div>
      </div>
      <div class="wf-wrap">
        <div class="wf" :class="{play:tracks.sfx.playing, muted:tracks.sfx.muted, empty:!tracks.sfx.hasAudio}">
          <div v-if="tracks.sfx.hasAudio" class="bars"><div v-for="i in 40" :key="i" class="bar" :style="{height:barH(i,0.4)}"></div></div>
          <span v-else class="empty-text">暂无音效</span>
        </div>
        <input type="range" class="vol" v-model="tracks.sfx.volume" min="0" max="100" :disabled="!tracks.sfx.hasAudio" />
        <span class="pct">{{ tracks.sfx.volume }}%</span>
      </div>
      <audio ref="sfxAudio" v-if="tracks.sfx.url" :src="tracks.sfx.url" @ended="tracks.sfx.playing=false"></audio>
    </div>
  </div>

  <!-- sticky 底部按钮 -->
  <div class="ftr">
    <button class="btn" @click="playAll" :disabled="!anyAudio">▶ 播放全部</button>
    <button class="btn" @click="regenerate" :disabled="loading">🔄 重新生成</button>
    <button class="btn gold next" @click="go">下一步 →</button>
  </div>
</div>
</template>

<script setup>
import { reactive, ref, onMounted, computed } from 'vue'
import request from '@/utils/request'

const props = defineProps({
  taskId: String,
  sceneData: { type: Array, default: () => [] }
})
const emit = defineEmits(['next', 'retry'])

const tracks = reactive({
  voice: { hasAudio: false, playing: false, muted: false, volume: 80, url: '' },
  bgm: { hasAudio: false, playing: false, muted: false, volume: 30, url: '' },
  sfx: { hasAudio: false, playing: false, muted: false, volume: 50, url: '' }
})

const genStatus = reactive({
  voice: 'pending',
  bgm: 'pending'
})

const voiceAudio = ref(null)
const bgmAudio = ref(null)
const sfxAudio = ref(null)
const loading = ref(true)
const loadingText = ref('正在生成配音...')
const anyAudio = computed(() => tracks.voice.hasAudio || tracks.bgm.hasAudio || tracks.sfx.hasAudio)

onMounted(async () => {
  await generateAudio()
})

async function generateAudio() {
  loading.value = true

  const script = localStorage.getItem('__DRAMA_SCRIPT__') || ''
  const charsRaw = localStorage.getItem('__DRAMA_CHARS__') || '[]'
  const genre = localStorage.getItem('__DRAMA_GENRE__') || ''

  let characters = []
  try { characters = JSON.parse(charsRaw) } catch (e) { characters = [] }// 从 sceneData prop 或 localStorage 读取分镜数据（shots 包含 dialogue）
  let shots = props.sceneData && props.sceneData.length ? props.sceneData :
    (() => { try { return JSON.parse(localStorage.getItem('__DRAMA_STORYBOARD__') || '[]') } catch { return [] } })()
  let scenes = shots

  // 并行生成 TTS 配音和 BGM
  const ttsPromise = (async () => {
    loadingText.value = '正在生成配音...'
    genStatus.voice = 'generating'
    try {
      const res = await request({
        url: '/api/v1/agents/execute',
        method: 'POST',
        data: {
          agent_id: 'tts',
          action: 'generate',
          params: { shots, characters }
        },
        timeout: 180000
      })
      if (res && res.success && res.data) {
        tracks.voice.url = res.data.url || res.data.audio_url || ''
        tracks.voice.hasAudio = !!tracks.voice.url
        genStatus.voice = 'done'
      } else {
        genStatus.voice = 'error'
      }
    } catch (e) {
      console.error('TTS生成失败:', e)
      genStatus.voice = 'error'
    }
  })()

  const bgmPromise = (async () => {
    loadingText.value = '正在生成BGM...'
    genStatus.bgm = 'generating'
    try {
      const res = await request({
        url: '/api/v1/agents/execute',
        method: 'POST',
        data: {
          agent_id: 'bgm',
          action: 'generate_bgm',
          params: { shots, genre }
        },
        timeout: 180000
      })
      if (res && res.success && res.data) {
        tracks.bgm.url = res.data.url || res.data.audio_url || ''
        tracks.bgm.hasAudio = !!tracks.bgm.url
        genStatus.bgm = 'done'
      } else {
        genStatus.bgm = 'error'
      }
    } catch (e) {
      console.error('BGM生成失败:', e)
      genStatus.bgm = 'error'
    }
  })()

  await Promise.allSettled([ttsPromise, bgmPromise])

  loading.value = false
  if (!anyAudio.value) {
    loadingText.value = '暂无可用音轨'
  }
}

async function regenerate() {
  genStatus.voice = 'pending'
  genStatus.bgm = 'pending'
  tracks.voice.hasAudio = false
  tracks.voice.url = ''
  tracks.bgm.hasAudio = false
  tracks.bgm.url = ''
  tracks.sfx.hasAudio = false
  tracks.sfx.url = ''
  await generateAudio()
  emit('retry')
}

function togglePlay(key) {
  const tr = tracks[key]
  if (!tr.hasAudio) return
  tr.playing = !tr.playing

  const audioRef = { voice: voiceAudio, bgm: bgmAudio, sfx: sfxAudio }[key]
  if (!audioRef || !audioRef.value) return

  if (tr.playing) {
    audioRef.value.volume = tr.muted ? 0 : (tr.volume / 100)
    audioRef.value.currentTime = 0
    audioRef.value.play().catch(() => { tr.playing = false })
  } else {
    audioRef.value.pause()
  }
}

function onAudioError(key) {
  tracks[key].playing = false
  tracks[key].hasAudio = false
  console.warn(key + ' 音频加载失败')
}

function playAll() {
  const anyPlaying = Object.values(tracks).some(t => t.playing)
  if (anyPlaying) {
    for (const key of ['voice', 'bgm', 'sfx']) {
      tracks[key].playing = false
      const a = { voice: voiceAudio, bgm: bgmAudio, sfx: sfxAudio }[key]
      if (a && a.value) a.value.pause()
    }
  } else {
    for (const key of ['voice', 'bgm', 'sfx']) {
      if (tracks[key].hasAudio) togglePlay(key)
    }
  }
}

function barH(i, f) {
  f = f || 1
  return Math.abs(Math.sin(i * 0.4) * 25 * f + Math.random() * 15 * f) + 10 + '%'
}

function go() {
  emit('next', {
    voice: { vol: tracks.voice.volume, muted: tracks.voice.muted },
    bgm: { vol: tracks.bgm.volume, muted: tracks.bgm.muted },
    sfx: { vol: tracks.sfx.volume, muted: tracks.sfx.muted }
  })
}
</script>

<style scoped>
.audio-mixer {
  padding: 24px;
  color: #e8e4dc;
  font-family: Consolas, monospace;
  height: 100%;
  display: flex;
  flex-direction: column;
}
.title { color: #c49b4a; font-size: 18px; margin-bottom: 4px; }
.sub { color: #666; font-size: 12px; margin-bottom: 20px; }

.loading-wrap {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 16px;
}
.spinner {
  width: 40px;
  height: 40px;
  border: 3px solid rgba(196, 155, 74, 0.2);
  border-top-color: #c49b4a;
  border-radius: 50%;
  animation: spin 1s linear infinite;
}
@keyframes spin { to { transform: rotate(360deg) } }
.loading-text { color: #888; font-size: 14px; }

.tracks {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 20px;
  overflow-y: auto;
}
.track {
  background: #111;
  border: 1px solid #1a1a1a;
  border-radius: 10px;
  padding: 16px;
}
.t-hd {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-bottom: 10px;
}
.t-icon { font-size: 18px; }
.t-label { font-size: 14px; color: #ccc; font-weight: bold; flex: 1; }
.gen-badge {
  font-size: 10px;
  padding: 2px 8px;
  border-radius: 10px;
  background: rgba(196, 155, 74, 0.15);
  color: #c49b4a;
}
.gen-badge.done { background: rgba(74, 222, 128, 0.15); color: #4ade80; }
.gen-badge.err { background: rgba(239, 68, 68, 0.15); color: #ef4444; }
.t-ctls { display: flex; gap: 6px; }
.ctl {
  width: 34px;
  height: 34px;
  border: 1px solid #333;
  background: #1a1a1a;
  color: #e8e4dc;
  border-radius: 6px;
  cursor: pointer;
  font-size: 14px;
  transition: .2s;
  display: flex;
  align-items: center;
  justify-content: center;
}
.ctl:hover:not(:disabled) { background: #c49b4a; color: #0a0a0a; border-color: #c49b4a; }
.ctl:disabled { opacity: .25; cursor: not-allowed; }
.ctl.on { background: rgba(239, 68, 68, .2); border-color: #ef4444; }
.wf-wrap { display: flex; align-items: center; gap: 12px; }
.wf {
  flex: 1;
  height: 50px;
  background: #0d0d0d;
  border-radius: 4px;
  border: 1px solid #222;
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: hidden;
  transition: .3s;
}
.wf.play { border-color: #c49b4a; box-shadow: 0 0 12px rgba(196, 155, 74, .15); }
.wf.muted { opacity: .3; }
.wf.empty { background: #0a0a0a; }
.bars {
  display: flex;
  align-items: center;
  justify-content: space-around;
  width: 100%;
  height: 100%;
  padding: 0 8px;
}
.bar {
  width: 3px;
  background: linear-gradient(to top, #c49b4a, #d4af6a);
  border-radius: 2px;
  transition: height .3s;
}
.wf.play .bar { animation: waveAnim .8s infinite alternate; }
@keyframes waveAnim { 0% { opacity: .4 } 100% { opacity: 1 } }
.empty-text { color: #444; font-size: 11px; }
.vol {
  width: 100px;
  height: 4px;
  background: #222;
  border-radius: 2px;
  -webkit-appearance: none;
  appearance: none;
  cursor: pointer;
}
.vol::-webkit-slider-thumb {
  width: 14px;
  height: 14px;
  background: #c49b4a;
  border-radius: 50%;
  cursor: pointer;
}
.pct { font-size: 11px; color: #666; min-width: 34px; text-align: right; }

.ftr {
  display: flex;
  justify-content: center;
  gap: 10px;
  padding-top: 16px;
  border-top: 1px solid #1a1a1a;
  position: sticky;
  bottom: 0;
  background: #0a0a0a;
  z-index: 10;
  padding-bottom: 4px;
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
.btn:hover:not(:disabled) { border-color: #c49b4a; background: rgba(196, 155, 74, .08); }
.btn:disabled { opacity: .3; }
.btn.gold {
  background: linear-gradient(135deg, #c49b4a, #9a7b2e);
  color: #0a0a0a;
  font-weight: bold;
  border: none;
}
.btn.gold:hover { box-shadow: 0 4px 16px rgba(196, 155, 74, .4); }
.btn.next { font-size: 14px; padding: 10px 36px; }
</style>
