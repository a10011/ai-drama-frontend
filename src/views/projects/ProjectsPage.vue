<template>
<div class="projects-page">
  <div class="pp-header">
    <div><h1>我的作品</h1><p>共 {{ projects.length }} 部短剧</p></div>
    <button class="btn-primary" @click="$router.push('/create')">+ 新建短剧</button>
  </div>
  <div class="pp-filter">
    <span class="chip" :class="{on:filter==='all'}" @click="filter='all'">全部</span>
    <span class="chip" :class="{on:filter==='completed'}" @click="filter='completed'">已完成</span>
    <span class="chip" :class="{on:filter==='processing'}" @click="filter='processing'">进行中</span>
    <span class="chip" :class="{on:filter==='draft'}" @click="filter='draft'">草稿</span>
    <span class="chip" :class="{on:filter==='incomplete'}" @click="filter='incomplete'">未完成</span>
  </div>
  <div v-if="loading" class="empty"><p>加载中...</p></div>
  <div v-else-if="loadError" class="empty">
    <span>⚠️</span>
    <p>加载失败，请检查网络</p>
    <button class="btn-primary sm" @click="fetchProjects">重试</button>
  </div>
  <div v-else class="pp-grid">
    <div v-for="p in filtered" :key="p.id" class="pp-card" @click="go(p)">
      <div class="ppc-thumb">
        <div class="ppc-type">🎬 短剧</div>
        <div class="ppc-code">NO.{{ formatCode(p.id) }}</div>
        <div class="ppc-placeholder"><span>{{ (p.title||'未命名')[0] }}</span></div>
      </div>
      <div class="ppc-body">
        <h3>{{ p.title||'未命名' }}</h3>
        <div class="ppc-meta">
          <span class="ppc-date">{{ p.createdAt }}</span>
          <span class="ppc-status" :class="p.displayStatus">{{ p.statusText }}</span>
        </div>
        <div class="ppc-actions" @click.stop>
          <template v-if="isCompleted(p)">
            <button class="ppc-download-btn" @click="downloadProject(p)">📥 下载</button>
            <button class="ppc-delete-btn" @click="confirmDelete(p)">🗑️ 删除</button>
          </template>
          <template v-else>
            <button class="ppc-continue-btn" @click="continueProject(p)">▶ 继续</button>
            <button class="ppc-delete-btn" @click="confirmDelete(p)">🗑️ 删除</button>
          </template>
        </div>
        <div class="ppc-prog" v-if="p.progress != null">
          <div class="ppc-track"><div class="ppc-bar" :style="{width:(p.progress||0)+'%'}"></div></div>
          <span>{{ p.progress || 0 }}%</span>
        </div>
      </div>
    </div>
  </div>
  <div v-if="!loading && !loadError && filtered.length===0" class="empty"><span>🎬</span><p>还没有作品</p></div>
  
  <!-- 删除确认弹窗 -->
  <div v-if="showDeleteConfirm" class="delete-overlay" @click="cancelDelete">
    <div class="delete-modal" @click.stop>
      <div class="dm-icon">⚠️</div>
      <p class="dm-msg">确定删除《{{ deleteTarget?.title || '未命名' }}》吗？</p>
      <p class="dm-hint">此操作不可撤销，项目及关联数据将被永久删除</p>
      <div class="dm-btns">
        <button class="dm-cancel" @click="cancelDelete">取消</button>
        <button class="dm-confirm" @click="deleteProject">确认删除</button>
      </div>
    </div>
  </div>
</div>
</template>

<script setup>
import {ref,computed,onMounted} from 'vue'
import {useRouter} from 'vue-router'
import request from '@/utils/request'

const router=useRouter()
const filter=ref('all')
const loading=ref(true)
const loadError=ref(false)
const projects=ref([])

const filtered=computed(()=>{
  if(filter.value==='all')return projects.value
  if(filter.value==='incomplete')return projects.value.filter(p=>p.status!=='completed')
  return projects.value.filter(p=>p.displayStatus===filter.value)
})

function formatCode(id) {
  if (!id && id !== 0) return '0000'
  const n = typeof id === 'number' ? id : parseInt(String(id), 10)
  if (isNaN(n)) return String(id).padStart(4, '0')
  return String(n).padStart(4, '0')
}

async function fetchProjects(){
  loading.value=true
  loadError.value=false
  try{
    const data = await request({ url: '/api/v1/projects' })
    if(data.success){
      const statusLabel={active:'进行中',processing:'进行中',completed:'已完成',draft:'草稿'}
      const actionLabel={active:'继续创作',processing:'继续创作',completed:'查看详情',draft:'开始创作'}
      projects.value=(data.projects||[]).map(p=>{
        const st=p.status||'draft'
        return {
          ...p,
          displayStatus:st,
          statusText:statusLabel[st]||st,
          actionText:actionLabel[st]||'查看',
          createdAt:p.created?new Date(p.created*1000).toLocaleDateString('zh-CN'):''
        }
      })
    } else {
      projects.value = []
    }
  }catch(e){ console.error('加载项目失败',e); loadError.value=true }
  loading.value=false
}

function go(p){router.push('/track/'+p.id)}
function continueProject(p){router.push('/track/'+p.id)}

function isCompleted(p){
  if(p.status==='completed'||p.displayStatus==='completed')return true
  const prog=typeof p.progress==='number'?p.progress:parseFloat(p.progress)
  return p.progress>=100||(!isNaN(prog)&&prog>=100)
}

async function downloadProject(p){
  try{
    const data=await request({url:`/api/v1/projects/${p.id}/progress`})
    const video=data?.data?.stages?.find(s=>s.stage==='composite')?.data?.video_url
    if(video){window.open(video)}else{alert('暂无合成视频')}
  }catch(e){console.error('下载失败',e)}
}

const showDeleteConfirm=ref(false)
const deleteTarget=ref(null)
const deleting=ref(false)

function confirmDelete(p){
  deleteTarget.value=p
  showDeleteConfirm.value=true
}

function cancelDelete(){
  showDeleteConfirm.value=false
  deleteTarget.value=null
}

async function deleteProject(){
  if(!deleteTarget.value||deleting.value)return
  deleting.value=true
  try{
    const data=await request({
      url:`/api/v1/projects/${deleteTarget.value.id}`,
      method:'DELETE'
    })
    if(data&&data.success){
      projects.value=projects.value.filter(p=>p.id!==deleteTarget.value.id)
    }else{
      alert('删除失败：'+(data?.message||'未知错误'))
    }
  }catch(e){ console.error('删除失败',e); alert('删除失败，请重试') }
  finally{
    showDeleteConfirm.value=false
    deleteTarget.value=null
    deleting.value=false
  }
}

onMounted(fetchProjects)
</script>

<style scoped>
.projects-page{padding:24px 32px;width:100%;color:var(--text-primary);font-family:'Inter','Noto Sans SC',-apple-system,sans-serif}
.pp-header{display:flex;justify-content:space-between;align-items:center;margin-bottom:24px}
.pp-header h1{font-size:22px;color:var(--highlight)}.pp-header p{color:var(--text-secondary);font-size:13px;margin-top:4px}
.btn-primary{background:linear-gradient(135deg,var(--accent),var(--highlight));color: var(--text-primary);border:none;padding:10px 24px;border-radius:var(--radius-sm);font-family:'Inter','Noto Sans SC',-apple-system,sans-serif;font-size:13px;font-weight:bold;cursor:pointer;transition:.25s}
.btn-primary:hover{box-shadow:0 0 20px var(--accent-glow)}
.btn-primary.sm{padding:8px 18px;font-size:12px}
.pp-filter{display:flex;gap:8px;margin-bottom:20px;flex-wrap:wrap}
.chip{background:var(--bg-card);border:1px solid var(--border);color:var(--text-secondary);padding:6px 16px;border-radius:20px;font-size:12px;cursor:pointer;transition:.25s;white-space:nowrap;user-select:none}
.chip:hover,.chip.on{background:var(--accent-glow);border-color:var(--highlight);color:var(--highlight)}
.pp-grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(280px,1fr));gap:16px}
.pp-card{background:var(--bg-card);border:1px solid var(--border);border-radius:var(--radius);overflow:hidden;cursor:pointer;transition:.25s}
.pp-card:hover{border-color:var(--highlight);box-shadow:0 4px 20px var(--accent-glow)}
.ppc-thumb{position:relative;height:140px}
.ppc-type{position:absolute;top:8px;left:8px;background:rgba(0,0,0,.6);color:var(--highlight);padding:3px 10px;border-radius:4px;font-size:11px}
.ppc-code{position:absolute;top:8px;right:8px;background:rgba(0,0,0,.7);color:var(--text-secondary);padding:3px 10px;border-radius:4px;font-size:10px;letter-spacing:0.5px}
.ppc-placeholder{width:100%;height:100%;background:var(--bg-input);display:flex;align-items:center;justify-content:center;font-size:40px;color:var(--border)}
.ppc-body{padding:14px}
.ppc-body h3{font-size:15px;color:var(--text-primary);margin-bottom:8px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
.ppc-meta{display:flex;justify-content:space-between;font-size:11px;margin-bottom:10px}
.ppc-date{color:var(--text-muted)}.ppc-status{color:var(--text-secondary)}
.ppc-status.completed{color:var(--success)}.ppc-status.processing,.ppc-status.active{color:var(--highlight)}.ppc-status.draft{color:var(--warning)}
.ppc-actions{display:flex;justify-content:space-between;align-items:center;margin-bottom:8px;gap:8px}
.ppc-continue-btn{background:linear-gradient(135deg,var(--accent),var(--highlight));color: var(--text-primary);border:none;padding:4px 14px;border-radius:var(--radius-sm);font-size:11px;font-weight:bold;cursor:pointer;transition:.25s;white-space:nowrap}
.ppc-continue-btn:hover{box-shadow:0 0 20px var(--accent-glow);transform:scale(1.05)}
.ppc-download-btn{background:linear-gradient(135deg,var(--success),var(--success));color: var(--text-primary);border:none;padding:4px 14px;border-radius:var(--radius-sm);font-size:11px;font-weight:bold;cursor:pointer;transition:.25s;white-space:nowrap}
.ppc-download-btn:hover{box-shadow:0 2px 8px rgba(0,230,118,.4);transform:scale(1.05)}
.ppc-delete-btn{background:transparent;color:var(--danger);border:1px solid var(--danger);padding:3px 12px;border-radius:var(--radius-sm);font-size:11px;cursor:pointer;transition:.25s;white-space:nowrap}
.ppc-delete-btn:hover{background:rgba(255,82,82,.12);box-shadow:0 2px 8px rgba(255,82,82,.25);transform:scale(1.05)}
.ppc-prog{display:flex;align-items:center;gap:8px;font-size:11px;color:var(--text-secondary)}
.ppc-track{flex:1;height:3px;background:var(--border);border-radius:2px;overflow:hidden}
.ppc-bar{height:100%;background:linear-gradient(90deg,var(--accent),var(--highlight));border-radius:2px;transition:width .5s}
.empty{text-align:center;padding:60px 0;color:var(--text-muted)}.empty span{font-size:48px;display:block;margin-bottom:12px}
.empty .btn-primary{margin-top:12px}
/* 删除确认弹窗 */
.delete-overlay{position:fixed;inset:0;background:rgba(0,0,0,.6);display:flex;align-items:center;justify-content:center;z-index:9999}
.delete-modal{background:var(--bg-card);border:1px solid var(--border);border-radius:var(--radius);padding:32px 28px 24px;max-width:380px;width:90%;text-align:center}
.dm-icon{font-size:40px;margin-bottom:12px}
.dm-msg{color:var(--text-primary);font-size:15px;margin-bottom:6px;font-weight:bold}
.dm-hint{color:var(--text-muted);font-size:12px;margin-bottom:20px}
.dm-btns{display:flex;gap:12px;justify-content:center}
.dm-cancel{background:var(--border);color:var(--text-secondary);border:none;padding:8px 24px;border-radius:var(--radius-sm);font-size:13px;cursor:pointer;transition:.25s}
.dm-cancel:hover{background:var(--border);color:var(--text-primary)}
.dm-confirm{background:linear-gradient(135deg,var(--danger),var(--danger));color: var(--text-primary);border:none;padding:8px 24px;border-radius:var(--radius-sm);font-size:13px;font-weight:bold;cursor:pointer;transition:.25s}
.dm-confirm:hover{box-shadow:0 2px 12px rgba(255,82,82,.4);transform:scale(1.04)}
@media(max-width:768px){.pp-grid{grid-template-columns:1fr}.pp-header{flex-direction:column;gap:12px}}

/* ===== Mobile Responsive ===== */
@media (max-width: 768px) {
  .track-page, .result-page, .history-page, .profile-page, .cert-page { padding-bottom: 72px !important; }
  .page-wrap, .page-container, .container { padding: 0 12px 72px !important; }
}

</style>