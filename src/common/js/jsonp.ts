import originJsonp from 'jsonp'

interface Data {
  [key: string]: string | number
}

export default function jsonp(url: string, data: Data, option: object): Promise<any> {
  url += (url.indexOf('?') < 0 ? '?' : '&') + param(data)

  return new Promise((resolve, reject) => {
    originJsonp(url, option, (err, res) => {
      if (!err) { // 成功的话 err 是 null
        resolve(res)
      } else {
        reject(err)
      }
    })
  })
}
// 把data对象拆分成url后面的参数
export function param(data: Data): string {
  let url = ''
  for (const k of Object.keys(data)) {
    const value = data[k] !== undefined ? data[k] : ''
    url += '&' + k + '=' + encodeURIComponent(value)
  }
  return url ? url.substring(1) : ''
}
