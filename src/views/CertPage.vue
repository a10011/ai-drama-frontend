<template>
  <div class="cert-page" v-if="cert">
    <div class="cert-badge">📜 原创证明</div>
    <div class="cert-header">
      <h1>{{ cert.title || '未命名作品' }}</h1>
      <div class="cert-meta">
        <span>🏷️ {{ cert.genre || '未分类' }}</span>
        <span>🆔 {{ cert.project_id }}</span>
        <span>📅 {{ cert.created_at }}</span>
      </div>
    </div>

    <div class="cert-hash-section">
      <div class="cert-hash-row">
        <span class="cert-hash-label">作品指纹</span>
        <code class="cert-hash-value">{{ cert.cert_hash.slice(0,32) }}…</code>
      </div>
      <div v-if="cert.video_hash" class="cert-hash-row">
        <span class="cert-hash-label">视频指纹</span>
        <code class="cert-hash-value">{{ cert.video_hash.slice(0,32) }}…</code>
      </div>
    </div>

    <div class="cert-stages-section">
      <h3>创作过程（{{ cert.stages.length }} 步）</h3>
      <div v-for="(s,i) in cert.stages" :key="i" class="cert-stage-row">
        <div class="cert-stage-num">{{ i+1 }}</div>
        <div class="cert-stage-info">
          <div class="cert-stage-name">{{ s.stage }}</div>
          <div class="cert-stage-hash" v-if="s.output_hash">
            <code>{{ s.output_hash.slice(0,20) }}…</code>
          </div>
        </div>
        <div class="cert-stage-time">{{ s.created_at?.slice(11,19)||'' }}</div>
      </div>
    </div>

    <div class="cert-actions">
      <button class="cert-btn" @click="printCert">🖨️ 打印</button>
      <button class="cert-btn" @click="shareCert">📤 分享</button>
    </div>

    <div class="cert-footer">
      本证书由 mzsh.top AI 创作平台自动生成 · 内容指纹 SHA256<br/>
      可用于证明该作品为 AI 辅助原创，非盗用/搬运他人作品
    </div>
  </div>

  <div v-else class="cert-loading">
    <div v-if="loading">⏳ 加载中...</div>
    <div v-else>
      <p>暂无证书</p>
      <button class="cert-btn" @click="generateCert">📜 生成原创证书</button>
    </div>
  </div>
</template>

<script>
async function req(m, u, b) {
  const t = localStorage.getItem('token')
  const o = { method: m, headers: {} }
  if (t) o.headers['Authorization'] = 'Bearer ' + t
  if (b) { o.headers['Content-Type'] = 'application/json'; o.body = JSON.stringify(b) }
  const r = await fetch(u.startsWith('http') ? u : ('https://api.mzsh.top' + u), o)
  return r.json()
}

export default {
  data() {
    return { cert: null, loading: false, projectId: '' }
  },
  methods: {
    async loadCert() {
      this.loading = true
      const r = await req('GET', '/api/v1/script-wf/cert/' + this.projectId)
      if (r.success) this.cert = r.data
      this.loading = false
    },
    async generateCert() {
      this.loading = true
      const r = await req('POST', '/api/v1/script-wf/cert/generate/' + this.projectId, {})
      if (r.success) this.cert = r.data
      else alert('生成失败: ' + (r.error || ''))
      this.loading = false
    },
    printCert() { window.print() },
    shareCert() {
      const t = `🎬 原创证明\n作品: ${this.cert.title}\n指纹: ${this.cert.cert_hash.slice(0,16)}…\n${location.href}`
      if (navigator.share) navigator.share({ title: '原创证明', text: t })
      else { navigator.clipboard.writeText(t); alert('已复制') }
    }
  },
  mounted() {
    this.projectId = this.$route.params?.id || this.$route.query?.project_id || ''
    if (!this.projectId) { this.loading = false; return }
    req('GET', '/api/v1/pipeline/progress/' + this.projectId).then(r => {
      this.loadCert()
    }).catch(() => this.loadCert())
  }
}
</script>

<style scoped>
.cert-page{max-width:700px;margin:24px auto;padding:32px;background:#1a1a2e;border:1px solid #2a2a4a;border-radius:16px;font-family:'Inter','Noto Sans SC',sans-serif;color:#eee}
.cert-badge{display:inline-block;padding:4px 14px;background:linear-gradient(135deg,#7C5CFC,#9B7FFF);border-radius:20px;font-size:12px;font-weight:700;margin-bottom:20px}
.cert-header h1{font-size:22px;font-weight:700;margin-bottom:8px}
.cert-meta{display:flex;gap:16px;font-size:12px;color:#888;margin-bottom:24px;flex-wrap:wrap}
.cert-hash-section{background:#0d0d1a;border:1px solid #2a2a4a;border-radius:10px;padding:16px;margin-bottom:20px}
.cert-hash-row{display:flex;gap:12px;align-items:center;margin-bottom:6px}
.cert-hash-row:last-child{margin-bottom:0}
.cert-hash-label{font-size:12px;color:#888;width:70px;flex-shrink:0}
.cert-hash-value{font-size:11px;color:#7C5CFC;background:#12122a;padding:2px 8px;border-radius:4px;font-family:monospace}
.cert-stages-section{margin-bottom:24px}
.cert-stages-section h3{font-size:15px;font-weight:600;margin-bottom:12px;color:#ddd}
.cert-stage-row{display:flex;align-items:center;gap:12px;padding:8px 0;border-bottom:1px solid #222}
.cert-stage-num{width:24px;height:24px;border-radius:50%;background:#2a2a4a;display:flex;align-items:center;justify-content:center;font-size:11px;font-weight:700;flex-shrink:0}
.cert-stage-info{flex:1}
.cert-stage-name{font-size:13px;font-weight:500}
.cert-stage-hash code{font-size:10px;color:#555;font-family:monospace}
.cert-stage-time{font-size:11px;color:#666}
.cert-actions{display:flex;gap:10px;margin-bottom:20px}
.cert-btn{padding:10px 20px;border-radius:8px;font-size:13px;font-weight:600;cursor:pointer;border:none;background:#2a2a4a;color:#ccc}
.cert-btn:hover{background:#3a3a5a;color:#fff}
.cert-footer{font-size:11px;color:#555;text-align:center;padding-top:16px;border-top:1px solid #2a2a4a;line-height:1.6}
.cert-loading{text-align:center;padding:80px 20px;color:#888}

/* ===== Mobile Responsive ===== */
@media (max-width: 768px) {
  .page-container, .container, .card, .wrap { padding: 0 12px 72px !important; }
}

</style>
