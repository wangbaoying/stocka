define("fetch/index", ["require", "exports", "module"], function (require, exports, module) {
// @@@@@@@@@@@@@@@@@@@@@@@@@@

  /**
   * 这个包下的程序 负责 获取数据 并保存到 websqldb中
   */

  var base = require('base'),
    daily = require('daily')

  module.exports = {
    base: base,
    daily: daily
  };

// @@@@@@@@@@@@@@@@@@@@@@@@@@
});

define("fetch", ["require", "exports", "module"], function (require, exports, module) {
  module.exports = require('fetch/index');
});
