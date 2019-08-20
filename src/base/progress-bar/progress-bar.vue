<template>
  <div class="progress-bar" ref="progressBar" @click="progressClick">
    <div class="bar-inner">
      <div class="progress" ref="progress"></div>
      <div class="progress-btn-wrapper" ref="progressBtn"
           @touchstart.prevent="progressTouchStart"
           @touchmove.prevent="progressTouchMove"
           @touchend="progressTouchEnd"
      >
        <div class="progress-btn"></div>
      </div>
    </div>
  </div>
</template>

<script type='text/ecmascript-6'>
  import {prefixStyle} from 'common/js/dom'

  const transform = prefixStyle('transform');
  const progressBtnWidth = 16;
  export default{
    props: {
      percent: {
        type: Number,
        default: 0
      }
    },
    created(){
      this.touch = {};          //共享de数据
    },
    methods: {
      progressClick(e){
        // 点击progressBtn e.offsetX 是不正确的
        // this._offset(e.offsetX);    // 点击获取offsetX是偏移量
        // getBoundingClientRect 返回一个矩形，可以获取四个方向距离边框的值
        const left = this.$refs.progressBar.getBoundingClientRect().left;
        const offsetWidth = e.pageX - left;
        this._offset(offsetWidth);
        this._triggerPercent();     // 然后 向 父组件 通知改变
      },
      progressTouchStart(e){
        this.touch.initiated = true;      // 标志一次 触摸事件开始
        this.touch.startX = e.touches[0].pageX; // 手指放上去的位置
        this.touch.left = this.$refs.progress.clientWidth;  // 当前进度条的宽度，以便小球位置的确定
      },
      progressTouchMove(e){
        if (!this.touch.initiated) {
          return;
        }
        const deltaX = e.touches[0].pageX - this.touch.startX;  // 移动到此，手指的位置
        const offsetWidth = Math.min(Math.max(0, this.touch.left + deltaX), this.$refs.progressBar.clientWidth);   // 根据移动的位置，确定进度条的宽度和小球的位置偏移(最小是0，最大是容器宽度)
        this._offset(offsetWidth);
      },
      progressTouchEnd(){
        this.touch.initiated = false;      // 标志一次 触摸事件结束
        this._triggerPercent();
      },
      _triggerPercent(){
        const barWidth = this.$refs.progressBar.clientWidth - progressBtnWidth;
        const percent = this.$refs.progress.clientWidth / barWidth;
        this.$emit('percentChange', percent);
      },
      _offset(offsetWidth){
        this.$refs.progress.style.width = offsetWidth + "px";
        // 使用transform可以保证比使用left的位置更加精确！！！挪动距离比偏移距离更标准
        this.$refs.progressBtn.style[transform] = `translate3d(${offsetWidth}px,0,0)`;
      }
    },
    watch: {
      percent(newPercent){
        if (newPercent >= 0 && !this.touch.initiated) {// 拖动过程中，避免跳动
          // 减去的是 小球的宽度
          const barWidth = this.$refs.progressBar.clientWidth - progressBtnWidth;
          const offsetWidth = newPercent * barWidth;
          this._offset(offsetWidth);
        }
      }
    }
  }
</script>

<style lang="stylus" rel="stylesheet/stylus" scoped>
  @import "~common/stylus/variable"

  .progress-bar
    height: 30px
    .bar-inner
      position: relative
      top: 13px
      height: 4px
      background: rgba(0, 0, 0, 0.3)
      .progress
        position: absolute
        height: 100%
        background: $color-theme
      .progress-btn-wrapper
        position: absolute
        left: -8px
        top: -13px
        width: 30px
        height: 30px
        .progress-btn
          position: relative
          top: 7px
          left: 7px
          box-sizing: border-box
          width: 16px
          height: 16px
          border: 3px solid $color-text
          border-radius: 50%
          background: $color-theme
</style>
