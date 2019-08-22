<template>
  <ul class="switches">
    <li class="switch-item" v-for="(item,index) in switches"
        :class="{'active':currentIndex === index}" @click="switchItem(index)" :key="index">
      <span>{{item.name}}</span>
    </li>
  </ul>
</template>

<script lang="ts">
import { Vue, Component, Prop, Emit } from 'vue-property-decorator'

@Component
export default class Switches extends Vue {
  @Prop({ default: () => [], type: Array }) public switches!: object[]
  @Prop({ default: 0, type: Number }) public currentIndex!: number

  @Emit('switch')
  public switchItem(index: number) {
    return index
  }
}
</script>

<style scoped lang="stylus" rel="stylesheet/stylus">
  @import "~@/common/stylus/variable"

  .switches
    display: flex
    align-items: center
    width: 240px
    margin: 0 auto
    border: 1px solid $color-highlight-background
    border-radius: 5px
    .switch-item
      flex: 1
      padding: 8px
      text-align: center
      font-size: $font-size-medium
      color: $color-text-d
      &.active
        background: $color-highlight-background
        color: $color-text
</style>
