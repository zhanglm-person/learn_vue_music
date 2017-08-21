<template>
  <scroll ref="listview"
          class="listview"
          :data="data"
          :listenScroll="listenScroll"
          @scroll="scroll"
          :probeType="probeType"
  >
    <ul>
      <li class="list-group" v-for="(group,index) in data" ref="listGroup">
        <h2 class="list-group-title">{{group.title}}</h2>
        <ul>
          <li @click="selectItem(item)" class="list-group-item" v-for="(item,index) in group.items">
            <img v-lazy="item.avatar" alt="" class="avatar">
            <span class="name">{{item.name}}</span>
          </li>
        </ul>
      </li>
    </ul>
    <div class="list-shortcut" @touchstart="onShortcutTouchStart" @touchmove.stop.prevent="onShortcutTouchMove">
      <ul>
        <li :class="{'current':currentIndex===index}" class="item" v-for="(item,index) in shorcutlist"
            :data-index="index">{{item}}

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

<script type="text/ecmascript-6">
  import Scroll from 'base/scroll/scroll'
  import {getData} from 'common/js/dom'
  import Loading from 'base/loading/loading'
  const ANCHOR_HEIGHT = 18;
  const TITLE_HEIGHT = 30;

  export default{
    components: {
      Scroll,
      Loading
    },
    computed: {
      shorcutlist(){
        //显示的固定的列表首字母
        return this.data.map((group) => {
          return group.title.substr(0, 1)
        })
      },
      fixedTitle(){
        //如果是下拉的  不会返回title
        if (this.scrollY > 0) { //scrollY往上翻滚应该是负值
          return ""
        }
        //data是通过父组件传过来的数组对象列表   这个是要改变固定在顶部的title，根据currentIndex显示title的内容
        return this.data[this.currentIndex] ? this.data[this.currentIndex].title : ""
      }
    },
    props: {
      data: {
        type: Array,
        default: []
      }
    },
    data(){
      return {
        scrollY: -1,
        currentIndex: 0,
        diff: 0
      }
    },
    created(){
      this.touch = {};
      this.listenScroll = true;
      this.listHeight = [];
      this.probeType = 3;//需要子组件scroll实时记录滚动状态
    },
    methods: {
      selectItem(item){
        this.$emit("select",item);
      },
      onShortcutTouchStart(e){
        //console.log(e.target);
        let anchorIndex = getData(e.target, "index");
        let firstTouch = e.touches[0];
        //console.log(firstTouch)
        this.touch.y1 = firstTouch.pageY;
        this.touch.anchorIndex = anchorIndex;//第一次触碰的小字母的index

        this._scrollTo(anchorIndex);
      },
      onShortcutTouchMove(e){
        let firstTouch = e.touches[0];
        //console.log(firstTouch)
        this.touch.y2 = firstTouch.pageY;
        //console.log(this.touch.y2 - this.touch.y1)
        //从触摸开始到目前位置的距离差值，除以每个锚点小字母的高度，算出当前的index
        let delta = (this.touch.y2 - this.touch.y1) / ANCHOR_HEIGHT | 0;
        let anchorIndex = parseInt(this.touch.anchorIndex) + delta;
        //计算当前滚动到的小字母的index，让左边的列表也滚动倒相对应的位置.有可能是小于0的，因为delta是可以弹性滚动产生的负值
        this._scrollTo(anchorIndex);
      },
      scroll(pos){
        this.scrollY = pos.y;
      },
      _calculateHeight(){
        // 计算当前列表，每个字母组合的距离顶部的高低，拼成数组
        this.listHeight = [];
        const list = this.$refs.listGroup;
        let height = 0;
        this.listHeight.push(height);
        for (let i = 0; i < list.length; i++) {
          let item = list[i];
          height += item.clientHeight;
          this.listHeight.push(height);
        }
        //console.log(this.listHeight)
        //console.log(this.$refs.listGroup)
      },
      _scrollTo(index){
        if (!index && index !== 0) {
          return
        }
        if (index < 0) {
          index = 0;
        } else if (index > this.listHeight.length - 2) {
          //因为listHeight的数组长度加了一个首位的0 所以她比listGroup的长度多了1，要减去2 才是listGroup的最后一个index
          index = this.listHeight.length - 2;
        }
        this.scrollY = -this.listHeight[index];
        //scrollY本身应该是负值，listHeight是左边的列表高度数组
        this.$refs.listview.scrollToElement(this.$refs.listGroup[index], 0);
      }
    },
    watch: {
      data(){
        //进入页面后20s计算高度，为了避免DOM没有加载完成
        setTimeout(() => {
          this._calculateHeight()
        }, 20)
      },
      scrollY(newY){
        const listHeight = this.listHeight;
        //newY为负是表示往下滚动，正的就是表名上滚动到第一个且弹性拉取了，
        if (newY > 0) {
          this.currentIndex = 0;
          return;
        }
        for (let i = 0; i < listHeight.length - 1; i++) {
          let height1 = listHeight[i];
          let height2 = listHeight[i + 1];
          if ((-newY >= height1 && -newY < height2)) {
            //只要当前滚动的距离的值在某个区间内，diff就会重新计算，从而比较和title的高度，推动title的上偏移
            this.currentIndex = i;
            //console.log(newY + "=====")
            this.diff = height2 + newY; //计算滚动和当前组的差值

            return;
          }
        }
        this.currentIndex = listHeight.length - 2;
      },
      diff(newVal){
        //console.log(newVal)
        //获取到实时的 滚动距离和当前组高度差值，如果小于30（TITLE_HEIGHT）就让title的位置上偏移该差值
        let fixedTop = (newVal > 0 && newVal < TITLE_HEIGHT) ? newVal - TITLE_HEIGHT : 0;
        if (this.fixedTop === fixedTop) {
          return
        }
        this.fixedTop = fixedTop;
        this.$refs.fixed.style.transform = "translate3d(0," + fixedTop + "px,0)"
      }
    }
  }
</script>

<style lang="stylus" rel="stylesheet/stylus">
  @import "~common/stylus/variable"
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
