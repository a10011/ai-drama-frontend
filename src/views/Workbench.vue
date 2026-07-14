<template>
  <div class="wb-landing">
    <div class="wb-hero">
      <h1 class="wb-h1">AI 短剧创作工作台</h1>
      <p class="wb-p">选择创作模式，快速开始你的作品</p>
    </div>
    <div class="wb-cards">
      <div class="wb-card" @click="$router.push('/create/pro')">
        <span class="wc-icon">🎬</span>
        <span class="wc-title">专业模式</span>
        <span class="wc-desc">完整创作流程：剧本 → 角色 → 分镜 → 合成</span>
      </div>
      <div class="wb-card" @click="$router.push('/create')">
        <span class="wc-icon">⚡</span>
        <span class="wc-title">极速创作</span>
        <span class="wc-desc">一键生成剧本和分镜头脚本</span>
      </div>
      <div class="wb-card" @click="$router.push('/create/quick')">
        <span class="wc-icon">📱</span>
        <span class="wc-title">极简模式</span>
        <span class="wc-desc">简单输入，快速出稿</span>
      </div>
      <div class="wb-card" @click="$router.push('/script-chat')">
        <span class="wc-icon">💬</span>
        <span class="wc-title">对话写剧本</span>
        <span class="wc-desc">与 AI 边聊边创作</span>
      </div>
    </div>
  </div>
</template>

<script>
export default { name: 'WorkbenchLanding' }
</script>

<style scoped>
.wb-landing { padding: 24px; }
.wb-hero { margin-bottom: 24px; }
.wb-h1 { font-size: 20px; font-weight: 700; color: #E5E6EB; margin: 0 0 4px; }
.wb-p { font-size: 13px; color: #536170; margin: 0; }
.wb-cards { display: grid; grid-template-columns: 1fr 1fr; gap: 10px; }
.wb-card {
  display: flex; flex-direction: column; gap: 4px;
  padding: 20px; border-radius: 8px;
  background: rgba(19,22,28,0.5); border: 1px solid rgba(255,255,255,0.05);
  cursor: pointer; transition: all 0.2s;
}
.wb-card:hover { border-color: rgba(22,93,255,0.25); transform: translateY(-1px); }
.wc-icon { font-size: 24px; }
.wc-title { font-size: 14px; font-weight: 600; color: #E5E6EB; }
.wc-desc { font-size: 11px; color: #536170; line-height: 1.5; }
</style>
