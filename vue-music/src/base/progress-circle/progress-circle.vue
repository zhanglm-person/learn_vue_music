<template>
  <div class="progress-circle">
    <!--
      svg width和height是需要规定的尺寸大小。viewBox是给内部的区域定义视口的显示分辨尺寸
    -->
    <svg :width="radius" :height="radius" viewBox="0 0 100 100" version="1.1" xmlns="http://www.w3.org/2000/svg">
      <!--
        circle： r是半径，cx，cy圆心位置,都是根据svg的视口来做位置定位的。 fill是填充颜色
              stroke-dasharray圆的周长; stroke-dashoffset
      -->
      <circle class="progress-background" r="50" cx="50" cy="50" fill="transparent"/>
      <circle class="progress-bar" r="50" cx="50" cy="50" fill="transparent" :stroke-dasharray="dashArray" :stroke-dashoffset="dashOffset"/>
    </svg>
    <slot></slot>
  </div>
</template>

<script type="text/ecmascript-6">
  export default{
    props:{
      radius:{
        type:Number,
        default:100
      },
      percent:{
        type:Number,
        default:0
      }
    },
    data() {
      return {
        dashArray: Math.PI * 100  // dashArray 表示周长
      }
    },
    computed: {
      dashOffset() {
        // 偏移量满周长的话 是没有显示外层的圆的 就是没有进度！
        return (1 - this.percent) * this.dashArray  // 当前圆周上的的偏移量
      }
    }
  }
</script>

<style lang="stylus" rel="stylesheet/stylus">
  @import "~common/stylus/variable"

  .progress-circle
    position: relative
    circle
      stroke-width: 8px
      transform-origin: center
      &.progress-background
        transform: scale(0.9)
        stroke: $color-theme-d
      &.progress-bar
        transform: scale(0.9) rotate(-90deg)
        stroke: $color-theme
</style>
