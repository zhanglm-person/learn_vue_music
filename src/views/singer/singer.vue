<template>
  <div class="singer" ref="singer">
    <list-view ref="listview" :data="singers" @select="selectSinger"></list-view>
    <!--在子组件需要拉去数据来获取内容的时候，一定不要使用keep-alive存入缓存，否则不会拉取数据-->
    <router-view></router-view>
  </div>
</template>

<script lang="ts">
import { Vue, Component, Mixins } from 'vue-property-decorator'
import { Mutation } from 'vuex-class'
import SingerClass from '@/common/js/singer'
import ListView from '@/base/listView/listView.vue'
import * as types from '@/store/mutations-type'
import Song from '@/common/js/song'
import { PlaylistMixin } from '@/common/js/mixin'
import { SingerInterface } from '@/api/apiInterface'
import { getSingerList } from '@/api/singer'
import { ERR_OK } from '@/api/config'

const HOT_NAME = '热门'
const HOT_SINGER_LENGTH = 10

@Component({
  components: {
    ListView,
  },
})
export default class Singer extends Mixins(PlaylistMixin) {
  public singers: SingerClass[] = []
  public $refs!: {
    singer: HTMLElement
    listview: ListView,
  }

  @Mutation(types.SET_SINGER) public setSinger!: (singer: SingerClass) => void

  public handlePlaylist(playlist: Song[]) {
    const bottom = playlist.length > 0 ? '60px' : ''
    this.$refs.singer.style.bottom = bottom
    this.$refs.listview.refresh()
  }

  public selectSinger(singer: SingerClass) {
    this.$router.push({
      path: `/singer/${singer.id}`,
    })
    this.setSinger(singer)
  }

  private created() {
    this.getSingerList()
  }

  private getSingerList() {
    getSingerList().then((rsp) => {
      if (rsp.code === ERR_OK) {
        this.singers = this.normallizeSinger(rsp.data.list)
      }
    })
  }

  private normallizeSinger(list: SingerInterface[]) {
    const map: any = {
      hot: {
        title: HOT_NAME,
        items: [],
      },
    }
    list.forEach((item, index) => {
      if (index < HOT_SINGER_LENGTH) {
        map.hot.items.push(new SingerClass(
          {
            id: item.Fsinger_mid,
            name: item.Fsinger_name,
          },
        ))
      }
      const key = item.Findex
      // 每一个歌手的Findex是她的首字母大写，如果map中没有当前首字母属性，就添加。有就直接push
      if (!map[key]) {
        map[key] = {
          title: key,
          items: [],
        }
      }
      map[key].items.push(new SingerClass({
        id: item.Fsinger_mid,
        name: item.Fsinger_name,
      }))
    })

    // 有序列表，处理map，map当前已经是含有所有歌手首字母对象的对象集合
    const hot = []
    const ret = []

    for (const key of Object.keys(map)) {
      const val = map[key]
      if (val.title.match(/[a-zA-Z]/)) { // 如果title是字母的话，推送到ret里面
        ret.push(val)
      } else if (val.title === HOT_NAME) { // 热门的单独分开
        hot.push(val)
      }
    }
    ret.sort((a, b) => {
      return a.title.charCodeAt(0) - b.title.charCodeAt(0)// 对于字母的数组，进行排序，是根据字母的编码值从小到大排序
    })
    return hot.concat(ret)// 返回热门加上ret字母数组
  }
}
</script>

<style lang="stylus" rel="stylesheet/stylus">
  .singer
    position fixed
    top 88px
    width 100%
    bottom 0
</style>
