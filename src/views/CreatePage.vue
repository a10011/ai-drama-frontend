<template>
  <div class="create-page">
    <div class="mode-card" @click="$router.push('/create/pro')">
      <div class="mode-icon">🎬</div>
      <h2 class="mode-title">专业创作</h2>
      <p class="mode-desc">剧本→角色→分镜→视频，全流程可控</p>
      <button class="mode-btn">开始创作</button>
    </div>
  </div>
</template>

<script>
export default {
  name: 'CreatePage'
}
</script>

<style scoped>
.create-page {
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: calc(100vh - 56px - 48px);
}

.mode-card {
  width: 420px;
  padding: 56px 40px;
  background: var(--bg-card);
  border: 1px solid var(--border);
  border-radius: 16px;
  text-align: center;
  cursor: pointer;
  transition: var(--transition);
}

.mode-card:hover {
  border-color: var(--accent);
  transform: translateY(-4px);
  box-shadow: 0 8px 30px var(--accent-glow);
}

.mode-icon {
  font-size: 56px;
  margin-bottom: 20px;
}

.mode-title {
  font-size: 22px;
  font-weight: 700;
  color: var(--text-primary);
  margin-bottom: 10px;
}

.mode-desc {
  font-size: 14px;
  color: var(--text-secondary);
  margin-bottom: 28px;
  line-height: 1.6;
}

.mode-btn {
  padding: 12px 36px;
  background: var(--accent-gradient);
  color: #fff;
  border: none;
  border-radius: 10px;
  font-size: 15px;
  font-weight: 700;
  cursor: pointer;
  transition: var(--transition);
}

.mode-btn:hover {
  box-shadow: var(--glow-accent);
}

@media (max-width: 768px) {
  .create-page { padding: 16px; }
  .mode-card { width: 100%; padding: 36px 24px; }
  .mode-icon { font-size: 40px; }
  .mode-title { font-size: 18px; }
}
</style>
