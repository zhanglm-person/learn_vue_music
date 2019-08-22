<template>
  <div id="app">
    <m-head></m-head>
    <tab></tab>
    <keep-alive>
      <router-view></router-view>
    </keep-alive>
    <player></player>
  </div>
</template>

<script lang="ts">
import { Vue, Component } from 'vue-property-decorator'
import MHead from '@/components/m-header/header.vue'
import Tab from '@/components/tab/tab.vue'
import Player from '@/views/player/player.vue'

@Component({
  components: {
    MHead,
    Tab,
    Player,
  },
})
export default class App extends Vue {}
</script>

<style>

</style>
