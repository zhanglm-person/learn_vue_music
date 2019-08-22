declare module 'lyric-parser' {
  export default class Lyric {
    public lrc: string
    public tags: object
    public lines: string[]
    public handler: () => void
    public state: number
    public curLine: number
    constructor(lrc: string, handler: (params: any) => void)

    public play(startTime?: number, skipLast?: boolean): void
    public togglePlay(): void
    public stop(): void
    public seek(offset: number): void
  }
}

declare module 'create-keyframe-animation' {
  interface RegisterOptions {
    name: string
    animation: object
    presets: {
      duration: number
      easing: string,
    }
  }

  function registerAnimation(options: RegisterOptions): void
  function runAnimation(el: Element, name: string, done: () => void): void
  function unregisterAnimation(name: string): void
}

declare module 'good-storage' {
  function get(key: string, def: any): any
  function set(key: string, val: any): void
  function remove(key: string): void
}
