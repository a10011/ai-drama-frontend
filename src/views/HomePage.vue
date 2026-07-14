<template>
  <div class="home-page">
    <!-- Hero 区 -->
    <section class="hero">
      <h1 class="hero-title">一句话，生成你的专属短剧</h1>
      <p class="hero-subtitle">AI 驱动，从创意到成片，一键搞定</p>

      <div class="hero-input-group">
        <input
          v-model="prompt"
          class="hero-input"
          placeholder="输入你的创意，例如：一个社畜在深夜加班时发现自己养的绿植会说话..."
          @keyup.enter="goCreate"
        />
        <button class="hero-btn" @click="goCreate">
          开始创作
        </button>
      </div>
    </section>

    <!-- 写剧本快捷入口 -->
    <section class="script-chat-entry">
      <div class="entry-card" onclick="location.href='/script-chat'">
        <span class="entry-icon">✍️</span>
        <div class="entry-info">
          <h3>AI 剧本创作</h3>
          <p>与智能体对话，打造你的专属剧本</p>
        </div>
        <button class="entry-btn" onclick="event.stopPropagation();location.href='/script-chat'">开始创作</button>
      </div>
    </section>

    <!-- 热门模板区 -->
    <section class="templates-section">
      <h2 class="section-title">热门题材</h2>
      <div class="templates-scroll">
        <div
          v-for="tpl in templates"
          :key="tpl.name"
          class="template-card"
          @click="goTemplate(tpl.route)"
        >
          <span class="template-emoji">{{ tpl.emoji }}</span>
          <div class="template-overlay"></div>
          <span class="template-name">{{ tpl.name }}</span>
          <button class="template-btn">开始</button>
        </div>
      </div>
    </section>

    <!-- 创作学院 -->
    <section class="academy-section">
      <h2 class="section-title">创作学院</h2>
      <div class="academy-list">
        <details class="academy-item" v-for="item in academy" :key="item.title">
          <summary class="academy-summary">{{ item.title }}</summary>
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
        { name: '霸总逆袭', emoji: '👔', route: '霸总逆袭' },
        { name: '古装穿越', emoji: '🏯', route: '古装穿越' },
        { name: '赛博朋克', emoji: '🤖', route: '赛博朋克' },
        { name: '悬疑推理', emoji: '🔍', route: '悬疑推理' },
        { name: '甜宠恋爱', emoji: '💕', route: '甜宠恋爱' },
        { name: '末日求生', emoji: '🧟', route: '末日求生' },
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
/* ===== Hero 区 ===== */
.hero {
  background: radial-gradient(ellipse at 50% 0%, rgba(196,155,74,0.10) 0%, transparent 60%);
  height: 70vh;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  text-align: center;
}

.hero-title {
  font-size: 32px;
  font-weight: 800;
  color: var(--text-primary);
  letter-spacing: -0.5px;
  max-width: 600px;
}

.hero-subtitle {
  font-size: 16px;
  color: var(--text-secondary);
  margin-top: 12px;
}

.hero-input-group {
  margin-top: 32px;
  display: flex;
  gap: 0;
}

.hero-input {
  width: 560px;
  height: 56px;
  padding: 0 20px;
  background: var(--bg-input);
  border: 1px solid var(--border);
  border-radius: 12px 0 0 12px;
  color: var(--text-primary);
  font-size: 15px;
  outline: none;
  transition: var(--transition);
}

.hero-input::placeholder {
  color: var(--text-muted);
}

.hero-input:focus {
  border-color: var(--accent);
  box-shadow: 0 0 20px var(--accent-glow);
}

.hero-btn {
  height: 56px;
  padding: 0 32px;
  background: linear-gradient(135deg, #c49b4a, #d4b35a);
  color: #fff;
  border: none;
  border-radius: 0 12px 12px 0;
  font-size: 16px;
  font-weight: 700;
  cursor: pointer;
  white-space: nowrap;
  transition: var(--transition);
}

.hero-btn:hover {
  box-shadow: 0 0 25px rgba(196,155,74,0.25);
}

/* ===== 热门模板区 ===== */
.script-chat-entry {
  max-width: 800px;
  margin: 0 auto 24px;
  padding: 0 20px;
}
.entry-card {
  display: flex;
  align-items: center;
  gap: 16px;
  padding: 20px 24px;
  background: linear-gradient(135deg, rgba(196,155,74,0.12), rgba(196,155,74,0.04));
  border: 1px solid var(--accent, #c49b4a);
  border-radius: 14px;
  cursor: pointer;
  transition: all 0.3s;
}
.entry-card:hover {
  border-color: #9B7FFF;
  background: linear-gradient(135deg, rgba(196,155,74,0.18), rgba(196,155,74,0.06));
  transform: translateY(-2px);
  box-shadow: 0 4px 20px rgba(196,155,74,0.15);
}
.entry-icon { font-size: 36px; }
.entry-info { flex: 1; }
.entry-info h3 { font-size: 18px; font-weight: 700; margin-bottom: 4px; }
.entry-info p { font-size: 13px; color: var(--text-muted, #6C6C8A); }
.entry-btn {
  background: var(--accent, #c49b4a);
  color: white;
  border: none;
  padding: 10px 20px;
  border-radius: 8px;
  font-size: 14px;
  cursor: pointer;
  transition: all 0.2s;
  flex-shrink: 0;
}
.entry-btn:hover { background: #b38a3e; }

.templates-section {
  margin-top: 60px;
}

.section-title {
  font-size: 20px;
  font-weight: 700;
  margin-bottom: 20px;
  color: var(--text-primary);
}

.templates-scroll {
  display: flex;
  gap: 16px;
  overflow-x: auto;
  padding-bottom: 8px;
}

.templates-scroll::-webkit-scrollbar {
  height: 4px;
}

.templates-scroll::-webkit-scrollbar-thumb {
  background: var(--border);
  border-radius: 2px;
}

.template-card {
  width: 200px;
  height: 140px;
  background: var(--bg-card);
  border: 1px solid var(--border);
  border-radius: var(--radius);
  position: relative;
  overflow: hidden;
  cursor: pointer;
  flex-shrink: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: var(--transition);
}

.template-emoji {
  font-size: 48px;
  position: relative;
  z-index: 1;
}

.template-overlay {
  position: absolute;
  inset: 0;
  background: linear-gradient(to top, rgba(10,10,10,0.85) 0%, transparent 50%);
  z-index: 1;
}

.template-name {
  position: absolute;
  bottom: 12px;
  left: 12px;
  font-size: 15px;
  font-weight: 600;
  color: #fff;
  z-index: 2;
}

.template-btn {
  position: absolute;
  bottom: 8px;
  right: 8px;
  padding: 4px 12px;
  background: var(--accent);
  color: #fff;
  border: none;
  border-radius: 6px;
  font-size: 12px;
  cursor: pointer;
  z-index: 2;
  transition: var(--transition);
}

.template-card:hover {
  border-color: var(--accent);
  transform: translateY(-2px);
  box-shadow: 0 4px 20px rgba(196,155,74,0.2);
}

/* ===== 创作学院 ===== */
.academy-section {
  margin-top: 50px;
  margin-bottom: 40px;
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
  padding: 16px;
  cursor: pointer;
}

.academy-summary {
  font-size: 15px;
  font-weight: 600;
  color: var(--text-primary);
  list-style: none;
}

.academy-summary::-webkit-details-marker {
  display: none;
}

.academy-summary::marker {
  display: none;
  content: '';
}

.academy-summary::before {
  content: '▶';
  display: inline-block;
  margin-right: 8px;
  font-size: 10px;
  color: var(--accent);
  transition: transform 0.2s ease;
}

details[open] .academy-summary::before {
  transform: rotate(90deg);
}

.academy-content {
  margin-top: 12px;
  color: var(--text-secondary);
  font-size: 14px;
  line-height: 1.6;
}

@media (max-width: 768px) {
  .hero { height: auto; min-height: 50vh; padding: 40px 16px; }
  .hero-title { font-size: 24px; }
  .hero-subtitle { font-size: 14px; }
  .hero-input-group { flex-direction: column; width: 100%; max-width: 100%; }
  .hero-input { width: 100%; border-radius: 12px; text-align: left; }
  .hero-btn { width: 100%; border-radius: 12px; margin-top: 8px; height: 48px; }
  .templates-scroll { gap: 10px; padding-bottom: 4px; }
  .template-card { width: 150px; height: 110px; }
  .template-emoji { font-size: 36px; }
  .script-chat-entry { padding: 0 16px; }
  .entry-card { flex-direction: column; text-align: center; padding: 16px; }
  .entry-icon { font-size: 28px; }
  .entry-info h3 { font-size: 16px; }
  .entry-btn { width: 100%; }
  .section-title { font-size: 18px; padding: 0 16px; }
  .templates-section, .academy-section { padding: 0 16px; }
  .academy-item { padding: 12px; }
}

/* ===== Mobile Responsive ===== */
@media (max-width: 768px) {
  .main-content { padding-bottom: 72px !important; }
}

</style>
