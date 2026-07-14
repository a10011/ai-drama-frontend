<template>
<div class="script-upload">
  <h2 class="title">📤 上传剧本</h2>
  <p class="sub">粘贴你的剧本，或输入梗概让AI帮你写</p>

  <!-- 粘贴模式 -->
  <div class="upload-area" :class="{active:mode==='paste',dirty:scriptText}">
    <textarea v-model="scriptText" placeholder="在这里粘贴你的剧本..." class="script-input" @focus="mode='paste'" :disabled="submitting"></textarea>
    <div class="char-count">{{ scriptText.length }} 字</div>
  </div>

  <div class="divider-text">
    <span class="div-line"></span><span class="div-word">或</span><span class="div-line"></span>
  </div>

  <!-- AI生成模式 -->
  <div class="gen-area" :class="{active:mode==='gen'}">
    <div class="genre-row">
      <span v-for="g in genres" :key="g.id" class="genre-chip" :class="{on:selectedGenre===g.id}" @click="selectGenre(g)">{{ g.icon }} {{ g.name }}</span>
    </div>
    <textarea v-model="synopsis" placeholder="描述你想要的短剧剧情梗概..." class="synopsis-input" @focus="mode='gen'" :disabled="submitting"></textarea>
    <button class="btn-gen" @click="aiGenerate" :disabled="submitting||!canGen">
      <span v-if="submitting">⏳ 处理中...</span>
      <span v-else-if="scriptText.trim()">🤖 AI分析润色剧本</span>
      <span v-else>🤖 AI生成剧本</span>
    </button>
  </div>

  <div class="bar">
    <button class="btn gold" @click="go" :disabled="!scriptText.trim() || submitting">
      {{ submitting ? '⏳ 请稍候...' : '下一步：导演分析 →' }}
    </button>
  </div>
</div>
</template>

<script setup>
import {ref,computed} from 'vue'
import request from '@/utils/request'
const emit=defineEmits(['next','retry'])
const scriptText=ref('')
const synopsis=ref('')
const mode=ref('paste')
const selectedGenre=ref('urban')
const submitting=ref(false)

const genres=[
  {id:'urban',name:'都市',icon:'🏙️'},{id:'romance',name:'甜宠',icon:'💕'},
  {id:'suspense',name:'悬疑',icon:'🔍'},{id:'xianxia',name:'仙侠',icon:'🏔️'},
  {id:'comedy',name:'喜剧',icon:'😂'},{id:'scifi',name:'科幻',icon:'🚀'},
]
const canGen=computed(()=>scriptText.value.trim().length>=10||synopsis.value.trim().length>=10)

function selectGenre(g){if(submitting.value)return;selectedGenre.value=g.id;mode.value='gen'}
async function aiGenerate(){
  if(submitting.value) return
  const input=scriptText.value.trim()||synopsis.value.trim()
  if(!input)return
  submitting.value=true
  try{
    const data=await request({url:'/api/v1/pipeline/start',method:'POST',data:{
      genre:selectedGenre.value,
      synopsis:scriptText.value.trim()||synopsis.value.trim(),
      mode:'script_only'
    }})
    if(data?.success&&data?.script){
      scriptText.value=data.script;localStorage.setItem("__DRAMA_SCRIPT__",data.script);localStorage.setItem("__DRAMA_GENRE__",selectedGenre.value);localStorage.removeItem("__DRAMA_CHARS__")
      // AI生成成功 → 自动跳到剧本查看阶段
      setTimeout(()=>{emit('next',{script:data.script,genre:selectedGenre.value})},600)
      return
    }
    alert(data?.message||'AI生成失败，请重试')
  }catch(e){
    alert('网络错误，请重试')
  }finally{
    submitting.value=false
  }
}

function go(){
  if(submitting.value) return
  if(scriptText.value.trim()){
    submitting.value=true
    localStorage.setItem('__DRAMA_SCRIPT__',scriptText.value.trim());localStorage.setItem('__DRAMA_GENRE__',selectedGenre.value);localStorage.removeItem('__DRAMA_CHARS__');emit('next',{script:scriptText.value.trim(),genre:selectedGenre.value})
    setTimeout(()=>{ submitting.value=false }, 2000)
  }
}
</script>

<style scoped>
.script-upload{padding:24px 32px;color:#e8e4dc;font-family:Consolas,monospace;height:100%;display:flex;flex-direction:column}
.title{color:#c49b4a;font-size:20px;margin-bottom:4px}
.sub{color:#666;font-size:12px;margin-bottom:20px}
.upload-area{transition:.25s;flex:1;display:flex;flex-direction:column}
.upload-area.active{border-color:#c49b4a}
.script-input{flex:1;width:100%;background:#0d0d0d;border:2px dashed #222;border-radius:10px;color:#e8e4dc;padding:20px;font-family:Consolas,monospace;font-size:13px;line-height:1.8;resize:none;transition:.25s}
.script-input:focus{border-color:#c49b4a;outline:none;background:#111}
.script-input::placeholder{color:#444}
.char-count{text-align:right;color:#555;font-size:11px;padding:4px 8px}
.divider-text{display:flex;align-items:center;gap:16px;margin:20px 0}
.div-line{flex:1;height:1px;background:#222}.div-word{color:#555;font-size:11px}
.genre-row{display:flex;gap:8px;flex-wrap:wrap;margin-bottom:12px}
.genre-chip{background:#171717;border:1px solid #222;border-radius:20px;padding:6px 14px;color:#888;cursor:pointer;font-size:12px;transition:.25s}
.genre-chip:hover,.genre-chip.on{border-color:#c49b4a;color:#c49b4a;background:rgba(196,155,74,.06)}
.synopsis-input{width:100%;height:60px;background:#0d0d0d;border:1px solid #222;border-radius:8px;color:#e8e4dc;padding:12px;font-family:Consolas,monospace;font-size:13px;resize:none;transition:.25s}
.synopsis-input:focus{border-color:#c49b4a;outline:none}
.btn-gen{width:100%;margin-top:10px;padding:12px;background:linear-gradient(135deg,rgba(196,155,74,.1),transparent);border:1px solid rgba(196,155,74,.2);border-radius:8px;color:#c49b4a;font-family:Consolas,monospace;font-size:14px;cursor:pointer;transition:.25s}
.btn-gen:hover:not(:disabled){background:rgba(196,155,74,.15);box-shadow:0 0 20px rgba(196,155,74,.1)}
.btn-gen:disabled{opacity:.3}
.bar{padding-top:16px;border-top:1px solid #1a1a1a;text-align:right}
.btn{padding:10px 28px;border:none;border-radius:8px;font-family:Consolas,monospace;font-size:14px;font-weight:bold;cursor:pointer;transition:.25s}
.btn.gold{background:linear-gradient(135deg,#c49b4a,#9a7b2e);color:#0a0a0a}
.btn.gold:hover:not(:disabled){box-shadow:0 4px 16px rgba(196,155,74,.4)}
.btn.gold:disabled{opacity:.4}
@media(max-width:768px){.script-upload{padding:16px}}
</style>
