<template>
  <div class="profile-page">
    <!-- 顶部用户信息 -->
    <div class="profile-header">
      <div class="profile-avatar">
        <div class="avatar-circle" :style="{ background: avatarGradient }">{{ userInitial }}</div>
        <div class="user-info">
          <div class="username">{{ username || '用户' }}</div>
          <div class="user-tier"><span class="tag" :class="tierTag">{{ tierName }}</span></div>
        </div>
      </div>
      <div class="profile-stats">
        <div class="stat-item">
          <div class="stat-value">{{ creditBalance }}</div>
          <div class="stat-label">算力余额</div>
        </div>
        <div class="stat-item">
          <div class="stat-value">{{ worksCount }}</div>
          <div class="stat-label">作品数</div>
        </div>
        <div class="stat-item">
          <div class="stat-value">{{ ordersCount }}</div>
          <div class="stat-label">订单数</div>
        </div>
      </div>
    </div>

    <!-- 功能网格 -->
    <div class="profile-grid">
      <div class="grid-card" @click="$router.push('/projects')">
        <div class="card-icon">🎬</div>
        <div class="card-title">我的作品</div>
        <div class="card-desc">查看所有短剧项目</div>
        <div class="card-arrow">→</div>
      </div>
      <div class="grid-card" @click="$router.push('/media')">
        <div class="card-icon">🖼</div>
        <div class="card-title">素材库</div>
        <div class="card-desc">图片、音频、视频管理</div>
        <div class="card-arrow">→</div>
      </div>
      <div class="grid-card" @click="activeTab='orders'">
        <div class="card-icon">💰</div>
        <div class="card-title">钱包</div>
        <div class="card-desc">充值、订单、扣费明细</div>
        <div class="card-arrow">→</div>
      </div>
      <div class="grid-card" @click="$router.push('/api-keys')">
        <div class="card-icon">🔑</div>
        <div class="card-title">API Key</div>
        <div class="card-desc">配置第三方服务密钥</div>
        <div class="card-arrow">→</div>
      </div>
      <div class="grid-card" @click="$router.push('/history')">
        <div class="card-icon">📋</div>
        <div class="card-title">历史记录</div>
        <div class="card-desc">查看任务执行历史</div>
        <div class="card-arrow">→</div>
      </div>
      <div class="grid-card" @click="showChangePwd = true">
        <div class="card-icon">⚙️</div>
        <div class="card-title">安全设置</div>
        <div class="card-desc">修改密码、退出登录</div>
        <div class="card-arrow">→</div>
      </div>
    </div>

    <!-- 我的作品 -->
    <div class="works-section">
      <div class="section-header">
        <span class="section-title">我的作品</span>
        <div class="section-actions">
          <span class="filter-chip" :class="{active: filter==='all'}" @click="filter='all'">全部</span>
          <span class="filter-chip" :class="{active: filter==='completed'}" @click="filter='completed'">已完成</span>
          <span class="filter-chip" :class="{active: filter==='unfinished'}" @click="filter='unfinished'">未完成</span>
        </div>
      </div>
      <div class="works-grid">
        <div v-for="work in filteredWorks" :key="work.id" class="work-card">
          <div class="work-thumb" v-if="work.thumbnail">
            <img :src="work.thumbnail" />
          </div>
          <div class="work-thumb empty" v-else>🎬</div>
          <div class="work-info">
            <div class="work-title">{{ work.title }}</div>
            <div class="work-meta">{{ work.genre }} · {{ work.createdAt }}</div>
            <div class="work-status" :class="work.status">{{ statusText(work.status) }}</div>
          </div>
        </div>
        <div v-if="filteredWorks.length === 0" class="empty-works">
          <span>🎬</span>
          <p>暂无作品，快去创作吧！</p>
          <button class="btn-create" @click="$router.push('/create/pro')">开始创作</button>
        </div>
      </div>
    </div>

    <!-- 订单 -->
    <div class="orders-section" v-if="activeTab === 'orders'">
      <div class="section-header">
        <span class="section-title">订单记录</span>
      </div>
      <div class="orders-list">
        <div v-for="order in orders" :key="order.id" class="order-item">
          <div class="order-info">
            <div class="order-id">#{{ order.id }}</div>
            <div class="order-desc">{{ order.description }}</div>
            <div class="order-time">{{ order.createdAt }}</div>
          </div>
          <div class="order-amount" :class="order.status">{{ order.amount }}元</div>
        </div>
        <div v-if="orders.length === 0" class="empty-orders">
          <span>📋</span>
          <p>暂无订单记录</p>
        </div>
      </div>
    </div>

    <!-- 修改密码弹窗 -->
    <div class="modal-overlay" v-if="showChangePwd" @click.self="showChangePwd = false">
      <div class="modal">
        <h3>修改密码</h3>
        <div class="form-group">
          <label>旧密码</label>
          <input v-model="oldPwd" type="password" placeholder="请输入旧密码" />
        </div>
        <div class="form-group">
          <label>新密码</label>
          <input v-model="newPwd" type="password" placeholder="请输入新密码" />
        </div>
        <div class="form-group">
          <label>确认新密码</label>
          <input v-model="confirmPwd" type="password" placeholder="请再次输入新密码" />
        </div>
        <div class="modal-actions">
          <button class="btn-cancel" @click="showChangePwd = false">取消</button>
          <button class="btn-confirm" @click="changePassword">确认修改</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  data() {
    return {
      username: '',
      userTier: '',
      creditBalance: 0,
      worksCount: 0,
      ordersCount: 0,
      filter: 'all',
      activeTab: '',
      showChangePwd: false,
      oldPwd: '',
      newPwd: '',
      confirmPwd: '',
      works: [],
      orders: [],
    }
  },
  computed: {
    tierName() {
      return { pro: '专业会员', enterprise: '企业版' }[this.userTier] || '免费版'
    },
    tierTag() {
      return { pro: 'tag-pro', enterprise: 'tag-enterprise' }[this.userTier] || 'tag-free'
    },
    userInitial() {
      return (this.username || 'U').charAt(0).toUpperCase()
    },
    avatarGradient() {
      const gradients = [
        'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
        'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)',
        'linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)',
      ]
      const hash = (this.username || 'U').split('').reduce((a, b) => a + b.charCodeAt(0), 0)
      return gradients[hash % gradients.length]
    },
    filteredWorks() {
      if (this.filter === 'all') return this.works
      return this.works.filter(w => w.status === this.filter)
    },
  },
  mounted() {
    this.loadUserInfo()
    this.loadWorks()
    this.loadOrders()
  },
  methods: {
    async loadUserInfo() {
      try {
        const token = localStorage.getItem('token')
        if (!token) return
        const r = await fetch('/api/v1/auth/me', {
          headers: { 'Authorization': 'Bearer ' + token },
        }).then(r => r.json())
        if (r.success) {
          this.username = r.data.username || ''
          this.userTier = r.data.tier || ''
        }
        const b = await fetch('/api/v1/billing/balance', {
          headers: { 'Authorization': 'Bearer ' + token },
        }).then(r => r.json())
        if (b.success) this.creditBalance = b.data?.balance || 0
      } catch (e) {}
    },
    async loadWorks() {
      try {
        const token = localStorage.getItem('token')
        if (!token) return
        const r = await fetch('/api/v1/projects', {
          headers: { 'Authorization': 'Bearer ' + token },
        }).then(r => r.json())
        if (r.success) {
          this.works = r.data || []
          this.worksCount = this.works.length
        }
      } catch (e) {}
    },
    async loadOrders() {
      try {
        const token = localStorage.getItem('token')
        if (!token) return
        const r = await fetch('/api/v1/orders', {
          headers: { 'Authorization': 'Bearer ' + token },
        }).then(r => r.json())
        if (r.success) {
          this.orders = r.data || []
          this.ordersCount = this.orders.length
        }
      } catch (e) {}
    },
    statusText(status) {
      return { completed: '✅ 已完成', processing: '⏳ 进行中', failed: '❌ 失败' }[status] || status
    },
    async changePassword() {
      if (!this.oldPwd || !this.newPwd || !this.confirmPwd) {
        alert('请填写完整信息')
        return
      }
      if (this.newPwd !== this.confirmPwd) {
        alert('两次密码不一致')
        return
      }
      try {
        const token = localStorage.getItem('token')
        const r = await fetch('/api/v1/auth/change-password', {
          method: 'POST',
          headers: {
            'Authorization': 'Bearer ' + token,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ old_password: this.oldPwd, new_password: this.newPwd }),
        }).then(r => r.json())
        if (r.success) {
          alert('密码修改成功')
          this.showChangePwd = false
          this.oldPwd = ''
          this.newPwd = ''
          this.confirmPwd = ''
        } else {
          alert('修改失败: ' + (r.error || '未知错误'))
        }
      } catch (e) {
        alert('网络错误')
      }
    },
  },
}
</script>

<style scoped>
.profile-page {
  min-height: 100vh;
  background: var(--bg-primary, #0a0a0f);
  color: var(--text-primary, #f0f0f5);
  font-family: 'Inter', 'Noto Sans SC', -apple-system, sans-serif;
  padding: 24px;
}

/* Header */
.profile-header {
  display: flex; align-items: center; gap: 24px;
  padding: 24px; background: var(--bg-card, #1a1a2e);
  border: 1px solid var(--border, rgba(255,255,255,0.06));
  border-radius: 16px; margin-bottom: 24px;
}
.profile-avatar { display: flex; align-items: center; gap: 16px; }
.avatar-circle {
  width: 64px; height: 64px; border-radius: 50%;
  display: flex; align-items: center; justify-content: center;
  font-size: 24px; font-weight: 700; color: #fff;
}
.username { font-size: 20px; font-weight: 700; margin-bottom: 4px; }
.user-tier .tag {
  padding: 2px 10px; border-radius: 10px; font-size: 11px; font-weight: 600;
}
.tag-free { background: var(--bg-hover, rgba(255,255,255,0.04)); color: var(--text-muted, #6b6b80); }
.tag-pro { background: rgba(196,155,74,0.1); color: #c49b4a; border: 1px solid rgba(196,155,74,0.3); }
.tag-enterprise { background: rgba(99,102,241,0.1); color: #6366f1; border: 1px solid rgba(99,102,241,0.3); }

.profile-stats { display: flex; gap: 32px; margin-left: auto; }
.stat-item { text-align: center; }
.stat-value { font-size: 24px; font-weight: 700; color: var(--gold, #c49b4a); }
.stat-label { font-size: 12px; color: var(--text-muted, #6b6b80); margin-top: 4px; }

/* Grid */
.profile-grid {
  display: grid; grid-template-columns: repeat(auto-fill, minmax(180px, 1fr));
  gap: 16px; margin-bottom: 32px;
}
.grid-card {
  padding: 20px; background: var(--bg-card, #1a1a2e);
  border: 1px solid var(--border, rgba(255,255,255,0.06));
  border-radius: 12px; cursor: pointer; transition: all 0.2s;
}
.grid-card:hover { border-color: var(--accent, #6366f1); transform: translateY(-2px); }
.card-icon { font-size: 28px; margin-bottom: 12px; }
.card-title { font-size: 14px; font-weight: 600; margin-bottom: 4px; }
.card-desc { font-size: 12px; color: var(--text-muted, #6b6b80); }
.card-arrow { font-size: 16px; color: var(--text-muted, #6b6b80); margin-top: 8px; }

/* Works Section */
.section-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 16px; }
.section-title { font-size: 18px; font-weight: 700; }
.section-actions { display: flex; gap: 8px; }
.filter-chip {
  padding: 4px 12px; border-radius: 16px; font-size: 12px;
  background: var(--bg-hover, rgba(255,255,255,0.04));
  border: 1px solid var(--border, rgba(255,255,255,0.06));
  color: var(--text-muted, #6b6b80); cursor: pointer; transition: all 0.2s;
}
.filter-chip:hover, .filter-chip.active { background: var(--accent, #6366f1); color: #fff; border-color: var(--accent, #6366f1); }

.works-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(240px, 1fr)); gap: 16px; }
.work-card {
  background: var(--bg-card, #1a1a2e); border: 1px solid var(--border, rgba(255,255,255,0.06));
  border-radius: 12px; overflow: hidden; transition: all 0.2s;
}
.work-card:hover { border-color: var(--accent, #6366f1); }
.work-thumb { height: 120px; background: var(--bg-primary, #0a0a0f); display: flex; align-items: center; justify-content: center; font-size: 36px; }
.work-thumb img { width: 100%; height: 100%; object-fit: cover; }
.work-thumb.empty { color: var(--text-muted, #6b6b80); }
.work-info { padding: 12px; }
.work-title { font-size: 14px; font-weight: 600; margin-bottom: 4px; }
.work-meta { font-size: 12px; color: var(--text-muted, #6b6b80); margin-bottom: 4px; }
.work-status { font-size: 11px; padding: 2px 8px; border-radius: 8px; display: inline-block; }
.work-status.completed { background: rgba(52,211,153,0.1); color: #34d399; }
.work-status.processing { background: rgba(251,191,36,0.1); color: #fbbf24; }
.work-status.failed { background: rgba(248,113,113,0.1); color: #f87171; }

.empty-works {
  grid-column: 1 / -1; text-align: center; padding: 48px 20px; color: var(--text-muted, #6b6b80);
}
.empty-works span { font-size: 48px; display: block; margin-bottom: 12px; }
.btn-create {
  padding: 10px 24px; background: var(--accent, #6366f1); color: #fff;
  border: none; border-radius: 8px; font-size: 14px; font-weight: 600; cursor: pointer;
}

/* Orders */
.orders-list { display: flex; flex-direction: column; gap: 8px; }
.order-item {
  display: flex; justify-content: space-between; align-items: center;
  padding: 12px 16px; background: var(--bg-card, #1a1a2e);
  border: 1px solid var(--border, rgba(255,255,255,0.06));
  border-radius: 8px;
}
.order-info { flex: 1; }
.order-id { font-size: 13px; font-weight: 600; margin-bottom: 2px; }
.order-desc { font-size: 12px; color: var(--text-muted, #6b6b80); }
.order-time { font-size: 11px; color: var(--text-muted, #6b6b80); }
.order-amount { font-weight: 700; font-size: 14px; }
.order-amount.paid { color: #34d399; }
.order-amount.pending { color: #fbbf24; }

.empty-orders { text-align: center; padding: 48px 20px; color: var(--text-muted, #6b6b80); }
.empty-orders span { font-size: 48px; display: block; margin-bottom: 12px; }

/* Modal */
.modal-overlay {
  position: fixed; inset: 0; background: rgba(0,0,0,0.5);
  display: flex; align-items: center; justify-content: center; z-index: 100;
}
.modal {
  background: var(--bg-card, #1a1a2e); border: 1px solid var(--border, rgba(255,255,255,0.06));
  border-radius: 16px; padding: 24px; width: 400px; max-width: 90vw;
}
.modal h3 { font-size: 18px; font-weight: 700; margin-bottom: 20px; }
.form-group { margin-bottom: 16px; }
.form-group label { display: block; font-size: 13px; color: var(--text-secondary, #a0a0b8); margin-bottom: 6px; }
.form-group input {
  width: 100%; padding: 10px 14px; background: var(--bg-input, #16162a);
  border: 1px solid var(--border, rgba(255,255,255,0.06));
  border-radius: 8px; color: var(--text-primary, #f0f0f5); font-size: 14px; outline: none;
}
.form-group input:focus { border-color: var(--accent, #6366f1); }
.modal-actions { display: flex; gap: 12px; margin-top: 20px; }
.btn-cancel {
  flex: 1; padding: 10px; background: var(--bg-hover, rgba(255,255,255,0.04));
  border: 1px solid var(--border, rgba(255,255,255,0.06));
  border-radius: 8px; color: var(--text-secondary, #a0a0b8); font-size: 14px; cursor: pointer;
}
.btn-confirm {
  flex: 1; padding: 10px; background: var(--accent, #6366f1); color: #fff;
  border: none; border-radius: 8px; font-size: 14px; font-weight: 600; cursor: pointer;
}

@media (max-width: 768px) {
  .profile-header { flex-direction: column; text-align: center; }
  .profile-stats { margin-left: 0; }
  .profile-grid { grid-template-columns: repeat(2, 1fr); }
}
</style>
