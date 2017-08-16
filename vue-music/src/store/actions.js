import * as types from './mutations-type'

export const selectPlay = function ({commit, state}, {list, index}) {
  commit(types.SET_PLAYLIST, list);
  commit(types.SET_SEQUENCELIST, list);
  commit(types.SET_CURRENTINDEX, index);
  commit(types.SET_PLAYING_STATE, true);
  commit(types.SET_FULLSCREEN, true);
};
