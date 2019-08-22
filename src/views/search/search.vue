<template>
  <div class="search">
    <div class="search-box-wrapper">
      <search-box ref="searchBox" @query="onQueryChange"></search-box>
    </div>
    <div ref="shortcutWrapper" class="shortcut-wrapper" v-show="!query">
      <scroll :refreshDelay='refreshDelay' class="shortcut" :data="shortcut" ref="shortcut">
        <div>
          <div class="hot-key">
            <h1 class="title">热门搜索</h1>
            <ul>
              <li @click="addQuery(item.k)" class="item" :key="index" v-for="(item, index) in hotKey">
                <span>{{item.k}}</span>
              </li>
            </ul>
          </div>
          <div class="search-history" v-show="searchHistory.length">
            <h1 class="title">
              <span class="text">搜索历史</span>
              <span class="clear" @click="deleteAll">
              <i class="icon-clear"></i>
            </span>
            </h1>
            <search-list :searches="searchHistory"
                         @select="addQuery"
                         @delete="deleteSearchHistory"
            ></search-list>
          </div>
        </div>
      </scroll>
    </div>
    <div ref="searchResult" class="search-result" v-show="query">
      <suggest ref="suggest" :query="query" @listScroll="blurInput" @select="saveSearch"></suggest>
    </div>

    <confirm
      ref="confirm"
      text="确定要删除所有搜索历史？"
      @confirm="clearSearchHistory"
    ></confirm>
    <router-view></router-view>
  </div>
</template>

<script lang="ts">
import { Mixins, Component, Watch } from 'vue-property-decorator'
import { Action } from 'vuex-class'
import Scroll from '@/base/scroll/scroll.vue'
import SearchBox from '@/base/search-box/search-box.vue'
import Suggest from '@/components/suggest/suggest.vue'
import SearchList from '@/base/search-list/search-list.vue'
import Confirm from '@/base/confirm/confirm.vue'
import { getHotKey } from '@/api/search'
import { ERR_OK } from '@/api/config'
import { HotKeyInterface } from '@/api/apiInterface'
import { PlaylistMixin, SearchMixin } from '@/common/js/mixin'
import Song from '@/common/js/song'

@Component({
  components: {
    SearchBox,
    Suggest,
    SearchList,
    Confirm,
    Scroll,
  },
})
export default class Search extends Mixins(PlaylistMixin, SearchMixin) {
  public hotKey: Array<HotKeyInterface | string> = []

  public $refs!: {
    confirm: Confirm
    suggest: Suggest
    shortcut: Scroll
    searchResult: HTMLElement
    shortcutWrapper: HTMLElement,
  }

  @Action public clearSearchHistory!: () => void

  @Watch('query')
  public onQueryStringChange(newQuery: string) {
    if (!newQuery) {
      setTimeout(() => {
        this.$refs.shortcut.refresh()
      }, 20)
    }
  }

  get shortcut() {
    return this.hotKey.concat(this.searchHistory)
  }

  public handlePlaylist(playlist: Song[]) {
    const bottom = playlist.length > 0 ? '60px' : ''
    this.$refs.searchResult.style.bottom = bottom
    this.$refs.shortcutWrapper.style.bottom = bottom
    this.$refs.suggest.refresh()
    this.$refs.shortcut.refresh()
  }

  public deleteAll() {
    this.$refs.confirm.show()
  }

  private created() {
    this.getHotKey()
  }

  private getHotKey() {
    getHotKey().then((rsp) => {
      if (rsp.code === ERR_OK) {
        this.hotKey = rsp.data.hotkey.slice(0, 10)
      }
    })
  }
}
</script>

<style lang="stylus" rel="stylesheet/stylus">
  @import "~@/common/stylus/variable"
  @import "~@/common/stylus/mixin"

  .search
    .search-box-wrapper
      margin: 20px
    .shortcut-wrapper
      position: fixed
      top: 178px
      bottom: 0
      width: 100%
      .shortcut
        height: 100%
        overflow: hidden
        .hot-key
          margin: 0 20px 20px 20px
          .title
            margin-bottom: 20px
            font-size: $font-size-medium
            color: $color-text-l
          .item
            display: inline-block
            padding: 5px 10px
            margin: 0 20px 10px 0
            border-radius: 6px
            background: $color-highlight-background
            font-size: $font-size-medium
            color: $color-text-d
        .search-history
          position: relative
          margin: 0 20px
          .title
            display: flex
            align-items: center
            height: 40px
            font-size: $font-size-medium
            color: $color-text-l
            .text
              flex: 1
            .clear
              extend-click()
              .icon-clear
                font-size: $font-size-medium
                color: $color-text-d
    .search-result
      position: fixed
      width: 100%
      top: 178px
      bottom: 0
</style>
