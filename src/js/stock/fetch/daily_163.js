define("fetch/daily_163", ["require", "exports", "module"], function (require, exports, module) {
// @@@@@@@@@@@@@@@@@@@@@@@@@@

  var $ = require('jquery');
  var _ = require('lodash');
  var moment = require('moment');
  var db = require('websqldb');
  var _typeof = require('utils/typeofex');
  var promise1 = require('utils/promise').promise1;
  var promise2 = require('utils/promise').promise2;
  var do_get = require('utils/ajax').do_get;
  var do_get_a = require('utils/ajax').do_get_a;
  var do_get_b = require('utils/ajax').do_get_b;

  // http://img1.money.126.net/data/hs/kline/day/history/2015/1399001.json
  function fetch_data0(sno) {
    $(".progress-bar0").text("fetch/daily 下载日数据:" + sno);
    // 获取这只股票 所有的年
    var fetch_year_quarter = function (sno) {
      // http://quotes.money.163.com/trade/lsjysj_000016.html
      return do_get('http://quotes.money.163.com/trade/lsjysj_' + sno + '.html').then(function (e) {
        var re0 = new RegExp("var STOCKCODE = '([0-9]+)';", 'ig');
        var sscode;
        if ((result0 = re0.exec(e)) != null) {
          sscode = result0[1];
        }
        var pos0 = e.indexOf('<select name="year">');
        var pos1 = e.indexOf('</select>', pos0);
        var html_part = e.substring(pos0, pos1 + '</select>'.length);
        //
        var ret_arr = [];
        var re = new RegExp('(<option value=\"(.*?)\".*?<\/option>)', 'ig');
        while ((result = re.exec(html_part)) != null) {
          ret_arr.push(parseInt(result[2]));
        }
        return [sscode, ret_arr.sort()];
        // @@@@@@@@@@@@@@@@@@@@@ var STOCKCODE =
      })
    };
    var fetch_start_end = function (sno) {
      // http://quotes.money.163.com/trade/lsjysj_000016.html
      return do_get('http://quotes.money.163.com/trade/lsjysj_' + sno + '.html').then(function (e) {
        var re0 = new RegExp('<input type="radio" name="date_start_type" value="(.*?)" >上市日', 'ig');
        var re1 = new RegExp('<input type="radio" name="date_end_type" value="(.*?)">今日', 'ig');
        if ((result0 = re0.exec(e)) != null && (result1 = re1.exec(e)) != null) {
          return [result0[1], result1[1]]
        }
      })
    };

    var _save = function (item) {
      return db.execSQLI(  // do update
        " UPDATE market_history SET " +
        " OPEN = ?, " +
        " HIGH = ?, " +
        " CLOSE = ?, " +
        " LOW = ?, " +
        " VOL = ?, " +
        " AMOUNT = ? " +
        " WHERE SCode = ? " +
        " AND TDate = ? ",
        [item[2], item[3], item[4], item[5], item[6], item[7], item[0], item[1]]
      ).then(function (t, r) {
        if (r.rowsAffected === 0) { // do insert when no row updated
          return db.execSQLI(
            "INSERT INTO market_history (SCode , TDate , " +
            "OPEN, HIGH, CLOSE, LOW, VOL, AMOUNT ) VALUES (?,?,?,?,?,?,?,?)",
            item
          ).then(function (t, r) {
            return r;
          });
        }
        return r;
      })
    };

    //return $.when(fetch_start_end(sno), get_last_tdate(sno)).then(function (se_date, ltdate) {
    //  return download_data(sno, se_date[0], se_date[1]);
    //});


    return $.when(fetch_year_quarter(sno), get_last_tdate(sno)).then(function (des, ltdate) {
      var sscode = des[0];
      var yearList = des[1];
      var tbl_data = [];
      return promise2(function (idx, item) {
        return fetch_data(sscode, item).then(function (_tbl_data) {
          Array.prototype.push.apply(tbl_data, _tbl_data.map(function (row, idx) {
            // 日期 开盘价 收盘价 最高价 最低价 成交量 涨跌幅(%)
            return [moment(row[0], "YYYYMMDD").format('YYYY-MM-DD')].concat(Array.prototype.slice.call(row, 1));
          }));
        });
      }, yearList, 1).progress(function (status, percentage) {
        if (status === "percentage") {
          $(".progress-bar1").text("fetch/daily:" + (percentage * 100) + '%')
            .css("width", (percentage * 100) + '%');
        }
      }).then(function () {
        // console.log(tbl_data);
        return promise1(function (idx, item) {
          return _save(item);
        }, tbl_data).progress(function () {
          $(".progress-bar2").text("saving:" + (arguments[0] * 100) + '%')
            .css("width", (arguments[0] * 100) + '%');
        });
      }).fail(function (err) {
        console.log(err);
      });
    });
  }

  // 获得 指定 股票数据 跟新到了哪一天
  function get_last_tdate(sno) {
    return db.execSQLI(
      " SELECT MAX(TDate) AS MTDate " +
      " FROM market_history " +
      " WHERE SCode = ? ", [sno]
    ).then(function (t, r) {
      if (r.rows && r.rows.length === 1) {
        return moment(r.rows[0].MTDate, "YYYY-MM-DD");
      } else {
        return {};
      }
    })
  }

  /**
   * TODO 暂时不好使
   * @param sno
   * @param start_date
   * @param end_date
   * @returns {PromiseLike<TResult>|Promise<TResult>|Promise.<T>}
   */
  function download_data(sno, start_date, end_date) {
    start_date = start_date.replace(/-/g, '');
    end_date = end_date.replace(/-/g, '');
    return do_get('http://quotes.money.163.com/service/chddata.html?code=' + sno +
      '&start=' + start_date +
      '&end=' + end_date + '' +
      '&fields=TCLOSE;HIGH;LOW;TOPEN;LCLOSE;CHG;PCHG;TURNOVER;VOTURNOVER;VATURNOVER;TCAP;MCAP',
      {
        // contentType: "application/octet-stream",
        'beforeSend': function (xhr) {
          xhr.setRequestHeader("Content-Type", 'application/octet-stream')
        },
      }
    ).then(function (e) {
      console.log(e);
    })
  }


  // 获取指定 代码，年，季度的日数据.
  function fetch_data(sno, syear) {
    return do_get('http://img1.money.126.net/data/hs/kline/day/history/' + syear + '/' + sno + '.json',
      {dataType: "json"}
    ).then(function (e) {
      return e.data;
    })
  }

  // 获取制定股票代码的所有历史日数据
  module.exports = fetch_data0;

// @@@@@@@@@@@@@@@@@@@@@@@@@@
});
