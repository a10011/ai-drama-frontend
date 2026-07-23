<template>
  <div class="create-page">
    <!-- 返回首页 -->
    <button class="back-btn" @click="$router.push('/')">← 返回首页</button>

    <h1 class="page-title">新短剧创作</h1>

    <div class="create-layout">
      <!-- 左侧：剧本输入 -->
      <div class="script-area">
        <textarea
          v-model="script"
          class="script-textarea"
          placeholder="请输入或粘贴你的剧本...&#10;&#10;第一场：办公室&#10;主角坐在工位上，突然绿植开口说话..."
        ></textarea>

        <div class="file-upload-section">
          <label for="file-upload" class="file-label">
            📁 上传剧本文件
          </label>
          <input
            type="file"
            id="file-upload"
            accept=".txt,.doc,.docx,.pdf"
            style="display: none;"
            @change="handleFileChange"
          />
          <p class="upload-hint">支持 txt、doc、docx、pdf 格式</p>
          <div v-if="fileName" class="file-name">{{ fileName }}（已选择）</div>
        </div>
      </div>

      <!-- 右侧：设置面板 -->
      <div class="settings-panel">
        <div class="setting-item">
          <div class="setting-label">视频风格</div>
          <div
            v-for="style in styles"
            :key="style.value"
            :class="['option-item', { selected: selectedStyle === style.value }]"
            @click="selectedStyle = style.value"
          >
            {{ style.label }}
          </div>
        </div>

        <div class="setting-item">
          <div class="setting-label">视频时长</div>
          <div
            v-for="duration in durations"
            :key="duration.value"
            :class="['option-item', { selected: selectedDuration === duration.value }]"
            @click="selectedDuration = duration.value"
          >
            {{ duration.label }}
          </div>
        </div>

        <div class="setting-item">
          <div class="setting-label">分辨率</div>
          <div
            v-for="resolution in resolutions"
            :key="resolution.value"
            :class="['option-item', { selected: selectedResolution === resolution.value }]"
            @click="selectedResolution = resolution.value"
          >
            {{ resolution.label }}
          </div>
        </div>
      </div>
    </div>

    <div class="submit-section">
      <button class="submit-btn" @click="submitScript">提交给导演制作</button>
    </div>
  </div>
</template>

<script>
export default {
  data() {
    return {
      script: '',
      fileName: '',
      selectedStyle: '写实风格',
      selectedDuration: '3分钟',
      selectedResolution: '1080P',
      styles: [
        { label: '○ 写实风格', value: 'realistic' },
        { label: '○ 动漫风格', value: 'anime' },
        { label: '○ 3D 风格', value: '3d' },
      ],
      durations: [
        { label: '○ 1分钟', value: '1min' },
        { label: '○ 3分钟', value: '3min' },
        { label: '○ 5分钟', value: '5min' },
      ],
      resolutions: [
        { label: '● 1080P', value: '1080p' },
        { label: '● 4K', value: '4k' },
      ],
    }
  },
  methods: {
    handleFileChange(event) {
      const file = event.target.files[0]
      if (file) {
        this.fileName = file.name
        console.log('Uploaded file:', file.name, file.size)
      }
    },
    submitScript() {
      if (!this.script.trim() && !this.fileName) {
        alert('请输入剧本或上传剧本文件')
        return
      }
      // TODO: 调用后端 API
      alert('脚本已提交！')
      this.$router.push('/projects')
    },
  }
}
</script>

<style scoped>
.create-page {
  padding: 40px 30px;
  max-width: 1400px;
  margin: 0 auto;
  background: #f5f7fa;
  color: #1e293b;
  min-height: calc(100vh - 70px);
}

.back-btn {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 12px 24px;
  background: white;
  border: 2px solid #e2e8f0;
  border-radius: 10px;
  font-size: 16px;
  color: #475569;
  cursor: pointer;
  margin-bottom: 24px;
  transition: all 0.2s;
}
.back-btn:hover { border-color: #2563eb; color: #2563eb; }

.page-title {
  font-size: 42px;
  font-weight: 800;
  margin-bottom: 32px;
  color: #1e293b;
}

.create-layout {
  display: grid;
  grid-template-columns: 1fr 350px;
  gap: 32px;
  margin-bottom: 32px;
}

.script-area {
  background: white;
  padding: 32px;
  border-radius: 16px;
  box-shadow: 0 4px 6px rgba(0,0,0,0.06);
}

.script-textarea {
  width: 100%;
  min-height: 450px;
  padding: 24px;
  border: 3px solid #e2e8f0;
  border-radius: 12px;
  font-size: 18px;
  line-height: 1.8;
  resize: vertical;
  outline: none;
  transition: border-color 0.2s;
}
.script-textarea:focus { border-color: #2563eb; }
.script-textarea::placeholder { color: #94a3b8; }

.file-upload-section {
  margin-top: 24px;
  text-align: center;
  padding-top: 24px;
  border-top: 1px dashed #e2e8f0;
}

.file-label {
  display: inline-block;
  padding: 14px 36px;
  background: #f1f5f9;
  color: #475569;
  border-radius: 10px;
  cursor: pointer;
  font-size: 18px;
  font-weight: 600;
  transition: all 0.2s;
}
.file-label:hover { background: #e2e8f0; color: #1e293b; }

.upload-hint {
  margin-top: 12px;
  font-size: 15px;
  color: #94a3b8;
}

.file-name {
  margin-top: 8px;
  font-size: 14px;
  color: #2563eb;
  font-weight: 600;
}

.settings-panel {
  background: white;
  padding: 24px;
  border-radius: 16px;
  box-shadow: 0 4px 6px rgba(0,0,0,0.06);
  height: fit-content;
}

.setting-item {
  margin-bottom: 28px;
}
.setting-item:last-child { margin-bottom: 0; }

.setting-label {
  font-size: 18px;
  font-weight: 700;
  margin-bottom: 14px;
  color: #1e293b;
}

.setting-options {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.option-item {
  padding: 14px 16px;
  border: 2px solid #e2e8f0;
  border-radius: 10px;
  cursor: pointer;
  transition: all 0.2s;
  font-size: 17px;
  color: #475569;
}
.option-item:hover { border-color: #2563eb; }
.option-item.selected {
  border-color: #2563eb;
  background: #eff6ff;
  color: #1e40af;
  font-weight: 600;
}

.submit-section {
  text-align: center;
  margin-top: 32px;
}

.submit-btn {
  padding: 22px 70px;
  background: #2563eb;
  color: white;
  border: none;
  border-radius: 14px;
  font-size: 26px;
  font-weight: 700;
  cursor: pointer;
  transition: all 0.2s;
  box-shadow: 0 4px 12px rgba(37,99,235,0.3);
}
.submit-btn:hover {
  background: #1d4ed8;
  transform: translateY(-2px);
  box-shadow: 0 8px 24px rgba(37,99,235,0.4);
}

@media (max-width: 1024px) {
  .create-layout {
    grid-template-columns: 1fr;
  }
  .settings-panel {
    order: -1;
  }
}

@media (max-width: 768px) {
  .create-page { padding: 24px 16px; }
  .page-title { font-size: 28px; }
  .script-textarea { min-height: 300px; padding: 16px; font-size: 16px; }
  .submit-btn { font-size: 20px; padding: 16px 40px; }
  .settings-panel { padding: 20px; }
}
</style>
