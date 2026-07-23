<template>
  <div class="fm-promo-create">
    <header class="fm-promo-header">
      <h1 class="fm-promo-title">🎥 企业宣传片制作</h1>
      <p class="fm-promo-desc">企业形象 · 品牌推广 · 招生招生 · 产品展示</p>
    </header>

    <div class="fm-promo-body">
      <div class="fm-promo-form">
        <div class="fm-form-row">
          <div class="fm-form-group">
            <label>企业/品牌名称</label>
            <input v-model="companyName" class="fm-input" placeholder="例如：XX科技有限公司"/>
          </div>
          <div class="fm-form-group">
            <label>宣传类型</label>
            <select v-model="promoType" class="fm-select">
              <option value="企业形象">企业形象</option>
              <option value="产品发布">产品发布</option>
              <option value="招生招生">招生招生</option>
              <option value="年度总结">年度总结</option>
              <option value="品牌故事">品牌故事</option>
            </select>
          </div>
        </div>

        <div class="fm-form-group">
          <label>核心信息</label>
          <textarea v-model="coreMessage" class="fm-textarea" rows="4" placeholder="你的宣传片要传达什么核心信息？"></textarea>
        </div>

        <div class="fm-form-group">
          <label>视觉风格</label>
          <div class="fm-style-grid">
            <div v-for="s in promoStyles" :key="s.value" class="fm-style-card" :class="{ active: selectedStyle === s.value }" @click="selectedStyle = s.value">
              <div class="fm-style-preview" :style="{ background: s.gradient }"></div>
              <div class="fm-style-name">{{ s.name }}</div>
            </div>
          </div>
        </div>

        <div class="fm-form-group">
          <label>时长偏好</label>
          <div class="fm-duration-options">
            <span v-for="d in durations" :key="d" class="fm-duration-tag" :class="{ active: duration === d }" @click="duration = d">{{ d }}</span>
          </div>
        </div>

        <button class="fm-generate-btn" @click="generate" :disabled="loading">
          {{ loading ? '生成中...' : '生成宣传片方案' }}
        </button>
      </div>

      <div v-if="result" class="fm-result-panel">
        <h2>宣传片方案</h2>
        <pre>{{ result }}</pre>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  data() {
    return {
      companyName: '',
      promoType: '企业形象',
      coreMessage: '',
      selectedStyle: 'corporate',
      duration: '60秒',
      loading: false,
      result: '',
      promoStyles: [
        { value: 'corporate', name: '商务专业', gradient: 'linear-gradient(135deg, #1a1a2e, #16213e)' },
        { value: 'warm', name: '温馨家庭', gradient: 'linear-gradient(135deg, #ffecd2, #fcb69f)' },
        { value: 'tech', name: '科技未来', gradient: 'linear-gradient(135deg, #667eea, #764ba2)' },
        { value: 'energetic', name: '活力动感', gradient: 'linear-gradient(135deg, #E53935, #FF6F00)' },
      ],
      durations: ['30秒', '60秒', '3分钟', '5分钟', '10分钟']
    }
  },
  methods: {
    async generate() {
      this.loading = true;
      try {
        const body = { company: this.companyName, type: this.promoType, message: this.coreMessage, style: this.selectedStyle, duration: this.duration };
        // TODO: Call backend API
        setTimeout(() => {
          this.result = '这是生成的宣传片方案...';
          this.loading = false;
        }, 2000);
      } catch(e) {
        this.result = '生成失败：' + e.message;
        this.loading = false;
      }
    }
  }
}
</script>

<style scoped>
.fm-promo-create { background: #0A0A0A; min-height: 100vh; color: white; padding-bottom: 60px; }
.fm-promo-header {
  padding: 40px 24px; text-align: center; border-bottom: 1px solid #2A2A2A;
  background: linear-gradient(180deg, rgba(245,158,11,0.08), transparent);
}
.fm-promo-title { font-size: 36px; font-weight: 800; margin-bottom: 8px; }
.fm-promo-desc { color: #9E9E9E; font-size: 16px; }
.fm-promo-body { max-width: 1000px; margin: 0 auto; padding: 40px 24px; }
.fm-form-row { display: grid; grid-template-columns: 1fr 1fr; gap: 24px; }
.fm-form-group { margin-bottom: 30px; }
.fm-form-group label { display: block; font-size: 15px; font-weight: 600; margin-bottom: 12px; color: #E0E0E0; }
.fm-input, .fm-select, .fm-textarea {
  width: 100%; padding: 14px 18px; background: #141414; border: 1px solid #2A2A2A;
  border-radius: 10px; color: white; font-size: 15px; outline: none; font-family: inherit;
}
.fm-textarea { resize: vertical; }
.fm-select { appearance: none; background-image: url('data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="%23999"><path d="M7 10l5 5 5-5z"/></svg>'); background-repeat: no-repeat; background-position: right 14px; padding-right: 40px; }
.fm-style-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(200px, 1fr)); gap: 16px; }
.fm-style-card {
  background: #1A1A1A; border-radius: 12px; overflow: hidden; border: 2px solid #2A2A2A;
  cursor: pointer; transition: all 0.2s;
}
.fm-style-card:hover, .fm-style-card.active { border-color: #F59E0B; }
.fm-style-preview { height: 100px; }
.fm-style-name { padding: 12px 16px; font-size: 15px; font-weight: 600; text-align: center; }
.fm-duration-options { display: flex; flex-wrap: wrap; gap: 10px; }
.fm-duration-tag {
  padding: 8px 18px; border-radius: 20px; background: #1A1A1A; border: 1px solid #2A2A2A;
  font-size: 14px; cursor: pointer; transition: all 0.2s;
}
.fm-duration-tag:hover, .fm-duration-tag.active { border-color: #F59E0B; background: rgba(245,158,11,0.15); }
.fm-generate-btn {
  width: 100%; padding: 16px; background: linear-gradient(135deg, #F59E0B, #FCD34D); color: #000;
  border: none; border-radius: 12px; font-size: 17px; font-weight: 700; cursor: pointer; transition: all 0.2s;
}
.fm-generate-btn:hover { transform: translateY(-2px); box-shadow: 0 8px 24px rgba(245,158,11,0.3); }
.fm-result-panel { margin-top: 40px; padding: 30px; background: #1A1A1A; border-radius: 16px; border: 1px solid #2A2A2A; }
.fm-result-panel h2 { margin-bottom: 20px; }
.fm-result-panel pre { white-space: pre-wrap; line-height: 1.8; color: #E0E0E0; }
@media (max-width: 768px) { .fm-form-row { grid-template-columns: 1fr; } }
</style>
