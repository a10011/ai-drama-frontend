import { createRouter, createWebHistory } from 'vue-router'

const routes = [
  {
    path: '/',
    name: 'Home',
    component: () => import('@/views/home/HomePage.vue'),
    meta: { title: '工作台' }
  },
  {
    path: '/login',
    name: 'Login',
    component: () => import('@/views/login/LoginPage.vue'),
    meta: { title: '登录' }
  },
  {
    path: '/register',
    name: 'Register',
    component: () => import('@/views/register/RegisterPage.vue'),
    meta: { title: '注册' }
  },
  {
    path: '/create',
    name: 'CreateDrama',
    component: () => import('@/views/create/CreateDrama.vue'),
    meta: { title: '创建短剧' }
  },
  {
    path: '/generate',
    name: 'Generate',
    component: () => import('@/views/generate/GeneratePage.vue'),
    meta: { title: '生成进度' }
  },
  {
    path: '/tasks',
    name: 'Tasks',
    component: () => import('@/views/tasks/TasksPage.vue'),
    meta: { title: '任务队列' }
  },
  {
    path: '/profile',
    name: 'Profile',
    component: () => import('@/views/profile/ProfilePage.vue'),
    meta: { title: '个人中心' }
  },
  {
    path: '/projects',
    name: 'Projects',
    component: () => import('@/views/projects/ProjectsPage.vue'),
    meta: { title: '我的作品' }
  },
  {
    path: '/characters',
    name: 'Characters',
    component: () => import('@/views/characters/CharactersPage.vue'),
    meta: { title: '角色管理' }
  },
  {
    path: '/progress',
    name: 'Progress',
    component: () => import('@/views/drama/ProgressPage.vue'),
    meta: { title: '项目进度' }
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

// 路由守卫 - 更新标题
router.beforeEach((to, from, next) => {
  document.title = to.meta.title ? to.meta.title + ' - AI短剧工坊' : 'AI短剧工坊'
  next()
})

export default router
