/**
 * 在上涨过程中回调，或者在下跌过程中反弹，
 * 至少连续三天上涨且最近一天必须是阳线，
 * 且5日均线正在上穿10日均线或者当天收盘价大于10日均线价格。
 */
module.exports = {
  name: "Hero-sun",
  m: function (today, get_x) {
    /**
     * today: 当天数据；
     * get_x: 函数，用于获得第N天数据；
     */
    if (today.avg5 > today.avg10) { // 5日均线上穿10日均线
      return true;
    }
  },
  n: function (today, get_x, trade) {
    /**
     * 抓住上涨或下跌途中的一个小反弹，
     * 选股后于第二天9：25前集合竞价买入，
     * 第三天9：25前挂上3.7%的价格卖出，
     * 如果当天没有成交，以后每天都挂出涨幅3.7%的价格卖出，
     * 7天为限，大于7天没成交算失败（以收盘价卖出）。
     */
    var tomorrow = get_x(1);
    trade.log(today.code, today.name, today.date, today.avg5, today.avg10, tomorrow.open, tomorrow.close, tomorrow.netchange_percent);
  }
};