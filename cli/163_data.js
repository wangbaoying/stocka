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

// 
/**
 * TODO
 * sequence_tasks_a 采用 Promise 链，当巨大的任务时可能会导致内存持续增长。
 * sequence_tasks_b 采用 setTimeout 的方法替代 Promise 链，希望能够解决内存持续增长的问题。
 *
 * D:\workspace\stocka>node cli/163_data.js
 * rss:45727744 heapTotal:32542720 heapUsed:17528400 external:112226
 * rss:55091200 heapTotal:36540416 heapUsed:22888848 external:4143040
 * rss:62615552 heapTotal:40538112 heapUsed:25931816 external:8810126
 * rss:68763648 heapTotal:41586688 heapUsed:22587976 external:13469020
 * rss:76333056 heapTotal:44535808 heapUsed:25542656 external:18136106
 * rss:83988480 heapTotal:47484928 heapUsed:28500144 external:22803192
 * rss:91549696 heapTotal:50434048 heapUsed:31448368 external:27470278
 * rss:99110912 heapTotal:53383168 heapUsed:34408480 external:32137364
 * rss:106647552 heapTotal:56332288 heapUsed:37385568 external:36804450
 * rss:114274304 heapTotal:59281408 heapUsed:40338424 external:41471536
 * rss:121851904 heapTotal:62230528 heapUsed:43285896 external:46138622
 * rss:130113536 heapTotal:65179648 heapUsed:46298592 external:50805708
 * rss:137244672 heapTotal:68128768 heapUsed:49259960 external:55472794
 * rss:144826368 heapTotal:71077888 heapUsed:52211272 external:60139880
 * rss:109891584 heapTotal:44109824 heapUsed:23701200 external:52149033
 * rss:117395456 heapTotal:47058944 heapUsed:26652352 external:56816119
 * rss:124968960 heapTotal:50008064 heapUsed:29598592 external:61483205
 * .............. 根据实际测试，内存持续增长的现象并没有像预计的那么快。所以放弃这个方法。
 * rss:171487232 heapTotal:84480000 heapUsed:44937664 external:88707590
 * rss:103620608 heapTotal:57937920 heapUsed:18415728 external:46703816
 * rss:111136768 heapTotal:60887040 heapUsed:21368232 external:51370902
 * rss:118677504 heapTotal:63836160 heapUsed:24314160 external:56037988
 * rss:126222336 heapTotal:66785280 heapUsed:27259664 external:60705074
 * rss:133775360 heapTotal:69734400 heapUsed:30204808 external:65372160
 * rss:141324288 heapTotal:72683520 heapUsed:33149592 external:70039246
 * rss:148860928 heapTotal:75632640 heapUsed:36093808 external:74706332
 * rss:156401664 heapTotal:78581760 heapUsed:39038024 external:79373418
 * rss:163946496 heapTotal:81530880 heapUsed:41982240 external:84040504
 * rss:171499520 heapTotal:84480000 heapUsed:44926456 external:88707590
 * rss:105680896 heapTotal:57937920 heapUsed:18404728 external:46703816
 * rss:113172480 heapTotal:60887040 heapUsed:21357232 external:51370902
 */
function sequence_tasks_b(tasks) {
  return tasks.reduce(function (promise, task) {
    return promise.then(task);
  }, Promise.resolve());
}

// 顺序执行 Premise 测试
// function mk_p_task(to) {
//   return function() {
//     return new Promise(function(resolve, reject) {
//         setTimeout(function(){
//         	console.log('task....', to);
// 			if (to === 1000) {
// 				reject(to + ' - task')
// 			} else {
// 				resolve(to + ' - task');
// 			}
//             
//         }, to);
//     });
//   }
// }
// sequence_tasks_b([mk_p_task(1000), mk_p_task(2000)]).then(function(){
//     console.log(arguments);
// });


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


function mk_download_task(url, buf_encoding) {
  buf_encoding = buf_encoding || "utf-8";
  return function () {
    return new Promise(function (resolve, reject) {
      return stream_to_array(request(url, {
        // proxy:'http://cn-proxy.jp.oracle.com:80',
        timeout: 5 * 1000
      })).then(function (buffer_array) {
        var buffer = Buffer.concat(buffer_array.parts);
        return encoding.convert(buffer, "utf-8", buf_encoding).toString();
      }).then(resolve, reject);
    })
  }
}

// Promise 链内存持续增长 - 测试方法
// 模拟下载处理，直接读取文件，返回文件内存 buffer
// mk_csv_task 中调用这个方法获得 文件内容，并保存到文件。
// 将 mk_csv_task 置于很长的 Promise 链内，观察内存情况。
// 根据实际10000次测试，内存持续增长的现象并没有像预计的那么快。所以放弃这个方法。
// 
function mk_download_task_b(url) {
  return function () {
    return new Promise(function (resolve, reject) {
      return stream_to_array(fs.createReadStream('d:/000016.csv')).then(function (buffer_array) {
        var buffer = Buffer.concat(buffer_array.parts);
        console.log("....", fmt_mem_usage());
        return encoding.convert(buffer, "utf-8", "gbk").toString();
      }).then(resolve, reject);
    })
  }
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

function fetch_csv(hs_code, code, start, end, output_dir) {
  var url = 'http://quotes.money.163.com/service/chddata.html' +
    '?code=' + code +
    '&start=' + moment(start, 'YYYY-MM-DD').format('YYYYMMDD') +
    '&end=' + moment(end, 'YYYY-MM-DD').format('YYYYMMDD') +
    '&fields=TCLOSE;HIGH;LOW;TOPEN;LCLOSE;CHG;PCHG;TURNOVER;VOTURNOVER;VATURNOVER;TCAP;MCAP';
  return Promise.resolve().then(mk_download_task(url, "gbk")).then(function (csv_content) {
    var fn = path.join(output_dir, code + '.csv');
    fs.writeFileSync(fn, csv_content);
    console.log('MSG: 历史数据下载成功 -> ', hs_code, code, start, end, fn);
    return csv_content
  }).then(function (csv_content) {
    var list = csv_to_list(csv_content);
    fs.writeFileSync(path.join(output_dir, code + ".json"), JSON.stringify(list, null, 2));
  });
}

function fetch_base(hs_code) {
  var url = 'http://quotes.money.163.com/trade/lsjysj_' +
    '' + hs_code +
    '.html';
  return Promise.resolve().then(mk_download_task(url)).then(function (html_content) {
    var re0 = new RegExp("var STOCKCODE = '([0-9]+)';", 'ig');
    var re1 = new RegExp('<input type="radio" name="date_start_type" value="(.*?)" >上市日', 'ig');
    var re2 = new RegExp('<input type="radio" name="date_end_type" value="(.*?)">今日', 'ig');
    var re3 = new RegExp("var STOCKNAME = '(.+)';", 'ig');
    if ((result0 = re0.exec(html_content)) != null &&
      (result1 = re1.exec(html_content)) != null &&
      (result2 = re2.exec(html_content)) != null &&
      (result3 = re3.exec(html_content)) != null) {
      console.log('MSG: 基本信息下载成功 -> ', hs_code, result3[1].replace(/ /g, ""), [result0[1], result1[1], result2[1]]);
      return [result0[1], result1[1], result2[1]]
    } else {
      console.warn('WARN:', hs_code, "不能找到STOCKCODE或上市日等信息", url);
      // .............
    }
  });
}

function fetch_single(hs_code, output_dir) {
  return fetch_base(hs_code).then(function (base_dat) {
    if (base_dat) {
      return fetch_csv(hs_code, base_dat[0], base_dat[1], base_dat[2], output_dir);
    }
  })
}

function fetch_hs_list_a(output_dir) {
  var fn = path.join(output_dir, 'list.json');
  var st = fs.existsSync(fn);
  if (st) {  // 判断是否为文件
    return mk_download_task_c(fn)().then(function (content) {
      return JSON.parse(content);
    })
  } else {
    var url = 'http://quotes.money.163.com/hs/service/diyrank.php?page=0&query=STYPE%3AEQA&sort=SYMBOL&order=asc&count=10000&type=query';
    return Promise.resolve().then(mk_download_task(url, "utf-8")).then(function (json_content) {
      var result = JSON.parse(json_content);
      console.log("MSG: 下载沪深A股列表成功 -> ", result.list.length);
      // console.log("MSG: 下载沪深A股列表成功 -> ", JSON.stringify(result.list[0], null, 2));
      return result.list.map(function (item, idx) {
        return {
          name: item.SNAME,
          code: item.SYMBOL
        }
      })
      // { page: 0,
      //   count: 10000,
      //   order: 'asc',
      //   total: 3498,
      //   pagecount: 1,
      //   time: '2018-02-24 10:20:22',
      //   list:
      //    [ { CODE: '1000001',
      //        DERC_EQRETURN: [Object],
      //        FINANCIALRATIOS: [Object],
      //        HIGH: 12.79,
      //        LOW: 12.45,
      //        MCAP: 213336071271.18,
      //        MFRATIO: [Object],
      //        OPEN: 12.58,
      //        PE: 9.7751937984496,
      //        PERCENT: 0.012039,
      //        PRICE: 12.61,
      //        SNAME: '平安银行',
      //        SYMBOL: '000001',
      //        TIME: '2018/02/23 15:58:39',
      //        TURNOVER: 1278185721.74,
      //        UPDOWN: 0.15,
      //        VOLUME: 101366320,
      //        YESTCLOSE: 12.46,
      //        NO: 1 }
      // 	   ]
      // }
    }).then(function (list) {
      fs.writeFileSync(path.join(output_dir, 'list.json'), JSON.stringify(list, null, 2));
      return list;
    });
  }
}
//
function mk_fetch_task(hs_list, item, hs_code, output_dir) {
  return function () {
    return fetch_single(hs_code, output_dir).then(function (list) {
      item.downloaded = moment().format('YYYY-MM-DD');
      // console.log(JSON.stringify(item));
      fs.writeFileSync(path.join(output_dir, 'list.json'), JSON.stringify(hs_list, null, 2));
    });
  }
}

function fetch(output_dir) {
  return fetch_hs_list_a(output_dir).then(function (list) {
    var tasks = [];
    for (var i = 0; i < list.length; i++) {
      var item = list[i];
      if (item.downloaded !== moment().format("YYYY-MM-DD")) {
        tasks.push(mk_fetch_task(list, item, item.code, output_dir));
      }
    }
    console.log("MSG:", "开始下载各股历史数据 -> ", tasks.length, list.length);
    return sequence_tasks(tasks).then(function (x) {
      console.log("MSG:", "各股历史数据下载结束 -> ", tasks.length, list.length);
    })
  });
}

function fetch_retry() {
  var output_dir = path.join(path.dirname(__filename), '..', 'dat');
  fetch(output_dir).then(function () {
    console.log('done...');
  }).catch(function (e) {
    var msg = e + '';
    console.log('failed...', "-" + msg + "-");
    if (msg.indexOf('ECONNRESET') !== -1
      || msg.indexOf('ESOCKETTIMEDOUT') !== -1
      || msg.indexOf('ETIMEDOUT') !== -1) {
      console.log('retry... after 1 secend.');
      setTimeout(function () {
        fetch_retry();
      }, 1000)
    }
  })
}
fetch_retry();

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

function to_json_file(csv_file_path) {
  var f_dirname = path.dirname(csv_file_path);
  var f_basename = path.basename(csv_file_path);
  return new Promise(function (resolve, reject) {
    console.log('to_json_file...', csv_file_path);
    return mk_download_task_c(csv_file_path)().then(csv_to_list).then(function (list) {
      fs.writeFileSync(path.join(f_dirname, f_basename + ".json"), JSON.stringify(list, null, 2));
    }).then(resolve, reject);
  });
}

function mk_to_json_task(dir) {
  var _paths = fs.readdirSync(dir);
  var _result = [];
  for (var i = 0; i < _paths.length; i++) {
    var _src = path.join(dir, _paths[i]);
    var st = fs.statSync(_src);
    if (st.isFile()) {
      if (/\.csv$/.exec(_src)) {
        _result.push((function (sss) {
          return function () {
            return to_json_file(sss);
          }
        })(_src));
      }
    } else {
      Array.prototype.push.apply(_result, mk_to_json_task(_src))
    }
  }
  return _result;
}

// function csv_to_json() {
// 	var tasks = mk_to_json_task('../dat');
// 	console.log("MSG:", "开始转换JSON -> ", tasks.length);
// 	return sequence_tasks_b(tasks).then(function(x){
// 	  console.log("MSG:", "转换JSON完成 -> ", tasks.length);
//     })
// }
// 
// csv_to_json();

