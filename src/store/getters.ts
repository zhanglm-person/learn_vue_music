/* export const state = state => state */
import { State } from './state'
import { GetterTree } from 'vuex'
import Song from '@/common/js/song'

const getters: GetterTree<State, State> = {
  singer: (state) => state.singer,

  playing: (state) => state.playing,

  fullScreen: (state) => state.fullScreen,

  playlist: (state) => state.playlist,

  sequencelist: (state) => state.sequencelist,

  mode: (state) => state.mode,

  currentIndex: (state) => state.currentIndex,

  currentSong: (state) => state.playlist[state.currentIndex] || {},

  disc: (state) => state.disc,

  toplist: (state) => state.toplist,

  searchHistory: (state) => state.searchHistory,

  playHistory: (state) => state.playHistory.map((song) => new Song(song)),

  favoriteList: (state) => state.favoriteList.map((song) => new Song(song)),
}

export default getters
