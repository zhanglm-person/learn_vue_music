import * as types from './mutations-type'

const mutations = {
  [types.SET_SINGER](state, singer){
    state.state.singer = singer;
  },
  [types.SET_PLAYING_STATE](state, flag){
    console.log(state)
    state.state.playing = flag;
  },
  [types.SET_FULLSCREEN](state, flag){
    state.state.fullScreen = flag;
  },
  [types.SET_PLAYLIST](state, list){
    state.state.playlist = list;
  },
  [types.SET_SEQUENCELIST](state, list){
    state.state.sequencelist = list;
  },
  [types.SET_MODE](state, mode){
    state.state.mode = mode;
  },
  [types.SET_CURRENTINDEX](state, index){
    state.state.currentIndex = index;
  }
}


export default mutations
