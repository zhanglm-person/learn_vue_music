import jsonp from 'common/js/jsonp'
import {commonParams, options} from './config'

export function getSingerList() {
  const url = 'https://c.y.qq.com/v8/fcg-bin/v8.fcg';

  const data = Object.assign({}, commonParams, {
    channel: 'singer',
    page: 'list',
    key: "all_all_all",
    pagenum: 1,
    pagesize: 100,
    uin: 0,
    hostUin: 0,
    platform: "yqq",
    needNewCode: 1
  });

  return jsonp(url, data, options);
}

export function getSingerDetial(singerid) {
  const url = 'https://c.y.qq.com/v8/fcg-bin/fcg_v8_singer_track_cp.fcg';

  const data = Object.assign({}, commonParams, {
    hostUin: 0,
    platform: "yqq",
    needNewCode: 0,
    begin: 0,
    order: 'listen',
    num: 100,
    singermid: singerid,
    songstatus: 1
  });

  return jsonp(url, data, options);
}
