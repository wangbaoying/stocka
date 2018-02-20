var $ = require('jquery');

var Deferred = $.Deferred,
  when = $.when,
  /**
   * 发生错误 & 满足条件时, 自动重试.
   *
   *
   * @param actual_promise_func
   * @param retries
   * @param condi
   * @returns {Function}
   */
  promise_retry = function (actual_promise_func, retries, condi) {
    return function () {
      var aarguments = Array.prototype.slice.call(arguments, 0); // convert to a javascript array.
      var deferred = new $.Deferred();
      //
      var re_call = function (re_args, call_times) {
        actual_promise_func.apply(null, re_args).progress(deferred.notify).then(function () {
          var aarguments = Array.prototype.slice.call(arguments, 0); // convert to a javascript array.
          deferred.resolve.apply(deferred, aarguments);
        }).fail(function () {
          var aarguments = Array.prototype.slice.call(arguments, 0); // convert to a javascript array.
          if (!condi || (typeof condi === 'function' && condi.apply(this, aarguments))) {  // 只有在已知的错误时,才自动重试
            if (call_times < retries) {   // 重试次数
              setTimeout(function () {    // 延迟重试
                re_call(re_args, call_times + 1);
              }, 100);   //
              return;
            }
          }
          deferred.reject.apply(deferred, aarguments);
        });
      };
      re_call(aarguments, 1);
      return deferred.promise();
    };
  },
  /**
   * 将普通函数转换成promise函数.
   *
   * @param actual_func
   * @returns {Function}
   */
  promisify = function (actual_func, scope) {
    return $.extend(function promisify_func() {
      var aarguments = Array.prototype.slice.call(arguments, 0); // convert to a javascript array.
      var deferred = new $.Deferred();
      setTimeout(function () {
        // try {
        var ret = actual_func.apply(scope, aarguments);
        if (ret === undefined) {
          deferred.resolve();
        } else if (ret instanceof Promise) {
          ret.then(deferred.resolve).catch(deferred.reject);
        } else if (typeof ret.then === 'function') {  // or thenable
          ret.then(deferred.resolve, deferred.reject, deferred.notify)
        } else {   // actual JS function and return normal result.
          deferred.resolve(ret);
        }
        // } catch (err) {  // ???? 这里的try...catch会让一些错误不能正确的抛出, 屏蔽会有其它影响吗 ????
        //   deferred.reject(err);
        // }
      }, 0);
      return deferred.promise();
    }, actual_func);
  },
  toDeferred = function (esPromise) {
    var deferred = new $.Deferred();
    esPromise.then(deferred.resolve)
      .catch(deferred.reject);
    return deferred.promise();
  },
  /**
   *
   */
  nextTick = function (actual_func) {
    setTimeout(actual_func, 0)
  },
  /**
   *
   *
   * @param actual_func
   * @param key
   * @returns {Function}
   */
  promise_cache = function (actual_func, key) {
    // 使用localStorage缓存 Deferred函数 结果
    var storage = {};
    return function () {
      var aarguments = Array.prototype.slice.call(arguments, 0); // convert to a javascript array.
      //if (true) {
      //  // disable cache. aways call actual_func.
      //  return actual_func.apply(null, aarguments);
      //}

      // TODO 决定使用什么 作为存储介质。indexDB or memory?
      // if (!window.localStorage) {
      //   // console.log('$rpc_action_c', 'This browser does NOT support localStorage');
      //   return actual_func.apply(null, aarguments);
      // }
      var storage = window.localStorage,
        storage_key = 'ls_cached_func',
        expire_time = 365 * 24 * 60 * 60 * 1000,       // 365天
        now_ts = Date.parse(new Date());
      //
      var cached_result = storage.getItem(storage_key);
      if (!cached_result) {
        cached_result = "{}";
        storage.setItem(storage_key, cached_result);
      }
      var rpc_cache_obj = JSON.parse(cached_result);
      //

      // salt for rpc sign
      var salt = []; // [$.cookie('sid'), $.cookie('sid_Client'), __sfdcSessionId];
      var rpc_full_sign = md5(JSON.stringify(salt.concat(aarguments)));   // 签名.
      // 调用远程方法并缓存到localStorage
      var invoke_rpc_and_cache = function () {
        return actual_func.apply(null, aarguments).done(function (call_result) {
          // 缓存远程调用结果
          rpc_cache_obj[rpc_full_sign] = {'ts': now_ts, 'result': call_result};
          storage.setItem(storage_key, JSON.stringify(rpc_cache_obj));
        });
      };
      // localStorage没有缓存结果时，则调用远程方法，并缓存其结果。


      if (!rpc_cache_obj.hasOwnProperty(rpc_full_sign)) {
        // console.log('rpc_action_c not exists in cache.', rpc_full_sign);
        return invoke_rpc_and_cache();
      }
      // 如果超过期限时(过期)，则放弃缓存命中结果，返回远程方法结果
      var cached_ts = rpc_cache_obj[rpc_full_sign]['ts'];
      if (now_ts - cached_ts > expire_time) {  //
        // console.log('rpc_action_c cached result was expired.', rpc_full_sign);
        return invoke_rpc_and_cache();
      }
      // 缓存命中
      var d = new $.Deferred;
      setTimeout(function () {
        // console.log('rpc_action_c hitted.', rpc_full_sign);
        d.resolve(rpc_cache_obj[rpc_full_sign]['result']);
      }, 100);
      return d;
    };
  },
  promise_remembered = function (actual_func, scope) {
    /**
     * 记住 deferred 的结果，下次调用时，不真正调用而是返回第一次的结果，除非强制重新执行。
     * ``` javascript
     * var get_roles = deferred.remembered(ajax)({
     *   url: "https://mosemp.us.oracle.com/mossp/mosFwkResources/1.0/user/roles",
     *   contentType: 'application/json',
     *   dataType: 'json',
     *   cache: false
     * });
     * ```
     * @param func
     * @returns {Function}
     * @private
     */
    var _remembered = function (func) {
      var mem_deferred = undefined;
      return function (force) {
        if (mem_deferred === undefined || force) {
          mem_deferred = func();
        }
        return mem_deferred;
      }
    };

    return function () {
      var aarguments = Array.prototype.slice.call(arguments, 0); // convert to a javascript array
      return _remembered(promisify(function () {
        return actual_func.apply(scope, aarguments);
      }));
    }
  },
  promise_while = function (actual_func, comp_func, _sleep, scope) {
    /**
     * 循环执行 actual_func，直到条件不等于true
     * ``` javascript
     * var get_roles = deferred.while(ajax)({
     *   url: "https://mosemp.us.oracle.com/mossp/mosFwkResources/1.0/user/roles",
     *   contentType: 'application/json',
     *   dataType: 'json',
     *   cache: false
     * });
     * ```
     * @param func
     * @returns {Function}
     * @private
     */
    var actual_promise_func = promisify(actual_func, scope);
    return function () {
      var aarguments = Array.prototype.slice.call(arguments, 0); // convert to a javascript array.
      var deferred = new $.Deferred();
      //
      var re_call = function (re_args, times) {
        actual_promise_func.apply(scope, re_args).progress(deferred.notify).done(function (ret) {
          // var aarguments = Array.prototype.slice.call(arguments, 0); // convert to a javascript array.
          if (comp_func(ret, times)) {
            if (_sleep === undefined) {
              re_call(re_args, times + 1);
            } else {
              setTimeout(function () {
                re_call(re_args, times + 1);
              }, _sleep)
            }
          } else {
            deferred.resolve(times);
          }
        }).fail(deferred.reject);
      };
      re_call(aarguments, 1);
      return deferred.promise();
    };
  },
  promise_reject = function () {
    var aarguments = Array.prototype.slice.call(arguments, 0); // convert to a javascript array.
    var deferred = new $.Deferred();
    setTimeout(function () {
      deferred.reject.apply(deferred, aarguments);
    }, 0);
    return deferred.promise();
  },
  /**
   * 逐个执行 列表中的任务或数据。
   *
   * 这个方法的实现与promise_retry不同, 没有使用递归。
   * 递归也可以实现类似的功能。
   *
   * 递归貌似会消耗更多的内存。
   *
   * @param list 任务/数据列表, 这个列表会逐个被func_to_apply函数执行。
   * @param func_to_apply
   * @param return_result_as_list 标记是否以列表形式返回, 每个func_to_apply的运行结果。
   *                              缺省时不返回。
   *                              保留每个运行结果, 可能(内存不被回收)消耗大量的内存,
   *                              TODO 即使不返回结果, 内存也不一定能够被及时回收, 因为Deferred中可能会保存着他们的引用, 需要测试。
   * @returns {*}
   */
  promise_each = function (list, func_to_apply, return_result_as_list) {
    var deferred = new Deferred(), done_count = 0;
    var p_func_to_apply = promisify((func_to_apply || function (item, idx, items) { // default handler
      return item;
    }).bind(deferred));
    //
    var _closure_per_item = function (_previous, _list, _i) {
      //
      var _pre_notify = function () {
        var args = Array.prototype.slice.call(arguments, 0); // convert to a javascript array.
        return promisify(function () {
          deferred.notify.apply(deferred, [
            'start',                    // status
            done_count,                 // done count
            _list[_i],                  // item
            _i,                         // idx
            _list                       // items
          ]);
          return when.apply(deferred, args);
        }, deferred)();
      };
      //
      var _applying_notify = function (ret_list) {
        var _defer_applied = p_func_to_apply(_list[_i], _i, _list);
        deferred.notify(
          'prog',                     // status
          done_count,            // done count
          _list[_i],                  // item
          _i,                         // idx
          _list,                      // items
          _defer_applied              //
        );
        //
        return _defer_applied.then(function () {
          var args = Array.prototype.slice.call(arguments, 0); // convert to a javascript array.
          deferred.notify.apply(deferred, [
            'done',                     // status
            done_count++,               // done count, how many task have done.
            _list[_i],                  // item
            _i,                         // idx
            _list,                      // items
          ].concat(args));
          //
          if (ret_list) {  // 保存结果
            ret_list.push(args)
            return when(ret_list)
          } else {
            return when();
          }
        }, function () {
          var args = Array.prototype.slice.call(arguments, 0); // convert to a javascript array.
          deferred.notify.apply(deferred, [
            'fail',                     // status
            done_count,            // done count
            _list[_i],                  // item
            _i,                         // idx
            _list,                      // items
          ].concat(args));
        });
      };
      //
      return _previous.then(_pre_notify).then(_applying_notify);
    }
    //
    var last = return_result_as_list ? when([]) : when();  //
    for (var i = 0; i < list.length; i++) {
      last = _closure_per_item(last, list, i);
    }
    //
    last.then(deferred.resolve, deferred.reject);
    return deferred.promise();
  },
  /**
   * 与each类似, 但提供了多个任务并行执行的功能。
   *
   * @param parallel 并行数量
   * @param list
   * @param func_to_apply
   * @param return_result_as_list
   */
  promise_parallel = function (parallel, list, func_to_apply, return_result_as_list) {
    // TODO
  },
  /**
   * 给定一个func列表, 按照顺序管道式执行.
   * 将前一个函数的结果作为后一个函数的参数,
   * 并返回最后一个函数执行的结果.
   *
   * @param func_list  函数列表
   * @param 1..x       初始参数(第一个函数的参数)
   * @returns {*}
   */
  promise_pipe = function (func_list) {
    var args = Array.prototype.slice.call(arguments, 1); // convert to a javascript array.
    var deferred = new Deferred(), done_count = 0;
    //
    var _closure_per_item = function (_previous, _list, _i) {
      //
      var _pre_notify = function () {
        var args = Array.prototype.slice.call(arguments, 0); // convert to a javascript array.
        return promisify(function () {
          deferred.notify.apply(deferred, [
            'start',                    // status
            done_count,                 // done count
            _list[_i],                  // item
            _i,                         // idx
            _list                       // items
          ]);
          return when.apply(deferred, args);
        }, deferred)();
      };
      //
      var _applying_notify = function () {
        var args = Array.prototype.slice.call(arguments, 0);
        var p_func_to_apply = promisify(_list[_i], deferred);
        var _defer_applied = p_func_to_apply.apply(deferred, args);
        deferred.notify(
          'prog',                     // status
          done_count,            // done count
          _list[_i],                  // item
          _i,                         // idx
          _list,                      // items
          _defer_applied              //
        );
        //
        return _defer_applied.then(function () {
          var args = Array.prototype.slice.call(arguments, 0); // convert to a javascript array.
          deferred.notify.apply(deferred, [
            'done',                     // status
            done_count++,               // done count, how many task have done.
            _list[_i],                  // item
            _i,                         // idx
            _list,                      // items
          ].concat(args));
          //
          return when.apply(deferred, args)
        }, function () {
          var args = Array.prototype.slice.call(arguments, 0); // convert to a javascript array.
          deferred.notify.apply(deferred, [
            'fail',                     // status
            done_count,            // done count
            _list[_i],                  // item
            _i,                         // idx
            _list,                      // items
          ].concat(args));
        });
      };
      //
      return _previous.then(_pre_notify).then(_applying_notify)
    }
    //
    var last = when.apply(deferred, args);  // 第一个函数的参数
    for (var i = 0; i < func_list.length; i++) {
      last = _closure_per_item(last, func_list, i);
    }
    //
    last.then(deferred.resolve, deferred.reject);
    return deferred.promise();
  },
  /**
   * 返回队列对象类.
   *
   * @param parallel 并行数量
   */
  promise_queue = function promise_queue(parallel) {

    var dQueueClass = function () {   // class

      var _uuid = function (len, radix) {
        var chars = '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz'.split(''),
          uuid = [], i;
        radix = radix || chars.length;

        if (len) {
          // Compact form
          for (i = 0; i < len; i++) uuid[i] = chars[0 | Math.random() * radix];
        } else {
          // rfc4122, version 4 form
          var r;

          // rfc4122 requires these characters
          uuid[8] = uuid[13] = uuid[18] = uuid[23] = '-';
          uuid[14] = '4';

          // Fill in random data.  At i==19 set the high bits of clock sequence as
          // per rfc4122, sec. 4.1.5
          for (i = 0; i < 36; i++) {
            if (!uuid[i]) {
              r = 0 | Math.random() * 16;
              uuid[i] = chars[(i == 19) ? (r & 0x3) | 0x8 : r];
            }
          }
        }
        return uuid.join('');
      };

      /**
       *
       * @param parallel 并行数量
       */
      function construct(parallel) {   // constructor
        this.defer = new Deferred();
        this.q = [];
        this.rq = [];
        var _this_binds = ['progress', 'polling', 'enqueue', 'dequeue', 'clear'];
        for (var i = 0; i < _this_binds.length; i++) {
          var method = _this_binds[i];
          this[method] = this[method].bind(this);
        }
      }

      /**
       *
       * @returns {dQueueClass}
       */
      construct.prototype.progress = function progress() {
        var aarguments = Array.prototype.slice.call(arguments, 0); // convert to a javascript array.
        this.defer.progress.apply(this.defer, aarguments);
        return this;
      };

      construct.prototype.polling = function polling() {
        var self = this;
        if (self.q.length <= 0) {
          if (self.rq.length === 0) {
            self.defer.notify('empty');
          } else {
            self.defer.notify('nomore');
          }
          return;
        }
        if (self.rq.length >= parallel) {
          self.defer.notify('maxsize'); //, self.rq.length);
          return;
        }
        //
        var xp = self.q.shift();
        self.rq.push(xp);
        var p_func_to_apply = xp.to_apply;
        var _pre_notify = function () {
          p_func_to_apply.queue_start_at = (new Date()).valueOf();    // 时间戳
          p_func_to_apply.queue_id = xp.queue_id;
          xp.notify.apply(xp, [
            'start',                     // status
            p_func_to_apply
          ]);
          return when();
        };
        var _applying_notify = function () {
          var _defer_applied = p_func_to_apply();

          xp.notify.apply(xp, [
            'prog',                     // status
            p_func_to_apply,            //
            _defer_applied              //
          ]);
          //
          return _defer_applied.then(function () {
            p_func_to_apply.queue_done_at = (new Date()).valueOf();  // 时间戳
            var args = Array.prototype.slice.call(arguments, 0); // convert to a javascript array.
            xp.notify.apply(xp, [
              'done',                     // status
              p_func_to_apply
            ].concat(args));
            self.dequeue(xp);
            xp.resolve.apply(xp, args);
          }, function () {
            p_func_to_apply.queue_fail_at = (new Date()).valueOf();  // 时间戳
            var args = Array.prototype.slice.call(arguments, 0); // convert to a javascript array.
            xp.notify.apply(xp, [
              'fail',                     // status
              p_func_to_apply,
            ].concat(args));
            self.dequeue(xp);
            xp.reject.apply(xp, args);
          }).always(function () {
            // 轮训
            setTimeout(function () {
              self.polling();
            }, 0);
          });
        };
        // 不捕捉结果.
        _pre_notify().then(_applying_notify);
        // 轮训
        setTimeout(function () {
          self.polling();
        }, 0);
      };

      construct.prototype.enqueue = function enqueue(func_to_apply, id) {
        var self = this;
        var p_func_to_apply = promisify(func_to_apply, self);
        var _find = function (rq, q, queue_id) {
          var _com = function (xp) {
            var n_xp = new Deferred();
            xp.then(n_xp.resolve, xp.reject, function () {
              var args = Array.prototype.slice.call(arguments, 0); // convert to a javascript array.
              // 替换第二个参数
              args.splice(1, 1, $.extend(p_func_to_apply, {
                queue_id: args[1].queue_id,
                queue_start_at: args[1].queue_start_at,
                queue_done_at: args[1].queue_done_at,
                queue_fail_at: args[1].queue_fail_at
              }));
              n_xp.notify.apply(n_xp, args);
            })
            n_xp.progress(self.defer.notify);
            return $.extend(n_xp.promise(), {
              to_apply: p_func_to_apply,
              queue_id: id
            });
          }
          //
          for (var i = 0; i < rq.length; i++) {
            if (rq[i].queue_id === queue_id) {
              return _com(rq[i]);
            }
          }
          for (var i = 0; i < q.length; i++) {
            if (q[i].queue_id === queue_id) {
              return _com(q[i]);
            }
          }
        }
        if (id) {
          var prom = _find(self.rq, self.q, id);
          if (prom !== undefined) {
            // console.log('hit.............', id);
            self.defer.notify('hit', prom.to_apply);
            return prom;
          }
        } else {
          id = _uuid();
        }
        //
        var xp = $.extend(new Deferred(), {
          to_apply: p_func_to_apply,
          queue_id: id
        });
        xp.progress(self.defer.notify);
        //
        setTimeout(function () {
          self.q.push(xp);
          xp.notify('enqueue', p_func_to_apply);
          self.polling(); // 激活轮训
        }, 0);
        //
        return $.extend(xp.promise(), {
          queue_id: id
        });
      };

      construct.prototype.dequeue = function dequeue(prom) {
        var self = this;
        //
        var _de = function (rq, q, item) {
          for (var i = 0; i < rq.length; i++) {
            if (rq[i].queue_id === item.queue_id) {
              return rq.splice(i, 1)[0];
            }
          }
          for (var i = 0; i < q.length; i++) {
            if (q[i].queue_id === item.queue_id) {
              return q.splice(i, 1)[0];
            }
          }
        }
        //
        var _de_queue_defer = _de(self.rq, self.q, prom);
        if (_de_queue_defer === undefined) {
          return;
        } else {
          _de_queue_defer.notify('dequeue', _de_queue_defer.to_apply);
          return prom;
        }
      };

      construct.prototype.clear = function clear() {
        console.log(v);
      };

      return construct;
    }();
    //
    return new dQueueClass(parallel);
  };


module.exports = {
  retry: promise_retry,
  cache: promise_cache,
  promisify: promisify,
  Deferred: Deferred,
  when: when,
  reject: promise_reject,
  each: promise_each,
  pipe: promise_pipe,
  queue: promise_queue,
  remembered: promise_remembered,
  while: promise_while
};

// var queue_test = function () {
//   var p_defer = deferQueue(3);
//
//   var mk_task = function (label, intval) {
//     var x = function x() {
//       var d = new deferred.Deferred();
//       setTimeout(function () {
//         d.resolve(label);
//       }, intval)
//       return d.promise()
//     };
//     x.label = label
//     return x;
//   };
//
//   p_defer.progress(function (status, af, xp) {
//     switch (status) {
//       case 'nomore':
//       case 'empty':
//         break;
//       case 'dequeue':
//       case 'enqueue':
//         console.log('...', status, af.label);
//         break;
//       case 'start':
//         console.log('...', status, af.queue_id, af.label, 'rq=' + p_defer.rq.length, 'q=' + p_defer.q.length);
//         break;
//       case 'prog':
//         xp.done(function () {
//           // console.log('task done', af.queue_id, af.label);
//         });
//         console.log('...', status, af.queue_id, af.label, xp, 'rq=' + p_defer.rq.length, 'q=' + p_defer.q.length);
//         break;
//       case 'done':
//         console.log('...', status, af.queue_id, af.label, 'rq=' + p_defer.rq.length, 'q=' + p_defer.q.length, 'consuming=' + (af.queue_done_at - af.queue_start_at) / 1000);
//       case 'fail':
//     }
//
//   })
//
//   p_defer.enqueue(mk_task('a', 1000));
//   p_defer.enqueue(mk_task('b', 2000));
//   p_defer.enqueue(mk_task('c', 3000));
//   p_defer.enqueue(mk_task('d', 4000));
//   p_defer.enqueue(mk_task('e', 5000), 'e0');
//   p_defer.enqueue(mk_task('f', 5000), 'e0');
// }
