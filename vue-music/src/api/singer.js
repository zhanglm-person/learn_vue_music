import jsonp from 'common/js/jsonp'
import {commonParams, options} from './config'
import axios from 'axios'

export function  getSingerList() {
  const url = 'https://c.y.qq.com/v8/fcg-bin/v8.fcg';

  const data = Object.assign({}, commonParams, {
    channel:'singer',
    page:'list',
    key:"all_all_all",
    pagenum:1,
    pagesize:100,

    uin: 0,
    hostUin:0,
    platform:"yqq",
    needNewCode: 1
  });

  return jsonp(url, data, options);
}
