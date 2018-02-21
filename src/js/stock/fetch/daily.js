define("fetch/daily", ["require", "exports", "module"], function (require, exports, module) {
// @@@@@@@@@@@@@@@@@@@@@@@@@@

  var $ = require('jquery');
  var _ = require('lodash');
  var moment = require('moment');
  var db = require('websqldb');
  var _typeof = require('utils/typeofex');
  var promise1 = require('utils/promise').promise1;
  var a_get = require('utils/ajax').do_get;
  //

  // 公司基本信息
  // http://vip.stock.finance.sina.com.cn/corp/go.php/vCI_CorpInfo/stockid/600787.phtml
  // 股本结构
  // http://vip.stock.finance.sina.com.cn/corp/go.php/vCI_StockStructure/stockid/600787.phtml
  // 股票代码索引
  // http://vip.stock.finance.sina.com.cn/q/go.php/vIR_CustomSearch/index.phtml

  function fetch_data0(sno) {
    $(".progress-bar0").text("fetch/daily 下载日数据:" + sno);

    // 获取这只股票 所有的年，季度 数据，根据（年，季度）获取全部数据
    var fetch_year_quarter = function (sno) {
      return a_get('http://money.finance.sina.com.cn/corp/go.php/vMS_MarketHistory/stockid/' + sno + '.phtml'
      ).then(function (e) {
        var pos0 = e.indexOf('<select name="year">');
        var pos1 = e.indexOf('</select>', pos0);
        var html_part = e.substring(pos0, pos1 + '</select>'.length);
        //
        var ret_arr = [];
        var re = new RegExp('<option value=\"(.*)\".*<\/option>', 'g');
        while ((result = re.exec(html_part)) != null) {
          ret_arr.push(parseInt(result[1]));
        }
        return ret_arr.sort();
        // @@@@@@@@@@@@@@@@@@@@@
      })
    };

    return $.when(fetch_year_quarter(sno),
      get_last_tdate(sno)
    ).then(function (yearList, ltdate) {
      // ltdate日期的前一季度数据认为已经获得,因此过滤掉
      var l_year = ltdate.year(),
        l_quarter = ltdate.quarter(),
        now_year = moment().year(),
        now_quarter = moment().quarter();
      var fetch_detail_args_list = [];
      for (var i = 0; i < yearList.length; i++) {
        if (l_year > yearList[i]) {
          continue; // 跳过
        } else if (l_year === yearList[i]) {
          for (var j = l_quarter; j <= (now_year === yearList[i] ? now_quarter : 4); j++) {
            fetch_detail_args_list.push([sno, yearList[i], j]);
          }
        } else {
          for (var j = 1; j <= (now_year === yearList[i] ? now_quarter : 4); j++) {
            fetch_detail_args_list.push([sno, yearList[i], j]);
          }
        }
      }
      //
      return promise1(function (idx, item) {
        return fetch_data(item[0], item[1], item[2]).progress(function () {
          $(".progress-bar2").text("fetch/daily:" + (arguments[0] * 100) + '%   ' + item[0] + ' ' + item[1] + ' ' + item[2])
            .css("width", (arguments[0] * 100) + '%');
        });
      }, fetch_detail_args_list).progress(function () {
        $(".progress-bar1").text("fetch/daily:" + (arguments[0] * 100) + '%')
          .css("width", (arguments[0] * 100) + '%');
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

  // 获取指定 代码，年，季度的日数据.
  function fetch_data(sno, syear, sjidu) {
    return a_get('http://money.finance.sina.com.cn/corp/go.php/vMS_MarketHistory/stockid/' + sno + '.phtml?year=' + syear + '&jidu=' + sjidu
    ).then(function (e) {
      var pos0 = e.indexOf('<table id="FundHoldSharesTable">');
      if (pos0 === -1) {
        return;
      }
      var pos1 = e.indexOf('</table>', pos0);
      //
      var html_part = e.substring(pos0, pos1 + '</table>'.length);
      var $part = $(html_part);
      var tbl_data = [];
      var $trs = $part.find('tbody tr:not(:first)');
      for (var i = 0; i < $trs.length; i++) {  // 注意: 从1开始, 跳过标题行
        var $tds = $($trs[i]).find('td');
        // 日期 开盘价 最高价 收盘价 最低价 交易量(股) 交易金额(元)
        if ($tds.length == 7) {
          var row = [sno];
          for (var j = 0; j < $tds.length; j++) {
            row.push(_.trim($($tds[j]).text()));
          }
          tbl_data.push(row)
        }
      }
      $part.remove();
      //
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
      //
      return promise1(function (idx, item) {
        return _save(item);
      }, tbl_data);
    })
  }

  // 获取制定股票代码的所有历史日数据
  module.exports = fetch_data0;

// @@@@@@@@@@@@@@@@@@@@@@@@@@
});
