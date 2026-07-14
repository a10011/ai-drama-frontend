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
    meta: { title: '\u6211\u7684\u4f5c\u54c1' }
  },
  {
    path: '/create',
    name: 'CreateDrama',
    component: () => import('@/views/create/CreateDrama.vue'),
    meta: { title: '\u521b\u5efa\u77ed\u5267' }
  },
  {
    path: '/drama/:id/progress',
    name: 'DramaProgress',
    component: () => import('@/views/drama/ProgressPage.vue'),
    meta: { title: '\u751f\u6210\u8fdb\u5ea6' }
  },
  {
    path: '/project/:id/characters',
    name: 'Characters',
    component: () => import('@/views/characters/CharactersPage.vue'),
    meta: { title: '\u89d2\u8272\u7ba1\u7406' }
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

export default router
