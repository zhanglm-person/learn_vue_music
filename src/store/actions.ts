// 当前播放的歌曲是由currentIndex和playlist来控制的。所以设置了这两个中的任一个都会导致
// playlist[currentIndex]当前播放歌曲的改变，从而切换播放歌曲！！！

import * as types from './mutations-type'
import { shuffle } from '@/common/js/util'
import { playMode } from '@/common/js/config'
import { saveSearch, deleteSearch, clearSearch, savePlay, saveFavorite, deleteFavorite } from '@/common/js/cache'
import Song from '@/common/js/song'
import { ActionTree } from 'vuex'
import { State } from './state'

function findIndex(list: any[], song: Song) { // 寻找歌曲在列表中的位置
  return list.findIndex((item) => {
    return item.id === song.id
  })
}

const actions: ActionTree<State, State> = {
  selectPlay: ({ commit, state }, { list, index }) => {
    // 如果点击歌曲的时候已经是点击过随机播放全部的状态，就要再打乱一次顺序播放列表，当作播放列表传入提交。当然还要找到，点击的当前歌曲list[index]在新列表中的位置
    if (state.mode === playMode.random) {
      const randomList = shuffle(list)
      commit(types.SET_PLAYLIST, randomList)
      index = findIndex(randomList, list[index])
    } else { // 如果没有点击过随机播放全部的状态，就按照第一次播放列表，提交
      commit(types.SET_PLAYLIST, list)
    }
    commit(types.SET_SEQUENCELIST, list)
    commit(types.SET_CURRENTINDEX, index)
    commit(types.SET_PLAYING_STATE, true)
    commit(types.SET_FULLSCREEN, true)
  },

  randomPlay: ({ commit }, { list }) => {
    commit(types.SET_SEQUENCELIST, list)
    commit(types.SET_MODE, playMode.random)
    const randomList = shuffle(list)
    commit(types.SET_PLAYLIST, randomList)
    commit(types.SET_CURRENTINDEX, 0)
    commit(types.SET_PLAYING_STATE, true)
    commit(types.SET_FULLSCREEN, true)
  },

  // 插入歌曲是在当前播放歌曲的后面插入这首歌，并且播放插入的歌曲！
  insertSong: ({ commit, state }, song: Song) => {
    // 对象引用 使用slice创建一个副本 否则会直接更改原有数组
    const playlist = state.playlist.slice()
    const sequencelist = state.sequencelist.slice()
    let currentIndex = state.currentIndex
    // 记录当前歌曲
    const currentSong = playlist[currentIndex]
    // 查找当前列表是否有当前歌曲，返回索引
    const fpIndex = findIndex(playlist, song)
    // 插入歌曲，当前索引加一
    currentIndex++
    // 插入当前点击的歌曲到当前播放位置的下个位置，然后设置currentIndex，就可以播放当前插入的歌曲
    playlist.splice(currentIndex, 0, song)

    if (fpIndex > -1) { // 已包含这首歌
      if (currentIndex > fpIndex) { // 当前插入序号大于之前列表序号
        playlist.splice(fpIndex, 1)
        currentIndex--
      } else { // 当前播放序号小于之前含有这首歌的序号，删除后面的序号要加1
        playlist.splice(fpIndex + 1, 1)
      }
    }
    // 顺序播放列表的插入和删除歌曲（同playlist，如果有先插入(插入是在当前播放歌曲的后面插入)后删除）
    // 顺序列表是在点击歌曲播放列表时候展开的
    const currentSIndex = findIndex(sequencelist, currentSong) + 1
    const fsIndex = findIndex(sequencelist, song)
    sequencelist.splice(currentSIndex, 0, song)
    if (fsIndex > -1) {
      if (currentSIndex > fsIndex) {
        sequencelist.splice(fsIndex, 1)
      } else {
        sequencelist.splice(fsIndex + 1, 1)
      }
    }

    commit(types.SET_PLAYLIST, playlist)
    commit(types.SET_SEQUENCELIST, sequencelist)
    commit(types.SET_CURRENTINDEX, currentIndex)
    commit(types.SET_FULLSCREEN, true)
    commit(types.SET_PLAYING_STATE, true)
  },

  saveSearchHistory: ({ commit }, query: string) => {
    commit(types.SET_SEARCH_HISTORY, saveSearch(query))
  },

  deleteSearchHistory: ({ commit }, query: string) => {
    commit(types.SET_SEARCH_HISTORY, deleteSearch(query))
  },

  clearSearchHistory: ({ commit }) => {
    commit(types.SET_SEARCH_HISTORY, clearSearch())
  },

  deleteSong: ({ commit, state }, song: Song) => {
    // 对象引用 使用slice创建一个副本 否则会直接更改原有数组
    const playlist = state.playlist.slice()
    const sequencelist = state.sequencelist.slice()
    let currentIndex = state.currentIndex

    const pIndex = findIndex(playlist, song)
    playlist.splice(pIndex, 1)
    const sIndex = findIndex(sequencelist, song)
    sequencelist.splice(sIndex, 1)

    // 当前播放歌曲大于删除歌曲的位置，就把当前播放索引-- ;
    // 如果当前播放是最后一首歌曲，且删除的也是最后一首歌曲，也要把当前播放索引--
    if (currentIndex > pIndex || currentIndex === playlist.length) {
      currentIndex--
    }

    commit(types.SET_PLAYLIST, playlist)
    commit(types.SET_SEQUENCELIST, sequencelist)
    commit(types.SET_CURRENTINDEX, currentIndex)

    const playingState = playlist.length > 0
    commit(types.SET_PLAYING_STATE, playingState)
    /* if (!playlist.length) {   // 播放列表删完，停止播放
      commit(types.SET_PLAYING_STATE, false);
    } else {
      // 播放列表仍有歌曲，就播放
      commit(types.SET_PLAYING_STATE, true)
    } */
  },

  deleteSongList: ({ commit }) => {
    commit(types.SET_PLAYLIST, [])
    commit(types.SET_SEQUENCELIST, [])
    commit(types.SET_CURRENTINDEX, -1)
    commit(types.SET_PLAYING_STATE, false)
  },

  savePlayHistory: ({ commit }, song: Song) => {
    commit(types.SET_PLAY_HISTORY, savePlay(song))
  },

  saveFavoriteList: ({ commit }, song: Song) => {
    commit(types.SET_FAVORITE_LIST, saveFavorite(song))
  },

  deleteFavoriteList: ({ commit }, song: Song) => {
    commit(types.SET_FAVORITE_LIST, deleteFavorite(song))
  },
}

export default actions
