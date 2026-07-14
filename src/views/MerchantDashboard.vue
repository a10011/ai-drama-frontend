<template>
  <div class="merchant-dashboard-page">
    <div class="content">
      <h1 class="title">商户后台</h1>
      <p class="desc">功能开发中</p>
      <button class="logout-btn" @click="logout">退出登录</button>
    </div>
  </div>
</template>

<script setup>
import { useRouter } from 'vue-router'

const router = useRouter()

function logout() {
  localStorage.removeItem('merchant_token')
  localStorage.removeItem('merchant_phone')
  router.push('/merchant/login')
}
</script>

<style scoped>
.merchant-dashboard-page {
  background: #000000;
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
}

.content {
  text-align: center;
}

.title {
  color: #ffffff;
  font-size: 48px;
  font-weight: 700;
  margin: 0 0 12px 0;
  letter-spacing: 4px;
}

.desc {
  color: #666666;
  font-size: 16px;
  margin: 0 0 32px 0;
}

.logout-btn {
  background: transparent;
  border: 1px solid #333;
  color: #999;
  padding: 8px 24px;
  border-radius: 6px;
  font-size: 14px;
  cursor: pointer;
  transition: all 0.2s;
}

.logout-btn:hover {
  border-color: #666;
  color: #ccc;
}

/* ===== Mobile Responsive ===== */
@media (max-width: 768px) {
  .page-container, .container, .card, .wrap { padding: 0 12px 72px !important; }
}

</style>
