<template>
  <transition name="slider">
    <!--<div class="singer-detial"></div>-->
    <music-list :songs="songs" :bg-img="bgImage" :title="title"></music-list>
  </transition>
</template>

<script type="text/ecmascript-6">

  import MusicList from 'components/music-list/music-list'
  import {getSingerDetial} from 'api/singer'
  import {ERR_OK} from 'api/config'
  import {createSong} from 'common/js/song'
  import {mapGetters} from 'vuex'
  export default {
    computed: {
      title() {
        return this.singer.name
      },
      bgImage() {
        return this.singer.avatar
      },
      ...mapGetters([
        'singer'
      ])
    },
    data() {
      return {
        songs: []
      }
    },
    created() {
      this._getDetail()
    },
    methods: {
      _getDetail() {
        if (!this.singer.id) {
          this.$router.push('/singer')
          return
        }
        getSingerDetial(this.singer.id).then((res) => {
          if (res.code === ERR_OK) {
            this.songs = this._normalizeSongs(res.data.list)
          }
        })
      },
      _normalizeSongs(list) {
        let ret = []
        list.forEach((item) => {
          let {musicData} = item
          if (musicData.songid && musicData.albummid) {
            ret.push(createSong(musicData))
          }
        })
        return ret
      }
    },
    components: {
      MusicList
    }
  }
  /*export default{
    data(){
      return {
        song: []
      }
    },
    components: {
      MusicList
    },
    computed: {
      title(){
        return this.singer.name
      },
      bgImg(){
        return this.singer.avatar
      },
      ...mapGetters([
        'singer'
      ])
    },
    created() {
        console.log(12132)
      this._getDetail()
    },
    methods: {
      _getDetail() {
        if (!this.singer.id) {
          this.$router.push('/singer')
          return
        }
        getSingerDetial(this.singer.id).then((res) => {
          if (res.code === ERR_OK) {
            this.song = this._normallizeSong(res.data.list)
          }
        })
      },
      _normallizeSong(list){
        let ret = [];
        list.forEach((item) => {
          //使用ES6：
          let {musicData} = item;
          //let musicData = item.musicData
          if (musicData.songid && musicData.albummid) {
            ret.push(createSong(musicData))
          }
        });
        return ret;
      }
    }
  }*/
</script>

<style lang="stylus" rel="stylesheet/stylus" scoped>

  .slider-enter-active, .slider-leave-active
    transition all 0.3s

  .slider-enter, .slider-leave-active
    transform translate3d(100%, 0, 0)
</style>
