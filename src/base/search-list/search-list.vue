<template>
  <div class="search-list">
    <transition-group tag="ul" name="list">
      <li :key="item" @click="selectItem(item)" class="search-item" v-for="item in searches">
        <span class="text">{{item}}</span>
        <span class="icon" @click.stop="deleteOne(item)">
          <i class="icon-delete"></i>
        </span>
      </li>
    </transition-group>
  </div>
</template>

<script lang="ts">
import { Vue, Component, Prop, Emit } from 'vue-property-decorator'

@Component
export default class SearchList extends Vue {
  @Prop({ default: () => [], type: Array }) public searches!: string[]

  @Emit('select')
  public selectItem(item: string) {
    return item
  }

  @Emit('delete')
  public deleteOne(item: string) {
    return item
  }
}
</script>

<style lang="stylus" rel="stylesheet/stylus" scoped>
  @import "~@/common/stylus/variable"

  .search-list
    .search-item
      display: flex
      align-items: center
      height: 40px
      overflow: hidden
      &.list-enter-active, &.list-leave-active
        transition: all 0.1s
      &.list-enter, &.list-leave-to
        height: 0
      .text
        flex: 1
        color: $color-text-l
      .icon
        extend-click()
        .icon-delete
          font-size: $font-size-small
          color: $color-text-d
</style>
