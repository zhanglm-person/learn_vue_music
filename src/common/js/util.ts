// 返回 min ，max之间的随机整数
function getRandomInt(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1) + min)
}

// 洗牌函数
export function shuffle(arr: any[]): any[] {
  const copyArr = arr.slice() // arr.slice()会复制一个arr出来，不会更改原本的arr
  for (let i = 0; i < copyArr.length; i++) {
    const j = getRandomInt(0, i)
    const t = copyArr[i]
    copyArr[i] = copyArr[j]
    copyArr[j] = t
  }
  return copyArr
}
// 去抖函数（在某一个delay时间之内，多次触发函数，只执行一次）
export function debounce(func: () => void, delay: number): () => void {
  let timer: number

  return function(this: void, ...args: any) {
    if (timer) {
      clearTimeout(timer)
    }
    timer = setTimeout(() => {
      func.apply(this, args)
    }, delay)
  }
}
