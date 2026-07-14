<template>
<div class="hp-wrapper">
  <!-- 顶部Banner -->
  <div class="hero">
    <div class="hero-top">
      <div class="hero-left">
        <div class="hero-label">AI面短剧 STUDIOS</div>
        <h1>AI面短剧</h1>
        <p>AI 智能短剧创作平台，从剧本到成片，一键生成</p>
        <div class="hero-stats">
          <div class="hero-stat" @click="$router.push('/projects')">
            <div class="hs-num">{{ stats.projectCount }}</div>
            <div class="hs-label">项目</div>
          </div>
          <div class="hero-stat" @click="$router.push('/projects')">
            <div class="hs-num">{{ stats.completedCount }}</div>
            <div class="hs-label">作品</div>
          </div>
          <div class="hero-stat" @click="$router.push('/points')">
            <div class="hs-num gold">{{ stats.points }}</div>
            <div class="hs-label">积分</div>
          </div>
        </div>
      </div>
      <div class="hero-right">
        <button class="btn-gold" @click="startCreate">🎬 开始创作</button>
        <button class="btn-outline" @click="$router.push('/projects')">📂 查看作品</button>
      </div>
    </div>
  </div>

  <!-- 快捷入口 -->
  <div class="section-label">快捷创作</div>
  <div class="quick-grid">
    <div class="quick-card" @click="quickCreate('real')">
      <div class="qc-icon">🎭</div>
      <div class="qc-title">真人短剧</div>
      <div class="qc-desc">真人实拍风格 · AI换脸换装</div>
      <div class="qc-arrow">→</div>
    </div>
    <div class="quick-card special" @click="startCreate">
      <div class="qc-icon">✨</div>
      <div class="qc-title">自由创作</div>
      <div class="qc-desc">自定义题材 · 无限可能</div>
      <div class="qc-arrow">→</div>
    </div>
  </div>

  <!-- 最近项目 -->
  <div class="section-label">
    最近项目
    <span class="section-action" @click="$router.push('/projects')">查看全部 →</span>
  </div>
  <div class="project-list">
    <div v-if="loading" class="loading-hint">⏳ 加载中...</div>
    <div v-else-if="loadError" class="loading-hint">
      <span>⚠️</span>
      <p>加载失败，请检查网络</p>
      <button class="btn-gold sm" @click="loadData">重试</button>
    </div>
    <div class="pi" v-for="p in recentProjects" :key="p.id" @click="openProject(p)">
      <div class="pi-indicator" :style="{background: statusColor(p)}"></div>
      <div class="pi-body">
        <div class="pi-title">{{ p.title || '未命名' }}</div>
        <div class="pi-meta">{{ p.genre || '短剧' }} · {{ p.progress || 0 }}%</div>
      </div>
      <div class="pi-status" :class="statusClass(p)">
        {{ statusIcon(p) }}
      </div>
    </div>
    <div v-if="!loading && !loadError && recentProjects.length===0" class="empty-hint">
      <span>🎬</span>
      <p>还没有作品，点击上方开始创作</p>
      <button class="btn-gold sm" @click="$router.push('/create')">开始创作</button>
    </div>
  </div>

  <!-- 系统状态 -->
  <div class="section-label">服务状态</div>
  <div class="status-row">
    <div class="status-item" @click="checkHealth">
      <span class="si-dot" :class="{online: health.projects}"></span>
      <span class="si-name">项目服务</span>
      <span class="si-val">{{ health.projects ? '正常' : '检测中' }}</span>
    </div>
    <div class="status-item" @click="checkHealth">
      <span class="si-dot" :class="{online: health.api}"></span>
      <span class="si-name">API网关</span>
      <span class="si-val">{{ health.api ? '正常' : '检测中' }}</span>
    </div>
  </div>
</div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import request from '@/utils/request'

const router = useRouter()

const stats = ref({ projectCount: 0, completedCount: 0, points: 0 })
const recentProjects = ref([])
const loading = ref(true)
const loadError = ref(false)
const health = ref({ projects: false, api: false })

async function loadData() {
  loading.value = true
  loadError.value = false
  try {
    const data = await request({ url: '/api/v1/projects' })
    if (data.success && data.projects) {
      const projs = data.projects
      stats.value.projectCount = projs.length
      stats.value.completedCount = projs.filter(p =>
        p.status === 'completed' || p.progress >= 100
      ).length
      recentProjects.value = projs.slice(0, 5)
      health.value.projects = true
    } else {
      stats.value.projectCount = 0
      stats.value.completedCount = 0
      recentProjects.value = []
      health.value.projects = data.success || false
    }
  } catch (e) {
    loadError.value = true
  }

    // 拉用户积分
    try {
      const token = localStorage.getItem('token')
      const meData = await request({ url: '/api/v1/auth/me', params: { token } })
      if (meData.success && meData.data) {
        stats.value.points = meData.data.points || 0
      } else if (meData.points !== undefined) {
        stats.value.points = meData.points || 0
      }
    } catch (e) {
    console.warn('首页加载失败:', e)
    loadError.value = true
  }
  loading.value = false
}

async function checkHealth() {
  health.value.api = false
  try {
    const res = await request({ url: '/api/v1/auth/me' })
    health.value.api = res.ok
  } catch (e) { console.error("[HomePage] error:", e) }health.value.api = false
  }

// 辅助函数：状态颜色 / 图标
function statusColor(p) {
  if (p.status === 'completed' || p.progress >= 100) return '#4ade80'
  if (p.status === 'active' || p.progress > 0) return '#c49b4a'
  return '#444'
}
function statusIcon(p) {
  if (p.status === 'completed' || p.progress >= 100) return '✓'
  if (p.status === 'active' || p.progress > 0) return '▶'
  return '✎'
}
function statusClass(p) {
  if (p.status === 'completed' || p.progress >= 100) return 'done'
  if (p.status === 'active' || p.progress > 0) return 'active'
  return 'draft'
}

function quickCreate(style) { router.push('/create?style=' + style) }
function startCreate() { router.push('/create') }
function openProject(p) { router.push('/create?continue_project_id=' + p.id) }

onMounted(() => {
  loadData()
  checkHealth()
})
</script>

<style scoped>
.hp-wrapper { padding: 16px 16px 24px; width: 100%; color: #e8e4dc; font-family: Consolas, monospace; }
.hero { padding: 20px 0 24px; }
.hero-top { display: flex; flex-direction: column; gap: 20px; }
.hero-label { font-size: 10px; color: #c49b4a; letter-spacing: 0.2em; margin-bottom: 4px; text-transform: uppercase; }
.hero-left h1 { font-size: 2rem; color: #c49b4a; margin: 0 0 6px; letter-spacing: 0.04em; }
.hero-left p { color: #888; font-size: 13px; margin-bottom: 16px; }
.hero-stats { display: flex; gap: 24px; }
.hero-stat { cursor: pointer; transition: transform 0.2s; }
.hero-stat:hover { transform: translateY(-2px); }
.hero-stat:active { transform: scale(0.95); }
.hs-num { font-size: 1.6rem; font-weight: bold; }
.hs-num.gold { color: #c49b4a; }
.hs-label { font-size: 10px; color: #666; }
.hero-right { display: flex; flex-direction: column; gap: 10px; }
.btn-gold {
  background: linear-gradient(135deg, #c49b4a, #9a7b2e); color: #0a0a0a;
  border: none; padding: 12px 24px; border-radius: 8px;
  font-family: Consolas, monospace; font-size: 14px; font-weight: bold;
  cursor: pointer; transition: 0.25s; text-align: center;
  min-height: 44px; display: inline-flex; align-items: center; justify-content: center;
  -webkit-tap-highlight-color: transparent;
}
.btn-gold:hover { box-shadow: 0 4px 16px rgba(196,155,74,0.4); transform: translateY(-1px); }
.btn-gold:active { transform: scale(0.96); }
.btn-gold.sm { padding: 8px 18px; font-size: 12px; }
.btn-outline {
  background: transparent; color: #c49b4a;
  border: 1px solid #333; padding: 12px 24px; border-radius: 8px;
  font-family: Consolas, monospace; font-size: 14px; cursor: pointer;
  transition: 0.25s; text-align: center;
  min-height: 44px; display: inline-flex; align-items: center; justify-content: center;
  -webkit-tap-highlight-color: transparent;
}
.btn-outline:hover { border-color: #c49b4a; background: rgba(196,155,74,0.05); }
.btn-outline:active { transform: scale(0.96); }
.section-label {
  font-size: 11px; color: #c49b4a; letter-spacing: 0.15em;
  margin: 20px 0 10px; text-transform: uppercase;
  display: flex; justify-content: space-between; align-items: center;
}
.section-action { font-size: 10px; color: #666; cursor: pointer; text-transform: none; letter-spacing: 0; user-select: none; }
.section-action:active { color: #c49b4a; }
.quick-grid { display: grid; grid-template-columns: repeat(2, 1fr); gap: 10px; }
.quick-card {
  background: #171717; border: 1px solid #222; border-radius: 10px;
  padding: 16px; cursor: pointer; transition: 0.2s; position: relative;
  min-height: 44px; display: flex; flex-direction: column;
  -webkit-tap-highlight-color: transparent;
}
.quick-card:hover { border-color: #c49b4a; box-shadow: 0 0 20px rgba(196,155,74,0.06); }
.quick-card:active { transform: scale(0.97); }
.quick-card.special { background: linear-gradient(135deg, rgba(196,155,74,0.08), transparent); border-color: rgba(196,155,74,0.2); }
.qc-icon { font-size: 24px; margin-bottom: 6px; }
.qc-title { font-size: 14px; font-weight: bold; color: #c49b4a; margin-bottom: 4px; }
.qc-desc { font-size: 11px; color: #888; }
.qc-arrow { position: absolute; top: 12px; right: 12px; color: #555; font-size: 16px; }
.project-list { display: flex; flex-direction: column; gap: 6px; min-height: 60px; }
.loading-hint { text-align: center; color: #666; padding: 20px 0; font-size: 13px; }
.loading-hint span { font-size: 28px; display: block; margin-bottom: 8px; }
.pi {
  display: flex; align-items: center; gap: 12px;
  padding: 12px 14px; background: #171717; border: 1px solid #222;
  border-radius: 8px; cursor: pointer; transition: 0.2s;
  min-height: 44px; -webkit-tap-highlight-color: transparent;
}
.pi:hover { border-color: #c49b4a; background: #1a1a1a; }
.pi:active { transform: scale(0.98); }
.pi-indicator { width: 3px; height: 20px; border-radius: 2px; flex-shrink: 0; }
.pi-body { flex: 1; min-width: 0; }
.pi-title { font-size: 13px; color: #e8e4dc; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
.pi-meta { font-size: 11px; color: #666; margin-top: 2px; }
.pi-status { font-size: 14px; color: #555; width: 24px; text-align: center; flex-shrink: 0; }
.pi-status.done { color: #4ade80; }
.pi-status.active { color: #c49b4a; }
.empty-hint { text-align: center; color: #555; padding: 30px 0; }
.empty-hint span { font-size: 36px; display: block; margin-bottom: 8px; }
.empty-hint p { font-size: 12px; margin-bottom: 12px; }
.status-row { display: grid; grid-template-columns: repeat(2, 1fr); gap: 8px; }
.status-item {
  background: #171717; border: 1px solid #222; border-radius: 8px;
  padding: 12px; display: flex; align-items: center; gap: 8px;
  cursor: pointer; transition: 0.2s; -webkit-tap-highlight-color: transparent;
}
.status-item:active { background: #1a1a1a; }
.si-dot { width: 6px; height: 6px; border-radius: 50%; background: #ef4444; transition: background 0.3s; flex-shrink: 0; }
.si-dot.online { background: #4ade80; }
.si-name { font-size: 12px; color: #888; flex: 1; }
.si-val { font-size: 11px; color: #c49b4a; font-family: Consolas, monospace; }
@media(min-width:769px) {
  .hero-top { flex-direction: row; justify-content: space-between; align-items: flex-start; gap: 40px; }
  .hero-right { min-width: 160px; }
  .hero-left h1 { font-size: 3rem; }
  .hs-num { font-size: 1.8rem; }
}

/* ===== Mobile Responsive ===== */
@media (max-width: 768px) {
  .page-container, .container, .card, .wrap { padding: 0 12px 72px !important; }
}

</style>
