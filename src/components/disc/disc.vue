<template>
  <transition name="slider">
    <music-list :songs="songs" :bg-img="bgImg" :title="title"></music-list>
  </transition>
</template>

<script type='text/ecmascript-6'>
import MusicList from 'components/music-list/music-list'
import { mapGetters } from 'vuex'
import { getSongList } from 'api/recommend'
import { ERR_OK } from 'api/config'
import { processSongsUrl, normalizeSongs } from 'common/js/song'
export default {
  computed: {
    title () {
      return this.disc.dissname
    },
    bgImg () {
      return this.disc.imgurl
    },
    ...mapGetters([
      'disc'
    ])
  },
  data () {
    return {
      songs: []
    }
  },
  created () {
    this._getSongList()
  },
  methods: {
    _getSongList () {
      if (!this.disc.dissid) {
        this.$router.push('/recommend')
        return
      }
      getSongList(this.disc.dissid).then((rsp) => {
        if (rsp.code === ERR_OK) {
          processSongsUrl(normalizeSongs(rsp.cdlist[0].songlist)).then(
            songs => {
              this.songs = songs
            }
          )
        }
      }).catch((e) => {
        console.log(e)
      })
    }
  },
  components: {
    MusicList
  }
}
</script>

<style lang="stylus" rel="stylesheet/stylus" scoped>
  .slider-enter-active, .slider-leave-active
    transition 0.3s all

  .slider-leave-to, .slider-enter
    transform translate3d(100%, 0, 0)
</style>
