import * as types from './mutations-type'
import {shuffle} from 'common/js/util'
import {playMode} from 'common/js/config'

function findIndex(list, song) {      // 寻找歌曲在列表中的位置
  return list.findIndex((item) => {
    return item.id === song.id;
  })
}
export const selectPlay = function ({commit, state}, {list, index}) {
  if (state.mode === playMode.random) {   // 如果点击歌曲的时候已经是点击过随机播放全部的状态，就要再打乱一次顺序播放列表，当作播放列表传入提交。当然还要找到，点击的当前歌曲list[index]在新列表中的位置
    let randomList = shuffle(list);
    commit(types.SET_PLAYLIST, randomList);
    index = findIndex(randomList, list[index]);
  } else {    // 如果没有点击过随机播放全部的状态，就按照第一次播放列表，提交
    commit(types.SET_PLAYLIST, list);
  }
  commit(types.SET_SEQUENCELIST, list);
  commit(types.SET_CURRENTINDEX, index);
  commit(types.SET_PLAYING_STATE, true);
  commit(types.SET_FULLSCREEN, true);
};

export const randomPlay = function ({commit}, {list}) {
  commit(types.SET_SEQUENCELIST, list);
  commit(types.SET_MODE, playMode.random);
  let randomList = shuffle(list);
  commit(types.SET_PLAYLIST, randomList);
  commit(types.SET_CURRENTINDEX, 0);
  commit(types.SET_PLAYING_STATE, true);
  commit(types.SET_FULLSCREEN, true);
};
