
var express = require('express');
var config = require('./config/index');
var axios = require('axios');

var app = express();

var apiRoutes = express.Router();

apiRoutes.get('/getDiscList', function (req, res) {
  var url = 'https://c.y.qq.com/splcloud/fcgi-bin/fcg_get_diss_by_tag.fcg';

  return axios.get(url, {
    //修改是headers 不是 header~！！！！
    headers: {
      referer: "https://c.y.qq.com",
      host: "c.y.qq.com"
    },
    params: req.query
  }).then((rsp) => {
    res.json(rsp.data);
  }).catch((e) => {
    console.log(e);
  })
});

apiRoutes.get('/lyric', function (req, res) {
  var url = 'https://c.y.qq.com/lyric/fcgi-bin/fcg_query_lyric_new.fcg';

  return axios.get(url, {
    //修改是headers 不是 header~！！！！
    headers: {
      referer: "https://c.y.qq.com",
      host: "c.y.qq.com"
    },
    params: req.query
  }).then((rsp) => {
    // res.json(rsp.data);
    var ret = rsp.data;
    if (typeof ret === 'string') {
      // 以任意的单词字母数字开头，挨着有括号开始和括号结尾。括号内部(),标记一个子表达式的开头和结尾,做分组使用。{ }限定字符的开始和结束。 [] 标记一个中括号表达式的开始和结束，此处仅仅是想使用^在中括号中的作用。[]号里面的^表示不接受该字符集合。 + 匹配一个或多个
      var reg = /^\w+\(({[^()]+})\)$/;
      var matches = ret.match(reg);
      if (matches) {
        ret = JSON.parse(matches[1]);
      }
    }
    res.json(ret);
  }).catch((e) => {
    console.log(e);
  })
});

app.use('/api', apiRoutes);

app.use(express.static('./dist'));

var port = process.env.PORT || config.build.port;

module.exports = app.listen(port, function (err) {
  if (err) {
    console.log(err);
    return;
  }
  console.log('Listening at http://localhost:' + port + '\n');
});
