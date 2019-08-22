<template>
  <div class="slider" ref="slider">
    <div class="slider-group" ref="sliderGroup">
      <slot>
      </slot>
    </div>
    <div class="dots">
      <span
        class="dot"
        :class="{active: currentPageIndex === index }"
        v-for="(item, index) in dots"
        :key="index" />
    </div>
  </div>
</template>

<script lang="ts">
import { Component, Vue, Prop } from 'vue-property-decorator'
import BScroll from 'better-scroll'
import { addClass } from '@/common/js/dom'

@Component({
  name: 'slider',
})
export default class Slider extends Vue {
  @Prop({ default: true, type: Boolean }) public readonly loop!: boolean
  @Prop({ default: true, type: Boolean }) public readonly autoPlay!: boolean
  @Prop({ default: 2000, type: Number }) public readonly interval!: number

  public dots: number[] = []
  public currentPageIndex: number = 0
  public timer!: number
  public resizeTimer!: number
  public slider!: BScroll
  public children!: [HTMLElement]

  public $refs!: {
    sliderGroup: HTMLElement
    slider: HTMLElement,
  }

  public mounted() {
    // 外部要确定获取到数据再进行此操作
    setTimeout(() => {
      this.setSliderWidth()
      this.initDots()
      this.initSlider()

      if (this.autoPlay) {
        this.play()
      }
    }, 20)
    window.addEventListener('resize', () => {
      if (!this.slider || !this.slider.enabled) {
        return
      }

      clearTimeout(this.resizeTimer)

      this.resizeTimer = setTimeout(() => {
        if (this.slider.isInTransition) {
          this.getCurrentPageIndex()
        } else {
          if (this.autoPlay) {
            this.play()
          }
        }
        this.refresh()
      }, 60)
    })
  }

  public refresh() {
    if (this.slider) {
      this.setSliderWidth(true)
      this.slider.refresh()
    }
  }

  public deactivated() {
    this.slider.disable()
    clearTimeout(this.timer)
  }

  public beforeDestroy() {
    this.slider.disable()
    clearTimeout(this.timer)
  }

  private setSliderWidth(isResize?: boolean) {
    // 获取slider的图片数量
    this.children = this.$refs.sliderGroup.children as any
    let width = 0
    // 每一个图片的宽度就是最外层视口容器的宽度
    const sliderWidth = this.$refs.slider.clientWidth
    for (const child of this.children) {
      addClass(child, 'slider-item')
      child.style.width = sliderWidth + 'px'
      width += sliderWidth
    }

    // 如果是循环播放，会复制2个子元素，保证循环正确性，所以要给父元素加上2个单位元素的宽度，但是如果是resize的时候，已经添加过了子元素就不能重复添加了。
    if (this.loop && !isResize) {
      width += 2 * sliderWidth
    }
    this.$refs.sliderGroup.style.width = width + 'px'
  }

  private initDots() {
    this.dots = new Array(this.children.length)
  }

  private initSlider() {
    this.slider = new BScroll(this.$refs.slider, {
      scrollX: true,
      scrollY: false,
      snap: {
        loop: this.loop,
        threshold: 0.3,
        speed: 400,
      },
      momentum: false, // 惯性
      // click: true
    })
    this.slider.on('scrollEnd', this.getCurrentPageIndex)
  }

  private getCurrentPageIndex() {
    // 获取到的当前轮播到第几个图片，getCurrentPage是BScroll的自带Api
    const pageIndex = this.slider.getCurrentPage().pageX
    // 设置currentPageIndex
    this.currentPageIndex = pageIndex
    if (this.autoPlay) {
      this.play()
    }
  }

  private play() {
    clearTimeout(this.timer)
    this.timer = setTimeout(() => {
      this.slider.next()
    }, this.interval)
  }
}
</script>

<style lang="stylus" rel="stylesheet/stylus">
  @import "~@/common/stylus/variable"

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
