<template>
  <div class="membership-page">
    <!-- ===== 标题区 ===== -->
    <div class="member-header">
      <div class="member-title">工作台功能权限管理</div>
      <div class="member-subtitle">升级权限以解锁完整导出、批量生成功能</div>
    </div>

    <!-- ===== 当前状态 ===== -->
    <div class="current-status" v-if="token">
      <div class="status-row">
        <span class="status-label">当前权限：</span>
        <span class="status-value" :class="'tier-' + (userTier || 'free')">
          {{ tierName }}
        </span>
      </div>
      <div class="status-row">
        <span class="status-label">今日生成：</span>
        <span class="status-value">{{ dailyUsed }} / {{ dailyLimit }}</span>
      </div>
      <div class="status-row">
        <span class="status-label">视频解析：</span>
        <span class="status-value">{{ analysisUsed }} / {{ analysisLimit }}</span>
      </div>
    </div>

    <!-- ===== 套餐对比 ===== -->
    <div class="plans-grid">
      <!-- 免费版 -->
      <div class="plan-card">
        <div class="plan-header">
          <div class="plan-name">基础工作台</div>
          <div class="plan-price">免费</div>
          <div class="plan-desc">游客默认权限</div>
        </div>
        <div class="plan-body">
          <div class="plan-feature disabled">
            <span>📝 每日剧本生成</span>
            <span class="feat-limit">3 次上限</span>
          </div>
          <div class="plan-feature disabled">
            <span>🔍 爆款视频解析</span>
            <span class="feat-limit">每日 2 次</span>
          </div>
          <div class="plan-feature disabled">
            <span>📄 完整分镜导出</span>
            <span class="feat-lock">🔒</span>
          </div>
          <div class="plan-feature disabled">
            <span>📦 批量生成</span>
            <span class="feat-lock">🔒</span>
          </div>
          <div class="plan-feature disabled">
            <span>✓ 合规检测</span>
            <span class="feat-check">✓</span>
          </div>
        </div>
        <div class="plan-footer">
          <span class="plan-current" v-if="(!userTier || userTier === 'free') && token">当前权限</span>
          <span class="plan-current" v-else-if="!token">登录后使用</span>
        </div>
      </div>

      <!-- 专业会员 (主推) -->
      <div class="plan-card featured">
        <div class="plan-badge">推荐</div>
        <div class="plan-header">
          <div class="plan-name">专业会员</div>
          <div class="plan-price">¥99<span class="price-unit">/月</span></div>
          <div class="plan-desc">工作室完整版 · 解锁全部创作功能</div>
        </div>
        <div class="plan-body">
          <div class="plan-feature">
            <span>📝 剧本生成</span>
            <span class="feat-unlock">无限次</span>
          </div>
          <div class="plan-feature">
            <span>🔍 视频镜头拆解</span>
            <span class="feat-unlock">无限次</span>
          </div>
          <div class="plan-feature">
            <span>📄 Word/分镜表导出</span>
            <span class="feat-unlock">✓ 完整导出</span>
          </div>
          <div class="plan-feature">
            <span>📦 批量多任务生成</span>
            <span class="feat-unlock">✓ 支持</span>
          </div>
          <div class="plan-feature">
            <span>✓ 合规自动筛查</span>
            <span class="feat-check">优先执行</span>
          </div>
          <div class="plan-feature">
            <span>💾 无限素材库存储</span>
            <span class="feat-unlock">✓</span>
          </div>
        </div>
        <div class="plan-footer">
          <button class="btn btn-primary btn-lg plan-btn"
            :disabled="userTier === 'pro'"
            @click="upgrade('pro')">
            {{ userTier === 'pro' ? '已开通' : '升级专业权限' }}
          </button>
        </div>
      </div>

      <!-- 企业版 -->
      <div class="plan-card">
        <div class="plan-header">
          <div class="plan-name">企业商用版</div>
          <div class="plan-price">¥599<span class="price-unit">/月</span></div>
          <div class="plan-desc">MCN · 品牌 · 批量投产</div>
        </div>
        <div class="plan-body">
          <div class="plan-feature">
            <span>包含专业版全部功能</span>
            <span class="feat-unlock">✓</span>
          </div>
          <div class="plan-feature">
            <span>👥 多账号协同工作台</span>
            <span class="feat-unlock">✓</span>
          </div>
          <div class="plan-feature">
            <span>📦 批量打包导出</span>
            <span class="feat-unlock">✓</span>
          </div>
          <div class="plan-feature">
            <span>🛡 商用文案合规保障</span>
            <span class="feat-unlock">✓</span>
          </div>
          <div class="plan-feature">
            <span>💬 专属客服</span>
            <span class="feat-unlock">✓</span>
          </div>
        </div>
        <div class="plan-footer">
          <button class="btn btn-ghost btn-lg plan-btn"
            @click="upgrade('enterprise')">
            咨询企业定制
          </button>
        </div>
      </div>
    </div>

    <!-- ===== 权限对比轨道 ===== -->
    <div class="compare-track">
      <div class="section-title">权限覆盖对比</div>
      <div class="track-visual">
        <div class="track-row free">
          <span class="track-label">免费版</span>
          <div class="track-bar" style="width:25%"></div>
        </div>
        <div class="track-row pro">
          <span class="track-label">专业版</span>
          <div class="track-bar" style="width:100%;background:var(--blue)"></div>
        </div>
        <div class="track-row enterprise">
          <span class="track-label">企业版</span>
          <div class="track-bar" style="width:100%;background:var(--orange)"></div>
        </div>
      </div>
    </div>

    <!-- ===== 适配平台提示 ===== -->
    <div class="compliance-note">
      适配红果、抖音、快手全平台短剧投产标准
    </div>
  </div>
</template>

<script>
export default {
  name: 'MembershipPage',
  data() {
    return {
      token: '',
      username: '',
      userTier: '',
      dailyUsed: 0,
      dailyLimit: 3,
      analysisUsed: 0,
      analysisLimit: 2,
    }
  },
  computed: {
    tierName() {
      switch(this.userTier) {
        case 'pro': return '专业会员'
        case 'enterprise': return '企业版'
        default: return '免费版'
      }
    },
  },
  methods: {
    authHeaders() {
      return { 'Authorization': 'Bearer ' + this.token }
    },
    async loadData() {
      this.token = localStorage.getItem('token') || ''
      if (!this.token) return
      try {
        const r = await fetch('/api/v1/auth/me', { headers: this.authHeaders() }).then(r => r.json())
        if (r.success) {
          this.username = r.data.username || ''
          this.userTier = r.data.tier || ''
        }
      } catch (e) {}
      try {
        const r = await fetch('/api/v1/billing/usage', { headers: this.authHeaders() }).then(r => r.json())
        if (r.success && r.data) {
          this.dailyUsed = r.data.daily_generations || 0
          this.analysisUsed = r.data.daily_analysis || 0
        }
      } catch (e) {}
    },
    upgrade(tier) {
      if (!this.token) {
        this.$router.push('/login')
        return
      }
      if (tier === 'enterprise') {
        window.open('https://api.mzsh.top/api/memory/cs/chat?msg=咨询企业版套餐', '_blank')
        return
      }
      // pro - 调支付宝创建支付
      this.upgradePro()
    },
    async upgradePro() {
      try {
        const r = await fetch('/api/v1/alipay/create', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': 'Bearer ' + this.token
          },
          body: JSON.stringify({ product_id: 'vip_month', quantity: 1 })
        })
        const data = await r.json()
        if (data.success && data.data?.pay_url) {
          window.location.href = data.data.pay_url
        } else {
          alert('创建支付失败: ' + (data.error || '未知错误'))
        }
      } catch (e) {
        alert('请求失败: ' + e.message)
      }
    },
  },
  mounted() { this.loadData() },
}
</script>

<style scoped>
.membership-page {
  padding: 24px 28px;
  max-width: 960px;
  margin: 0 auto;
}

.member-header { margin-bottom: 24px; }
.member-title { font-size: 18px; font-weight: 700; color: var(--text-primary); }
.member-subtitle { font-size: 12px; color: var(--text-muted); margin-top: 4px; }

/* 当前状态 */
.current-status {
  display: flex; gap: 24px;
  padding: 14px 18px;
  background: var(--bg-surface);
  border: 1px solid var(--border-main);
  border-radius: var(--radius);
  margin-bottom: 24px;
}
.status-row { font-size: 12px; }
.status-label { color: var(--text-muted); }
.status-value { color: var(--text-primary); font-weight: 600; margin-left: 4px; }

/* 套餐三栏 */
.plans-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 14px;
  margin-bottom: 24px;
}
.plan-card {
  background: var(--bg-surface);
  border: 1px solid var(--border-main);
  border-radius: var(--radius);
  display: flex; flex-direction: column;
  overflow: hidden;
  transition: border-color 0.2s;
}
.plan-card.featured {
  border-color: var(--blue);
  box-shadow: 0 0 0 1px var(--blue-glow);
  position: relative;
}
.plan-badge {
  position: absolute; top: -1px; right: 20px;
  padding: 3px 12px;
  background: var(--blue);
  color: #fff;
  font-size: 11px; font-weight: 600;
  border-radius: 0 0 var(--radius) var(--radius);
}
.plan-header {
  padding: 20px 18px 14px;
  text-align: center;
  border-bottom: 1px solid var(--border-main);
}
.plan-name { font-size: 15px; font-weight: 700; }
.plan-price { font-size: 24px; font-weight: 800; margin: 8px 0; color: var(--text-primary); }
.price-unit { font-size: 12px; font-weight: 400; color: var(--text-muted); }
.plan-desc { font-size: 11px; color: var(--text-muted); }

.plan-body { padding: 14px 18px; flex: 1; }
.plan-feature {
  display: flex; justify-content: space-between; align-items: center;
  padding: 7px 0;
  font-size: 12px; color: var(--text-secondary);
  border-bottom: 1px solid var(--border-main);
}
.plan-feature:last-child { border-bottom: none; }
.plan-feature.disabled { color: var(--text-muted); }
.feat-limit { font-size: 11px; color: var(--text-muted); }
.feat-lock { font-size: 12px; opacity: 0.4; }
.feat-check { color: var(--green); }
.feat-unlock { color: var(--green); font-size: 11px; }

.plan-footer { padding: 14px 18px; }
.plan-btn { width: 100%; }
.plan-current { font-size: 11px; color: var(--text-muted); text-align: center; display: block; }

/* 权限对比轨道 */
.compare-track {
  margin-bottom: 24px;
}
.track-visual {
  display: flex; flex-direction: column; gap: 8px;
  padding: 14px;
  background: var(--bg-surface);
  border: 1px solid var(--border-main);
  border-radius: var(--radius);
}
.track-row {
  display: flex; align-items: center; gap: 12px;
}
.track-label {
  width: 60px; font-size: 11px; color: var(--text-muted);
  flex-shrink: 0;
}
.track-bar {
  height: 8px; border-radius: 4px;
  background: var(--border-light);
  transition: width 0.5s var(--ease);
}

.compliance-note {
  text-align: center;
  font-size: 11px;
  color: var(--text-muted);
  padding: 12px;
  border-top: 1px solid var(--border-main);
}

@media (max-width: 768px) {
  .plans-grid { grid-template-columns: 1fr; }
  .current-status { flex-direction: column; gap: 8px; }
}
</style>
