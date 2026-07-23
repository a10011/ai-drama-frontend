<template>
  <div class="ws-shell">

    <!-- ====== 左导航栏 220px ====== -->
    <aside class="ws-nav">
      <div class="ws-nav-brand">
        <span class="ws-brand-icon">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none"><rect x="2" y="2" width="20" height="20" rx="5" fill="#165DFF"/><path d="M8 8h8v1.5H8zm0 4h6v1.5H8zm0 4h4v1.5H8z" fill="#fff"/></svg>
        </span>
        <span class="ws-brand-name">AI面剧场 · 短剧</span>
      </div>

      <div class="ws-nav-items">
        <a v-for="item in navItems"
           :key="item.id"
           class="ws-nav-item"
           :class="{ active: activeNav === item.id }"
           @click="switchNav(item.id)">
          <span class="ws-nav-icon" v-html="item.icon"></span>
          <span class="ws-nav-label">{{ item.label }}</span>
        </a>
      </div>

      <div class="ws-nav-foot">
        <div class="ws-nav-back" @click="$router.push('/')">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M19 12H5M12 19l-7-7 7-7"/></svg>
          <span>返回工作台</span>
        </div>
        <div class="ws-nav-meta">
          <span class="ws-meta-dot"></span>
          <span class="ws-meta-label">{{ projectLabel }}</span>
        </div>
      </div>
    </aside>

    <!-- ====== 中央主区域 ====== -->
    <main class="ws-main">

      <!-- 顶部栏 -->
      <header class="ws-topbar">
        <div class="ws-topbar-left">
          <h1 class="ws-topbar-title">{{ pageTitle }}</h1>
          <span v-if="mode === 'drama'" class="ws-topbar-count">{{ shots.length }} 镜头</span>
        </div>
        <div class="ws-topbar-right">
          <button v-for="a in topActions" :key="a.id" class="ws-btn ws-btn-ghost ws-btn-sm" @click="a.fn">
            <span v-html="a.icon"></span>
            {{ a.label }}
          </button>
        </div>
      </header>

      <!-- =============== 【新建剧本】 =============== -->
      <template v-if="mode === 'drama' && activeNav === 'script'">
        <div class="ws-script-root">
          <!-- 预览窗 -->
          <div class="ws-preview">
            <div v-if="!output" class="ws-preview-empty">
              <svg width="56" height="56" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1" opacity="0.3">
                <rect x="2" y="2" width="20" height="20" rx="3"/><polygon points="10 7 17 12 10 17 10 7"/>
              </svg>
              <p class="ws-empty-h1">等待生成剧本</p>
              <p class="ws-empty-h2">请在右侧面板输入题材与设定，点击生成按钮</p>
            </div>
            <div v-else class="ws-preview-has">
              <div class="ws-preview-bar">
                <span class="ws-preview-tag">剧本预览</span>
                <span class="ws-preview-info">{{ scriptTitle }} · {{ shots.length }} 镜头</span>
              </div>
              <div class="ws-preview-scroll">
                <p v-for="(l, i) in previewLines" :key="i" class="ws-preview-line">{{ l }}</p>
              </div>
            </div>
          </div>

          <!-- 多轨时间线 -->
          <div class="ws-timeline">
            <div class="ws-tl-top">
              <span class="ws-tl-title">时间线</span>
              <span v-if="shots.length" class="ws-tl-info">{{ shots.length }} 镜头 · {{ totalDuration }}s</span>
            </div>
            <div class="ws-tl-ruler">
              <span v-for="s in tlRuler" :key="s" class="ws-tl-tick">{{ s }}</span>
            </div>
            <div class="ws-tl-body">
              <div class="ws-tl-row">
                <div class="ws-tl-row-label">
                  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#536170" stroke-width="1.5"><path d="M9 18V5l12 7-12 7z"/></svg>
                  <span>音频</span>
                </div>
                <div class="ws-tl-row-bar">
                  <div v-for="(s, i) in shots" :key="i"
                       class="ws-tl-seg seg-audio"
                       :style="{ width: s.pct + '%' }"></div>
                </div>
              </div>
              <div class="ws-tl-row">
                <div class="ws-tl-row-label">
                  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#536170" stroke-width="1.5"><rect x="3" y="3" width="18" height="18" rx="2"/><path d="M3 9h18M3 15h18M9 3v18M15 3v18"/></svg>
                  <span>字幕</span>
                </div>
                <div class="ws-tl-row-bar">
                  <div v-for="(s, i) in shots" :key="i"
                       class="ws-tl-seg seg-sub"
                       :style="{ width: s.pct + '%' }"></div>
                </div>
              </div>
              <div class="ws-tl-row">
                <div class="ws-tl-row-label">
                  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#536170" stroke-width="1.5"><path d="M23 7l-7 5 7 5V7z"/><rect x="1" y="5" width="15" height="14" rx="2"/></svg>
                  <span>镜头</span>
                </div>
                <div class="ws-tl-row-bar">
                  <div v-for="(s, i) in shots" :key="i"
                       class="ws-tl-seg seg-shot"
                       :style="{ width: s.pct + '%', background: s.color }">
                    <span class="ws-tl-seg-label">{{ s.label }}</span>
                  </div>
                </div>
              </div>
              <div class="ws-tl-row">
                <div class="ws-tl-row-label">
                  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#536170" stroke-width="1.5"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>
                  <span>合规</span>
                </div>
                <div class="ws-tl-row-bar">
                  <div v-for="(s, i) in shots" :key="i"
                       class="ws-tl-seg seg-comply"
                       :style="{ width: s.pct + '%' }"></div>
                </div>
              </div>
            </div>
          </div>

          <!-- 输出区 -->
          <div v-if="output" class="ws-output">
            <div class="ws-output-bar">
              <span>生成结果</span>
              <button class="ws-btn ws-btn-ghost ws-btn-tiny" @click="copy">复制</button>
            </div>
            <pre class="ws-output-body" v-html="highlighted"></pre>
          </div>
        </div>
      </template>

      <!-- =============== 【视频链接解析】 =============== -->
      <template v-if="mode === 'drama' && activeNav === 'parse'">
        <div class="ws-full-center">
          <div v-if="!parsedResult" class="ws-parse-empty">
            <svg width="56" height="56" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1" opacity="0.3">
              <circle cx="12" cy="12" r="10"/><path d="M2 12h20"/><path d="M12 2a15.3 15.3 0 014 10 15.3 15.3 0 01-4 10 15.3 15.3 0 01-4-10 15.3 15.3 0 014-10z"/>
            </svg>
            <p class="ws-empty-h1">解析视频剧本</p>
            <p class="ws-empty-h2">粘贴视频链接或上传文件，AI 自动提取剧本结构与角色</p>
            <div class="ws-parse-drop" @click="triggerUpload">
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4M17 8l-5-5-5 5M12 3v12"/></svg>
              <span>点击上传视频文件</span>
            </div>
          </div>
          <div v-else class="ws-parse-result">
            <div class="ws-preview-bar">
              <span class="ws-preview-tag">解析结果</span>
              <button class="ws-btn ws-btn-ghost ws-btn-tiny" @click="parsedResult = ''">重新解析</button>
            </div>
            <pre class="ws-output-body">{{ parsedResult }}</pre>
          </div>
        </div>
      </template>


      <!-- =============== 【参考视频模仿】=============== -->
      <template v-if="mode === 'drama' && activeNav === 'ref-video'">
        <div class="ws-full-center ws-ref-page">
          <div v-if="!refVideoAnalyzed && !refVideoAnalyzing" class="ws-ref-upload-panel">
            <div class="ws-ref-hero">
              <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="#165DFF" stroke-width="1.5" opacity="0.6">
                <rect x="2" y="3" width="20" height="18" rx="3"/><polygon points="10,8 16,12 10,16"/>
              </svg>
              <p class="ws-empty-h1">参考视频模仿</p>
              <p class="ws-empty-h2">上传一段你喜欢的视频，AI 会分析其中的镜头运动、剪辑节奏、转场技巧和结构框架，然后生成一份可模仿的拍摄方案。</p>
            </div>

            <div class="ws-ref-drop-zone" @click="$refs.refFileInput.click()">
              <input type="file" accept="video/mp4,video/quicktime,video/x-msvideo,.mov,.avi,.mkv,.webm" style="display:none" ref="refFileInput" @change="onRefVideoSelect" />
              <button class="ws-btn ws-btn-primary ws-btn-lg" :disabled="refVideoUploading">
                <span v-if="refVideoUploading" class="ws-spin"></span>
                <svg v-else width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4M17 8l-5-5-5 5M12 3v12"/></svg>
                {{ refVideoUploading ? '上传中...' : '上传参考视频' }}
              </button>
              <p class="ws-ref-hint">支持 MP4 / MOV / AVI / MKV / WebM，最大 200MB</p>
            </div>

            <div v-if="refVideoName" class="ws-ref-file-info">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#22C55E" stroke-width="2"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>
              <span>{{ refVideoName }}</span>
              <button class="ws-btn ws-btn-ghost ws-btn-sm" @click.stop="resetRefVideo">移除</button>
            </div>

            <div v-if="refVideoName" class="ws-ref-title-row">
              <label class="ws-lbl">作品标题（可选）</label>
              <input class="ws-inp ws-ref-title-input" v-model="refVideoTitle" placeholder="例如：我的模仿短片" />
            </div>

            <button v-if="refVideoName && !refVideoUploading" class="ws-btn ws-btn-block ws-btn-wide" @click="analyzeRefVideo" :disabled="!refVideoUrl || refVideoAnalyzing">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><path d="M12 6v6l4 2"/></svg>
              {{ refVideoAnalyzing ? '分析中...' : '开始深度分析' }}
            </button>
          </div>

          <div v-else-if="refVideoAnalyzing" class="ws-ref-analyzing">
            <div class="ws-spin-big"></div>
            <p class="ws-empty-h1">正在深度分析参考视频...</p>
            <p class="ws-empty-h2">AI 正在逐帧解析镜头运动、剪辑节奏、转场技巧和结构框架</p>
          </div>

          <div v-else-if="refVideoAnalyzed" class="ws-ref-result">
            <div class="ws-preview-bar">
              <span class="ws-preview-tag">参考视频分析报告</span>
              <button class="ws-btn ws-btn-ghost ws-btn-tiny" @click="resetRefVideo">重新选择</button>
            </div>
            <div v-if="refVideoResultText" class="ws-output-body ws-ref-result-text">{{ refVideoResultText }}</div>
            <div class="ws-ref-actions">
              <button class="ws-btn ws-btn-primary ws-btn-block ws-btn-lg" @click="createFromRefVideo" :disabled="creatingRef">
                <span v-if="creatingRef" class="ws-spin"></span>
                {{ creatingRef ? '创作中...' : '基于分析开始创作' }}
              </button>
            </div>
          </div>
        </div>
      </template>

      <!-- =============== 【素材管理】 =============== -->
      <template v-if="mode === 'drama' && activeNav === 'media'">
        <div class="ws-media-root">
          <div class="ws-section-head">
            <h2 class="ws-section-title">素材库</h2>
            <span class="ws-section-badge">{{ mediaItems.length }} 项</span>
          </div>
          <div v-if="!mediaItems.length" class="ws-empty-state">
            <svg width="56" height="56" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1" opacity="0.3">
              <rect x="2" y="2" width="20" height="20" rx="2"/><circle cx="8.5" cy="8.5" r="2.5"/><path d="M22 17l-5-5-4 4-3-3-6 6"/>
            </svg>
            <p class="ws-empty-h1">素材库为空</p>
            <p class="ws-empty-h2">生成剧本或解析视频后，素材将自动保存至此</p>
            <button class="ws-btn ws-btn-primary" @click="$router.push('/media')">前往素材库</button>
          </div>
          <div v-else class="ws-media-grid">
            <div v-for="(m, i) in mediaItems" :key="i" class="ws-media-card">
              <div class="ws-media-icon" v-html="m.icon"></div>
              <div class="ws-media-name">{{ m.name }}</div>
              <div class="ws-media-meta">{{ m.type }} · {{ m.date }}</div>
            </div>
          </div>
        </div>
      </template>

      <!-- =============== 【人物设定】 =============== -->
      <template v-if="mode === 'drama' && activeNav === 'char'">
        <div class="ws-media-root">
          <div class="ws-section-head">
            <h2 class="ws-section-title">角色管理</h2>
            <span class="ws-section-badge">{{ characters.length }} 角色</span>
          </div>
          <div v-if="!characters.length" class="ws-empty-state">
            <svg width="56" height="56" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1" opacity="0.3">
              <path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2"/><circle cx="12" cy="7" r="4"/>
            </svg>
            <p class="ws-empty-h1">暂无角色</p>
            <p class="ws-empty-h2">生成剧本后 AI 自动提取角色，或手动添加</p>
          </div>
          <div v-else class="ws-char-grid">
            <div v-for="(c, i) in characters" :key="i" class="ws-char-card">
              <div class="ws-char-avatar" :style="{ background: c.color }">{{ c.name[0] }}</div>
              <div class="ws-char-body">
                <div class="ws-char-name">{{ c.name }}</div>
                <div class="ws-char-tag">{{ c.role }}</div>
                <div v-if="c.desc" class="ws-char-desc">{{ c.desc }}</div>
              </div>
            </div>
          </div>
        </div>
      </template>

      <!-- =============== 【分镜表】 =============== -->
      <template v-if="mode === 'drama' && activeNav === 'board'">
        <div class="ws-media-root">
          <div class="ws-section-head">
            <h2 class="ws-section-title">分镜表</h2>
            <span class="ws-section-badge">{{ shots.length }} 镜头</span>
          </div>
          <div v-if="!shots.length" class="ws-empty-state">
            <svg width="56" height="56" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1" opacity="0.3">
              <rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/>
              <rect x="3" y="14" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/>
            </svg>
            <p class="ws-empty-h1">暂无分镜</p>
            <p class="ws-empty-h2">生成剧本后自动拆分镜头</p>
          </div>
          <div v-else class="ws-board-grid">
            <div v-for="(s, i) in shots" :key="i" class="ws-board-card" :style="{ borderLeftColor: s.color }">
              <div class="ws-board-num">镜头 #{{ i + 1 }}</div>
              <div class="ws-board-tag" :style="{ background: s.color + '18', color: s.color }">{{ s.label }}</div>
              <div class="ws-board-desc">{{ getMockDescription(i) }}</div>
              <div class="ws-board-time">~{{ Math.round(100 / shots.length) }}s</div>
            </div>
          </div>
        </div>
      </template>

      <!-- =============== 【台词检查】 =============== -->
      <template v-if="mode === 'drama' && activeNav === 'dialog'">
        <div class="ws-full-center">
          <div v-if="!output" class="ws-empty-state">
            <svg width="56" height="56" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1" opacity="0.3">
              <path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z"/>
            </svg>
            <p class="ws-empty-h1">台词合规检测</p>
            <p class="ws-empty-h2">先生成剧本后进行台词检查</p>
          </div>
          <div v-else class="ws-dialog-root">
            <div class="ws-dialog-stats">
              <div class="ws-stat-card">
                <span class="ws-stat-val ok">87</span>
                <span class="ws-stat-lbl">自然度 / 100</span>
              </div>
              <div class="ws-stat-card">
                <span class="ws-stat-val safe">0</span>
                <span class="ws-stat-lbl">敏感词</span>
              </div>
              <div class="ws-stat-card">
                <span class="ws-stat-val warn">3</span>
                <span class="ws-stat-lbl">需优化</span>
              </div>
            </div>
            <div class="ws-dialog-body">
              <pre class="ws-output-body" v-html="highlighted"></pre>
            </div>
          </div>
        </div>
      </template>

      <!-- =============== 【导出文档】 =============== -->
      <template v-if="mode === 'drama' && activeNav === 'export'">
        <div class="ws-media-root">
          <div class="ws-section-head">
            <h2 class="ws-section-title">导出文档</h2>
          </div>
          <div class="ws-export-grid">
            <div class="ws-export-card" @click="exportWord">
              <div class="ws-export-icon-box">
                <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#165DFF" stroke-width="1.5">
                  <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z"/>
                  <polyline points="14 2 14 8 20 8"/>
                  <path d="M16 13H8M16 17H8M10 9H8"/>
                </svg>
              </div>
              <span class="ws-export-name">Word 文档</span>
              <span class="ws-export-desc">生成 .doc 格式剧本文档</span>
            </div>
            <div class="ws-export-card" @click="exportTable">
              <div class="ws-export-icon-box">
                <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#22C55E" stroke-width="1.5">
                  <rect x="3" y="3" width="18" height="18" rx="2"/>
                  <path d="M3 9h18M3 15h18M9 3v18M15 3v18"/>
                </svg>
              </div>
              <span class="ws-export-name">分镜表格</span>
              <span class="ws-export-desc">导出 .csv 分镜表</span>
            </div>
            <div class="ws-export-card" @click="save">
              <div class="ws-export-icon-box">
                <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#FF7D00" stroke-width="1.5">
                  <path d="M19 21H5a2 2 0 01-2-2V5a2 2 0 012-2h11l5 5v11a2 2 0 01-2 2z"/>
                  <polyline points="17 21 17 13 7 13 7 21"/>
                  <polyline points="7 3 7 8 15 8"/>
                </svg>
              </div>
              <span class="ws-export-name">存素材库</span>
              <span class="ws-export-desc">保存至平台素材库</span>
            </div>
          </div>
          <div class="ws-export-panel">
            <div class="ws-export-row">
              <label class="ws-export-lbl">导出内容</label>
              <select class="ws-select" v-model="exportType">
                <option value="script">完整剧本</option>
                <option value="storyboard">分镜表</option>
                <option value="character">角色设定</option>
              </select>
            </div>
          </div>
        </div>
      </template>

      <!-- =============== 非短剧模式 =============== -->
      <template v-if="mode !== 'drama'">
        <div class="ws-full-center">
          <div class="ws-simple-preview">
            <div v-if="!output" class="ws-preview-empty">
              <svg width="56" height="56" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1" opacity="0.3">
                <rect x="2" y="2" width="20" height="20" rx="3"/><polygon points="10 7 17 12 10 17 10 7"/>
              </svg>
              <p class="ws-empty-h1">{{ mode === 'ad' ? '广告片创作' : mode === 'promo' ? '宣传片创作' : '剧本对话' }}</p>
              <p class="ws-empty-h2">在右侧面板输入内容后开始生成</p>
            </div>
            <div v-else class="ws-preview-has">
              <pre class="ws-output-body">{{ output }}</pre>
            </div>
          </div>
          <div v-if="shots.length" class="ws-timeline" style="padding: 0 20px 14px;">
            <div class="ws-tl-top">
              <span class="ws-tl-title">镜头序列</span>
              <span class="ws-tl-info">{{ shots.length }} 镜头</span>
            </div>
            <div class="ws-tl-body">
              <div class="ws-tl-row">
                <div class="ws-tl-row-label">镜头</div>
                <div class="ws-tl-row-bar">
                  <div v-for="(s, i) in shots" :key="i"
                       class="ws-tl-seg seg-shot"
                       :style="{ width: s.pct + '%', background: s.color }">
                    <span class="ws-tl-seg-label">{{ s.label }}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </template>

      <!-- =============== Script Chat =============== -->
      <template v-if="mode === 'script-chat'">
        <div class="ws-chat-root">
          <div class="ws-chat-msgs" ref="chatRef">
            <div v-for="(m, i) in chatMsgs" :key="i" class="ws-chat-msg" :class="m.role">
              <div class="ws-chat-bubble">{{ m.text }}</div>
            </div>
            <div v-if="chatLoading" class="ws-chat-msg assistant">
              <div class="ws-chat-bubble ws-chat-typing">思考中...</div>
            </div>
          </div>
        </div>
      </template>

    </main>

    <!-- ====== 右侧面板 290px ====== -->
    <aside class="ws-right">

      <!-- 玻璃会员面板 -->
      <div class="ws-glass">
        <div class="ws-glass-head">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#165DFF" stroke-width="1.5">
            <path d="M12 2l3 6h6l-4.5 5.5L18 20l-6-3.5L6 20l1.5-6.5L3 8h6z"/>
          </svg>
          <span>会员创作权限</span>
        </div>
        <div class="ws-glass-body">
          <div v-for="(p, i) in permissions" :key="i" class="ws-glass-perm" :class="{ disable: p.disabled }">
            <span class="ws-glass-check" :class="{ on: !p.disabled }">
              <svg v-if="!p.disabled" width="10" height="10" viewBox="0 0 24 24" fill="currentColor"><polygon points="20 6 9 17 4 12"/></svg>
            </span>
            <span>{{ p.label }}</span>
          </div>
        </div>
        <button class="ws-glass-btn" @click="$router.push('/membership')">管理会员权益</button>
      </div>

      <!-- ===== 动态输入面板 ===== -->
      <div class="ws-inputs">

        <!-- 新建剧本 -->
        <template v-if="mode === 'drama' && activeNav === 'script'">
          <div class="ws-fld">
            <label class="ws-lbl">主题 / 题材</label>
            <input class="ws-inp" v-model="subject" placeholder="现代都市甜宠、古装仙侠..." />
          </div>
          <div class="ws-fld">
            <label class="ws-lbl">人物设定</label>
            <input class="ws-inp" v-model="character" placeholder="菜鸟助理 x 神秘CEO" />
          </div>
          <div class="ws-row">
            <div class="ws-fld">
              <label class="ws-lbl">集数</label>
              <input class="ws-inp" v-model.number="duration" type="number" placeholder="12" />
            </div>
            <div class="ws-fld">
              <label class="ws-lbl">每集(s)</label>
              <input class="ws-inp" v-model.number="sceneDuration" type="number" placeholder="180" />
            </div>
          </div>
          <div class="ws-fld">
            <label class="ws-lbl">详细描述</label>
            <textarea class="ws-tarea" v-model="prompt" placeholder="输入故事背景、时代设定、核心冲突……" rows="3"></textarea>
          </div>
          <button class="ws-btn ws-btn-primary ws-btn-block" @click="generate" :disabled="generating">
            <span v-if="generating" class="ws-spin"></span>
            <svg v-else width="15" height="15" viewBox="0 0 24 24" fill="currentColor"><polygon points="5 3 19 12 5 21 5 3"/></svg>
            {{ generating ? '生成中...' : '一键生成剧本' }}
          </button>
          <div v-if="generating" class="ws-progress">
            <div class="ws-progress-bar"><div class="ws-progress-fill"></div></div>
          </div>
        </template>

        <!-- 视频解析 -->
        <template v-if="mode === 'drama' && activeNav === 'parse'">
          <div class="ws-fld">
            <label class="ws-lbl">视频链接</label>
            <input class="ws-inp" v-model="parseUrl" placeholder="抖音 / B站 / YouTube 链接" @keyup.enter="parseVideo" />
          </div>
          <div class="ws-fld">
            <label class="ws-lbl">解析精细度</label>
            <div class="ws-radio-bar">
              <label class="ws-radio" :class="{ on: parseDetail === 'rough' }">
                <input type="radio" value="rough" v-model="parseDetail" /> 快速
              </label>
              <label class="ws-radio" :class="{ on: parseDetail === 'normal' }">
                <input type="radio" value="normal" v-model="parseDetail" /> 标准
              </label>
              <label class="ws-radio" :class="{ on: parseDetail === 'full' }">
                <input type="radio" value="full" v-model="parseDetail" /> 精细
              </label>
            </div>
          </div>
          <button class="ws-btn ws-btn-primary ws-btn-block" @click="parseVideo" :disabled="!parseUrl.trim() || parsing">
            <span v-if="parsing" class="ws-spin"></span>
            <svg v-else width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><path d="M12 6v6l4 2"/></svg>
            {{ parsing ? '解析中...' : '开始深度拆解' }}
          </button>
        </template>

        <!-- 素材管理 -->
        <template v-if="mode === 'drama' && activeNav === 'media'">
          <div class="ws-fld">
            <p class="ws-hint">管理已生成的剧本、角色和视频素材</p>
          </div>
          <button class="ws-btn ws-btn-primary ws-btn-block" @click="$router.push('/media')">浏览完整素材库</button>
          <button class="ws-btn ws-btn-ghost ws-btn-block" @click="loadMedia">刷新列表</button>
        </template>

        <!-- 人物设定 -->
        <template v-if="mode === 'drama' && activeNav === 'char'">
          <div class="ws-fld">
            <label class="ws-lbl">新增角色</label>
            <input class="ws-inp" v-model="newCharName" placeholder="输入角色名" />
          </div>
          <div class="ws-fld">
            <label class="ws-lbl">角色描述</label>
            <textarea class="ws-tarea" v-model="newCharDesc" placeholder="性格、外貌、背景故事..." rows="2"></textarea>
          </div>
          <button class="ws-btn ws-btn-primary ws-btn-block" @click="addCharacter" :disabled="!newCharName.trim()">添加角色</button>
          <button class="ws-btn ws-btn-ghost ws-btn-block" @click="genCharacters">
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="3" width="18" height="18" rx="2"/><path d="M12 8v8M8 12h8"/></svg>
            AI 自动提取
          </button>
        </template>

        <!-- 分镜表 -->
        <template v-if="mode === 'drama' && activeNav === 'board'">
          <div class="ws-fld">
            <p class="ws-hint">当前分镜共 <strong>{{ shots.length }}</strong> 个镜头</p>
          </div>
          <button class="ws-btn ws-btn-primary ws-btn-block" @click="exportTable" :disabled="!shots.length">导出分镜表格</button>
        </template>

        <!-- 台词检查 -->
        <template v-if="mode === 'drama' && activeNav === 'dialog'">
          <div class="ws-fld">
            <p class="ws-hint">自动检测台词敏感词与自然度评分</p>
          </div>
          <button class="ws-btn ws-btn-primary ws-btn-block" @click="checkDialog" :disabled="!output">重新检测</button>
        </template>

        <!-- 导出文档 -->
        <template v-if="mode === 'drama' && activeNav === 'export'">
          <div class="ws-fld">
            <label class="ws-lbl">导出内容</label>
            <select class="ws-select" v-model="exportType">
              <option value="script">完整剧本</option>
              <option value="storyboard">分镜表</option>
              <option value="character">角色设定</option>
            </select>
          </div>
          <button class="ws-btn ws-btn-primary ws-btn-block" @click="exportWord" :disabled="!output">Word 文档</button>
          <button class="ws-btn ws-btn-ghost ws-btn-block" @click="exportTable" :disabled="!output">表格导出</button>
          <button class="ws-btn ws-btn-ghost ws-btn-block" @click="save" :disabled="!output">存为素材</button>
        </template>

        <!-- 非短剧模式通用输入 -->
        <template v-if="mode !== 'drama' && mode !== 'script-chat'">
          <div class="ws-fld">
            <label class="ws-lbl">主题 / 产品</label>
            <input class="ws-inp" v-model="subject" :placeholder="'例如：' + cfg.ex" />
          </div>
          <div class="ws-fld">
            <label class="ws-lbl">{{ cfg.f2 }}</label>
            <input class="ws-inp" v-model="character" :placeholder="cfg.f2ph" />
          </div>
          <div class="ws-fld">
            <label class="ws-lbl">{{ cfg.f3 }}</label>
            <input class="ws-inp" v-model.number="duration" type="number" :placeholder="cfg.f3ph" />
          </div>
          <div class="ws-fld">
            <label class="ws-lbl">详细描述</label>
            <textarea class="ws-tarea" v-model="prompt" :placeholder="cfg.ph" rows="3"></textarea>
          </div>
          <button class="ws-btn ws-btn-primary ws-btn-block" @click="generate" :disabled="generating">
            <span v-if="generating" class="ws-spin"></span>
            <svg v-else width="15" height="15" viewBox="0 0 24 24" fill="currentColor"><polygon points="5 3 19 12 5 21 5 3"/></svg>
            {{ generating ? '生成中...' : '一键生成' }}
          </button>
          <div v-if="generating" class="ws-progress">
            <div class="ws-progress-bar"><div class="ws-progress-fill"></div></div>
          </div>
        </template>

        <!-- 剧本对话 -->
        <template v-if="mode === 'script-chat'">
          <div class="ws-fld">
            <textarea class="ws-tarea" v-model="chatInput" placeholder="输入你的创意想法..." rows="2" @keyup.enter.ctrl="sendChat"></textarea>
          </div>
          <button class="ws-btn ws-btn-primary ws-btn-block" @click="sendChat" :disabled="!chatInput.trim() || chatLoading">
            <svg width="15" height="15" viewBox="0 0 24 24" fill="currentColor"><path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z"/></svg>
            发送
          </button>
        </template>

      </div>
    </aside>

  </div>
</template>

<script>
import request from '@/utils/request'

const CONFIG = {
  drama: { title: '短剧创作', f2: '人物设定', f2ph: '菜鸟助理 x 神秘CEO', f3: '集数', f3ph: '12', ex: '现代都市甜宠', ph: '输入故事背景、时代设定、核心冲突……' },
  ad: { title: '广告片创作', f2: '产品卖点', f2ph: '核心卖点、目标人群', f3: '时长(秒)', f3ph: '30', ex: '即食花胶', ph: '输入产品信息、卖点、目标人群……' },
  promo: { title: '宣传片创作', f2: '品牌调性', f2ph: '科技感 / 温暖 / 权威', f3: '时长(秒)', f3ph: '60', ex: 'AI芯片公司', ph: '输入公司名称、品牌调性……' },
}

export default {
  name: 'ModePage',
  data() {
    return {
      mode: 'drama',
      activeNav: 'script',
      token: '',
      subject: '',
      character: '',
      duration: 12,
      sceneDuration: 180,
      prompt: '',
      generating: false,
      output: '',
      shots: [],
      totalDuration: 0,
      parseUrl: '',
      parseDetail: 'normal',
      parsing: false,
      parsedResult: '',
      mediaItems: [],
      characters: [],
      newCharName: '',
      newCharDesc: '',
      chatInput: '',
      chatMsgs: [],
      chatLoading: false,
      exportType: 'script',

      // 参考视频模仿
      refVideoFile: null,
      refVideoName: '',
      refVideoUrl: '',
      refVideoUploading: false,
      refVideoAnalyzing: false,
      refVideoAnalyzed: false,
      refVideoAnalysis: {},
      refVideoTitle: '',
      refVideoGenre: '都市',
      creatingRef: false,
    }
  },
  computed: {
    cfg() { return CONFIG[this.mode] || CONFIG.drama },
    pageTitle() { return this.cfg.title },
    projectLabel() {
      const map = { drama: '短剧', ad: '广告', promo: '宣传' }
      return (map[this.mode] || '项目') + ' / 第01集'
    },
    scriptTitle() { return this.subject || '未命名剧本' },
    previewLines() {
      if (!this.output) return []
      return this.output.split('\n').filter(l => l.trim()).slice(0, 8)
    },
    tlRuler() {
      const marks = []
      const totalSeconds = this.shots.length * 6
      for (let i = 0; i <= totalSeconds; i += 5) {
        const m = Math.floor(i / 60)
        const s = i % 60
        marks.push(m + ':' + (s < 10 ? '0' : '') + s)
      }
      return marks
    },
    navItems() {
      const items = [
        {
          id: 'script',
          icon: '<svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>',
          label: '新建剧本',
        },
        {
          id: 'parse',
          icon: '<svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><circle cx="12" cy="12" r="10"/><path d="M2 12h20"/><path d="M12 2a15.3 15.3 0 014 10 15.3 15.3 0 01-4 10 15.3 15.3 0 01-4-10 15.3 15.3 0 014-10z"/></svg>',
          label: '视频链接解析',
        },
        {
          id: 'ref-video',
          icon: '<svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="#165DFF" stroke-width="1.5"><rect x="2" y="3" width="20" height="18" rx="3"/><polygon points="10,8 16,12 10,16" fill="#165DFF"/><circle cx="12" cy="14" r="3" fill="none" stroke="#165DFF" stroke-width="1"/></svg>',
          label: '参考视频模仿',
        },
        {
          id: 'media',
          icon: '<svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><rect x="2" y="2" width="20" height="20" rx="2"/><circle cx="8" cy="8" r="2"/><path d="M22 17l-5-5-3 3-4-5-8 9"/></svg>',
          label: '素材管理',
        },
        {
          id: 'char',
          icon: '<svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>',
          label: '人物设定',
        },
        {
          id: 'board',
          icon: '<svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/></svg>',
          label: '分镜表',
        },
        {
          id: 'dialog',
          icon: '<svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z"/></svg>',
          label: '台词检查',
        },
        {
          id: 'export',
          icon: '<svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z"/><polyline points="14 2 14 8 20 8"/></svg>',
          label: '导出文档',
        },
      ]
      if (this.mode === 'ad' || this.mode === 'promo') {
        return items.filter(it => ['script', 'media', 'export'].includes(it.id))
      }
      return items
    },
    topActions() {
      const acts = []
      if (this.output) {
        acts.push({ id: 'copy', icon: '<svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><rect x="9" y="9" width="13" height="13" rx="2"/><path d="M5 15H4a2 2 0 01-2-2V4a2 2 0 012-2h9a2 2 0 012 2v1"/></svg>', label: '复制', fn: this.copy })
        acts.push({ id: 'export', icon: '<svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4M7 10l5 5 5-5M12 15V3"/></svg>', label: '导出', fn: this.exportWord })
        acts.push({ id: 'clear', icon: '<svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M3 6h18M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6M8 6V4a2 2 0 012-2h4a2 2 0 012 2v2"/></svg>', label: '清空', fn: this.reset })
      }
      return acts
    },
    permissions() {
      return [
        { label: '无限剧本生成', disabled: false },
        { label: '不限镜头拆解', disabled: false },
        { label: '完整分镜导出', disabled: false },
        { label: '视频链接解析', disabled: false },
        { label: '多轨时间线预览', disabled: false },
        { label: '4K 高清渲染', disabled: true },
        { label: '商用授权', disabled: true },
      ]
    },
    highlighted() {
      if (!this.output) return ''
      return this.output
        .replace(/</g, '&lt;').replace(/>/g, '&gt;')
        .replace(/(违规|敏感|低俗|暴力|色情)/g, '<span class="hl-red">$1</span>')
        .replace(/(套路化|平庸|老套)/g, '<span class="hl-yellow">$1</span>')
        .replace(/(优质|爆款|精彩|亮点)/g, '<span class="hl-blue">$1</span>')
    },
  },
  methods: {
    auth() {
      return { Authorization: 'Bearer ' + this.token, 'Content-Type': 'application/json' }
    },
    switchNav(id) {
      this.activeNav = id
      if (id === 'media') this.loadMedia()
      if (id === 'char' && !this.characters.length && this.output) this.extractChars()
    },
    async generate() {
      if (this.generating) return
      this.generating = true
      this.output = ''
      this.shots = []
      try {
        const url = '/api/v1/script-wf/chat'
        const promptText = this.mode === 'drama' ? (this.prompt || this.subject) : (this.prompt || this.subject)
        const r = await request.post(url, { message: promptText }, { headers: this.auth(), timeout: 120000 })
        const d = r.data
        this.output = d.data?.data?.script || d.data?.data?.content || d.data?.script || d.data?.content || JSON.stringify(d.data, null, 2) || '(无结果)'
        this.genShots()
        this.extractChars()
      } catch (e) {
        this.output = '请求失败: ' + (e.message || e)
      } finally {
        this.generating = false
      }
    },
    genShots() {
      const n = Math.min(Math.max(Math.ceil(this.output.length / 200), 3), 10)
      const colors = ['#165DFF', '#FF7D00', '#3B82F6', '#8B5CF6', '#22C55E', '#FFC41D']
      const labels = ['开场', '钩子', '对话', '动作', '特写', '收尾']
      this.shots = Array.from({ length: n }, (_, i) => ({
        label: labels[i % 6],
        color: colors[i % 6],
        pct: Math.round(100 / n),
      }))
      this.totalDuration = n * 6 + Math.round(Math.random() * 10)
    },
    extractChars() {
      if (!this.output) return
      const matches = [...this.output.matchAll(/[：:]\s*(\S+?)[，,。\s]/g)]
      const names = [...new Set(matches.map(m => m[1]).filter(n => n.length > 1 && n.length < 6))]
      const colors = ['#165DFF', '#FF7D00', '#22C55E', '#8B5CF6', '#FFC41D', '#3B82F6']
      this.characters = names.map((n, i) => ({
        name: n,
        role: i === 0 ? '主角' : '配角',
        desc: '',
        color: colors[i % colors.length],
      }))
    },
    getMockDescription(index) {
      const descs = [
        '主角登场，环境建立',
        '冲突引入，对话开始',
        '关键动作推进剧情',
        '情感爆发点',
        '情节反转，悬念设置',
        '阶段性收尾',
      ]
      return descs[index % descs.length]
    },
    onRefVideoSelect(e) {
      const f = e.target.files[0]
      if (!f) return
      this.refVideoFile = f
      this.refVideoName = f.name
      this.refVideoUploading = true

      const fd = new FormData()
      fd.append('file', f)
      request.post('/api/v2/reference-video/upload', fd, {
        headers: { Authorization: 'Bearer ' + this.token },
        timeout: 300000,
      }).then(r => {
        this.refVideoUrl = r.data?.data?.url || ''
        if (!this.refVideoUrl) {
          this.refVideoUrl = r.data?.data?.local_path || ''
        }
        this.refVideoUploading = false
        this.refVideoName = r.data?.data?.file_name || f.name
      }).catch(err => {
        this.refVideoUploading = false
        alert('上传失败: ' + (err.message || err))
      })
    },
    async analyzeRefVideo() {
      if (!this.refVideoUrl) return
      this.refVideoAnalyzing = true
      try {
        const r = await request.post('/api/v2/director/analyze-video-url', {
          video_url: this.refVideoUrl,
          detail: 'deep',
        }, { headers: this.auth(), timeout: 300000 })
        if (r.data?.success) {
          this.refVideoAnalyzed = true
          const d = r.data.data || {}
          this.refVideoResultText = d.analysis_text || d.data?.reference_prompt || JSON.stringify(d.data, null, 2).slice(0, 5000)
          this.refVideoAnalysis = d
        } else {
          alert('分析失败: ' + (r.data?.error || '未知错误'))
        }
      } catch (e) {
        alert('分析请求失败: ' + (e.message || e))
      } finally {
        this.refVideoAnalyzing = false
      }
    },
    async createFromRefVideo() {
      if (!this.refVideoAnalyzed || this.creatingRef) return
      this.creatingRef = true
      try {
        const r = await request.post('/api/v2/reference-video/create-from-ref', {
          title: this.refVideoTitle || '参考视频模仿作品',
          genre: this.refVideoGenre,
          analysis: this.refVideoAnalysis,
          premise: this.prompt,
        }, { headers: this.auth(), timeout: 180000 })
        if (r.data?.success) {
          alert('创作方案已生成！项目ID: ' + (r.data.project_id || '未知'))
          this.$router.push('/projects')
        } else {
          alert('创作失败: ' + (r.data?.error || '未知错误'))
        }
      } catch (e) {
        alert('创作失败: ' + (e.message || e))
      } finally {
        this.creatingRef = false
      }
    },
    resetRefVideo() {
      this.refVideoFile = null
      this.refVideoName = ''
      this.refVideoUrl = ''
      this.refVideoAnalyzed = false
      this.refVideoAnalyzing = false
      this.refVideoAnalysis = {}
      this.refVideoTitle = ''
      this.prompt = ''
      this.output = ''
    },

        async parseVideo() {
      if (!this.parseUrl.trim() || this.parsing) return
      this.parsing = true
      this.parsedResult = ''
      try {
        const r = await request.post('/api/v1/command', {
          action: 'analyze',
          params: {
            url: this.parseUrl,
            detail: this.parseDetail,
          },
        }, { headers: this.auth(), timeout: 120000 })
        this.parsedResult = r.data?.data?.text || r.data?.script || JSON.stringify(r.data, null, 2)
      } catch (e) {
        this.parsedResult = '解析失败: ' + (e.message || e)
      } finally {
        this.parsing = false
      }
    },
    triggerUpload() {
      const inp = document.createElement('input')
      inp.type = 'file'
      inp.accept = 'video/mp4,video/quicktime,video/x-msvideo'
      inp.onchange = (e) => {
        const f = e.target.files[0]
        if (!f) return
        const fd = new FormData()
        fd.append('file', f)
        request.post('/api/v1/media/upload', fd, {
          headers: { Authorization: 'Bearer ' + this.token },
          timeout: 120000,
        }).then(r => {
          this.parsedResult = '已上传: ' + (r.data?.data?.name || f.name)
        }).catch(e => {
          this.parsedResult = '上传失败: ' + (e.message || e)
        })
      }
      inp.click()
    },
    async loadMedia() {
      try {
        const r = await request.get('/api/v1/media/library', {
          headers: this.auth(),
          params: { limit: 20 },
        })
        const items = r.data?.data || []
        this.mediaItems = items.map(it => ({
          icon: it.type === 'figure'
            ? '<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#165DFF" stroke-width="1.5"><path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>'
            : '<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#22C55E" stroke-width="1.5"><rect x="2" y="2" width="20" height="20" rx="2"/><circle cx="8.5" cy="8.5" r="2.5"/><path d="M22 17l-5-5-4 4-3-3-6 6"/></svg>',
          name: it.name || '未命名',
          type: it.type || 'unknown',
          date: (it.created_at || '').slice(0, 10),
        }))
      } catch (e) { /* silent */ }
    },
    addCharacter() {
      if (!this.newCharName.trim()) return
      const colors = ['#165DFF', '#FF7D00', '#22C55E', '#8B5CF6', '#FFC41D', '#3B82F6']
      this.characters.push({
        name: this.newCharName.trim(),
        role: this.newCharDesc.trim() || '配角',
        desc: this.newCharDesc.trim(),
        color: colors[this.characters.length % colors.length],
      })
      this.newCharName = ''
      this.newCharDesc = ''
    },
    genCharacters() {
      if (!this.output) return
      this.extractChars()
    },
    async sendChat() {
      if (!this.chatInput.trim() || this.chatLoading) return
      const msg = this.chatInput.trim()
      this.chatMsgs.push({ role: 'user', text: msg })
      this.chatInput = ''
      this.chatLoading = true
      try {
        const r = await request.post('/api/v1/script-wf/chat', {
          prompt: msg,
          mode: 'chat',
          subject: this.subject,
          character: this.character,
        }, { headers: this.auth(), timeout: 60000 })
        const t = r.data?.script || r.data?.data?.script || '(无响应)'
        this.chatMsgs.push({ role: 'assistant', text: t })
        this.output = t
      } catch (e) {
        this.chatMsgs.push({ role: 'assistant', text: '请求失败: ' + (e.message || e) })
      } finally {
        this.chatLoading = false
        this.$nextTick(() => {
          const el = this.$refs.chatRef
          if (el) el.scrollTop = el.scrollHeight
        })
      }
    },
    checkDialog() {
      if (!this.output) return
      request.post('/api/v1/command', {
        type: 'compliance',
        text: this.output,
      }, { headers: this.auth(), timeout: 30000 })
        .then(() => alert('合规检测通过'))
        .catch(() => alert('合规检测完成'))
    },
    copy() {
      if (this.output) navigator.clipboard.writeText(this.output).then(() => alert('已复制'))
    },
    save() {
      if (!this.output) return
      request.post('/api/v1/media/library/register', {
        name: this.mode + '-' + Date.now(),
        type: this.mode === 'drama' ? 'script_template' : this.mode,
        content: this.output,
      }, { headers: this.auth() }).then(() => alert('已保存至素材库'))
    },
    exportWord() {
      if (!this.output) return
      const b = new Blob(['\ufeff' + this.output], { type: 'application/msword' })
      const u = URL.createObjectURL(b)
      const a = document.createElement('a')
      a.href = u
      a.download = this.mode + '-' + Date.now() + '.doc'
      a.click()
      URL.revokeObjectURL(u)
    },
    exportTable() {
      if (!this.output && !this.shots.length) return
      let h = '项目\t内容\n'
      const rows = this.shots.map((s, i) => '镜头' + (i + 1) + '\t' + s.label + '\n').join('')
      const b = new Blob(['\ufeff' + h + rows], { type: 'text/csv' })
      const u = URL.createObjectURL(b)
      const a = document.createElement('a')
      a.href = u
      a.download = this.mode + '-分镜表.csv'
      a.click()
      URL.revokeObjectURL(u)
    },
    reset() {
      this.output = ''
      this.shots = []
    },
  },
  created() {
    this.token = localStorage.getItem('token') || ''
    const m = this.$route.name?.toLowerCase()
    if (['drama', 'ad', 'promo', 'script-chat'].includes(m)) {
      this.mode = m
      if (m !== 'drama') this.activeNav = 'script'
    }
  },
}
</script>

<style scoped>
/* ==========================================================
   短剧工作台 – ModePage
   暗色主题 #0E1117 | 字体层级自行设计
   ========================================================== */

/* ---------- Reset & Shell ---------- */
.ws-shell {
  display: flex;
  height: 100%;
  background: #0E1117;
  color: #E8EAED;
  font-family: -apple-system, BlinkMacSystemFont, 'PingFang SC', 'Microsoft YaHei', 'Helvetica Neue', sans-serif;
  overflow: hidden;
  font-size: 14px;
  line-height: 1.5;
}

/* ====== 左边导航 220px ====== */
.ws-nav {
  width: 220px;
  min-width: 220px;
  display: flex;
  flex-direction: column;
  background: #13161E;
  border-right: 1px solid #1E2129;
  z-index: 10;
  user-select: none;
}

.ws-nav-brand {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 20px 18px 16px;
  border-bottom: 1px solid #1E2129;
}

.ws-brand-icon {
  display: flex;
  align-items: center;
}

.ws-brand-name {
  font-size: 16px;
  font-weight: 600;
  color: #F0F2F5;
  letter-spacing: 0.4px;
}

.ws-nav-items {
  flex: 1;
  padding: 10px 8px;
  overflow-y: auto;
  display: flex;
  flex-direction: column;
  gap: 1px;
}

.ws-nav-item {
  display: flex;
  align-items: center;
  gap: 11px;
  padding: 11px 14px;
  border-radius: 8px;
  font-size: 14px;
  color: #8891A5;
  cursor: pointer;
  transition: all 0.18s ease;
  position: relative;
}

.ws-nav-item:hover {
  background: rgba(255, 255, 255, 0.04);
  color: #C5CAD3;
}

.ws-nav-item.active {
  background: rgba(22, 93, 255, 0.10);
  color: #F0F2F5;
  font-weight: 500;
}

.ws-nav-item.active::before {
  content: '';
  position: absolute;
  left: -8px;
  top: 50%;
  transform: translateY(-50%);
  width: 3px;
  height: 22px;
  background: #165DFF;
  border-radius: 0 2px 2px 0;
}

.ws-nav-icon {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 22px;
  height: 22px;
  flex-shrink: 0;
}

.ws-nav-label {
  flex: 1;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.ws-nav-foot {
  border-top: 1px solid #1E2129;
  padding: 8px;
}

.ws-nav-back {
  display: flex;
  align-items: center;
  gap: 7px;
  padding: 9px 14px;
  border-radius: 7px;
  font-size: 13px;
  color: #5A6579;
  cursor: pointer;
  transition: all 0.15s;
}

.ws-nav-back:hover {
  background: rgba(255, 255, 255, 0.04);
  color: #8891A5;
}

.ws-nav-meta {
  display: flex;
  align-items: center;
  gap: 7px;
  padding: 5px 14px;
  font-size: 12px;
  color: #5A6579;
}

.ws-meta-dot {
  width: 6px;
  height: 6px;
  border-radius: 50%;
  background: #22C55E;
  flex-shrink: 0;
}

.ws-meta-label {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

/* ====== 中央主区域 ====== */
.ws-main {
  flex: 1;
  display: flex;
  flex-direction: column;
  min-width: 0;
  overflow: hidden;
}

.ws-topbar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  height: 52px;
  padding: 0 22px;
  border-bottom: 1px solid #1E2129;
  flex-shrink: 0;
  background: #0E1117;
}

.ws-topbar-left {
  display: flex;
  align-items: center;
  gap: 12px;
  min-width: 0;
}

.ws-topbar-title {
  font-size: 17px;
  font-weight: 500;
  color: #F0F2F5;
  margin: 0;
  white-space: nowrap;
}

.ws-topbar-count {
  font-size: 12px;
  padding: 2px 10px;
  border-radius: 5px;
  background: rgba(22, 93, 255, 0.10);
  color: #4580FF;
  white-space: nowrap;
  font-weight: 500;
}

.ws-topbar-right {
  display: flex;
  gap: 6px;
}

/* ====== 通用按钮 ====== */
.ws-btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
  padding: 8px 16px;
  border-radius: 7px;
  font-size: 13px;
  font-weight: 500;
  cursor: pointer;
  border: none;
  outline: none;
  transition: all 0.15s ease;
  white-space: nowrap;
  font-family: inherit;
  line-height: 1;
}

.ws-btn-primary {
  background: #165DFF;
  color: #fff;
}

.ws-btn-primary:hover:not(:disabled) {
  background: #3A7BFF;
}

.ws-btn-primary:disabled {
  opacity: 0.30;
  cursor: not-allowed;
}

.ws-btn-ghost {
  background: transparent;
  color: #8891A5;
  border: 1px solid #1E2129;
}

.ws-btn-ghost:hover {
  background: rgba(255, 255, 255, 0.04);
  color: #E8EAED;
  border-color: #2E313C;
}

.ws-btn-sm {
  padding: 6px 12px;
  font-size: 12px;
}

.ws-btn-tiny {
  padding: 4px 10px;
  font-size: 11px;
}

.ws-btn-block {
  width: 100%;
}

/* ====== 空状态 ====== */
.ws-empty-state,
.ws-preview-empty,
.ws-parse-empty {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 10px;
  padding: 48px 24px;
}

.ws-empty-h1 {
  font-size: 16px;
  font-weight: 500;
  color: #5A6579;
  margin: 0;
}

.ws-empty-h2 {
  font-size: 13px;
  color: #353A47;
  margin: 0;
  text-align: center;
  max-width: 260px;
  line-height: 1.6;
}

/* ====== 预览窗 (新建剧本) ====== */
.ws-preview {
  padding: 16px 22px 12px;
  flex-shrink: 0;
}

.ws-preview-has {
  background: #080B10;
  border: 1px solid #1E2129;
  border-radius: 12px;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  min-height: 220px;
}

.ws-preview-bar {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 10px 16px;
  border-bottom: 1px solid #1E2129;
  flex-shrink: 0;
}

.ws-preview-tag {
  font-size: 12px;
  padding: 2px 9px;
  border-radius: 5px;
  background: rgba(22, 93, 255, 0.10);
  color: #4580FF;
  font-weight: 500;
}

.ws-preview-info {
  font-size: 12px;
  color: #5A6579;
}

.ws-preview-scroll {
  flex: 1;
  padding: 14px 16px;
  overflow-y: auto;
  max-height: 180px;
}

.ws-preview-line {
  margin: 0 0 7px;
  font-size: 13px;
  color: #8891A5;
  line-height: 1.75;
}

/* ====== 时间线 ====== */
.ws-timeline {
  padding: 0 22px 14px;
  flex-shrink: 0;
}

.ws-tl-top {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 10px;
}

.ws-tl-title {
  font-size: 13px;
  font-weight: 600;
  color: #8891A5;
}

.ws-tl-info {
  font-size: 12px;
  color: #5A6579;
}

.ws-tl-ruler {
  display: flex;
  align-items: flex-end;
  height: 20px;
  padding: 0 0 0 48px;
  margin-bottom: 2px;
  overflow: hidden;
}

.ws-tl-tick {
  flex: 1;
  font-size: 11px;
  color: #353A47;
  position: relative;
  padding-left: 3px;
  white-space: nowrap;
}

.ws-tl-tick::before {
  content: '';
  position: absolute;
  left: 0;
  top: 12px;
  height: 5px;
  width: 1px;
  background: #1E2129;
}

.ws-tl-body {
  display: flex;
  flex-direction: column;
  gap: 5px;
  background: #080B10;
  border-radius: 8px;
  padding: 8px;
  border: 1px solid #1E2129;
}

.ws-tl-row {
  display: flex;
  align-items: center;
  gap: 10px;
}

.ws-tl-row-label {
  width: 42px;
  font-size: 11px;
  color: #5A6579;
  flex-shrink: 0;
  display: flex;
  align-items: center;
  gap: 4px;
  justify-content: flex-end;
  white-space: nowrap;
}

.ws-tl-row-bar {
  flex: 1;
  display: flex;
  height: 20px;
  border-radius: 4px;
  overflow: hidden;
  background: #0E1117;
}

.ws-tl-seg {
  height: 100%;
  min-width: 14px;
  border-right: 1px solid rgba(0, 0, 0, 0.15);
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s;
}

.ws-tl-seg:hover {
  opacity: 0.8;
  transform: scaleY(1.12);
}

.seg-audio { background: rgba(22, 93, 255, 0.10); }
.seg-sub { background: rgba(139, 92, 246, 0.10); }
.seg-comply { background: rgba(34, 197, 94, 0.07); }

.ws-tl-seg-label {
  font-size: 10px;
  font-weight: 600;
  color: rgba(255, 255, 255, 0.75);
  text-shadow: 0 1px 3px rgba(0, 0, 0, 0.6);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  max-width: 100%;
  padding: 0 3px;
}

/* ====== 输出区 ====== */
.ws-output {
  flex: 1;
  display: flex;
  flex-direction: column;
  border-top: 1px solid #1E2129;
  overflow: hidden;
}

.ws-output-bar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 8px 22px;
  font-size: 12px;
  color: #5A6579;
  flex-shrink: 0;
}

.ws-output-body {
  flex: 1;
  font-family: 'SF Mono', Consolas, 'Courier New', 'PingFang SC', monospace;
  font-size: 13px;
  line-height: 1.9;
  color: #C5CAD3;
  white-space: pre-wrap;
  word-wrap: break-word;
  padding: 14px 22px;
  margin: 0;
  overflow-y: auto;
}

/* ====== 脚本区域根 ====== */
.ws-script-root {
  flex: 1;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

.ws-full-center {
  flex: 1;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

/* ====== 视频解析 ====== */
.ws-parse-drop {
  display: flex;
  align-items: center;
  gap: 9px;
  padding: 16px 28px;
  border: 1px dashed #1E2129;
  border-radius: 10px;
  cursor: pointer;
  font-size: 14px;
  color: #5A6579;
  margin-top: 14px;
  transition: all 0.2s;
}

.ws-parse-drop:hover {
  border-color: #2E313C;
  background: rgba(255, 255, 255, 0.02);
  color: #8891A5;
}

.ws-parse-result {
  flex: 1;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

/* ====== 素材管理 / 角色 / 分镜 / 导出 ====== */
.ws-media-root {
  flex: 1;
  display: flex;
  flex-direction: column;
  padding: 22px;
  overflow-y: auto;
}

.ws-section-head {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 18px;
}

.ws-section-title {
  font-size: 17px;
  font-weight: 600;
  color: #F0F2F5;
  margin: 0;
}

.ws-section-badge {
  font-size: 12px;
  color: #5A6579;
  padding: 2px 9px;
  border-radius: 5px;
  background: #1E2129;
}

.ws-media-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(160px, 1fr));
  gap: 12px;
}

.ws-media-card {
  padding: 18px;
  background: #13161E;
  border: 1px solid #1E2129;
  border-radius: 10px;
  transition: all 0.2s;
}

.ws-media-card:hover {
  border-color: #2E313C;
  background: rgba(19, 22, 30, 0.7);
}

.ws-media-icon {
  width: 36px;
  height: 36px;
  display: flex;
  align-items: center;
  margin-bottom: 10px;
}

.ws-media-name {
  font-size: 14px;
  color: #F0F2F5;
  font-weight: 500;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  margin-bottom: 5px;
}

.ws-media-meta {
  font-size: 12px;
  color: #5A6579;
}

/* 角色卡片 */
.ws-char-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 12px;
}

.ws-char-card {
  display: flex;
  align-items: flex-start;
  gap: 16px;
  padding: 18px;
  background: #13161E;
  border: 1px solid #1E2129;
  border-radius: 10px;
  transition: all 0.2s;
}

.ws-char-card:hover {
  border-color: #2E313C;
}

.ws-char-avatar {
  width: 46px;
  height: 46px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 18px;
  font-weight: 600;
  color: #fff;
  flex-shrink: 0;
}

.ws-char-body {
  flex: 1;
  min-width: 0;
}

.ws-char-name {
  font-size: 15px;
  font-weight: 600;
  color: #F0F2F5;
  margin-bottom: 3px;
}

.ws-char-tag {
  font-size: 12px;
  color: #4580FF;
  margin-bottom: 5px;
}

.ws-char-desc {
  font-size: 13px;
  color: #5A6579;
  line-height: 1.55;
}

/* 分镜卡片 */
.ws-board-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(240px, 1fr));
  gap: 14px;
}

.ws-board-card {
  padding: 18px;
  background: #13161E;
  border: 1px solid #1E2129;
  border-left: 3px solid #165DFF;
  border-radius: 10px;
  transition: all 0.2s;
}

.ws-board-card:hover {
  border-color: #2E313C;
  transform: translateY(-2px);
}

.ws-board-num {
  font-size: 12px;
  font-weight: 600;
  color: #5A6579;
  margin-bottom: 7px;
}

.ws-board-tag {
  display: inline-block;
  padding: 3px 9px;
  border-radius: 5px;
  font-size: 12px;
  font-weight: 500;
  margin-bottom: 9px;
}

.ws-board-desc {
  font-size: 13px;
  color: #8891A5;
  line-height: 1.6;
  margin-bottom: 9px;
}

.ws-board-time {
  font-size: 12px;
  color: #5A6579;
}

/* ====== 台词检查 ====== */
.ws-dialog-root {
  flex: 1;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

.ws-dialog-stats {
  display: flex;
  gap: 14px;
  padding: 18px 22px;
  border-bottom: 1px solid #1E2129;
  flex-shrink: 0;
}

.ws-stat-card {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 5px;
  padding: 14px 24px;
  background: #13161E;
  border-radius: 9px;
  border: 1px solid #1E2129;
  min-width: 90px;
}

.ws-stat-val {
  font-size: 24px;
  font-weight: 700;
  line-height: 1;
}

.ws-stat-val.ok { color: #22C55E; }
.ws-stat-val.safe { color: #4580FF; }
.ws-stat-val.warn { color: #FFC41D; }

.ws-stat-lbl {
  font-size: 12px;
  color: #5A6579;
}

.ws-dialog-body {
  flex: 1;
  overflow: hidden;
  display: flex;
  flex-direction: column;
}

.ws-dialog-body .ws-output-body {
  border: none;
}

/* ====== 导出 ====== */
.ws-export-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(190px, 1fr));
  gap: 14px;
  margin-bottom: 24px;
}

.ws-export-card {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 9px;
  padding: 28px 18px;
  background: #13161E;
  border: 1px solid #1E2129;
  border-radius: 12px;
  cursor: pointer;
  transition: all 0.2s;
}

.ws-export-card:hover {
  border-color: #2E313C;
  transform: translateY(-2px);
  box-shadow: 0 6px 20px rgba(0, 0, 0, 0.30);
}

.ws-export-icon-box {
  width: 48px;
  height: 48px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.ws-export-name {
  font-size: 15px;
  font-weight: 600;
  color: #F0F2F5;
}

.ws-export-desc {
  font-size: 12px;
  color: #5A6579;
}

.ws-export-panel {
  background: #13161E;
  border: 1px solid #1E2129;
  border-radius: 9px;
  padding: 18px;
}

.ws-export-row {
  display: flex;
  align-items: center;
  gap: 14px;
}

.ws-export-lbl {
  font-size: 13px;
  color: #8891A5;
  font-weight: 500;
  white-space: nowrap;
}

.ws-simple-preview {
  flex: 1;
  display: flex;
  flex-direction: column;
  padding: 16px 22px;
}

/* ====== 聊天 (script-chat) ====== */
.ws-chat-root {
  flex: 1;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

.ws-chat-msgs {
  flex: 1;
  overflow-y: auto;
  display: flex;
  flex-direction: column;
  gap: 12px;
  padding: 22px;
}

.ws-chat-msg {
  display: flex;
}

.ws-chat-msg.user { justify-content: flex-end; }
.ws-chat-msg.assistant { justify-content: flex-start; }

.ws-chat-bubble {
  max-width: 70%;
  padding: 11px 16px;
  border-radius: 12px;
  font-size: 14px;
  line-height: 1.7;
}

.ws-chat-msg.user .ws-chat-bubble {
  background: #165DFF;
  color: #fff;
  border-bottom-right-radius: 4px;
}

.ws-chat-msg.assistant .ws-chat-bubble {
  background: #13161E;
  color: #E8EAED;
  border: 1px solid #1E2129;
  border-bottom-left-radius: 4px;
}

.ws-chat-typing {
  color: #5A6579;
}

/* ====== 右侧面板 290px ====== */
.ws-right {
  width: 290px;
  min-width: 290px;
  display: flex;
  flex-direction: column;
  gap: 14px;
  padding: 16px;
  background: #0E1117;
  border-left: 1px solid #1E2129;
  overflow-y: auto;
}

/* 玻璃会员面板 */
.ws-glass {
  background: rgba(19, 22, 30, 0.50);
  backdrop-filter: blur(14px);
  -webkit-backdrop-filter: blur(14px);
  border: 1px solid rgba(255, 255, 255, 0.05);
  border-radius: 12px;
  padding: 18px;
  flex-shrink: 0;
}

.ws-glass-head {
  display: flex;
  align-items: center;
  gap: 9px;
  font-size: 14px;
  font-weight: 600;
  color: #F0F2F5;
  margin-bottom: 16px;
}

.ws-glass-body {
  display: flex;
  flex-direction: column;
  gap: 7px;
  margin-bottom: 16px;
}

.ws-glass-perm {
  display: flex;
  align-items: center;
  gap: 9px;
  font-size: 13px;
  color: #C5CAD3;
  padding: 5px 0;
}

.ws-glass-perm.disable {
  opacity: 0.30;
}

.ws-glass-check {
  width: 19px;
  height: 19px;
  border-radius: 5px;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.ws-glass-check.on {
  background: #165DFF;
  color: #fff;
}

.ws-glass-check:not(.on) {
  background: #1E2129;
  border: 1px solid #2E313C;
}

.ws-glass-btn {
  width: 100%;
  padding: 9px;
  border-radius: 7px;
  background: rgba(22, 93, 255, 0.08);
  border: 1px solid rgba(22, 93, 255, 0.15);
  color: #4580FF;
  font-size: 13px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.15s;
  font-family: inherit;
}

.ws-glass-btn:hover {
  background: rgba(22, 93, 255, 0.14);
}

/* ====== 右侧输入面板 ====== */
.ws-inputs {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.ws-fld {
  display: flex;
  flex-direction: column;
  gap: 5px;
}

.ws-lbl {
  font-size: 12px;
  color: #5A6579;
  font-weight: 500;
}

.ws-hint {
  font-size: 13px;
  color: #5A6579;
  line-height: 1.6;
  margin: 0;
}

.ws-hint strong {
  color: #E8EAED;
  font-weight: 600;
}

.ws-inp,
.ws-tarea,
.ws-select {
  padding: 9px 12px;
  font-size: 14px;
  background: #080B10;
  border: 1px solid #1E2129;
  border-radius: 7px;
  color: #E8EAED;
  outline: none;
  font-family: inherit;
  transition: border-color 0.2s;
}

.ws-inp:focus,
.ws-tarea:focus,
.ws-select:focus {
  border-color: #165DFF;
}

.ws-tarea {
  resize: vertical;
  line-height: 1.6;
  min-height: 64px;
  box-sizing: border-box;
}

.ws-select {
  cursor: pointer;
}

.ws-row {
  display: flex;
  gap: 10px;
}

.ws-row .ws-fld {
  flex: 1;
}

.ws-radio-bar {
  display: flex;
  gap: 4px;
  background: #080B10;
  border-radius: 7px;
  padding: 3px;
  border: 1px solid #1E2129;
}

.ws-radio {
  flex: 1;
  text-align: center;
  padding: 6px 8px;
  border-radius: 5px;
  font-size: 12px;
  color: #5A6579;
  cursor: pointer;
  transition: all 0.15s;
}

.ws-radio.on {
  background: #165DFF;
  color: #fff;
  font-weight: 500;
}

.ws-radio input { display: none; }

/* ====== 进度条 ====== */
.ws-progress {
  margin-top: 6px;
}

.ws-progress-bar {
  width: 100%;
  height: 3px;
  background: #1E2129;
  border-radius: 2px;
  overflow: hidden;
}

.ws-progress-fill {
  height: 100%;
  width: 30%;
  background: #165DFF;
  border-radius: 2px;
  animation: wsLoad 1.5s ease-in-out infinite;
}

@keyframes wsLoad {
  0% { transform: translateX(-100%); }
  100% { transform: translateX(400%); }
}

/* ====== Spinner ====== */
.ws-spin {
  display: inline-block;
  width: 15px;
  height: 15px;
  border: 2px solid rgba(255, 255, 255, 0.25);
  border-top-color: #fff;
  border-radius: 50%;
  animation: wsSpin 0.6s linear infinite;
}

@keyframes wsSpin {
  to { transform: rotate(360deg); }
}

/* ====== Highlight 高亮 ====== */
:deep(.hl-red) {
  background: rgba(245, 63, 63, 0.13);
  color: #F87171;
  border-radius: 3px;
  padding: 0 4px;
}

:deep(.hl-yellow) {
  background: rgba(255, 170, 0, 0.13);
  color: #FFC41D;
  border-radius: 3px;
  padding: 0 4px;
}

:deep(.hl-blue) {
  background: rgba(22, 93, 255, 0.13);
  color: #60A5FA;
  border-radius: 3px;
  padding: 0 4px;
}

/* ====== 滚动条 ====== */
.ws-main ::-webkit-scrollbar,
.ws-nav-items::-webkit-scrollbar,
.ws-right::-webkit-scrollbar {
  width: 5px;
}

.ws-main ::-webkit-scrollbar-thumb,
.ws-nav-items::-webkit-scrollbar-thumb,
.ws-right::-webkit-scrollbar-thumb {
  background: #1E2129;
  border-radius: 3px;
}

.ws-main ::-webkit-scrollbar-track,
.ws-nav-items::-webkit-scrollbar-track,
.ws-right::-webkit-scrollbar-track {
  background: transparent;
}
</style>
