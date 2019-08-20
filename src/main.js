import 'babel-polyfill'

import Vue from 'vue'
import App from './App'
import router from './router'
import store from './store/index'
import VueLazyLoad from 'vue-lazyload'


// import fastclick from 'fastclick'
// fastclick.attach(document.body)
import 'common/stylus/index.styl'

Vue.use(VueLazyLoad, {
  loading: require('common/image/default.png')
});


Vue.config.productionTip = false

/* eslint-disable no-new */
new Vue({
  el: '#app',
  router,
  store,
  render: h => h(App)
})
