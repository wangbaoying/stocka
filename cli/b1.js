var analysis = require('./b.js');
/**
 * 参数1： 股票代码，指定时分析指定的股票，指定为 undefined 时则分析全部股票数据；
 * 参数2： 模型列表。
 */
analysis('0600000', ['models/py1.js']);
