define("utils/ajax", ["require", "exports", "module"], function (require, exports, module) {

  var $ = require('jquery');
  var _ = require('lodash');

  var ajax_get = function (url, opts) {
    // TODO 需要具有,自动重试功能
    var oopts = $.extend({
      url: url,
      type: "GET",
      dataType: 'text'
    }, opts);
    return $.ajax(oopts).progress(function () {
      console.log("ajax_get...", arguments);
    })
  };

  var ajax_get_a = function (url, encoding) {

    // 修改了 jQery
    // if (xhr.responseType === "text" && typeof xhr.responseText === "string") {
    var xhr = $.ajaxSettings.xhr();
    return ajax_get(url, {
      dataType: "binary",
      processData: false,
      xhr: function () {
        xhr.responseType = 'arraybuffer'; // blob or arraybuffer
        return xhr;
      }
    }).then(function (e, status, $xhr) {
      //
      // https://stackoverflow.com/questions/17211780/how-do-i-convert-gbk-to-utf8-with-pure-javascript
      var dataView = new DataView(xhr.response);
      var decoder = new TextDecoder(encoding);
      var decodedString = decoder.decode(dataView);
      return decodedString;
    });
  };

  exports.do_get = ajax_get;
  exports.do_get_a = ajax_get_a;
});


