<template>
  <div class="slider" ref="slider">
    <div class="slider-group" ref="sliderGroup">
      <slot>
      </slot>
    </div>
    <div class="dots">
      <span class="dot" :class="{active: currentPageIndex === index }" v-for="(item, index) in dots"
            :key="index"></span>
    </div>
  </div>
</template>

<script type="text/ecmascript-6">
  import BScroll from 'better-scroll'
  import {addClass} from 'common/js/dom'

  export default {
    name: "slider",
    props: {
      loop: {
        type: Boolean,
        default: true
      },
      autoPlay: {
        type: Boolean,
        default: true
      },
      interval: {
        type: Number,
        default: 2000
      }
    },
    data() {
      return {
        dots: [],
        currentPageIndex: 0
      }
    },
    mounted() {
      // 外部要确定获取到数据再进行此操作
      // 不用this.$nextTick(),因为浏览器的刷新时间是17ms
      setTimeout(() => {
        this._setSliderWidth();
        this._initDots();
        this._initSlider();

        if (this.autoPlay) {
          this._play();
        }
      }, 20);
      window.addEventListener("resize", () => {
        if (!this.slider) {
          return;
        }
        this._setSliderWidth(true); // 如果是resize，就不能再次设置宽度的时候加上2个子元素的宽
        this.slider.refresh();
      })
    },
    methods: {
      _setSliderWidth(isResize) {
        // 获取slider的图片数量
        this.children = this.$refs.sliderGroup.children;
        let width = 0;
        // 每一个图片的宽度就是最外层视口容器的宽度
        let sliderWidth = this.$refs.slider.clientWidth;
        for (let i = 0; i < this.children.length; i++) {
          let child = this.children[i];

          addClass(child, "slider-item");
          child.style.width = sliderWidth + "px";
          width += sliderWidth;
        }
        // 如果是循环播放，会复制2个子元素，保证循环正确性，所以要给父元素加上2个单位元素的宽度，但是如果是resize的时候，已经添加过了子元素就不能重复添加了。
        if (this.loop && !isResize) {
          width += 2 * sliderWidth;
        }
        this.$refs.sliderGroup.style.width = width + "px"
      },
      _initDots() {
        this.dots = new Array(this.children.length);
      },
      _initSlider() {
        this.slider = new BScroll(this.$refs.slider, {
          scrollX: true,
          scrollY: false,
          snap: true,
          snapLoop: this.loop,
          snapThreshold: 0.3,
          snapSpeed: 400,
          momentum: false,  // 惯性
          // click: true
        });

        this.slider.on('scrollEnd', () => {
          // 获取到的当前轮播到第几个图片，getCurrentPage是BScroll的自带Api
          let pagaIndex = this.slider.getCurrentPage().pageX;
          // 如果是循环播放，复制到第一个的元素会导致加一，所以要减一
          if (this.loop) {
            pagaIndex -= 1
          }
          // 设置currentPageIndex
          this.currentPageIndex = pagaIndex;
          // setTimeout 只执行一次，每次结束的之后要再次执行_play方法，但是要清除之前的定时器
          if (this.autoPlay) {
            clearTimeout(this.timer);
            this._play();
          }
        })
      },
      _play() {
        let pageIndex = this.currentPageIndex + 1;
        // 寻求下一张，所以要加一
        if (this.loop) {
          pageIndex += 1
        }
        this.timer = setTimeout(() => {
          // goToPage是BScroll的自带Api
          this.slider.goToPage(pageIndex, 0, 400)
        }, this.interval)
      }
    },
    destroyed() {
      //切换路由最后会执行销毁hook，清理计时器，防止占用内存
      clearTimeout(this.timer);
    }
  }
</script>

<style lang="stylus" rel="stylesheet/stylus">
  @import "~common/stylus/variable"

  .slider
    min-height: 1px
    position relative
    .slider-group
      position: relative
      overflow: hidden
      white-space: nowrap
      .slider-item
        float: left
        box-sizing: border-box
        overflow: hidden
        text-align: center
        a
          display: block
          width: 100%
          overflow: hidden
          text-decoration: none
          img
            display: block
            width: 100%
    .dots
      position: absolute
      right: 0
      left: 0
      bottom: 12px
      text-align: center
      font-size: 0
      .dot
        display: inline-block
        margin: 0 4px
        width: 8px
        height: 8px
        border-radius: 50%
        background: $color-text-l
        &.active
          width: 20px
          border-radius: 5px
          background: $color-text-ll
</style>







