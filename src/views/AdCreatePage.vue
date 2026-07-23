<template>
  <div class="fm-ad-create">
    <!-- Header -->
    <header class="fm-ad-header">
      <h1 class="fm-ad-title">📺 广告片创作</h1>
      <p class="fm-ad-desc">AI 驱动，快速生成专业级广告视频</p>
    </header>

    <div class="fm-ad-body">
      <div class="fm-ad-form">
        <div class="fm-form-group">
          <label>广告类型</label>
          <div class="fm-type-grid">
            <div v-for="t in adTypes" :key="t.value"
                 class="fm-type-card" :class="{ active: selectedType === t.value }"
                 @click="selectedType = t.value">
              <div class="fm-type-icon">{{ t.icon }}</div>
              <h3>{{ t.name }}</h3>
            </div>
          </div>
        </div>

        <div class="fm-form-group">
          <label>产品名称</label>
          <input v-model="productName" class="fm-input" placeholder="例如：某品牌手机"/>
        </div>

        <div class="fm-form-group">
          <label>目标受众</label>
          <select v-model="targetAudience" class="fm-select">
            <option value="年轻人群">年轻人群</option>
            <option value="职场人士">职场人士</option>
            <option value="家庭用户">家庭用户</option>
            <option value="全年龄">全年龄</option>
          </select>
        </div>

        <div class="fm-form-group">
          <label>核心卖点（3个以内）</label>
          <textarea v-model="sellingPoints" class="fm-textarea" rows="4" placeholder="列出产品的核心卖点..."></textarea>
        </div>

        <div class="fm-form-group">
          <label>风格偏好</label>
          <div class="fm-style-options">
            <span v-for="s in styles" :key="s"
                  class="fm-style-tag" :class="{ active: selectedStyle === s }"
                  @click="selectedStyle = s">{{ s }}</span>
          </div>
        </div>

        <button class="fm-generate-btn" @click="generateAd" :disabled="loading">
          {{ loading ? '生成中...' : '一键生成广告方案' }}
        </button>
      </div>

      <!-- 生成结果 -->
      <div v-if="result" class="fm-ad-result">
        <h2>生成结果</h2>
        <div class="fm-result-content">{{ result }}</div>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  data() {
    return {
      selectedType: 'product',
      productName: '',
      targetAudience: '年轻人群',
      sellingPoints: '',
      selectedStyle: '高级感',
      loading: false,
      result: '',
      adTypes: [
        { icon: '📦', name: '产品展示', value: 'product' },
        { icon: '🏢', name: '品牌形象', value: 'brand' },
        { icon: '🔥', name: '促销活动', value: 'promo' },
        { icon: '🎬', name: '短视频广告', value: 'short' },
      ],
      styles: ['高级感', '温馨家庭', '科技感', '幽默搞笑', '励志感人']
    }
  },
  methods: {
    async generateAd() {
      this.loading = true;
      try {
        const body = {
          type: this.selectedType,
          product: this.productName,
          audience: this.targetAudience,
          points: this.sellingPoints,
          style: this.selectedStyle
        };
        // TODO: Call backend API
        setTimeout(() => {
          this.result = '这是生成的广告文案和分镜方案...';
          this.loading = false;
        }, 2000);
      } catch (e) {
        this.result = '生成失败：' + e.message;
        this.loading = false;
      }
    }
  }
}
</script>

<style scoped>
.fm-ad-create { background: #0A0A0A; min-height: 100vh; color: white; padding-bottom: 60px; }
.fm-ad-header {
  padding: 40px 24px; text-align: center; border-bottom: 1px solid #2A2A2A;
  background: linear-gradient(180deg, rgba(16,185,129,0.08), transparent);
}
.fm-ad-title { font-size: 36px; font-weight: 800; margin-bottom: 8px; }
.fm-ad-desc { color: #9E9E9E; font-size: 16px; }
.fm-ad-body { max-width: 1000px; margin: 0 auto; padding: 40px 24px; }
.fm-form-group { margin-bottom: 30px; }
.fm-form-group label { display: block; font-size: 15px; font-weight: 600; margin-bottom: 12px; color: #E0E0E0; }
.fm-type-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(180px, 1fr)); gap: 16px; }
.fm-type-card {
  background: #1A1A1A; padding: 24px 16px; border-radius: 12px; border: 2px solid #2A2A2A;
  text-align: center; cursor: pointer; transition: all 0.2s;
}
.fm-type-card:hover, .fm-type-card.active { border-color: #10B981; background: rgba(16,185,129,0.1); }
.fm-type-icon { font-size: 40px; margin-bottom: 8px; }
.fm-type-card h3 { font-size: 16px; font-weight: 600; }
.fm-input, .fm-select, .fm-textarea {
  width: 100%; padding: 14px 18px; background: #141414; border: 1px solid #2A2A2A;
  border-radius: 10px; color: white; font-size: 15px; outline: none; font-family: inherit;
}
.fm-input:focus, .fm-select:focus, .fm-textarea:focus { border-color: #10B981; }
.fm-textarea { resize: vertical; }
.fm-select {
  appearance: none;
  background-image: url('data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="%23999"><path d="M7 10l5 5 5-5z"/></svg>');
  background-repeat: no-repeat;
  background-position: right 14px;
  padding-right: 40px;
}
.fm-style-options { display: flex; flex-wrap: wrap; gap: 10px; }
.fm-style-tag {
  padding: 8px 18px; border-radius: 20px; background: #1A1A1A; border: 1px solid #2A2A2A;
  font-size: 14px; cursor: pointer; transition: all 0.2s;
}
.fm-style-tag:hover, .fm-style-tag.active { border-color: #10B981; background: rgba(16,185,129,0.15); }
.fm-generate-btn {
  width: 100%; padding: 16px; background: linear-gradient(135deg, #10B981, #34D399); color: white;
  border: none; border-radius: 12px; font-size: 17px; font-weight: 700; cursor: pointer; transition: all 0.2s;
}
.fm-generate-btn:hover { transform: translateY(-2px); box-shadow: 0 8px 24px rgba(16,185,129,0.3); }
.fm-generate-btn:disabled { opacity: 0.5; cursor: not-allowed; }
.fm-ad-result { margin-top: 40px; padding: 30px; background: #1A1A1A; border-radius: 16px; border: 1px solid #2A2A2A; }
.fm-ad-result h2 { margin-bottom: 20px; font-size: 24px; }
.fm-result-content { line-height: 1.8; color: #E0E0E0; white-space: pre-wrap; }
@media (max-width: 768px) { .fm-type-grid { grid-template-columns: 1fr; } }
</style>
