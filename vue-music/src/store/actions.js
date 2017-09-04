import * as types from './mutations-type'
import {shuffle} from 'common/js/util'
import {playMode} from 'common/js/config'
import {saveSearch, deleteSearch, clearSearch} from 'common/js/cache'

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

export const insertSong = function ({commit, state}, song) {
  // 对象引用 使用slice创建一个副本 否则会直接更改原有数组
  let playlist = state.playlist.slice();
  let sequencelist = state.sequencelist.slice();
  let currentIndex = state.currentIndex;
  // 记录当前歌曲
  let currentSong = playlist[currentIndex];
  // 查找当前列表是否有当前歌曲，返回索引
  let fpIndex = findIndex(playlist, song);
  // 插入歌曲，索引加一
  currentIndex++;
  //插入当前点击的歌曲到当前播放位置，就可以播放
  playlist.splice(currentIndex, 0, song);

  if (fpIndex > -1) {   //已包含这首歌
    if (currentIndex > fpIndex) {   // 当前插入序号大于之前列表序号
      playlist.splice(fpIndex, 1);
      currentIndex--;
    } else {                        // 当前播放序号小于之前含有这首歌的序号，删除后面的序号要加1
      playlist.splice(fpIndex + 1, 1);
    }
  }
  // 顺序播放列表的插入和删除歌曲（同playlist，如果有先插入后删除）
  let currentSIndex = findIndex(sequencelist, currentSong) + 1;
  let fsIndex = findIndex(sequencelist, song);
  sequencelist.splice(currentSIndex, 0, song);
  if (fsIndex > -1) {
    if (currentSIndex > fsIndex) {
      sequencelist.splice(fsIndex, 1);
    } else {
      sequencelist.splice(fsIndex + 1, 1);
    }
  }

  commit(types.SET_PLAYLIST, playlist);
  commit(types.SET_SEQUENCELIST, sequencelist);
  commit(types.SET_CURRENTINDEX, currentIndex);
  commit(types.SET_FULLSCREEN, true);
  commit(types.SET_PLAYING_STATE, true);
};

export const saveSearchHistory = function ({commit}, query) {
  commit(types.SET_SEARCH_HISTORY, saveSearch(query));
};

export const deleteSearchHistory = function ({commit}, query) {
  commit(types.SET_SEARCH_HISTORY, deleteSearch(query));
};

export const clearSearchHistory = function ({commit}) {
  commit(types.SET_SEARCH_HISTORY, clearSearch());
};

export const deleteSong = function ({commit, state}, song) {
  // 对象引用 使用slice创建一个副本 否则会直接更改原有数组
  let playlist = state.playlist.slice();
  let sequencelist = state.sequencelist.slice();
  let currentIndex = state.currentIndex;

  let pIndex = findIndex(playlist, song);
  playlist.splice(pIndex, 1);
  let sIndex = findIndex(sequencelist, song);
  sequencelist.splice(sIndex, 1);

  // 当前播放歌曲大于删除歌曲的位置，就把当前播放索引-- ;
  // 如果当前播放是最后一首歌曲，且删除的也是最后一首歌曲，也要把当前播放索引--
  if (currentIndex > pIndex || currentIndex === playlist.length) {
    currentIndex--;
  }

  commit(types.SET_PLAYLIST, playlist);
  commit(types.SET_SEQUENCELIST, sequencelist);
  commit(types.SET_CURRENTINDEX, currentIndex);

  const playingState = playlist.length > 0;
  commit(types.SET_PLAYING_STATE, playingState);
  /*if (!playlist.length) {   // 播放列表删完，停止播放
    commit(types.SET_PLAYING_STATE, false);
  } else {
    // 播放列表仍有歌曲，就播放
    commit(types.SET_PLAYING_STATE, true)
  }*/
};

export const deleteSongList = function ({commit}) {
  commit(types.SET_PLAYLIST, []);
  commit(types.SET_SEQUENCELIST, []);
  commit(types.SET_CURRENTINDEX, -1);
  commit(types.SET_PLAYING_STATE, false);
};
