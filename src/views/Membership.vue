<template>
  <div class="membership-page">
    <!-- 头部 -->
    <div class="membership-hero">
      <div class="hero-content">
        <h1>💎 会员权益</h1>
        <p class="hero-desc">解锁全部功能，享受专业级 AI 短剧创作体验</p>
      </div>
    </div>

    <!-- 套餐选择 -->
    <div class="plans-section">
      <div class="plan-card" :class="{ 'plan-highlight': plan === 'standard' }" @click="plan = 'standard'">
        <div class="plan-badge" v-if="plan === 'standard'">🔥 推荐</div>
        <div class="plan-icon">📦</div>
        <h3 class="plan-name">标准版</h3>
        <div class="plan-price">¥99<span>/月</span></div>
        <ul class="plan-features">
          <li>✅ 每月 100 次剧本创作</li>
          <li>✅ 角色肖像生成</li>
          <li>✅ 分镜自动生成</li>
          <li>✅ 基础视频生成</li>
          <li>❌ 高级视频合成</li>
          <li>❌ API 调用</li>
        </ul>
        <button class="plan-btn" :class="{ active: plan === 'standard' }" @click="subscribe('standard')">选择标准版</button>
      </div>

      <div class="plan-card" :class="{ 'plan-highlight': plan === 'pro' }" @click="plan = 'pro'">
        <div class="plan-badge pro">👑 专业版</div>
        <div class="plan-icon">🎬</div>
        <h3 class="plan-name">专业版</h3>
        <div class="plan-price">¥299<span>/月</span></div>
        <ul class="plan-features">
          <li>✅ 无限次剧本创作</li>
          <li>✅ 角色肖像生成</li>
          <li>✅ 分镜自动生成</li>
          <li>✅ 高级视频生成</li>
          <li>✅ 视频合成</li>
          <li>❌ API 调用</li>
        </ul>
        <button class="plan-btn" :class="{ active: plan === 'pro' }" @click="subscribe('pro')">选择专业版</button>
      </div>

      <div class="plan-card" :class="{ 'plan-highlight': plan === 'enterprise' }" @click="plan = 'enterprise'">
        <div class="plan-badge enterprise">🏢 企业版</div>
        <div class="plan-icon">🚀</div>
        <h3 class="plan-name">企业版</h3>
        <div class="plan-price">¥999<span>/月</span></div>
        <ul class="plan-features">
          <li>✅ 无限次所有功能</li>
          <li>✅ 优先客服支持</li>
          <li>✅ API 调用</li>
          <li>✅ 自定义模型</li>
          <li>✅ 团队协作</li>
          <li>✅ 私有部署</li>
        </ul>
        <button class="plan-btn" :class="{ active: plan === 'enterprise' }" @click="subscribe('enterprise')">联系销售</button>
      </div>
    </div>

    <!-- 功能对比 -->
    <div class="comparison-section">
      <h2 class="section-title">功能对比</h2>
      <div class="comparison-table">
        <div class="table-row header">
          <div class="cell feature">功能</div>
          <div class="cell">标准版</div>
          <div class="cell">专业版</div>
          <div class="cell">企业版</div>
        </div>
        <div class="table-row" v-for="(row, i) in comparisonRows" :key="i">
          <div class="cell feature">{{ row.feature }}</div>
          <div class="cell" :class="row.standard">{{ row.standard ? '✅' : '❌' }}</div>
          <div class="cell" :class="row.pro">{{ row.pro ? '✅' : '❌' }}</div>
          <div class="cell" :class="row.enterprise">{{ row.enterprise ? '✅' : '❌' }}</div>
        </div>
      </div>
    </div>

    <!-- FAQ -->
    <div class="faq-section">
      <h2 class="section-title">常见问题</h2>
      <div class="faq-list">
        <details class="faq-item" v-for="faq in faqs" :key="faq.q">
          <summary class="faq-question">{{ faq.q }}</summary>
          <div class="faq-answer">{{ faq.a }}</div>
        </details>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  data() {
    return {
      plan: 'pro',
      comparisonRows: [
        { feature: '剧本创作次数', standard: true, pro: true, enterprise: true },
        { feature: '角色肖像生成', standard: true, pro: true, enterprise: true },
        { feature: '分镜自动生成', standard: true, pro: true, enterprise: true },
        { feature: '基础视频生成', standard: true, pro: true, enterprise: true },
        { feature: '高级视频生成', standard: false, pro: true, enterprise: true },
        { feature: '视频合成', standard: false, pro: true, enterprise: true },
        { feature: 'API 调用', standard: false, pro: false, enterprise: true },
        { feature: '自定义模型', standard: false, pro: false, enterprise: true },
        { feature: '团队协作', standard: false, pro: false, enterprise: true },
        { feature: '私有部署', standard: false, pro: false, enterprise: true },
      ],
      faqs: [
        { q: '如何升级或降级套餐？', a: '您可以在会员中心随时切换套餐。升级即时生效，降级在下个计费周期生效。' },
        { q: '支持哪些支付方式？', a: '我们支持微信支付、支付宝、银行卡等多种支付方式。' },
        { q: '可以退款吗？', a: '开通后7天内，如未使用超过10次功能，可申请全额退款。' },
        { q: 'API 调用是什么？', a: 'API 调用允许您通过程序接口调用我们的 AI 服务，适合开发者集成到自己的应用中。' },
      ],
    }
  },
  methods: {
    async subscribe(plan) {
      try {
        const token = localStorage.getItem('token')
        const resp = await fetch('/api/v1/membership/subscribe', {
          method: 'POST',
          headers: {
            'Authorization': 'Bearer ' + token,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ plan }),
        }).then(r => r.json())
        
        if (resp.success) {
          alert('订阅成功！请前往支付页面完成付款。')
          // TODO: 跳转到支付页面
        } else {
          alert('订阅失败: ' + (resp.error || '未知错误'))
        }
      } catch (e) {
        alert('网络错误，请重试')
      }
    },
  },
}
</script>

<style scoped>
.membership-page {
  min-height: 100vh;
  background: var(--bg-primary, #0a0a0f);
  color: var(--text-primary, #f0f0f5);
  font-family: 'Inter', 'Noto Sans SC', -apple-system, sans-serif;
}

/* Hero */
.membership-hero {
  padding: 60px 20px;
  text-align: center;
  background: linear-gradient(135deg, rgba(99,102,241,0.1) 0%, rgba(139,92,246,0.05) 100%);
}
.hero-content h1 { font-size: 36px; font-weight: 800; margin-bottom: 12px; }
.hero-desc { font-size: 16px; color: var(--text-secondary, #a0a0b8); }

/* Plans */
.plans-section {
  display: flex; gap: 20px; justify-content: center; flex-wrap: wrap;
  padding: 40px 20px; max-width: 1200px; margin: 0 auto;
}
.plan-card {
  width: 280px; padding: 32px 24px; background: var(--bg-card, #1a1a2e);
  border: 1px solid var(--border, rgba(255,255,255,0.06));
  border-radius: 20px; text-align: center; cursor: pointer;
  transition: all 0.3s; position: relative;
}
.plan-card:hover { transform: translateY(-4px); border-color: var(--accent, #6366f1); }
.plan-highlight { border-color: var(--accent, #6366f1); box-shadow: 0 0 30px rgba(99,102,241,0.2); }
.plan-badge {
  position: absolute; top: 12px; right: 12px; padding: 4px 12px;
  background: var(--accent, #6366f1); color: #fff; border-radius: 12px;
  font-size: 11px; font-weight: 600;
}
.plan-badge.pro { background: linear-gradient(135deg, #c49b4a, #d4b35a); }
.plan-badge.enterprise { background: linear-gradient(135deg, #6366f1, #8b5cf6); }
.plan-icon { font-size: 40px; margin-bottom: 16px; }
.plan-name { font-size: 20px; font-weight: 700; margin-bottom: 8px; }
.plan-price { font-size: 32px; font-weight: 800; color: var(--accent, #6366f1); margin-bottom: 20px; }
.plan-price span { font-size: 14px; color: var(--text-muted, #6b6b80); }
.plan-features { list-style: none; padding: 0; margin-bottom: 24px; text-align: left; }
.plan-features li { padding: 6px 0; font-size: 13px; color: var(--text-secondary, #a0a0b8); }
.plan-btn {
  width: 100%; padding: 12px; border-radius: 12px; font-size: 14px; font-weight: 600;
  cursor: pointer; border: 2px solid var(--border, rgba(255,255,255,0.06));
  background: transparent; color: var(--text-secondary, #a0a0b8); transition: all 0.2s;
}
.plan-btn:hover { border-color: var(--accent, #6366f1); color: var(--accent, #6366f1); }
.plan-btn.active { background: var(--accent, #6366f1); color: #fff; border-color: var(--accent, #6366f1); }

/* Comparison */
.comparison-section { padding: 40px 20px; max-width: 800px; margin: 0 auto; }
.section-title { font-size: 24px; font-weight: 700; text-align: center; margin-bottom: 24px; }
.comparison-table { border: 1px solid var(--border, rgba(255,255,255,0.06)); border-radius: 12px; overflow: hidden; }
.table-row { display: flex; border-bottom: 1px solid var(--border, rgba(255,255,255,0.06)); }
.table-row:last-child { border-bottom: none; }
.table-row.header { background: var(--bg-surface, #12121a); font-weight: 600; }
.cell { flex: 1; padding: 12px 16px; font-size: 13px; color: var(--text-secondary, #a0a0b8); }
.cell.feature { font-weight: 600; color: var(--text-primary, #f0f0f5); background: var(--bg-surface, #12121a); }
.cell.true { color: #34d399; }
.cell.false { color: #f87171; }

/* FAQ */
.faq-section { padding: 40px 20px; max-width: 800px; margin: 0 auto; }
.faq-list { display: flex; flex-direction: column; gap: 8px; }
.faq-item {
  background: var(--bg-card, #1a1a2e); border: 1px solid var(--border, rgba(255,255,255,0.06));
  border-radius: 12px; overflow: hidden;
}
.faq-question {
  padding: 16px 20px; font-size: 14px; font-weight: 600; cursor: pointer;
  display: flex; justify-content: space-between; align-items: center;
}
.faq-question::after { content: '+'; font-size: 18px; color: var(--text-muted, #6b6b80); }
details[open] .faq-question::after { content: '-'; }
.faq-answer { padding: 0 20px 16px; font-size: 13px; color: var(--text-secondary, #a0a0b8); line-height: 1.6; }

@media (max-width: 768px) {
  .plans-section { flex-direction: column; align-items: center; }
  .plan-card { width: 100%; max-width: 320px; }
  .comparison-table { font-size: 12px; }
  .cell { padding: 8px; }
}
</style>
