<template>
  <div class="profile-page">
    <!-- 左：账号信息 -->
    <div class="profile-left">
      <div class="profile-card">
        <div class="avatar-section">
          <div class="avatar-large">{{ userInitial }}</div>
          <div class="avatar-info">
            <div class="avatar-name">{{ username || '用户' }}</div>
            <div class="avatar-tier"><span class="tag" :class="tierTag">{{ tierName }}</span></div>
          </div>
        </div>

        <div class="divider"></div>

        <div class="quota-section">
          <div class="quota-row">
            <span class="quota-label">今日生成</span>
            <div class="quota-bar-wrap">
              <div class="quota-bar" :style="{ width: genPercent + '%' }"></div>
            </div>
            <span class="quota-num">{{ dailyUsed }} / {{ dailyLimit }}</span>
          </div>
          <div class="quota-row">
            <span class="quota-label">视频解析</span>
            <div class="quota-bar-wrap">
              <div class="quota-bar orange" :style="{ width: analysisPercent + '%' }"></div>
            </div>
            <span class="quota-num">{{ analysisUsed }} / {{ analysisLimit }}</span>
          </div>
        </div>

        <div class="divider"></div>

        <div class="info-list">
          <div class="info-row"><span class="info-label">算力余额</span><span class="info-val">{{ creditBalance }}</span></div>
          <div class="info-row"><span class="info-label">会员到期</span><span class="info-val">{{ expireDate || '—' }}</span></div>
        </div>

        <button class="btn btn-primary btn-sm" style="width:100%;margin-top:12px" @click="$router.push('/membership')">
          管理会员
        </button>
      </div>
    </div>

    <!-- 中：订单记录 -->
    <div class="profile-center">
      <div class="section-title">订单记录</div>
      <div class="order-list">
        <div v-for="order in orders" :key="order.id" class="order-item">
          <div class="order-info">
            <div class="order-name">{{ order.name }}</div>
            <div class="order-meta">{{ order.created_at }}</div>
          </div>
          <div class="order-amount">{{ order.amount }}</div>
          <span class="tag" :class="order.status === 'paid' ? 'tag-green' : 'tag-muted'">{{ order.status_text }}</span>
        </div>
        <div v-if="orders.length === 0" class="empty-hint">暂无订单记录</div>
      </div>
    </div>

    <!-- 右：安全设置 -->
    <div class="profile-right">
      <div class="section-title">安全设置</div>
      <div class="settings-card">
        <div class="setting-row">
          <span class="setting-label">密码</span>
          <button class="btn btn-ghost btn-sm" @click="showChangePwd = true">修改</button>
        </div>
        <div class="setting-row">
          <span class="setting-label">消息通知</span>
          <button class="btn btn-ghost btn-sm">设置</button>
        </div>
        <div class="setting-row">
          <span class="setting-label">退出登录</span>
          <button class="btn btn-ghost btn-sm color-red" @click="logout">退出</button>
        </div>
      </div>

      <!-- 修改密码弹窗 -->
      <div class="modal-overlay" v-if="showChangePwd" @click.self="showChangePwd = false">
        <div class="modal-panel sm">
          <div class="modal-header">
            <span class="modal-title">修改密码</span>
            <button class="modal-close" @click="showChangePwd = false">✕</button>
          </div>
          <div class="modal-body">
            <div class="form-group">
              <label class="form-label">当前密码</label>
              <input class="input" type="password" v-model="pwdForm.old" />
            </div>
            <div class="form-group">
              <label class="form-label">新密码</label>
              <input class="input" type="password" v-model="pwdForm.new1" />
            </div>
            <div class="form-group">
              <label class="form-label">确认密码</label>
              <input class="input" type="password" v-model="pwdForm.new2" />
            </div>
          </div>
          <div class="modal-footer">
            <button class="btn btn-ghost" @click="showChangePwd = false">取消</button>
            <button class="btn btn-primary" @click="changePassword">保存</button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import axios from 'axios'

export default {
  name: 'ProfilePage',
  data() {
    return {
      token: '',
      username: '',
      userTier: '',
      creditBalance: 0,
      dailyUsed: 0,
      dailyLimit: 3,
      analysisUsed: 0,
      analysisLimit: 2,
      expireDate: '',
      orders: [],
      showChangePwd: false,
      pwdForm: { old: '', new1: '', new2: '' },
    }
  },
  computed: {
    userInitial() {
      return (this.username || 'U').charAt(0).toUpperCase()
    },
    tierName() {
      return { pro: '专业会员', enterprise: '企业版' }[this.userTier] || '免费版'
    },
    tierTag() {
      return { pro: 'tag-blue', enterprise: 'tag-orange' }[this.userTier] || 'tag-muted'
    },
    genPercent() {
      return this.dailyLimit ? Math.min(this.dailyUsed / this.dailyLimit * 100, 100) : 0
    },
    analysisPercent() {
      return this.analysisLimit ? Math.min(this.analysisUsed / this.analysisLimit * 100, 100) : 0
    },
  },
  methods: {
    authHeaders() {
      return { 'Authorization': '***' + this.token }
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
        const r = await fetch('/api/v1/billing/balance', { headers: this.authHeaders() }).then(r => r.json())
        if (r.success) this.creditBalance = r.data?.balance || 0
      } catch (e) {}
      try {
        const r = await fetch('/api/v1/billing/usage', { headers: this.authHeaders() }).then(r => r.json())
        if (r.success && r.data) {
          this.dailyUsed = r.data.daily_generations || 0
          this.analysisUsed = r.data.daily_analysis || 0
        }
      } catch (e) {}
      try {
        const r = await fetch('/api/v1/orders', { headers: this.authHeaders() }).then(r => r.json())
        if (r.success && Array.isArray(r.data)) {
          this.orders = r.data.map(o => ({
            id: o.id,
            name: o.name || o.title || '订单',
            created_at: o.created_at || o.createdAt || '--',
            amount: o.amount ? '¥' + o.amount : '--',
            status: o.status || 'unknown',
            status_text: { paid: '已支付', pending: '待支付', expired: '已过期' }[o.status] || o.status,
          }))
        }
      } catch (e) {}
    },
    async changePassword() {
      if (this.pwdForm.new1 !== this.pwdForm.new2) { alert('两次密码不一致'); return }
      try {
        await axios.post('/api/v1/auth/change-password', this.pwdForm, { headers: this.authHeaders() })
        alert('密码已修改')
        this.showChangePwd = false
      } catch (e) { alert('修改失败: ' + (e.message || e)) }
    },
    logout() {
      localStorage.removeItem('token')
      localStorage.removeItem('username')
      this.$router.push('/login')
    },
  },
  mounted() { this.loadData() },
}
</script>

<style scoped>
.profile-page {
  display: flex; gap: 16px;
  padding: 20px 24px;
  height: 100%;
}

.profile-left { width: 260px; flex-shrink: 0; }
.profile-center { flex: 1; }
.profile-right { width: 240px; flex-shrink: 0; }

.profile-card, .settings-card {
  background: var(--bg-surface);
  border: 1px solid var(--border-main);
  border-radius: var(--radius);
  padding: 16px;
}

.avatar-section {
  display: flex; align-items: center; gap: 12px;
}
.avatar-large {
  width: 48px; height: 48px; border-radius: 50%;
  background: var(--blue);
  color: #fff;
  display: flex; align-items: center; justify-content: center;
  font-size: 20px; font-weight: 700;
  flex-shrink: 0;
}
.avatar-name { font-weight: 600; font-size: 14px; }
.avatar-tier { margin-top: 4px; }

/* 额度条 */
.quota-section { display: flex; flex-direction: column; gap: 10px; }
.quota-row { display: flex; align-items: center; gap: 8px; }
.quota-label { font-size: 11px; color: var(--text-muted); width: 60px; flex-shrink: 0; }
.quota-bar-wrap { flex: 1; height: 5px; background: var(--bg-deep); border-radius: 3px; overflow: hidden; }
.quota-bar { height: 100%; background: var(--blue); border-radius: 3px; transition: width 0.5s; }
.quota-bar.orange { background: var(--orange); }
.quota-num { font-size: 11px; color: var(--text-secondary); width: 50px; text-align: right; }

.info-list { display: flex; flex-direction: column; gap: 6px; }
.info-row { display: flex; justify-content: space-between; font-size: 12px; }
.info-label { color: var(--text-muted); }
.info-val { color: var(--text-primary); font-weight: 500; }

/* 订单列表 */
.order-list { display: flex; flex-direction: column; gap: 2px; }
.order-item {
  display: flex; align-items: center;
  padding: 10px 12px;
  background: var(--bg-surface);
  border: 1px solid var(--border-main);
  border-radius: var(--radius-sm);
  gap: 12px;
}
.order-info { flex: 1; min-width: 0; }
.order-name { font-size: 12px; font-weight: 500; }
.order-meta { font-size: 10px; color: var(--text-muted); margin-top: 2px; }
.order-amount { font-size: 13px; font-weight: 700; color: var(--text-primary); flex-shrink: 0; }
.empty-hint { font-size: 12px; color: var(--text-muted); padding: 20px; text-align: center; }

/* 设置行 */
.settings-card { display: flex; flex-direction: column; gap: 4px; }
.setting-row {
  display: flex; justify-content: space-between; align-items: center;
  padding: 10px 0;
  border-bottom: 1px solid var(--border-main);
}
.setting-row:last-child { border-bottom: none; }
.setting-label { font-size: 12px; }
.color-red { color: var(--red); }

@media (max-width: 768px) {
  .profile-page { flex-direction: column; }
  .profile-left, .profile-right { width: 100%; }
}
</style>
