<!--
 当前组件是对于sequencelist顺序列表的展示和操作。不管是不是随机播放。只要找到当前播放歌曲在sequencelist中的位置，切换播放状态即可~~！
-->
<template>
  <transition name="list-fade">
    <div class="playlist" v-show="showFlag" @click="hide">
      <div class="list-wrapper" @click.stop="">
        <div class="list-header">
          <h1 class="title">
            <i class="icon" :class="iconMode" @click="changeMode"></i>
            <span class="text">{{modeText}}</span>
            <span class="clear" @click="showConfirm"><i class="icon-clear"></i></span>
          </h1>
        </div>
        <scroll :refreshDelay="refreshDelay" ref="listContent" class="list-content" :data="sequencelist">
          <transition-group tag="ul" name="list">
            <li :key="item.id" ref="listItem" class="item" v-for="(item,index) in sequencelist"
                @click="selectItem(item,index)">
              <i class="current" :class="getCurrentIcon(item)"></i>
              <span class="text">{{item.name}}</span>
              <span class="like" @click.stop="toggleFavorite(item)">
                <i :class="getFavoriteIcon(item)"></i>
              </span>
              <span class="delete" @click.stop="deleteOne(item)">
                <i class="icon-delete"></i>
              </span>
            </li>
          </transition-group>
        </scroll>
        <div class="list-operate">
          <div class="add" @click.stop="addSong">
            <i class="icon-add"></i>
            <span class="text">添加歌曲到队列</span>
          </div>
        </div>
        <div class="list-close" @click="hide">
          <span>关闭</span>
        </div>
      </div>
      <confirm ref="confirm"
               confirmBtnText="清空"
               text="是否清空播放列表？"
               @confirm="confirmClear"
      ></confirm>
      <add-song ref="addSong"></add-song>
    </div>
  </transition>
</template>

<script lang="ts">
import { Vue, Component, Mixins, Prop, Watch } from 'vue-property-decorator'
import { Action } from 'vuex-class'
import { playMode } from '@/common/js/config'
import { PlayerMixin } from '@/common/js/mixin'
import Scroll from '@/base/scroll/scroll.vue'
import Confirm from '@/base/confirm/confirm.vue'
import AddSong from '@/components/add-song/add-song.vue'
import Song from '@/common/js/song'

@Component({
  components: {
    Scroll,
    Confirm,
    AddSong,
  },
})
export default class PlayList extends Mixins(PlayerMixin) {
  public showFlag: boolean = false
  // 这里设置refreshDelay，是因为避免用户操作动画之后，scroll组件刷新已经完成。所以延长scroll组件监听到data变化后的刷新时间。
  public refreshDelay: number = 120

  public $refs!: {
    addSong: AddSong
    confirm: Confirm
    listContent: Scroll,
    listItem: HTMLLIElement[],
  }

  @Action public deleteSong!: (song: Song) => void
  @Action public deleteSongList!: () => void


  get modeText(): string {
    return this.mode === playMode.sequence ? '顺序播放' : this.mode === playMode.random ? '随机播放' : '单曲循环'
  }

  public addSong() {
    this.$refs.addSong.show()
  }

  public showConfirm() {
    this.$refs.confirm.show()
  }

  public confirmClear() {
    // 点击清空删除所有歌曲
    this.deleteSongList()
    this.hide()
  }

  public show() {
    this.showFlag = true
    setTimeout(() => {
      this.$refs.listContent.refresh()
      this.scrollToCurrent(this.currentSong)// 滚动到当前播放的歌曲位置
    }, 20)
  }

  public hide() {
    this.showFlag = false
  }

  public getCurrentIcon(item: Song) {
    // 当前播放歌曲的icon
    if (item.id === this.currentSong.id) {
      return 'icon-play'
    } else {
      return ''
    }
  }

  public selectItem(item: Song, index: number) {
    // 如果是随机播放，就要找到当前歌曲在播放列表的位置index，设置currentIndex
    if (this.mode === playMode.random) {
      index = this.playlist.findIndex((song) => {
        return song.id === item.id
      })
    }
    this.setCurrentIndex(index)
    this.setPlayingState(true)
  }

  public scrollToCurrent(current: Song) {
    const index = this.sequencelist.findIndex((song) => {
      return song.id === current.id
    })
    this.$refs.listContent.scrollToElement(this.$refs.listItem[index], 300)
  }

  public deleteOne(item: Song) {
    this.deleteSong(item)
    // 删除歌曲之后，判断时候还有歌曲。没有就隐藏掉playlist，防止再次添加歌曲，player父组件的展示引起playlist的展示。
    if (!this.playlist.length) {
      this.hide()
    }
  }

  @Watch('currentSong')
  public onCurrentSongChange(newSong: Song, oldSong: Song) {
    if (!this.showFlag || newSong.id === oldSong.id) {
      return
    }
    this.scrollToCurrent(newSong)// 滚动到当前播放的歌曲位置
  }
}
</script>

<style scoped lang="stylus" rel="stylesheet/stylus">
  @import "~@/common/stylus/variable"
  @import "~@/common/stylus/mixin"

  .playlist
    position: fixed
    left: 0
    right: 0
    top: 0
    bottom: 0
    z-index: 200
    background-color: $color-background-d
    &.list-fade-enter-active, &.list-fade-leave-active
      transition: opacity 0.3s
      .list-wrapper
        transition: all 0.3s
    &.list-fade-enter, &.list-fade-leave-to
      opacity: 0
      .list-wrapper
        transform: translate3d(0, 100%, 0)
    &.list-fade-enter
    .list-wrapper
      position: absolute
      left: 0
      bottom: 0
      width: 100%
      background-color: $color-highlight-background
      .list-header
        position: relative
        padding: 20px 30px 10px 20px
        .title
          display: flex
          align-items: center
          .icon
            margin-right: 10px
            font-size: 30px
            color: $color-theme-d
          .text
            flex: 1
            font-size: $font-size-medium
            color: $color-text-l
          .clear
            extend-click()
            .icon-clear
              font-size: $font-size-medium
              color: $color-text-d
      .list-content
        max-height: 240px
        overflow: hidden
        .item
          display: flex
          align-items: center
          height: 40px
          padding: 0 30px 0 20px
          overflow: hidden
          &.list-enter-active, &.list-leave-active
            transition: all 0.1s
          &.list-enter, &.list-leave-to
            height: 0
          .current
            flex: 0 0 20px
            width: 20px
            font-size: $font-size-small
            color: $color-theme-d
          .text
            flex: 1
            no-wrap()
            font-size: $font-size-medium
            color: $color-text-d
          .like
            extend-click()
            margin-right: 15px
            font-size: $font-size-small
            color: $color-theme
            .icon-favorite
              color: $color-sub-theme
          .delete
            extend-click()
            font-size: $font-size-small
            color: $color-theme
      .list-operate
        width: 140px
        margin: 20px auto 30px auto
        .add
          display: flex
          align-items: center
          padding: 8px 16px
          border: 1px solid $color-text-l
          border-radius: 100px
          color: $color-text-l
          .icon-add
            margin-right: 5px
            font-size: $font-size-small-s
          .text
            font-size: $font-size-small
      .list-close
        text-align: center
        line-height: 50px
        background: $color-background
        font-size: $font-size-medium-x
        color: $color-text-l
</style>
