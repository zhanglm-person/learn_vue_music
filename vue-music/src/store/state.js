import {playMode} from 'common/js/config'

const state = {
  singer: {},
  playing: false,
  fullScreen: false,
  playlist: [],   // 当前的播放列表
  sequencelist: [], // 一开始的顺序播放列表
  mode: playMode.sequence,
  currentIndex: -1,
  disc:{},
  toplist:{}
};

export default state
/*
* 导出的state本身就是一个对象，不需要再次加上｛｝!!!!
* */
