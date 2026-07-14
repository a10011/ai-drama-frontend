<template>
  <div class="market-page">
    <div class="market-header">
      <h1>🏪 素材市场</h1>
      <p>精选脚本模板、场景背景、角色设计、道具、音乐等素材</p>
    </div>

    <div class="market-search">
      <i class="fas fa-search search-icon"></i>
      <input v-model="search" placeholder="搜索素材..." class="search-input" @input="loadMaterials" />
    </div>

    <div class="market-categories">
      <span v-for="cat in categories" :key="cat.value" class="cat-chip" :class="{ active: activeCat === cat.value }" @click="switchCategory(cat.value)">
        {{ cat.label }} ({{ cat.count }})
      </span>
    </div>

    <div class="market-grid">
      <div v-for="item in materials" :key="item.id" class="market-card">
        <div class="market-preview" :style="{ background: item.preview_url ? 'url('+item.preview_url+') center/cover' : getDefaultBg(item.category) }">
          <span v-if="!item.preview_url" class="market-preview-icon">{{ getCatIcon(item.category) }}</span>
        </div>
        <div class="market-card-body">
          <h3>{{ item.name }}</h3>
          <p>{{ item.description || getCatLabel(item.category) }}</p>
          <div class="market-card-tags" v-if="item.tags && item.tags.length">
            <span v-for="tag in (Array.isArray(item.tags) ? item.tags.slice(0,3) : [])" class="tag">{{ tag }}</span>
          </div>
          <div class="market-card-footer">
            <span class="market-file-type">{{ item.file_type || 'image' }}</span>
            <button class="btn-buy" @click="adoptItem(item)">采纳</button>
          </div>
        </div>
      </div>
      <div v-if="loading" class="loading-market">加载中...</div>
      <div v-if="!loading && materials.length === 0" class="empty-market">
        <p>暂无匹配素材，先去上传一些吧</p>
      </div>
    </div>
  </div>
</template>

<script>
import request from '@/utils/request'
export default {
  data() {
    return {
      search: '',
      activeCat: 'all',
      categories: [],
      materials: [],
      loading: false
    }
  },
  mounted() {
    this.loadCategories()
    this.loadMaterials()
  },
  methods: {
    async loadCategories() {
      try {
        const d = await request({ url: '/api/v1/materials/categories' })
        if (d.success) {
          this.categories = [{ value: 'all', label: '全部', count: d.data.reduce((s,c)=>s+c.count,0) }, ...d.data]
        }
      } catch(e) { console.error("[SharedMarket] 操作失败:", e) }
    },
    async loadMaterials() {
      this.loading = true
      try {
        let url = '/api/v1/materials/list?limit=50'
        if (this.activeCat !== 'all') url += '&category=' + this.activeCat
        if (this.search) url += '&search=' + encodeURIComponent(this.search)
        const d = await request({ url })
        if (d.success) this.materials = d.data.items || []
      } catch (e) { this.materials = [] }
      this.loading = false
    },
    switchCategory(cat) {
      this.activeCat = cat
      this.loadMaterials()
    },
    async adoptItem(item) {
      try {
        const d = await request({ url: '/api/v1/materials/' + item.id + '/use', method: 'POST' })
        if (d.success) {
          alert('已采纳：' + item.name + ' ✅')
        }
      } catch (e) { alert('采纳失败，请重试') }
    },
    getCatIcon(cat) {
      const icons = { scene: '🖼️', costume: '👔', face: '👤', prop: '🔧', bgm: '🎵', script_template: '📝', character: '🎭' }
      return icons[cat] || '📦'
    },
    getCatLabel(cat) {
      const labels = { scene: '场景背景', costume: '服装', face: '人脸', prop: '道具', bgm: '背景音乐', script_template: '剧本模板', character: '角色' }
      return labels[cat] || '素材'
    },
    getDefaultBg(cat) {
      const gradients = {
        scene: 'linear-gradient(135deg,var(--bg-panel),var(--bg-deep))',
        costume: 'linear-gradient(135deg,#2d1b69,#4a1942)',
        face: 'linear-gradient(135deg,#1e3a5f,#2d5a27)',
        prop: 'linear-gradient(135deg,#5c2e1e,#3a1f0e)',
        bgm: 'linear-gradient(135deg,#1a3a3a,#0d2137)',
        script_template: 'linear-gradient(135deg,#3a1a3a,#2a1a2a)',
        character: 'linear-gradient(135deg,#2a2a4a,#1a1a3a)'
      }
      return gradients[cat] || 'linear-gradient(135deg,#2a2a2a,#1a1a1a)'
    }
  }
}
</script>

<style scoped>
.market-header { margin-bottom: 20px; }
.market-header h1 { font-size: 22px; font-weight: 700; color: #fff; margin-bottom: 6px; }
.market-header p { color: rgba(255,255,255,0.4); font-size: 14px; }
.market-search { position: relative; margin-bottom: 16px; }
.search-icon { position: absolute; left: 14px; top: 50%; transform: translateY(-50%); color: rgba(255,255,255,0.2); }
.search-input { width: 100%; padding: 11px 14px 11px 40px; border-radius: 10px; background: rgba(255,255,255,0.04); border: 1px solid rgba(255,255,255,0.08); color: #e5e7eb; font-size: 14px; outline: none; box-sizing: border-box; }
.search-input:focus { border-color: rgba(0,240,255,0.3); }
.search-input::placeholder { color: rgba(255,255,255,0.2); }
.market-categories { display: flex; gap: 8px; margin-bottom: 20px; overflow-x: auto; padding-bottom: 4px; }
.cat-chip { padding: 8px 16px; border-radius: 20px; font-size: 13px; background: rgba(255,255,255,0.04); border: 1px solid rgba(255,255,255,0.06); color: rgba(255,255,255,0.5); cursor: pointer; white-space: nowrap; transition: all .2s; flex-shrink: 0; }
.cat-chip.active { background: rgba(0,240,255,0.15); border-color: rgba(0,240,255,0.3); color: #00f0ff; }
.market-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(220px, 1fr)); gap: 14px; }
.market-card { background: rgba(255,255,255,0.03); border: 1px solid rgba(255,255,255,0.06); border-radius: 14px; overflow: hidden; transition: all .2s; }
.market-card:hover { border-color: rgba(0,240,255,0.2); transform: translateY(-1px); }
.market-preview { height: 100px; display: flex; align-items: center; justify-content: center; }
.market-preview-icon { font-size: 36px; }
.market-card-body { padding: 14px 16px; }
.market-card-body h3 { font-size: 14px; font-weight: 600; color: #fff; margin-bottom: 4px; }
.market-card-body p { font-size: 12px; color: rgba(255,255,255,0.35); margin-bottom: 6px; }
.market-card-tags { display: flex; gap: 4px; flex-wrap: wrap; margin-bottom: 8px; }
.tag { font-size: 10px; padding: 2px 8px; border-radius: 10px; background: rgba(0,240,255,0.1); color: rgba(255,255,255,0.5); }
.market-card-footer { display: flex; align-items: center; justify-content: space-between; }
.market-file-type { font-size: 11px; color: rgba(255,255,255,0.2); }
.btn-buy { padding: 6px 16px; border-radius: 8px; background: rgba(0,240,255,0.15); color: #00f0ff; border: none; font-size: 12px; font-weight: 500; cursor: pointer; }
.btn-buy:hover { background: rgba(0,240,255,0.25); }
.loading-market, .empty-market { grid-column: 1/-1; text-align: center; padding: 50px; color: rgba(255,255,255,0.2); }
@media (max-width: 480px) { .market-grid { grid-template-columns: 1fr; } }

/* ===== Mobile Responsive ===== */
@media (max-width: 768px) {
  .track-page, .result-page, .history-page, .profile-page, .cert-page { padding-bottom: 72px !important; }
  .page-wrap, .page-container, .container { padding: 0 12px 72px !important; }
}

</style>