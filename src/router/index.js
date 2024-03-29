import Vue from 'vue'
import VueRouter from 'vue-router'

Vue.use(VueRouter)

const router = new VueRouter({
  mode: 'history',
  base: process.env.BASE_URL,
  scrollBehavior() {
    return { x: 0, y: 0 }
  },
  routes: [
    {
      path: '/',
      name: 'events',
      component: () => import('@/views/event/eventHome.vue'),
      meta: {
        contentRenderer: 'sidebar-left',
        contentClass: 'todo-application',
        navActiveLink: 'apps-todo',
        pageTitle: 'evenement',
        // breadcrumb: [
        //   {
        //     text: 'evenement',
        //     active: true,
        //   },
        // ],
      },
    },
    {
      path: '/organisations',
      name: 'organisations',
      component: () => import('@/views/SecondPage.vue'),
      meta: {
        pageTitle: 'organisations',
        breadcrumb: [
          {
            text: 'organisations',
            active: true,
          },
        ],
      },
    },
    {
      path: '/login',
      name: 'login',
      component: () => import('@/views/Login.vue'),
      meta: {
        layout: 'full',
      },
    },
    {
      path: '/error-404',
      name: 'error-404',
      component: () => import('@/views/error/Error404.vue'),
      meta: {
        layout: 'full',
      },
    },
    {
      path: '*',
      redirect: 'error-404',
    },
  ],
})

// ? For splash screen
// Remove afterEach hook if you are not using splash screen
router.afterEach(() => {
  // Remove initial loading
  const appLoading = document.getElementById('loading-bg')
  if (appLoading) {
    appLoading.style.display = 'none'
  }
})

export default router
