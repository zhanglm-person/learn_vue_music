<template>
  <transition name="slider">
    <!--<div class="singer-detial"></div>-->
    <music-list :songs="songs" :bg-img="bgImage" :title="title"></music-list>
  </transition>
</template>

<script lang="ts">
import { Vue, Component, Mixins } from 'vue-property-decorator'
import { getSingerDetial } from '@/api/singer'
import { ERR_OK } from '@/api/config'
import { processSongsUrl, normalizeSongs } from '@/common/js/song'
import { Getter } from 'vuex-class'
import MusicList from '@/components/music-list/music-list.vue'
import Song from '@/common/js/song'
import Singer from '@/common/js/singer'

@Component({
  components: {
    MusicList,
  },
})
export default class SingerDetail extends Vue {
  @Getter public singer!: Singer

  public songs: Song[] = []

  get title() {
    return this.singer.name
  }

  get bgImage() {
    return this.singer.avatar
  }

  private created() {
    this.getDetail()
  }

  private getDetail() {
    if (!this.singer.id) {
      this.$router.push('/singer')
      return
    }
    getSingerDetial(this.singer.id).then((res) => {
      if (res.code === ERR_OK) {
        processSongsUrl(normalizeSongs(res.data.list)).then((songs) => {
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
