<template>
  <div class="media-lib-page">
    <div class="media-lib-header">
      <h2>📂 素材库</h2>
      <div class="media-lib-stats">
        <span class="media-stat" v-for="s in stats" :key="s.label">
          <i :class="s.icon"></i> {{ s.label }}: <strong>{{ s.count }}</strong>
        </span>
      </div>
    </div>

    <!-- Tab 切换 -->
    <div class="media-tabs">
      <button class="media-tab-btn" :class="{ active: tab === 'all' }" @click="tab='all'; loadMedia(1)">全部素材</button>
      <button class="media-tab-btn" :class="{ active: tab === 'public' }" @click="tab='public'; loadMedia(1)">公共素材</button>
      <button v-if="isLoggedIn" class="media-tab-btn" :class="{ active: tab === 'private' }" @click="tab='private'; loadMedia(1)">我的素材</button>
    </div>

    <!-- 类型筛选 -->
    <div class="media-filters">
      <button v-for="t in availableFilters" :key="t.key"
        class="media-filter-btn" :class="{ active: filterType === t.key, ['filter-' + t.key]: true }"
        @click="filterType = t.key; loadMedia(1)">
        <i :class="t.icon"></i> {{ t.label }}
      </button>
    </div>

    <!-- 调试信息 -->
    <div style="margin:8px 0;padding:8px 12px;background:rgba(255,200,50,0.1);border:1px solid rgba(255,200,50,0.3);border-radius:6px;font-size:12px;color:var(--text-muted);display:flex;gap:10px;flex-wrap:wrap;align-items:center">
      当前: <strong>{{ filterType || '全部' }}</strong> |
      Tab: <strong>{{ tab }}</strong> |
      加载: <strong>{{ items.length }}</strong>/<strong>{{ total }}</strong>项 |
      <span>页: <strong>{{ page }}</strong>/<strong>{{ totalPages }}</strong></span>
    </div>


    <!-- 上传区域 -->
    <details class="media-upload-section" :open="uploadQueue.length > 0">
      <summary class="media-upload-title">📤 上传素材</summary>
      <div class="media-upload-box">
        <div class="media-upload-dropzone" @click="triggerMediaUpload" @dragover.prevent @drop.prevent="handleMediaDrop">
          <i class="fas fa-cloud-upload-alt"></i>
          <span>点击或拖拽文件上传</span>
          <span class="media-upload-hint">支持 JPG / PNG / GIF / MP4 / MP3 / WAV</span>
        </div>
        <input type="file" ref="mediaUploadInput" accept="image/*,video/*,audio/*" multiple @change="handleMediaFileSelect" style="display:none" />

        <div class="media-upload-queue" v-if="uploadQueue.length > 0">
          <div class="media-queue-header">待上传文件 ({{ uploadQueue.length }})</div>
          <div v-for="(f, fi) in uploadQueue" :key="fi" class="media-queue-item">
            <div class="media-queue-preview">
              <img v-if="f.type.startsWith('image/')" :src="f.preview" alt="" />
              <i v-else-if="f.type.startsWith('video/')" class="fas fa-film media-queue-icon"></i>
              <i v-else-if="f.type.startsWith('audio/')" class="fas fa-music media-queue-icon"></i>
              <i v-else class="fas fa-file media-queue-icon"></i>
            </div>
            <div class="media-queue-info">
              <div class="media-queue-name">{{ f.name }}</div>
              <div class="media-queue-size">{{ formatSize(f.size) }}</div>
            </div>
            <button class="media-queue-remove" @click="uploadQueue.splice(fi, 1)"><i class="fas fa-times"></i></button>
          </div>

          <div class="media-license">
            <div class="media-license-header">
              <label class="media-license-checkbox">
                <input type="checkbox" v-model="licenseAgreed" />
                <span>我已阅读并同意</span>
              </label>
              <span class="media-license-link" @click="showLicense = !showLicense">
                素材上传许可协议
                <i :class="showLicense ? 'fas fa-chevron-up' : 'fas fa-chevron-down'"></i>
              </span>
            </div>
            <div class="media-license-body" v-if="showLicense">
              <ol>
                <li>用户上传的素材版权归上传者所有。</li>
                <li>福建面子信息科技有限公司仅提供存储与分发服务。</li>
                <li>用户承诺上传内容不侵犯第三方合法权益，不违反法律法规。</li>
                <li>本公司有权对违规内容进行下架处理，无需事先通知。</li>
                <li>本公司不对用户上传内容的真实性、合法性承担任何责任。</li>
                <li>用户上传即视为授权本公司在平台范围内展示和使用该素材。</li>
                <li>本协议最终解释权归福建面子信息科技有限公司所有。</li>
              </ol>
            </div>
          </div>

          <div class="media-upload-progress-wrap" v-if="uploading">
            <div class="media-upload-progress-bar">
              <div class="media-upload-progress-fill" :style="{ width: uploadProgress + '%' }"></div>
            </div>
            <span class="media-upload-progress-text">{{ uploadProgressText }}</span>
          </div>

          <button class="btn btn-primary media-upload-btn" @click="startMediaUpload" :disabled="!licenseAgreed || uploading">
            <i class="fas fa-upload"></i>
            {{ uploading ? '上传中...' : '确认上传 (' + uploadQueue.length + ' 个文件)' }}
          </button>
        </div>
      </div>
    </details>

    <!-- 演员上传 -->
    <details class="actor-upload-section">
      <summary class="media-upload-title">🎭 上传演员</summary>
      <p class="media-upload-hint" style="margin:4px 0 16px">上传真人照片，所有会员可见可用</p>
      <div class="actor-upload-form">
        <div class="actor-field-row">
          <div class="actor-field half">
            <label>艺名</label>
            <input v-model="actorName" type="text" placeholder="如：张三" class="actor-input" />
          </div>
          <div class="actor-field half">
            <label>性别</label>
            <select v-model="actorGender" class="actor-input">
              <option value="">选择</option>
              <option value="男">男</option>
              <option value="女">女</option>
            </select>
          </div>
        </div>
        <div class="actor-field">
          <label>照片</label>
          <div class="actor-dropzone" @click="$refs.actorFile.click()">
            <i class="fas fa-camera" style="font-size:28px;margin-bottom:8px;color:rgba(0,255,255,0.3)"></i>
            <p>点击选择演员照片</p>
          </div>
          <input ref="actorFile" type="file" accept="image/*" hidden @change="previewActorFile" />
        </div>
        <div v-if="actorPreview" class="actor-preview">
          <img :src="actorPreview" />
        </div>
        <button v-if="actorPreview && actorName" class="actor-submit" @click="submitActor">
          <i class="fas fa-upload"></i> 提交演员
        </button>
        <p v-if="actorMsg" class="actor-msg">{{ actorMsg }}</p>
      </div>
    </details>

    <!-- 演员列表 -->
    <div class="actor-grid" v-if="actors.length">
      <h3>🎭 已上传演员 ({{ actors.length }})</h3>
      <div class="actor-grid-inner">
        <div v-for="a in actors" :key="a.id" class="actor-card">
          <div class="actor-img" @click="previewActor(a)">
            <img :src="getPublicUrl(a.file_path)" :alt="a.actor_name" />
          </div>
          <div class="actor-name">{{ a.actor_name }} <span v-if="a.actor_gender">{{ a.actor_gender === '男' ? '♂' : '♀' }}</span></div>
          <div class="actor-delete" @click.stop="deleteItem(a)">x</div>
        </div>
      </div>
    </div>

    <!-- 加载状态 -->
    <div v-if="loading" class="media-empty">
      <div class="loading-spinner"></div>
      <p>加载中...</p>
    </div>

    <!-- 错误状态 -->
    <div v-else-if="loadError" class="media-empty">
      <i class="fas fa-exclamation-triangle"></i>
      <p>加载失败</p>
      <button class="btn btn-primary" style="margin-top:12px" @click="loadMedia(1)">重试</button>
    </div>

    <!-- 素材网格 -->
    <div class="media-grid" v-else-if="items.length > 0" :key="'mg' + gridKey">
      <div class="media-card" v-for="item in items" :key="item.id" @click="previewItem(item)">
        <div class="media-thumb">
          <img v-if="item.media_type === 'figures' || item.media_type === 'scenes' || item.media_type === 'props'"
            :src="getPublicUrl(item.file_path)" alt="" @error="onImgError($event)" />
          <div v-else-if="item.media_type === 'videos'" class="media-thumb-video">
            <video :src="getPublicUrl(item.file_path)" muted preload="metadata" @mouseover="$event.target.play()" @mouseout="$event.target.pause()"></video>
            <div class="media-video-overlay"><i class="fas fa-play-circle"></i></div>
          </div>
          <div v-else-if="item.media_type === 'audio' || item.media_type === 'bgm'" class="media-thumb-audio">
            <i class="fas fa-music"></i>
          </div>
          <div v-else class="media-thumb-other">
            <i class="fas fa-file"></i>
          </div>
          <!-- 类型顶标 -->
          <span class="media-type-tag" :class="'tag-' + item.media_type">{{ mediaTypeLabel(item.media_type) }}</span>
        </div>
        <div class="media-info">
          <div class="media-name">{{ item.name || item.file_name || '未命名' }}</div>
          <div class="media-meta">
            <span class="media-date">{{ formatDate(item.created_at) }}</span>
            <span class="media-size">{{ formatSize(item.size_bytes) }}</span>
          </div>
        </div>
      </div>
    </div>
    <div v-else class="media-empty">
      <i class="fas fa-inbox"></i>
      <p>暂无素材</p>
    </div>

    <!-- 分页 -->
    <div class="media-pager" v-if="totalPages > 1">
      <button :disabled="page <= 1" @click="loadMedia(page - 1)"><i class="fas fa-chevron-left"></i> 上一页</button>
      <span>第 {{ page }} / {{ totalPages }} 页（共 {{ total }} 项）</span>
      <button :disabled="page >= totalPages" @click="loadMedia(page + 1)">下一页 <i class="fas fa-chevron-right"></i></button>
    </div>

    <!-- 预览弹窗 -->
    <div class="media-modal-mask" v-if="previewVisible" @click="previewVisible = false">
      <div class="media-modal" @click.stop>
        <div class="media-modal-header">
          <span>{{ previewItemData?.name || previewItemData?.file_name }}</span>
          <button @click="previewVisible = false"><i class="fas fa-times"></i></button>
        </div>
        <div class="media-modal-body">
          <img v-if="isImage(previewItemData)" :src="getPublicUrl(previewItemData?.file_path)" style="max-width:100%;max-height:500px;border-radius:8px" @error="onImgError($event)" />
          <video v-else-if="previewItemData?.media_type === 'videos'" :src="getPublicUrl(previewItemData?.file_path)" controls style="max-width:100%;max-height:500px;border-radius:8px"></video>
          <audio v-else-if="previewItemData?.media_type === 'audio' || previewItemData?.media_type === 'bgm'" :src="getPublicUrl(previewItemData?.file_path)" controls style="width:100%"></audio>
          <div v-else class="media-modal-file"><i class="fas fa-file"></i> {{ previewItemData?.file_name }}</div>
        </div>
        <div class="media-modal-footer">
          <span class="media-modal-tag" :class="'tag-' + (previewItemData?.media_type || '')">{{ mediaTypeLabel(previewItemData?.media_type) }}</span>
          <div class="media-modal-actions">
            <a :href="getPublicUrl(previewItemData?.file_path)" download class="btn btn-primary" style="text-decoration:none"><i class="fas fa-download"></i> 下载</a>
            <button class="btn btn-ghost" @click="deleteItem(previewItemData)"><i class="fas fa-trash"></i> 删除</button>
          </div>
        </div>
      </div>
    </div>

    <!-- 演员预览弹窗 -->
    <div class="media-modal-mask" v-if="previewActorVisible" @click="previewActorVisible = false">
      <div class="media-modal" @click.stop>
        <div class="media-modal-header">
          <span>{{ previewActorData?.actor_name }}</span>
          <button @click="previewActorVisible = false"><i class="fas fa-times"></i></button>
        </div>
        <div class="media-modal-body" style="text-align:center">
          <img :src="getPublicUrl(previewActorData?.file_path)" style="max-width:100%;max-height:500px;border-radius:8px" />
        <div class="media-modal-footer">
          <button class="btn btn-ghost" @click="deleteItem(previewActorData)"><i class="fas fa-trash"></i> 删除演员</button>
        </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  data() {
    return {
      items: [],
      total: 0,
      page: 1,
      totalPages: 1,
      filterType: '',
      tab: 'all',
      gridKey: 0,
      loading: true,
      loadError: false,
      uploadQueue: [],
      licenseAgreed: true,
      showLicense: false,
      uploading: false,
      uploadProgress: 0,
      uploadProgressText: '',
      stats: [],
      previewVisible: false,
      previewItemData: null,
      typeFilters: [],
      _reqSeq: 0,
      _reqSeq: 0,
      debugUrl: '',
      debugCount: 0,
      debugType: '',
      debugItems: [],
      actors: [],
      actorName: '',
      actorGender: '',
      actorPreview: null,
      actorFile: null,
      actorMsg: '',
      previewActorData: null,
      previewActorVisible: false,
    }
  },
  mounted() {
    this.loadMedia()
    this.loadStats()
    this.loadActors()
  },
  computed: {
    isLoggedIn() {
      return !!localStorage.getItem('token')
    },
    availableFilters() {
      var filterMap = {
        scenes: { key: 'scenes', label: '场景', icon: 'fas fa-image' },
        videos: { key: 'videos', label: '视频', icon: 'fas fa-film' },
        audio: { key: 'audio', label: '配音', icon: 'fas fa-microphone' },
        bgm: { key: 'bgm', label: 'BGM', icon: 'fas fa-music' },
        figures: { key: 'figures', label: '角色', icon: 'fas fa-user' },
        props: { key: 'props', label: '道具', icon: 'fas fa-cube' },
      }
      var statMap = {}
      for (var i = 0; i < this.stats.length; i++) {
        var s = this.stats[i]
        statMap[s.key || s.label] = s.count
      }
      var result = [{ key: '', label: '全部', icon: 'fas fa-th' }]
      var order = ['scenes', 'videos', 'audio', 'bgm', 'figures', 'props']
      for (var j = 0; j < order.length; j++) {
        var k = order[j]
        if (statMap[k] > 0 && filterMap[k]) {
          result.push(filterMap[k])
        }
      }
      return result
    }
  },
  methods: {
    getPublicUrl(filePath) {
      if (!filePath) return ''
      return filePath.replace('/www/wwwroot', '')
    },
    formatSize(bytes) {
      if (!bytes) return '0 B'
      if (bytes < 1024) return bytes + ' B'
      if (bytes < 1048576) return (bytes / 1024).toFixed(1) + ' KB'
      return (bytes / 1048576).toFixed(1) + ' MB'
    },
    formatDate(d) {
      if (!d) return ''
      var s = String(d)
      return s.slice(0, 10)
    },
    mediaTypeLabel(t) {
      var labels = {
        scenes: '场景',
        figures: '角色',
        videos: '视频',
        audio: '配音',
        bgm: 'BGM',
        props: '道具',
        actor: '演员',
      }
      return labels[t] || t
    },
    isImage(item) {
      return item && (item.media_type === 'figures' || item.media_type === 'scenes' || item.media_type === 'props')
    },
    onImgError(e) {
      var target = e.target || e
      if (target && target.tagName === 'IMG') {
        target.style.display = 'none'
        target.parentNode.classList.add('thumb-broken')
      }
    },
    triggerMediaUpload() {
      this.$refs.mediaUploadInput?.click()
    },
    handleMediaFileSelect(e) {
      var files = e.target?.files
      if (!files) return
      for (var i = 0; i < files.length; i++) { this.addToUploadQueue(files[i]) }
      e.target.value = ''
    },
    handleMediaDrop(e) {
      var files = e.dataTransfer?.files
      if (!files) return
      for (var i = 0; i < files.length; i++) { this.addToUploadQueue(files[i]) }
    },
    addToUploadQueue(file) {
      var preview = file.type.startsWith('image/') ? URL.createObjectURL(file) : ''
      this.uploadQueue.push({ file: file, name: file.name, size: file.size, type: file.type, preview: preview })
    },
    async startMediaUpload() {
      if (!this.licenseAgreed || this.uploadQueue.length === 0) return
      this.uploading = true
      this.uploadProgress = 0
      var successCount = 0
      var total = this.uploadQueue.length
      var self = this
      for (var i = 0; i < self.uploadQueue.length; i++) {
        var item = self.uploadQueue[i]
        self.uploadProgressText = '上传中 (' + (i + 1) + '/' + total + '): ' + item.name
        try {
          var formData = new FormData()
          formData.append('file', item.file)
          formData.append('media_type', self.detectMediaType(item.type))
          await new Promise(function(resolve, reject) {
            var xhr = new XMLHttpRequest()
            xhr.upload.onprogress = function(e) {
              if (e.lengthComputable) {
                var fileProgress = e.loaded / e.total
                self.uploadProgress = Math.round(((i + fileProgress) / total) * 100)
              }
            }
            xhr.onload = function() {
              if (xhr.status >= 200 && xhr.status < 300) { successCount++; resolve() }
              else { reject(new Error('HTTP ' + xhr.status)) }
            }
            xhr.onerror = function() { reject(new Error('Network error')) }
            xhr.open('POST', '/api/v1/media/upload')
            var token = localStorage.getItem('token')
            if (token) xhr.setRequestHeader('Authorization', 'Bearer ' + token)
            xhr.send(formData)
          })
        } catch (e) { console.error('Upload failed:', e) }
      }
      self.uploading = false
      self.uploadProgressText = '完成: ' + successCount + '/' + total
      self.uploadQueue = []
      setTimeout(function() {
        self.uploadProgressText = ''
        self.loadMedia(self.page)
        self.loadStats()
      }, 1500)
    },
    detectMediaType(mime) {
      if (mime.startsWith('image/')) return 'figures'
      if (mime.startsWith('video/')) return 'videos'
      if (mime.startsWith('audio/')) return 'audio'
      return 'props'
    },
    async loadMedia(p) {
      var seq = ++this._reqSeq
      if (p) this.page = p
      this.loading = true
      this.loadError = false
      try {
        const token = localStorage.getItem('token')
        const params = new URLSearchParams({ page: this.page, page_size: 12 })
        if (this.filterType) params.set('media_type', this.filterType)
        if (this.tab && this.tab !== 'all') params.set('filter', this.tab)
        const res = await fetch('/api/v1/media/library?' + params.toString(), {
          headers: { 'Authorization': 'Bearer ' + token }
        }).then(r => r.json())
        if (res.success) {
          if (seq !== this._reqSeq) return
          this.items = res.data?.items || res.items || []
          this.total = res.data?.total || res.total || 0
          this.totalPages = Math.ceil(this.total / 12)
          this.gridKey++
        } else {
          this.items = []
        }
      } catch (e) {
        if (seq !== this._reqSeq) return
        console.error('加载素材失败', e)
        this.loadError = true
      }
      this.loading = false
    },
    async loadStats() {
      try {
        const token = localStorage.getItem('token')
        const res = await fetch('/api/v1/media/librarystats', {
          headers: { 'Authorization': 'Bearer ' + token }
        }).then(r => r.json())
        if (res.success && res.data) {
          this.stats = [
            { key: 'scenes', label: '场景', icon: 'fas fa-image', count: res.data.scenes || 0 },
            { key: 'videos', label: '视频', icon: 'fas fa-film', count: res.data.videos || 0 },
            { key: 'audio', label: '配音', icon: 'fas fa-microphone', count: res.data.audio || 0 },
            { key: 'bgm', label: 'BGM', icon: 'fas fa-music', count: res.data.bgm || 0 },
            { key: 'figures', label: '角色', icon: 'fas fa-user', count: res.data.figures || 0 },
            { key: 'props', label: '道具', icon: 'fas fa-cube', count: res.data.props || 0 },
          ]
        }
      } catch(e) { console.error('加载统计失败:', e) }
    },
    previewItem(item) {
      this.previewItemData = item
      this.previewVisible = true
    },
    previewActor(a) {
      this.previewActorData = a
      this.previewActorVisible = true
    },
    async loadActors() {
      try {
        const token = localStorage.getItem('token')
        const res = await fetch('/api/v1/media/library?media_type=actor&page_size=80', {
          headers: { 'Authorization': 'Bearer ' + token }
        }).then(r => r.json())
        if (res.success) {
          this.actors = res.data?.items || []
          for (var i = 0; i < this.actors.length; i++) {
            var a = this.actors[i]
            if (a.tags) {
              var tagArr = a.tags.split(',')
              for (var j = 0; j < tagArr.length; j++) {
                var kv = tagArr[j].trim()
                if (kv.startsWith('actor_name:')) a.actor_name = kv.substring(11)
                if (kv.startsWith('actor_gender:')) a.actor_gender = kv.substring(13)
              }
            }
          }
        }
      } catch(e) { console.error('加载演员列表失败:', e) }
    },
    previewActorFile(e) {
      var f = e.target.files && e.target.files[0]
      if (!f) return
      this.actorFile = f
      var r = new FileReader()
      var self = this
      r.onload = function(ev) { self.actorPreview = ev.target.result }
      r.readAsDataURL(f)
    },
    async submitActor() {
      if (!this.actorFile || !this.actorName) {
        this.actorMsg = '请填写艺名并选择照片'
        return
      }
      var fd = new FormData()
      fd.append('file', this.actorFile)
      fd.append('media_type', 'actor')
      fd.append('actor_name', this.actorName)
      if (this.actorGender) fd.append('actor_gender', this.actorGender)
      var self = this
      try {
        var res = await fetch('/api/v1/media/library/upload2', {
          method: 'POST', body: fd
        }).then(function(r) { return r.json() })
        if (res.success) {
          self.actorMsg = '✅ 上传成功'
          self.actorPreview = null
          self.actorFile = null
          self.actorName = ''
          self.actorGender = ''
          self.loadActors()
        } else {
          self.actorMsg = '❌ ' + (res.error || '上传失败')
        }
      } catch(e) {
        self.actorMsg = '❌ 网络错误'
        console.error('actors upload:', e)
      }
    },
    async deleteItem(item) {
      if (!confirm('确认删除「' + (item.name || item.file_name) + '」？')) return
      try {
        const token = localStorage.getItem('token')
        const res = await fetch('/api/v1/media/library/' + item.id, {
          method: 'DELETE',
          headers: { 'Authorization': 'Bearer ' + token }
        }).then(r => r.json())
        if (res.success) {
          this.items = this.items.filter(i => i.id !== item.id)
          this.previewVisible = false
          this.loadStats()
        } else {
          alert('删除失败: ' + (res.error || '未知错误'))
        }
      } catch(e) { console.error('删除素材失败:', e) }
    }
  }
}
</script>

<style scoped>
.media-lib-page{padding:24px 32px;min-height:100vh;color:var(--text-primary);font-family:'Inter','Noto Sans SC',sans-serif}
.media-lib-header h2{margin:0;font-size:22px;color:var(--highlight)}
.media-lib-sub{color:var(--text-muted);font-size:12px;margin:6px 0 16px}
.media-lib-stats{display:flex;gap:16px;flex-wrap:wrap;margin-bottom:16px}
.media-stat{font-size:12px;color:var(--text-secondary)}
.media-stat strong{color:var(--highlight)}

/* Tabs */
.media-tabs{display:flex;gap:8px;margin-bottom:12px;flex-wrap:wrap}
.media-tab-btn{padding:6px 18px;border:1px solid var(--border);border-radius:20px;background:var(--bg-card);color:var(--text-secondary);cursor:pointer;font-size:12px;font-family:inherit;transition:all .25s}
.media-tab-btn:hover{border-color:var(--highlight);color:var(--text-primary)}
.media-tab-btn.active{background:var(--accent-glow);border-color:var(--highlight);color:var(--highlight);font-weight:600}

/* Filters */
.media-filters{display:flex;gap:6px;margin:0 0 20px;flex-wrap:wrap}
.media-filter-btn{padding:6px 12px;border:1px solid var(--border);border-radius:20px;background:var(--bg-card);color:var(--text-secondary);cursor:pointer;font-size:11px;transition:all .25s;font-family:inherit}
.media-filter-btn:hover{border-color:var(--highlight);color:var(--text-primary)}
.media-filter-btn.active{background:var(--accent-glow);border-color:var(--highlight);color:var(--highlight)}
.media-filter-btn i{margin-right:4px}

/* Upload section */
.media-upload-section,.actor-upload-section{background:var(--bg-card);border:1px solid var(--border);border-radius:var(--radius);padding:16px 20px;margin-bottom:16px}
.media-upload-title{font-size:14px;color:var(--highlight);margin:0;font-family:inherit;cursor:pointer}
.media-upload-box{display:flex;flex-direction:column;gap:12px;margin-top:12px}
.media-upload-dropzone{display:flex;flex-direction:column;align-items:center;gap:6px;padding:24px 20px;border:2px dashed rgba(0,255,255,0.2);border-radius:var(--radius);cursor:pointer;transition:all .2s;background:var(--accent-glow)}
.media-upload-dropzone:hover{border-color:rgba(0,255,255,0.4);background:rgba(0,255,255,0.04)}
.media-upload-dropzone i{font-size:28px;color:rgba(0,255,255,0.3)}
.media-upload-dropzone span{font-size:12px;color:var(--text-secondary)}
.media-upload-hint{font-size:10px!important;color:var(--text-muted)!important}
.media-upload-queue{border-top:1px solid var(--border);padding-top:12px}
.media-queue-header{font-size:12px;font-weight:600;color:var(--text-muted);margin-bottom:8px}
.media-queue-item{display:flex;align-items:center;gap:10px;padding:8px 10px;background:var(--bg-input);border-radius:var(--radius-sm);margin-bottom:6px}
.media-queue-preview{width:36px;height:36px;border-radius:6px;overflow:hidden;flex-shrink:0;background:var(--bg-card);display:flex;align-items:center;justify-content:center}
.media-queue-preview img{width:100%;height:100%;object-fit:cover}
.media-queue-icon{font-size:16px;color:var(--text-muted)}
.media-queue-info{flex:1;min-width:0}
.media-queue-name{font-size:12px;color:var(--text-primary);overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
.media-queue-size{font-size:10px;color:var(--text-muted)}
.media-queue-remove{background:none;border:none;color:var(--text-muted);cursor:pointer;padding:4px;font-size:12px}
.media-queue-remove:hover{color:var(--danger)}
.media-license{background:var(--bg-input);border:1px solid var(--border);border-radius:var(--radius);padding:10px}
.media-license-header{display:flex;justify-content:space-between;align-items:center}
.media-license-checkbox{display:flex;align-items:center;gap:6px;cursor:pointer;font-size:12px;color:var(--text-secondary)}
.media-license-checkbox input{accent-color:var(--highlight)}
.media-license-link{font-size:11px;color:var(--highlight);cursor:pointer;display:flex;align-items:center;gap:4px}
.media-license-body{margin-top:8px;padding-top:8px;border-top:1px solid var(--border)}
.media-license-body ol{margin:0;padding-left:18px;font-size:11px;color:var(--text-muted);line-height:1.8}
.media-upload-progress-wrap{display:flex;align-items:center;gap:10px}
.media-upload-progress-bar{flex:1;height:5px;background:var(--border);border-radius:3px;overflow:hidden}
.media-upload-progress-fill{height:100%;background:linear-gradient(90deg,var(--accent),var(--highlight));border-radius:3px;transition:width .3s}
.media-upload-progress-text{font-size:11px;color:var(--text-muted);white-space:nowrap;min-width:60px;text-align:right}

/* Actor */
.actor-upload-form{display:flex;flex-direction:column;gap:10px;margin-top:8px}
.actor-field-row{display:flex;gap:12px}
.actor-field.half{flex:1}
.actor-field label{display:block;font-size:12px;color:var(--text-muted);margin-bottom:4px}
.actor-input{width:100%;padding:8px 12px;border-radius:8px;border:1px solid var(--border);background:var(--bg-input);color:var(--text-primary);font-size:13px;box-sizing:border-box;font-family:inherit}
.actor-dropzone{border:2px dashed rgba(0,255,255,0.2);border-radius:var(--radius);padding:20px;text-align:center;cursor:pointer;color:var(--text-muted);background:var(--accent-glow);transition:all .2s}
.actor-dropzone:hover{border-color:rgba(0,255,255,0.4)}
.actor-dropzone p{margin:6px 0 0;font-size:12px}
.actor-preview{margin-top:6px;text-align:center}
.actor-preview img{max-width:160px;max-height:160px;border-radius:8px;border:2px solid var(--highlight)}
.actor-submit{background:linear-gradient(135deg,var(--accent),var(--highlight));color:var(--text-primary);border:none;padding:8px 20px;border-radius:8px;font-size:13px;font-weight:bold;cursor:pointer;display:flex;align-items:center;gap:6px;width:100%;justify-content:center;font-family:inherit}
.actor-msg{font-size:13px;color:var(--text-muted);margin:0;text-align:center}
.actor-grid{margin:12px 0 20px}
.actor-grid h3{font-size:15px;margin-bottom:10px;color:var(--highlight)}
.actor-grid-inner{display:grid;grid-template-columns:repeat(auto-fill,minmax(120px,1fr));gap:10px}
.actor-card{background:var(--bg-card);border:1px solid var(--border);border-radius:10px;overflow:hidden;transition:transform .2s}
.actor-card:hover{transform:translateY(-2px);border-color:var(--highlight)}
.actor-img{width:100%;aspect-ratio:1;overflow:hidden;cursor:pointer;background:var(--bg-input)}
.actor-img img{width:100%;height:100%;object-fit:cover}
.actor-name{padding:6px 8px;font-size:13px;font-weight:500;text-align:center;color:var(--text-primary)}

/* Media Grid */
.media-grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(200px,1fr));gap:14px}
.media-card{background:var(--bg-card);border:1px solid var(--border);border-radius:10px;overflow:hidden;cursor:pointer;transition:all .25s}
.media-card:hover{border-color:var(--highlight);transform:translateY(-3px);box-shadow:0 6px 24px var(--accent-glow)}
.media-thumb{position:relative;width:100%;height:160px;background:var(--bg-input);display:flex;align-items:center;justify-content:center;overflow:hidden}
.media-thumb img{width:100%;height:100%;object-fit:cover;transition:transform .3s}
.media-card:hover .media-thumb img{transform:scale(1.05)}
.media-thumb-video{width:100%;height:100%;position:relative}
.media-thumb-video video{width:100%;height:100%;object-fit:cover}
.media-video-overlay{position:absolute;inset:0;display:flex;align-items:center;justify-content:center;background:rgba(0,0,0,0.3);transition:opacity .3s}
.media-video-overlay i{font-size:40px;color:rgba(255,255,255,0.8)}
.media-card:hover .media-video-overlay{opacity:0.6}
.media-thumb-audio,.media-thumb-other{font-size:32px;color:var(--accent-glow)}
.media-thumb-bgm{font-size:32px;color:var(--highlight)}
.thumb-broken{background:var(--bg-card);min-height:160px;display:flex;align-items:center;justify-content:center}
.thumb-broken::after{content:'⚡';font-size:28px;opacity:.3}
/* Type tag */
.media-type-tag{position:absolute;top:8px;right:8px;padding:2px 8px;border-radius:6px;font-size:10px;font-weight:600;backdrop-filter:blur(4px);pointer-events:none}
.tag-scenes{background:rgba(0,200,255,0.7);color:#fff}
.tag-videos{background:rgba(255,100,200,0.75);color:#fff}
.tag-figures{background:rgba(100,255,200,0.7);color:#111}
.tag-audio{background:rgba(255,200,50,0.75);color:#111}
.tag-bgm{background:rgba(200,100,255,0.7);color:#fff}
.tag-props{background:rgba(150,150,150,0.7);color:#fff}
.tag-actor{background:rgba(255,150,50,0.75);color:#fff}

.media-info{padding:10px 12px}
.media-name{font-size:12px;color:var(--text-primary);white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
.media-meta{display:flex;gap:10px;align-items:center;margin-top:4px}
.media-date{font-size:10px;color:var(--text-muted)}
.media-size{font-size:10px;color:var(--text-muted);margin-left:auto}

/* Empty */
.media-empty{text-align:center;padding:60px 20px;color:var(--text-muted)}
.media-empty i{font-size:40px;display:block;margin-bottom:10px}
.loading-spinner{width:32px;height:32px;border:3px solid var(--border);border-top:3px solid var(--highlight);border-radius:50%;animation:spin .8s linear infinite;margin:0 auto 12px}
@keyframes spin{to{transform:rotate(360deg)}}

/* Pager */
.media-pager{display:flex;justify-content:center;align-items:center;gap:16px;margin-top:24px;padding:16px 0}
.media-pager button{padding:6px 16px;background:var(--bg-card);border:1px solid var(--border);border-radius:var(--radius-sm);color:var(--text-primary);cursor:pointer;font-family:inherit;font-size:12px;transition:.25s;display:flex;align-items:center;gap:6px}
.media-pager button:hover{border-color:var(--highlight)}
.media-pager button:disabled{opacity:.3;cursor:default}
.media-pager span{font-size:12px;color:var(--text-muted)}

/* Modal */
.media-modal-mask{position:fixed;inset:0;background:rgba(0,0,0,.75);display:flex;align-items:center;justify-content:center;z-index:1000;backdrop-filter:blur(2px)}
.media-modal{background:var(--bg-card);border:1px solid var(--border);border-radius:12px;padding:20px;max-width:640px;width:90%;max-height:90vh;overflow:auto}
.media-modal-header{display:flex;justify-content:space-between;align-items:center;margin-bottom:12px}
.media-modal-header span{font-size:14px;color:var(--highlight);font-weight:600}
.media-modal-header button{background:none;border:none;color:var(--text-secondary);font-size:18px;cursor:pointer;padding:4px}
.media-modal-body{margin-bottom:12px;text-align:center}
.media-modal-body img,.media-modal-body video{border-radius:8px;max-height:60vh}
.media-modal-file{text-align:center;padding:40px;color:var(--text-muted);font-size:36px}
.media-modal-footer{display:flex;align-items:center;gap:12px}
.media-modal-tag{padding:3px 10px;border-radius:6px;font-size:11px;font-weight:600}
.media-modal-actions{display:flex;gap:8px;margin-left:auto}
.btn{display:inline-flex;align-items:center;gap:6px;padding:7px 18px;border-radius:8px;font-size:12px;cursor:pointer;border:none;font-family:inherit;transition:.2s}
.btn-primary{background:linear-gradient(135deg,var(--accent),var(--highlight));color:var(--text-primary);font-weight:600}
.btn-primary:hover{opacity:.85}
.btn-ghost{background:var(--bg-card);color:var(--text-secondary);border:1px solid var(--border)}
.btn-ghost:hover{border-color:var(--danger);color:var(--danger)}

@media (max-width:768px){
  .media-lib-page{padding:16px}
  .media-grid{grid-template-columns:repeat(2,1fr);gap:10px}
  .media-thumb{height:120px}
  .actor-grid-inner{grid-template-columns:repeat(2,1fr)}
  .actor-field-row{flex-direction:column;gap:0}

.actor-card{position:relative}
.actor-delete{position:absolute;top:4px;right:4px;width:22px;height:22px;border-radius:50%;background:rgba(0,0,0,0.6);color:#fff;display:flex;align-items:center;justify-content:center;font-size:14px;cursor:pointer;opacity:0;transition:opacity 0.2s;z-index:2;line-height:22px}
.actor-card:hover .actor-delete{opacity:1}
.actor-delete:hover{background:rgba(255,50,50,0.8)}
}

/* ===== Mobile Responsive ===== */
@media (max-width: 768px) {
  .track-page, .result-page, .history-page, .profile-page, .cert-page { padding-bottom: 72px !important; }
  .page-wrap, .page-container, .container { padding: 0 12px 72px !important; }
}

</style>
