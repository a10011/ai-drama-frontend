<template>
  <div class="home-page">
    <!-- Hero 渐变区 -->
    <section class="hero">
      <div class="hero-bg">
        <div class="hero-orb orb-1"></div>
        <div class="hero-orb orb-2"></div>
        <div class="hero-orb orb-3"></div>
      </div>

      <div class="hero-content">
        <h1 class="hero-title">🎬 AI 短剧创作平台</h1>
        <p class="hero-sub">粘贴剧本 → 提交导演 → 自动制作短剧、广告片、宣传片</p>

        <div class="hero-search">
          <input
            v-model="prompt"
            class="hero-input"
            placeholder="输入你的创意，例如：一个社畜在深夜加班时发现自己养的绿植会说话..."
            @keyup.enter="goCreate"
          />
          <button class="hero-btn" @click="goCreate">开始创作</button>
        </div>
      </div>
    </section>

    <!-- 创作类型 -->
    <section class="main-section">
      <h2 class="section-title">选择创作类型</h2>
      <div class="creation-types">
        <div class="type-card" @click="$router.push('/create')">
          <div class="type-icon">🎬</div>
          <div class="type-title">短剧</div>
          <div class="type-desc">多集连续剧，完整故事线</div>
        </div>
        <div class="type-card" @click="$router.push('/create')">
          <div class="type-icon">📢</div>
          <div class="type-title">广告片</div>
          <div class="type-desc">产品宣传，商业推广</div>
        </div>
        <div class="type-card" @click="$router.push('/create')">
          <div class="type-icon">🎥</div>
          <div class="type-title">宣传片</div>
          <div class="type-desc">企业形象，品牌宣传</div>
        </div>
        <div class="type-card" @click="$router.push('/script-chat')">
          <div class="type-icon">✍️</div>
          <div class="type-title">写剧本</div>
          <div class="type-desc">AI 辅助，创意写作</div>
        </div>
      </div>
    </section>

    <!-- 快速入口 -->
    <section class="main-section">
      <h2 class="section-title">快速入口</h2>
      <div class="quick-grid">
        <div class="access-card" @click="$router.push('/projects')">
          <div class="access-icon">🎬</div>
          <div>
            <h3>我的作品</h3>
            <p>查看所有短剧项目</p>
          </div>
        </div>
        <div class="access-card" @click="$router.push('/payment')">
          <div class="access-icon">💰</div>
          <div>
            <h3>充值中心</h3>
            <p>会员套餐、点数充值</p>
          </div>
        </div>
        <div class="access-card" @click="$router.push('/media')">
          <div class="access-icon">🖼️</div>
          <div>
            <h3>素材库</h3>
            <p>图片、音频、视频管理</p>
          </div>
        </div>
      </div>
    </section>

    <!-- 样片展示 -->
    <section class="main-section samples-section">
      <h2 class="section-title">样片展示</h2>
      <div class="sample-tabs">
        <button
          v-for="tab in sampleTabs"
          :key="tab.value"
          :class="['sample-tab', { active: activeTab === tab.value }]"
          @click="activeTab = tab.value"
        >{{ tab.label }}</button>
      </div>

      <div v-show="activeTab === 'short'" class="samples-grid">
        <div class="sample-card" v-for="item in shortSamples" :key="item.name">
          <div class="sample-thumb" :style="{ background: item.gradient }">{{ item.icon }}</div>
          <div class="sample-info">
            <div class="sample-title">{{ item.name }}</div>
            <div class="sample-meta">{{ item.desc }}</div>
          </div>
        </div>
      </div>
      <div v-show="activeTab === 'ad'" class="samples-grid">
        <div class="sample-card" v-for="item in adSamples" :key="item.name">
          <div class="sample-thumb" :style="{ background: item.gradient }">{{ item.icon }}</div>
          <div class="sample-info">
            <div class="sample-title">{{ item.name }}</div>
            <div class="sample-meta">{{ item.desc }}</div>
          </div>
        </div>
      </div>
      <div v-show="activeTab === 'promo'" class="samples-grid">
        <div class="sample-card" v-for="item in promoSamples" :key="item.name">
          <div class="sample-thumb" :style="{ background: item.gradient }">{{ item.icon }}</div>
          <div class="sample-info">
            <div class="sample-title">{{ item.name }}</div>
            <div class="sample-meta">{{ item.desc }}</div>
          </div>
        </div>
      </div>
    </section>

    <!-- 底部 -->
    <footer class="footer">
      <p>© 2026 AI 短剧创作平台 · 让创作更简单</p>
    </footer>
  </div>
</template>

<script>
export default {
  data() {
    return {
      prompt: '',
      activeTab: 'short',
      sampleTabs: [
        { label: '短剧', value: 'short' },
        { label: '广告片', value: 'ad' },
        { label: '宣传片', value: 'promo' },
      ],
      shortSamples: [
        { name: '都市情感短剧 - 第1集', desc: '2026-07-20 · 5分钟', icon: '🎬', gradient: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)' },
        { name: '古装穿越短剧 - 第1集', desc: '2026-07-19 · 8分钟', icon: '🎬', gradient: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)' },
        { name: '科幻悬疑短剧 - 第1集', desc: '2026-07-18 · 6分钟', icon: '🎬', gradient: 'linear-gradient(135deg, #fa709a 0%, #fee140 100%)' },
      ],
      adSamples: [
        { name: '手机产品广告', desc: '30秒 · 高清', icon: '📢', gradient: 'linear-gradient(135deg, #fa709a 0%, #fee140 100%)' },
        { name: '食品品牌广告', desc: '15秒 · 竖屏', icon: '📢', gradient: 'linear-gradient(135deg, #a8edea 0%, #fed6e3 100%)' },
        { name: '汽车广告片', desc: '60秒 · 4K', icon: '📢', gradient: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' },
      ],
      promoSamples: [
        { name: '企业年度宣传片', desc: '3分钟 · 4K', icon: '🎥', gradient: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' },
        { name: '旅游城市宣传片', desc: '2分钟 · 横屏', icon: '🎥', gradient: 'linear-gradient(135deg, #f5af19 0%, #f12711 100%)' },
        { name: '学校招生宣传片', desc: '4分钟 · 横屏', icon: '🎥', gradient: 'linear-gradient(135deg, #11998e 0%, #38ef7d 100%)' },
      ],
    }
  },
  methods: {
    goCreate() {
      if (this.prompt.trim()) {
        this.$router.push('/create?prompt=' + encodeURIComponent(this.prompt))
      } else {
        this.$router.push('/create')
      }
    },
  }
}
</script>

<style scoped>
.home-page {
  background: #f5f7fa;
  color: #1e293b;
  font-family: 'Inter', 'Noto Sans SC', -apple-system, sans-serif;
}

/* ===== Hero ===== */
.hero {
  background: linear-gradient(135deg, #2563eb 0%, #7c3aed 100%);
  color: white;
  padding: 80px 30px;
  text-align: center;
  position: relative;
  overflow: hidden;
}

.hero-bg { position: absolute; inset: 0; overflow: hidden; }

.hero-orb {
  position: absolute;
  border-radius: 50%;
  filter: blur(100px);
  opacity: 0.12;
}
.orb-1 { width: 500px; height: 500px; background: #6366f1; top: -200px; right: -100px; }
.orb-2 { width: 400px; height: 400px; background: #c49b4a; bottom: -150px; left: -100px; }
.orb-3 { width: 300px; height: 300px; background: #8b5cf6; top: 50%; left: 50%; transform: translate(-50%, -50%); }

.hero-content { position: relative; z-index: 1; max-width: 800px; margin: 0 auto; }
.hero-title { font-size: 56px; font-weight: 800; margin-bottom: 16px; line-height: 1.2; text-shadow: 0 2px 12px rgba(0,0,0,0.2); }
.hero-sub { font-size: 24px; font-weight: 400; opacity: 0.9; margin-bottom: 40px; }

.hero-search {
  display: flex; gap: 0; max-width: 700px; margin: 0 auto;
}
.hero-input {
  flex: 1; height: 56px; padding: 0 24px;
  border: none; border-radius: 10px 0 0 10px;
  font-size: 17px; outline: none; background: white; color: #1e293b;
}
.hero-input::placeholder { color: #94a3b8; }
.hero-btn {
  height: 56px; padding: 0 36px;
  background: #fbbf24; color: #1e293b; border: none;
  border-radius: 0 10px 10px 0; font-size: 17px; font-weight: 700;
  cursor: pointer; transition: all 0.2s; white-space: nowrap;
}
.hero-btn:hover { background: #f59e0b; transform: translateY(-1px); }

/* ===== Section ===== */
.main-section {
  max-width: 1400px; margin: 0 auto; padding: 60px 30px;
}
.section-title {
  font-size: 40px; font-weight: 800; margin-bottom: 36px; color: #1e293b; text-align: center;
}

/* ===== 创作类型 ===== */
.creation-types {
  display: grid; grid-template-columns: repeat(4, 1fr); gap: 30px;
}
.type-card {
  background: white; padding: 48px 24px; border-radius: 20px;
  text-align: center; box-shadow: 0 4px 6px rgba(0,0,0,0.06);
  cursor: pointer; transition: all 0.3s; border: 2px solid transparent;
}
.type-card:hover { transform: translateY(-8px); box-shadow: 0 16px 40px rgba(37,99,235,0.15); border-color: #2563eb; }
.type-icon { font-size: 72px; margin-bottom: 20px; }
.type-title { font-size: 28px; font-weight: 700; margin-bottom: 12px; color: #1e293b; }
.type-desc { color: #64748b; font-size: 18px; line-height: 1.5; }

/* ===== 快速入口 ===== */
.quick-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 30px; }
.access-card {
  background: white; padding: 40px 30px; border-radius: 16px;
  box-shadow: 0 4px 6px rgba(0,0,0,0.06); display: flex; align-items: center; gap: 24px;
  cursor: pointer; transition: all 0.3s; border: 2px solid transparent;
}
.access-card:hover { transform: translateX(6px); border-color: #2563eb; box-shadow: 0 8px 24px rgba(37,99,235,0.12); }
.access-icon { font-size: 56px; flex-shrink: 0; }
.access-card h3 { font-size: 26px; font-weight: 700; margin-bottom: 8px; color: #1e293b; }
.access-card p { color: #64748b; font-size: 18px; }

/* ===== 样片展示 ===== */
.samples-section { margin-bottom: 80px; }
.sample-tabs { display: flex; justify-content: center; gap: 16px; margin-bottom: 36px; }
.sample-tab {
  padding: 14px 36px; border: 3px solid #e2e8f0; background: white;
  border-radius: 12px; font-size: 22px; font-weight: 600;
  cursor: pointer; transition: all 0.2s; color: #475569;
}
.sample-tab:hover { border-color: #2563eb; color: #2563eb; }
.sample-tab.active { background: #2563eb; color: white; border-color: #2563eb; }

.samples-grid {
  display: grid; grid-template-columns: repeat(auto-fill, minmax(320px, 1fr)); gap: 24px;
}
.sample-card {
  background: white; border-radius: 14px; overflow: hidden;
  box-shadow: 0 4px 6px rgba(0,0,0,0.06); transition: all 0.3s; cursor: pointer;
}
.sample-card:hover { transform: translateY(-6px); box-shadow: 0 12px 32px rgba(0,0,0,0.12); }
.sample-thumb { height: 200px; display: flex; align-items: center; justify-content: center; font-size: 64px; }
.sample-info { padding: 22px; }
.sample-title { font-size: 22px; font-weight: 700; margin-bottom: 8px; color: #1e293b; }
.sample-meta { color: #64748b; font-size: 16px; }

/* ===== Footer ===== */
.footer { background: #1e293b; color: white; padding: 40px 30px; text-align: center; }
.footer p { opacity: 0.8; }

/* ===== Responsive ===== */
@media (max-width: 1024px) {
  .creation-types { grid-template-columns: repeat(2, 1fr); }
  .quick-grid { grid-template-columns: 1fr; }
  .hero-title { font-size: 42px; }
  .hero-sub { font-size: 20px; }
}
@media (max-width: 768px) {
  .creation-types { grid-template-columns: 1fr; }
  .samples-grid { grid-template-columns: 1fr; }
  .hero { padding: 50px 20px; }
  .hero-title { font-size: 32px; }
  .hero-search { flex-direction: column; }
  .hero-input { border-radius: 10px; margin-bottom: 12px; }
  .hero-btn { border-radius: 10px; }
  .section-title { font-size: 30px; }
  .main-section { padding: 40px 16px; }
}
</style>
