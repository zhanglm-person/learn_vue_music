<template>
  <transition name="slider">
    <music-list :songs="songs" :title="title" :bg-img="bgImg" :rank="rank"></music-list>
  </transition>
</template>

<script type="text/ecmascript-6">

  import MusicList from 'components/music-list/music-list'
  import {ERR_OK} from 'api/config'
  import {mapGetters} from 'vuex'
  import {getMusicList} from 'api/rank'
  import {createSong} from 'common/js/song'

  export default {
    data() {
      return {
        songs: [],
        rank: true
      }
    },
    components: {
      MusicList
    },
    computed: {
      title() {
        return this.toplist ? this.toplist.topTitle : ""
      },
      bgImg() {
        return this.songs.length ? this.songs[0].image : ''
      },
      ...mapGetters([
        'toplist'
      ])
    },
    created() {
      this._getMusicList();
    },
    methods: {
      _getMusicList() {
        if (!this.toplist.id) {
          this.$router.push('/rank');
          return
        }
        getMusicList(this.toplist.id).then((rsp) => {
          if (rsp.code === ERR_OK) {
            // console.log(rsp);
            this.songs = this._normalizeSongs(rsp.songlist);
          }
        })
      },
      _normalizeSongs(list) {
        let ret = [];
        list.forEach((item) => {
          const musicData = item.data;
          if (musicData.songid && musicData.albumid) {
            ret.push(createSong(musicData));
          }
        });
        return ret;
      }
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
