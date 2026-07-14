<template>
  <div class="create-drama-page">
    <!-- 步骤导航 -->
    <div class="glass-card rounded-2xl p-6 mb-6">
      <div class="flex items-center justify-center gap-4 md:gap-8">
        <div class="step-track flex items-center gap-3" :class="{ completed: currentStep >= 1, active: currentStep === 1 }">
          <div class="step-circle" :class="{ 'bg-gray-800 text-gray-500': currentStep < 1, 'bg-gradient-to-r from-cyan-500 to-blue-500 text-white shadow-lg shadow-cyan-500/30': currentStep >= 1 }">
            <i v-if="currentStep > 1" class="fas fa-check text-white"></i>
            <span v-else class="text-white">1</span>
          </div>
          <div class="hidden md:block">
            <p class="text-sm font-medium" :class="currentStep >= 1 ? 'text-white' : 'text-gray-500'">剧本导入</p>
            <p class="text-xs text-gray-500">解析角色与场景</p>
          </div>
        </div>
        <div class="h-px w-16 bg-gradient-to-r" :class="currentStep > 1 ? 'from-cyan-400 to-violet-500' : 'from-gray-700 to-gray-700'"></div>
        <div class="step-track flex items-center gap-3" :class="{ completed: currentStep >= 2, active: currentStep === 2 }">
          <div class="step-circle" :class="{ 'bg-gray-800 text-gray-500': currentStep < 2, 'bg-gradient-to-r from-violet-500 to-fuchsia-500 text-white shadow-lg shadow-violet-500/30': currentStep >= 2 }">
            <i v-if="currentStep > 2" class="fas fa-check text-white"></i>
            <span v-else class="text-white">2</span>
          </div>
          <div class="hidden md:block">
            <p class="text-sm font-medium" :class="currentStep >= 2 ? 'text-white' : 'text-gray-500'">角色建模</p>
            <p class="text-xs text-gray-500">上传照片或AI生成</p>
          </div>
        </div>
        <div class="h-px w-16 bg-gradient-to-r" :class="currentStep > 2 ? 'from-fuchsia-400 to-cyan-500' : 'from-gray-700 to-gray-700'"></div>
        <div class="step-track flex items-center gap-3" :class="{ completed: currentStep >= 3, active: currentStep === 3 }">
          <div class="step-circle" :class="{ 'bg-gray-800 text-gray-500': currentStep < 3, 'bg-gradient-to-r from-fuchsia-500 to-cyan-500 text-white shadow-lg shadow-fuchsia-500/30': currentStep >= 3 }">
            <span class="text-white">3</span>
          </div>
          <div class="hidden md:block">
            <p class="text-sm font-medium" :class="currentStep >= 3 ? 'text-white' : 'text-gray-500'">分镜编辑</p>
            <p class="text-xs text-gray-600">AI自动分镜</p>
          </div>
        </div>
      </div>
    </div>

    <!-- Step 1: 剧本导入 -->
    <div v-show="currentStep === 1" class="step-content">
      <div class="text-center mb-8">
        <h2 class="text-3xl font-bold text-white mb-2">导入剧本</h2>
        <p class="text-gray-400">支持多种格式，AI智能解析角色与场景</p>
      </div>
      <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div class="glass-card rounded-2xl p-8">
          <div class="upload-zone rounded-2xl p-12 text-center relative" @click="$refs.scriptFileInput.click()">
            <input type="file" ref="scriptFileInput" class="hidden" accept=".txt,.docx,.pdf,.fountain" @change="handleScriptUpload" />
            <div class="w-24 h-24 mx-auto mb-6 rounded-full bg-gradient-to-br from-violet-500/20 to-fuchsia-500/20 flex items-center justify-center">
              <i class="fas fa-cloud-upload-alt text-4xl text-violet-400"></i>
            </div>
            <h3 class="text-xl font-semibold text-white mb-2">点击或拖拽上传剧本</h3>
            <p class="text-sm text-gray-400 mb-6">支持 TXT、DOCX、PDF、Fountain 格式</p>
            <div class="flex justify-center gap-3">
              <span class="fancy-tag bg-violet-500/20 text-violet-300 border-violet-500/30"><i class="fas fa-robot mr-1"></i>自动解析</span>
              <span class="fancy-tag bg-fuchsia-500/20 text-fuchsia-300 border-fuchsia-500/30"><i class="fas fa-users mr-1"></i>AI提取角色</span>
            </div>
          </div>
          <div class="mt-6">
            <div class="flex items-center gap-4 mb-4">
              <div class="flex-1 h-px bg-gray-800"></div>
              <span class="text-sm text-gray-500">或粘贴文本</span>
              <div class="flex-1 h-px bg-gray-800"></div>
            </div>
            <textarea v-model="scriptText" class="fancy-input w-full h-56 rounded-2xl p-4 resize-none text-sm leading-relaxed" placeholder="在此粘贴剧本文本...

示例格式：
场景：花果山山顶
角色：孙悟空（主角，年龄500岁，身高172cm，体型精瘦）
动作：从仙石中蹦出，目运金光
台词：俺老孙来也！

场景：水帘洞
角色：群猴
动作：跪拜
台词：大王！大王！"></textarea>
            <button class="w-full mt-4 py-4 rounded-2xl btn-primary text-white font-medium flex items-center justify-center gap-2" @click="parseScript" :disabled="parsing">
              <i class="fas fa-wand-magic-sparkles"></i>{{ parsing ? 'AI解析中...' : 'AI解析剧本' }}
            </button>
          </div>
        </div>
        <div class="glass-card rounded-2xl p-6">
          <h3 class="text-lg font-semibold text-white mb-4 flex items-center gap-2">
            <i class="fas fa-chart-pie text-violet-400"></i>解析结果预览
          </h3>
          <div v-if="!parsing" class="space-y-4">
            <div class="p-4 rounded-xl bg-black/30 border border-white/5">
              <div class="flex items-center justify-between mb-3">
                <span class="text-sm font-medium text-violet-300">检测到角色</span>
                <span class="text-3xl font-bold text-white">{{ parseResult.characters.length }} <span class="text-sm font-normal text-gray-400">个</span></span>
              </div>
              <div class="flex flex-wrap gap-2">
                <span v-for="(char, idx) in parseResult.characters" :key="idx"
                  class="fancy-tag"
                  :class="char.role === 'protagonist' ? 'badge-protagonist text-white' : char.role === 'supporting' ? 'badge-supporting text-white' : 'badge-extra text-white'"
                >{{ char.name }}{{ char.age ? '(' + char.age + ')' : '' }}</span>
              </div>
            </div>
            <div class="p-4 rounded-xl bg-black/30 border border-white/5">
              <div class="flex items-center justify-between mb-2">
                <span class="text-sm font-medium text-fuchsia-300">场景数量</span>
                <span class="text-2xl font-bold text-white">{{ parseResult.scenes }} <span class="text-sm font-normal text-gray-400">个</span></span>
              </div>
              <div class="text-xs text-gray-500 space-y-1">
                <div class="flex items-center gap-2"><i class="fas fa-map-marker-alt text-fuchsia-500/50"></i>{{ parseResult.sceneNames.join('、') }}</div>
              </div>
            </div>
            <div class="p-4 rounded-xl bg-black/30 border border-white/5">
              <div class="flex items-center justify-between mb-2">
                <span class="text-sm font-medium text-cyan-300">预估镜头</span>
                <span class="text-2xl font-bold text-white">{{ parseResult.shots }} <span class="text-sm font-normal text-gray-400">个</span></span>
              </div>
              <div class="w-full bg-gray-700 rounded-full h-2 mt-3 overflow-hidden">
                <div class="h-full bg-gradient-to-r from-violet-500 via-fuchsia-500 to-cyan-500 rounded-full" :style="{ width: parseResult.complexity + '%' }"></div>
              </div>
              <div class="flex justify-between text-xs text-gray-500 mt-2">
                <span>复杂度：{{ parseResult.complexity < 40 ? '简单' : parseResult.complexity < 70 ? '中等' : '复杂' }}</span>
                <span>预计生成时间：{{ parseResult.estimatedTime }}</span>
              </div>
            </div>
          </div>
          <div v-else class="text-center py-16">
            <div class="loader-ring mx-auto mb-6"></div>
            <p class="text-violet-300 font-medium">AI正在解析剧本结构...</p>
            <div class="mt-4 space-y-2 text-xs text-gray-500">
              <p><i class="fas fa-check text-green-500 mr-1"></i>提取角色信息</p>
              <p>分析场景结构...</p>
              <p>识别台词与动作...</p>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Step 2: 角色建模 -->
    <div v-show="currentStep === 2" class="step-content">
      <div class="flex items-center justify-between mb-6">
        <div>
          <h2 class="text-3xl font-bold text-white mb-2">角色建模</h2>
          <p class="text-gray-400">按主角到配角排列，精细化描述每个角色（含年龄）</p>
        </div>
        <div class="flex items-center gap-4">
          <div class="text-right">
            <div class="text-sm text-gray-400">已上传 <span class="text-white font-bold text-lg">{{ uploadedCount }}</span><span class="text-gray-500">/{{ characters.length }}</span></div>
            <div class="text-xs text-gray-600">剩余{{ characters.length - uploadedCount }}个角色待处理</div>
          </div>
          <button class="ai-magic-btn px-6 py-3 rounded-xl text-white font-medium flex items-center gap-2 hover:scale-105 transition" @click="aiFillAll">
            <i class="fas fa-wand-magic-sparkles"></i><span class="relative z-10">AI一键补齐</span>
          </button>
        </div>
      </div>
      <div class="flex gap-2 mb-6 overflow-x-auto pb-2">
        <button v-for="filter in charFilters" :key="filter.key"
          class="fancy-tag cursor-pointer"
          :class="activeFilter === filter.key ? filter.activeClass : 'bg-white/5 text-gray-400 border-white/10'"
          @click="activeFilter = filter.key"
        >{{ filter.label }} ({{ filter.count }})</button>
      </div>
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        <div v-for="(char, idx) in filteredCharacters" :key="idx" class="glass-card rounded-2xl overflow-hidden character-card">
          <div class="relative h-72 character-preview">
            <div v-if="char.photo" class="h-full">
              <img :src="char.photo" class="w-full h-full object-cover" :alt="char.name" />
              <div class="absolute top-3 right-3"><span class="fancy-tag bg-green-500/20 text-green-400 border-green-500/30"><i class="fas fa-check mr-1"></i>已上传</span></div>
            </div>
            <div v-else class="upload-zone h-full flex flex-col items-center justify-center p-6" @click="triggerUpload(idx)">
              <div class="w-16 h-16 rounded-full bg-purple-500/20 flex items-center justify-center mb-3"><i class="fas fa-user-plus text-2xl text-purple-400"></i></div>
              <p class="text-sm text-gray-300 font-medium mb-1">上传参考照片</p>
              <p class="text-xs text-gray-500 text-center">或等待AI一键生成</p>
              <input type="file" class="hidden" accept="image/*" @change="handlePhotoUpload($event, idx)" />
            </div>
            <div class="absolute top-3 left-3">
              <span class="fancy-tag" :class="char.role === 'protagonist' ? 'badge-protagonist text-white' : char.role === 'supporting' ? 'badge-supporting text-white' : 'badge-extra text-white'">
                {{ char.roleLabel }}
              </span>
            </div>
            <div v-if="char.photo" class="absolute bottom-3 left-3 right-3">
              <div class="flex items-center justify-between text-xs text-white/80 mb-1"><span>角色重要性</span><span>{{ char.importance }}%</span></div>
              <div class="w-full h-1.5 bg-black/50 rounded-full overflow-hidden">
                <div class="h-full bg-gradient-to-r from-amber-400 to-orange-500 rounded-full" :style="{ width: char.importance + '%' }"></div>
              </div>
            </div>
          </div>
          <div class="p-5 space-y-4">
            <div class="flex items-center justify-between">
              <h3 class="text-xl font-bold text-white">{{ char.name }}</h3>
              <span class="modeling-type" :class="char.photo ? 'photo' : 'ai'">
                <i class="fas" :class="char.photo ? 'fa-camera' : 'fa-robot'"></i>{{ char.photo ? '照片建模' : 'AI生成' }}
              </span>
            </div>
            <div class="space-y-2 text-sm">
              <div v-for="(val, key) in char.details" :key="key" class="flex justify-between">
                <span class="text-gray-400">{{ key }}</span>
                <span class="text-white">{{ val }}</span>
              </div>
            </div>
            <div class="pt-2 border-t border-white/10">
              <p class="text-xs text-gray-400 mb-1">{{ char.photo ? '建模来源' : '性格特点' }}</p>
              <p class="text-xs text-gray-300">{{ char.photo ? '用户上传照片 + AI按描述优化' : '' }}</p>
              <div v-if="!char.photo" class="flex flex-wrap gap-1 mt-1">
                <span v-for="(trait, tidx) in char.traits" :key="tidx" class="fancy-tag bg-pink-500/15 text-pink-300 border-pink-500/25">{{ trait }}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Step 3: 分镜编辑 -->
    <div v-show="currentStep === 3" class="step-content">
      <div class="flex items-center justify-between mb-6">
        <div>
          <h2 class="text-3xl font-bold text-white mb-2">分镜编辑</h2>
          <p class="text-gray-400">AI已自动分段，每个镜头包含描述、动作、台词、音乐</p>
        </div>
        <div class="flex items-center gap-3">
          <button class="px-4 py-2 rounded-lg glass text-sm hover:bg-white/10 transition" @click="regenerateShots"><i class="fas fa-rotate mr-2"></i>重新分镜</button>
          <button class="px-4 py-2 rounded-lg glass text-sm hover:bg-white/10 transition" @click="regenerateMusic"><i class="fas fa-music mr-2"></i>AI重新配乐</button>
        </div>
      </div>
      <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div class="lg:col-span-1">
          <div class="glass-card rounded-2xl p-6 sticky top-24">
            <h3 class="text-lg font-semibold text-white mb-4 flex items-center gap-2"><i class="fas fa-book text-purple-400"></i>剧本原文</h3>
            <div class="space-y-4 text-sm text-gray-300 max-h-[calc(100vh-200px)] overflow-y-auto pr-2">
              <div v-for="(scene, sidx) in scriptScenes" :key="sidx" class="p-3 rounded-lg" :class="sidx === 0 ? 'bg-purple-500/10 border border-purple-500/20' : 'bg-white/5'">
                <div class="text-purple-300 font-medium mb-1">{{ scene.title }}</div>
                <p class="text-gray-400 text-xs leading-relaxed">{{ scene.content }}</p>
              </div>
            </div>
          </div>
        </div>
        <div class="lg:col-span-2">
          <div class="space-y-4">
            <div v-for="(shot, sidx) in shots" :key="sidx" class="shot-card rounded-2xl p-5 relative">
              <div class="flex gap-5">
                <div class="flex flex-col items-center">
                  <div class="timeline-node"></div>
                  <div class="text-xs text-gray-500 mt-1 font-mono">{{ shot.time }}</div>
                </div>
                <div class="flex-1 space-y-3">
                  <div class="flex items-center justify-between">
                    <div class="flex items-center gap-3">
                      <span class="text-lg font-bold text-white">镜头 {{ shot.number }}</span>
                      <span v-for="tag in shot.tags" :key="tag" class="fancy-tag" :class="tagClass(tag)">{{ tag }}</span>
                      <span class="music-tag fancy-tag" v-if="shot.music"><i class="fas fa-music mr-1"></i>{{ shot.music }}</span>
                    </div>
                    <div class="flex items-center gap-2">
                      <span class="text-xs text-gray-500">{{ shot.duration }}秒</span>
                      <button class="w-8 h-8 rounded-lg glass flex items-center justify-center text-gray-400 hover:text-white" @click="editShot(sidx)"><i class="fas fa-pen"></i></button>
                      <button class="w-8 h-8 rounded-lg glass flex items-center justify-center text-gray-400 hover:text-red-400" @click="deleteShot(sidx)"><i class="fas fa-trash"></i></button>
                    </div>
                  </div>
                  <div class="flex gap-4">
                    <div class="w-40 h-24 rounded-xl bg-black/40 flex items-center justify-center overflow-hidden">
                      <img :src="shot.preview" class="w-full h-full object-cover opacity-80" alt="镜头预览" />
                    </div>
                    <div class="flex-1 space-y-2">
                      <div><label class="text-xs text-gray-500 block mb-1">场景描述</label><p class="text-sm text-gray-300">{{ shot.sceneDesc }}</p></div>
                      <div><label class="text-xs text-gray-500 block mb-1">机位运动</label><p class="text-sm text-gray-300">{{ shot.cameraMove }}</p></div>
                    </div>
                  </div>
                  <div class="grid grid-cols-2 gap-4">
                    <div class="p-3 rounded-lg bg-black/30">
                      <div class="text-xs text-gray-500 mb-1 flex items-center gap-1"><i class="fas fa-running text-orange-400"></i> 角色动作</div>
                      <p class="text-sm text-gray-300">{{ shot.actions }}</p>
                      <div class="mt-2 flex gap-1">
                        <span v-for="(actor, aidx) in shot.actors" :key="aidx" class="fancy-tag bg-yellow-500/20 text-yellow-300 text-xs">{{ actor }}</span>
                      </div>
                    </div>
                    <div class="p-3 rounded-lg bg-black/30">
                      <div class="text-xs text-gray-500 mb-1 flex items-center gap-1"><i class="fas fa-comment text-blue-400"></i> 台词/旁白</div>
                      <p class="text-sm text-gray-300 font-medium text-white">{{ shot.dialogue }}</p>
                      <div class="mt-2 text-xs text-gray-500">语气：{{ shot.tone }}</div>
                    </div>
                  </div>
                  <div class="flex items-center gap-3 p-3 rounded-lg bg-pink-500/10 border border-pink-500/20">
                    <i class="fas fa-headphones text-pink-400"></i>
                    <div class="flex-1">
                      <div class="text-xs text-pink-300 font-medium">背景音乐：{{ shot.musicDetails }}</div>
                      <div class="text-xs text-gray-500">情绪：{{ shot.mood }} | 音量：{{ shot.volume }}</div>
                    </div>
                    <button class="text-xs text-pink-400 hover:text-pink-300" @click="changeMusic(sidx)"><i class="fas fa-exchange-alt mr-1"></i>更换</button>
                  </div>
                  <div class="flex items-center gap-2 text-xs text-gray-500">
                    <i class="fas fa-arrow-right text-purple-400"></i>
                    <span>转场：{{ shot.transition }}</span>
                  </div>
                </div>
              </div>
            </div>
            <div class="flex justify-center py-4">
              <button class="px-6 py-3 rounded-xl glass border-dashed border-2 border-purple-500/30 text-purple-300 hover:border-purple-500 hover:bg-purple-500/10 transition flex items-center gap-2" @click="addShot">
                <i class="fas fa-plus"></i>插入新镜头
              </button>
            </div>
          </div>
          <div class="sticky bottom-6 mt-6">
            <div class="glass-card rounded-2xl p-4 flex items-center justify-between">
              <div class="flex items-center gap-4">
                <div class="text-sm"><span class="text-gray-400">总时长：</span><span class="text-white font-bold">{{ totalDuration }}</span></div>
                <div class="text-sm"><span class="text-gray-400">镜头数：</span><span class="text-white font-bold">{{ shots.length }}个</span></div>
                <div class="h-4 w-px bg-gray-700"></div>
                <div class="flex items-center gap-2">
                  <span class="text-xs text-gray-500">AI匹配度</span>
                  <div class="w-24 h-2 bg-gray-700 rounded-full overflow-hidden">
                    <div class="h-full bg-gradient-to-r from-purple-500 to-pink-500" :style="{ width: aiMatchRate + '%' }"></div>
                  </div>
                  <span class="text-xs text-purple-300">{{ aiMatchRate }}%</span>
                </div>
              </div>
              <div class="flex gap-3">
                <button class="px-6 py-2 rounded-lg glass text-sm hover:bg-white/10 transition" @click="previewVideo"><i class="fas fa-play mr-2"></i>预览</button>
                <button class="px-6 py-2 rounded-lg bg-gradient-to-r from-purple-600 to-pink-600 text-white text-sm font-medium hover:shadow-lg transition" @click="startGeneration"><i class="fas fa-film mr-2"></i>生成视频</button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, reactive } from 'vue'
import { useRouter } from 'vue-router'
import { createDrama } from '@/api/drama'
import { ElMessage } from 'element-plus'

const router = useRouter()
const currentStep = ref(1)
const parsing = ref(false)
const scriptText = ref('')
const activeFilter = ref('all')

const parseResult = reactive({
  characters: [
    { name: '孙悟空', age: '500岁', role: 'protagonist' },
    { name: '唐僧', age: '30岁', role: 'protagonist' },
    { name: '猪八戒', age: '800岁', role: 'supporting' },
    { name: '沙僧', age: '900岁', role: 'supporting' },
    { name: '白骨精', age: '1200岁', role: 'extra' },
    { name: '牛魔王', age: '2000岁', role: 'extra' },
    { name: '玉帝', age: '50000岁', role: 'extra' },
    { name: '如来', age: '∞', role: 'extra' }
  ],
  scenes: 12,
  sceneNames: ['花果山', '水帘洞', '天庭', '西天', '高老庄', '流沙河...'],
  shots: 36,
  complexity: 65,
  estimatedTime: '8分钟'
})

const characters = ref([
  { name: '孙悟空', role: 'protagonist', roleLabel: '主角', photo: 'https://images.unsplash.com/photo-1618336753974-aae8e04506aa?w=400&h=400&fit=crop', importance: 98,
    details: { '年龄': '500岁（仙龄）', '身高': '172cm', '体型': '精瘦型 / 肌肉线条明显', '脸型': '猴脸，雷公嘴，尖下巴', '毛发': '金色蓬松，竖立如火焰', '眼睛': '火眼金睛，金色瞳孔', '特殊标记': '头戴紧箍咒，虎皮裙' } },
  { name: '唐僧', role: 'protagonist', roleLabel: '主角', photo: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&h=400&fit=crop', importance: 95,
    details: { '年龄': '30岁', '身高': '180cm', '体型': '匀称型 / 体态端庄', '脸型': '方圆脸，慈眉善目', '发型': '光头，头顶戒疤九点', '气质': '儒雅书卷气，温润如玉' } },
  { name: '猪八戒', role: 'supporting', roleLabel: '配角', photo: '', importance: 85,
    details: { '年龄': '800岁（仙龄）', '身高': '178cm（人形）', '体型': '肥胖型 / 大腹便便', '脸型': '猪脸特征，大耳朵', '皮肤': '黑灰色，粗糙有鬃毛', '眼睛': '小眼睛，眯缝眼' },
    traits: ['好色', '贪吃', '憨厚', '懒惰'] },
  { name: '沙僧', role: 'supporting', roleLabel: '配角', photo: '', importance: 80,
    details: { '年龄': '900岁（仙龄）', '身高': '185cm / 魁梧高大', '体型': '壮硕型 / 膀大腰圆', '脸型': '国字脸，络腮胡', '发型': '蓬松乱发，如火焰状', '气质': '沉默寡言，忠诚可靠' },
    traits: ['忠诚', '沉默', '勤劳', '稳重'] },
  { name: '白骨精', role: 'extra', roleLabel: '龙套', photo: '', importance: 60, details: { '年龄': '1200岁', '身高': '168cm', '体型': '纤细型', '特征': '白骨化形' }, traits: ['狡诈', '善变'] },
  { name: '牛魔王', role: 'extra', roleLabel: '龙套', photo: '', importance: 55, details: { '年龄': '2000岁', '身高': '210cm', '体型': '魁梧', '特征': '牛头人身' }, traits: ['粗暴', '好斗'] },
  { name: '玉帝', role: 'extra', roleLabel: '龙套', photo: '', importance: 50, details: { '年龄': '50000岁', '身高': '185cm', '特征': '帝皇之相' }, traits: ['威严', '慈悲'] },
  { name: '如来', role: 'extra', roleLabel: '龙套', photo: '', importance: 45, details: { '年龄': '∞', '身高': '丈六金身', '特征': '佛光普照' }, traits: ['慈悲', '智慧'] }
])

const uploadedCount = computed(() => characters.value.filter(c => c.photo).length)

const charFilters = computed(() => [
  { key: 'all', label: '全部', count: characters.value.length, activeClass: 'bg-violet-500/20 text-violet-300 border-violet-500/30' },
  { key: 'protagonist', label: '主角', count: characters.value.filter(c => c.role === 'protagonist').length, activeClass: 'badge-protagonist text-white' },
  { key: 'supporting', label: '配角', count: characters.value.filter(c => c.role === 'supporting').length, activeClass: 'badge-supporting text-white' },
  { key: 'extra', label: '龙套', count: characters.value.filter(c => c.role === 'extra').length, activeClass: 'bg-gray-500/20 text-gray-300 border-gray-500/30' },
  { key: 'uploaded', label: '已上传', count: uploadedCount.value, activeClass: 'bg-green-500/20 text-green-300 border-green-500/30' },
  { key: 'pending', label: '待处理', count: characters.value.length - uploadedCount.value, activeClass: 'bg-amber-500/20 text-amber-300 border-amber-500/30' },
])

const filteredCharacters = computed(() => {
  let list = characters.value
  if (activeFilter.value === 'uploaded') return list.filter(c => c.photo)
  if (activeFilter.value === 'pending') return list.filter(c => !c.photo)
  if (activeFilter.value !== 'all') return list.filter(c => c.role === activeFilter.value)
  return list
})

const scriptScenes = ref([
  { title: '第一回：灵根育孕源流出', content: '东胜神洲傲来国海中有花果山，山项上一仙石孕育出一石猴。石猴在所居涧水源头寻到名为"水帘洞"的石洞，被群猴拥戴为王。' },
  { title: '场景：花果山山顶', content: '孙悟空（纵身跃出）：哈哈哈哈！俺老孙来也！' },
  { title: '场景：水帘洞', content: '群猴（跪拜）：大王！大王！' }
])

const shots = ref([
  { number: 1, time: '00:00', duration: 5, tags: ['远景', '俯视→平视'], music: '仙气飘渺', preview: 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?w=300&h=200&fit=crop',
    sceneDesc: '花果山山顶，仙石矗立，云雾缭绕，金光从石缝中透出', cameraMove: '从山顶俯视缓缓下降至平视，推进至仙石',
    actions: '仙石炸裂，石猴纵身跃出，目运两道金光射冲斗府', actors: ['孙悟空', '初生形态'],
    dialogue: '"哈哈哈哈！俺老孙来也！"', tone: '狂傲、兴奋、充满力量',
    musicDetails: '仙气缭绕 + 炸裂音效', mood: '神秘 → 激昂', volume: '80% → 100%', transition: '爆炸光效 + 粒子消散' }
])

const totalDuration = computed(() => {
  const total = shots.value.reduce((sum, s) => sum + s.duration, 0)
  const m = Math.floor(total / 60)
  const sec = total % 60
  return m + '分' + sec + '秒'
})

const aiMatchRate = ref(92)

function parseScript() {
  if (!scriptText.value.trim()) {
    ElMessage.warning('请先粘贴或上传剧本')
    return
  }
  parsing.value = true
  setTimeout(() => {
    parsing.value = false
    ElMessage.success('剧本解析完成！检测到8个角色，12个场景')
  }, 2000)
}

function handleScriptUpload(e) {
  if (e.target.files && e.target.files[0]) {
    parseScript()
  }
}

function triggerUpload(idx) {
  // Find the file input in this card
  const inputs = document.querySelectorAll('.character-card input[type="file"]')
  if (inputs[idx]) inputs[idx].click()
}

function handlePhotoUpload(e, idx) {
  if (e.target.files && e.target.files[0]) {
    const reader = new FileReader()
    reader.onload = (ev) => {
      characters.value[idx].photo = ev.target.result
    }
    reader.readAsDataURL(e.target.files[0])
  }
}

function aiFillAll() {
  ElMessage.success('AI一键补齐功能：将为所有未上传角色自动生成3D模型')
}

function tagClass(tag) {
  const map = {
    '远景': 'bg-purple-500/20 text-purple-300 border-purple-500/30',
    '近景': 'bg-blue-500/20 text-blue-300 border-blue-500/30',
    '特写': 'bg-green-500/20 text-green-300 border-green-500/30',
    '俯视→平视': 'bg-blue-500/20 text-blue-300',
    '平视→仰视': 'bg-yellow-500/20 text-yellow-300'
  }
  return map[tag] || 'bg-white/10 text-gray-300'
}

function editShot(idx) { ElMessage.info('编辑镜头 ' + (idx + 1)) }
function deleteShot(idx) { shots.value.splice(idx, 1); ElMessage.success('镜头已删除') }
function addShot() { ElMessage.info('插入新镜头') }
function changeMusic(idx) { ElMessage.info('更换音乐') }
function regenerateShots() { ElMessage.info('重新生成分镜') }
function regenerateMusic() { ElMessage.info('重新配乐') }
function previewVideo() { ElMessage.info('预览视频') }
function startGeneration() {
  router.push('/drama/new/progress')
}
</script>

<style scoped>
.create-drama-page { max-width: 1200px; margin: 0 auto; }
.glass-card { background: rgba(30, 30, 58, 0.6); backdrop-filter: blur(16px); border: 1px solid rgba(255, 255, 255, 0.06); transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1); }
.glass-card:hover { border-color: rgba(139, 92, 246, 0.3); transform: translateY(-4px); box-shadow: 0 20px 60px rgba(139, 92, 246, 0.15); }
.glass { background: rgba(20, 20, 40, 0.7); backdrop-filter: blur(20px); border: 1px solid rgba(255, 255, 255, 0.08); }
.btn-primary { background: linear-gradient(135deg, #7c3aed, #db2777); box-shadow: 0 4px 20px rgba(124, 58, 237, 0.4); transition: all 0.3s ease; }
.btn-primary:hover { transform: translateY(-2px); box-shadow: 0 8px 30px rgba(124, 58, 237, 0.6); }
.ai-magic-btn { background: linear-gradient(135deg, #8b5cf6, #ec4899); box-shadow: 0 0 40px rgba(139, 92, 246, 0.4); animation: aiPulse 3s ease-in-out infinite; position: relative; overflow: hidden; }
.ai-magic-btn::after { content: ''; position: absolute; top: -50%; left: -50%; width: 200%; height: 200%; background: conic-gradient(from 0deg, transparent, rgba(255,255,255,0.3), transparent 30%); animation: rotate 3s linear infinite; }
@keyframes aiPulse { 0%, 100% { box-shadow: 0 0 40px rgba(139, 92, 246, 0.4); } 50% { box-shadow: 0 0 60px rgba(236, 72, 153, 0.6); } }
@keyframes rotate { 100% { transform: rotate(360deg); } }
.fancy-tag { display: inline-flex; align-items: center; padding: 6px 14px; border-radius: 100px; font-size: 12px; font-weight: 500; }
.fancy-input { background: rgba(0, 0, 0, 0.4); border: 1px solid rgba(255, 255, 255, 0.08); color: #e2e8f0; transition: all 0.3s; }
.fancy-input:focus { outline: none; border-color: rgba(139, 92, 246, 0.5); box-shadow: 0 0 20px rgba(139, 92, 246, 0.15); }
.upload-zone { border: 2px dashed rgba(139, 92, 246, 0.2); transition: all 0.4s ease; cursor: pointer; }
.upload-zone:hover { border-color: rgba(139, 92, 246, 0.6); transform: scale(1.02); }
.timeline-node { width: 20px; height: 20px; border-radius: 50%; background: #8b5cf6; border: 4px solid #0a0a0f; box-shadow: 0 0 15px rgba(139, 92, 246, 0.8); }
.shot-card { background: rgba(30, 30, 58, 0.8); border: 1px solid rgba(255, 255, 255, 0.04); transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1); }
.shot-card:hover { border-color: rgba(139, 92, 246, 0.2); transform: translateX(8px); box-shadow: -10px 0 40px rgba(139, 92, 246, 0.1); }
.music-tag { background: rgba(236, 72, 153, 0.15); color: #ec4899; border: 1px solid rgba(236, 72, 153, 0.25); }
.badge-protagonist { background: linear-gradient(135deg, #f59e0b, #d97706); box-shadow: 0 0 20px rgba(245, 158, 11, 0.4); }
.badge-supporting { background: linear-gradient(135deg, #3b82f6, #2563eb); box-shadow: 0 0 20px rgba(59, 130, 246, 0.4); }
.badge-extra { background: linear-gradient(135deg, #6b7280, #4b5563); }
.loader-ring { display: inline-block; width: 64px; height: 64px; }
.loader-ring::after { content: ''; display: block; width: 64px; height: 64px; border-radius: 50%; border: 3px solid transparent; border-top-color: #8b5cf6; border-right-color: #ec4899; animation: loaderSpin 1s linear infinite; }
@keyframes loaderSpin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }
.modeling-type { display: inline-flex; align-items: center; gap: 4px; padding: 2px 8px; border-radius: 4px; font-size: 10px; font-weight: 500; border: 1px solid rgba(255,255,255,0.1); }
.modeling-type.ai { background: #dbeafe; color: #1e40af; }
.modeling-type.photo { background: #d1fae5; color: #065f46; }
.step-circle { width: 44px; height: 44px; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-weight: 700; font-size: 16px; transition: all 0.4s; }
.character-preview img { transition: transform 0.6s cubic-bezier(0.4, 0, 0.2, 1); }
.character-preview:hover img { transform: scale(1.1); }
</style>