<template>
  <div class="profile-page">
    <!-- 顶部用户信息卡片 -->
    <div class="profile-header">
      <div class="profile-avatar">
        <div class="avatar-circle">{{ userInitial }}</div>
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
          <button class="btn btn-primary btn-sm" @click="$router.push('/create')" style="margin-left:12px">+ 新建</button>
        </div>
      </div>
      <div class="works-list">
        <div v-for="w in filteredWorks" :key="w.id" class="work-card">
          <div class="work-thumb">🎬</div>
          <div class="work-info">
            <div class="work-name">{{ w.title || '未命名' }}</div>
            <div class="work-meta">{{ w.createdAt || '--' }}</div>
          </div>
          <div class="work-actions">
            <span class="work-status" :class="w.displayStatus">{{ w.statusText }}</span>
            <button class="btn btn-ghost btn-sm" @click.stop="$router.push('/track/'+w.id)" v-if="isCompleted(w)">查看</button>
            <button class="btn btn-primary btn-sm" @click.stop="continueWork(w)" v-else>继续</button>
            <button class="btn btn-ghost btn-sm color-danger" @click.stop="confirmDelete(w)">删除</button>
          </div>
        </div>
        <div v-if="filteredWorks.length === 0" class="empty-hint">暂无作品</div>
      </div>
    </div>

    <!-- 订单记录 -->
    <div class="orders-section" v-if="activeTab === 'orders'">
      <div class="section-header">
        <span class="section-title">充值订单</span>
        <button class="btn btn-primary btn-sm" @click="$router.push('/membership')">去充值</button>
      </div>
      <div class="orders-table-wrap">
        <table class="orders-table">
          <thead>
            <tr>
              <th>订单号</th>
              <th>类型</th>
              <th>扣款金额</th>
              <th>时长</th>
              <th>状态</th>
              <th>创建时间</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="o in orders" :key="o.id">
              <td class="order-id">{{ o.order_no || o.id }}</td>
              <td>{{ o.type_text || o.name || '充值' }}</td>
              <td class="order-amount">{{ o.amount }}</td>
              <td>{{ o.duration || '--' }}</td>
              <td>
                <span class="tag" :class="o.status_class || 'tag-muted'">{{ o.status_text || o.status || '未知' }}</span>
              </td>
              <td>{{ o.created_at || '--' }}</td>
            </tr>
            <tr v-if="orders.length === 0">
              <td colspan="6" class="empty-row">暂无订单记录</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <!-- 删除确认弹窗 -->
    <div class="modal-overlay" v-if="showDeleteConfirm" @click.self="cancelDelete">
      <div class="modal-panel sm">
        <div class="modal-header">
          <span class="modal-title">确认删除</span>
          <button class="modal-close" @click="cancelDelete">✕</button>
        </div>
        <div class="modal-body">
          <p>确定删除《{{ deleteTarget?.title || '未命名' }}》吗？</p>
          <p class="hint">此操作不可撤销</p>
        </div>
        <div class="modal-footer">
          <button class="btn btn-ghost" @click="cancelDelete">取消</button>
          <button class="btn btn-danger" @click="deleteWork">确认删除</button>
        </div>
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
            <input class="input" type="password" v-model="pwdForm.old" placeholder="请输入当前密码" />
          </div>
          <div class="form-group">
            <label class="form-label">新密码</label>
            <input class="input" type="password" v-model="pwdForm.new1" placeholder="请输入新密码" />
          </div>
          <div class="form-group">
            <label class="form-label">确认密码</label>
            <input class="input" type="password" v-model="pwdForm.new2" placeholder="请再次输入新密码" />
          </div>
        </div>
        <div class="modal-footer">
          <button class="btn btn-ghost" @click="showChangePwd = false">取消</button>
          <button class="btn btn-primary" @click="changePassword">保存</button>
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
      worksCount: 0,
      ordersCount: 0,
      filter: 'all',
      activeTab: null,
      deleteTarget: null,
      showDeleteConfirm: false,
      showChangePwd: false,
      pwdForm: { old: '', new1: '', new2: '' },
      recentWorks: [],
      orders: [],
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
    filteredWorks() {
      if (this.filter === 'all') return this.recentWorks
      if (this.filter === 'completed') return this.recentWorks.filter(w => w.displayStatus === 'completed')
      if (this.filter === 'unfinished') return this.recentWorks.filter(w => w.displayStatus !== 'completed')
      return this.recentWorks
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
        const r = await fetch('/api/v1/billing/balance', { headers: this.authHeaders() }).then(r => r.json())
        if (r.success) this.creditBalance = r.data?.balance || 0
      } catch (e) {}
      
      try {
        const r = await fetch('/api/v1/projects', { headers: this.authHeaders() }).then(r => r.json())
        if (r.success && r.projects) {
          this.worksCount = r.projects.length
          this.recentWorks = r.projects.map(p => ({
            id: p.id,
            v2_pipeline_id: p.v2_pipeline_id || p.pipeline_id || '',
            title: p.title,
            createdAt: p.created ? new Date(p.created * 1000).toLocaleDateString('zh-CN') : '--',
            statusText: { active: '进行中', processing: '进行中', completed: '已完成', draft: '草稿' }[p.status] || p.status,
            displayStatus: p.status || 'active',
          }))
        }
      } catch (e) {}
      
      try {
        const r = await fetch('/api/v1/orders', { headers: this.authHeaders() }).then(r => r.json())
        if (r.success && Array.isArray(r.data)) {
          this.orders = r.data.map(o => ({
            id: o.id,
            order_no: o.order_no || o.no || o.id,
            name: o.name || o.title || '充值',
            type_text: o.type_text || '充值订单',
            amount: o.amount ? '¥' + o.amount : '--',
            duration: o.duration ? o.duration + '秒' : '--',
            status: o.status || 'unknown',
            status_text: { paid: '已支付', pending: '待支付', expired: '已过期', refunded: '已退款' }[o.status] || o.status,
            status_class: o.status === 'paid' ? 'tag-green' : 'tag-muted',
            created_at: o.created_at || o.createdAt || '--',
          }))
          this.ordersCount = r.data.length
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
    isCompleted(w) {
      return w.displayStatus === 'completed'
    },
    continueWork(w) {
      // V2 项目跳到 StudioPage，V1 项目跳到 TrackPage
      if (w.v2_pipeline_id) {
        this.$router.push('/create/pro?project_id=' + w.id + '&v2_pipeline_id=' + w.v2_pipeline_id)
      } else {
        this.$router.push('/track/' + w.id)
      }
    },
    confirmDelete(w) {
      this.deleteTarget = w
      this.showDeleteConfirm = true
    },
    cancelDelete() {
      this.showDeleteConfirm = false
      this.deleteTarget = null
    },
    async deleteWork() {
      if (!this.deleteTarget) return
      try {
        const r = await fetch('/api/v1/projects/' + this.deleteTarget.id, {
          method: 'DELETE',
          headers: this.authHeaders()
        }).then(r => r.json())
        if (r.success) {
          this.recentWorks = this.recentWorks.filter(w => w.id !== this.deleteTarget.id)
          alert('删除成功')
        } else {
          alert('删除失败: ' + (r.message || '未知错误'))
        }
      } catch (e) {
        alert('删除失败')
      }
      this.showDeleteConfirm = false
      this.deleteTarget = null
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
  padding: 24px;
  max-width: 1200px;
  margin: 0 auto;
}

/* 顶部用户信息 */
.profile-header {
  background: var(--bg-surface);
  border: 1px solid var(--border-main);
  border-radius: var(--radius);
  padding: 24px;
  margin-bottom: 24px;
}

.profile-avatar {
  display: flex;
  align-items: center;
  gap: 16px;
  margin-bottom: 20px;
}

.avatar-circle {
  width: 64px;
  height: 64px;
  border-radius: 50%;
  background: var(--blue);
  color: #fff;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 28px;
  font-weight: 700;
  flex-shrink: 0;
}

.user-info {
  flex: 1;
}

.username {
  font-size: 20px;
  font-weight: 600;
  color: var(--text-primary);
  margin-bottom: 4px;
}

.profile-stats {
  display: flex;
  gap: 32px;
}

.stat-item {
  text-align: center;
}

.stat-value {
  font-size: 24px;
  font-weight: 700;
  color: var(--text-primary);
  margin-bottom: 4px;
}

.stat-label {
  font-size: 12px;
  color: var(--text-muted);
}

/* 功能网格 */
.profile-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
  gap: 16px;
  margin-bottom: 32px;
}

.grid-card {
  background: var(--bg-surface);
  border: 1px solid var(--border-main);
  border-radius: var(--radius);
  padding: 24px;
  cursor: pointer;
  transition: all 0.2s;
  position: relative;
}

.grid-card:hover {
  border-color: var(--blue);
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(41, 123, 255, 0.15);
}

.card-icon {
  font-size: 32px;
  margin-bottom: 12px;
}

.card-title {
  font-size: 16px;
  font-weight: 600;
  color: var(--text-primary);
  margin-bottom: 8px;
}

.card-desc {
  font-size: 12px;
  color: var(--text-muted);
  margin-bottom: 12px;
}

.card-arrow {
  position: absolute;
  top: 24px;
  right: 24px;
  font-size: 18px;
  color: var(--text-muted);
}

/* 作品列表 */
.works-section {
  background: var(--bg-surface);
  border: 1px solid var(--border-main);
  border-radius: var(--radius);
  padding: 20px;
  margin-bottom: 24px;
}

.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
}

.section-title {
  font-size: 16px;
  font-weight: 600;
  color: var(--text-primary);
}

.section-actions {
  display: flex;
  align-items: center;
  gap: 8px;
}

.filter-chip {
  font-size: 12px;
  padding: 4px 12px;
  border-radius: 12px;
  background: var(--bg-input);
  color: var(--text-muted);
  cursor: pointer;
  transition: all 0.2s;
}

.filter-chip:hover, .filter-chip.active {
  background: rgba(41, 123, 255, 0.1);
  color: var(--blue);
}

.works-list {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.work-card {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px;
  border-radius: var(--radius-sm);
  transition: background 0.2s;
}

.work-card:hover {
  background: var(--bg-hover);
}

.work-thumb {
  width: 40px;
  height: 40px;
  border-radius: var(--radius-sm);
  background: var(--bg-input);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 20px;
  flex-shrink: 0;
}

.work-info {
  flex: 1;
  min-width: 0;
}

.work-name {
  font-size: 14px;
  font-weight: 500;
  color: var(--text-primary);
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.work-meta {
  font-size: 12px;
  color: var(--text-muted);
  margin-top: 2px;
}

.work-actions {
  display: flex;
  align-items: center;
  gap: 8px;
  flex-shrink: 0;
}

.work-status {
  font-size: 12px;
  padding: 2px 8px;
  border-radius: 12px;
}

.work-status.completed {
  background: rgba(74, 222, 128, 0.1);
  color: #4ade80;
}

.work-status.active, .work-status.processing {
  background: rgba(41, 123, 255, 0.1);
  color: var(--blue);
}

.work-status.draft {
  background: rgba(245, 158, 11, 0.1);
  color: #f59e0b;
}

.color-danger {
  color: var(--danger);
}

/* 订单表格 */
.orders-section {
  background: var(--bg-surface);
  border: 1px solid var(--border-main);
  border-radius: var(--radius);
  padding: 20px;
}

.orders-table-wrap {
  overflow-x: auto;
}

.orders-table {
  width: 100%;
  border-collapse: collapse;
  font-size: 13px;
}

.orders-table th {
  text-align: left;
  padding: 10px 12px;
  background: var(--bg-input);
  color: var(--text-muted);
  font-weight: 500;
  border-bottom: 1px solid var(--border-main);
  white-space: nowrap;
}

.orders-table td {
  padding: 10px 12px;
  border-bottom: 1px solid var(--border-main);
  color: var(--text-primary);
}

.orders-table tr:last-child td {
  border-bottom: none;
}

.orders-table tbody tr:hover {
  background: var(--bg-hover);
}

.order-id {
  font-family: monospace;
  font-size: 12px;
  color: var(--text-muted);
}

.order-amount {
  font-weight: 600;
  color: var(--text-primary);
}

.empty-row {
  text-align: center;
  color: var(--text-muted);
  padding: 40px !important;
}

/* 弹窗 */
.modal-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.6);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
}

.modal-panel {
  background: var(--bg-surface);
  border: 1px solid var(--border-main);
  border-radius: var(--radius);
  width: 90%;
  max-width: 400px;
}

.modal-panel.sm {
  max-width: 400px;
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px 20px;
  border-bottom: 1px solid var(--border-main);
}

.modal-title {
  font-size: 16px;
  font-weight: 600;
  color: var(--text-primary);
}

.modal-close {
  background: none;
  border: none;
  font-size: 20px;
  color: var(--text-muted);
  cursor: pointer;
  padding: 4px;
}

.modal-body {
  padding: 20px;
}

.modal-footer {
  display: flex;
  justify-content: flex-end;
  gap: 8px;
  padding: 16px 20px;
  border-top: 1px solid var(--border-main);
}

.form-group {
  margin-bottom: 16px;
}

.form-group:last-child {
  margin-bottom: 0;
}

.form-label {
  display: block;
  font-size: 13px;
  color: var(--text-secondary);
  margin-bottom: 6px;
}

.input {
  width: 100%;
  padding: 10px 12px;
  background: var(--bg-input);
  border: 1px solid var(--border-main);
  border-radius: var(--radius-sm);
  color: var(--text-primary);
  font-size: 14px;
  outline: none;
  transition: border-color 0.2s;
}

.input:focus {
  border-color: var(--blue);
}

.btn {
  padding: 8px 16px;
  border-radius: var(--radius-sm);
  font-size: 14px;
  cursor: pointer;
  transition: all 0.2s;
  border: none;
  font-weight: 500;
}

.btn-primary {
  background: var(--blue);
  color: #fff;
}

.btn-primary:hover {
  opacity: 0.9;
}

.btn-ghost {
  background: transparent;
  color: var(--text-secondary);
  border: 1px solid var(--border-main);
}

.btn-ghost:hover {
  background: var(--bg-hover);
}

.btn-sm {
  padding: 6px 12px;
  font-size: 12px;
}

.btn-danger {
  background: var(--danger);
  color: #fff;
}

.btn-danger:hover {
  opacity: 0.9;
}

.tag {
  display: inline-block;
  padding: 2px 8px;
  border-radius: 12px;
  font-size: 11px;
  font-weight: 500;
}

.tag-blue {
  background: rgba(41, 123, 255, 0.1);
  color: var(--blue);
}

.tag-orange {
  background: rgba(245, 158, 11, 0.1);
  color: #f59e0b;
}

.tag-muted {
  background: var(--bg-input);
  color: var(--text-muted);
}

.tag-green {
  background: rgba(74, 222, 128, 0.1);
  color: #4ade80;
}

.hint {
  font-size: 12px;
  color: var(--text-muted);
  margin-top: 8px;
}

.empty-hint {
  padding: 40px;
  text-align: center;
  color: var(--text-muted);
  font-size: 14px;
}

@media (max-width: 768px) {
  .profile-page {
    padding: 16px;
  }
  
  .profile-grid {
    grid-template-columns: repeat(2, 1fr);
  }
  
  .profile-stats {
    gap: 16px;
  }
  
  .stat-value {
    font-size: 20px;
  }
  
  .section-header {
    flex-direction: column;
    gap: 12px;
    align-items: flex-start;
  }
  
  .section-actions {
    flex-wrap: wrap;
  }
  
  .work-card {
    flex-wrap: wrap;
  }
  
  .work-actions {
    width: 100%;
    justify-content: flex-start;
    margin-top: 8px;
  }
}
</style>
