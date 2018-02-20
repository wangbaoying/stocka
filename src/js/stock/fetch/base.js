define("fetch/base", ["require", "exports", "module"], function (require, exports, module) {
// @@@@@@@@@@@@@@@@@@@@@@@@@@

  var $ = require('jquery');
  var _ = require('lodash');
  var moment = require('moment');
  var db = require('websqldb');
  var pinyin = require('pinyin');
  var promise1 = require('utils/promise').promise1;
  var a_get = require('utils/ajax').do_get;

  var $parse2dom = function (htmlstr, start_str, end_str) {
    var pos0 = htmlstr.indexOf(start_str);
    var pos1 = htmlstr.indexOf(end_str, pos0);
    var html_part = htmlstr.substring(pos0, pos1 + end_str.length);
    return $(html_part);
  };

  var get_code = function (htmlstr, start_str, end_str) {
    var pos0 = htmlstr.indexOf(start_str);
    var pos1 = htmlstr.indexOf(end_str, pos0);
    return htmlstr.substring(pos0 + start_str.length, pos1)
  };

  var get_short_name = function (sname) {
    return pinyin.getCamelChars(sname).toLowerCase();
  };


  // 获得 页数 列表
  var get_page_list = function () {
    return a_get('http://vip.stock.finance.sina.com.cn/q/go.php/vIR_CustomSearch/index.phtml?sr_p=-1&order=code%7C1&p=1' // 排序
    ).then(function (e) {
      var $total_div = $parse2dom(e, '<div class="number">', '</div>');
      var $list_table = $parse2dom(e, '<table class="list_table">', '</table>');
      var $trs = $list_table.find("tr:not(.head)");
      //
      var pageSize = $trs.length;  // 第1页,认为它是缺省的单页数据条数
      var totalCount = parseInt($total_div.find("span").text());
      var pageCount = Math.ceil(totalCount / pageSize);
      var ret = [];
      for (var i = 0; i < pageCount; i++) {
        ret.push(i + 1);  // make page number.
      }
      //
      $total_div.remove();
      $list_table.remove();
      return ret;
    })
  };

  var fetchThem = function () {
    // 获得指定页数的数据
    var fetch_one_page = function (pageNumber) {
      return a_get('http://vip.stock.finance.sina.com.cn/q/go.php/vIR_CustomSearch/index.phtml?sr_p=-1&order=code%7C1&p=' + pageNumber // 排序
      ).then(function (e) {
        var $list_table = $parse2dom(e, '<table class="list_table">', '</table>');
        var $trs = $list_table.find("tr:not(.head)");
        //
        var ret_list = [];
        for (var i = 0; i < $trs.length; i++) {
          var $tds = $($trs[i]).find('td');
          // 股票代码↑ 股票名称 最新评级 目标价 评级日期 综合评级 平均涨幅 评级明细 行业 摘要 最新价 涨跌幅 收藏 股吧
          if ($tds.length == 14) {
            var row = [];
            var market_code = undefined;
            var shref = $($tds[0]).find("a").attr("href");
            market_code = get_code(shref, "?q=", "&");
            market_code = market_code.substring(0, 2);
            if (market_code !== 'sz' && market_code !== 'sh') {
              continue;
            }
            row.push(_.trim($($tds[0]).text()));
            row.push(market_code);
            row.push(_.trim($($tds[1]).text()));
            row.push(get_short_name(_.trim($($tds[1]).text())));
            //
            ret_list.push(row);
          }
        }
        $list_table.remove();
        return ret_list;
      })
    };
    //
    var _save = function (item) {
      return db.execSQLI(  // do update
        " UPDATE stock_base SET " +
        " Market = ?, " +
        " SName = ?, " +
        " short_name = ? " +
        " WHERE SCode = ?",
        [item[1], item[2], item[3], item[0]]
      ).then(function (t, r) {
        if (r.rowsAffected === 0) { // do insert when no row updated
          return db.execSQLI(
            " INSERT INTO stock_base (SCode, Market, SName, short_name " +
            " ) VALUES (?, ?, ?, ?)",
            item
          ).then(function (t, r) {
            return r;
          })
        }
        return r;
      })
    };

    //
    return get_page_list().then(function (pageList) {
      $(".progress-bar0").text("fetch/base 下载基本信息:" + pageList.length);
      //
      return promise1(function (idx, item) {
        return fetch_one_page(item).then(function (tbl_data) {
          return promise1(function (idx1, item1) {
            return _save(item1);
          }, tbl_data);
        }).progress(function () {
          $(".progress-bar2").text("fetch/base:" + (arguments[0] * 100) + '%').css("width", (arguments[0] * 100) + '%');
        });
      }, pageList).progress(function () {
        $(".progress-bar1").text("fetch/base:" + (arguments[0] * 100) + '%').css("width", (arguments[0] * 100) + '%');
      });
    });
  };

  var fetch_data0 = function () {
    $(".progress-bar0").text("fetch/base 下载基本信息:");
    // 获得prefs
    var get_prefs = function (name, def_value) {
      return db.execSQLI(  // do update
        " SELECT name, value FROM prefs " +
        " WHERE name = ? "
          [name]
      ).then(function (t, r) {
        if (r.rows && r.rows.length === 1) {
          return JSON.parse(r.rows[0].value);
        }
        return def_value;
      });
    };

    // 设置prefs
    var set_prefs = function (name, value) {
      var JSON_val = JSON.stringify(value);
      return db.execSQLI(  // do update
        " UPDATE prefs SET " +
        " value = ? " +
        " WHERE name = ?",
        [JSON_val, name]
      ).then(function (t, r) {
        if (r.rowsAffected === 0) { // do insert when no row updated
          return db.execSQLI(
            " INSERT INTO prefs (name, value " +
            " ) VALUES (?, ?)",
            [name, JSON_val]
          ).then(function (t, r) {
            return r;
          })
        }
        return r;
      });
    };


    // 根据最后同步时间判断是否需要同步
    return $.when(get_prefs('base_sync_date', '0000-00-00')).then(function (last_sync_date) {
      var now_date = moment().format("YYYY-MM-DD");
      if (last_sync_date < now_date) {
        return fetchThem().done(function () {
          return set_prefs('base_sync_date', now_date);
        });
      }
      $(".progress-bar0").text("fetch/base 基本信息是最新的, 不需要下载.");
    });
  };

  // 获取所支持的所有 股票 代码 对照表
  module.exports = fetch_data0;

// @@@@@@@@@@@@@@@@@@@@@@@@@@
});
