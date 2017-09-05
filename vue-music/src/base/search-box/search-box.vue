<template>
  <div class="search-box">
    <i class="icon-search"></i>
    <input ref="query" class="box" :placeholder="placeHolder" v-model="query" @click.stop.prevent="">
    <i class="icon-dismiss" v-show="query" @click.stop.prevent="clear"></i>
  </div>
</template>

<script type="text/ecmascript-6">
  import {debounce} from 'common/js/util'

  export default {
    props: {
      placeHolder: {
        type: String,
        default: "搜索歌曲、歌手"
      }
    },
    data() {
      return {
        query: ''
      }
    },
    methods: {
      clear() {
        this.query = '';
      },
      setQuery(query) {
        this.query = query;
      },
      blur(){
        this.$refs.query.blur();
      }
    },
    created() {
      // 去抖函数，减少输入查询次数，降低服务器压力
      this.$watch('query', debounce((newQuery) => {
        this.$emit('query', newQuery);
      }, 200))
    }
  }
</script>

<style lang="stylus" rel="stylesheet/stylus" scoped>
  @import "~common/stylus/variable"

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
