var $ = require('jquery');
var _ = require('lodash');
var db = require('websqldb');
var saveAs = require('filesaver');
var moment = require('moment');

$("#fetchData").click(function () {
  var fdaily = require('fetch/daily');
  var sNo = $("#sNo").val();
  fdaily(sNo).done(function (ret) {
    console.log("fetch/daily done..", sNo);
  })
});

$("#exportDataB").click(function(){
  return db.execSQL(
    "SELECT * FROM stock_base " +
    " ORDER BY SCode DESC ", []
  ).then(function (t, r) {
    var i021 = new Blob([ JSON.stringify(r.rows, null, 2) ], {
        type: "text/plain;charset=utf-8"
    });
    var now_date = moment().format("YYYY-MM-DD");
    var fn = "stock_base_" + now_date + ".json";
    saveAs(i021, fn);
  });
});

$("#clearData").click(function () {
  var sNo = $("#sNo").val();
  return db.execSQLI(
    " DELETE FROM market_history WHERE SCode = ? ",
    [sNo]
  ).done(function (t, r) {
    console.log("DELETE done.", r.rowsAffected)
  });
});


var _average = function (sNo, end_date, days) {
  return db.execSQL(
    "SELECT SCode, TDate , " +
    " OPEN, HIGH, CLOSE, LOW, VOL, AMOUNT FROM market_history " +
    " WHERE SCode = ? " +
    " AND TDate <= ? " +
    " ORDER BY TDate DESC " +
    " LIMIT ? ",
    [sNo, end_date, days]
  ).then(function (t, r) {
    if (r.rows.length === days) {
      var R1 = 0, R2 = 0, R3 = 0,
        R4 = 0, R5 = 0, R6 = 0;
      for (var i = 0; i < r.rows.length; i++) {
        var row = r.rows[i];
        R1 = R1 + row.OPEN;
        R2 = R2 + row.HIGH;
        R3 = R3 + row.CLOSE;
        R4 = R4 + row.LOW;
        R5 = R5 + row.VOL;
        R6 = R6 + row.AMOUNT;
      }
      return {
        No: sNo,
        endDate: end_date,
        days: days,
        OPEN: R1 / days,
        HIGH: R2 / days,
        CLOSE: R3 / days,
        LOW: R4 / days,
        VOL: R5 / days,
        AMOUNT: R6 / days
      }
    }
  });
};

function splitData(rawData) {
  var categoryData = [];
  var values = [];
  for (var i = 0; i < rawData.length; i++) {
    categoryData.push(rawData[i].TDate);
    values.push([
      // rawData[i].SDate,
      rawData[i].OPEN,
      rawData[i].CLOSE,
      rawData[i].HIGH,
      rawData[i].LOW
    ]);
  }
  return {
    categoryData: categoryData,
    values: values
  };
}

var drawKLine = function (sNo, rows) {
  var data0 = splitData(rows);
  var echarts = require('echarts');
  // 基于准备好的dom，初始化echarts实例
  var myChart = echarts.init(document.getElementById('kline'));

  var option = {
    title: {
      text: sNo,
      left: 'center'
    },
    tooltip: {
      trigger: 'axis',
      axisPointer: {
        type: 'line'
      },
      formatter: function (params) {
        var res = params[0].seriesName + ' ' + params[0].name;
        res += '<br/>  开盘 : ' + params[0].value[0] + '  最高 : ' + params[0].value[3];
        res += '<br/>  收盘 : ' + params[0].value[1] + '  最低 : ' + params[0].value[2];
        return res;
      }
    },
    grid: {
      left: '10%',
      right: '10%',
      bottom: '15%'
    },
    xAxis: {
      type: 'category',
      data: data0.categoryData,
      scale: true,
      boundaryGap: false,
      axisLine: {onZero: false},
      splitLine: {show: false},
      splitNumber: 20,
      min: 'dataMin',
      max: 'dataMax'
    },
    yAxis: {
      scale: true,
      splitArea: {
        show: true
      }
    },
    dataZoom: [
      {
        type: 'inside',
        start: 50,
        end: 100
      },
      {
        show: true,
        type: 'slider',
        y: '90%',
        start: 50,
        end: 100
      }
    ],
    series: [
      {
        name: sNo,
        type: 'candlestick',
        data: data0.values
      },
      {
        name: 'l',
        type: 'line',
        data: data0.values.map(function (item) {
          return item[1];
        }),
        hoverAnimation: false,
        symbolSize: 6,
        itemStyle: {
          normal: {
            color: '#c23531'
          }
        },
        showSymbol: false
      }
    ]
  };
  // 使用刚指定的配置项和数据显示图表。
  myChart.setOption(option);
};

$("#fenxi02").click(function () {
  var fNo = $("#sNo").val();
  var fDays = $("#fDays").val();
  db.execSQL(
    "SELECT SCode, TDate , " +
    " OPEN, HIGH, CLOSE, LOW, VOL, AMOUNT FROM market_history " +
    " WHERE SCode = ? " +
      // " AND TDate <= ? " +
    " ORDER BY TDate DESC " +
    " LIMIT ? ",
    [fNo, fDays]
  ).done(function (t, r) {
    if (r.rows && r.rows.length > 0) {
      var rows = db.toArray(r.rows).reverse();
      drawKLine(fNo, rows);
    }
  }).fail(function (t, e) {
    console.log("xxxx", arguments);
  });
});

$("#fenxi03").click(function () {
  var xNo = $("#xNo").val();
  var xDate = $("#xDate").val();
  var xDays = parseInt($("#xDays").val());
  _average(xNo, xDate, xDays).done(function (val) {
    $("#xResult").text(JSON.stringify(val, null, 2));
  })
});

$("#fetchDataB").click(function () {
  var fbase = require('fetch/base');
  return fbase().done(function (e) {
    console.log("fetch/base done", e && e.length)
  });
});

$("#checkData").click(function () {
  var sNo = $("#sNo").val();
  return db.execSQLI(
    " SELECT COUNT(1) AS cnt FROM market_history WHERE SCode = ? ",
    [sNo]
  ).done(function (t, r) {
    console.log("Count done.", r.rows[0].cnt)
  });
});

$("#fetchAll").click(function () {
  var fdaily = require('fetch/daily');
  var fbase = require('fetch/base');
  var promise1 = require('utils/promise').promise1;

  //
  return fbase().then(function () {
    return db.execSQL(
      "SELECT SCode, Market, SName, short_name FROM stock_base " +
      " ORDER BY SCode DESC "
    ).then(function (t, r) {
      if (r.rows && r.rows.length > 0) {
        return db.toArray(r.rows).reverse();
      }
    });
  }).then(function (sBaseRows) {
    return promise1(function (idx, item) {
      return fdaily(item.SCode);
    }, sBaseRows).progress(function () {
      $(".progress-bar0").css("width", (arguments[0] * 100) + '%');
    });
  });

});

$("#jspdf1").click(function () {
  var jsPDF = require('jspdf');
console.log("...", jsPDF);

  var doc = new jsPDF();
console.log("...", doc.getFont());
  doc.setFont("Courier");
  doc.text(20, 20, 'Hello world!中文为什么不显示.');
  doc.text(20, 30, 'This is client-side Javascript, pumping out a PDF.');
  doc.addPage();
  doc.text(20, 20, 'Do you like that?');

// Output as Data URI
  doc.output('datauri');
});


