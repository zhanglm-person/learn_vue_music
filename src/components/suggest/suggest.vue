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

<script type="text/ecmascript-6">
import Scroll from 'base/scroll/scroll'
import Loading from 'base/loading/loading'
import NoResult from 'base/no-result/no-result'
import { search } from 'api/search'
import { ERR_OK } from 'api/config'
import { mapMutations, mapActions } from 'vuex'
import { processSongsUrl, normalizeSongs } from 'common/js/song'
import Singer from 'common/js/singer'

const TYPE_SINGER = 'singer'
const PER_PAGE = 20

export default {
  components: {
    Scroll,
    Loading,
    NoResult
  },
  props: {
    query: {
      type: String,
      default: ''
    },
    showSinger: {
      type: Boolean,
      default: true
    }
  },
  data () {
    return {
      page: 1,
      result: [],
      pullup: true,
      hasMore: true,
      beforeScroll: true
    }
  },
  methods: {
    listScroll () {
      // 子组件scroll提供一个滚动中的事件，再有当前组件提交给search父组件。search父组件再调用search-box的input输入框的失焦事件，达到滚动就取消键盘显示的效果。
      this.$emit('listScroll')
    },
    _search () {
      // 检索词更改的时候 要重置部分样式控制参数
      this.page = 1
      this.hasMore = true
      this.$refs.suggest.scrollTo(0, 0)
      search(this.query, this.page, this.showSinger, PER_PAGE).then((rsp) => {
        if (rsp.code === ERR_OK) {
          this._genResult(rsp.data, this.page).then(result => {
            this.result = result
            this.hasMore = this._checkMore(rsp.data)
          })
        }
      })
    },
    searchMore () {
      // 上拉到某一个位置的时候，进行上拉加载。由子组件scroll组件提供触发条件
      // 搜索更多的时候，如果已判断出没有更多了，就不在发送请求；否则的话，发送请求，并在已有结果上concat新的结果
      if (!this.hasMore) {
        return
      }
      this.page++
      search(this.query, this.page, this.showSinger, PER_PAGE).then((rsp) => {
        if (rsp.code === ERR_OK) {
          this._genResult(rsp.data, this.page).then(result => {
            this.result = this.result.concat(result)
            this.hasMore = this._checkMore(rsp.data)
          })
        }
      })
    },
    selectItem (item) {
      // 如果点击的是歌手，跳转到歌手详情页（路由跳转） 并且更改vuex管理的数据
      if (item.type === TYPE_SINGER) {
        const singer = new Singer({
          id: item.singermid,
          name: item.singername
        })
        this.$router.push({
          path: '/search/' + singer.id
        })
        this.setSinger(singer)
      } else {
        // 如果点击的是歌曲，要操作vuex把当前点击歌曲添加到playlist里面，并且播放当前歌曲，即插入当前歌曲到currentIndex的位置
        this.insertSong(item)
      }
      // 向父组件提交选择事件，以便父组件保存搜索历史内容
      this.$emit('select')
    },
    getIconCls (item) {
      // 搜索列表的前面的icon 不同类型显示不同icon
      if (item.type === TYPE_SINGER) {
        return 'icon-mine'
      } else {
        return 'icon-music'
      }
    },
    getDisplayName (item) {
      // 根据当前结果的每一条，判断是歌手还是歌曲
      if (item.type === TYPE_SINGER) {
        return item.singername
      } else {
        return item.name + '-' + item.singer
      }
    },
    _genResult (data, page) {
      // 把得到的结果 歌手放前面，歌曲放后面
      let ret = []
      if (data.zhida && data.zhida.singerid && page === 1) {
        ret.push({ ...data.zhida, ...{ type: TYPE_SINGER } })
      }
      // 如果有歌曲，就根据歌曲的类创建歌曲，concat到之前的歌手后面
      return processSongsUrl(normalizeSongs(data.song.list)).then(songs => {
        ret = ret.concat(songs)
        return ret
      })
    },
    _checkMore (data) {
      // 根据歌曲类->创建歌曲列表
      const song = data.song
      if (
        !song.list.length ||
        song.curnum + song.curpage * PER_PAGE >= song.totalnum
      ) {
        return false
      }
      return true
    },
    refresh () {
      // 子组件内部的scroll刷新，提供给父组件使用
      this.$refs.suggest.refresh()
    },
    ...mapMutations({
      setSinger: 'SET_SINGER'
    }),
    ...mapActions([
      'insertSong'
    ])
  },
  watch: {
    query (newQuery) {
      this._search()
    }
  }
}
</script>

<style lang="stylus" rel="stylesheet/stylus" scoped>
  @import "~common/stylus/variable"
  @import "~common/stylus/mixin"
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
