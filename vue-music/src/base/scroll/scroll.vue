<template>
  <div ref="wrapper">
    <slot></slot>
  </div>
</template>

<script type="text/ecmascript-6">
  import BScroll from 'better-scroll'

  export default {
    props: {
      probeType: {
        type: Number,
        default: 1
      },
      click: {
        type: Boolean,
        default: true
      },
      data: {
        type: Array,
        default: null
      },
      listenScroll: {
        type: Boolean,
        default: false
      },
      pullup: {
        type: Boolean,
        default: false
      },
      beforeScroll: {
        type: Boolean,
        default: false
      },
      refreshDelay:{
        type: Number,
        default: 20
      }
    },
    mounted() {
      setTimeout(() => {
        this._initScroll()
      }, 20)
    },
    methods: {
      _initScroll() {
        if (!this.$refs.wrapper) {
          return;
        }
        this.scroll = new BScroll(this.$refs.wrapper, {
          probeType: this.probeType,
          click: this.click
        });
        if (this.listenScroll) {//如果需要监听滚动距离事件，则向父组件响应scroll事件
          let me = this;
          this.scroll.on('scroll', (pos) => {
            me.$emit('scroll', pos);
          })
        }
        if (this.pullup) {    // 如果需要上拉加载，则在滚动到最大距离加50px的时候向父组件提交一个scrollToEnd触发事件
          this.scroll.on('scrollEnd', () => {
            if (this.scroll.y <= this.scroll.maxScrollY + 50) {
              this.$emit('scrollToEnd')
            }
          })
        }
        if (this.beforeScroll) {  // 需要监听滚动事件，当滚动的时候提交beforeScroll触发事件
          this.scroll.on('beforeScrollStart', () => {
            this.$emit('beforeScroll');
          })
        }
      },
      disable() {
        this.scroll && this.scroll.disable()
      },
      enable() {
        this.scroll && this.scroll.enable()
      },
      refresh() {
        this.scroll && this.scroll.refresh()
      },
      scrollTo() {
        this.scroll && this.scroll.scrollTo.apply(this.scroll, arguments)
      },
      scrollToElement() {
        this.scroll && this.scroll.scrollToElement.apply(this.scroll, arguments)
      }
    },
    watch: {
      data() {
        setTimeout(() => {
          this.refresh();
        }, this.refreshDelay)
      }
    }
  }
</script>

<style lang="stylus" rel="stylesheet/stylus">

</style>
