<template>
  <div class="api-keys-page">
    <div class="page-header">
      <h1>我的 API Key</h1>
      <p class="page-desc">添加你自有的 API Key 后，生成短剧将走你的额度，平台只收平台使用费 <strong>{{ platFee }}</strong>。</p>
    </div>

    <div class="fee-banner">
      <span class="fee-icon">⏱️</span>
      <span>平台使用费：<strong>{{ platFee }}</strong> / 秒（无论使用平台 Key 还是自配 Key 都收取）</span>
    </div>

    <div class="keys-grid">
      <div v-for="(info, provider) in providerList" :key="provider" class="key-card">
        <div class="card-header">
          <span class="provider-name">{{ info }}</span>
          <span class="key-status" :class="{ active: hasKey(provider) }">
            {{ hasKey(provider) ? '已配置' : '未配置' }}
          </span>
        </div>

        <div class="card-body">
          <!-- 火山方舟专属说明 -->
          <div class="ark-info" v-if="provider === 'ark_volc'">
            <p>火山方舟支持：DeepSeek（剧本/分镜）、豆包 Seedream（生图）、豆包 Seedance（生视频）、CosyVoice V2（配音）</p>
            <p class="ark-hint">需在<a href="https://console.volcengine.com/ark/" target="_blank">火山引擎控制台</a>创建接入点后获取 API Key</p>
          </div>

          <div class="input-group" v-if="editing === provider">
            <label>API Key</label>
            <input v-model="editForm.key" type="password" class="input" placeholder="输入你的火山方舟 API Key">
            <div class="btn-row">
              <button class="btn btn-primary btn-sm" @click="saveKey(provider)" :disabled="saving">保存</button>
              <button class="btn btn-ghost btn-sm" @click="cancelEdit">取消</button>
            </div>
          </div>

          <div class="key-display" v-else>
            <div class="key-masked" v-if="hasKey(provider)">
              <span class="masked-text">{{ maskedKey(provider) }}</span>
            </div>
            <div class="key-empty" v-else>
              <span>未设置火山方舟 Key</span>
            </div>
            <div class="btn-row">
              <button class="btn btn-secondary btn-sm" @click="startEdit(provider)">
                {{ hasKey(provider) ? '修改' : '添加' }}
              </button>
              <button v-if="hasKey(provider)" class="btn btn-ghost btn-sm" style="color:var(--danger)" @click="deleteKey(provider)">
                删除
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>

    <div class="info-box">
      <h3>使用说明</h3>
      <ul>
        <li>配置自己的火山方舟 API Key 后，AI 生成消耗的是你的火山额度，平台只收平台使用费（{{ platFee }}/秒）</li>
        <li>不配置 Key 则使用平台提供的 Key，按实际 API 调用量 + 平台使用费（{{ platFee }}/秒）收费</li>
        <li>Key 仅用于平台调度，不会泄露</li>
      </ul>
    </div>
  </div>
</template>

<script>
export default {
  name: 'ApiKeysPage',
  data() {
    return {
      providerList: {},
      platFee: '0.06元',
      myKeys: {},
      editing: null,
      editForm: { key: '', secret: '' },
      saving: false,
    }
  },
  async mounted() {
    await this.loadData()
  },
  methods: {
    async loadData() {
      try {
        const provRes = await fetch('/api/v1/user-keys/providers')
        const provData = await provRes.json()
        if (provData.success) {
          if (provData.data.providers) {
            this.providerList = provData.data.providers
            this.platFee = provData.data.platform_fee_label || '0.06元'
          } else {
            // backward compat
            this.providerList = provData.data
          }
        }
      } catch (e) {
        console.error('Failed to load providers:', e)
      }
      try {
        const keysRes = await fetch('/api/v1/user-keys/', {
          headers: { 'Authorization': 'Bearer ' + localStorage.getItem('token') }
        })
        const keysData = await keysRes.json()
        if (keysData.success) {
          this.myKeys = keysData.data
        }
      } catch (e) {
        console.error('Failed to load keys:', e)
      }
    },
    hasKey(provider) {
      return this.myKeys[provider] && this.myKeys[provider].api_key
    },
    maskedKey(provider) {
      const k = this.myKeys[provider]?.api_key || ''
      if (k.length <= 8) return '****' + k.slice(-4)
      return k.slice(0, 6) + '****' + k.slice(-4)
    },
    startEdit(provider) {
      this.editing = provider
      this.editForm = {
        key: this.myKeys[provider]?.api_key || '',
        secret: this.myKeys[provider]?.api_secret || '',
      }
    },
    cancelEdit() {
      this.editing = null
      this.editForm = { key: '', secret: '' }
    },
    async saveKey(provider) {
      if (!this.editForm.key.trim()) return alert('请输入 API Key')
      this.saving = true
      try {
        const res = await fetch('/api/v1/user-keys/', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': 'Bearer ' + localStorage.getItem('token')
          },
          body: JSON.stringify({
            provider: provider,
            api_key: this.editForm.key.trim(),
          })
        })
        const data = await res.json()
        if (data.success) {
          this.editing = null
          this.editForm = { key: '' }
          await this.loadData()
        } else {
          alert('保存失败: ' + (data.error || '未知错误'))
        }
      } catch (e) {
        alert('保存失败: ' + e.message)
      }
      this.saving = false
    },
    async deleteKey(provider) {
      if (!confirm('确定删除火山方舟的 Key？')) return
      try {
        const res = await fetch('/api/v1/user-keys/' + provider, {
          method: 'DELETE',
          headers: { 'Authorization': 'Bearer ' + localStorage.getItem('token') }
        })
        const data = await res.json()
        if (data.success) {
          await this.loadData()
        } else {
          alert('删除失败: ' + (data.error || '未知错误'))
        }
      } catch (e) {
        alert('删除失败: ' + e.message)
      }
    }
  }
}
</script>

<style scoped>
.api-keys-page {
  max-width: 800px;
  margin: 0 auto;
  padding: 32px 24px;
}
.page-header { margin-bottom: 24px; }
.page-header h1 {
  font-size: 24px;
  font-weight: 700;
  color: var(--text-primary);
  margin-bottom: 8px;
}
.page-desc {
  color: var(--text-secondary);
  font-size: 14px;
  line-height: 1.6;
}
.fee-banner {
  display: flex;
  align-items: center;
  gap: 10px;
  background: linear-gradient(135deg, rgba(196,155,74,0.08), rgba(196,155,74,0.02));
  border: 1px solid rgba(196,155,74,0.2);
  border-radius: var(--radius);
  padding: 12px 16px;
  margin-bottom: 24px;
  font-size: 14px;
  color: var(--text-primary);
}
.fee-icon { font-size: 20px; }
.keys-grid { display: grid; gap: 16px; margin-bottom: 32px; }
.key-card {
  background: var(--bg-card);
  border-radius: var(--radius);
  border: 1px solid var(--border);
  overflow: hidden;
  transition: var(--transition);
}
.key-card:hover { border-color: var(--accent); }
.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px 20px;
  background: rgba(196, 155, 74, 0.03);
  border-bottom: 1px solid var(--border);
}
.provider-name {
  font-size: 15px;
  font-weight: 600;
  color: var(--text-primary);
}
.key-status {
  font-size: 12px;
  padding: 2px 10px;
  border-radius: 20px;
  background: var(--bg-input);
  color: var(--text-muted);
}
.key-status.active {
  background: rgba(74, 222, 128, 0.1);
  color: #4ade80;
}
.card-body { padding: 16px 20px; }
.ark-info {
  background: rgba(56, 132, 255, 0.04);
  border-radius: 8px;
  padding: 12px 16px;
  margin-bottom: 12px;
  font-size: 13px;
  color: var(--text-secondary);
  line-height: 1.6;
}
.ark-info p { margin: 0; }
.ark-info .ark-hint { margin-top: 6px; font-size: 12px; color: var(--text-muted); }
.ark-info a { color: var(--accent); text-decoration: underline; }
.key-display {
  display: flex;
  justify-content: space-between;
  align-items: center;
}
.masked-text {
  font-family: monospace;
  font-size: 13px;
  color: var(--text-secondary);
}
.key-empty {
  color: var(--text-muted);
  font-size: 13px;
}
.btn-row { display: flex; gap: 8px; align-items: center; }
.input-group { display: flex; flex-direction: column; gap: 8px; }
.input-group label {
  font-size: 12px;
  color: var(--text-muted);
  font-weight: 500;
}
.info-box {
  background: rgba(196, 155, 74, 0.04);
  border: 1px solid rgba(196, 155, 74, 0.1);
  border-radius: var(--radius);
  padding: 20px 24px;
}
.info-box h3 {
  font-size: 15px;
  color: var(--accent);
  margin-bottom: 12px;
}
.info-box ul { list-style: none; padding: 0; }
.info-box li {
  font-size: 13px;
  color: var(--text-secondary);
  padding: 6px 0;
  padding-left: 20px;
  position: relative;
}
.info-box li::before {
  content: '';
  position: absolute;
  left: 4px;
  top: 13px;
  width: 4px;
  height: 4px;
  background: var(--accent);
  border-radius: 50%;
}

/* ===== Mobile Responsive ===== */
@media (max-width: 768px) {
  .page-container, .container, .card, .wrap { padding: 0 12px 72px !important; }
}

</style>
