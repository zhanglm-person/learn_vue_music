<template>
  <div class="singer">
    <list-view :data="singers" @select="selectSinger"></list-view>
    <keep-alive>
      <router-view></router-view>
    </keep-alive>
  </div>
</template>

<script type="text/ecmascript-6">
  import {getSingerList} from 'api/singer'
  import {ERR_OK} from 'api/config'
  import Singer from 'common/js/singer'
  import ListView from 'base/listView/listView'

  import {mapMutations} from 'vuex'

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
      selectSinger(singer){
        this.$router.push({
          path: `/singer/${singer.id}`
        });
        this.setSinger(singer);
      },
      _getSingerList(){
        getSingerList().then((rsp) => {
          if (rsp.code === ERR_OK) {
            this.singers = this._normallizeSinger(rsp.data.list)
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
          //每一个歌手的Findex是她的首字母大写，如果map中没有当前首字母属性，就添加。有就直接push
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

        //有序列表，处理map，map当前已经是含有所有歌手首字母对象的对象集合
        let hot = [];
        let ret = [];
        for (let key in map) {
          let val = map[key];
          //console.log(val)
          if (val.title.match(/[a-zA-Z]/)) {  //如果title是字母的话，推送到ret里面
            ret.push(val);
          } else if (val.title === HOT_NAME) {//热门的单独分开
            hot.push(val);
          }
        }
        ret.sort((a, b) => {
          return a.title.charCodeAt(0) - b.title.charCodeAt(0)//对于字母的数组，进行排序，是根据字母的编码值从小到大排序
        });
        //console.log(hot.concat(ret))
        return hot.concat(ret);//返回热门加上ret字母数组
      },
      ...mapMutations({
        setSinger:"SET_SINGER"
      })
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
