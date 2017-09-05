<template>
  <div class="player" v-show="playlist.length>0">
    <transition name="normal"
                @enter="enter"
                @after-enter="afterEnter"
                @leave="leave"
                @after-leave="afterLeave"
    >
      <div class="normal-player" v-show="fullScreen">
        <div class="background">
          <img :src="currentSong.image" alt="" width="100%" height="100%">
        </div>
        <div class="top">
          <div class="back" @click="back">
            <i class="icon-back"></i>
          </div>
          <h1 class="title" v-html="currentSong.name"></h1>
          <h2 class="subtitle" v-html="currentSong.singer"></h2>
        </div>
        <div class="middle"
             @touchstart.prvent="middleTouchStart"
             @touchmove.prvent="middleTouchMove"
             @touchend="middleTouchEnd"
        >
          <div class="middle-l" ref="middleL">
            <div class="cd-wrapper" ref="cdWrapper">
              <div class="cd" :class="cdCls">
                <img class="image" :src="currentSong.image" alt="">
              </div>
            </div>
            <div class="playing-lyric-wrapper">
              <div class="playing-lyric">{{playingLyric}}</div>
            </div>
          </div>
          <scroll class="middle-r" ref="lyricList" :data="currentLyric && currentLyric.lines">
            <div class="lyric-wrapper">
              <div v-if="currentLyric">
                <p ref="lyricLine"
                   class="text"
                   v-for="(line,index) in currentLyric.lines"
                   :class="{'current':currentLineNum === index}"
                >{{line.txt}}</p>
              </div>
            </div>
          </scroll>
        </div>
        <div class="bottom">
          <div class="dot-wrapper">
            <span class="dot" :class="{'active':currentShow==='CD'}"></span>
            <span class="dot" :class="{'active':currentShow==='Lyric'}"></span>
          </div>
          <div class="progress-wrapper">
            <span class="time time-l">{{format(currentTime)}}</span>
            <div class="progress-bar-wrapper">
              <progress-bar :percent="percent" @percentChange="onProgessBarChange"></progress-bar>
            </div>
            <span class="time time-r">{{format(currentSong.duration)}}</span>
          </div>
          <div class="operators">
            <div class="icon i-left">
              <i :class="iconMode" @click="changeMode"></i>
            </div>
            <div class="icon i-left" :class="disableCls">
              <i class="icon-prev" @click="prev"></i>
            </div>
            <div class="icon i-center" :class="disableCls">
              <i :class="playIcon" @click="togglePlaying"></i>
            </div>
            <div class="icon i-right" :class="disableCls">
              <i class="icon-next" @click="next"></i>
            </div>
            <div class="icon i-right">
              <i class="icon icon-not-favorite"></i>
            </div>
          </div>
        </div>
      </div>
    </transition>
    <transition name="mini">
      <div class="mini-player" v-show="!fullScreen" @click="open">
        <div class="icon">
          <img :class="cdCls" :src="currentSong.image" alt="" width="40" height="40">
        </div>
        <div class="text">
          <h2 class="name" v-html="currentSong.name"></h2>
          <p class="desc" v-html="currentSong.singer"></p>
        </div>
        <div class="control">
          <progress-circle :percent="percent" :radius="radius">
            <i class="icon-mini" :class="miniIcon" @click.stop.prevent="togglePlaying"></i>
          </progress-circle>
        </div>
        <div class="control">
          <i class="icon-playlist" @click.stop="showPlaylist"></i>
        </div>
      </div>
    </transition>
    <play-list ref="playlist"></play-list>
    <audio :src="currentSong.url" ref="audio" @timeupdate="updateTime" @canplay="ready" @error="error"
           @ended="end"></audio>
  </div>
</template>

<script type='text/ecmascript-6'>
  import PlayList from 'components/playlist/playlist'
  import ProgressBar from 'base/progress-bar/progress-bar'
  import ProgressCircle from 'base/progress-circle/progress-circle'
  import Scroll from 'base/scroll/scroll'
  import {mapGetters, mapMutations, mapActions} from 'vuex'
  import animations from 'create-keyframe-animation'
  import {prefixStyle} from 'common/js/dom'
  import {playMode} from 'common/js/config'
  import {shuffle} from 'common/js/util'
  import Lyric from 'lyric-parser'
  import {playerMixin} from 'common/js/mixin'

  const transform = prefixStyle('transform');
  const transitionDuration = prefixStyle('transitionDuration');
  export default {
    mixins: [playerMixin],
    data() {
      return {
        songReady: false,  //监听歌曲已经可以play的标志位，来判断是否可以点击 上下切换歌曲
        currentTime: 0,
        radius: 32,
        currentLyric: null,
        currentLineNum: 0,
        currentShow: "CD",
        playingLyric: ''
      }
    },
    computed: {
      percent() {
        return this.currentTime / this.currentSong.duration
      },
      cdCls() {
        return this.playing ? "play" : "play pause"
      },
      playIcon() {
        return this.playing ? "icon-pause" : "icon-play"
      },
      miniIcon() {
        return this.playing ? "icon-pause-mini" : "icon-play-mini"
      },
      disableCls() {
        return this.songReady ? "" : "disable"
      },
      /*iconMode() {
        return this.mode === playMode.sequence ? 'icon-sequence' : this.mode === playMode.loop ? 'icon-loop' : 'icon-random'
      },*/
      ...mapGetters([
        'fullScreen',
        'currentIndex',
        'playing',
        /*'playlist',
          'currentSong',
          'mode',
          'sequencelist'*/
      ])
    },
    created() {
      // 组件中共享的数据对象
      this.touch = {};
    },
    methods: {
      showPlaylist() {
        this.$refs.playlist.show();
      },
      back() {
        // 修改vuex的值，一定要要提交mutations
        this.setFullScreen(false);
      },
      open() {
        this.setFullScreen(true);
      },
      enter(el, done) {          //元素，回调（回调执行之后才能进入下一个钩子函数）
        const {x, y, scale} = this._getPosAndScale();
        // 定义 动画过程 (这个动画其实就是一个原本的元素，从一个不是自己的位置和大小，变化到属于自己的位置和大小的过程) translate3d 就是相对于自己本来的属性来说的
        let animation = {
          0: {
            transform: `translate3d(${x}px,${y}px,0) scale(${scale})`
          },
          60: {
            transform: `translate3d(0,0,0) scale(1.1)`
          },
          100: {
            transform: `translate3d(0,0,0) scale(1)`
          }
        };
        // 注册动画
        animations.registerAnimation({
          name: "move",       // 名称
          animation,          // 定义的动画对象
          presets: {          // 初始化参数
            duration: 400,    // 动画持续时间
            easing: 'linear'  // 动画效果曲线
          }
        });
        // 开始运行动画 参数是  动画的载体、动画的名称、以及回调函数
        animations.runAnimation(this.$refs.cdWrapper, 'move', done);
      },
      afterEnter() {
        animations.unregisterAnimation('move');
        //动画结束要清除 animation
        this.$refs.cdWrapper.style.animation = "";
      },
      leave(el, done) {
        this.$refs.cdWrapper.style.transition = "all 0.4s";
        const {x, y, scale} = this._getPosAndScale();
        // 离开的动画 就是把 当前元素 再次变回到 本不属于自己的位置和大小，实际的位置和大小还是css中设定的
        this.$refs.cdWrapper.style[transform] = `translate3d(${x}px,${y}px,0) scale(${scale})`;
        this.$refs.cdWrapper.addEventListener('transitionend', done);
      },
      afterLeave() {
        //动画结束要清除 transition 和 transform
        this.$refs.cdWrapper.style.transition = "";
        this.$refs.cdWrapper.style.transform = "";
      },
      togglePlaying() {
        if (!this.songReady) {
          return;
        }
        // 切换播放和暂停
        this.setPlaying(!this.playing);
        // 切换歌词的播放和暂停
        if (this.currentLyric) {
          this.currentLyric.togglePlay();
        }
      },
      /*      changeMode() {
              // 切换播放模式
              const mode = (this.mode + 1) % 3;
              this.setMode(mode);
              // 当播放模式切换到随机播放的时候，打乱playlist（洗牌函数）
              let list = null;
              if (mode === playMode.random) {
                list = shuffle(this.playlist)
              } else {
                list = this.sequencelist;
              }
              // 随机播放切换playlist的时候，不能切换当前播放歌曲，所以去新的播放列表找到当前播放歌曲，设置currentIndex
              this.resetCurrentIndex(list);
              this.setPlaylist(list);
            },
            resetCurrentIndex(list) {
              // findIndex是ES6提供给数组的函数->寻找元素，如果匹配到元素就返回当前元素的index，没有返回-1
              let index = list.findIndex((item) => {
                return item.id === this.currentSong.id
              });
              this.setCurrentIndex(index);
            },*/
      prev() {
        if (!this.songReady) {
          return;
        }
        if (this.playlist.length === 1) {
          this.loop();
          return;
        } else {
          let index = this.currentIndex - 1;
          if (index === -1) {
            index = this.playlist.length - 1;
          }
          this.setCurrentIndex(index);
          if (!this.playing) {
            this.togglePlaying();
          }
        }
        this.songReady = false; //每次进入到歌曲，可以播放的时候，再把标志位切换到false
      },
      next() {
        if (!this.songReady) {
          return;
        }
        if (this.playlist.length === 1) {
          this.loop();
          return;
        } else {
          let index = this.currentIndex + 1;
          if (index === this.playlist.length) {
            index = 0;
          }
          this.setCurrentIndex(index);
          if (!this.playing) {
            this.togglePlaying();
          }
        }
        this.songReady = false; // 每次进入到歌曲，可以播放的时候，再把标志位切换到false
      },
      end() {
        // 结束的时候，判断是否是单曲循环。
        if (this.mode === playMode.loop) {
          this.loop();
        } else {
          this.next();
        }
      },
      loop() {
        // 单曲循环的时候，把当前歌曲播放的当前时间设为开始。再设置播放
        this.$refs.audio.currentTime = 0;
        this.$refs.audio.play();
        // 歌词当前回到初始0
        if (this.currentLyric) {
          this.currentLyric.seek(0);
        }
      },
      ready() {
        // 当前歌曲可以播放，也可以切换歌曲的状态
        this.songReady = true;
        // 这里的this.currentSong本身是一个Song的事例，但是保存到localStorage中之后，只能是一个个字符串（对象），所以取的时候，要再次转换成Song的事例才可以进行操作。
        this.savePlayHistory(this.currentSong);
      },
      error() {
        // 歌曲出现错误，也要可以点击切换
        this.songReady = true;
      },
      updateTime(e) {
        // 监听媒体文件的currentTime，赋值给data中的currentTime，做vue的监听
        this.currentTime = e.target.currentTime;    //媒体文件的currentTime属性，可读可写
      },
      onProgessBarChange(percent) {
        // 当子组件的滚动条被改变的时候，根据返回的percent百分比，设置当前歌曲的播放位置
        const currentTime = this.currentSong.duration * percent;
        this.$refs.audio.currentTime = currentTime;
        // 改变进度条之后，如果是暂停状态，就要切换播放状态，让其播放
        if (!this.playing) {
          this.togglePlaying();
        }
        // 进度条改变，歌词进度也改变
        if (this.currentLyric) {
          this.currentLyric.seek(currentTime * 1000);
        }
      },
      _getPosAndScale() {
        const targetWidth = 40;               //小的播放器的CD宽度
        const paddingLeft = 40;               //小的CD圆心到左边框的距离
        const paddingBottom = 30;             //小的CD圆心到下边框的距离
        const paddingTop = 80;                //大的CD到上边框的距离
        const width = window.innerWidth * 0.8;  //大的CD的宽度
        const scale = targetWidth / width;      //缩放比例
        //关于js的X/Y轴，向右/向下是正方向，所以对于大CD到小CD来说：x偏移是负值，y偏移是正值
        const x = -(window.innerWidth / 2 - paddingLeft);  // x轴的偏移量
        const y = window.innerHeight - paddingTop - width / 2 - paddingBottom;//y轴的偏移量
        return {x, y, scale};
      },
      format(interval) {
        // 对当前播放时间和总时长做格式化调整
        interval = interval | 0;      //向下取整，效果 => Math.floor
        const minute = interval / 60 | 0;
        const second = this._pad(interval % 60);
        return minute + ":" + second;
      },
      _pad(num, n = 2) {
        // 补零函数
        let length = num.toString().length;
        while (length < n) {
          num = '0' + num;
          length++
        }
        return num;
      },
      _getLyric() {
        // 获取当前的歌曲歌词
        this.currentSong.getLyric().then((lyric) => {
          // console.log(lyric) lyric是一个长字符串
          this.currentLyric = new Lyric(lyric, this.handleLyric); // 利用Lyric创建一个对象,传入歌词字符串和回调函数，回调函数可以获取当前播放的第几条歌词和内容
          // console.log(this.currentLyric)
          if (this.playing) {
            this.currentLyric.play();
          }
        }).catch(() => {
          // 歌词没有获取成功，清理部分参数
          this.currentLyric = null;
          this.playingLyric = '';
          this.currentLineNum = 0;
        })
      },
      handleLyric({lineNum, txt}) {                      //回调函数在每次歌词改变的时候就会触发
        this.currentLineNum = lineNum;
        if (lineNum > 5) {                              // 当前行数超过5就开始滚动
          let lineEl = this.$refs.lyricLine[lineNum - 5]; // 滚动的是到当前元素-5的元素的位置，相对于显示的位置也就是上移一行。
          this.$refs.lyricList.scrollToElement(lineEl, 1000);
        } else {                                        // 没有超过5行的时候就不需要滚动，滚动距离就是0
          this.$refs.lyricList.scrollTo(0, 0, 1000);
        }
        this.playingLyric = txt;
      },
      middleTouchStart(e) {
        // start事件需要记录手指触碰到的位置，把该次触摸标志位设置为true
        this.touch.initiated = true;
        const touch = e.touches[0];
        this.touch.startX = touch.pageX;
        this.touch.startY = touch.pageY;
      },
      middleTouchMove(e) {
        if (!this.touch.initiated) {
          return
        }
        const touch = e.touches[0];
        const deltaX = touch.pageX - this.touch.startX;
        const deltaY = touch.pageY - this.touch.startY;   // 因为歌词可以上下滑动，所以判断如果上下滑动距离大于左右滑动，距离就不再作出回应。
        if (Math.abs(deltaY) > Math.abs(deltaX)) {
          return;
        }
        /*
         * 切记：切换的动画都是针对于歌词块Lyric来说的！！！！
         * */
        // 如果当前在CD页面，初始的left设置为0（从右往左滑）
        // 如果当前在Lyric页面，初始的left设置为 负的屏幕的宽度（从左往右滑）
        const left = this.currentShow === 'CD' ? 0 : -window.innerWidth;
        // 最后的偏移量确定是 最初的left值和手指滑动距离的和整个屏幕宽度负值(最大偏移一个屏幕的宽度)
        // lyricList的left最大为0，最小是屏幕宽度，不可能比0大。
        const offsetWidth = Math.min(Math.max(-window.innerWidth, left + deltaX), 0);
        // 计算已经触摸滑动的距离占屏幕宽度的百分比
        this.touch.percent = Math.abs(offsetWidth / window.innerWidth);
        //  让歌曲列表块进行偏移动画
        this.$refs.lyricList.$el.style[transform] = `translate3d(${offsetWidth}px,0,0)`;
        this.$refs.lyricList.$el.style[transitionDuration] = 0;
        // CD块要进行透明度变化动画
        this.$refs.middleL.style.opacity = 1 - this.touch.percent;
        this.$refs.middleL.style[transitionDuration] = 0;
      },
      middleTouchEnd() {
        let offsetWidth = 0;
        let opacity = 0;
        // 当前是CD块，判断触摸滑动百分比是否大于10%，就判定松手可以切换页面了，否则动手反弹回原位
        if (this.currentShow === 'CD') {
          if (this.touch.percent > 0.1) { // 切换之后要更改offsetWidth 和 当前展示的Show
            offsetWidth = -window.innerWidth;
            this.currentShow = 'Lyric';
            opacity = 0;
          } else {
            offsetWidth = 0;
            opacity = 1;
          }
        } else {// 当前是Lyric块，判断触摸滑动之后剩余部分所占百分比是否小于90%，就判定松手可以切换页面了，否则动手反弹回原位
          if (this.touch.percent < 0.9) {
            offsetWidth = 0;      // 切换之后要更改offsetWidth 和 当前展示的Show
            this.currentShow = 'CD';
            opacity = 1;
          } else {
            offsetWidth = -window.innerWidth;
            opacity = 0;
          }
        }
        const durationTime = 300;
        this.$refs.lyricList.$el.style[transform] = `translate3d(${offsetWidth}px,0,0)`;
        this.$refs.lyricList.$el.style[transitionDuration] = `${durationTime}ms`;

        this.$refs.middleL.style.opacity = opacity;
        this.$refs.middleL.style[transitionDuration] = `${durationTime}ms`;
        this.touch.initiated = false;           // 本次触摸结束，把标志位设置为false
      },
      ...mapMutations({
        setFullScreen: 'SET_FULLSCREEN',
        setPlaying: 'SET_PLAYING_STATE',
        /* setCurrentIndex: 'SET_CURRENTINDEX',
         setMode: 'SET_MODE',
         setPlaylist: 'SET_PLAYLIST'*/
      }),
      ...mapActions([
        'savePlayHistory'
      ])
    },
    watch: {
      currentSong(newSong, oldSong) {
        // 一般需要获取到Components对象的组件中控制该组件的显示隐藏 一定要使用v-show不要使用v-if否则第一次的时候会报 找不到元素的错误！！！
        if (!newSong.id) { // 防止删除歌曲的时候，删除完了，没有歌曲就会报错！！
          return;
        }
        // 如果currentSong的ID没有变化 就不能再次执行播放！
        if (newSong.id === oldSong.id) {
          return;
        }
        if (this.currentLyric) { // 切换歌曲的时候，判断是否已经存在一个歌词对象了，如果有就停止当前的歌词播放，在进行下一个歌词的获取和创建
          this.currentLyric.stop();   // 上一个歌词停止的时候，部分参数要归零！！，不然会跳歌词
          this.currentTime = 0;
          this.playingLyric = '';
          this.currentLineNum = 0;
        }
        // 切换歌曲之后要进行播放
        // 微信浏览器切换到后台之后是不会执行JS的！！！
        // 为了解决微信浏览器切换后台，执行无法监听到end事件从而无法执行下一步操作进而设置songReady，所以改用setTimeout;
        clearTimeout(this.timer);
        this.timer = setTimeout(() => {
          this.$refs.audio.play();
          this._getLyric();
        }, 1000)
      },
      playing(newPlaying) {
        // 此处的playing应该是从state那边读取出来的，上面切换了playing会提交到state更改，之后再获取，就发生了改变
        // 一般需要获取到Components对象的组件中控制该组件的显示隐藏 一定要使用v-show不要使用v-if否则第一次的时候会报 找不到元素的错误！！！
        const audio = this.$refs.audio;
        this.$nextTick(() => {
          // 根据新的playing状态，确定暂停或者播放
          newPlaying ? audio.play() : audio.pause();
        })
      }
    },
    components: {
      ProgressBar,
      ProgressCircle,
      Scroll,
      PlayList
    }
  }
</script>

<style lang="stylus" rel="stylesheet/stylus" scoped>
  @import "~common/stylus/variable"
  @import "~common/stylus/mixin"

  .player
    .normal-player
      position: fixed
      left: 0
      right: 0
      top: 0
      bottom: 0
      z-index: 150
      background: $color-background
      .background
        position: absolute
        left: 0
        top: 0
        width: 100%
        height: 100%
        z-index: -1
        opacity: 0.6
        filter: blur(20px)
      .top
        position: relative
        margin-bottom: 25px
        .back
          position absolute
          top: 0
          left: 6px
          z-index: 50
          .icon-back
            display: block
            padding: 9px
            font-size: $font-size-large-x
            color: $color-theme
            transform: rotate(-90deg)
        .title
          width: 70%
          margin: 0 auto
          line-height: 40px
          text-align: center
          no-wrap()
          font-size: $font-size-large
          color: $color-text
        .subtitle
          line-height: 20px
          text-align: center
          font-size: $font-size-medium
          color: $color-text
      .middle
        position: fixed
        width: 100%
        top: 80px
        bottom: 170px
        white-space: nowrap
        font-size: 0
        .middle-l
          display: inline-block
          vertical-align: top
          position: relative
          width: 100%
          height: 0
          padding-top: 80%
          .cd-wrapper
            position: absolute
            left: 10%
            top: 0
            width: 80%
            height: 100%
            .cd
              width: 100%
              height: 100%
              box-sizing: border-box
              border: 10px solid rgba(255, 255, 255, 0.1)
              border-radius: 50%
              &.play
                animation: rotate 20s linear infinite
              &.pause
                animation-play-state: paused
              .image
                position: absolute
                left: 0
                top: 0
                width: 100%
                height: 100%
                border-radius: 50%
          .playing-lyric-wrapper
            width: 80%
            margin: 30px auto 0 auto
            overflow: hidden
            text-align: center
            .playing-lyric
              height: 20px
              line-height: 20px
              font-size: $font-size-medium
              color: $color-text-l
        .middle-r
          display: inline-block
          vertical-align: top
          width: 100%
          height: 100%
          overflow: hidden
          .lyric-wrapper
            width: 80%
            margin: 0 auto
            overflow: hidden
            text-align: center
            .text
              line-height: 32px
              color: $color-text-l
              font-size: $font-size-medium
              &.current
                color: $color-text
      .bottom
        position: absolute
        bottom: 50px
        width: 100%
        .dot-wrapper
          text-align: center
          font-size: 0
          .dot
            display: inline-block
            vertical-align: middle
            margin: 0 4px
            width: 8px
            height: 8px
            border-radius: 50%
            background: $color-text-l
            &.active
              width: 20px
              border-radius: 5px
              background: $color-text-ll
        .progress-wrapper
          display: flex
          align-items: center
          width: 80%
          margin: 0 auto
          padding: 10px 0
          .time
            color: $color-text
            font-size: $font-size-small
            flex: 0 0 30px
            line-height: 30px
            width: 30px
            &.time-l
              text-align: left
            &.time-r
              text-align: right
          .progress-bar-wrapper
            flex: 1
        .operators
          display: flex
          align-items: center
          .icon
            flex: 1
            color: $color-theme
            &.disable
              color: $color-theme-d
            i
              font-size: 30px
          .i-left
            text-align: right
          .i-center
            padding: 0 20px
            text-align: center
            i
              font-size: 40px
          .i-right
            text-align: left
          .icon-favorite
            color: $color-sub-theme
      &.normal-enter-active, &.normal-leave-active
        transition: all 0.4s
        .top, .bottom
          transition: all 0.4s cubic-bezier(0.86, 0.18, 0.82, 1.32)
      &.normal-enter, &.normal-leave-to
        opacity: 0
        .top
          transform: translate3d(0, -100px, 0)
        .bottom
          transform: translate3d(0, 100px, 0)
    .mini-player
      display: flex
      align-items: center
      position: fixed
      left: 0
      bottom: 0
      z-index: 180
      width: 100%
      height: 60px
      background: $color-highlight-background
      &.mini-enter-active, &.mini-leave-active
        transition: all 0.4s
      &.mini-enter, &.mini-leave-to
        opacity: 0
      .icon
        flex: 0 0 40px
        width: 40px
        padding: 0 10px 0 20px
        img
          border-radius: 50%
          &.play
            animation: rotate 10s linear infinite
          &.pause
            animation-play-state: paused
      .text
        display: flex
        flex-direction: column
        justify-content: center
        flex: 1
        line-height: 20px
        overflow: hidden
        .name
          margin-bottom: 2px
          no-wrap()
          font-size: $font-size-medium
          color: $color-text
        .desc
          no-wrap()
          font-size: $font-size-small
          color: $color-text-d
      .control
        flex: 0 0 30px
        width: 30px
        padding: 0 10px
        .icon-play-mini, .icon-pause-mini, .icon-playlist
          font-size: 30px
          color: $color-theme-d
        .icon-mini
          font-size: 32px
          position: absolute
          left: 0
          top: 0

  @keyframes rotate
    0%
      transform: rotate(0)
    100%
      transform: rotate(360deg)
</style>
