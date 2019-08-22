import { commonParams, ERR_OK } from './config'
import { getUid } from '../helpers/uid'
import { LyricResponse, SongsUrlResponse } from '@/api/apiInterface'
import axios, { AxiosResponse } from 'axios'
import Song from '@/common/js/song'

interface UMid {
  code: number
  data: {
    midurlinfo: [
      {
        [key: string]: string
        songmid: string
        purl: string,
      }
    ],
  }
}
const debug = process.env.NODE_ENV !== 'production'

export async function getLyric(mid: string): Promise<LyricResponse> {
  const url = debug ? '/api/lyric' : 'http://127.0.0.1:7729/api/lyric'

  const data = Object.assign({}, commonParams, {
    songmid: mid,
    platform: 'yqq',
    hostUin: 0,
    needNewCode: 0,
    categoryId: 10000000,
    pcachetime: +new Date(), // 时间戳
    format: 'json', // 不需要jsonp请求,换成json
  })

  const res = await axios.get(url, {
    params: data,
  });
  return Promise.resolve(res.data);
}

// 获取歌曲链接
export function getSongsUrl(songs: Song[]): Promise<SongsUrlResponse> {
  const url = debug ? '/api/getPurlUrl' : 'http://127.0.0.1:7729/api/getPurlUrl'
  const mids: string[] = []
  const types: number[] = []

  songs.forEach((song) => {
    mids.push(song.mid)
    types.push(0)
  })

  const urlMid = genUrlMid(mids, types)

  const data = Object.assign({}, commonParams, {
    g_tk: 5381,
    format: 'json',
    platform: 'h5',
    uin: 0,
    needNewCode: 1,
  })

  return new Promise((resolve, reject) => {
    let tryTime = 3
    async function request() {
      const response = await axios.post(url, {
        comm: data,
        req_0: urlMid,
      });
      const res = response.data;
      if (res.code === ERR_OK) {
        const uMid: UMid = res.req_0;
        if (uMid && uMid.code === ERR_OK) {
          // 创建一个键值都是 string类型 的对象
          const purlMap: {
            [key: string]: string;
          } = {};
          uMid.data.midurlinfo.forEach((item) => {
            if (item.purl) {
              purlMap[item.songmid] = item.purl;
            }
          });
          if (Object.keys(purlMap).length > 0) {
            resolve(purlMap);
          } else {
            retry();
          }
        } else {
          retry();
        }
      } else {
        retry();
      }
    }
    function retry() {
      if (--tryTime >= 0) {
        request()
      } else {
        reject(new Error('获取不到歌曲URL地址'))
      }
    }
    request()
  })
}

function genUrlMid(mids: string[], types: number[]) {
  const guid = getUid()
  return {
    // module method 参考 https://segmentfault.com/a/1190000018645242
    module: 'vkey.GetVkeyServer',
    method: 'CgiGetVkey',
    param: {
      guid,
      songmid: mids,
      songtype: types,
      uin: '0',
      loginflag: 0,
      platform: '23',
    },
  }
}
