import {playMode} from 'common/js/config'
import {loadSearch, loadPlay} from 'common/js/cache'

const state = {
  singer: {},
  playing: false,
  fullScreen: false,
  playlist: [],   // 当前的播放列表
  sequencelist: [], // 一开始的顺序播放列表
  mode: playMode.sequence,
  currentIndex: -1,
  disc: {},
  toplist: {},
  searchHistory: loadSearch(),
  playHistory: loadPlay()
};

export default state
/*
* 导出的state本身就是一个对象，不需要再次加上｛｝!!!!
* */
