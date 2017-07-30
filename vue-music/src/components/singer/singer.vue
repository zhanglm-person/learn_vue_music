<template>
  <div class="singer">
    <list-view :data="singers"></list-view>
  </div>
</template>

<script type="text/ecmascript-6">
  import {getSingerList} from 'api/singer'
  import {ERR_OK} from 'api/config'
  import Singer from 'common/js/singer'
  import ListView from 'base/listView/listView'

  const HOT_NAME = "热门";
  const HOT_SINGER_LENGTH = 10;
  export default{
    components: {
      ListView
    },
    data(){
      return {
        singers: []
      }
    },
    created(){
      this._getSingerList();
    },
    methods: {
      _getSingerList(){
        getSingerList().then((rsp) => {
          if (rsp.code === ERR_OK) {
            //console.log(rsp);
            //this.singers = rsp.data.list;
            this.singers = this._normallizeSinger(rsp.data.list)
            //console.log(this.singers)
            // console.log(this._normallizeSinger(this.singers))
          }
        })
      },
      _normallizeSinger(list){
        let map = {
          hot: {
            title: HOT_NAME,
            items: []
          }
        };
        list.forEach((item, index) => {
          if (index < HOT_SINGER_LENGTH) {
            map.hot.items.push(new Singer({
              id: item.Fsinger_mid,
              name: item.Fsinger_name
            }))
          }
          const key = item.Findex;
          if (!map[key]) {
            map[key] = {
              title: key,
              items: []
            }
          }
          map[key].items.push(new Singer({
            id: item.Fsinger_mid,
            name: item.Fsinger_name
          }))
        });
        //console.log(map);
        //有序列表，处理map
        let hot = [];
        let ret = [];
        for (let key in map) {
          let val = map[key];
          //console.log(val)
          if (val.title.match(/[a-zA-Z]/)) {
            ret.push(val);
          } else if (val.title === HOT_NAME) {
            hot.push(val);
          }
        }
        ret.sort((a, b) => {
          return a.title.charCodeAt(0) - b.title.charCodeAt(0)
        });

        return hot.concat(ret);
      }
    }
  }
</script>

<style lang="stylus" rel="stylesheet/stylus">
  .singer
    position fixed
    top 88px
    width 100%
    bottom 0
</style>
