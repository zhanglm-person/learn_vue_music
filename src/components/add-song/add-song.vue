<template>
  <transition name="slide">
    <div class="add-song" v-show="showFlag" @click.stop="">
      <div class="header">
        <h1 class="title">添加歌曲到列表</h1>
        <div class="close">
          <i class="icon-close" @click="hide"></i>
        </div>
      </div>
      <div class="search-box-wrapper">
        <search-box ref="searchBox" placeHolder="搜索歌曲" @query="search"></search-box>
      </div>
      <div class="shortcut" v-show="!query">
        <switches :switches="switches"
                  :currentIndex="currentIndex"
                  @switch="switchItem"
        ></switches>
        <div class="list-wrapper">
          <scroll ref="songlistwrapper" class="list-scroll" v-if="currentIndex===0" :data="playHistory">
            <div class="list-inner">
              <song-list :songs="playHistory" @select="selectSong"></song-list>
            </div>
          </scroll>
          <scroll :refreshDelay="refreshDelay" ref="searchlistwrapper" class="list-scroll" v-if="currentIndex===1"
                  :data="searchHistory">
            <div class="list-inner">
              <search-list @delete="deleteSearchHistory" @select="addQuery" :searches="searchHistory"></search-list>
            </div>
          </scroll>
        </div>
      </div>
      <div class="search-result" v-show="query">
        <suggest :query="query" :showSinger="showSinger" @select="selectSuggest" @listScroll="blurInput"></suggest>
      </div>
      <top-tip ref="topTip">
        <div class="tip-title">
          <i class="icon-ok"></i>
          <span class="text">1首歌曲已经添加到播放队列</span>
        </div>
      </top-tip>
    </div>
  </transition>
</template>

<script lang="ts">
import { Vue, Component, Mixins, Prop, Watch } from 'vue-property-decorator'
import { Getter, Action } from 'vuex-class'
import { SearchMixin } from '@/common/js/mixin'
import SearchBox from '@/base/search-box/search-box.vue'
import SongList from '@/base/song-list/song-list.vue'
import SearchList from '@/base/search-list/search-list.vue'
import Suggest from '@/components/suggest/suggest.vue'
import TopTip from '@/base/top-tip/top-tip.vue'
import Switches from '@/base/switches/switches.vue'
import Scroll from '@/base/scroll/scroll.vue'
import Song from '@/common/js/song'

@Component({
  components: {
    SearchBox,
    Suggest,
    Switches,
    Scroll,
    SongList,
    SearchList,
    TopTip,
  },
})
export default class AddSong extends Mixins(SearchMixin) {
  @Getter public playHistory!: Song[]
  @Action public insertSong!: (song: Song) => void

  public showFlag: boolean = false
  public showSinger: boolean = false
  public currentIndex: number = 0
  public switches: Array<{ [key: string]: string }> = [{ name: '最近播放' }, { name: '搜索历史' }]

  public $refs!: {
    songlistwrapper: Scroll
    searchlistwrapper: Scroll
    topTip: TopTip,
  }

  public show() {
    this.showFlag = true
    // 由于add-song本身是隐藏的，但是scroll已经被初始化了。所以在add-song显示的时候，刷新scroll组件，不然不会滚动
    setTimeout(() => {
      if (this.currentIndex === 0) {
        this.$refs.songlistwrapper.refresh()
      } else {
        this.$refs.searchlistwrapper.refresh()
      }
    }, 20)
  }

  public hide() {
    this.showFlag = false
  }

  public search(query: string) {
    // 子组件传递过来的用户输入的query，再由父组件传递给另一个suggest组件
    this.query = query
  }

  public selectSuggest() {
    // 点击搜索之后的列表单个内容，要保存搜索记录，并且显示tip
    this.saveSearch()
    this.showTopTip()
  }

  public switchItem(index: number) {
    this.currentIndex = index
  }

  public selectSong(song: Song, index: number) {
    // 如果点击的是正在播放的歌曲，就不用往播放列表里面添加。
    // 如果点击不是正在播放的歌曲，因为当前的最近播放列表是从本地存储中读取的,是一个个字符串（对象），
    // 不是 所需的 Song 的事例，所以要把存储的song用Song类实例化一下，再添加到播放列表。添加完成之后，显示tip提示
    if (index !== 0) {
      this.insertSong(new Song(song))
      this.showTopTip()
    }
  }

  public showTopTip() {
    // 父组件调用子组件tip的显示方法
    this.$refs.topTip.show()
  }
}
</script>

<style scoped lang="stylus" rel="stylesheet/stylus">
  @import "~@/common/stylus/variable"
  @import "~@/common/stylus/mixin"

  .add-song
    position: fixed
    top: 0
    bottom: 0
    width: 100%
    z-index: 200
    background: $color-background
    &.slide-enter-active, &.slide-leave-active
      transition: all 0.3s
    &.slide-enter, &.slide-leave-to
      transform: translate3d(100%, 0, 0)
    .header
      position: relative
      height: 44px
      text-align: center
      .title
        line-height: 44px
        font-size: $font-size-large
        color: $color-text
      .close
        position: absolute
        top: 0
        right: 8px
        .icon-close
          display: block
          padding: 12px
          font-size: 20px
          color: $color-theme

    .search-box-wrapper
      margin: 20px
    .shortcut
      .list-wrapper
        position: absolute
        top: 165px
        bottom: 0
        width: 100%
        .list-scroll
          height: 100%
          overflow: hidden
          .list-inner
            padding: 20px 30px
    .search-result
      position: fixed
      top: 124px
      bottom: 0
      width: 100%
    .tip-title
      text-align: center
      padding: 18px 0
      font-size: 0
      .icon-ok
        font-size: $font-size-medium
        color: $color-theme
        margin-right: 4px
      .text
        font-size: $font-size-medium
        color: $color-text
</style>
