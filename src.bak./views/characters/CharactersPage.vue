<template>
  <div class="characters-page">
    <!-- Header -->
    <div class="page-header glass-card">
      <div class="header-left">
        <el-button :icon="ArrowLeft" circle size="small" @click="goBack" />
        <h2 v-if="projectTitle">{{ projectTitle }} - ????</h2>
        <h2 v-else>????</h2>
      </div>
      <div class="header-actions">
        <el-button :icon="MagicStick" :loading="aiLoading" @click="aiAllComplete">
          AI ????
        </el-button>
        <el-button type="primary" :icon="Plus" @click="resetForm(); showCreateDialog = true">
          ????
        </el-button>
      </div>
    </div>

    <!-- Filters -->
    <div class="filter-tabs glass-card">
      <el-radio-group v-model="activeFilter" class="filter-group">
        <el-radio-button value="all">?? ({{ filterCounts.all }})</el-radio-button>
        <el-radio-button value="protagonist">?? ({{ filterCounts.protagonist }})</el-radio-button>
        <el-radio-button value="supporting">?? ({{ filterCounts.supporting }})</el-radio-button>
        <el-radio-button value="extra">?? ({{ filterCounts.extra }})</el-radio-button>
      </el-radio-group>
    </div>

    <!-- Loading -->
    <div v-if="loading" class="loading-state" v-loading="loading"></div>

    <!-- Empty State -->
    <div v-else-if="filteredCharacters.length === 0" class="empty-state glass-card">
      <el-empty :image-size="120" description="??????">
        <template #image>
          <div style="font-size: 64px; margin-bottom: 16px;">??</div>
        </template>
        <el-button type="primary" :icon="Plus" @click="resetForm(); showCreateDialog = true">
          ???????
        </el-button>
      </el-empty>
    </div>

    <!-- Character Grid -->
    <div v-else class="character-grid">
      <div
        v-for="char in filteredCharacters"
        :key="char.id"
        class="character-card glass-card"
        :class="{ 'protagonist': char.role_type === 'protagonist', 'supporting': char.role_type === 'supporting' }"
      >
        <!-- Avatar Section -->
        <div class="card-header" @click="goToCharacter(char.id)">
          <div class="avatar-section">
            <div v-if="char.avatar_url" class="avatar-wrapper">
              <img :src="char.avatar_url" :alt="char.name" />
              <div class="avatar-overlay"><el-icon :size="36"><ZoomIn /></el-icon></div>
            </div>
            <div v-else class="avatar-placeholder" @click.stop="triggerUpload(char)">
              <el-icon :size="48"><UploadFilled /></el-icon>
              <span>????</span>
            </div>
          </div>
          <div class="card-badges">
            <el-tag v-if="char.role_type === 'protagonist'" color="#f59e0b" effect="dark" size="small">??</el-tag>
            <el-tag v-else-if="char.role_type === 'supporting'" color="#3b82f6" effect="dark" size="small">??</el-tag>
            <el-tag v-else color="#6b7280" effect="dark" size="small">??</el-tag>
            <el-tag v-if="char.avatar_url" type="success" size="small" effect="plain">???</el-tag>
            <el-tag v-else type="warning" size="small" effect="plain">???</el-tag>
          </div>
          <div class="importance-bar">
            <div class="bar-label">
              <span>???</span>
              <span class="bar-value" :style="{ color: char.importance > 80 ? '#f59e0b' : char.importance > 50 ? '#8b5cf6' : '#6b7280' }">{{ char.importance }}%</span>
            </div>
            <el-progress :percentage="char.importance || 0" :stroke-width="6" :color="char.importance > 80 ? '#f59e0b' : char.importance > 50 ? '#8b5cf6' : '#6b7280'" />
          </div>
        </div>

        <!-- Body -->
        <div class="card-body">
          <div class="char-name-row">
            <h3>{{ char.name }}</h3>
            <span v-if="char.gender" class="char-gender" :class="char.gender">{{ char.gender === 'male' ? '?' : '?' }}</span>
          </div>
          <div class="char-attributes">
            <div class="attr-item"><span class="attr-label">??</span><span class="attr-value">{{ char.age_range || '?' }}</span></div>
            <div class="attr-item"><span class="attr-label">??</span><span class="attr-value">{{ char.height || '?' }}</span></div>
            <div class="attr-item"><span class="attr-label">??</span><span class="attr-value">{{ char.build || '?' }}</span></div>
            <div class="attr-item"><span class="attr-label">??</span><span class="attr-value">{{ char.face_shape || '?' }}</span></div>
            <div class="attr-item" v-if="char.hairstyle"><span class="attr-label">??</span><span class="attr-value">{{ char.hairstyle }}</span></div>
            <div class="attr-item" v-if="char.eyes"><span class="attr-label">??</span><span class="attr-value">{{ char.eyes }}</span></div>
            <div class="attr-item full-width" v-if="char.special_marks"><span class="attr-label">????</span><span class="attr-value">{{ char.special_marks }}</span></div>
          </div>
        </div>

        <!-- Actions -->
        <div class="card-actions">
          <el-button size="small" :icon="Edit" @click="editCharacter(char)">??</el-button>
          <el-button size="small" :icon="MagicStick" :loading="aiLoadingId === char.id" @click="aiComplete(char.id)">AI??</el-button>
          <el-button size="small" type="danger" :icon="Delete" @click="removeCharacter(char.id)">??</el-button>
        </div>
      </div>
    </div>

    <!-- Create/Edit Dialog -->
    <el-dialog
      v-model="showCreateDialog"
      :title="isEditing ? '????' : '????'"
      width="680px"
      :close-on-click-modal="false"
    >
      <el-form :model="form" label-width="100px" label-position="top">
        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="???" required>
              <el-input v-model="form.name" placeholder="??????" />
            </el-form-item>
          </el-col>
          <el-col :span="6">
            <el-form-item label="??">
              <el-select v-model="form.gender">
                <el-option label="?" value="male" />
                <el-option label="?" value="female" />
              </el-select>
            </el-form-item>
          </el-col>
          <el-col :span="6">
            <el-form-item label="????">
              <el-select v-model="form.role_type">
                <el-option label="??" value="protagonist" />
                <el-option label="??" value="supporting" />
                <el-option label="??" value="extra" />
              </el-select>
            </el-form-item>
          </el-col>
        </el-row>
        <el-row :gutter="20">
          <el-col :span="8">
            <el-form-item label="????">
              <el-input v-model="form.age_range" placeholder="??25-30?" />
            </el-form-item>
          </el-col>
          <el-col :span="8">
            <el-form-item label="??">
              <el-input v-model="form.height" placeholder="??175cm" />
            </el-form-item>
          </el-col>
          <el-col :span="8">
            <el-form-item label="??">
              <el-input v-model="form.build" placeholder="?????" />
            </el-form-item>
          </el-col>
        </el-row>
        <el-row :gutter="20">
          <el-col :span="8">
            <el-form-item label="??">
              <el-input v-model="form.face_shape" placeholder="?????" />
            </el-form-item>
          </el-col>
          <el-col :span="8">
            <el-form-item label="??">
              <el-input v-model="form.hairstyle" placeholder="????" />
            </el-form-item>
          </el-col>
          <el-col :span="8">
            <el-form-item label="??">
              <el-input v-model="form.eyes" placeholder="?????" />
            </el-form-item>
          </el-col>
        </el-row>
        <el-form-item label="???">
          <el-slider v-model="form.importance" :min="0" :max="100" :step="1" />
        </el-form-item>
        <el-form-item label="????">
          <el-input v-model="form.special_marks" placeholder="???????" />
        </el-form-item>
        <el-form-item label="??">
          <el-input v-model="form.description" type="textarea" :rows="3" placeholder="????..." />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="showCreateDialog = false">??</el-button>
        <el-button type="primary" :loading="saving" @click="saveCharacter">
          {{ isEditing ? '????' : '????' }}
        </el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import { getCharacters, createCharacter, updateCharacter, deleteCharacter, aiCompleteCharacter } from '@/api/character'
import { ArrowLeft, Plus, MagicStick, Edit, Delete, UploadFilled, ZoomIn } from '@element-plus/icons-vue'

const route = useRoute()
const router = useRouter()
const projectId = computed(() => route.params.id)
const projectTitle = ref('')
const characters = ref([])
const loading = ref(true)
const saving = ref(false)
const aiLoading = ref(false)
const aiLoadingId = ref(null)
const activeFilter = ref('all')
const showCreateDialog = ref(false)
const isEditing = ref(false)
const editingId = ref(null)

const form = ref({
  project_id: '', name: '', gender: 'male', role_type: 'supporting',
  description: '', age_range: '', height: '', build: '', face_shape: '',
  hairstyle: '', eyes: '', special_marks: '', importance: 50,
  model_source: 'ai_generated', avatar_url: '', scene_lines: []
})

const filterCounts = computed(() => {
  const counts = { all: characters.value.length, protagonist: 0, supporting: 0, extra: 0 }
  characters.value.forEach(c => { if (counts[c.role_type] !== undefined) counts[c.role_type]++ })
  return counts
})

const filteredCharacters = computed(() => {
  if (activeFilter.value === 'all') return characters.value
  return characters.value.filter(c => c.role_type === activeFilter.value)
})

function goBack() { router.push('/') }
function goToCharacter(id) { router.push(`/character/${id}`) }

function resetForm() {
  form.value = { project_id: projectId.value, name: '', gender: 'male', role_type: 'supporting',
    description: '', age_range: '', height: '', build: '', face_shape: '',
    hairstyle: '', eyes: '', special_marks: '', importance: 50,
    model_source: 'ai_generated', avatar_url: '', scene_lines: [] }
  isEditing.value = false; editingId.value = null
}

async function fetchCharacters() {
  loading.value = true
  try {
    const res = await getCharacters(projectId.value)
    characters.value = res.data || []
  } catch (e) { ElMessage.error('????????'); characters.value = [] }
  finally { loading.value = false }
}

async function saveCharacter() {
  if (!form.value.name) { ElMessage.warning('??????'); return }
  saving.value = true
  try {
    if (isEditing.value) { await updateCharacter(editingId.value, form.value); ElMessage.success('????') }
    else { await createCharacter(form.value); ElMessage.success('????') }
    showCreateDialog.value = false; resetForm(); await fetchCharacters()
  } catch (e) { ElMessage.error(isEditing.value ? '????' : '????') }
  finally { saving.value = false }
}

function editCharacter(char) {
  form.value = { ...char }; isEditing.value = true; editingId.value = char.id; showCreateDialog.value = true
}

async function removeCharacter(charId) {
  try { await removeCharacter(charId); ElMessage.success('????'); await fetchCharacters() }
  catch (e) { ElMessage.error('????') }
}

async function aiComplete(charId) {
  aiLoadingId.value = charId
  try { await aiCompleteCharacter(charId); ElMessage.success('AI????'); await fetchCharacters() }
  catch (e) { ElMessage.error('AI????') }
  finally { aiLoadingId.value = null }
}

async function aiAllComplete() {
  const pending = characters.value.filter(c => !c.description && !c.face_shape)
  if (pending.length === 0) { ElMessage.info('???????'); return }
  aiLoading.value = true; let success = 0
  for (const char of pending) {
    try { await aiCompleteCharacter(char.id); success++ } catch (e) {}
  }
  ElMessage.success(`AI?????${success}/${pending.length} ???`)
  aiLoading.value = false; await fetchCharacters()
}

function triggerUpload(char) { ElMessage.info('?????????') }

onMounted(() => {
  form.value.project_id = projectId.value
  projectTitle.value = route.query.title || ''
  fetchCharacters()
})
</script>

<style scoped>
.characters-page { max-width: 1400px; margin: 0 auto; padding: 24px; }
.page-header { display: flex; justify-content: space-between; align-items: center; padding: 20px 24px; border-radius: 16px; margin-bottom: 20px; }
.header-left { display: flex; align-items: center; gap: 16px; }
.header-left h2 { font-size: 22px; font-weight: 700; margin: 0; }
.header-actions { display: flex; gap: 12px; }
.filter-tabs { padding: 12px 20px; border-radius: 12px; margin-bottom: 24px; }
.loading-state { padding: 40px; }
.empty-state { text-align: center; padding: 80px 20px; border-radius: 16px; }
.character-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(320px, 1fr)); gap: 20px; }
.character-card { border-radius: 16px; overflow: hidden; transition: all 0.3s ease; border: 1px solid rgba(255,255,255,0.06); }
.character-card:hover { transform: translateY(-4px); box-shadow: 0 12px 40px rgba(139,92,246,0.15); border-color: rgba(139,92,246,0.3); }
.character-card.protagonist { border-color: rgba(245,158,11,0.3); }
.character-card.supporting { border-color: rgba(59,130,246,0.3); }
.card-header { position: relative; cursor: pointer; }
.avatar-section { height: 200px; overflow: hidden; background: linear-gradient(135deg, rgba(139,92,246,0.1), rgba(236,72,153,0.1)); }
.avatar-wrapper { position: relative; width: 100%; height: 100%; }
.avatar-wrapper img { width: 100%; height: 100%; object-fit: cover; transition: transform 0.6s ease; }
.character-card:hover .avatar-wrapper img { transform: scale(1.1); }
.avatar-overlay { position: absolute; inset: 0; background: rgba(0,0,0,0.4); display: flex; align-items: center; justify-content: center; opacity: 0; transition: opacity 0.3s; color: white; font-size: 24px; }
.avatar-wrapper:hover .avatar-overlay { opacity: 1; }
.avatar-placeholder { width: 100%; height: 100%; display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 8px; color: rgba(139,92,246,0.6); cursor: pointer; transition: all 0.3s; }
.avatar-placeholder:hover { background: rgba(139,92,246,0.1); color: rgba(139,92,246,0.9); }
.card-badges { position: absolute; top: 12px; left: 12px; display: flex; gap: 6px; flex-wrap: wrap; }
.importance-bar { position: absolute; bottom: 0; left: 0; right: 0; padding: 10px 12px 8px; background: linear-gradient(transparent, rgba(0,0,0,0.7)); }
.bar-label { display: flex; justify-content: space-between; font-size: 11px; color: rgba(255,255,255,0.7); margin-bottom: 4px; }
.bar-value { font-weight: 700; }
.card-body { padding: 16px; }
.char-name-row { display: flex; align-items: center; gap: 8px; margin-bottom: 12px; }
.char-name-row h3 { font-size: 18px; font-weight: 700; margin: 0; }
.char-gender { font-size: 16px; }
.char-gender.male { color: #60a5fa; }
.char-gender.female { color: #f472b6; }
.char-attributes { display: grid; grid-template-columns: 1fr 1fr; gap: 6px 12px; }
.attr-item { display: flex; justify-content: space-between; padding: 4px 0; border-bottom: 1px solid rgba(255,255,255,0.05); }
.attr-item.full-width { grid-column: 1 / -1; }
.attr-label { font-size: 12px; color: rgba(255,255,255,0.4); }
.attr-value { font-size: 13px; font-weight: 500; color: rgba(255,255,255,0.85); text-align: right; }
.card-actions { padding: 12px 16px; display: flex; gap: 8px; border-top: 1px solid rgba(255,255,255,0.06); }
.card-actions .el-button { flex: 1; }
</style>
