<template>
  <scroll
    class="suggest"
    :pullup="pullup"
    :data="result"
    @scrollToEnd="searchMore"
    :beforeScroll="beforeScroll"
    @beforeScroll="listScroll"
    ref="suggest"
  >
    <ul class="suggest-list">
      <li
        class="suggest-item"
        v-for="(item, index) in result"
        :key="index"
        @click="selectItem(item)"
      >
        <div class="icon">
          <i :class="getIconCls(item)"></i>
        </div>
        <div class="name">
          <p class="text" v-html="getDisplayName(item)"></p>
        </div>
      </li>
      <loading title="" v-show="hasMore"></loading>
    </ul>
    <div class="no-result-wrapper" v-show="!hasMore&&!result.length">
      <no-result title="抱歉，没有结果"></no-result>
    </div>
  </scroll>
</template>

<script lang="ts">
import { Component, Prop, Vue, Emit, Watch } from 'vue-property-decorator'
import Scroll from '@/base/scroll/scroll.vue'
import Loading from '@/base/loading/loading.vue'
import NoResult from '@/base/no-result/no-result.vue'
import { search } from '@/api/search'
import { ERR_OK } from '@/api/config'
import { SingerZhida, SearchResponse } from '@/api/apiInterface'
import { mapMutations, mapActions } from 'vuex'
import Song, { processSongsUrl, normalizeSongs } from '@/common/js/song'
import Singer from '@/common/js/singer'
import { Mutation, Action } from 'vuex-class'
import * as types from '@/store/mutations-type'
import { debounce } from '@/common/js/util'

const TYPE_SINGER = 'singer'
const PER_PAGE = 20

@Component({
  components: {
    Scroll,
    Loading,
    NoResult,
  },
})
export default class Suggest extends Vue {
  @Prop({ default: '', type: String }) public query!: string
  @Prop({ default: true, type: Boolean }) public showSinger!: boolean

  public page: number = 1
  public result: Array<Song | SingerZhida> = []
  public pullup: boolean = true
  public hasMore: boolean = true
  public beforeScroll: boolean = true
  public $refs!: {
    suggest: Scroll,
  }

  // 防抖搜索在emit query的地方挪到发请求的地方，通过 debounce 创建一个防抖函数调用
  public debounceSearch: () => void = debounce(() => { this.search() }, 500)

  @Mutation(types.SET_SINGER) public setSinger!: (singer: Singer) => void
  @Action public insertSong!: (song: Song) => void

  @Emit()
  public listScroll() {
    // 子组件scroll提供一个滚动中的事件，再有当前组件提交给search父组件。search父组件再调用search-box的input输入框的失焦事件，达到滚动就取消键盘显示的效果。
    // this.$emit('listScroll')
  }

  public searchMore() {
    // 上拉到某一个位置的时候，进行上拉加载。由子组件scroll组件提供触发条件
    // 搜索更多的时候，如果已判断出没有更多了，就不在发送请求；否则的话，发送请求，并在已有结果上concat新的结果
    if (!this.hasMore) {
      return
    }
    this.page++
    search(this.query, this.page, this.showSinger, PER_PAGE).then((rsp) => {
      if (rsp.code === ERR_OK) {
        this.genResult(rsp, this.page).then((result) => {
          this.result = this.result.concat(result)
          this.hasMore = this.checkMore(rsp)
        })
      }
    })
  }

  @Emit('select') // 向父组件提交选择事件，以便父组件保存搜索历史内容
  public selectItem(item: SingerZhida) {
    // 如果点击的是歌手，跳转到歌手详情页（路由跳转） 并且更改vuex管理的数据
    if (item.type === TYPE_SINGER) {
      const singer = new Singer({
        id: item.singermid,
        name: item.singername,
      })
      this.$router.push({path: '/search/' + singer.id})
      this.setSinger(singer)
    } else {
      // 如果点击的是歌曲，要操作vuex把当前点击歌曲添加到playlist里面，并且播放当前歌曲，即插入当前歌曲到currentIndex的位置
      // @ts-ignore
      this.insertSong(item)
    }
  }

  public getIconCls(item: SingerZhida): string {
    // 搜索列表的前面的icon 不同类型显示不同icon
    if (item.type === TYPE_SINGER) {
      return 'icon-mine'
    } else {
      return 'icon-music'
    }
  }

  public getDisplayName(item: SingerZhida): string {
    // 根据当前结果的每一条，判断是歌手还是歌曲
    if (item.type === TYPE_SINGER) {
      return item.singername
    } else {
      return item.name + '-' + item.singer
    }
  }

  public refresh(): void {
    // 子组件内部的scroll刷新，提供给父组件使用
    this.$refs.suggest.refresh()
  }

  @Watch('query')
  public onQueryChange(newQuery: string) {
    if (!newQuery) {
      return
    }
    this.debounceSearch()
  }

  private search(): void {
    // 检索词更改的时候 要重置部分样式控制参数
    this.page = 1
    this.hasMore = true
    this.$refs.suggest.scrollTo(0, 0)
    search(this.query, this.page, this.showSinger, PER_PAGE).then((rsp) => {
      if (rsp.code === ERR_OK) {
        this.genResult(rsp, this.page).then((result) => {
          this.result = result
          this.hasMore = this.checkMore(rsp)
        })
      }
    })
  }

  private genResult(res: SearchResponse, page: number) {
    // 把得到的结果 歌手放前面，歌曲放后面
    let ret: Array<SingerZhida | Song> = []
    if (res.data.zhida
      && res.data.zhida.singerid
      && page === 1
    ) {
      ret.push({ ...res.data.zhida, ...{ type: TYPE_SINGER } })
    }
    // 如果有歌曲，就根据歌曲的类创建歌曲，concat到之前的歌手后面
    return processSongsUrl(normalizeSongs(res.data.song.list)).then((songs) => {
      ret = ret.concat(songs)
      return ret
    })
  }

  private checkMore(res: SearchResponse): boolean {
    // 根据歌曲类->创建歌曲列表
    const song = res.data.song
    if (
      !song.list.length ||
      song.curnum + song.curpage * PER_PAGE >= song.totalnum
    ) {
      return false
    }
    return true
  }
}
</script>

<style lang="stylus" rel="stylesheet/stylus" scoped>
  @import "~@/common/stylus/variable"
  @import "~@/common/stylus/mixin"
  .suggest
    height: 100%
    overflow: hidden
    .suggest-list
      padding: 0 30px
      .suggest-item
        display: flex
        align-items: center
        padding-bottom: 20px
      .icon
        flex: 0 0 30px
        width: 30px
        [class^="icon-"]
          font-size: 14px
          color: $color-text-d
      .name
        flex: 1
        font-size: $font-size-medium
        color: $color-text-d
        overflow: hidden
        .text
          no-wrap()
    .no-result-wrapper
      position: absolute
      width: 100%
      top: 50%
      transform: translateY(-50%)
</style>
