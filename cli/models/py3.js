/**
 * today: 当天数据；
 * get_x: 函数，用于获得第N天数据；
 *
 *
 */

function get_slice(start, end) {
  end = end || 0;
  var lst = [];
  for (var i = start; i <= end; i++) {
    var x = get_x(i);
    if (!x
    // || Number.isNaN(x.netchange_percent)        // 非停盘日
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

const DAYS = 10;

module.exports = {
  name: "PY2",
  m: function () {

    //if (today.ma20 > today.ma30 * 1.03 && today.low < today.ma30 * 1.015 &&
    // today.low > today.ma30 * 0.99
    // && today.close >= today.ma30
    //  && day_1.low > today.low
    //  && day_2.low > day_2.ma30
    //  && day_3.low > day_3.ma30) {
    //  return true;
    //}
    //else {
    //  return false;
    //}
    var day_1 = get_x(-1);
    var day_2 = get_x(-2);
    var day_3 = get_x(-3);
    if (!day_1 || !day_2 || !day_3) {
      return;
    }
    if (today.avg20 > today.avg30 * 1.03
      && today.low < today.avg30 * 1.015
      && today.low > today.avg30 * 0.99
      && today.close >= today.avg30
      && day_1.low > today.low
      && day_2.low > day_2.avg30
      && day_3.low > day_3.avg30
    ) {
      trade.log("符合条件：", today.date, "收盘价:", today.close.toFixed(2), "流通股本:", today.circulating_capital);
      print_records(get_slice(-3, 0));
      return true;
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
    var wl_lst = [], daily, i = 2;
    while (wl_lst.length <= 7) {
      daily = get_x(i);
      if (!daily) { // 没有办法获得后一天数据时
        trade.log('  不能获得后' + i + '天数据时，无法回测。');
        return;
      } else {
        if (Number.isNaN(daily.netchange_percent)) {
          i++;
          continue;
        }
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
      wl_lst.push(daily);
      i++;
    }

    // for (var i = 1; i <= 7; i++) {
    //   var daily = get_x(i);
    //   if (!daily) { // 没有办法获得后一天数据时
    //     trade.log('  不能获得后' + i + '天数据时，无法回测。');
    //     return;
    //   } else {
    //     if (daily.name.substring(0, 2) === 'DR') {  // 发生了什么事？
    //       trade.log('  发生了什么事吗？', daily.date, ' 1：流通股本发生变化；2：其它；', " 损益: 0.00");
    //       print_records(get_slice(1, i));
    //       trade.set_sell(daily, buy_price);
    //       return;
    //     }
    //     // 
    //     if (daily.high > target_price) {
    //       trade.log('  卖出...', daily.date, '卖出价:', target_price.toFixed(2), "损益:", (target_price - buy_price).toFixed(2));
    //       print_records(get_slice(1, i));
    //       trade.set_sell(daily, target_price);
    //       return;
    //     }
    //   }
    // }
    //
    if (daily) {
      // 7天为限，大于7天没成交算失败（以收盘价卖出）。
      trade.log('  失败，卖出...', daily.date, '卖出价:', daily.close, "损益:", (daily.close - buy_price).toFixed(2));
      print_records(get_slice(1, i - 1));
      trade.set_sell(daily, daily.close);
    }
  }
};