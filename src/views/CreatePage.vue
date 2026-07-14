<template>
  <div class="create-page">
    <!-- 左卡：极简一键模式 -->
    <div class="mode-card" @click="$router.push('/create/quick')">
      <div class="mode-icon">🪄</div>
      <h2 class="mode-title">极简一键模式</h2>
      <p class="mode-desc">只需一句话，坐等大片出街</p>
      <button class="mode-btn">开启全自动托管</button>
    </div>

    <!-- 右卡：专业共创模式 -->
    <div class="mode-card" @click="$router.push('/create/pro')">
      <div class="mode-icon">📋</div>
      <h2 class="mode-title">专业共创模式</h2>
      <p class="mode-desc">步步为营，每一帧皆可精调</p>
      <button class="mode-btn">进入专业工作台</button>
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
  gap: 32px;
}

.mode-card {
  width: 380px;
  padding: 48px 36px;
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
  font-size: 48px;
  margin-bottom: 16px;
}

.mode-title {
  font-size: 20px;
  font-weight: 700;
  color: var(--text-primary);
  margin-bottom: 8px;
}

.mode-desc {
  font-size: 14px;
  color: var(--text-secondary);
  margin-bottom: 24px;
  line-height: 1.5;
}

.mode-btn {
  padding: 12px 32px;
  background: linear-gradient(135deg, #8A2BE2, #00FFFF);
  color: #fff;
  border: none;
  border-radius: 10px;
  font-size: 15px;
  font-weight: 700;
  cursor: pointer;
  transition: var(--transition);
}

.mode-btn:hover {
  box-shadow: 0 0 20px rgba(0, 255, 255, 0.25);
}

@media (max-width: 768px) {
  .create-page { flex-direction: column; gap: 16px; padding: 16px; min-height: calc(100vh - 56px - 72px); }
  .mode-card { width: 100%; padding: 28px 20px; }
  .mode-icon { font-size: 36px; }
  .mode-title { font-size: 18px; }
}

/* ===== Mobile Responsive ===== */
@media (max-width: 768px) {
  .main-content { padding-bottom: 72px !important; }
}

</style>
