define("utils/promise", ["require", "exports", "module"], function (require, exports, module) {

  var promiseQ = function (parallel) {

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
        this.defer = new $.Deferred();
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
          return $.when();
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
        var p_func_to_apply = func_to_apply;
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
        var xp = $.extend(new $.Deferred(), {
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
        _de_queue_defer.notify('clear');

        console.log(v);
      };

      return construct;
    }();
    //
    return new dQueueClass(parallel);
  };

  var promise2 = function (p_func, list, parallel) {
    var idx = 0;
    var d = new $.Deferred;
    var Q = promiseQ(parallel || 10);
    Q.progress(function (status, func) {
      if (status === 'empty') {
        d.resolve();
      } else if (status === 'enqueue' || status === 'dequeue'
        || status === 'start' || status === 'done'
        || status === 'prog') {
        d.notify.apply(d, Array.prototype.slice.call(arguments, 0))
      } else if (status === 'fail') {
        d.reject.apply(d, Array.prototype.slice.call(arguments, 2))
      }
    });
    for (var i = 0; i < list.length; i++) {
      (function (idx, item) {
        Q.enqueue(function () {
          return p_func.apply(null, [idx, item]).done(function () {
            var args = Array.prototype.slice.call(arguments, 0); // convert to a javascript array.
            d.notify("percentage", ((idx + 1) / list.length), item, args);
          });
        });
      })(i, list[i])
    }
    return d.promise();
  };

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
    return d.promise();
  };

  exports.promise1 = promise1;
  exports.promise2 = promise2;
});


