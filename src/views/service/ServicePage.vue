<template>
  <div class="service-page">
    <div class="service-card">
      <div class="service-icon">🎧</div>
      <h1>联系客服</h1>
      <p class="service-desc">工作时间：9:00 - 21:00</p>

      <div class="service-channels">
        <a href="https://work.weixin.qq.com/kfid/kfc123456" target="_blank" class="channel-btn" style="background:linear-gradient(135deg,#07c160,#06ad56)">
          <i class="fab fa-weixin"></i> 微信客服
        </a>
        <a href="tel:400-000-0000" class="channel-btn" style="background:linear-gradient(135deg,#00f0ff,#00f0ff)">
          <i class="fas fa-phone"></i> 400-000-0000
        </a>
        <a href="mailto:support@mzsh.top" class="channel-btn" style="background:linear-gradient(135deg,#f59e0b,#d97706)">
          <i class="fas fa-envelope"></i> support@mzsh.top
        </a>
      </div>

      <div class="service-footer">
        <p>也可以直接在群里 @管理员</p>
        <button class="btn-back" @click="$router.back()">返回</button>
      </div>
    </div>
  </div>
</template>

<script>
export default {}
</script>

<style scoped>
.service-page {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 20px;
}
.service-card {
  text-align: center;
  max-width: 400px;
  width: 100%;
}
.service-icon { font-size: 64px; margin-bottom: 12px; }
.service-card h1 { font-size: 22px; font-weight: 700; color: #fff; margin-bottom: 4px; }
.service-desc { font-size: 14px; color: rgba(255,255,255,0.35); margin-bottom: 28px; }
.service-channels { display: flex; flex-direction: column; gap: 10px; margin-bottom: 24px; }
.channel-btn {
  display: flex; align-items: center; justify-content: center; gap: 8px;
  padding: 14px; border-radius: 12px; color: #fff; font-size: 15px; font-weight: 600;
  text-decoration: none; transition: all .2s;
}
.channel-btn:hover { transform: translateY(-1px); opacity: .9; }
.channel-btn i { font-size: 20px; }
.service-footer p { font-size: 13px; color: rgba(255,255,255,0.2); margin-bottom: 12px; }
.btn-back {
  padding: 10px 28px; border-radius: 10px;
  background: rgba(255,255,255,0.04); border: 1px solid rgba(255,255,255,0.08);
  color: rgba(255,255,255,0.5); font-size: 14px; cursor: pointer;
}

/* ===== Mobile Responsive ===== */
@media (max-width: 768px) {
  .track-page, .result-page, .history-page, .profile-page, .cert-page { padding-bottom: 72px !important; }
  .page-wrap, .page-container, .container { padding: 0 12px 72px !important; }
}

</style>
