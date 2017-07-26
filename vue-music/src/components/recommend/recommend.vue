<template>
  <div class="recommend">
    <div v-if="recommends.length" class="silder-wrapper" ref="silderWrapper">
      <slider>
        <div class="" v-for="(item,index) in recommends">
          <a :href="item.linkUrl">
            <img :src="item.picUrl" alt="">
          </a>
        </div>
      </slider>
    </div>
    <div class="recommend-list">
      <h1 class="list-title">热门歌单推荐</h1>
    </div>
  </div>
</template>

<script type="text/ecmascript-6">
  import slider from 'base/slider/slider'

  import {getRecommend, getDiscList} from 'api/recommend'
  import {ERR_OK} from 'api/config'
  export default{
    components: {
      slider
    },
    data(){
      return {
        recommends: []
      }
    },
    created(){
      this._getRecommend();
      this._getDiscList();
    },
    methods: {
      _getRecommend(){
        getRecommend().then((rsp) => {
          if (rsp.code === ERR_OK) {
            //console.log(rsp.data.slider);
            this.recommends = rsp.data.slider;
          }
        })
      },
      _getDiscList(){
        getDiscList().then((rsp) => {
          if (rsp.code === ERR_OK) {
            console.log(rsp.data.list)
          }
        })
      }
    }
  }
</script>

<style lang="stylus" rel="stylesheet/stylus">
  @import "~common/stylus/variable"
  .recommend
    position: fixed
    width: 100%
    top: 88px
    bottom: 0
    .slider-wrapper
      position: relative
      width: 100%
      overflow: hidden
    .recommend-list
      .list-title
        height: 65px
        line-height: 65px
        text-align: center
        font-size: $font-size-medium
        color: $color-theme
</style>
