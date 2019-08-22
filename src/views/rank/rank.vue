<template>
  <div class="rank" ref="rank">
    <srcoll class="top-list" :data="topList" ref="toplist">
      <ul>
        <li class="item" v-for="(item, index) in topList" @click="selectItem(item)" :key="index">
          <div class="icon">
            <img alt="" width="100" height="100" v-lazy="item.picUrl">
          </div>
          <ul class="songlist">
            <li class="song" v-for="(song, innerIndex) in item.songList" :key="innerIndex">
              <span>{{innerIndex + 1}}</span>
              <span>{{song.songname}}-{{song.singername}}</span>
            </li>
          </ul>
        </li>
      </ul>
      <div class="loading-container" v-show="!topList.length">
        <loading></loading>
      </div>
    </srcoll>
    <router-view></router-view>
  </div>
</template>

<script lang="ts">
import { Vue, Component, Mixins, Watch } from 'vue-property-decorator'
import Srcoll from '@/base/scroll/scroll.vue'
import Loading from '@/base/loading/loading.vue'
import * as types from '@/store/mutations-type'
import { PlaylistMixin } from '@/common/js/mixin'
import { Mutation } from 'vuex-class'
import { getTopList } from '@/api/rank'
import { ERR_OK } from '@/api/config'
import { TopListInterface } from '@/api/apiInterface'
import Song from '@/common/js/song'

@Component({
  components: {
    Srcoll,
    Loading,
  },
})
export default class Rank extends Mixins(PlaylistMixin) {
  @Mutation(types.SET_TOPLIST) public setTopList!: (list: Song) => void

  public topList: TopListInterface[] = []

  public $refs!: {
    rank: HTMLDivElement
    toplist: Srcoll,
  }

  public created() {
    this.getTopList()
  }

  public selectItem(item: Song) {
    this.$router.push({
      path: '/rank/' + item.id,
    })
    this.setTopList(item)
  }

  public handlePlaylist(playlist: Song[]) {
    const bottom = playlist.length ? '60px' : ''
    this.$refs.rank.style.bottom = bottom
    this.$refs.toplist.refresh()
  }

  private getTopList() {
    getTopList().then((rsp) => {
      if (rsp.code === ERR_OK) {
        this.topList = rsp.data.topList
      }
    })
  }
}
</script>

<style lang="stylus" rel="stylesheet/stylus" scoped>
  @import "~@/common/stylus/variable"
  @import "~@/common/stylus/mixin"

  .rank
    position fixed
    width 100%
    top 88px
    bottom 0
    .top-list
      height 100%
      overflow hidden
      .item
        display flex
        margin 0 20px
        padding-top 20px
        height 100px
        &.last-child
          padding-bottom 20px
        .icon
          flex 0 0 100px
          width 100px
          height 100px
        .songlist
          flex 1
          display flex
          flex-direction column
          justify-content center
          padding 0 20px
          height 100px
          overflow: hidden
          background: $color-highlight-background
          color: $color-text-d
          font-size: $font-size-small
          .song
            no-wrap()
            line-height: 26px
      .loading-container
        position: absolute
        width: 100%
        top: 50%
        transform: translateY(-50%)
</style>
