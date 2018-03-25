/**
 * today: 当天数据；
 * get_x: 函数，用于获得第N天数据；
 *
 *
 */

// 判断n日内5日均线连续上涨
function isUp5(n) {
  var lst = [];  // 前n日数据，包含当天
  for (var i = 1; i <= n; i++) {
    var vda = get_x(i - n);
    if (vda) lst.push(vda);
  }
  // n日均线连续3日上涨
  var iUp = true;
  for (var i = 1; i < lst.length; i++) {
    var pvda = lst[i - 1],
      vda = lst[i];
    if (vda.avg5 <= pvda.avg5) {
      iUp = false;
      break;
    }
  }
  // 
  if (iUp) {   // 输出这n日数据作为参考
    var _out = trade.sprintf("%-4s %-10s %-7s %-7s %3s %-8s", "No.", "日期", "前收价", "收盘价", "涨跌幅", "5日均价") + "\n" +
      lst.map(function (itm, idx) {
        return trade.sprintf("%-4d %-12s %-10.2f %-10.2f %5.2f%% %-10.2f", (idx + 1), itm.date, itm.previous_close, itm.close, itm.netchange_percent, itm.avg5)
      }).join("\n");
    console.log(_out);
  }
  return iUp;
}


function isUpC(n) {
  var lst = [];  // 前n日数据，包含当天
  for (var i = 1; i <= n; i++) {
    var vda = get_x(i - n);
    if (vda) lst.push(vda);
  }
  // n日均线连续3日上涨
  var iUp = true;
  for (var i = 1; i < lst.length; i++) {
    var pvda = lst[i - 1],
      vda = lst[i];
    if (vda.netchange_percent <= 0) {
      iUp = false;
      break;
    }
    // if (vda.close <= pvda.close) {
    //   iUp = false;
    //   break;
    // }
  }
  // 
  if (iUp) {   // 输出这n日数据作为参考
    var _out = trade.sprintf("%-4s %-10s %-7s %-7s %3s %-8s", "No.", "日期", "前收价", "收盘价", "涨跌幅", "5日均价", "流通股本") + "\n" +
      lst.map(function (itm, idx) {
        return trade.sprintf("%-4d %-12s %-10.2f %-10.2f %5.2f%% %-10.2f %-10f", (idx + 1), itm.date, itm.previous_close, itm.close, itm.netchange_percent, itm.avg5, itm.circulating_capital)
      }).join("\n");
    console.log(_out);
  }
  return iUp;
}


function isDoL(lst) {
  var ret = true;
  for (var i = 0; i < lst.length; i++) {
    var pvda = lst[i - 1],
      vda = lst[i];
    if (vda.name.substring(0, 2) === 'DR'
      || vda.netchange_percent >= 0
    ) {
      ret = false;
      break;
    }
  }
  return ret;
}


function isUpL(lst) {
  var ret = true;
  for (var i = 0; i < lst.length; i++) {
    var pvda = lst[i - 1],
      vda = lst[i];
    if (vda.name.substring(0, 2) === 'DR'
      || vda.netchange_percent <= 0
    ) {
      ret = false;
      break;
    }
  }
  return ret;
}


function get_slice(start, end) {
  end = end || 0;
  var lst = [];
  for (var i = start; i <= end; i++) {
    var x = get_x(i);
    if (!x
      || Number.isNaN(x.netchange_percent)        // 非停盘日
    // || x.name.substring(0, 2) === 'DR'    // 发生了什么事？
    // || today.circulating_capital !== x.circulating_capital // 发生了什么事，流通市值发生变化。
    ) {
      return;
    }
    lst.push(get_x(i));
  }
  return lst;
}

function print_records(lst, h) {
  function print_record_a(itm, idx) {
    if (!itm) {
      return trade.sprintf("%-4s %-10s %-10s %-7s %-7s %-7s %3s %-7s %-7s", "No.", "代码", "日期", "前收价", "开盘价", "收盘价", "涨跌幅", "5日均价", "10日均价");
    } else {
      return trade.sprintf("%-4d %-12s %-12s %-10.2f %-10.2f %-10.2f %5.2f%% %-10.2f %-10.2f", (idx + 1), itm.code, itm.date, itm.previous_close, itm.open, itm.close, itm.netchange_percent, itm.avg5, itm.avg10);
    }
  }

  if (!Array.isArray(lst)) return;
  //
  !h && trade.log(print_record_a());
  for (var i = 0; i < lst.length; i++) {
    trade.log(print_record_a(lst[i], i));
  }
}


module.exports = {
  name: "PY1",
  m: function () {
    /**
     *
     * 在上涨过程中回调，
     * 或者在下跌过程中反弹，    <<<<<<<<<<<<<
     * 至少连续三天上涨且最近一天必须是阳线，
     * 且5日均线正在上穿10日均线或者当天收盘价大于10日均线价格。
     *
     * 阳线: 收盘价高于开盘价是为阳线，收盘价低于开盘价是为阴线。
     * 小盘股：流通股本小于 5 亿
     */
    if (today.circulating_capital > 500000000) {
      return false;
    }
    if (today.avg5 <= today.avg10) {
      return false;
    }

    // 
    var lst5 = get_slice(-7, -3);
    var lst3 = get_slice(-2, -0);

    if (lst5 && lst3 && isDoL(lst5) && isUpL(lst3)) { // 连续下跌5天后并连续上涨3天

      var last5_f = lst5[0],
        last5_l = lst5[lst5.length - 1], // 下跌过程中最后一天
        net_percent5 = (last5_l.close - last5_f.open) / last5_f.open;  // 跌幅
      var last3_f = lst3[0],
        last3_l = lst3[lst3.length - 1], // 上涨过程中最后一天
        net_percent3 = (last3_l.close - last3_f.open) / last3_f.open;  // 涨幅
      if (last5_l.close < last5_l.avg5      // 跌破5日均价
        && last3_l.close > last3_l.avg5     // 上传 5 日均价
          // 
        && net_percent5 < -0.1     // 前5日整体涨跌幅小于 -10% 
        // && net_percent3 > 0.05      // 后3日整体涨跌幅大于  5%
      ) {

        trade.log("符合条件：", today.date, "收盘价:", today.close, "流通股本:", today.circulating_capital);
        var lst5 = get_slice(-7, -3);
        var lst3 = get_slice(-2, -0);
        print_records(lst5);
        print_records(lst3);

        return true;
      }
      // print_records(lst5);
      // print_records(lst3);
      // return true;
    }
    return false;
  },
  n: function () {
    /**
     * 抓住上涨或下跌途中的一个小反弹，
     * 选股后于第二天9：25前集合竞价买入，
     * 第三天9：25前挂上3.7%的价格卖出，
     * 如果当天没有成交，以后每天都挂出涨幅3.7%的价格卖出，
     * 7天为限，大于7天没成交算失败（以收盘价卖出）。
     */
    //
    //
    var tomorrow = get_x(1);
    if (!tomorrow) { // 没有办法获得后一天数据时
      trade.log('  不能获得后一天数据时，无法回测。');
      return;
    }
    //
    var buy_price = tomorrow.open;
    trade.set_buy(tomorrow, buy_price);
    // 

    trade.log('  买入...', tomorrow.date, '开盘价:', buy_price.toFixed(2));
    var target_price = buy_price * 1.037;
    // 寻找卖出点...
    // 
    for (var i = 1; i <= 7; i++) {
      var daily = get_x(i);
      if (!daily) { // 没有办法获得后一天数据时
        trade.log('  不能获得后' + i + '天数据时，无法回测。');
        return;
      } else {
        if (daily.name.substring(0, 2) === 'DR') {  // 发生了什么事？
          trade.log('  发生了什么事吗？', daily.date, ' 1：流通股本发生变化；2：其它；', " 损益: 0.00");
          print_records(get_slice(1, i));
          trade.set_sell(daily, buy_price);
          return;
        }
        // 
        if (daily.high > target_price) {
          trade.log('  卖出...', daily.date, '卖出价:', target_price.toFixed(2), "损益:", (target_price - buy_price).toFixed(2));
          print_records(get_slice(1, i));
          trade.set_sell(daily, target_price);
          return;
        }
      }
    }
    //
    if (daily) {
      // 7天为限，大于7天没成交算失败（以收盘价卖出）。
      trade.log('  失败，卖出...', daily.date, '卖出价:', daily.close, "损益:", (daily.close - buy_price).toFixed(2));
      print_records(get_slice(1, 7));
      trade.set_sell(daily, daily.close);
    }
  }
};