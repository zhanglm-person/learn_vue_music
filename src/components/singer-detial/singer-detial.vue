<template>
  <transition name="slider">
    <!--<div class="singer-detial"></div>-->
    <music-list :songs="songs" :bg-img="bgImage" :title="title"></music-list>
  </transition>
</template>

<script type="text/ecmascript-6">

import MusicList from 'components/music-list/music-list'
import { getSingerDetial } from 'api/singer'
import { ERR_OK } from 'api/config'
import { processSongsUrl, normalizeSongs } from 'common/js/song'
import { mapGetters } from 'vuex'

export default {
  computed: {
    title () {
      return this.singer.name
    },
    bgImage () {
      return this.singer.avatar
    },
    ...mapGetters([
      'singer'
    ])
  },
  data () {
    return {
      songs: []
    }
  },
  created () {
    this._getDetail()
  },
  methods: {
    _getDetail () {
      if (!this.singer.id) {
        this.$router.push('/singer')
        return
      }
      getSingerDetial(this.singer.id).then((res) => {
        if (res.code === ERR_OK) {
          processSongsUrl(normalizeSongs(res.data.list)).then(songs => {
            this.songs = songs
          })
        }
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
