import { createRouter, createWebHistory } from "vue-router"

const routes = [
  { path: "/", name: "Home", component: () => import("@/views/HomePage.vue"), meta: { title: "首页" } },
  { path: "/create", name: "Create", component: () => import("@/views/CreatePage.vue"), meta: { title: "创作工作台" } },
  { path: "/create/pro", name: "ProCreate", component: () => import("@/views/ProCreatePage.vue"), meta: { title: "专业共创模式" } },
  { path: "/create/faceswap/:characterId", name: "FaceSwap", component: () => import("@/views/create/FaceSwap.vue"), meta: { title: "角色换装" } },
  { path: "/create/ad", name: "AdCreate", component: () => import("@/views/AdCreatePage.vue"), meta: { title: "广告片创作" } },
  { path: "/create/promo", name: "PromoCreate", component: () => import("@/views/PromoCreatePage.vue"), meta: { title: "宣传片制作" } },
  { path: "/create/ref-video", name: "RefVideo", component: () => import("@/views/ModePage.vue"), meta: { title: "参考视频模仿" } },
  { path: "/track/:id", name: "Track", component: () => import("@/views/TrackPage.vue"), meta: { title: "进度" } },
  { path: "/result/:id", name: "Result", component: () => import("@/views/ResultPage.vue"), meta: { title: "作品" } },
  { path: "/profile", name: "Profile", component: () => import("@/views/ProfilePage.vue"), meta: { title: "个人中心" } },
  { path: "/projects", name: "Projects", component: () => import("@/views/projects/ProjectsPage.vue"), meta: { title: "我的作品" } },
  { path: "/history", name: "History", component: () => import("@/views/HistoryPage.vue"), meta: { title: "历史" } },
  { path: "/login", name: "Login", component: () => import("@/views/LoginPage.vue") },
  { path: "/register", name: "Register", component: () => import("@/views/RegisterPage.vue") },
  { path: "/membership", name: "Membership", component: () => import("@/views/Membership.vue"), meta: { title: "会员权益" } },
  { path: "/payment", name: "Payment", component: () => import("@/views/PaymentPage.vue"), meta: { title: "充值中心" } },
  { path: "/media", name: "MediaLibrary", component: () => import("@/views/media/MediaLibrary.vue"), meta: { title: "素材库" } },
  { path: "/market", name: "SharedMarket", component: () => import("@/views/market/SharedMarket.vue"), meta: { title: "灵感社区" } },
  { path: "/api-keys", name: "ApiKeys", component: () => import("@/views/ApiKeysPage.vue"), meta: { title: "API Key" } },
  { path: "/script-chat", name: "ScriptChat", component: () => import("@/views/ScriptChat.vue"), meta: { title: "写剧本" } },
  { path: "/mode", name: "ModePage", component: () => import("@/views/ModePage.vue"), meta: { title: "短剧工作台" } },
]

const router = createRouter({ history: createWebHistory(), routes })

const publicPages = ["/", "/login", "/register", "/create", "/create/ad", "/create/promo", "/create/ref-video", "/create/pro", "/membership", "/payment", "/media", "/market", "/api-keys", "/script-chat", "/result", "/mode"]

router.beforeEach((to, from, next) => {
  const token = localStorage.getItem("token")
  if (!token && !publicPages.includes(to.path)) { next("/login") }
  else { next() }
})

export default router
