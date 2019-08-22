<template>
  <transition name="slider">
    <music-list :songs="songs" :bg-img="bgImg" :title="title"></music-list>
  </transition>
</template>

<script lang="ts">
import { Vue, Component } from 'vue-property-decorator'
import { Getter } from 'vuex-class'
import { getSongList } from '@/api/recommend'
import { ERR_OK } from '@/api/config'
import { processSongsUrl, normalizeSongs } from '@/common/js/song'
import { DiscInterface } from '@/api/apiInterface'
import Song from '@/common/js/song'
import MusicList from '@/components/music-list/music-list.vue'

@Component({
  components: {
    MusicList,
  },
})
export default class Disc extends Vue {
  @Getter public disc!: DiscInterface

  public songs: Song[] = []

  get title(): string {
    return this.disc.dissname
  }

  get bgImg(): string {
    return this.disc.imgurl
  }

  private created() {
    this.getSongList()
  }

  private getSongList() {
    if (!this.disc.dissid) {
      this.$router.push('/recommend')
      return
    }
    getSongList(this.disc.dissid).then((rsp) => {
      if (rsp.code === ERR_OK) {
        processSongsUrl(normalizeSongs(rsp.cdlist[0].songlist)).then(
          (songs) => {
            this.songs = songs
          },
        )
      }
    }).catch((e) => {
      // @ts-ignore
      console.log(e)
    })
  }
}
</script>

<style lang="stylus" rel="stylesheet/stylus" scoped>
  .slider-enter-active, .slider-leave-active
    transition 0.3s all

  .slider-leave-to, .slider-enter
    transform translate3d(100%, 0, 0)
</style>
