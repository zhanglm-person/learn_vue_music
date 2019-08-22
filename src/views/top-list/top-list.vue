<template>
  <transition name="slider">
    <music-list :songs="songs" :title="title" :bg-img="bgImg" :rank="rank"></music-list>
  </transition>
</template>

<script lang="ts">
import { Vue, Component } from 'vue-property-decorator'
import { ERR_OK } from '@/api/config'
import { Getter } from 'vuex-class'
import { getMusicList } from '@/api/rank'
import { processSongsUrl, normalizeSongs } from '@/common/js/song'
import { TopListInterface } from '@/api/apiInterface'
import MusicList from '@/components/music-list/music-list.vue'
import Song from '@/common/js/song'

@Component({
  components: {
    MusicList,
  },
})
export default class TopList extends Vue {
  @Getter public toplist!: TopListInterface

  public songs: Song[] = []
  public rank: boolean = true

  get title() {
    return this.toplist ? this.toplist.topTitle : ''
  }

  get bgImg() {
    return this.songs.length ? this.songs[0].image : ''
  }

  private created() {
    this.getMusicList()
  }

  private getMusicList() {
    if (!this.toplist.id) {
      this.$router.push('/rank')
      return
    }
    getMusicList(this.toplist.id).then((rsp) => {
      if (rsp.code === ERR_OK) {
        processSongsUrl(normalizeSongs(rsp.songlist as any)).then((songs) => {
          this.songs = songs
        })
      }
    })
  }
}
</script>

<style lang="stylus" rel="stylesheet/stylus" scoped>

  .slider-enter-active, .slider-leave-active
    transition all 0.3s

  /*
  -leave-active
  和
  -leave-to
  基本效果是一样的
  */
  .slider-enter, .slider-leave-active
    transform translate3d(100%, 0, 0)
</style>
