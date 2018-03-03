/**
 * 数据分析。
 *   1, 读取特定股票历史数据。
 *   2, 整理。
 *   3, 分析；
 */


var request = require('request');
var path = require('path');
var fs = require('fs');
var encoding = require('encoding');
var crypto = require('crypto');
var moment = require('moment');
var _ = require('lodash');

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
function analysis_stock_history(code) {
	return load_stock_history(code).then(function(list){
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
			for (var i = 0;i<list.length;i++) {
				if (t_date === list[i].date) {
					return i;
				}
			}
			return -1;
		}
    //
    var ret_list = []; // 买入点列表
    //
    var netchange = 0;
		//
		var idx = get_idx('1999-11-10');
		for (var i=idx;i<list.length;i++) {
			var daily = get_x(i, 0);
      var ctx_fun_list = [
        (function get_n(idx){
          return function(days){
            return get_x(idx, days)
          }
        })(i)
      ];
			if (m1(daily, ctx_fun_list[0])) {
        // 符合条件
				console.log('符合条件.', daily.code, daily.date, daily.name, daily.netchange_percent, daily.close);
        // 测试卖出点
        var x =  n1(daily, ctx_fun_list[0]);
        console.log('  损益...', x)
        netchange = netchange + x;
			}
		}
    console.log('整体收益...', netchange);
	})
}

// 找到卖出点, 验证收益
function n1(dat, get_x) {
  var v1 = get_x(1);   // 第二天数据
  var v = v1.open;     // 第二天开盘价，作为成交价
  console.log('  买入...', v1.code, v1.date,  v1.name, '买入价', v1.open);
  // 再向后推7天，检验是否找到卖出条件
  for (var i=2;i<8;i++) {
    var daily = get_x(i);
    if (!daily) break;
    var netchange_percent = (daily.close - v) / v * 100;
    // 收益大于3%，或者小于-1%。
    if (netchange_percent > 3 || netchange_percent < -1) {
      console.log('  卖出...', daily.code, daily.date, daily.name, '卖出价', daily.close, netchange_percent.toFixed(2) + '%');
      return daily.close - v;
    }
  }
  console.log('  没有找到合适的卖出价格...');
  return 0;
}

// 买入条件
function m1(dat, get_x) {
  var ldat1 = get_x(-1);   // 获得第N天数据
  var ldat2 = get_x(-2);
  if (!ldat1 || !ldat2) return;
  // var ldat3 = get_x(3);
  // console.log(ldat1.date, ldat2.date, dat.date);
  if (ldat1.volume > ldat2.volume * 2) {
    return true;
  }
}

analysis_stock_history('0600000');

