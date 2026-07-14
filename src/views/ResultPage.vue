<template>
  <div class="result-page">
    <div class="card">
      <h2>作品详情</h2>
      <div v-if="loading" class="empty">加载中...</div>
      <div v-else-if="loadError" class="empty">
        <span>⚠️</span>
        <p>加载失败</p>
        <button class="btn-retry" @click="load">重试</button>
      </div>
      <template v-else>
        <div v-if="videoUrl" class="video-wrap">
          <video :src="videoUrl" controls style="width:100%;border-radius:8px;max-height:400px"></video>
        </div>
        <div v-else class="no-video">暂无视频</div>
        <div class="actions-bar" v-if="videoUrl">
          <a :href="videoUrl" download class="btn btn-outline">下载视频</a>
        </div>
      </template>
    </div>

    <!-- 项目基本信息卡片 -->
    <div class="card" style="margin-top:16px" v-if="!loading && detail.title">
      <h2>📋 项目信息</h2>
      <div class="info-grid">
        <div class="info-row" v-if="detail.title">
          <span class="info-label">标题</span>
          <span class="info-value">{{ detail.title }}</span>
        </div>
        <div class="info-row" v-if="detail.status">
          <span class="info-label">状态</span>
          <span class="info-value status-tag" :class="detail.status">{{ statusMap[detail.status] || detail.status }}</span>
        </div>
        <div class="info-row" v-if="detail.created_at">
          <span class="info-label">创建时间</span>
          <span class="info-value">{{ formatTime(detail.created_at) }}</span>
        </div>
      </div>
    </div>

    <!-- 费用明细卡片 -->
    <div class="card" style="margin-top:16px" v-if="orderData">
      <h2>💰 费用明细</h2>
      <div class="cost-summary">
        <div class="cost-row">
          <span class="cost-label">预估费用</span>
          <span class="cost-value">¥{{ orderData.estimated_cost != null ? Number(orderData.estimated_cost).toFixed(2) : '0.00' }}</span>
        </div>
        <div class="cost-row">
          <span class="cost-label">实际费用</span>
          <span class="cost-value actual">¥{{ orderData.actual_cost != null ? Number(orderData.actual_cost).toFixed(2) : '--' }}</span>
        </div>
        <div class="cost-row" v-if="orderData.refund_amount !== undefined || orderData.diff !== undefined">
          <span class="cost-label" :class="{ refund: diffAmount > 0, extra: diffAmount < 0 }">
            {{ diffAmount > 0 ? '🟢 退还' : diffAmount < 0 ? '🔴 补扣' : '✅ 持平' }}
          </span>
          <span class="cost-value" :class="{ refund: diffAmount > 0, extra: diffAmount < 0 }">
            {{ diffAmount > 0 ? '+¥' + diffAmount.toFixed(2) : diffAmount < 0 ? '-¥' + Math.abs(diffAmount).toFixed(2) : '¥0.00' }}
          </span>
        </div>
      </div>
    </div>

    <div class="card" style="margin-top:16px">
      <h2>角色管理 <span class="count-badge">{{ chars.length }}个角色</span></h2>
      <div class="char-grid">
        <div v-for="(c,i) in chars" :key="i" class="char-card">
          <div class="char-avatar" @click="triggerUpload(i)">
            <img v-if="c.image_url" :src="c.image_url" />
            <div v-else class="no-avatar">无图</div>
            <div class="upload-overlay">📷 替换</div>
          </div>
          <input ref="fileInputs" type="file" accept="image/*" hidden @change="handleUpload(i,$event)" />
          <div class="char-name">{{ c.name }}</div>
          <div class="char-actions">
            <button class="btn-xs" @click="generateOne(i)" :disabled="c.generating" v-if="!c.image_url">AI生成</button>
            <button class="btn-xs btn-outline" @click="removeImg(i)" v-if="c.image_url">重置</button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
<script>
export default {
  data(){return{id:this.$route.params.id,videoUrl:'',chars:[],detail:{},orderData:null,loading:true,loadError:false,statusMap:{completed:'已完成',succeeded:'已完成',running:'运行中',processing:'进行中',failed:'失败',draft:'草稿'}}},
  computed:{
    diffAmount(){
      const o=this.orderData
      if(!o)return 0
      if(o.refund_amount!==undefined&&o.refund_amount!==null)return Number(o.refund_amount)
      return (Number(o.estimated_cost||0)-Number(o.actual_cost||0))
    }
  },
  methods:{
    async load(){
      this.loading=true
      this.loadError=false
      try{
        const token=localStorage.getItem('token')
        const headers={'Authorization':'Bearer '+token}
        // 加载项目进度（含成片视频）
        const r=await(await fetch('/api/v1/pipeline/status/'+this.id,{headers})).json()
        if(r.success){
          this.detail=r.data||r
          this.videoUrl=r.data?.final_url||r.data?.video_url||''
          if(r.data?.characters)this.chars=r.data.characters.map(c=>({...c,generating:false}))
        }
        // 加载项目详情
        try{
          const pd=await(await fetch('/api/v1/projects/'+this.id,{headers})).json()
          if(pd.success){this.detail={...this.detail,...(pd.data||pd)}}
        }catch(e){console.warn('加载项目详情失败:',e)}
        // 加载角色
        try{
          const c=await(await fetch('/v2/characters/personal',{headers})).json()
          if(c.success&&c.data.characters&&c.data.characters.length>this.chars.length)this.chars=c.data.characters.map(x=>({...x,generating:false}))
        }catch(e){}
        // 加载订单费用
        try{
          const o=await(await fetch('/api/v1/orders/my',{headers})).json()
          if(o.success&&o.data){
            const orders=Array.isArray(o.data)?o.data:(o.data.orders||o.data.items||[])
            const matchingOrder=orders.find(or=>or.project_id==this.id)
            if(matchingOrder)this.orderData=matchingOrder
          }
        }catch(e){console.warn('加载订单费用失败:',e)}
      }catch(e){console.error('加载作品详情失败',e);this.loadError=true}
      this.loading=false
    },
    triggerUpload(i){this.$refs.fileInputs[i]?.click()},
    formatTime(t){
      if(!t)return''
      const d=new Date(typeof t==='number'?t*1000:t)
      return d.toLocaleString('zh-CN')
    },
    async handleUpload(i,e){
      const f=e.target.files[0];if(!f)return
      const fd=new FormData();fd.append('file',f)
      try{
        const token=localStorage.getItem('token')
        const r=await(await fetch('/v2/assets/upload',{method:'POST',headers:{'Authorization':'Bearer '+token},body:fd})).json()
        if(r.success){
          this.chars[i].image_url=r.data.url
          this.chars[i].ref_image_url=r.data.url
          await fetch('/v2/characters/personal/'+encodeURIComponent(this.chars[i].name),{method:'PUT',headers:{'Content-Type':'application/json','Authorization':'Bearer '+token},body:JSON.stringify({image_url:r.data.url,ref_image_url:r.data.url})})
        }
      }catch(e){}
    },
    async generateOne(i){
      this.chars[i].generating=true
      try{
        const token=localStorage.getItem('token')
        const r=await(await fetch('/v2/characters/'+encodeURIComponent(this.chars[i].name)+'/generate',{method:'POST',headers:{'Authorization':'Bearer '+token}})).json()
        if(r.success&&r.data?.image_url)this.chars[i].image_url=r.data.image_url
      }catch(e){}finally{this.chars[i].generating=false}
    },
    removeImg(i){this.chars[i].image_url='';this.chars[i].ref_image_url=''}
  },
  mounted(){this.load()}
}
</script>
<style scoped>
.result-page{max-width:800px;margin:0 auto}
.card{background:var(--bg-card);border:1px solid var(--border);border-radius:var(--radius);padding:24px}
.card h2{font-size:18px;margin-bottom:16px;display:flex;align-items:center;gap:8px;color:var(--text-primary)}
.count-badge{background:var(--accent-glow);color:var(--highlight);padding:2px 10px;border-radius:10px;font-size:12px}
.video-wrap{margin-bottom:12px}
.no-video{padding:40px;text-align:center;background:var(--bg-input);border-radius:var(--radius-sm);color:var(--text-muted);font-size:14px}
.actions-bar{margin-top:8px}
.empty{padding:40px;text-align:center;color:var(--text-muted)}
.btn-retry{margin-top:12px;padding:8px 20px;background:linear-gradient(135deg,var(--accent),var(--highlight));color:var(--text-primary);border:none;border-radius:var(--radius-sm);font-size:13px;cursor:pointer}
.btn{padding:8px 20px;border:none;border-radius:var(--radius-sm);font-size:13px;cursor:pointer;font-weight:600;display:inline-block;text-decoration:none}
.btn-outline{background:var(--bg-card);border:1px solid var(--border);color:var(--text-secondary)}
.char-grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(120px,1fr));gap:12px}
.char-card{text-align:center;padding:12px;border-radius:var(--radius-sm);border:1px solid var(--border)}
.char-avatar{width:80px;height:80px;border-radius:50%;margin:0 auto 8px;overflow:hidden;position:relative;cursor:pointer;background:var(--bg-input)}
.char-avatar img{width:100%;height:100%;object-fit:cover}
.no-avatar{width:100%;height:100%;display:flex;align-items:center;justify-content:center;color:var(--text-muted);font-size:12px}
.upload-overlay{position:absolute;bottom:0;left:0;right:0;background:rgba(0,0,0,.5);color:var(--text-primary);font-size:11px;padding:4px;display:none}
.char-avatar:hover .upload-overlay{display:block}
.char-name{font-size:13px;font-weight:500;margin-bottom:6px;color:var(--text-primary)}
.char-actions{display:flex;gap:4px;justify-content:center}
.btn-xs{padding:4px 10px;border:none;border-radius:var(--radius-sm);font-size:11px;cursor:pointer;background:linear-gradient(135deg,var(--accent),var(--highlight));color: var(--text-primary)}
.btn-xs:disabled{opacity:.5}
.btn-xs.btn-outline{background:var(--bg-card);border:1px solid var(--border);color:var(--text-secondary)}
.info-grid{display:flex;flex-direction:column;gap:10px}
.info-row{display:flex;justify-content:space-between;align-items:center;padding:8px 12px;background:var(--bg-input);border-radius:var(--radius-sm)}
.info-label{font-size:13px;color:var(--text-secondary)}
.info-value{font-size:14px;color:var(--text-primary);font-weight:500}
.status-tag{padding:2px 10px;border-radius:10px;font-size:12px}
.status-tag.completed,.status-tag.succeeded{background:rgba(0,230,118,.1);color:var(--success)}
.status-tag.running,.status-tag.processing{background:var(--accent-glow);color:var(--highlight)}
.status-tag.failed{background:rgba(255,82,82,.1);color:var(--danger)}
.status-tag.draft{background:var(--bg-input);color:var(--text-muted)}
.cost-summary{display:flex;flex-direction:column;gap:10px}
.cost-row{display:flex;justify-content:space-between;align-items:center;padding:8px 12px;background:var(--bg-input);border-radius:var(--radius-sm)}
.cost-label{font-size:13px;color:var(--text-secondary)}
.cost-value{font-size:14px;font-weight:bold;color:var(--text-primary)}
.cost-value.actual{color:var(--highlight)}
.cost-label.refund{color:var(--success)}
.cost-value.refund{color:var(--success);font-weight:bold}
.cost-label.extra{color:var(--danger)}
.cost-value.extra{color:var(--danger);font-weight:bold}

@media (max-width: 768px) {
  .result-page { padding: 0 12px 72px; }
  .card { padding: 16px; }
  .card h2 { font-size: 16px; }
  .char-grid { grid-template-columns: repeat(2, 1fr); gap: 8px; }
  .char-card { padding: 8px; }
  .char-avatar { width: 64px; height: 64px; }
  .info-grid { gap: 6px; }
  .info-row { padding: 6px 10px; flex-direction: column; align-items: flex-start; gap: 4px; }
  .cost-row { padding: 6px 10px; }
}

/* ===== Mobile Responsive ===== */
@media (max-width: 768px) {
  .main-content { padding-bottom: 72px !important; }
}

</style>
