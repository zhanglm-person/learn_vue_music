import {playMode} from 'common/js/config'

const state = {
  singer: {},
  playing: false,
  fullScreen: false,
  playlist: [],
  sequencelist: [],
  mode: playMode.sequence,
  currentIndex: -1
};

export default state
/*
* 导出的state本身就是一个对象，不需要再次加上｛｝!!!!
* */
