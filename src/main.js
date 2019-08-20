import Vue from 'vue'
import App from './App.vue'
import router from './router/index'
import store from './store/index'
import VueLazyLoad from 'vue-lazyload'

import { SET_PLAY_HISTORY, SET_FAVORITE_LIST } from './store/mutations-type'
import { loadPlay, loadFavorite } from 'common/js/cache'
import { processSongsUrl } from './common/js/song'

import './common/stylus/index.styl'

Vue.config.productionTip = false

Vue.use(VueLazyLoad, {
  loading: require('./common/image/default.png')
})

// 设置播放列表
const historySongs = loadPlay()
processSongsUrl(historySongs).then(songs => {
  store.commit(SET_PLAY_HISTORY, songs)
})

// 设置喜欢的歌曲
const favoriteSongs = loadFavorite()
processSongsUrl(favoriteSongs).then(songs => {
  store.commit(SET_FAVORITE_LIST, songs)
})

new Vue({
  router,
  store,
  render: h => h(App)
}).$mount('#app')
