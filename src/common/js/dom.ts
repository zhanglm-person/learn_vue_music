export function hasClass(el: Element, className: string) {
  // (^|\\s) -> 开头 或者 是前面有空白字符
  // (\\s|$) -> 后面是空白字符 或者 直接结尾
  const reg = new RegExp('(^|\\s)' + className + '(\\s|$)')
  return reg.test(el.className)
}

export function addClass(el: Element, className: string) {
  if (hasClass(el, className)) {
    return
  }

  const newClass = el.className.split(' ')
  newClass.push(className)
  el.className = newClass.join(' ')
}

export function getData(el: Element, name: string): string {
  const prefix = 'data-'
  return el.getAttribute(prefix + name) || ''
}
// 浏览器的能力检测
const elementStyle = document.createElement('div').style

const vendor = (() => {
  const transformNames: any = {
    webkit: 'webkitTransform',
    Moz: 'MozTransform',
    O: 'OTransform',
    ms: 'msTransform',
    standard: 'transform',
  }

  for (const key in transformNames) {
    // 判断 元素 的 transform 是哪种支持的属性 不是undefined 就返回浏览器前缀
    if (elementStyle[transformNames[key]] !== undefined) {
      return key
    }
  }
  return false
})()

export function prefixStyle(style: string): string {
  if (vendor === false) {
    return style
  }
  if (vendor === 'standard') {
    return style
  }
  // 拼接上 浏览器前缀 首字母大写 再加上后面的名字
  return vendor + style.charAt(0).toUpperCase() + style.substr(1)
}
