<template>
  <div ref="wrapper">
    <slot></slot>
  </div>
</template>

<script lang="ts">
import { Vue, Component, Prop, Watch } from 'vue-property-decorator'
import BScroll from 'better-scroll'

@Component({})
export default class Scroll extends Vue {
  @Prop({ default: 1 }) public probeType!: number
  @Prop({ default: true }) public click!: boolean
  @Prop({ default: null }) public data!: object
  @Prop({ default: false }) public listenScroll!: boolean
  @Prop({ default: false }) public pullup!: boolean
  @Prop({ default: false }) public beforeScroll!: boolean
  @Prop({ default: 20 }) public refreshDelay!: number

  public scroll!: BScroll

  public $refs!: {
    wrapper: HTMLElement,
  }

  public mounted() {
    setTimeout(() => {
      this.initScroll()
    }, 20)
  }
  public disable() {
    if (this.scroll) {
      this.scroll.disable()
    }
  }
  public enable() {
    if (this.scroll) {
      this.scroll.enable()
    }
  }
  public refresh() {
    if (this.scroll) {
      this.scroll.refresh()
    }
  }
  public scrollTo(...args: any) { // 因为要接受参数，就把this指向换到当前scroll，并传入参数
    if (this.scroll) {
      this.scroll.scrollTo.apply(this.scroll, args)
    }
  }
  public scrollToElement(...args: any) { // 因为要接受参数，就把this指向换到当前scroll，并传入参数
    if (this.scroll) {
      this.scroll.scrollToElement.apply(this.scroll, args)
    }
  }

  @Watch('data')
  public onDataChange() {
    setTimeout(() => {
      this.refresh()
    }, this.refreshDelay)
  }

  private initScroll() {
    if (!this.$refs.wrapper) {
      return
    }
    this.scroll = new BScroll(this.$refs.wrapper, {
      probeType: this.probeType,
      click: this.click,
    })
    if (this.listenScroll) { // 如果需要监听滚动距离事件，则向父组件响应scroll事件
      const me = this
      this.scroll.on('scroll', (pos) => {
        me.$emit('scroll', pos)
      })
    }
    if (this.pullup) { // 如果需要上拉加载，则在滚动到最大距离加50px的时候向父组件提交一个scrollToEnd触发事件
      this.scroll.on('scrollEnd', () => {
        if (this.scroll.y <= this.scroll.maxScrollY + 50) {
          this.$emit('scrollToEnd')
        }
      })
    }
    if (this.beforeScroll) { // 需要监听滚动事件，当滚动的时候提交beforeScroll触发事件
      this.scroll.on('beforeScrollStart', () => {
        this.$emit('beforeScroll')
      })
    }
  }
}
</script>

<style lang="stylus" rel="stylesheet/stylus">

</style>
