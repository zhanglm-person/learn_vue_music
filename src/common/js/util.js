// 返回 min ，max之间的随机整数
function getRandomInt (min, max) {
  return Math.floor(Math.random() * (max - min + 1) + min)
}

// 洗牌函数
export function shuffle (arr) {
  let _arr = arr.slice() // arr.slice()会复制一个arr出来，不会更改原本的arr
  for (let i = 0; i < _arr.length; i++) {
    let j = getRandomInt(0, i)
    let t = _arr[i]
    _arr[i] = _arr[j]
    _arr[j] = t
  }
  return _arr
}
// 去抖函数（在某一个delay时间之内，多次触发函数，只执行一次）
export function debounce (func, delay) {
  let timer

  return function (...args) {
    if (timer) {
      clearTimeout(timer)
    }
    timer = setTimeout(() => {
      func.apply(this, args)
    }, delay)
  }
}