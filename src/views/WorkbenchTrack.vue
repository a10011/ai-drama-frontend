<template>
  <div class="track-page">
    <!-- 内嵌模式：紧凑面板 -->
    <div class="track-panel" v-if="embedded">
      <div class="track-header">
        <span class="track-title">{{ taskName || '任务进度' }}</span>
        <div class="track-actions">
          <button class="btn btn-ghost btn-sm" @click="minimize">─ 最小化</button>
          <button class="btn btn-ghost btn-sm" @click="cancelTask" v-if="!done">✕ 取消</button>
        </div>
      </div>

      <!-- 胶片进度条 -->
      <div class="film-progress">
        <div class="progress-track">
          <div class="progress-segment" v-for="(seg, i) in segments" :key="i"
            :class="{ active: seg.status === 'running', done: seg.status === 'done', fail: seg.status === 'fail' }"
            :style="{ width: seg.width + '%' }">
            <div class="seg-inner"></div>
          </div>
        </div>
        <div class="progress-labels">
          <span v-for="(seg, i) in segments" :key="i" class="seg-label" :class="{ active: seg.status !== 'pending' }">
            {{ seg.label }}
          </span>
        </div>
      </div>

      <!-- 控制台日志 -->
      <div class="console-log" ref="consoleRef">
        <div v-for="(line, i) in logLines" :key="i" class="log-line" :class="line.level">
          <span class="log-time">{{ line.time }}</span>
          <span class="log-msg">{{ line.msg }}</span>
        </div>
      </div>

      <div class="track-footer" v-if="done">
        <button class="btn btn-primary btn-sm" @click="$emit('viewResult')">查看成果</button>
      </div>
    </div>

    <!-- 独立页面模式 -->
    <div class="track-standalone" v-else>
      <div class="standalone-header">
        <div class="section-title">任务进度</div>
        <div class="task-id">ID: {{ taskId }}</div>
      </div>

      <div class="standalone-body">
        <!-- 左侧参数快照 -->
        <div class="params-snapshot">
          <div class="snap-title">参数快照</div>
          <div class="snap-row"><span class="snap-label">类型</span><span class="snap-val">{{ taskType }}</span></div>
          <div class="snap-row"><span class="snap-label">状态</span><span class="snap-val" :class="statusClass">{{ statusText }}</span></div>
          <div class="snap-row"><span class="snap-label">创建</span><span class="snap-val">{{ createdAt }}</span></div>
        </div>

        <!-- 全屏进度 -->
        <div class="full-progress">
          <div class="film-progress large">
            <div class="progress-track">
              <div class="progress-segment" v-for="(seg, i) in segments" :key="i"
                :class="{ active: seg.status === 'running', done: seg.status === 'done', fail: seg.status === 'fail' }"
                :style="{ width: seg.width + '%' }">
                <div class="seg-inner"></div>
              </div>
            </div>
            <div class="progress-labels">
              <span v-for="(seg, i) in segments" :key="i" class="seg-label" :class="{ active: seg.status !== 'pending' }">
                {{ seg.label }}
              </span>
            </div>
          </div>

          <div class="console-log full" ref="consoleRef2">
            <div v-for="(line, i) in logLines" :key="i" class="log-line" :class="line.level">
              <span class="log-time">{{ line.time }}</span>
              <span class="log-msg">{{ line.msg }}</span>
            </div>
          </div>
        </div>
      </div>

      <div class="standalone-footer">
        <button class="btn btn-ghost" @click="$router.push('/')">← 返回工作台</button>
        <button v-if="done" class="btn btn-primary" @click="$router.push('/result/' + taskId)">查看成果</button>
      </div>
    </div>
  </div>
</template>

<script>
import axios from 'axios'

export default {
  name: 'WorkbenchTrack',
  props: {
    taskId: { type: String, default: '' },
    embedded: { type: Boolean, default: false },
  },
  emits: ['minimize', 'viewResult'],
  data() {
    return {
      taskName: '',
      taskType: '短剧创作',
      status: 'running',
      createdAt: '--',
      segments: [
        { label: '参数校验', width: 15, status: 'done' },
        { label: 'AI 生成', width: 25, status: 'running' },
        { label: '镜头拆分', width: 25, status: 'pending' },
        { label: '合规检测', width: 20, status: 'pending' },
        { label: '整理输出', width: 15, status: 'pending' },
      ],
      logLines: [
        { time: '00:00', msg: '任务已创建', level: 'info' },
        { time: '00:01', msg: '参数校验通过', level: 'info' },
        { time: '00:02', msg: 'AI 模型加载中...', level: 'info' },
      ],
      done: false,
      pollTimer: null,
    }
  },
  computed: {
    statusClass() {
      return this.status === 'done' ? 'color-green' : this.status === 'fail' ? 'color-red' : 'color-blue'
    },
    statusText() {
      return { running: '进行中', done: '已完成', fail: '失败' }[this.status] || '未知'
    },
  },
  methods: {
    minimize() { this.$emit('minimize') },
    async cancelTask() {
      if (!this.taskId) return
      try {
        await axios.delete('/api/v1/pipeline/delete/' + (this.pipelineId || ''), { task_id: this.taskId })
        this.logLines.push({ time: this.clock(), msg: '任务已取消', level: 'warn' })
      } catch (e) {}
    },
    clock() {
      const d = new Date()
      return String(d.getMinutes()).padStart(2,'0') + ':' + String(d.getSeconds()).padStart(2,'0')
    },
    async pollStatus() {
      if (!this.taskId) return
      try {
        const r = await axios.get('/api/v1/pipeline/status/' + this.taskId)
        if (r.data.success) {
          const data = r.data.data || r.data
          this.status = data.status || 'running'
          this.done = this.status === 'done' || this.status === 'fail'
          if (data.logs) {
            this.logLines = data.logs.map(l => ({ time: l.time, msg: l.msg, level: l.level || 'info' }))
          }
          if (data.stages) {
            this.segments = data.stages.map(s => ({
              label: s.name,
              width: s.width || 20,
              status: s.status || 'pending',
            }))
          }
          if (this.done) this.stopPoll()
        }
      } catch (e) { /* ignore */ }
    },
    startPoll() {
      this.stopPoll()
      this.pollTimer = setInterval(() => this.pollStatus(), 3000)
    },
    stopPoll() {
      if (this.pollTimer) { clearInterval(this.pollTimer); this.pollTimer = null }
    },
  },
  mounted() {
    if (this.taskId) this.startPoll()
  },
  beforeUnmount() { this.stopPoll() },
}
</script>

<style scoped>
.track-page { font-size: 12px; }

/* 内嵌面板 */
.track-panel {
  padding: 14px;
  background: var(--bg-panel);
  border-top: 1px solid var(--border-main);
}
.track-header {
  display: flex; justify-content: space-between; align-items: center;
  margin-bottom: 12px;
}
.track-title { font-weight: 600; font-size: 13px; }
.track-actions { display: flex; gap: 6px; }

/* 胶片进度 */
.film-progress { margin-bottom: 10px; }
.progress-track {
  display: flex; height: 6px;
  border-radius: 3px; overflow: hidden;
  background: var(--bg-deep);
}
.progress-segment {
  height: 100%;
  transition: all 0.3s ease;
  border-right: 1px solid var(--bg-panel);
}
.progress-segment:last-child { border-right: none; }
.seg-inner { height: 100%; width: 100%; }
.progress-segment.done .seg-inner { background: var(--green); }
.progress-segment.active .seg-inner { background: var(--blue); animation: pulse 1.5s infinite; }
.progress-segment.fail .seg-inner { background: var(--red); }
.progress-segment.pending .seg-inner { background: var(--border-light); }
@keyframes pulse {
  0% { opacity: 0.6; } 50% { opacity: 1; } 100% { opacity: 0.6; }
}
.progress-labels {
  display: flex; margin-top: 4px; gap: 0;
}
.seg-label {
  font-size: 10px; color: var(--text-muted);
  text-align: center; flex: 1; white-space: nowrap;
}
.seg-label.active { color: var(--text-secondary); }

.large .progress-track { height: 10px; }
.large .seg-label { font-size: 11px; }

/* 控制台日志 */
.console-log {
  max-height: 120px; overflow-y: auto;
  background: var(--bg-deep);
  border-radius: var(--radius);
  padding: 8px 10px;
  font-family: 'Consolas', 'Courier New', monospace;
  font-size: 11px;
  line-height: 1.6;
}
.console-log.full { max-height: 280px; }
.log-line { display: flex; gap: 10px; }
.log-time { color: var(--text-muted); flex-shrink: 0; }
.log-msg { color: var(--text-secondary); }
.log-line.warn .log-msg { color: var(--yellow); }
.log-line.error .log-msg { color: var(--red); }

.track-footer { margin-top: 10px; text-align: right; }

/* 独立页面版 */
.track-standalone { padding: 20px 24px; }
.standalone-header { margin-bottom: 20px; display: flex; justify-content: space-between; align-items: center; }
.task-id { font-size: 11px; color: var(--text-muted); }
.standalone-body { display: flex; gap: 20px; }
.params-snapshot {
  width: 200px; flex-shrink: 0;
  padding: 14px; background: var(--bg-surface);
  border: 1px solid var(--border-main); border-radius: var(--radius);
}
.snap-title { font-weight: 600; margin-bottom: 10px; }
.snap-row { display: flex; justify-content: space-between; padding: 5px 0; font-size: 11px; }
.snap-label { color: var(--text-muted); }
.snap-val { color: var(--text-primary); }
.full-progress { flex: 1; }
.standalone-footer { margin-top: 16px; display: flex; justify-content: space-between; }
.color-green { color: var(--green); }
.color-red { color: var(--red); }
.color-blue { color: var(--blue); }

@media (max-width: 768px) {
  .standalone-body { flex-direction: column; }
  .params-snapshot { width: 100%; }
}
</style>
