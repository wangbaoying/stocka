module.exports = {
  name: "模型B",
  m: function m1(dat, get_x) {
    var ldat1 = get_x(-1);   // 获得第N天数据
    var ldat2 = get_x(-2);
    if (!ldat1 || !ldat2) return;
    if (ldat1.volume > ldat2.volume * 2) {
      return true;
    }
  },
  n: function n1(dat, get_x, trade) {
    /**
     * 1. 为回测，定义卖出条件。
     *    为了能够计算总体收益率，返回出售时的损益。
     *
     * dat 当天数据
     * get_x 用于获得特定天数的数据
     */
    var v1 = get_x(1);   // 第二天数据
    if (!v1) return;
    var v = v1.open;     // 第二天开盘价，作为成交价
    // 符合条件
    trade.log('符合条件.', dat.code, dat.date, dat.name, dat.netchange_percent, dat.close);
    trade.log('  买入...', v1.code, v1.date, v1.name, '买入价', v1.open);
    trade.set_buy(v1, v1.open);
    // 再向后推7天，检验是否找到卖出条件
    for (var i = 2; i < 8; i++) {
      var daily = get_x(i);
      if (!daily) break;
      var netchange_percent = (daily.close - v) / v * 100;  // 收益率
      // 收益大于3%，或者小于-1%。
      if (netchange_percent > 3 || netchange_percent < -1) {
        trade.log('  卖出...', daily.code, daily.date, daily.name, '卖出价', daily.close, netchange_percent.toFixed(2) + '%');
        trade.set_sell(daily, daily.close);
        return;
      }
    }
    trade.log('  没有找到合适的卖出价格...');
  }
};