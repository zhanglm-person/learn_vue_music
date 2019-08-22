import Vue from 'vue'
import Router from 'vue-router'

import Recommend from '../views/recommend/recommend.vue'

Vue.use(Router)

export default new Router({
  mode: 'history',
  base: process.env.BASE_URL,
  routes: [
    {
      path: '/',
      redirect: '/recommend',
    },
    {
      path: '/recommend',
      component: Recommend,
      children: [
        {
          path: ':id',
          component: () => import(/* webpackChunkName: "disc" */ '../views/disc/disc.vue'),
        },
      ],
    },
    {
      path: '/rank',
      component: () => import(/* webpackChunkName: "rank" */ '../views/rank/rank.vue'),
      children: [
        {
          path: ':id',
          component: () => import(/* webpackChunkName: "top-list" */ '../views/top-list/top-list.vue'),
        },
      ],
    },
    {
      path: '/search',
      component: () => import(/* webpackChunkName: "search" */ '../views/search/search.vue'),
      children: [
        {
          path: ':id', // 以ID为变量
          component: () => import(/* webpackChunkName: "singer-detail" */ '../views/singer-detial/singer-detial.vue'),
        },
      ],
    },
    {
      path: '/singer',
      component: () => import(/* webpackChunkName: "singer" */ '../views/singer/singer.vue'),
      children: [
        {
          path: ':id', // 以ID为变量
          component: () => import(/* webpackChunkName: "singer-detail" */ '../views/singer-detial/singer-detial.vue'),
        },
      ],
    },
    {
      path: '/user',
      component: () => import(/* webpackChunkName: "user-center" */ '../views/user-center/user-center.vue'),
    },
  ],
})
