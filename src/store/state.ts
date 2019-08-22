import { playMode } from '@/common/js/config'
import { loadSearch, loadPlay, loadFavorite } from '@/common/js/cache'
import Song from '@/common/js/song'

export interface State {
  singer: object
  playing: boolean
  fullScreen: boolean
  playlist: Song[] // 当前的播放列表
  sequencelist: Song[] // 一开始的顺序播放列表
  mode: number
  currentIndex: number
  disc: object
  toplist: Song[]
  searchHistory: string[]
  playHistory: Song[]
  favoriteList: Song[]
}

const state: State = {
  singer: {},
  playing: false,
  fullScreen: false,
  playlist: [], // 当前的播放列表
  sequencelist: [], // 一开始的顺序播放列表
  mode: playMode.sequence,
  currentIndex: -1,
  disc: {},
  toplist: [],
  searchHistory: loadSearch(),
  playHistory: [],
  favoriteList: [],
}

export default state
/*
*
* 导出的state本身就是一个对象，不需要再次加上｛｝!!!!
* */
