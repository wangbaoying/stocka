define("utils/promise", ["require", "exports", "module"], function (require, exports, module) {

  var promise1 = function (p_func, list, idx, ret, d) {
    if (idx === undefined) {
      idx = 0;
    }
    if (ret === undefined) {
      ret = [];
    }
    if (d === undefined) {
      d = new $.Deferred;
    }
    //
    if (idx >= list.length) {
      d.resolve(ret);
      return d;
    }
    // 执行单个任务
    d.notify(((idx + 1) / list.length), list[idx]);
    p_func.apply(null, [idx, list[idx]]).then(function () {
      var args = Array.prototype.slice.call(arguments, 0); // convert to a javascript array.
      ret.push(args);
      d.notify(((idx + 1) / list.length), list[idx], args);
      promise1(p_func, list, idx + 1, ret, d);
    });
    return d;
  };

  exports.promise1 = promise1;
});


