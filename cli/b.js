/**
 * 数据分析。
 *   1, 读取股票历史数据、整理；
 *   2, 采用指定的模型进行分析；
 */

var request = require('request');
var path = require('path');
var fs = require('fs');
var encoding = require('encoding');
var crypto = require('crypto');
var moment = require('moment');
var _ = require('lodash');
//
//
var sprintf = require("./site-modules/sprintf.js").sprintf;
var mreq = require('./m-require')();

// 顺序执行 Premise https://www.kancloud.cn/kancloud/promises-book/44249
function sequence_tasks(tasks) {
  function recordValue(results, value) {
    results.push(value);
    return results;
  }

  var pushValue = recordValue.bind(null, []);
  return tasks.reduce(function (promise, task) {
    return promise.then(task).then(pushValue);
  }, Promise.resolve());
}

function sequence_tasks_a(tasks) {
  return tasks.reduce(function (promise, task) {
    return promise.then(task);
  }, Promise.resolve());
}

/**
 * readable stream 数据到 buffer
 */
function stream_to_array(stream, limit_file_size) {
  return new Promise(function (resolve, reject) {
    // stream is already ended
    if (!stream.readable) return resolve([]);

    var arr = [],
      cryptoMD5 = crypto.createHash('md5'),
      md5sum,
      bufferLength = 0;

    stream.on('data', onData);
    stream.on('end', onEnd);
    stream.on('error', onEnd);
    stream.on('close', onClose);

    function onData(chunk) {
      cryptoMD5.update(chunk);
      arr.push(chunk);
      bufferLength += chunk.length;
      if (limit_file_size && bufferLength > limit_file_size) {
        reject({
          code: "LIMIT_FILE_SIZE",
          message: "over file size limits[" + limit_file_size + "]."
        });
        cleanup();
      }
    }

    function onEnd(err) {
      md5sum = cryptoMD5.digest('hex').toLowerCase();
      //
      if (err) {
        reject(err)
      } else {
        resolve({
          parts: arr,
          md5sum: md5sum
        })
      }
      cleanup()
    }

    function onClose() {
      resolve({
        parts: arr,
        md5sum: md5sum
      });
      cleanup()
    }

    function cleanup() {
      arr = null;
      stream.removeListener('data', onData);
      stream.removeListener('end', onEnd);
      stream.removeListener('error', onEnd);
      stream.removeListener('close', onClose);
    }
  })
}

function mk_download_task_c(file_path, buf_encoding) {
  buf_encoding = buf_encoding || "utf-8";
  return function () {
    return new Promise(function (resolve, reject) {
      return stream_to_array(fs.createReadStream(file_path)).then(function (buffer_array) {
        var buffer = Buffer.concat(buffer_array.parts);
        return encoding.convert(buffer, "utf-8", buf_encoding).toString();
      }).then(resolve, reject);
    })
  }
}

function fmt_mem_usage(mem_usage) {
  var usage = process.memoryUsage();

  function to_mb(byte_sz) {
    return (byte_sz / 1024 / 1024).toFixed(2) + "M";
  }

  return "rss:" + to_mb(usage.rss) + " " + "heapTotal:" + to_mb(usage.heapTotal) + " " + "heapUsed:" + to_mb(usage.heapUsed) + " " + "external:" + to_mb(usage.external)
}


// fetch(path.join(path.dirname(__filename), '..', 'dat'))
// console.log(fmt_mem_usage());
// 000016.html

function csv_to_list(csv_content) {
  var lines = csv_content.split(/\r?\n/g);
  var list = [];
  for (var i = 1; i < lines.length; i++) {
    // 日期,股票代码,名称,收盘价,最高价,最低价,开盘价,前收盘,涨跌额,涨跌幅,换手率,成交量,成交金额 -- ,总市值,流通市值
    var line = lines[i];
    if (line === '') {
      continue;
    }
    var columns = line.split(/,'?/g);
    var x_dat = {};
    var tmp;
    // 检查数据
    // ################################################################
    // 日期
    tmp = moment(columns[0], 'YYYY-MM-DD');
    if (!tmp.isValid()) {
      console.log("ERR:" + f_basename + "无效日期" + i + line);
      throw ("ERR:" + f_basename + "无效日期" + columns[0]);
      break;
    }
    x_dat.date = columns[0];
    // 股票代码
    tmp = (/^(\d{6})$/g).exec(columns[1]);
    if (!tmp) {
      throw("ERR:" + f_basename + "无效股票代码 " + columns[0] + ' ' + columns[1]);
      break;
    }
    x_dat.code = columns[1];
    // 名称
    x_dat.name = columns[2];
    // 收盘价
    tmp = _.toNumber(columns[3]);
    if (_.isNaN(tmp)) {
      throw("ERR:" + f_basename + "无效收盘价" + columns[0] + ' ' + columns[3]);
    }
    x_dat.close = tmp;
    // 最高价
    tmp = _.toNumber(columns[4]);
    if (_.isNaN(tmp)) {
      throw("ERR:" + f_basename + "无效最高价 " + columns[0] + ' ' + columns[4]);
    }
    x_dat.high = tmp;
    // 最低价
    tmp = _.toNumber(columns[5]);
    if (_.isNaN(tmp)) {
      throw("ERR:" + f_basename + "无效最低价 " + columns[0] + ' ' + columns[5]);
    }
    x_dat.low = tmp;
    // 开盘价
    tmp = _.toNumber(columns[6]);
    if (_.isNaN(tmp)) {
      reject("ERR:" + f_basename + "无效开盘价 " + columns[0] + ' ' + columns[6]);
    }
    x_dat.open = tmp;
    // 前收盘
    tmp = _.toNumber(columns[7]);
    if (_.isNaN(tmp)) {
      throw("ERR:" + f_basename + "无效前收盘 " + columns[0] + ' ' + columns[7]);
    }
    x_dat.previous_close = tmp;
    // 涨跌额
    tmp = _.toNumber(columns[8]);
    if (_.isNaN(tmp) && columns[8] !== 'None') {
      throw("ERR:" + f_basename + "无效涨跌额 " + columns[0] + ' ' + columns[8]);
    }
    x_dat.netchange = tmp;
    // 涨跌幅
    tmp = _.toNumber(columns[9]);
    if (_.isNaN(tmp) && columns[9] !== 'None') {
      throw("ERR:" + f_basename + "无效涨跌幅 " + columns[0] + ' ' + columns[9]);
    }
    x_dat.netchange_percent = tmp;
    // 换手率
    tmp = _.toNumber(columns[10]);
    if (_.isNaN(tmp) && columns[10] !== 'None') {
      throw("ERR:" + f_basename + "无效换手率 " + columns[0] + ' ' + columns[10]);
    }
    x_dat.volume_percent = tmp;
    // 成交量
    tmp = _.toNumber(columns[11]);
    if (_.isNaN(tmp)) {
      throw("ERR:" + f_basename + "无效成交量 " + columns[0] + ' ' + columns[11]);
    }
    x_dat.volume = tmp;
    // 成交金额
    tmp = _.toNumber(columns[12]);
    if (_.isNaN(tmp)) {
      throw("ERR:" + f_basename + "无效成交量 " + columns[0] + ' ' + columns[12]);
    }
    x_dat.volume_amount = tmp;
    // 总市值
    tmp = _.toNumber(columns[13]);
    if (_.isNaN(tmp)) {
      throw("ERR:" + f_basename + "无效总市值 " + columns[0] + ' ' + columns[13]);
    }
    x_dat.total_cap = tmp;
    // 流通市值
    tmp = _.toNumber(columns[14]);
    if (_.isNaN(tmp)) {
      throw("ERR:" + f_basename + "无效流通市值 " + columns[0] + ' ' + columns[14]);
    }
    x_dat.total_cap_c = tmp;
    // ################################################################
    //
    list.push(x_dat);
  }
  list.sort(function (a, b) {
    if (a.date > b.date) {
      return 1;
    } else {
      return -1;
    }
  });
  // 重构数据
  // * 计算指定位置记录的均价
  list = list.map(function (item, idx) {
    function get_avg_x(ix, days, field) {
      var start_idx = ix - days < 0 ? 0 : ix - days + 1;
      var end_idx = ix + 1;
      var n_lst = list.slice(start_idx, end_idx);
      var ret = _.toNumber((_.sumBy(list.slice(start_idx, end_idx), field) / n_lst.length).toFixed(2));
      // console.log(item.date, item[field],  start_idx, end_idx, ix, n_lst.length, ret);
      return ret;
    }

    item.avg5 = get_avg_x(idx, 5, 'close');
    item.avg10 = get_avg_x(idx, 10, 'close');
    item.avg20 = get_avg_x(idx, 20, 'close');
    return item;
  });
  //
  return list;
}

function csv_to_json(csv_file_path) {
  var f_dirname = path.dirname(csv_file_path);
  var f_basename = path.basename(csv_file_path);
  return new Promise(function (resolve, reject) {
    // console.log('to_json_file...', csv_file_path);
    return mk_download_task_c(csv_file_path)().then(csv_to_list).then(resolve, reject);
  });
}

//
function load_stock_history(code) {
  var filepath = path.join(__dirname, '../dat', code + '.csv');
  return csv_to_json(filepath);
}

//
function analysis_stock_history(code, models) {
  return load_stock_history(code).then(function (list) {
    // 获得指定日的均价
    function get_avg_x(ix, days, field) {
      var start_idx = ix - days < 0 ? 0 : ix - days + 1;
      var end_idx = ix + 1;
      var n_lst = list.slice(start_idx, end_idx);
      var ret = _.toNumber((_.sumBy(list.slice(start_idx, end_idx), field) / n_lst.length).toFixed(2));
      return ret;
    }

    // 获得指定日的数据
    function get_x(ix, days) {
      return list[ix + days];
    }

    function get_idx(t_date) {
      for (var i = 0; i < list.length; i++) {
        if (t_date === list[i].date) {
          return i;
        }
      }
      return -1;
    }

    //
    // var idx = get_idx('1999-11-10');
    var idx = 0;
    for (var i = idx; i < list.length; i++) {
      var daily = get_x(i, 0);
      // 
      // 与数据相关的上下文
      var ctx_fun_list = {
        daily,
        get_x: (function get_n(idx) {
          return function (days) {
            return get_x(idx, days)
          }
        })(i)
      };
      for (var j = 0; j < models.length; j++) {
        apply_model(code, models[j], daily, ctx_fun_list);
      }
    }
    //
  })
}

function apply_model(code, model, daily, ctx_func_list) {
  function init_model_result(model) {
    if (!model.result) model.result = {};  //
    if (!model.result.hasOwnProperty(code)) model.result[code] = {
      history: []
    };
  }
  // 初始化模型结果数据结构
  init_model_result(model);
  // 构建回测上下文
  var trade = {
    logs: [],
    matched: daily, 
    buy: undefined,   // 买入那天的数据及买入价格。
    sell: undefined   // 卖出那天的数据及卖出价格。
  };
  // 
  var ctx_args = Object.assign({
    today: daily,
    trade: (function (trade) {
      return { // 写 history 处理
          log: function () {
            var args = Array.prototype.slice.call(arguments, 0);
            args.unshift(model.id);
            console.log.apply(console, args);
            // trade.logs.push(args);
          },
          printf: function(){
            // sprintf
            var args = Array.prototype.slice.call(arguments, 0);
            var cargs = [model.id, sprintf.apply(sprintf, args)];
            console.log.apply(console, cargs);
          },
          sprintf,
          set_buy: function (dat, price) {  // 设置买入日期及价格
            if (_.isNumber(price)) {
              trade.buy = {
                price: price,   // 买入单价
                daily: dat      // 买入那天的数据
              };
            }
          },
          set_sell: function (dat, price) {  // 设置卖出日期及价格
            if (_.isNumber(price)) {
              trade.sell = {
                price: price,   // 卖出单价
                daily: dat      // 卖出那天的数据
              };
            }
          }
        };  // 构建基于 model 的 function 列表。
    })(trade)
  }, ctx_func_list);


  try {
    // 获取模型
    var _eval = mreq.require_f(model.id, ctx_args);
    //

    //
    // 符合买入条件
    if (_eval.m.apply(null)) {  
      // 将“交易”数据放入交易历史。
      model.result[code].history.push(trade);
  
      // 测试卖出点，卖出点测试后，如果没有设定买入/卖出价格则表示“测试卖出点”函数书写的不完整
      _eval.n.apply(null);
      if (trade.buy !== undefined && trade.sell !== undefined) {
        // model.result[code].netchange = trade.sell - trade.buy;
      } else {
        // TODO: 回测不能进行了，是否考虑应该退出。
        if (trade.buy === undefined) {
          ctx_args.trade.log("ERROR: 模型回测中【" + code + "】，貌似没有设定买入日期数据及买入价格。");
        }
        if (trade.sell === undefined) {
          ctx_args.trade.log("ERROR: 模型回测中【" + code + "】，貌似没有设定卖出日期数据及卖出价格。");
        }
      }
    }
  } catch(e) {
    // https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Error
    // TODO: 想办法重构StackTrace信息，让错误消息更容易读。
    console.error(Error.captureStackTrace);
    throw e;
  }
}

/**
 * 获得指定目录下所有股票数据文件
 */
function get_dir_files(code, dir, models) {
  var _paths = fs.readdirSync(dir);
  var _result = [];
  if (code) {
    _result.push((function (bname) {
      return function () {
        return analysis_stock_history(bname, models);
      }
    })(code));
  } else {
    for (var i = 0; i < _paths.length; i++) {
      var name = _paths[i];
      var extname = path.extname(name);
      var _src = path.join(dir, name);
      // var st = fs.statSync(_src);
      if (extname && '.csv' === extname.toLowerCase()) {
        var bname = path.basename(name, extname);
        if (/\d{7}/.exec(bname)) {
          // console.log('...', bname);
          _result.push((function (bname) {
            return function () {
              return analysis_stock_history(bname, models);
            }
          })(bname));
        }
      }
    }
  }
  return _result;
}

function load_models(files) {
  var ctx_names = ['today', 'get_x', 'trade'];
  return files.map(function(fn, idx){
    var sourceCode = fs.readFileSync(path.join(__dirname, fn),'utf-8');
    var id = fn;  // 相对目录
    mreq.define_f(id, sourceCode, ctx_names);
    return {id};
  });
}

function analysis_all_stock_history(code, files) {
  var models = load_models(files);
  var tasks = get_dir_files(code, path.join(__dirname, '../dat'), models);
  console.log("MSG:", "开始分析完成 -> ", tasks.length);
  return sequence_tasks_a(tasks).then(function (x) {
    console.log("MSG:", "分析完成 -> ", tasks.length);
    console.log(models.map(function (itm, idx) {
      var matched_result = itm.result;
      // 满足这个模型的股票代码
      var matched_codes = Object.keys(matched_result);
      return itm.id + " \n" + matched_codes.map(function (mcode, hidx) {
          return mcode + " -> 符合条件次数：" + matched_result[mcode].history.length;
        }).join('\n');
    }).join("\n"));
  })
}

//
module.exports = analysis_all_stock_history;
