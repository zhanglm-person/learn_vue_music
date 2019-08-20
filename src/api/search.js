import axios from 'axios'
import jsonp from 'common/js/jsonp'
import { commonParams, options } from './config'

const debug = process.env.NODE_ENV !== 'production'

export function getHotKey () {
  const url = 'https://c.y.qq.com/splcloud/fcgi-bin/gethotkey.fcg'
  const data = Object.assign({}, commonParams, {
    uin: 0,
    needNewCode: 1,
    playform: 'h5'
  })
  return jsonp(url, data, options)
}

export function search (query, page, zhida, perpage) {
  // const url = 'https://c.y.qq.com/soso/fcgi-bin/search_for_qq_cp'
  const url = debug ? '/api/search' : 'http://127.0.0.1:7729/api/search'

  const data = Object.assign({}, commonParams, {
    w: query,
    p: page,
    catZhida: zhida ? 1 : 0,
    zhidaqu: 1,
    t: 0,
    flag: 0,
    ie: 'utf-8',
    sem: 1,
    aggr: 0,
    perpage,
    n: perpage,
    remoteplace: 'txt.mqq.all',
    uid: 0,
    needNewCode: 1,
    playform: 'h5',
    uin: 0,
    format: 'json'
  })

  return axios
    .get(url, {
      params: data
    })
    .then(res => {
      return Promise.resolve(res.data)
    })
}
