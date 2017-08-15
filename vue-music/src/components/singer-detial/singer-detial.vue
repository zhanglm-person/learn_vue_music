<template>
  <transition name="slider">
    <!--<div class="singer-detial"></div>-->
    <music-list :song="song" :bg-img="bgImg" :title="title"></music-list>
  </transition>
</template>

<script type="text/ecmascript-6">
  import MusicList from 'components/music-list/music-list'
  import {mapGetters} from 'vuex'
  import {getSingerDetial} from "api/singer"
  import {ERR_OK} from 'api/config'
  import {createSong} from 'common/js/song'

  export default{
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
        //if (this.singer) {
          return this.singer.name
        //}
      },
      bgImg(){
        //if (this.singer) {
          return this.singer.avatar
        //}
      },
      ...mapGetters([
        'singer'
      ])
    },
    created(){
      this._getDetial();
    },
    methods: {
      _getDetial(){
        if (!this.singer) {           //原码是 !this.singer.id
          this.$router.push('/singer');
          return;
        }
        getSingerDetial(this.singer.id).then((rsp) => {
          //console.log(rsp)
          if (rsp.code === ERR_OK) {
            this.song = this._normallizeSong(rsp.data.list)
          }
        })
      },
      _normallizeSong(list){
        let ret = [];
        list.forEach((item) => {
          //使用ES6：let {musicData} = item;
          let musicData = item.musicData
          if (musicData.songid && musicData.albummid) {
            ret.push(createSong(musicData))
          }
        });
        return ret;
      }
    }
  }
</script>

<style lang="stylus" rel="stylesheet/stylus" scoped>
  @import "~common/stylus/variable"

  /*.singer-detial
    position fixed
    z-index 100
    top 0
    bottom 0
    left 0
    right 0
    background $color-background*/

  .slider-enter-active, .slider-leave-active
    transition all 0.3s

  .slider-enter, .slider-leave
    transform translate3d(100%, 0, 0)
</style>
