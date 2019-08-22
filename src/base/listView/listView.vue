<template>
  <scroll ref="listview"
          class="listview"
          :data="data"
          :listenScroll="listenScroll"
          :probeType="probeType"
          @scroll="scroll"
  >
    <ul>
      <li class="list-group" v-for="(group, index) in data" ref="listGroup" :key="index">
        <h2 class="list-group-title">{{group.title}}</h2>
        <ul>
          <li @click="selectItem(item)" class="list-group-item" :key="innerIndex" v-for="(item, innerIndex) in group.items">
            <img v-lazy="item.avatar" alt="" class="avatar">
            <span class="name">{{item.name}}</span>
          </li>
        </ul>
      </li>
    </ul>
    <div class="list-shortcut" @touchstart="onShortcutTouchStart" @touchmove.stop.prevent="onShortcutTouchMove">
      <ul>
        <li :class="{'current':currentIndex===index}" class="item" v-for="(item,index) in shorcutlist"
            :data-index="index" :key="index">{{item}}
        </li>
      </ul>
    </div>
    <div class="list-fixed" v-show="fixedTitle" ref="fixed">
      <h1 class="fixed-title">
        {{fixedTitle}}
      </h1>
    </div>
    <div class="loading-container" v-if="!data.length">
      <loading></loading>
    </div>
  </scroll>
</template>

<script lang="ts">
import { Vue, Component, Prop, Emit, Watch } from 'vue-property-decorator'
import { getData } from '@/common/js/dom'
import Loading from '@/base/loading/loading.vue'
import Scroll from '@/base/scroll/scroll.vue'
import Singer from '@/common/js/singer'
import { Position } from 'better-scroll';

const ANCHOR_HEIGHT = 18
const TITLE_HEIGHT = 30

interface Touch {
  y1: number
  y2: number
  anchorIndex: string
}

@Component({
  components: {
    Scroll,
    Loading,
  },
})
export default class ListView extends Vue {
  get shorcutlist() {
    // 显示的固定的列表首字母
    return this.data.map((group) => {
      return group.title.substr(0, 1)
    })
  }

  get fixedTitle() {
    // 如果是下拉的  不会返回title
    if (this.scrollY > 0) { // scrollY往上翻滚应该是负值
      return ''
    }
    // data是通过父组件传过来的数组对象列表   这个是要改变固定在顶部的title，根据currentIndex显示title的内容
    return this.data[this.currentIndex] ? this.data[this.currentIndex].title : ''
  }
  @Prop({ default: () => [], type: Array }) public data!: any[]

  public scrollY: number = -1
  public currentIndex: number = 0
  public diff: number = 0
  public touch = {} as Touch
  public listenScroll: boolean = true
  public listHeight: number[] = []
  public probeType: number = 3 // 需要子组件scroll实时记录滚动状态
  public fixedTop!: number

  public $refs!: {
    listview: Scroll
    listGroup: HTMLLIElement[]
    fixed: HTMLDivElement,
  }

  public refresh() {
    this.$refs.listview.refresh()
  }

  public onShortcutTouchStart(e: TouchEvent) {
    const anchorIndex = getData(e.target as HTMLElement, 'index') // 字符串类型
    const firstTouch = e.touches[0]
    this.touch.y1 = firstTouch.pageY
    this.touch.anchorIndex = anchorIndex // 第一次触碰的小字母的index

    this.scrollTo(Number(anchorIndex))
  }

  public onShortcutTouchMove(e: TouchEvent) {
    const firstTouch = e.touches[0]
    this.touch.y2 = firstTouch.pageY
    // 从触摸开始到目前位置的距离差值，除以每个锚点小字母的高度，算出当前的index
    const delta = Math.floor((this.touch.y2 - this.touch.y1) / ANCHOR_HEIGHT)
    const anchorIndex = parseInt(this.touch.anchorIndex, 10) + delta
    // 计算当前滚动到的小字母的index，让左边的列表也滚动倒相对应的位置.有可能是小于0的，因为delta是可以弹性滚动产生的负值
    this.scrollTo(anchorIndex)
  }

  public scroll(pos: Position) {
    this.scrollY = pos.y
  }

  @Emit('select')
  public selectItem(item: Singer) {
    return item
  }

  @Watch('data')
  public onDataChange() {
    // 进入页面后20ms计算高度，为了避免DOM没有加载完成
    setTimeout(() => {
      this.calculateHeight()
    }, 20)
  }

  @Watch('scrollY')
  public onScrollYChange(newY: number) {
    const listHeight = this.listHeight
    // newY为负是表示往下滚动，正的就是表明上滚动到第一个且弹性拉取了，
    if (newY > 0) {
      this.currentIndex = 0
      return
    }
    for (let i = 0; i < listHeight.length - 1; i++) {
      const height1 = listHeight[i]
      const height2 = listHeight[i + 1]
      if ((-newY >= height1 && -newY < height2)) {
        // 只要当前滚动的距离的值在某个区间内，diff就会重新计算，从而比较和title的高度，推动title的上偏移
        this.currentIndex = i
        this.diff = height2 + newY // 计算滚动和当前组的差值(滚动视口和下一个group的title上部)
        return
      }
    }
    // 滚动到最后一个，且大于最后一个元素的上限
    this.currentIndex = listHeight.length - 2
  }

  @Watch('diff')
  public onDiffChange(newVal: number) {
    // 获取到实时的 滚动距离和当前组高度的上限差值，如果小于30（TITLE_HEIGHT）就让title的位置上偏移该差值
    const fixedTop = (newVal > 0 && newVal < TITLE_HEIGHT) ? newVal - TITLE_HEIGHT : 0
    // diff是实时变化的，如果一直是0，就不需要修改transform，节省DOM操作
    if (this.fixedTop === fixedTop) {
      return
    }
    this.fixedTop = fixedTop
    this.$refs.fixed.style.transform = 'translate3d(0,' + fixedTop + 'px,0)'
  }

  private scrollTo(index: number) {
    // 点击小锚点列表之外的元素就直接返回
    if (!index && index !== 0) {
      return
    }
    if (index < 0) {
      index = 0
    } else if (index > this.listHeight.length - 2) {
      // 因为listHeight的数组长度加了一个首位的0 所以她比listGroup的长度多了1，要减去2 才是listGroup的最后一个index
      index = this.listHeight.length - 2
    }
    this.scrollY = -this.listHeight[index]
    // scrollY本身应该是负值，listHeight是左边的列表高度数组
    this.$refs.listview.scrollToElement(this.$refs.listGroup[index], 0) // 第二个参数，动画缓动时间
  }

  private calculateHeight() {
    // 计算当前列表，每个字母组合的距离顶部的高低，拼成数组
    this.listHeight = []
    const list = this.$refs.listGroup
    let height = 0
    this.listHeight.push(height)
    // for (let i = 0; i < list.length; i++) {
    for (const item of list) {
      // const item = list[i]
      height += item.clientHeight// DOM可以用clientHeight获取高度
      this.listHeight.push(height)
    }
  }
}
</script>

<style lang="stylus" rel="stylesheet/stylus">
  @import "~@/common/stylus/variable"
  .listview
    position: relative
    width: 100%
    height: 100%
    overflow: hidden
    background: $color-background
    .list-group
      padding-bottom: 30px
      .list-group-title
        height: 30px
        line-height: 30px
        padding-left: 20px
        font-size: $font-size-small
        color: $color-text-l
        background: $color-highlight-background
      .list-group-item
        display: flex
        align-items: center
        padding: 20px 0 0 30px
        .avatar
          width: 50px
          height: 50px
          border-radius: 50%
        .name
          margin-left: 20px
          color: $color-text-l
          font-size: $font-size-medium
    .list-shortcut
      position: absolute
      z-index: 30
      right: 0
      top: 50%
      transform: translateY(-50%)
      width: 20px
      padding: 20px 0
      border-radius: 10px
      text-align: center
      background: $color-background-d
      font-family: Helvetica
      .item
        padding: 3px
        line-height: 1
        color: $color-text-l
        font-size: $font-size-small
        &.current
          color: $color-theme
    .list-fixed
      position: absolute
      top: 0
      left: 0
      width: 100%
      .fixed-title
        height: 30px
        line-height: 30px
        padding-left: 20px
        font-size: $font-size-small
        color: $color-text-l
        background: $color-highlight-background
    .loading-container
      position: absolute
      width: 100%
      top: 50%
      transform: translateY(-50%)
</style>
