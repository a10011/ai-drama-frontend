<template>
  <div class="home-page">
    <!-- Hero 区 -->
    <section class="hero">
      <div class="hero-bg">
        <div class="hero-orb orb-1"></div>
        <div class="hero-orb orb-2"></div>
        <div class="hero-orb orb-3"></div>
      </div>
      
      <div class="hero-content">
        <h1 class="hero-title">
          <span class="title-line">一句话，生成你的专属短剧</span>
          <span class="title-sub">AI 驱动，从创意到成片，一键搞定</span>
        </h1>

        <div class="hero-input-group">
          <input
            v-model="prompt"
            class="hero-input"
            placeholder="输入你的创意，例如：一个社畜在深夜加班时发现自己养的绿植会说话..."
            @keyup.enter="goCreate"
          />
          <button class="hero-btn" @click="goCreate">
            <span>🚀</span>
            开始创作
          </button>
        </div>

        <div class="hero-stats">
          <div class="stat-item">
            <span class="stat-value">10万+</span>
            <span class="stat-label">短剧已生成</span>
          </div>
          <div class="stat-divider"></div>
          <div class="stat-item">
            <span class="stat-value">5万+</span>
            <span class="stat-label">创作者</span>
          </div>
          <div class="stat-divider"></div>
          <div class="stat-item">
            <span class="stat-value">99.9%</span>
            <span class="stat-label">成功率</span>
          </div>
        </div>
      </div>
    </section>

    <!-- 快捷入口 -->
    <section class="quick-entries">
      <div class="entry-card entry-script" @click="$router.push('/script-chat')">
        <div class="entry-icon">✍️</div>
        <div class="entry-info">
          <h3>AI 剧本创作</h3>
          <p>与智能体对话，打造你的专属剧本</p>
        </div>
        <span class="entry-arrow">→</span>
      </div>
      
      <div class="entry-card entry-quick" @click="$router.push('/create/quick')">
        <div class="entry-icon">⚡</div>
        <div class="entry-info">
          <h3>一键生成</h3>
          <p>选择类型，输入主题，坐等出片</p>
        </div>
        <span class="entry-arrow">→</span>
      </div>
      
      <div class="entry-card entry-pro" @click="$router.push('/create/pro')">
        <div class="entry-icon">🎬</div>
        <div class="entry-info">
          <h3>专业共创模式</h3>
          <p>步步为营，每一帧皆可精调</p>
        </div>
        <span class="entry-arrow">→</span>
      </div>
    </section>

    <!-- 热门模板区 -->
    <section class="templates-section">
      <div class="section-header">
        <h2 class="section-title">热门题材</h2>
        <p class="section-desc">选择你喜欢的题材，AI 帮你一键生成</p>
      </div>
      
      <div class="templates-scroll">
        <div
          v-for="tpl in templates"
          :key="tpl.name"
          class="template-card"
          @click="goTemplate(tpl.route)"
        >
          <div class="template-bg" :style="{ background: tpl.gradient }"></div>
          <span class="template-emoji">{{ tpl.emoji }}</span>
          <span class="template-name">{{ tpl.name }}</span>
          <button class="template-btn">开始</button>
        </div>
      </div>
    </section>

    <!-- 创作学院 -->
    <section class="academy-section">
      <div class="section-header">
        <h2 class="section-title">创作学院</h2>
        <p class="section-desc">掌握技巧，让你的短剧更专业</p>
      </div>
      
      <div class="academy-list">
        <details class="academy-item" v-for="item in academy" :key="item.title">
          <summary class="academy-summary">
            <span class="summary-icon">▶</span>
            {{ item.title }}
          </summary>
          <p class="academy-content">{{ item.content }}</p>
        </details>
      </div>
    </section>
  </div>
</template>

<script>
export default {
  data() {
    return {
      prompt: '',
      templates: [
        { name: '霸总逆袭', emoji: '👔', route: '霸总逆袭', gradient: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' },
        { name: '古装穿越', emoji: '🏯', route: '古装穿越', gradient: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)' },
        { name: '赛博朋克', emoji: '🤖', route: '赛博朋克', gradient: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)' },
        { name: '悬疑推理', emoji: '🔍', route: '悬疑推理', gradient: 'linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)' },
        { name: '甜宠恋爱', emoji: '💕', route: '甜宠恋爱', gradient: 'linear-gradient(135deg, #fa709a 0%, #fee140 100%)' },
        { name: '末日求生', emoji: '🧟', route: '末日求生', gradient: 'linear-gradient(135deg, #a18cd1 0%, #fbc2eb 100%)' },
      ],
      academy: [
        {
          title: '提示词技巧',
          content: '好的提示词应包含：角色描述 + 场景设定 + 风格关键词。例如"一个戴眼镜的年轻侦探（角色），在霓虹闪烁的雨夜街道（场景），赛博朋克风格（风格）"。精炼且具体，让AI准确理解你的意图。'
        },
        {
          title: '角色一致性教程',
          content: '使用参考图 + 详细外貌描述，可大幅提升角色一致性。为每个主要角色准备一份"角色档案"：发型、瞳色、身高体型、标志性服饰。在剧本中标注角色编号，AI会持续追踪同一角色的视觉特征。'
        },
        {
          title: '分镜设计基础',
          content: '远景定场 → 中景叙事 → 特写情感 → 全景收尾。先用远景交代环境，中景推进剧情，特写捕捉角色微表情，最后用全景或远景收束场景。合理的镜头节奏能让故事更有电影感。'
        },
      ]
    }
  },
  methods: {
    goCreate() {
      if (this.prompt.trim()) {
        this.$router.push('/create/quick?prompt=' + encodeURIComponent(this.prompt))
      } else {
        this.$router.push('/create')
      }
    },
    goTemplate(template) {
      this.$router.push('/create/quick?template=' + encodeURIComponent(template))
    }
  }
}
</script>

<style scoped>
.home-page {
  min-height: 100vh;
  background: var(--bg-primary);
  color: var(--text-primary);
  font-family: 'Inter', 'Noto Sans SC', -apple-system, sans-serif;
  overflow-x: hidden;
}

/* ===== Hero 区 ===== */
.hero {
  position: relative;
  min-height: 70vh;
  display: flex;
  align-items: center;
  justify-content: center;
  text-align: center;
  padding: 60px 20px;
  overflow: hidden;
}

.hero-bg {
  position: absolute;
  inset: 0;
  overflow: hidden;
}

.hero-orb {
  position: absolute;
  border-radius: 50%;
  filter: blur(100px);
  opacity: 0.12;
}

.orb-1 {
  width: 500px;
  height: 500px;
  background: #6366f1;
  top: -200px;
  right: -100px;
}

.orb-2 {
  width: 400px;
  height: 400px;
  background: #c49b4a;
  bottom: -150px;
  left: -100px;
}

.orb-3 {
  width: 300px;
  height: 300px;
  background: #8b5cf6;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
}

.hero-content {
  position: relative;
  z-index: 1;
  max-width: 700px;
}

.hero-title {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.title-line {
  font-size: 42px;
  font-weight: 800;
  background: linear-gradient(135deg, #f0f0f5 0%, #a0a0b8 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  line-height: 1.2;
}

.title-sub {
  font-size: 18px;
  color: var(--text-secondary);
  font-weight: 400;
}

.hero-input-group {
  margin-top: 40px;
  display: flex;
  gap: 0;
  max-width: 600px;
  margin-left: auto;
  margin-right: auto;
}

.hero-input {
  flex: 1;
  height: 56px;
  padding: 0 20px;
  background: var(--bg-input);
  border: 1px solid var(--border);
  border-right: none;
  border-radius: 12px 0 0 12px;
  color: var(--text-primary);
  font-size: 15px;
  outline: none;
  transition: var(--transition);
}

.hero-input::placeholder { color: var(--text-muted); }

.hero-input:focus {
  border-color: var(--accent);
  box-shadow: 0 0 20px var(--accent-glow);
}

.hero-btn {
  height: 56px;
  padding: 0 28px;
  background: linear-gradient(135deg, #c49b4a, #d4b35a);
  color: #fff;
  border: none;
  border-radius: 0 12px 12px 0;
  font-size: 16px;
  font-weight: 700;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 8px;
  transition: var(--transition);
  white-space: nowrap;
}

.hero-btn:hover {
  box-shadow: 0 0 25px rgba(196,155,74,0.3);
  transform: translateY(-1px);
}

.hero-stats {
  margin-top: 48px;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 24px;
}

.stat-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 4px;
}

.stat-value {
  font-size: 20px;
  font-weight: 700;
  color: var(--gold);
}

.stat-label {
  font-size: 12px;
  color: var(--text-muted);
}

.stat-divider {
  width: 1px;
  height: 32px;
  background: var(--border);
}

/* ===== 快捷入口 ===== */
.quick-entries {
  max-width: 800px;
  margin: 0 auto 60px;
  padding: 0 20px;
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.entry-card {
  display: flex;
  align-items: center;
  gap: 16px;
  padding: 20px 24px;
  background: var(--bg-card);
  border: 1px solid var(--border);
  border-radius: 14px;
  cursor: pointer;
  transition: all 0.3s ease;
}

.entry-card:hover {
  border-color: var(--accent);
  transform: translateY(-2px);
  box-shadow: var(--shadow-md);
}

.entry-icon {
  font-size: 32px;
  flex-shrink: 0;
}

.entry-info {
  flex: 1;
}

.entry-info h3 {
  font-size: 16px;
  font-weight: 700;
  margin-bottom: 4px;
}

.entry-info p {
  font-size: 13px;
  color: var(--text-muted);
}

.entry-arrow {
  font-size: 20px;
  color: var(--text-muted);
  transition: all 0.3s;
}

.entry-card:hover .entry-arrow {
  color: var(--accent);
  transform: translateX(4px);
}

/* ===== 热门模板区 ===== */
.templates-section {
  max-width: 1000px;
  margin: 0 auto 60px;
  padding: 0 20px;
}

.section-header {
  text-align: center;
  margin-bottom: 32px;
}

.section-title {
  font-size: 24px;
  font-weight: 700;
  margin-bottom: 8px;
}

.section-desc {
  font-size: 14px;
  color: var(--text-muted);
}

.templates-scroll {
  display: flex;
  gap: 16px;
  overflow-x: auto;
  padding-bottom: 8px;
}

.templates-scroll::-webkit-scrollbar { height: 4px; }
.templates-scroll::-webkit-scrollbar-thumb { background: var(--border); border-radius: 2px; }

.template-card {
  position: relative;
  width: 180px;
  height: 160px;
  border-radius: var(--radius);
  overflow: hidden;
  cursor: pointer;
  flex-shrink: 0;
  transition: var(--transition);
  border: 1px solid var(--border);
}

.template-card:hover {
  transform: translateY(-4px);
  box-shadow: var(--shadow-lg);
}

.template-bg {
  position: absolute;
  inset: 0;
  opacity: 0.6;
  transition: opacity 0.3s;
}

.template-card:hover .template-bg { opacity: 0.8; }

.template-emoji {
  position: relative;
  z-index: 1;
  font-size: 40px;
  display: block;
  margin: 20px auto 8px;
}

.template-name {
  position: relative;
  z-index: 1;
  display: block;
  text-align: center;
  font-size: 14px;
  font-weight: 600;
  color: #fff;
  padding: 0 12px;
}

.template-btn {
  position: absolute;
  bottom: 12px;
  left: 50%;
  transform: translateX(-50%);
  padding: 6px 16px;
  background: rgba(255,255,255,0.2);
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255,255,255,0.3);
  border-radius: 20px;
  color: #fff;
  font-size: 12px;
  font-weight: 600;
  cursor: pointer;
  opacity: 0;
  transition: all 0.3s;
  z-index: 1;
}

.template-card:hover .template-btn { opacity: 1; }
.template-btn:hover { background: rgba(255,255,255,0.3); }

/* ===== 创作学院 ===== */
.academy-section {
  max-width: 700px;
  margin: 0 auto 60px;
  padding: 0 20px;
}

.academy-list {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.academy-item {
  background: var(--bg-card);
  border: 1px solid var(--border);
  border-radius: var(--radius-sm);
  padding: 16px 20px;
  cursor: pointer;
  transition: var(--transition);
}

.academy-item:hover { border-color: var(--border-light); }

.academy-summary {
  font-size: 15px;
  font-weight: 600;
  color: var(--text-primary);
  list-style: none;
  display: flex;
  align-items: center;
  gap: 8px;
}

.academy-summary::-webkit-details-marker { display: none; }

.summary-icon {
  font-size: 10px;
  color: var(--accent);
  transition: transform 0.2s;
}

details[open] .summary-icon { transform: rotate(90deg); }

.academy-content {
  margin-top: 12px;
  color: var(--text-secondary);
  font-size: 14px;
  line-height: 1.6;
}

/* ===== 响应式 ===== */
@media (max-width: 768px) {
  .hero { min-height: auto; padding: 40px 16px; }
  .title-line { font-size: 28px; }
  .title-sub { font-size: 14px; }
  .hero-input-group { flex-direction: column; width: 100%; }
  .hero-input { width: 100%; border-radius: 12px; border-right: 1px solid var(--border); }
  .hero-btn { width: 100%; border-radius: 12px; margin-top: 8px; height: 48px; }
  .hero-stats { flex-direction: column; gap: 12px; }
  .stat-divider { width: 48px; height: 1px; }
  .templates-scroll { gap: 10px; }
  .template-card { width: 140px; height: 130px; }
  .quick-entries { margin-bottom: 40px; }
  .entry-card { padding: 16px; }
  .entry-icon { font-size: 24px; }
}
</style>
