<template>
  <div class="fm-home">
    <!-- Header -->
    <header class="fm-home-header">
      <div class="fm-home-header-inner">
        <div class="fm-home-brand">
          <span class="fm-home-logo">🎬</span>
          <span class="fm-home-name">AI面剧场</span>
        </div>
        <nav class="fm-home-nav">
          <router-link to="/create" class="fm-nav-item">短剧</router-link>
          <router-link to="/script-chat" class="fm-nav-item">写剧本</router-link>
          <router-link to="/create/ad" class="fm-nav-item">广告片</router-link>
          <router-link to="/projects" class="fm-nav-item">我的作品</router-link>
        </nav>
      </div>
    </header>

    <!-- Hero -->
    <section class="fm-hero">
      <div class="fm-hero-bg">
        <div class="fm-orb orb-1"></div>
        <div class="fm-orb orb-2"></div>
        <div class="fm-orb orb-3"></div>
      </div>
      <div class="fm-hero-content">
        <h1 class="fm-hero-title">AI面剧场</h1>
        <p class="fm-hero-sub">用 AI 讲好每一个故事</p>
        <p class="fm-hero-desc">短视频时代，一个人就是一支制作团队</p>
        <div class="fm-hero-search">
          <input v-model="prompt" class="fm-hero-input" placeholder="输入你的创意..." @keyup.enter="goCreate"/>
          <button class="fm-hero-btn" @click="goCreate">开始创作</button>
        </div>
      </div>
    </section>

    <!-- 业务卡片 -->
    <section class="fm-cards-section">
      <h2 class="fm-section-title">选择你的创作方向</h2>
      <div class="fm-card-grid">
        <div class="fm-card fm-card-drama" @click="$router.push('/mode')">
          <div class="fm-card-icon">🎬</div>
          <h3>短剧工作台</h3>
          <p>多集连续剧 · 完整剧本 · 角色建模 · 分镜视频</p>
        </div>
        <div class="fm-card fm-card-script" @click="$router.push('/script-chat')">
          <div class="fm-card-icon">✍️</div>
          <h3>写剧本</h3>
          <p>AI 对话式创作 · 快速产出 · 自动质检</p>
        </div>
        <div class="fm-card fm-card-ad" @click="$router.push('/create/ad')">
          <div class="fm-card-icon">📺</div>
          <h3>广告片</h3>
          <p>产品展示 · 品牌形象 · 商业推送</p>
        </div>
        <div class="fm-card fm-card-promo" @click="$router.push('/create/promo')">
          <div class="fm-card-icon">🎥</div>
          <h3>宣传片</h3>
          <p>企业形象 · 品牌推广 · 招生招生</p>
        </div>
        <div class="fm-card fm-card-ref" @click="$router.push('/create/ref-video')">
          <div class="fm-card-icon">🎞️</div>
          <h3>参考视频模仿</h3>
          <p>上传视频 · AI 分析镜头技巧 · 生成模仿方案</p>
        </div>
      </div>
    </section>

    <!-- Footer -->
    <footer class="fm-footer">
      <p>© 2026 福建面子信息科技有限公司 · All rights reserved</p>
    </footer>
  </div>
</template>

<script>
export default {
  data() { return { prompt: '' } },
  methods: {
    goCreate() {
      this.$router.push('/create' + (this.prompt ? '?prompt=' + encodeURIComponent(this.prompt) : ''))
    }
  }
}
</script>

<style scoped>
.fm-home { background: #0A0A0A; min-height: 100vh; color: white; font-family: -apple-system, BlinkMacSystemFont, 'Noto Sans SC', sans-serif; }

/* Header */
.fm-home-header {
  position: sticky; top: 0; z-index: 50; background: rgba(10,10,10,0.95); border-bottom: 1px solid #2A2A2A; backdrop-filter: blur(20px);
}
.fm-home-header-inner {
  max-width: 1400px; margin: 0 auto; padding: 12px 24px; display: flex; align-items: center; justify-content: space-between;
}
.fm-home-brand { display: flex; align-items: center; gap: 8px; cursor: pointer; text-decoration: none; }
.fm-home-logo { font-size: 28px; }
.fm-home-name {
  font-size: 20px; font-weight: 800; letter-spacing: 1px;
  background: linear-gradient(90deg, #ff6b35, #E53935, #FFD600);
  -webkit-background-clip: text; -webkit-text-fill-color: transparent;
}
.fm-home-nav { display: flex; gap: 4px; }
.fm-nav-item { color: #9E9E9E; text-decoration: none; padding: 8px 14px; border-radius: 8px; font-size: 14px; transition: all 0.2s; }
.fm-nav-item:hover { color: white; background: rgba(229,57,53,0.15); }

/* Hero */
.fm-hero {
  background: linear-gradient(180deg, #1a0000 0%, #0A0A0A 60%);
  padding: 100px 24px 80px; text-align: center; position: relative; overflow: hidden;
}
.fm-hero-bg { position: absolute; inset: 0; overflow: hidden; }
.fm-orb { position: absolute; border-radius: 50%; filter: blur(80px); opacity: 0.3; }
.orb-1 { width: 600px; height: 600px; background: #E53935; top: -300px; right: -100px; }
.orb-2 { width: 400px; height: 400px; background: #FF6F00; bottom: -200px; left: -100px; }
.orb-3 { width: 300px; height: 300px; background: #FFD600; top: 40%; left: 50%; transform: translate(-50%, -50%); opacity: 0.15; }
.fm-hero-content { position: relative; z-index: 1; max-width: 900px; margin: 0 auto; }
.fm-hero-title { font-size: 72px; font-weight: 900; margin-bottom: 12px; letter-spacing: 2px; }
.fm-hero-sub { font-size: 32px; color: #FFD600; margin-bottom: 12px; font-weight: 700; }
.fm-hero-desc { font-size: 18px; color: #9E9E9E; margin-bottom: 40px; }
.fm-hero-search { display: flex; gap: 0; max-width: 700px; margin: 0 auto; border-radius: 16px; overflow: hidden; box-shadow: 0 8px 32px rgba(229,57,53,0.3); }
.fm-hero-input {
  flex: 1; height: 60px; padding: 0 24px; border: 2px solid #2A2A2A; border-right: none; border-radius: 16px 0 0 16px;
  font-size: 17px; outline: none; background: #141414; color: white;
}
.fm-hero-input::placeholder { color: #666; }
.fm-hero-btn {
  height: 60px; padding: 0 36px; background: linear-gradient(135deg, #E53935, #FF6F00); color: white; border: none;
  border-radius: 16px; font-size: 18px; font-weight: 700; cursor: pointer; transition: all 0.2s;
}
.fm-hero-btn:hover { background: linear-gradient(135deg, #FF6F00, #E53935); transform: translateY(-2px); }

/* Section */
.fm-cards-section { max-width: 1400px; margin: 0 auto; padding: 60px 24px; }
.fm-section-title { font-size: 32px; font-weight: 800; margin-bottom: 40px; text-align: center; }
.fm-card-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(260px, 1fr)); gap: 20px; }
.fm-card {
  background: #1A1A1A; padding: 36px 24px; border-radius: 20px; border: 1px solid #2A2A2A; cursor: pointer;
  transition: all 0.3s; position: relative; overflow: hidden;
}
.fm-card::before {
  content: ''; position: absolute; top: 0; left: 0; right: 0; height: 3px;
  background: linear-gradient(90deg, var(--card-color, #E53935), var(--card-accent, #FFD600)); opacity: 0; transition: opacity 0.3s;
}
.fm-card:hover { transform: translateY(-6px); border-color: var(--card-color, #E53935); box-shadow: 0 12px 40px rgba(229,57,53,0.2); }
.fm-card:hover::before { opacity: 1; }
.fm-card-drama { --card-color: #E53935; --card-accent: #FF6F00; }
.fm-card-script { --card-color: #6366F1; --card-accent: #A78BFA; }
.fm-card-ad { --card-color: #10B981; --card-accent: #34D399; }
.fm-card-promo { --card-color: #F59E0B; --card-accent: #FCD34D; }
.fm-card-ref { --card-color: #8B5CF6; --card-accent: #C4B5FD; }
.fm-card-icon { font-size: 48px; margin-bottom: 16px; }
.fm-card h3 { font-size: 22px; font-weight: 700; margin-bottom: 10px; }
.fm-card p { color: #9E9E9E; font-size: 15px; line-height: 1.5; }

/* Footer */
.fm-footer { border-top: 1px solid #2A2A2A; padding: 40px 24px; text-align: center; color: #9E9E9E; }

@media (max-width: 768px) {
  .fm-hero-title { font-size: 40px; }
  .fm-hero-sub { font-size: 22px; }
  .fm-hero-search { flex-direction: column; border-radius: 12px; }
  .fm-hero-input { border-radius: 12px 12px 0 0; border-right: 2px solid #2A2A2A; }
  .fm-hero-btn { border-radius: 0 0 12px 12px; height: auto; padding: 16px; }
  .fm-card-grid { grid-template-columns: 1fr; }
}
</style>
