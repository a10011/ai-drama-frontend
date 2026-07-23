<template>
  <div class="ad-create-page">
    <div class="page-header">
      <h1>📺 广告片创作</h1>
      <p class="subtitle">AI 驱动，快速生成专业级广告视频</p>
    </div>
    
    <div class="content-area">
      <!-- 广告类型选择 -->
      <div class="ad-types">
        <div class="type-card active" @click="selectedType = 'product'">
          <span class="type-icon">📦</span>
          <h3>产品展示</h3>
          <p>突出产品特点和使用场景</p>
        </div>
        <div class="type-card" @click="selectedType = 'brand'">
          <span class="type-icon">🏢</span>
          <h3>品牌形象</h3>
          <p>传递品牌理念和价值观</p>
        </div>
        <div class="type-card" @click="selectedType = 'promo'">
          <span class="type-icon">🎉</span>
          <h3>促销推广</h3>
          <p>限时优惠和促销活动</p>
        </div>
      </div>
      
      <!-- 输入区域 -->
      <div class="input-section">
        <div class="form-group">
          <label>广告标题</label>
          <input v-model="title" placeholder="输入广告标题" />
        </div>
        <div class="form-group">
          <label>产品描述</label>
          <textarea v-model="description" placeholder="描述您的产品或服务..." rows="4"></textarea>
        </div>
        <div class="form-group">
          <label>目标受众</label>
          <select v-model="audience">
            <option value="young">年轻人 (18-30岁)</option>
            <option value="adult">成年人 (30-50岁)</option>
            <option value="senior">老年人 (50岁以上)</option>
            <option value="general">全年龄段</option>
          </select>
        </div>
        <div class="form-group">
          <label>视频时长</label>
          <select v-model="duration">
            <option value="15">15秒</option>
            <option value="30">30秒</option>
            <option value="60">60秒</option>
          </select>
        </div>
        <button class="generate-btn" @click="generateAd" :disabled="!isValid">
          <span v-if="loading">⏳ 生成中...</span>
          <span v-else>🎬 生成广告片</span>
        </button>
      </div>
      
      <!-- 生成结果 -->
      <div class="result-section" v-if="result">
        <div class="result-header">
          <h3>生成结果</h3>
          <button class="btn-download" @click="downloadResult">📥 下载</button>
        </div>
        <div class="result-content">
          <div class="result-preview">
            <video v-if="result.video_url" :src="result.video_url" controls class="preview-video"></video>
            <div v-else class="preview-placeholder">
              <span>🎬</span>
              <p>视频生成中...</p>
            </div>
          </div>
          <div class="result-details">
            <h4>广告脚本</h4>
            <pre class="script-text">{{ result.script }}</pre>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  data() {
    return {
      selectedType: 'product',
      title: '',
      description: '',
      audience: 'young',
      duration: '30',
      loading: false,
      result: null,
    }
  },
  computed: {
    isValid() {
      return this.title.trim() && this.description.trim()
    },
    typeLabel() {
      const labels = { product: '产品展示', brand: '品牌形象', promo: '促销推广' }
      return labels[this.selectedType] || ''
    }
  },
  methods: {
    async generateAd() {
      this.loading = true
      this.result = null
      
      try {
        // 这里应该调用后端 API
        // const response = await fetch('/api/v1/ad/create', {
        //   method: 'POST',
        //   headers: { 'Content-Type': 'application/json' },
        //   body: JSON.stringify({
        //     type: this.selectedType,
        //     title: this.title,
        //     description: this.description,
        //     audience: this.audience,
        //     duration: this.duration,
        //   }),
        // })
        // const data = await response.json()
        // this.result = data
        
        // 模拟生成
        setTimeout(() => {
          this.result = {
            script: `[广告脚本]\n标题: ${this.title}\n类型: ${this.typeLabel}\n时长: ${this.duration}秒\n\n[开场]\n展示产品外观和使用场景\n\n[主体]\n介绍产品特点和优势\n\n[结尾]\n呼吁行动，展示购买链接`,
            video_url: '',
          }
          this.loading = false
        }, 2000)
      } catch (error) {
        alert('生成失败: ' + error.message)
        this.loading = false
      }
    },
    
    downloadResult() {
      if (this.result && this.result.video_url) {
        window.open(this.result.video_url, '_blank')
      } else {
        // 下载脚本
        const blob = new Blob([this.result.script], { type: 'text/plain' })
        const url = URL.createObjectURL(blob)
        const a = document.createElement('a')
        a.href = url
        a.download = `${this.title}_广告脚本.txt`
        a.click()
        URL.revokeObjectURL(url)
      }
    },
  },
}
</script>

<style scoped>
.ad-create-page {
  min-height: 100vh;
  background: var(--bg-primary);
  color: var(--text-primary);
  font-family: 'Inter', 'Noto Sans SC', -apple-system, sans-serif;
}

.page-header {
  text-align: center;
  padding: 40px 20px;
  background: linear-gradient(135deg, rgba(99,102,241,0.1) 0%, rgba(139,92,246,0.05) 100%);
}

.page-header h1 {
  font-size: 32px;
  font-weight: 800;
  margin-bottom: 8px;
}

.subtitle {
  font-size: 16px;
  color: var(--text-secondary);
}

.content-area {
  max-width: 1200px;
  margin: 0 auto;
  padding: 40px 20px;
}

/* 广告类型选择 */
.ad-types {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 16px;
  margin-bottom: 40px;
}

.type-card {
  padding: 24px;
  background: var(--bg-card);
  border: 2px solid var(--border);
  border-radius: 16px;
  text-align: center;
  cursor: pointer;
  transition: all 0.3s;
}

.type-card:hover {
  border-color: var(--accent);
  transform: translateY(-2px);
}

.type-card.active {
  border-color: var(--accent);
  background: rgba(99,102,241,0.1);
}

.type-icon {
  font-size: 32px;
  display: block;
  margin-bottom: 12px;
}

.type-card h3 {
  font-size: 16px;
  font-weight: 700;
  margin-bottom: 6px;
}

.type-card p {
  font-size: 13px;
  color: var(--text-muted);
}

/* 输入区域 */
.input-section {
  background: var(--bg-card);
  border: 1px solid var(--border);
  border-radius: 16px;
  padding: 24px;
  margin-bottom: 40px;
}

.form-group {
  margin-bottom: 20px;
}

.form-group label {
  display: block;
  font-size: 14px;
  font-weight: 600;
  margin-bottom: 6px;
  color: var(--text-secondary);
}

.form-group input,
.form-group textarea,
.form-group select {
  width: 100%;
  padding: 12px 16px;
  background: var(--bg-input);
  border: 1px solid var(--border);
  border-radius: 8px;
  color: var(--text-primary);
  font-size: 14px;
  outline: none;
  transition: border-color 0.2s;
}

.form-group input:focus,
.form-group textarea:focus,
.form-group select:focus {
  border-color: var(--accent);
}

.form-group textarea {
  resize: vertical;
  font-family: inherit;
}

.generate-btn {
  width: 100%;
  padding: 14px;
  background: linear-gradient(135deg, #c49b4a, #d4b35a);
  color: #fff;
  border: none;
  border-radius: 12px;
  font-size: 16px;
  font-weight: 700;
  cursor: pointer;
  transition: all 0.2s;
}

.generate-btn:hover:not(:disabled) {
  transform: translateY(-1px);
  box-shadow: 0 4px 16px rgba(196,155,74,0.3);
}

.generate-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

/* 结果区域 */
.result-section {
  background: var(--bg-card);
  border: 1px solid var(--border);
  border-radius: 16px;
  padding: 24px;
}

.result-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}

.result-header h3 {
  font-size: 18px;
  font-weight: 700;
}

.btn-download {
  padding: 8px 16px;
  background: var(--accent);
  color: #fff;
  border: none;
  border-radius: 8px;
  font-size: 13px;
  font-weight: 600;
  cursor: pointer;
}

.result-content {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 24px;
}

.preview-video {
  width: 100%;
  border-radius: 12px;
}

.preview-placeholder {
  width: 100%;
  height: 200px;
  background: var(--bg-primary);
  border-radius: 12px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  color: var(--text-muted);
}

.preview-placeholder span {
  font-size: 48px;
  margin-bottom: 12px;
}

.script-text {
  background: var(--bg-primary);
  border: 1px solid var(--border);
  border-radius: 8px;
  padding: 16px;
  font-size: 13px;
  line-height: 1.6;
  white-space: pre-wrap;
  color: var(--text-secondary);
  max-height: 300px;
  overflow-y: auto;
}

@media (max-width: 768px) {
  .result-content {
    grid-template-columns: 1fr;
  }
  
  .ad-types {
    grid-template-columns: 1fr;
  }
}
</style>
