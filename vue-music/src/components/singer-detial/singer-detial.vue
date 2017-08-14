<template>
  <transition name="slider">
    <div class="singer-detial"></div>
  </transition>
</template>

<script type="text/ecmascript-6">
  import {mapGetters} from 'vuex'
  import {getSingerDetial} from "api/singer"
  export default{
    created(){
      this.getSingerDetial(this.singer.id)
    },
    methods: {
      getSingerDetial(id){
        getSingerDetial(id).then((rsp) => {
          //console.log(rsp);
        })
      }
    },
    computed: {
      ...mapGetters([
        'singer'
      ])
    }
  }
</script>

<style lang="stylus" rel="stylesheet/stylus" scoped>
  @import "~common/stylus/variable"

  .singer-detial
    position fixed
    z-index 100
    top 0
    bottom 0
    left 0
    right 0
    background $color-background

  .slider-enter-active, .slider-leave-active
    transition all 0.3s

  .slider-enter, .slider-leave
    transform translate3d(100%, 0, 0)
</style>
