<template>
  <div class="history-page">
    <div class="history-header">
      <div class="section-title">历史任务</div>

      <!-- 筛选栏 -->
      <div class="filter-bar">
        <div class="filter-tabs">
          <button v-for="f in filters" :key="f.id"
            class="filter-tab" :class="{ active: activeFilter === f.id }"
            @click="activeFilter = f.id">{{ f.label }}</button>
        </div>
        <div class="filter-search">
          <input class="input" v-model="searchText" placeholder="搜索任务名..." style="width:200px" />
        </div>
      </div>
    </div>

    <!-- 工程文件列表 -->
    <div class="project-list">
      <div class="list-header">
        <span class="col-thumb"></span>
        <span class="col-name">任务名称</span>
        <span class="col-type">类型</span>
        <span class="col-time">创建时间</span>
        <span class="col-status">状态</span>
        <span class="col-actions">操作</span>
      </div>

      <div v-for="item in filteredList" :key="item.id" class="list-row">
        <span class="col-thumb">
          <span class="thumb-placeholder">🎬</span>
        </span>
        <span class="col-name">{{ item.title }}</span>
        <span class="col-type"><span class="tag tag-muted">{{ item.type }}</span></span>
        <span class="col-time">{{ item.created_at }}</span>
        <span class="col-status">
          <span class="tag" :class="statusTag(item.status)">{{ statusText(item.status) }}</span>
        </span>
        <span class="col-actions">
          <button class="btn btn-ghost btn-sm" @click="viewResult(item.id)" v-if="item.status === 'done'">查看</button>
          <button class="btn btn-ghost btn-sm" @click="continueEdit(item.id)">继续</button>
          <button class="btn btn-ghost btn-sm" @click="deleteItem(item.id)">🗑</button>
        </span>
      </div>

      <div v-if="filteredList.length === 0" class="list-empty">
        <div class="empty-icon">📂</div>
        <div>暂无历史记录</div>
      </div>
    </div>
  </div>
</template>

<script>
import axios from 'axios'

export default {
  name: 'HistoryPage',
  data() {
    return {
      activeFilter: 'all',
      searchText: '',
      projects: [],
      filters: [
        { id: 'all', label: '全部' },
        { id: 'script', label: '短剧剧本' },
        { id: 'ad', label: '广告分镜' },
        { id: 'promo', label: '宣传片' },
        { id: 'analysis', label: '镜头解析' },
      ],
      token: '',
    }
  },
  computed: {
    filteredList() {
      let list = this.projects
      if (this.activeFilter !== 'all') {
        list = list.filter(p => p.type === this.activeFilter)
      }
      if (this.searchText) {
        const q = this.searchText.toLowerCase()
        list = list.filter(p => (p.title || '').toLowerCase().includes(q))
      }
      return list
    },
  },
  methods: {
    authHeaders() {
      return { 'Authorization': 'Bearer ' + this.token }
    },
    statusTag(s) {
      return s === 'done' ? 'tag-green' : s === 'fail' ? 'tag-red' : s === 'running' ? 'tag-blue' : 'tag-muted'
    },
    statusText(s) {
      return { done: '已完成', running: '进行中', fail: '失败', pending: '等待中' }[s] || s
    },
    async loadHistory() {
      this.token = localStorage.getItem('token') || ''
      if (!this.token) return
      try {
        const r = await axios.get('/api/v1/projects?limit=50', { headers: this.authHeaders() })
        if (r.data.success && Array.isArray(r.data.data)) {
          this.projects = r.data.data.map(p => ({
            id: p.id,
            title: p.title || p.name || '未命名',
            type: p.type || 'script',
            created_at: p.created_at || p.createdAt || '--',
            status: p.status || 'done',
          }))
        }
      } catch (e) {
        // Load from localStorage fallback
        const saved = localStorage.getItem('__DRAMA_SCRIPT__')
        if (saved) {
          this.projects = [{
            id: 'local_1',
            title: '本地草稿',
            type: 'script',
            created_at: new Date().toLocaleDateString(),
            status: 'done',
          }]
        }
      }
    },
    viewResult(id) { this.$router.push('/result/' + id) },
    continueEdit(id) {
      localStorage.setItem('__DRAMA_PROJECT_ID__', id)
      this.$router.push('/')
    },
    async deleteItem(id) {
      try {
        await axios.delete('/api/v1/projects/' + id, { headers: this.authHeaders() })
        this.projects = this.projects.filter(p => p.id !== id)
      } catch (e) { /* ignore */ }
    },
  },
  mounted() { this.loadHistory() },
}
</script>

<style scoped>
.history-page { padding: 20px 24px; }
.history-header { margin-bottom: 16px; }
.filter-bar {
  display: flex; align-items: center; gap: 16px;
  margin-top: 10px;
}
.filter-tabs { display: flex; gap: 2px; }
.filter-tab {
  padding: 4px 12px; font-size: 12px;
  background: none; border: none; border-radius: var(--radius);
  color: var(--text-secondary); cursor: pointer;
}
.filter-tab:hover { background: var(--bg-hover); }
.filter-tab.active { background: var(--bg-active); color: var(--text-primary); }

.project-list {
  background: var(--bg-surface);
  border: 1px solid var(--border-main);
  border-radius: var(--radius);
  overflow: hidden;
}
.list-header {
  display: flex; align-items: center;
  padding: 10px 14px;
  background: var(--bg-panel);
  font-size: 11px; color: var(--text-muted);
  font-weight: 600;
  border-bottom: 1px solid var(--border-main);
}
.list-row {
  display: flex; align-items: center;
  padding: 10px 14px;
  font-size: 12px;
  border-bottom: 1px solid var(--border-main);
  transition: background 0.15s;
}
.list-row:last-child { border-bottom: none; }
.list-row:hover { background: var(--bg-hover); }

.col-thumb { width: 36px; flex-shrink: 0; }
.thumb-placeholder { font-size: 18px; }
.col-name { flex: 1; min-width: 0; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
.col-type { width: 80px; flex-shrink: 0; }
.col-time { width: 120px; flex-shrink: 0; color: var(--text-muted); }
.col-status { width: 80px; flex-shrink: 0; }
.col-actions { width: 120px; flex-shrink: 0; display: flex; gap: 4px; }

.list-empty {
  padding: 40px; text-align: center;
  color: var(--text-muted);
}
.empty-icon { font-size: 36px; margin-bottom: 8px; opacity: 0.4; }

@media (max-width: 768px) {
  .col-type, .col-time { display: none; }
  .filter-bar { flex-direction: column; align-items: flex-start; }
}
</style>
