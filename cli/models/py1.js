/**
 * today: 当天数据；
 * get_x: 函数，用于获得第N天数据；
 * 
 * 
 */

// 判断n日内5日均线连续上涨
function isUp5(n) {
  var lst = [];  // 前n日数据，包含当天
  for (var i=1;i<=n;i++){
    var vda = get_x(i-n);
    if (vda) lst.push(vda);
  }
  // n日均线连续3日上涨
  var iUp = true;
  for (var i=1;i<lst.length;i++) {
    var pvda = lst[i-1], 
       vda = lst[i];
    if (vda.avg5 <= pvda.avg5) {
      iUp = false;
      break;
    }
  }
  // 
  if (iUp) {   // 输出这n日数据作为参考
    var _out = trade.sprintf("%-4s %-10s %-7s %-7s %3s %-8s", "No.", "日期", "前收价", "收盘价", "涨跌幅", "5日均价") + "\n" +
    lst.map(function(itm, idx) {
      return trade.sprintf(  "%-4d %-12s %-10.2f %-10.2f %5.2f%% %-10.2f", (idx+1), itm.date, itm.previous_close, itm.close, itm.netchange_percent, itm.avg5)
    }).join("\n");
    console.log(_out);
  }
  return iUp;
}


function isUpC(n) {
  var lst = [];  // 前n日数据，包含当天
  for (var i=1;i<=n;i++){
    var vda = get_x(i-n);
    if (vda) lst.push(vda);
  }
  // n日均线连续3日上涨
  var iUp = true;
  for (var i=1;i<lst.length;i++) {
    var pvda = lst[i-1], 
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
    var _out = trade.sprintf("%-4s %-10s %-7s %-7s %3s %-8s", "No.", "日期", "前收价", "收盘价", "涨跌幅", "5日均价") + "\n" +
    lst.map(function(itm, idx) {
      return trade.sprintf(  "%-4d %-12s %-10.2f %-10.2f %5.2f%% %-10.2f", (idx+1), itm.date, itm.previous_close, itm.close, itm.netchange_percent, itm.avg5)
    }).join("\n");
    console.log(_out);
  }
  return iUp;
}


module.exports = {
  name: "PY1",
  m: function () {
    /**
     * 在上涨过程中回调，或者在下跌过程中反弹，
     * 至少连续三天上涨且最近一天必须是阳线，
     * 且5日均线正在上穿10日均线或者当天收盘价大于10日均线价格。
     * 
     * 阳线: 收盘价高于开盘价是为阳线，收盘价低于开盘价是为阴线。
     */
    return (isUpC(4) && today.close > today.open);
    // 
    // return isUp(20);
  },
  n: function () {
    /**
     * 抓住上涨或下跌途中的一个小反弹，
     * 选股后于第二天9：25前集合竞价买入，
     * 第三天9：25前挂上3.7%的价格卖出，
     * 如果当天没有成交，以后每天都挂出涨幅3.7%的价格卖出，
     * 7天为限，大于7天没成交算失败（以收盘价卖出）。
     */
    var tomorrow = get_x(1);
    var buy_price = tomorrow.open;
    trade.set_buy(tomorrow, buy_price);
    trade.log("符合条件：", today.date, "收盘价:", today.close);
    trade.log('  买入...', tomorrow.date, '开盘价:', buy_price.toFixed(2));
    var target_price = buy_price * 1.037;
    // 寻找卖出点...
    for (var i=1;i<8;i++){
      var daily = get_x(i);
      if (daily.high > target_price) {
          trade.log('  卖出...', daily.date, '卖出价:', target_price.toFixed(2), "损益:", (target_price - buy_price).toFixed(2));
          trade.set_sell(daily, target_price);
          return;
      }
    }
    // 7天为限，大于7天没成交算失败（以收盘价卖出）。
    trade.log('  失败，卖出...', daily.date, '卖出价:', daily.close, "损益:", (daily.close - buy_price).toFixed(2));
    trade.set_sell(daily, daily.close);
  }
};