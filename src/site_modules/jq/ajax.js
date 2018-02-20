var $ = require('jquery');

/**
 * jQuery.ajax功能的包装,扩展了一些功能。
 *
 * 1, dataType支持binary。可以下载blob类型数据。
 * 2, 返回的Deferred具有'上传下载进度通知'功能。
 *
 * @param options
 * @returns {*}
 */
var _ajax = function (options) {
  var deferred = new $.Deferred();
  //
  var opts = $.extend({
    xhr: function () {
      var xhr = $.ajaxSettings.xhr();
      xhr.addEventListener && xhr.addEventListener("progress", function (evt) {
        deferred.notify('download', evt);
      }, false);
      //
      if (typeof xhr.upload == "object") {
        xhr.upload.addEventListener && xhr.upload.addEventListener("progress", function (evt) {
          deferred.notify('upload', evt);
        }, false);
      }
      //
      if (opts.dataType === 'binary') {
        xhr.responseType = opts.responseType || 'blob'; // or arraybuffer
      }
      return xhr;
    }
  }, options);
  //
  var v = $.ajax(opts);
  v.promise()
    .progress(deferred.notify)
    .done(deferred.resolve)
    .fail(deferred.reject);
  //
  return $.extend(v, {progress: deferred.progress});
};


module.exports = _ajax;