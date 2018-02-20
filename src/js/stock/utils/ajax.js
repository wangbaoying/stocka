define("utils/ajax", ["require", "exports", "module"], function (require, exports, module) {

  var $ = require('jquery');
  var _ = require('lodash');

  var ajax_get = function (url) {
    // TODO 需要具有,自动重试功能
    return $.ajax({
      url: url,
      type: "GET",
      dataType: 'text'
    }).progress(function(){
      console.log("ajax_get...", arguments);
    })
  };

  exports.do_get = ajax_get;
});


