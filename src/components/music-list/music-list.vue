<template>
  <div class="music-list">
    <div class="back" @click="back">
      <i class="icon-back"></i>
    </div>
    <h1 class="title" v-html="title"></h1>
    <div class="bg-image" :style="bgStyle" ref="bgImg">
      <div class="play-wrapper">
        <div class="play" v-show="songs.length>0" ref="playBtn" @click="random">
          <i class="icon-play"></i>
          <span class="text">随机播放全部</span>
        </div>
      </div>
      <div class="filter" ref="filter"></div>
    </div>
    <div class="bg-layer" ref="bgLayer"></div>
    <scroll :data="songs"
            @scroll="scroll"
            :probe-type="probeType"
            :listen-scroll="listenScroll"
            class="list"
            ref="list"
    >
      <div class="song-list-wrapper">
        <song-list @select="select" :rank="rank" :songs="songs"></song-list>
      </div>
      <div class="loading-content" v-if="!songs.length">
        <loading></loading>
      </div>
    </scroll>
  </div>
</template>

<script type='text/ecmascript-6'>
import Scroll from 'base/scroll/scroll'
import SongList from 'base/song-list/song-list'
import Loading from 'base/loading/loading'
import { prefixStyle } from 'common/js/dom'
import { mapActions } from 'vuex'
import { playlistMixin } from 'common/js/mixin'

const RESERVED_HEIGHT = 40

const transform = prefixStyle('transform')
const backdrop = prefixStyle('backdrop-filter')
export default {
  mixins: [playlistMixin],
  components: {
    Scroll,
    SongList,
    Loading
  },
  props: {
    bgImg: {
      type: String,
      default: ''
    },
    songs: {
      type: Array,
      default: () => []
    },
    title: {
      type: String,
      default: ''
    },
    rank: {
      type: Boolean,
      default: false
    }
  },
  data () {
    return {
      scrollY: 0
    }
  },
  computed: {
    bgStyle () {
      return `background-image:url(${this.bgImg})`
    }
  },
  created () {
    this.probeType = 3 // 监听scroll组件的滚动,并且返回位置
    this.listenScroll = true // 监听scroll组件的滚动
  },
  mounted () {
    this.imgHeight = this.$refs.bgImg.clientHeight // 获取到图片的高度
    this.minTranslateY = -this.imgHeight + RESERVED_HEIGHT // 取消掉顶部的固定的高度
    // this.$refs对应取到的是components对象，需要拿到 $el 取真实的DOM
    // 背景图的大小随着设备尺寸不同，所以要根据 背景图的高度 来设置
    this.$refs.list.$el.style.top = this.imgHeight + 'px'
  },
  methods: {
    handlePlaylist (playlist) {
      // 这里的playlist是mixin里面带出来的
      const bottom = playlist.length > 0 ? '60px' : ''
      this.$refs.list.$el.style.bottom = bottom // 改变scroll组件的视口高度然后刷新scroll
      this.$refs.list.refresh()
    },
    scroll (pos) {
      this.scrollY = pos.y
    },
    back () {
      this.$router.back()
      // 回退 router
    },
    select (item, index) {
      // console.log(item)
      // 设置playlist 和 sequencelist ...
      // 传入的item不用，是因为 song-list组件只能提供当前的元素以及索引，但是列表是父组件的songs。子组件不关心外部事件，尽可能做自己所做的
      this.selectPlay({
        list: this.songs,
        index
      })
    },
    random () {
      this.randomPlay({
        list: this.songs
      })
    },
    ...mapActions([
      'selectPlay',
      'randomPlay'
    ])
  },
  watch: {
    scrollY (newY) {
      let translateY = Math.max(this.minTranslateY, newY) // 负值 所以要比较最大值出来
      let zIndex = 0
      let scale = 1
      let blur = 0
      this.$refs.bgLayer.style[transform] = 'translate3d(0,' + translateY + 'px,0)'
      const percent = Math.abs(newY / this.imgHeight)
      // 滚动距离和图片高度做百分比计算
      if (newY > 0) {
        scale = 1 + percent
        zIndex = 10
      } else {
        blur = Math.min(20 * percent, 20) // 最大是20
      }
      this.$refs.filter.style[backdrop] = 'blur(' + blur + 'px)'
      if (this.minTranslateY > newY) { // 判断已经滚动到顶部了，要增大bgImg的层级，减少高度（paddingTop撑起来的），隐藏随机播放全部按钮
        zIndex = 10
        this.$refs.bgImg.style.paddingTop = 0
        this.$refs.bgImg.style.height = RESERVED_HEIGHT + 'px'
        this.$refs.playBtn.style.display = 'none'
      } else { // 判断已经滚动到顶部下边了，不再改变bgImg层级，还原利用paddingTop撑起的高度，展示随机播放全部按钮
        this.$refs.bgImg.style.paddingTop = '70%'
        this.$refs.bgImg.style.height = '0px'
        this.$refs.playBtn.style.display = ''
      }
      this.$refs.bgImg.style.zIndex = zIndex
      // 如果下拉过大，则放大bgImg展示效果
      this.$refs.bgImg.style[transform] = 'scale(' + scale + ')'
    }
  }
}
</script>

<style lang="stylus" rel="stylesheet/stylus">
  @import "~common/stylus/variable"
  @import "~common/stylus/mixin"
  .music-list
    position fixed
    z-index 100
    top 0
    bottom 0
    left 0
    right 0
    background $color-background
    .back
      position absolute
      top: 0
      left: 6px
      z-index: 50
      .icon-back
        display: block
        padding: 10px
        font-size: $font-size-large-x
        color: $color-theme
    .title
      position: absolute
      top: 0
      left: 10%
      z-index: 40
      width: 80%
      no-wrap()
      text-align: center
      line-height: 40px
      font-size: $font-size-large
      color: $color-text
    .bg-image
      position: relative
      width: 100%
      height: 0
      padding-top: 70%
      transform-origin: top
      background-size: cover
      .play-wrapper
        position: absolute
        bottom: 20px
        z-index: 50
        width: 100%
        .play
          box-sizing: border-box
          width: 135px
          padding: 7px 0
          margin: 0 auto
          text-align: center
          border: 1px solid $color-theme
          color: $color-theme
          border-radius: 100px
          font-size: 0
          .icon-play
            display: inline-block
            vertical-align: middle
            margin-right: 6px
            font-size: $font-size-medium-x
          .text
            display: inline-block
            vertical-align: middle
            font-size: $font-size-small
      .filter
        position: absolute
        top: 0
        left: 0
        width: 100%
        height: 100%
        background: rgba(7, 17, 27, 0.4)
    .bg-layer
      position: relative
      height: 100%
      background: $color-background
    .list
      position: fixed
      top: 0
      bottom: 0
      width: 100%
      background: $color-background
      .song-list-wrapper
        padding: 20px 30px
      .loading-content
        position: absolute
        width: 100%
        top: 50%
        transform: translateY(-50%)
</style>
