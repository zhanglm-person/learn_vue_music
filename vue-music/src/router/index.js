import Vue from 'vue'
import Router from 'vue-router'

import Recommend from 'components/recommend/recommend'
import Rank from 'components/rank/rank'
import Search from 'components/search/search'
import Singer from 'components/singer/singer'

import SingerDetial from 'components/singer-detial/singer-detial'
import Disc from 'components/disc/disc'
import TopList from 'components/top-list/top-list'

Vue.use(Router)

/*
 const SingerDetial = (resolve) => {
 import('components/singer-detial/singer-detial').then((module) => {
 resolve(module)
 })
 }*/


export default new Router({
  routes: [
    {
      path: "/",
      redirect: "/recommend"
    },
    {
      path: "/recommend",
      component: Recommend,
      children: [{
        path: ":id",
        component: Disc
      }]
    },
    {
      path: "/rank",
      component: Rank,
      children: [
        {
          path: ':id',
          component: TopList
        }
      ]
    },
    {
      path: "/search",
      component: Search
    },
    {
      path: "/singer",
      component: Singer,
      children: [
        {
          path: ":id",           //以ID为变量
          component: SingerDetial
        }
      ]
    }
  ]
})
