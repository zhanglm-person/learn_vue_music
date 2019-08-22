<template>
  <div class="search-box">
    <i class="icon-search"></i>
    <input ref="query" class="box" :placeholder="placeHolder" v-model="query" @click.stop.prevent="">
    <i class="icon-dismiss" v-show="query" @click.stop.prevent="clear"></i>
  </div>
</template>

<script lang="ts">
import { Vue, Component, Prop, Emit, Watch } from 'vue-property-decorator'

@Component({
  name: 'SearchBox',
})
export default class SearchBox extends Vue {
  @Prop({default: '搜索歌曲、歌手', type: String}) public placeHolder!: string

  public query: string = ''
  public $refs!: {
    query: HTMLInputElement,
  }

  public clear(): void {
    this.query = ''
  }

  public setQuery(query: string): void {
    this.query = query
  }

  /**
   * 在滚动之前，隐藏手机端的输入键盘
   * 只有在手机端才有效
   */
  public blur(): void {
    this.$refs.query.blur()
  }

  @Emit('query')
  @Watch('query')
  public onQueryChange(newQuery: string) {
    // this.$emit('query', newQuery)
  }
}
</script>

<style lang="stylus" rel="stylesheet/stylus" scoped>
  @import "~@/common/stylus/variable"

  .search-box
    display: flex
    align-items: center
    box-sizing: border-box
    width: 100%
    padding: 0 6px
    height: 40px
    background: $color-highlight-background
    border-radius: 6px
    .icon-search
      font-size: 24px
      color: $color-background
    .box
      flex: 1
      margin: 0 5px
      line-height: 18px
      background: $color-highlight-background
      color: $color-text
      font-size: $font-size-medium
      &::placeholder
        color: $color-text-d
    .icon-dismiss
      font-size: 16px
      color: $color-background
</style>
