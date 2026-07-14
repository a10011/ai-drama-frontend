import { createRouter, createWebHistory } from 'vue-router'

const routes = [
  {
    path: '/',
    name: 'Home',
    component: () => import('@/views/home/HomePage.vue')
  },
  {
    path: '/login',
    name: 'Login',
    component: () => import('@/views/login/LoginPage.vue')
  },
  {
    path: '/register',
    name: 'Register',
    component: () => import('@/views/register/RegisterPage.vue')
  },
  {
    path: '/projects',
    name: 'Projects',
    component: () => import('@/views/projects/ProjectsPage.vue'),
    meta: { title: '我的作品' }
  },
  {
    path: '/create',
    name: 'CreateDrama',
    component: () => import('@/views/create/CreateDrama.vue'),
    meta: { title: '创建短剧' }
  },
  {
    path: '/drama/:id/progress',
    name: 'DramaProgress',
    component: () => import('@/views/drama/ProgressPage.vue'),
    meta: { title: '生成进度' }
  },
  {
    path: '/project/:id/characters',
    name: 'Characters',
    component: () => import('@/views/characters/CharactersPage.vue'),
    meta: { title: '角色管理' }
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
    path: '/generate/:id',
    name: 'Generate',
    component: () => import('@/views/generate/GeneratePage.vue'),
    meta: { title: '生成进度' }
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

export default router
