import { getLyric, getSongsUrl } from 'api/song'
import { ERR_OK } from 'api/config'
import { Base64 } from 'js-base64'
// 单例模式
export default class Song {
  // 类 是面向对象编程 扩展性好
  constructor ({ id, mid, singer, name, album, duration, image, url }) {
    this.id = id
    this.mid = mid
    this.singer = singer
    this.name = name
    this.album = album
    this.duration = duration
    this.image = image
    this.url = url
  }

  // 获取歌词，当作歌曲类的一个属性
  getLyric () {
    // 如果当前歌曲已经有 lyric ，就直接返回一个 Promise
    if (this.lyric) {
      return Promise.resolve(this.lyric)
    }

    return new Promise((resolve, reject) => {
      getLyric(this.mid).then((res) => {
        if (res.retcode === ERR_OK) {
          this.lyric = Base64.decode(res.lyric)
          resolve(this.lyric)
        } else {
          reject(new Error('no lyric'))
        }
      })
    })
  }
}

// 工厂方法
export function createSong (musicData) {
  return new Song({
    id: musicData.songid,
    mid: musicData.songmid,
    singer: filterSinger(musicData.singer),
    name: musicData.songname,
    album: musicData.albumname,
    duration: musicData.interval,
    image: `https://y.gtimg.cn/music/photo_new/T002R300x300M000${musicData.albummid}.jpg?max_age=2592000`,
    url: `http://ws.stream.qqmusic.qq.com/${musicData.songid}.m4a?fromtag=46`
  })
}

export function filterSinger (singer) {
  // 定义一个把数组组合成字符串的方法
  let ret = []
  if (!singer) {
    return ''
  }
  singer.forEach((s) => {
    ret.push(s.name)
  })
  // 多个歌手拼接 /
  return ret.join('/')
}

// 确定是否为可行歌曲（非付费歌曲）
export function isValidMusic (musicData) {
  return (
    musicData.songid &&
    musicData.albummid &&
    (!musicData.pay || musicData.pay.payalbumprice === 0)
  )
}

// 处理歌曲播放链接
export function processSongsUrl (songs) {
  if (!songs.length) {
    return Promise.resolve(songs)
  }
  return getSongsUrl(songs).then(purlMap => {
    songs = songs.filter(song => {
      const purl = purlMap[song.mid]
      if (purl) {
        song.url =
          purl.indexOf('http') === -1
            ? `http://d1.stream.qqmusic.com/${purl}`
            : purl
        return true
      }
      return false
    })
    return songs
  })
}

export function normalizeSongs (list) {
  const ret = []
  list.forEach(item => {
    item = item.musicData ? item.musicData : item.data ? item.data : item
    if (isValidMusic(item)) {
      ret.push(createSong(item))
    }
  })
  return ret
}
