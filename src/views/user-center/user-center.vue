<template>
  <transition name="slide">
    <div class="user-center">
      <div class="back">
        <i class="icon-back" @click="back"></i>
      </div>
      <div class="switches-wrapper">
        <switches :switches="switches"
                  :currentIndex="currentIndex"
                  @switch="switchItem"
        ></switches>
      </div>
      <div ref="playBtn" class="play-btn" @click="random">
        <i class="icon-play"></i>
        <span class="text">随机播放全部</span>
      </div>
      <div ref="listWrapper" class="list-wrapper">
        <scroll ref="favoritelistWrapper" class="list-scroll" v-if="currentIndex===0" :data="favoriteList">
          <div class="list-inner">
            <song-list :songs="favoriteList" @select="selectSong"></song-list>
          </div>
        </scroll>
        <scroll ref="playlistWrapper" class="list-scroll" v-if="currentIndex===1"
                :data="playHistory">
          <div class="list-inner">
            <song-list :songs="playHistory" @select="selectSong"></song-list>
          </div>
        </scroll>
      </div>
      <div class="no-result-wrapper" v-show="noResult">
        <no-result :title="noResultTitle"></no-result>
      </div>
    </div>
  </transition>
</template>

<script lang="ts">
import Switches from '@/base/switches/switches.vue'
import Scroll from '@/base/scroll/scroll.vue'
import SongList from '@/base/song-list/song-list.vue'
import NoResult from '@/base/no-result/no-result.vue'
import Song from '@/common/js/song'
import { PlaylistMixin } from '@/common/js/mixin'
import { Mixins, Component } from 'vue-property-decorator';
import { Getter, Action } from 'vuex-class'

@Component({
  components: {
    Switches,
    SongList,
    Scroll,
    NoResult,
  },
})
export default class UserCenter extends Mixins(PlaylistMixin) {
  public switches: Array<{ [key: string]: string }> = [{ name: '我喜欢的' }, { name: '最近听的' }]
  public currentIndex: number = 0

  public $refs!: {
    listWrapper: HTMLElement
    favoritelistWrapper: Scroll
    playlistWrapper: Scroll,
  }

  @Getter public favoriteList!: Song[]
  @Getter public playHistory!: Song[]
  @Action public insertSong!: (song: Song) => void
  @Action public randomPlay!: (params: { list: Song[] }) => void

  get noResult(): boolean {
    if (this.currentIndex === 0) {
      return !this.favoriteList.length
    } else {
      return !this.playHistory.length
    }
  }

  get noResultTitle(): string {
    if (this.currentIndex === 0) {
      return '暂无收藏~'
    } else {
      return '还未听过歌曲~'
    }
  }

  public handlePlaylist(playlist: Song[]) {
    const bottom = playlist.length ? '60px' : ''
    this.$refs.listWrapper.style.bottom = bottom
    if (this.$refs.favoritelistWrapper) {
      this.$refs.favoritelistWrapper.refresh()
    }
    if (this.$refs.playlistWrapper) {
      this.$refs.playlistWrapper.refresh()
    }
  }

  public back() {
    this.$router.back()
  }

  public switchItem(index: number) {
    this.currentIndex = index
  }

  public selectSong(song: Song) {
    this.insertSong(new Song(song))
  }

  public random() {
    let list = this.currentIndex === 0 ? this.favoriteList : this.playHistory
    if (list.length === 0) {
      return
    }
    list = list.map((song) => {
      return new Song(song)
    })
    this.randomPlay({
      list,
    })
  }
}
</script>

<style scoped lang="stylus" rel="stylesheet/stylus">
  @import "~@/common/stylus/variable"

  .user-center
    position: fixed
    top: 0
    bottom: 0
    z-index: 100
    width: 100%
    background: $color-background
    &.slide-enter-active, &.slide-leave-active
      transition: all 0.3s
    &.slide-enter, &.slide-leave-to
      transform: translate3d(100%, 0, 0)
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
    .switches-wrapper
      margin: 10px 0 30px 0
    .play-btn
      box-sizing: border-box
      width: 135px
      padding: 7px 0
      margin: 0 auto
      text-align: center
      border: 1px solid  $color-text-l
      color: $color-text-l
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
    .list-wrapper
      position: absolute
      top: 110px
      bottom: 0
      width: 100%
      .list-scroll
        height: 100%
        overflow: hidden
        .list-inner
          padding: 20px 30px
    .no-result-wrapper
      position: absolute
      width: 100%
      top: 50%
      transform: translateY(-50%)
</style>
