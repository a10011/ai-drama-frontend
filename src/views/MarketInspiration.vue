<template>
  <div class="market-page">
    <div class="market-header">
      <div class="section-title">灵感社区</div>
      <div class="market-filter">
        <div class="filter-tabs">
          <button v-for="cat in categories" :key="cat.id"
            class="filter-tab" :class="{ active: activeCat === cat.id }"
            @click="activeCat = cat.id">{{ cat.label }}</button>
        </div>
      </div>
    </div>

    <div class="market-grid">
      <div v-for="item in filteredItems" :key="item.id" class="market-card">
        <div class="card-thumb">
          <div class="thumb-timeline">
            <div class="tick" v-for="i in 5" :key="i"
              :style="{ background: tickColors[i % tickColors.length], width: (15 + Math.random() * 10) + '%' }">
            </div>
          </div>
          <span class="card-badge">{{ item.type }}</span>
        </div>
        <div class="card-body">
          <div class="card-title">{{ item.title }}</div>
          <div class="card-desc">{{ item.desc }}</div>
        </div>
        <div class="card-footer">
          <button class="btn btn-primary btn-sm" @click="applyTemplate(item)">一键套用</button>
          <button class="btn btn-ghost btn-sm" @click="saveTemplate(item)">收藏</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'MarketInspiration',
  data() {
    return {
      activeCat: 'all',
      categories: [
        { id: 'all', label: '全部' },
        { id: 'script', label: '短剧模板' },
        { id: 'ad', label: '广告分镜' },
        { id: 'analysis', label: '爆款拆解' },
      ],
      tickColors: ['#165DFF', '#FF7D00', '#3B82F6', '#22C55E', '#8B5CF6'],
      items: [
        { id: 1, title: '霸道总裁追妻火葬场', desc: '女频爆款套路，反转节奏密集，适合12集短剧', type: '短剧模板', cat: 'script' },
        { id: 2, title: '重生复仇爽文', desc: '开局3秒钩子，每集一个爽点收尾，留存率高', type: '短剧模板', cat: 'script' },
        { id: 3, title: '美妆带货15秒分镜', desc: '产品特写+使用对比+限时优惠，转化率优化', type: '广告分镜', cat: 'ad' },
        { id: 4, title: '食品带货30秒脚本', desc: '开袋→烹饪→试吃→下单引导，完整镜头时序', type: '广告分镜', cat: 'ad' },
        { id: 5, title: '短视频黄金3秒拆解', desc: '前3秒钩子手法分类：反常识、冲突、悬念、利益', type: '镜头拆解', cat: 'analysis' },
        { id: 6, title: '情感类视频节奏拆解', desc: '铺垫→冲突→反转→升华，4段式叙事节奏模板', type: '镜头拆解', cat: 'analysis' },
      ],
    }
  },
  computed: {
    filteredItems() {
      if (this.activeCat === 'all') return this.items
      return this.items.filter(i => i.cat === this.activeCat)
    },
  },
  methods: {
    applyTemplate(item) {
      localStorage.setItem('__DRAMA_TEMPLATE__', JSON.stringify(item))
      this.$router.push('/')
    },
    saveTemplate(item) {
      alert('已保存到素材库')
    },
  },
}
</script>

<style scoped>
.market-page { padding: 20px 24px; }
.market-header { margin-bottom: 16px; }
.market-filter { margin-top: 10px; }
.filter-tabs { display: flex; gap: 2px; }
.filter-tab {
  padding: 4px 12px; font-size: 12px;
  background: none; border: none; border-radius: var(--radius);
  color: var(--text-secondary); cursor: pointer;
}
.filter-tab:hover { background: var(--bg-hover); }
.filter-tab.active { background: var(--bg-active); color: var(--text-primary); }

.market-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(260px, 1fr));
  gap: 14px;
}

.market-card {
  background: var(--bg-surface);
  border: 1px solid var(--border-main);
  border-radius: var(--radius);
  overflow: hidden;
  transition: border-color 0.2s;
}
.market-card:hover { border-color: var(--border-light); }

.card-thumb {
  height: 60px; position: relative;
  background: var(--bg-panel);
  display: flex; align-items: center;
  padding: 0 12px; gap: 3px;
}
.thumb-timeline {
  display: flex; width: 100%; height: 12px; gap: 3px;
}
.tick { height: 100%; border-radius: 2px; }
.card-badge {
  position: absolute; top: 6px; right: 6px;
  padding: 2px 8px; font-size: 10px; font-weight: 600;
  background: var(--bg-surface); color: var(--orange);
  border: 1px solid var(--border-main); border-radius: 3px;
}

.card-body { padding: 12px 14px; }
.card-title { font-size: 13px; font-weight: 600; margin-bottom: 4px; }
.card-desc { font-size: 11px; color: var(--text-secondary); line-height: 1.5; }

.card-footer {
  padding: 10px 14px;
  display: flex; gap: 6px;
  border-top: 1px solid var(--border-main);
}

@media (max-width: 768px) {
  .market-grid { grid-template-columns: 1fr; }
}
</style>
