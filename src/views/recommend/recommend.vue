<template>
  <div class="recommend" ref="recommend">
    <scroll ref="scroll" class="recommend-content" :data="discList">
      <div>
        <div v-if="recommends.length" class="silder-wrapper" ref="silderWrapper">
          <slider>
            <div class="slider-item" v-for="(item, index) in recommends" :key="index">
              <a :href="item.linkUrl">
                <img class="needsclick" @load="loadImg" :src="item.picUrl" alt="">
              </a>
            </div>
          </slider>
        </div>
        <div class="recommend-list">
          <h1 class="list-title">热门歌单推荐</h1>
          <ul>
            <li @click="selectItem(item,index)" class="item" v-for="(item,index) in discList" :key="index">
              <div class="icon">
                <img v-lazy="item.imgurl" alt="" width="60" height="60">
              </div>
              <div class="text">
                <h2 class="name" v-html="item.creator.name"></h2>
                <p class="desc" v-html="item.dissname"></p>
              </div>
            </li>
          </ul>
        </div>
      </div>
      <div class="loading-content" v-show="!discList.length">
        <loading></loading>
      </div>
    </scroll>
    <router-view></router-view>
  </div>
</template>

<script lang="ts">
import { Vue, Component, Mixins } from 'vue-property-decorator'
import { Mutation } from 'vuex-class'
import Slider from '@/base/slider/slider.vue'
import Scroll from '@/base/scroll/scroll.vue'
import Loading from '@/base/loading/loading.vue'
import { ERR_OK } from '@/api/config'
import { getRecommend, getDiscList } from '@/api/recommend'
import { PlaylistMixin } from '@/common/js/mixin'
import * as types from '@/store/mutations-type'
import Song from '@/common/js/song'
import { DiscInterface } from '@/api/apiInterface';

@Component({
  components: {
    Slider,
    Scroll,
    Loading,
  },
})
export default class Recommend extends Mixins(PlaylistMixin) {
  public recommends: object[] = []
  public discList: object = []
  public checkLoaded: boolean = false
  public $refs!: {
    scroll: Scroll,
    slider: Slider,
    recommend: HTMLElement,
  }

  @Mutation(types.SET_DISC) public setDisc!: (item: object) => void

  public created() {
    this.getRecommend()
    this.getDiscList()
  }

  public selectItem(item: DiscInterface, index: number) {
    this.$router.push({
      path: '/recommend/' + item.dissid,
    })
    this.setDisc(item)
  }

  public handlePlaylist(playlist: Song[]) {
    const bottom = playlist.length > 0 ? '60px' : ''
    this.$refs.recommend.style.bottom = bottom
    this.$refs.scroll.refresh()
  }

  public loadImg() {
    if (!this.checkLoaded) {
      this.checkLoaded = true
      this.$refs.scroll.refresh()
    }
  }

  private getRecommend() {
    getRecommend().then((rsp) => {
      if (rsp.code === ERR_OK) {
        this.recommends = rsp.data.slider
        // 异步获取数据，要保证获取到数据之后才能进对数据元素的操作，所以要给轮播图组件的容器加上v-if，防止数据没有获取到就进行了，slider组件的初始化操作。
      }
    })
  }
  private getDiscList() {
    getDiscList().then((rsp) => {
      if (rsp.code === ERR_OK) {
        this.discList = rsp.data.list
      }
    })
  }
}
</script>

<style lang="stylus" rel="stylesheet/stylus">
  @import "~@/common/stylus/variable"
  .recommend
    position: fixed
    width: 100%
    top: 88px
    bottom: 0
    .recommend-content
      height: 100%
      overflow: hidden
      .slider-wrapper
        position: relative
        width: 100%
        overflow: hidden
      .recommend-list
        .list-title
          height: 65px
          line-height: 65px
          text-align: center
          font-size: $font-size-medium
          color: $color-theme
        .item
          display flex
          box-sizing border-box
          align-items center
          padding 0 20px 20px
          .icon
            flex 0 0 60px
            width 60px
            padding-right 20px
          .text
            flex 1
            display flex
            justify-content center
            flex-direction column
            overflow hidden
            line-height 20px
            font-size $font-size-medium
            .name
              margin-bottom 10px
              color $color-text
            .desc
              color $color-text-d
      .loading-content
        position absolute
        top 50%
        width 100%
        transform translateY(-50%)
</style>
