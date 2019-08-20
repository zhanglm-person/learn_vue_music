import Vue from 'vue'
import Router from 'vue-router'

//import Recommend from 'components/recommend/recommend'
//import Rank from 'components/rank/rank'
//import Search from 'components/search/search'
//import Singer from 'components/singer/singer'
//import UserCenter from 'components/user-center/user-center'
//import SingerDetial from 'components/singer-detial/singer-detial'
//import Disc from 'components/disc/disc'
//import TopList from 'components/top-list/top-list'

Vue.use(Router);

const Recommend = (resolve) => {
  import('components/recommend/recommend').then((module) => {
    resolve(module)
  })
};
const Rank = (resolve) => {
  import('components/rank/rank').then((module) => {
    resolve(module)
  })
};
const Search = (resolve) => {
  import('components/search/search').then((module) => {
    resolve(module)
  })
};
const Singer = (resolve) => {
  import('components/singer/singer').then((module) => {
    resolve(module)
  })
};
const UserCenter = (resolve) => {
  import('components/user-center/user-center').then((module) => {
    resolve(module)
  })
};
const Disc = (resolve) => {
  import('components/disc/disc').then((module) => {
    resolve(module)
  })
};
const TopList = (resolve) => {
  import('components/top-list/top-list').then((module) => {
    resolve(module)
  })
};
const SingerDetial = (resolve) => {
  import('components/singer-detial/singer-detial').then((module) => {
    resolve(module)
  })
};

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
      component: Search,
      children: [
        {
          path: ":id",           //以ID为变量
          component: SingerDetial
        }
      ]
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
    },
    {
      path: "/user",
      component: UserCenter
    }
  ]
})
