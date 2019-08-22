import * as types from '../../store/mutations-type'
import { Getter, Mutation, Action } from 'vuex-class'

import { playMode } from '@/common/js/config'
import { shuffle } from '@/common/js/util'

import { Vue, Component, Watch } from 'vue-property-decorator'
import Song from '@/common/js/song'

@Component({})
export class PlaylistMixin extends Vue {
  @Getter public playlist!: Song[]

  public mounted() {
    this.handlePlaylist(this.playlist)
  }

  public activated() {
    this.handlePlaylist(this.playlist)
  }

  public handlePlaylist(playlist?: Song[]) {
    throw new Error('component must implement handlePlaylist method')
  }

  @Watch('playlist')
  public onPlaylistChange(newPlayList: Song[]) {
    this.handlePlaylist(newPlayList)
  }
}

@Component({})
export class PlayerMixin extends Vue {
  @Getter public sequencelist!: Song[]
  @Getter public playlist!: Song[]
  @Getter public currentSong!: Song
  @Getter public mode!: number
  @Getter public favoriteList!: Song[]

  @Mutation(types.SET_PLAYING_STATE) public setPlayingState!: (flag: boolean) => void
  @Mutation(types.SET_MODE) public setMode!: (mode: number) => void
  @Mutation(types.SET_PLAYLIST) public setPlaylist!: (list: Song[]) => void
  @Mutation(types.SET_CURRENTINDEX) public setCurrentIndex!: (index: number) => void

  @Action public deleteFavoriteList!: (song: Song) => void
  @Action public saveFavoriteList!: (song: Song) => void

  get iconMode() {
    return this.mode === playMode.sequence
      ? 'icon-sequence'
      : this.mode === playMode.loop
      ? 'icon-loop'
      : 'icon-random'
  }

  public changeMode() {
    // 切换播放模式
    const mode = (this.mode + 1) % 3
    this.setMode(mode)
    let list = null
    // 当播放模式切换到随机播放的时候，打乱playlist（洗牌函数）
    if (mode === playMode.random) {
      list = shuffle(this.sequencelist)
    } else {
      list = this.sequencelist
    }
    // 随机播放切换playlist的时候，不能切换当前播放歌曲，所以去新的播放列表找到当前播放歌曲，设置currentIndex
    this.resetCurrentIndex(list)
    this.setPlaylist(list)
  }

  public resetCurrentIndex(list: Song[]) {
    // findIndex是ES6提供给数组的函数->寻找元素，如果匹配到元素就返回当前元素的index，没有返回-1
    const index = list.findIndex((item) => {
      return item.id === this.currentSong.id
    })
    this.setCurrentIndex(index)
  }
  public toggleFavorite(song: Song) {
    if (this.isFavorite(song)) {
      this.deleteFavoriteList(song)
    } else {
      this.saveFavoriteList(song)
    }
  }
  public getFavoriteIcon(song: Song) {
    if (this.isFavorite(song)) {
      return 'icon-favorite'
    }
    return 'icon-not-favorite'
  }
  public isFavorite(song: Song) { // 判断是不是收藏的歌曲
    const index = this.favoriteList.findIndex((item) => {
      return item.id === song.id
    })
    return index > -1 // 是收藏的歌曲就会大于-1，否则就是false
  }
}

@Component({})
export class SearchMixin extends Vue {
  @Getter public searchHistory!: []

  @Action public saveSearchHistory!: (query: string) => void
  @Action public deleteSearchHistory!: () => void

  public query: string = ''
  // 这里设置refreshDelay，是因为避免用户操作动画之后，scroll组件刷新已经完成。所以延长scroll组件监听到data变化后的刷新时间。
  public refreshDelay: number = 120
  public $refs: any // mixin 中的 $refs 会和组件页面中的 $refs 冲突

  public onQueryChange(query: string) {
    this.query = query
  }
  public blurInput() {
    this.$refs.searchBox.blur()
  }
  public addQuery(query: string) {
    this.$refs.searchBox.setQuery(query)
  }
  public saveSearch() {
    this.saveSearchHistory(this.query)
  }
}
