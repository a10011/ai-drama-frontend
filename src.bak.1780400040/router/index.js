import { createRouter, createWebHistory } from 'vue-router'

const routes = [
  {
    path: '/',
    name: 'Home',
    component: () => import('@/views/home/HomePage.vue')
  },
  {
    path: '/projects',
    name: 'Projects',
    component: () => import('@/views/projects/ProjectsPage.vue'),
    meta: { title: '我的作品', requiresAuth: true }
  },
  {
    path: '/create',
    name: 'CreateDrama',
    component: () => import('@/views/create/CreateDrama.vue'),
    meta: { title: '创建短剧', requiresAuth: true }
  },
  {
    path: '/drama/:id/progress',
    name: 'DramaProgress',
    component: () => import('@/views/drama/ProgressPage.vue'),
    meta: { title: '生成进度', requiresAuth: true }
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

// 路由守卫
router.beforeEach((to, from, next) => {
  const token = localStorage.getItem('token')

  if (to.meta.requiresAuth && !token) {
    next('/login')
  } else {
    next()
  }
})

export default router
