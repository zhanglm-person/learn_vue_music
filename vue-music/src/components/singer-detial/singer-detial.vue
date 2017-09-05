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
          this.$router.push('/singer');
          return
        }
        getSingerDetial(this.singer.id).then((res) => {
          if (res.code === ERR_OK) {
            // 在歌手详情页面得到的songs列表，要传入两层到song-list组件遍历。
            this.songs = this._normalizeSongs(res.data.list)
            // console.log(this.songs)
          }
        })
      },
      _normalizeSongs(list) {
        let ret = [];
        list.forEach((item) => {
          //let {musicData} = item          es6 对象结构赋值
          let musicData = item.musicData;
          if (musicData.songid && musicData.albummid) {
            //根据工厂方法 创建一个song,只有是Song的事例才可以点击播放，并且添加到vuex管理
            ret.push(createSong(musicData))
          }
        });
        return ret
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
