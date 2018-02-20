define("websqldb", ["require", "exports", "module"], function (require, exports, module) {
// @@@@@@@@@@@@@@@@@@@@@@@@@@

  var $ = require('jquery');

  var dbInfo = {
    dbName: "Py2StockDB",                 // 名称
    dbVersion: "0.1",                     // 版本
    dbDisplayName: "Py2StockDB Database", // 显示名称
    dbEstimatedSize: 100 * 11024 * 1024   // 大小 (byte)
  };

  var _db = undefined;

  function createDB() {
    if (_db === undefined) {
      _db = window.openDatabase(dbInfo.dbName,
        dbInfo.dbVersion,
        dbInfo.dbDisplayName,
        dbInfo.dbEstimatedSize);
    }
    return _db;
  }

  function execSQL() {
    var d = new $.Deferred;
    var db = createDB();
    var args = Array.prototype.slice.call(arguments, 0, 2); // convert to a javascript array.
    while (args.length !== 2) {
      args.push(undefined);
    }
    // 
    args.push(function () { // success callback
      d.resolve.apply(d, Array.prototype.slice.call(arguments, 0));
    });
    args.push(function () { // error callback
      d.reject.apply(d, Array.prototype.slice.call(arguments, 0));
    });
    //
    db.transaction(function (tx) {
      tx.executeSql.apply(tx, args);
    });
    return d;
  }

  /**
   * 忽略错误.
   *
   * @returns {Deferred}
   */
  function execSQLI() {
    var d = new $.Deferred;
    var db = createDB();
    var args = Array.prototype.slice.call(arguments, 0, 2); // convert to a javascript array.
    while (args.length !== 2) {
      args.push(undefined);
    }
    //
    var handler = function () { // always resolve
      d.resolve.apply(d, Array.prototype.slice.call(arguments, 0));
    };
    //
    args.push(handler);
    args.push(handler);
    //
    db.transaction(function (tx) {
      tx.executeSql.apply(tx, args);
    });
    return d;
  }

  function createTables() {
    return $.when(
      // StockBase 股票 基本面信息
      execSQL(" CREATE TABLE IF NOT EXISTS stock_base (" +
          // 代码, 市场(sz:深证,sh:上证), 中文名, 拼音缩写
        " SCode TEXT, Market TEXT, SName TEXT, short_name TEXT, " +
          // TODO: 流通, 资本(CAPITAL) 等信息
        " PRIMARY KEY (SCode))"),
      // MarketHistory 日数据
      execSQL(" CREATE TABLE IF NOT EXISTS market_history (" +
          // 代码,交易日期
        "SCode TEXT, TDate TEXT, " +
          // 开盘价,最高价,收盘价,最低价,交易量(股),交易金额(元)
        "OPEN REAL, HIGH REAL, CLOSE REAL, LOW REAL, VOL REAL, AMOUNT REAL, PRIMARY KEY (SCode, TDate))"),
      // 各种属性设置 key->value
      execSQL(" CREATE TABLE IF NOT EXISTS prefs (" +
        "name TEXT, value TEXT, " +
        "segment1 TEXT, segment2 TEXT, segment3 TEXT, segment4 TEXT, segment5 TEXT, PRIMARY KEY (name))")
    ).fail(function () {
      console.log("createTables fail...", arguments)
    });
  }

  //
  var tbl_created = false;
  createTables().done(function (e) {
    tbl_created = true;
  });

  //
  exports.execSQL = function (sql, args) {
    if (!tbl_created) {
      throw new TypeError("数据库没有初始化.");
    }
    return execSQL.apply(exports, Array.prototype.slice.call(arguments, 0));
  };

  exports.execSQLI = function (sql, args) {
    if (!tbl_created) {
      throw new TypeError("数据库没有初始化.");
    }
    return execSQLI.apply(exports, Array.prototype.slice.call(arguments, 0));
  };

  exports.toArray = function ResultSetToArray(resultSet) {
    var rows = [];
    for (var i = 0; i < resultSet.length; i++) {
      rows.push(resultSet[i]);
    }
    return rows;
  };


// @@@@@@@@@@@@@@@@@@@@@@@@@@
});
