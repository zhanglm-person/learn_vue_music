// 操作本地存储的相关
import storage from 'good-storage'
import Song from '@/common/js/song'

const SEARCH_KEY = '__search__'
const SEARCH_MAX_LEN = 15

const PLAY_KEY = '__play__'
const PLAY_MAX_LEN = 200

const FAVORITE_KEY = '__favorite__'
const FAVORITE_MAX_LEN = 200

function insertArray(
  arr: Array<object | string>,
  val: object | string,
  compare: (params: any) => boolean,
  maxLen: number,
) {
  const index = arr.findIndex(compare) // findIndex 传入的是一个函数，参数是每一个数组的元素
  if (index === 0) {
    return
  }
  if (index > 0) {
    arr.splice(index, 1)
  }
  arr.unshift(val)
  if (maxLen && arr.length > maxLen) {
    arr.pop()
  }
}

function deleteFromArray(arr: Array<object | string>, compare: (params: any) => boolean) {
  const index = arr.findIndex(compare)
  if (index > -1) {
    arr.splice(index, 1)
  }
}

export function saveSearch(query: string) {
  const searches = storage.get(SEARCH_KEY, [])
  insertArray(searches, query, (item) => item === query, SEARCH_MAX_LEN)
  storage.set(SEARCH_KEY, searches)
  return searches
}

export function deleteSearch(query: string) {
  const searches = storage.get(SEARCH_KEY, [])
  deleteFromArray(searches, (item) => {
    return item === query
  })
  storage.set(SEARCH_KEY, searches)
  return searches
}

export function clearSearch(): [] {
  storage.remove(SEARCH_KEY)
  return []
}
// 默认的state的searchHistory
export function loadSearch(): [] {
  return storage.get(SEARCH_KEY, [])
}

export function savePlay(song: Song): Song[] {
  const songs = storage.get(PLAY_KEY, [])
  insertArray(songs, song, (item) => {
    return song.id === item.id
  }, PLAY_MAX_LEN)
  storage.set(PLAY_KEY, songs)
  return songs
}

export function loadPlay(): [] {
  return storage.get(PLAY_KEY, [])
}

export function saveFavorite(song: Song): Song[] {
  const songs = storage.get(FAVORITE_KEY, [])
  insertArray(songs, song, (item) => {
    return song.id === item.id
  }, FAVORITE_MAX_LEN)
  storage.set(FAVORITE_KEY, songs)
  return songs
}

export function deleteFavorite(song: Song) {
  const songs = storage.get(FAVORITE_KEY, [])
  deleteFromArray(songs, (item) => {
    return item.id === song.id
  })
  storage.set(FAVORITE_KEY, songs)
  return songs
}

export function loadFavorite() {
  return storage.get(FAVORITE_KEY, [])
}
