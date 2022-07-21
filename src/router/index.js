import Vue from 'vue'
import Router from 'vue-router'

Vue.use(Router)

import Layout from '@/layout'

export const constantRoutes = [
  {
    path: '/login',
    component: () => import('@/views/login/index'),
    hidden: true
  },

  {
    path: '/404',
    component: () => import('@/views/404'),
    hidden: true
  },

  {
    path: '/',
    component: Layout,
    redirect: '/dashboard',
    children: [{
      path: 'dashboard',
      name: 'Dashboard',
      component: () => import('@/views/dashboard/index'),
      meta: { title: '首页', icon: 'dashboard' }
    }]
  },

  {
    path: '/flowChart',
    component: Layout,
    redirect: '/flowChart/administration',
    name: 'flowChart',
    meta: { title: '流程设计', icon: 'el-icon-s-help' },
    children: [
      {
        path: '/flowChart/administration',
        name: 'Administration',
        component: () => import('@/views/flowChart/administration.vue'),
        meta: { title: '流程管理', icon: 'table' }
      },
      {
        path: '/flowChart/childrenFlow',
        name: 'ChildrenFlow',
        component: () => import('@/views/flowChart/childrenFlow.vue'),
        meta: { title: '子流程', icon: 'tree' }
      },
      {
        path: '/flowChart/designDraw',
        name: 'DesignDraw',
        hidden: true,
        component: () => import('@/views/flowChart/designDraw.vue'),
        meta: { title: '设计流程' }
      },
      {
        path: '/flowChart/lookDraw',
        name: 'LookDraw',
        hidden: true,
        component: () => import('@/views/flowChart/lookDraw.vue'),
        meta: { title: '查看流程' }
      }
    ]
  },

  { path: '*', redirect: '/404', hidden: true }
]

const createRouter = () => new Router({
  // mode: 'history', // require service support
  scrollBehavior: () => ({ y: 0 }),
  routes: constantRoutes
})

const router = createRouter()

export function resetRouter() {
  const newRouter = createRouter()
  router.matcher = newRouter.matcher
}

export default router
