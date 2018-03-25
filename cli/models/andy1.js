/*

 mode2 :      212/983 rate:21.57 |    120/983 2 days rate:12.21
 mode6 :     477/1325 rate:36.00 |   130/1325 2 days rate:9.81        <=====
 mode211 :    170/678 rate:25.07 |     90/678 2 days rate:13.27
 mode222 :  1538/3906 rate:39.38 |   454/3906 2 days rate:11.62       <=====
 mode2222 : 1145/2720 rate:42.10 |   265/2720 2 days rate:9.74        <=====
 mode25 :    934/2362 rate:39.54 |   257/2362 2 days rate:10.88       <=====
 mode31 :     113/227 rate:49.78 |     17/227 2 days rate:7.49        <=====
 mode11 :     100/304 rate:32.89 |     27/304 2 days rate:8.88        <=====
 mode101 :  1804/7946 rate:22.70 |  1106/7946 2 days rate:13.92
 mode102 :   808/3466 rate:23.31 |   510/3466 2 days rate:14.71
 mode1 :     679/3669 rate:18.51 |   453/3669 2 days rate:12.35
 mode5 :   9876/23846 rate:41.42 | 3015/23846 2 days rate:12.64      <=====
 mode51 :    534/1408 rate:37.93 |   204/1408 2 days rate:14.49      <=====
 mode52 :    543/1471 rate:36.91 |   224/1471 2 days rate:15.23      <=====
 mode53 :    477/1514 rate:31.51 |   224/1514 2 days rate:14.80      <=====

 mode4 : 944/5596 rate:16.87 | 756/5596 2 days rate:13.51
 mode41 : 198/737 rate:26.87 | 111/737 2 days rate:15.06
 mode42 : 71/293 rate:24.23 | 37/293 2 days rate:12.63
 mode12 : 971/5720 rate:16.98 | 688/5720 2 days rate:12.03

 mode212 : 76/238 rate:31.93 | 39/238 2 days rate:16.39 <=====
 mode123 : 111/483 rate:22.98 | 46/483 2 days rate:9.52
 mode233 : 134/425 rate:31.53 | 53/425 2 days rate:12.47 <=====
 mode3 : 110/234 rate:47.01 | 27/234 2 days rate:11.54   <=====

 mode32 : 938/2681 rate:34.99 | 347/2681 2 days rate:12.94  <=====
 mode33 : 36/117 rate:30.77 | 20/117 2 days rate:17.09

 */
document.body.style.border = "5px solid red";

var modes_str = 'mode6,modeTOP1,modeTOP2,mode222,mode2222,mode31,mode2,mode25,mode211,mode5,mode51,mode52,mode53,mode111,mode11,mode101,mode102,mode1,mode4,mode41,mode42,modeTOP,mode310,mode301,mode303,mode313,mode3,mode32,mode33,mode12,mode212,mode123,mode233';

var display_modes_str = 'mode6,modeTOP1,modeTOP2,mode222,mode2222,mode31,mode2,mode25,mode211,mode5,mode51,mode52,mode53,mode111,mode11,mode101,mode102,mode1,mode4,mode41,mode42,modeTOP,mode310,mode301,mode303,mode313';
var filter_modes_str = 'mode6,modeTOP1,modeTOP2,mode222,mode2222,mode31,mode2,mode25,mode211,mode5,mode51,mode52,mode53,mode111,mode11,mode101,mode102,mode1,mode4,mode41,mode42';

//当日监控模型
var j_modes_str = 'j1,j2,j3,j4,j222,j2222';

var j1_des = '昨日倒纺锤，低开，拉升监控';
var j2_des = '强势股首阴,大于30日最低30%,5日线大于10日线2%,阴收高于5日线，第二天监控低开触5日线';
var j3_des = '涨停开板跟踪，前一天是一字板';

var j4_des = '强势股跟踪,触5日线，10日线监控';

var j222_des = '单日涨幅高于4%,2日回调，破5日线，接近10日线监控';
var j2222_des = '2日振幅>4%,2日回调，破5日线，接近10日线监控';


//尾盘买入模型,2:30运行
var w1_des = '强势股首阴，买入底仓';
var w2_des = '小涨幅突破30日最高，10日线上稳过5日线，高于20日线';
var w3_des = '底部上升,过5日线，缓慢接近10,20日线，5日无新低';
var w4_des = '5日之内两次上穿5日和10日线';
var w5_des = '大幅上升股跟踪，今日接近10,20日线';

////复盘模型
//强势股涨中继
var mode6_des = '昨日倒纺锤，今日从底部开拉，高过昨日开盘价';
var modeTOP1_des = '强势股首阴,大于30日最低30%,5日线大于10日线2%,阴收高于5日线';
var modeTOP2_des = '强势股小涨幅,大于30日最低30%,5日线大于10日线2%,小涨幅<3.5%,高于5日线';

var mode222_des = '单日涨幅高于4%,2日回调';
var mode2222_des = '2日振幅>4%,2日回调';

//监控
var mode31_des = '涨停开版跟踪，前一天是一字板';

var mode2_des = '小涨幅突破30日最高，10日线上稳过5日线，高于20日线';
var mode25_des = '5日之内两次上穿5日和10日线';
var mode211_des = '前3日2.5%以上涨幅，20日新高，光头阳线（无套人），缩量回调2日（>0% && <1.5%)且无套人，不破均线';

//强势股触线反弹
var mode5_des = '大幅上升股跟踪，5日线和10日线之间差3%以上';
var mode51_des = '大幅上升股跟踪，昨日接近5日线，今日接近10日线';
var mode52_des = '大幅上升股跟踪，昨日接近5日线，今日接近20日线';
var mode53_des = '大幅上升股跟踪，昨日接近5日线，今日接近30日线';

//底部反转模型
var mode111_des = '底部上升,过5日线，缓慢接近10,20日线，5日无新低';
var mode11_des = 'mode1的后续，涨3%破线，而前两日在20日线下（涨幅小于1.5%),近3月最高在15%以上+当日高于20日最高,最高-收盘<1%（无套人）或者量都小于第一日,后续两天最高都大于第一日';
var mode101_des = ' mode1潜伏，穿入穿出(前mode7),ma5高于ma20 2%，强反弹';
var mode102_des = ' mode1潜伏，ma5,ma10在上，上触20日线的';
var mode1_des = '涨>1%涨破5,10,20,30日线，无套人';

//缓升股
var mode4_des = '均匀上升超过10日，顶部股today.close>=max*0.9，f_count_4=0,阴线收盘';
var mode41_des = '均匀上升超过10日，首近10日线';
var mode42_des = '均匀上升股,首近20日线';

//备选股票池
var modeTOP_des = '强势股跟踪,大于30日最低30%';
var mode310_des = '涨停板跟踪';
var mode301_des = '跌停板跟踪';
var mode303_des = '涨3%跟踪';
var mode313_des = '跌3%跟踪';

//旭日初升，只有大盘强势时使用，否则是反指
var mode12_des = '涨>1%破20线，而前两日在20日线下且涨幅小于1.5，无套人';
var mode212_des = '底部开拉2%,再涨1%,再涨2%，1天高过ma5 1%';
var mode123_des = 'ma5上拉1%再拉2%，无套人';
var mode233_des = '高于5日线，1天涨1,第2天涨2.5-4%,第3天';

//历史模型
var mode3_des = '大振幅跟踪，连续3日涨幅大于3% 但不涨停';
var mode32_des = '顶部股跟踪，30日最高，且涨3%，或者昨日3%';
var mode33_des = '高于5日线，1天涨3,第2天涨3-4%,第3天';

var DAY = "d";
var MINITE = "m";
var WEEK = "w";
var MONTH = "mon";

var notekey;

var d_url1 = 'https://xueqiu.com/stock/forchartk/stocklist.json?symbol=';
var d_url2 = '&period=1day&type=before&begin='; //type=normal正常 type=before 前复权
var d_url3 = '&end=';


var m_url1 = 'https://xueqiu.com/stock/forchart/stocklist.json?symbol=';
var m_url2 = '&period=1d&one_min=1';

//var script=document.createElement("script");
//script.type="text/javascript";
//script.src="jquery.js";
//document.getElementsByTagName('head')[0].appendChild(script);

function dk(request, sender, sendResponse) {

//var SRAttachmentsArea = document.getElementsByClassName("Fl(end) Mt(3px) Cur(p)");
  if (request.command == 'get_dk') {
    var k_type = DAY;
    var stock_str = request.stock_str;
    notekey = request.notekey;
    get_d_k(stock_str);
  }
  else if (request.command == 'monitor') {
    var k_type = DAY;
    var stock_str = request.stock_str;
    notekey = request.notekey;
    jiankong(stock_str);
  }
  //browser.runtime.onMessage.removeListener(dk);
}

var modes = modes_str.split(',');
var j_modes = j_modes_str.split(',');

//初始化
for (mode of modes) {
  eval('var ' + mode + '_stockstr=""');
  eval('var ' + mode + '_stockcount=0');
  eval('var ' + mode + '_y_stockstr=""');
  eval('var ' + mode + '_f_stockstr=""');
}

for (j_mode of j_modes) {
  eval('var ' + j_mode + '_stockstr=""');
  eval('var ' + j_mode + '_stockcount=0');
}

//计算市场强弱指数
function cal_weather(ceiling_count, floor_count, high_count, low_count, mid1_count, mid2_count) {
  var w = ((ceiling_count - floor_count) / (ceiling_count + floor_count + 5) * 0.35 + (high_count - low_count) / (high_count + low_count + 10) * 0.15 + (mid1_count - mid2_count) / (mid1_count + mid2_count + 10) * 0.5) * 5;
  return w;
}

function get_d_k(stock_str) {
  //初始化
  var overtop_stockstr = ''; //超过3月顶的股票
  var top_stockstr = ''; //接近3月顶10%以内的股票
  var middle_stockstr = ''; //中部股
  var foot_stockstr = ''; //脚步股，接近3月底10%以内的股票

  var raising_stockstr = '';    //上升趋势股，(10日内7日在5日线上)
  var new_stockstr = '';        //次新股
  var new_open_stockstr = '';   //次新开版预警
  var new_nonopen_stockstr = '';   //次新尚未开版监控
  var new_raise_stockstr = '';   //次新连涨预警，连续3日收在5日线上且红盘

  var ceiling_count = 0; //涨停数
  var floor_count = 0; //跌停数
  var high_count = 0;  //涨>=3.5%以上个数
  var low_count = 0;  //跌<=-2.5%以下个数
  var mid1_count = 0;  //0%到1.5%个数
  var mid2_count = 0;  //-1.5%到0%个数
  var weather_ind = 0; //市场强弱指数,-5到5

  var non_stockstr = ''; //退市或该事件段无数据的股票

  //清空
  for (mode of modes) {
    eval(mode + '_stockstr=""');
    eval(mode + '_stockcount=0');
    eval(mode + '_y_stockstr=""');
    eval(mode + '_f_stockstr=""');
  }

  var stock_codes = stock_str.split(',');

  var today_date = new Date();
  today_date.setHours(0, 0, 0, 0);
  if (today_date.getDay() == 0) {
    var t = new Date(today_date.getTime() - 2000 * 60 * 60 * 24);
    today_date = t;
  }
  else if (today_date.getDay() == 6) {
    var t = new Date(today_date.getTime() - 1000 * 60 * 60 * 24);
    today_date = t;
  }

  var day_90 = new Date();
  day_90.setHours(0, 0, 0, 0);
  day_90.setMonth(day_90.getMonth() - 3);
  console.log(day_90);

  var time1 = day_90.getTime();
  var time2 = today_date.getTime();
  console.log(time1);
  console.log(time2);

  v_count = 0;
  v_count_limit = stock_codes.length;

  //add progress bar
  var bar_bottom = document.createElement('div');
  bar_bottom.setAttribute('class', 'bar_bottom');
  bar_bottom.setAttribute('style', 'border: 1px solid #F00;color: black;width: 500px;position:absolute;z-index:99999;position: fixed;top:0px;');

  var bar_inner = document.createElement('div');
  bar_inner.setAttribute('class', 'progress-bar');
  bar_inner.setAttribute('style', 'width: 0%;background-color: blue;color: white;height: 15px;white-space: nowrap;position:absolute;z-index:99999;');

  bar_bottom.appendChild(bar_inner);

  document.body.insertBefore(bar_bottom, document.body.firstChild);
  document.body.appendChild(bar_bottom);

  for (var k = 0; k < stock_codes.length; k++) {
    var stock_code1 = add_stocktype(stock_codes[k]);
    var d_url = d_url1 + stock_code1 + d_url2 + time1 + d_url3 + time2;

    $.get(d_url, function (data, status) {
      if (data.stock != undefined && data.chartlist != undefined) {
        var stock_code = data.stock.symbol.substr(2);
        var chartlist = data.chartlist;

        if (chartlist[(chartlist.length - 1)] != undefined) {
          var last_date = new Date(Date.parse(chartlist[(chartlist.length - 1)].time));
          if (last_date.getFullYear() == today_date.getFullYear() && last_date.getMonth() == today_date.getMonth() && last_date.getDate() == today_date.getDate()) {
            if (chartlist.length >= 3) {
              if (chartlist[0].percent == 0 && chartlist[1].percent >= 9.99 && chartlist[2].percent >= 9.99) {
                new_stockstr = concat_codestr(new_stockstr, stock_code);
                var today = chartlist[chartlist.length - 1];
                var day_1 = chartlist[chartlist.length - 2];
                var day_2 = chartlist[chartlist.length - 3];
                if (day_1.percent >= 9.99 && (today.volumn > day_1.volumn * 2 || today.chg > 2)) {
                  new_open_stockstr = concat_codestr(new_open_stockstr, stock_code);
                }
                if (today.percent >= 9.99) {
                  new_nonopen_stockstr = concat_codestr(new_nonopen_stockstr, stock_code);
                }
                if (today.percent > 0 && today.close > today.ma5 && day_1.percent > 0 && day_1.close > day_1.ma5 && day_2.percent > 0 && day_2.close > day_2.ma5) {
                  new_raise_stockstr = concat_codestr(new_raise_stockstr, stock_code);
                }
              }

            }
            if (chartlist.length >= 7) {
              var today = chartlist[chartlist.length - 1];
              var day_1 = chartlist[chartlist.length - 2];
              var day_2 = chartlist[chartlist.length - 3];
              var day_3 = chartlist[chartlist.length - 4];
              var day_4 = chartlist[chartlist.length - 5];
              var day_5 = chartlist[chartlist.length - 6];

              var j = 0;

              var max = 0;
              var min = 0;
              var max_30 = 0;          // 20日最高
              var min_30 = 0;          // 20日最低
              var upper_count_5 = 0;   // 5日线上日
              var upper_count_20 = 0;  // 20日线上日
              var jump_count_20 = 0;   // 下穿20日线日
              var pump_count_20 = 0;   // 上穿20日线日
              var pump_count_10 = 0;   // 上穿5日10日线日
              var f_count = 0;         // 10日内振幅超过4的日数
              var f_count_4 = 0;       // 4日振幅超过3的日数

              if (today.percent > 9.9) {
                ceiling_count++;
              } else if (today.percent < -9.9) {
                floor_count++;
              } else if (today.percent >= 3.5) {
                high_count++;
              } else if (today.percent <= -2.5) {
                low_count++;
              } else if (today.percent >= 0 && today.percent < 1.5) {
                mid1_count++;
              } else if (today.percent < 0 && today.percent > -1.5) {
                mid2_count++;
              }

              //alert("close: " + chartlist[chartlist.length-1].close +"\nlength: " + chartlist.length + "\nstatus: " + status);
              //alert("last_date: " + chartlist[chartlist.length-1].time +"\nbegin_date: " + chartlist[0].time );
              //从昨日开始计算各种数值
              for (var i = chartlist.length - 2; i >= 0; i--) {
                j = j + 1;
                if (j == 1) {
                  max = chartlist[i].close;
                  min = chartlist[i].close;
                }
                else {
                  max = chartlist[i].high > max ? chartlist[i].high : max;
                  min = chartlist[i].low < min ? chartlist[i].low : min;
                }
                //alert("chartlist[i].close: " + chartlist[i].close +"\nchartlist[i].ma5: " + chartlist[i].ma5 );

                if (j <= 6) {
                  if (chartlist[i].low < chartlist[i].ma5 && chartlist[i].close >= chartlist[i].ma5
                    && chartlist[i].low < chartlist[i].ma10 && chartlist[i].close >= chartlist[i].ma10
                    && chartlist[i].ma5 > chartlist[i].ma20 && chartlist[i].ma10 > chartlist[i].ma20 && chartlist[i].percent > 0) {
                    pump_count_10 = pump_count_10 + 1;
                  }
                }

                if (j <= 10) {
                  if (chartlist[i].close > chartlist[i].ma5 && chartlist[i].ma10 > chartlist[i].ma20) {
                    upper_count_5 = upper_count_5 + 1;
                  }
                  if (chartlist[i].close > chartlist[i].ma20) {
                    upper_count_20 = upper_count_20 + 1;
                  }
                  if (chartlist[i].open > chartlist[i].ma20 && chartlist[i].close < chartlist[i].ma20) {
                    jump_count_20 = jump_count_20 + 1;
                  }
                  if (chartlist[i].open < chartlist[i].ma20 && chartlist[i].close > chartlist[i].ma20) {
                    pump_count_20 = pump_count_20 + 1;
                  }
                  if ((chartlist[i].high - chartlist[i].low) / chartlist[i].close * 100 > 4) {
                    f_count = f_count + 1;
                  }
                }
                if (j <= 4) {
                  if ((chartlist[i].high - chartlist[i].low) / chartlist[i].close * 100 > 3 && chartlist[i].high > chartlist[i - 1].high) {
                    f_count_4 = f_count_4 + 1;
                  }
                }

                if (j == 30 || (j < 30 && i == 0)) {
                  max_30 = max;
                  min_30 = min;
                }
              }

              if (today.close >= max * 0.98) {
                overtop_stockstr = concat_codestr(overtop_stockstr, stock_code);
              }
              else if (today.close >= max * 0.9 && today.close < max * 0.98) {
                top_stockstr = concat_codestr(top_stockstr, stock_code);
              }
              else if (today.close <= min * 1.1) {
                foot_stockstr = concat_codestr(foot_stockstr, stock_code);
              }
              else {
                middle_stockstr = concat_codestr(middle_stockstr, stock_code);
              }
              if (upper_count_5 >= 7) {
                raising_stockstr = concat_codestr(raising_stockstr, stock_code);
              }

              for (mode of modes) {
                if (eval(mode + '(today,day_1,day_2,day_3,day_4,max,min,max_30,min_30,upper_count_5,upper_count_20,jump_count_20,pump_count_20,pump_count_10,f_count,f_count_4)')) {
                  eval(mode + '_stockstr=concat_codestr(' + mode + '_stockstr,stock_code)');
                  eval(mode + '_stockcount=' + mode + '_stockcount+1');
                }

              }
              //监控昨日符合条件股的今日表现
              j = 0;

              max = 0;
              min = 0;
              max_30 = 0;         // 20日最高
              min_30 = 0;         // 20日最低
              upper_count_5 = 0;  // 5日线上日
              upper_count_20 = 0; // 20日线上日
              jump_count_20 = 0;  // 下穿20日线日
              pump_count_20 = 0;  // 上穿20日线日
              pump_count_10 = 0;  // 上穿5日10日线日
              f_count = 0;        // 10日内振幅超过4的日数
              f_count_4 = 0;      // 4日振幅超过3的日数

              //从前日开始计算
              for (var i = chartlist.length - 3; i >= 0; i--) {
                j = j + 1;
                if (j == 1) {
                  max = chartlist[i].close;
                  min = chartlist[i].close;
                }
                else {
                  max = chartlist[i].high > max ? chartlist[i].high : max;
                  min = chartlist[i].low < min ? chartlist[i].low : min;
                }
                //alert("chartlist[i].close: " + chartlist[i].close +"\nchartlist[i].ma5: " + chartlist[i].ma5 );
                if (j <= 6) {
                  if (chartlist[i].low < chartlist[i].ma5 && chartlist[i].close >= chartlist[i].ma5
                    && chartlist[i].low < chartlist[i].ma10 && chartlist[i].close >= chartlist[i].ma10
                    && chartlist[i].ma5 > chartlist[i].ma20 && chartlist[i].ma10 > chartlist[i].ma20 && chartlist[i].percent > 0) {
                    pump_count_10 = pump_count_10 + 1;
                  }
                }
                if (j <= 10) {
                  if (chartlist[i].close > chartlist[i].ma5) {
                    upper_count_5 = upper_count_5 + 1;
                  }
                  if (chartlist[i].close > chartlist[i].ma20) {
                    upper_count_20 = upper_count_20 + 1;
                  }
                  if (chartlist[i].open > chartlist[i].ma20 && chartlist[i].low < chartlist[i].ma20 && chartlist[i].ma5 >= chartlist[i].ma20 * 1.018) {
                    jump_count_20 = jump_count_20 + 1;
                  }
                  if (chartlist[i].open <= chartlist[i].ma20 && chartlist[i].close > chartlist[i].ma20 * 1.01 && chartlist[i].percent > 2) {
                    pump_count_20 = pump_count_20 + 1;
                  }
                  if ((chartlist[i].high - chartlist[i].low) / chartlist[i].close * 100 > 4) {
                    f_count = f_count + 1;
                  }
                }
                if (j <= 4) {
                  if ((chartlist[i].high - chartlist[i].low) / chartlist[i].close * 100 > 3 && chartlist[i].high > chartlist[i - 1].high) {
                    f_count_4 = f_count_4 + 1;
                  }
                }

                if (j == 30 || (j < 30 && i == 0)) {
                  max_30 = max;
                  min_30 = min;
                }
              }

              for (mode of modes) {
                if (eval(mode + '(day_1,day_2,day_3,day_4,day_5,max,min,max_30,min_30,upper_count_5,upper_count_20,jump_count_20,pump_count_20,pump_count_10,f_count,f_count_4)')) {
                  eval(mode + '_y_stockstr=concat_codestr(' + mode + '_y_stockstr,stock_code)');
                }

              }
            }
          }
        } else {
          non_stockstr = concat_codestr(non_stockstr, stock_code);
        }
      }
      v_count = v_count + 1;

      //progress percentage
      if (v_count % 100 == 0 || v_count >= v_count_limit) {
        update_stock_code_dk(notekey + '_per', String(v_count) + '/' + String(v_count_limit));

        $(".progress-bar").text("analyzing stocks:" + String(v_count) + '/' + String(v_count_limit) + '  ' + String((v_count / v_count_limit * 100).toFixed(2)) + '% ')
          .css("width", String((v_count / v_count_limit * 100).toFixed(2)) + '%');

      }

      if (v_count >= v_count_limit) {
        $('.progress-bar').remove();

        update_stock_code_dk(notekey + '_overtop', overtop_stockstr, 'update_note');
        update_stock_code_dk(notekey + '_top', top_stockstr, 'update_note');
        update_stock_code_dk(notekey + '_middle', middle_stockstr, 'update_note');
        update_stock_code_dk(notekey + '_foot', foot_stockstr, 'update_note');
        update_stock_code_dk(notekey + '_raising', raising_stockstr, 'update_note');
        update_stock_code_dk(notekey + '_new', new_stockstr, 'update_note');
        update_stock_code_dk(notekey + '_new_open', new_open_stockstr, 'update_note');
        update_stock_code_dk(notekey + '_new_nonopen', new_nonopen_stockstr, 'update_note');
        update_stock_code_dk(notekey + '_new_raise', new_raise_stockstr, 'update_note');

        for (mode of modes) {
          eval('update_stock_code_dk(notekey+"_' + mode + '",' + mode + '_stockstr,"update_note")');
          eval('update_stock_code_dk(notekey+"_' + mode + '_y",' + mode + '_y_stockstr,"update_note")');
        }
        update_stock_code_dk(notekey + '_non', non_stockstr, 'update_note');

        weather_ind = cal_weather(ceiling_count, floor_count, high_count, low_count, mid1_count, mid2_count);
        //display
        insertbnt();

        var codearea = document.getElementById("codearea");
        var weather_div = document.createElement('div');
        weather_div.setAttribute('id', 'weather');
        var weather_li = document.createElement('li');

        var weather_str = '';
        if (weather_ind >= 3) {
          weather_str = '超强';
        } else if (weather_ind <= -3) {
          weather_str = '超弱';
        } else if (weather_ind >= 1) {
          weather_str = '强';
        } else if (weather_ind < 0) {
          weather_str = '弱';
        } else {
          weather_str = '中';
        }

        weather_li.innerHTML = '<br><h4>市场强弱指数：' + weather_ind + '  (' + weather_str + ')</h4></br>' + '<br>涨停数:' + ceiling_count + ' <br>跌停数:' + floor_count + ' <br>涨>=3.5%以上个数:' + high_count + ' <br>跌<=-2.5%以下个数:' + low_count + ' <br>0%到1.5%个数:' + mid1_count + ' <br>-1.5%到0%个数:' + mid2_count + '</br>';
        weather_div.appendChild(weather_li);
        codearea.appendChild(weather_div);

        var modes_dis = display_modes_str.split(',');
        for (mode_dis of modes_dis) {
          eval('insert_codes("' + mode_dis + '","("+' + mode_dis + '_stockcount+")"+' + mode_dis + '_des,' + mode_dis + '_stockstr)');
        }
        show_codes();
      }
    });
  }
}

function start_all_filter() {
  var modes_f = filter_modes_str.split(',');
  for (mode_f of modes_f) {
    eval('filter("' + mode_f + '",' + mode_f + '_stockstr)');
  }
  //filter('mode1','600497');
}

function filter(in_str_name, in_stock_str) {
  //filter modes
  var mode1_codes = ''; //贴地行走,低不过0
  var mode1 = 0;
  var mode2_codes = ''; //U形
  var mode2 = 0;
  var mode3_codes = ''; //尾盘拉升
  var mode3 = 0;
  var mode4_codes = ''; //套人
  var mode4 = 0;
  var mode5_codes = ''; //接近5日线，接近10日线
  var mode5 = 0;
  var mode6_codes = ''; //破5日线
  var mode6 = 0;

  var stock_codes = in_stock_str.split(',');

  var v_count = 0;
  var v_count_limit = stock_codes.length;

  //add progress bar
  var bar_bottom = document.createElement('div');
  bar_bottom.setAttribute('id', in_str_name + '_bar_bottom');
  bar_bottom.setAttribute('style', 'border: 1px solid #F00;width: 600px;background-color: black;position:absolute;z-index:99999;position: fixed;top:0px;');

  var bar_inner = document.createElement('div');
  bar_inner.setAttribute('id', in_str_name + '_progress-bar');
  bar_inner.setAttribute('style', 'width: 0%;background-color: blue;color: white;height: 15px;white-space: nowrap;position:absolute;z-index:99999;');

  bar_bottom.appendChild(bar_inner);

  document.body.appendChild(bar_bottom);

  var strong_codes = '';
  var strong = 0;


  for (var k = 0; k < stock_codes.length; k++) {
    var stock_code1 = add_stocktype(stock_codes[k]);
    var m_url = m_url1 + stock_code1 + m_url2;

    $.get(m_url, function (data, status) {
      //var price_url='https://xueqiu.com/v4/stock/quote.json?code='+stock_code1;
      var today_date = new Date();
      today_date.setHours(0, 0, 0, 0);

      if (today_date.getDay() == 1) {
        var t = new Date(today_date.getTime() - 3000 * 60 * 60 * 24);
        var yesterday = t;
      }
      else {
        var t = new Date(today_date.getTime() - 1000 * 60 * 60 * 24)
        var yesterday = t;
      }

      var time1 = yesterday.getTime();
      var time2 = today_date.getTime();
      var d_url = d_url1 + stock_code1 + d_url2 + time1 + d_url3 + time2;

      $.get(d_url, function (data1, status) {
        if (data1 != undefined) {
          //{"stock":{"symbol":"SH600071"},"success":"true","chartlist":[{"volume":2725234,"open":25.46,"high":25.65,"close":25.19,"low":25.0,"chg":0.02,"percent":0.08,"turnrate":1.15,"ma5":24.974,"ma10":25.474,"ma20":24.074,"ma30":23.761,"dif":0.47,"dea":0.35,"macd":0.24,"time":"Fri Jun 17 00:00:00 +0800 2016"},{"volume":12257845,"open":25.19,"high":27.71,"close":27.71,"low":25.19,"chg":2.52,"percent":10.0,"turnrate":5.16,"ma5":25.618,"ma10":25.675,"ma20":24.357,"ma30":23.838,"dif":0.66,"dea":0.41,"macd":0.5,"time":"Mon Jun 20 00:00:00 +0800 2016"},{"volume":8693904,"open":28.29,"high":28.5,"close":27.37,"low":27.21,"chg":-0.34,"percent":-1.23,"turnrate":3.66,"ma5":26.188,"ma10":25.74,"ma20":24.612,"ma30":23.95,"dif":0.78,"dea":0.48,"macd":0.6,"time":"Tue Jun 21 00:00:00 +0800 2016"},{"volume":4662231,"open":27.21,"high":27.64,"close":27.59,"low":27.15,"chg":0.22,"percent":0.8,"turnrate":1.96,"ma5":26.606,"ma10":25.88,"ma20":24.859,"ma30":24.111,"dif":0.88,"dea":0.56,"macd":0.64,"time":"Wed Jun 22 00:00:00 +0800 2016"}]}
          var chartlist = data1.chartlist;
          if (chartlist[(chartlist.length - 2)] != undefined) {

            var last_close = chartlist[(chartlist.length - 2)].close;
            var today = chartlist[chartlist.length - 1];

            var high = 0;
            var low = 0;
            var morning_high = 0;
            var morning_low = 0;
            var afternoon_high = 0;
            var afternoon_low = 0;
            var strong_count = 0;
            var mode1_count = 0;
            var mode2_count = 0;

            if (data.stock != undefined && data.chartlist != undefined) {
              var stock_code = data.stock.symbol.substr(2);
              var ml = data.chartlist;

              if (ml[(ml.length - 1)] != undefined) {
                for (var i = 0; i < ml.length; i++) {
                  var val = Date.parse(ml[i].time);
                  var m_time = new Date(val);
                  var h = m_time.getHours();
                  var m = m_time.getMinutes();

                  if (i == 0) {
                    high = ml[i].current;
                    low = ml[i].current;
                  }
                  else {
                    high = ml[i].current > high ? ml[i].current : high;
                    low = ml[i].current < low ? ml[i].current : low;
                  }

                  if (h >= 13) {
                    //afternoon
                    afternoon_high = afternoon_high == 0 ? ml[i].current : ml[i].current > afternoon_high ? ml[i].current : afternoon_high;
                    afternoon_low = afternoon_low == 0 ? ml[i].current : ml[i].current < afternoon_low ? ml[i].current : afternoon_low;
                  }
                  else {
                    //morning
                    morning_high = morning_high == 0 ? ml[i].current : ml[i].current > morning_high ? ml[i].current : morning_high;
                    morning_low = morning_low == 0 ? ml[i].current : ml[i].current < morning_low ? ml[i].current : morning_low;

                  }

                  if (ml[i].current >= ml[i].avg_price) {
                    strong_count = strong_count + 1;
                  }
                  //mode1贴地行走
                  if (ml[i].current >= last_close && ml[i].current <= last_close * 1.002) {
                    mode1_count = mode1_count + 1;
                  }
                  //mode2U型
                  if (ml[i].current >= ml[i].avg_price && ml[i].current <= ml[i].avg_price * 1.005) {
                    mode2_count = mode2_count + 1;
                  }
                }
                //mode1贴地行走
                if (mode1_count > 10) {
                  mode1_codes = concat_codestr(mode1_codes, stock_code);
                  mode1++;
                }
                //mode2U型
                if (morning_high > morning_low * 1.01 && afternoon_high >= morning_high * 0.995 && mode2_count >= (ml.length * 0.3)) {
                  mode2_codes = concat_codestr(mode2_codes, stock_code);
                  mode2++;
                }
                //mode3尾盘拉升
                if (morning_high > 0 && ml[ml.length - 1].current >= morning_high * 1.008) {
                  mode3_codes = concat_codestr(mode3_codes, stock_code);
                  mode3++;
                }
                //mode4套人
                if (ml[ml.length - 1].current <= morning_high * 0.985) {
                  mode4_codes = concat_codestr(mode4_codes, stock_code);
                  mode4++;
                }
                //mode5接近5日线，接近10日线
                if ((today.low >= today.ma5 * 0.995 && today.low <= today.ma5 * 1.005) || (today.low >= today.ma10 * 0.995 && today.low <= today.ma10 * 1.005)) {
                  mode5_codes = concat_codestr(mode5_codes, stock_code);
                  mode5++;
                }
                //破5日线
                if (today.low < today.ma5) {
                  mode6_codes = concat_codestr(mode6_codes, stock_code);
                  mode6++;
                }
                if (strong_count > (ml.length * 0.8)) {
                  strong_codes = concat_codestr(strong_codes, stock_code);
                  strong = strong + 1;
                }

              }
            }
          }
        }
        v_count = v_count + 1;

        //progress percentage
        if (v_count % 100 == 0 || v_count >= v_count_limit) {

          var pbar = document.getElementById(in_str_name + '_progress-bar');
          pbar.textContent = "analyzing stocks:" + String(v_count) + '/' + String(v_count_limit) + '  ' + String((v_count / v_count_limit * 100).toFixed(2)) + '% ';
          pbar.setAttribute('width', String((v_count / v_count_limit * 100).toFixed(2)) + '%');

        }
        ;

        if (v_count >= v_count_limit) {
          var bbar = document.getElementById(in_str_name + '_bar_bottom');
          bbar.remove();
          var f1 = {
            name: '贴地行走',
            codes: mode1_codes
          };
          var f2 = {
            name: 'U型',
            codes: mode2_codes
          };
          var f3 = {
            name: '尾盘拉升',
            codes: mode3_codes
          };
          var f4 = {
            name: '套人',
            codes: mode4_codes
          };
          var f5 = {
            name: '触线',
            codes: mode5_codes
          };
          var f6 = {
            name: '破线',
            codes: mode6_codes
          };
          var codes_str_f = new Array();
          codes_str_f[0] = f1;
          codes_str_f[1] = f2;
          codes_str_f[2] = f3;
          codes_str_f[3] = f4;
          codes_str_f[4] = f5;
          codes_str_f[5] = f6;

          update_codes(in_str_name, null, codes_str_f);
        }

      })
    })
  }
}

function jiankong(stock_str) {
  //初始化

  var ceiling_count = 0; //涨停数
  var floor_count = 0; //跌停数
  var high_count = 0;  //涨>=3.5%以上个数
  var low_count = 0;  //跌<=-2.5%以下个数
  var mid1_count = 0;  //0%到1.5%个数
  var mid2_count = 0;  //-1.5%到0%个数
  var weather_ind = 0; //市场强弱指数,-5到5

  //清空
  for (j_mode of j_modes) {
    eval(j_mode + '_stockstr=""');
    eval(j_mode + '_stockcount=0');
  }
  ;

  var stock_codes = stock_str.split(',');

  var today_date = new Date();
  today_date.setHours(0, 0, 0, 0);
  if (today_date.getDay() == 0) {
    var t = new Date(today_date.getTime() - 2000 * 60 * 60 * 24);
    today_date = t;
  }
  else if (today_date.getDay() == 6) {
    var t = new Date(today_date.getTime() - 1000 * 60 * 60 * 24);
    today_date = t;
  }

  var day_90 = new Date();
  day_90.setHours(0, 0, 0, 0);
  day_90.setMonth(day_90.getMonth() - 3);
  console.log(day_90);

  var time1 = day_90.getTime();
  var time2 = today_date.getTime();

  v_count = 0;
  v_count_limit = stock_codes.length;

  //add progress bar
  var bar_bottom = document.createElement('div');
  bar_bottom.setAttribute('class', 'bar_bottom');
  bar_bottom.setAttribute('style', 'border: 1px solid #F00;color: black;width: 500px;position:absolute;z-index:99999;position: fixed;top:0px;');

  var bar_inner = document.createElement('div');
  bar_inner.setAttribute('class', 'progress-bar');
  bar_inner.setAttribute('style', 'width: 0%;background-color: blue;color: white;height: 15px;white-space: nowrap;position:absolute;z-index:99999;');

  bar_bottom.appendChild(bar_inner);

  document.body.insertBefore(bar_bottom, document.body.firstChild);
  document.body.appendChild(bar_bottom);

  //日K
  for (var k = 0; k < stock_codes.length; k++) {
    var stock_code1 = add_stocktype(stock_codes[k]);
    var d_url = d_url1 + stock_code1 + d_url2 + time1 + d_url3 + time2;

    $.get(d_url, function (data, status) {
      //{"stock":{"symbol":"SH600071"},"success":"true","chartlist":[{"volume":2725234,"open":25.46,"high":25.65,"close":25.19,"low":25.0,"chg":0.02,"percent":0.08,"turnrate":1.15,"ma5":24.974,"ma10":25.474,"ma20":24.074,"ma30":23.761,"dif":0.47,"dea":0.35,"macd":0.24,"time":"Fri Jun 17 00:00:00 +0800 2016"},{"volume":12257845,"open":25.19,"high":27.71,"close":27.71,"low":25.19,"chg":2.52,"percent":10.0,"turnrate":5.16,"ma5":25.618,"ma10":25.675,"ma20":24.357,"ma30":23.838,"dif":0.66,"dea":0.41,"macd":0.5,"time":"Mon Jun 20 00:00:00 +0800 2016"},{"volume":8693904,"open":28.29,"high":28.5,"close":27.37,"low":27.21,"chg":-0.34,"percent":-1.23,"turnrate":3.66,"ma5":26.188,"ma10":25.74,"ma20":24.612,"ma30":23.95,"dif":0.78,"dea":0.48,"macd":0.6,"time":"Tue Jun 21 00:00:00 +0800 2016"},{"volume":4662231,"open":27.21,"high":27.64,"close":27.59,"low":27.15,"chg":0.22,"percent":0.8,"turnrate":1.96,"ma5":26.606,"ma10":25.88,"ma20":24.859,"ma30":24.111,"dif":0.88,"dea":0.56,"macd":0.64,"time":"Wed Jun 22 00:00:00 +0800 2016"}]}
      if (data.stock != undefined && data.chartlist != undefined) {
        var stock_code = data.stock.symbol.substr(2);
        var chartlist = data.chartlist;

        if (chartlist[(chartlist.length - 1)] != undefined) {
          //去除停牌股
          var last_date = new Date(Date.parse(chartlist[(chartlist.length - 1)].time));
          if (last_date.getFullYear() == today_date.getFullYear() && last_date.getMonth() == today_date.getMonth() && last_date.getDate() == today_date.getDate()) {
            if (chartlist.length >= 7) {
              var today = chartlist[chartlist.length - 1];
              var day_1 = chartlist[chartlist.length - 2];
              var day_2 = chartlist[chartlist.length - 3];
              var day_3 = chartlist[chartlist.length - 4];
              var day_4 = chartlist[chartlist.length - 5];
              var day_5 = chartlist[chartlist.length - 6];

              var j = 0;

              var max = 0;
              var min = 0;
              var max_30 = 0;//20日最高
              var min_30 = 0;//20日最低
              var upper_count_5 = 0; //5日线上日
              var upper_count_20 = 0; //20日线上日
              var jump_count_20 = 0; //下穿20日线日
              var pump_count_20 = 0; //上穿20日线日
              var pump_count_10 = 0; //上穿5日10日线日
              var f_count = 0;//10日内振幅超过4的日数
              var f_count_4 = 0;//4日振幅超过3的日数

              if (today.percent > 9.9) {
                ceiling_count++;
              } else if (today.percent < -9.9) {
                floor_count++;
              } else if (today.percent >= 3.5) {
                high_count++;
              } else if (today.percent <= -2.5) {
                low_count++;
              } else if (today.percent >= 0 && today.percent < 1.5) {
                mid1_count++;
              } else if (today.percent < 0 && today.percent > -1.5) {
                mid2_count++;
              }

              //从昨日开始计算各种最大最小值
              for (var i = chartlist.length - 2; i >= 0; i--) {
                j = j + 1;
                if (j == 1) {
                  max = chartlist[i].close;
                  min = chartlist[i].close;
                }
                else {
                  max = chartlist[i].high > max ? chartlist[i].high : max;
                  min = chartlist[i].low < min ? chartlist[i].low : min;
                }

                if (j <= 6) {
                  if (chartlist[i].low < chartlist[i].ma5 && chartlist[i].close >= chartlist[i].ma5
                    && chartlist[i].low < chartlist[i].ma10 && chartlist[i].close >= chartlist[i].ma10
                    && chartlist[i].ma5 > chartlist[i].ma20 && chartlist[i].ma10 > chartlist[i].ma20 && chartlist[i].percent > 0) {
                    pump_count_10 = pump_count_10 + 1;
                  }
                }

                if (j <= 10) {
                  if (chartlist[i].close > chartlist[i].ma5 && chartlist[i].ma10 > chartlist[i].ma20) {
                    upper_count_5 = upper_count_5 + 1;
                  }
                  if (chartlist[i].close > chartlist[i].ma20) {
                    upper_count_20 = upper_count_20 + 1;
                  }
                  if (chartlist[i].open > chartlist[i].ma20 && chartlist[i].close < chartlist[i].ma20) {
                    jump_count_20 = jump_count_20 + 1;
                  }
                  if (chartlist[i].open < chartlist[i].ma20 && chartlist[i].close > chartlist[i].ma20) {
                    pump_count_20 = pump_count_20 + 1;
                  }
                  if ((chartlist[i].high - chartlist[i].low) / chartlist[i].close * 100 > 4) {
                    f_count = f_count + 1;
                  }
                }
                if (j <= 4) {
                  if ((chartlist[i].high - chartlist[i].low) / chartlist[i].close * 100 > 3 && chartlist[i].high > chartlist[i - 1].high) {
                    f_count_4 = f_count_4 + 1;
                  }
                }

                if (j == 30 || (j < 30 && i == 0)) {
                  max_30 = max;
                  min_30 = min;
                }
              }

              for (j_mode of j_modes) {
                if (eval(j_mode + '(today,day_1,day_2,day_3,day_4,max,min,max_30,min_30,upper_count_5,upper_count_20,jump_count_20,pump_count_20,pump_count_10,f_count,f_count_4)')) {
                  eval(j_mode + '_stockstr=concat_codestr(' + j_mode + '_stockstr,stock_code)');
                  eval(j_mode + '_stockcount=' + j_mode + '_stockcount+1');
                }

              }
            }
          }
        }
      }
      v_count = v_count + 1;

      //progress percentage
      if (v_count % 100 == 0 || v_count >= v_count_limit) {
        update_stock_code_dk(notekey + '_per', String(v_count) + '/' + String(v_count_limit));

        $(".progress-bar").text("analyzing stocks:" + String(v_count) + '/' + String(v_count_limit) + '  ' + String((v_count / v_count_limit * 100).toFixed(2)) + '% ')
          .css("width", String((v_count / v_count_limit * 100).toFixed(2)) + '%');

      }
      ;

      if (v_count >= v_count_limit) {
        $('.progress-bar').remove();

        weather_ind = cal_weather(ceiling_count, floor_count, high_count, low_count, mid1_count, mid2_count);
        //display
        insertbnt();

        var codearea = document.getElementById("codearea");
        var weather_div = document.createElement('div');
        weather_div.setAttribute('id', 'weather');
        var weather_li = document.createElement('li');

        var weather_str = '';
        if (weather_ind >= 3) {
          weather_str = '超强';
        } else if (weather_ind <= -3) {
          weather_str = '超弱';
        } else if (weather_ind >= 1) {
          weather_str = '强';
        } else if (weather_ind < 0) {
          weather_str = '弱';
        } else {
          weather_str = '中';
        }

        weather_li.innerHTML = '<br><h4>市场强弱指数：' + weather_ind + '  (' + weather_str + ')</h4></br>' + '<br>涨停数:' + ceiling_count + ' <br>跌停数:' + floor_count + ' <br>涨>=3.5%以上个数:' + high_count + ' <br>跌<=-2.5%以下个数:' + low_count + ' <br>0%到1.5%个数:' + mid1_count + ' <br>-1.5%到0%个数:' + mid2_count + '</br>';
        weather_div.appendChild(weather_li);
        codearea.appendChild(weather_div);

        for (j_mode of j_modes) {
          eval('insert_codes("' + j_mode + '","("+' + j_mode + '_stockcount+")"+' + j_mode + '_des,' + j_mode + '_stockstr)');
        }
        show_codes();
      }
    });
  }
}

function mode1(today, day_1, day_2, day_3, day_4, max, min, max_30, min_30, upper_count_5, upper_count_20, jump_count_20, pump_count_20, pump_count_10, f_count, f_count_4) {
  //mode1:涨>1%涨破5,10,20,30日线，无套人
  if (today.high <= today.close * 1.01 && today.percent > 0 && today.percent < 3 && today.open < today.ma5 && today.open < today.ma10 && today.open < today.ma20 && today.open < today.ma20 && today.close > today.ma5 && today.close > today.ma10 && today.close > today.ma20 && today.close > today.ma30) {
    return true;
  }
  else {
    return false;
  }
}

function mode12(today, day_1, day_2, day_3, day_4, max, min, max_30, min_30, upper_count_5, upper_count_20, jump_count_20, pump_count_20, pump_count_10, f_count, f_count_4) {
  //mode12:涨>1%破20线，而前两日在20日线下且涨幅小于1.5,最高-收盘<1%（无套人）
  if (today.high <= today.close * 1.01 && today.percent > 0 && today.percent < 3 && today.open < today.ma20 && today.close > today.ma20 && today.close > today.ma5 && today.close > today.ma10
    && day_1.percent < 1.5 && day_1.close <= day_1.ma20
    && day_2.percent < 1.5 && day_2.close <= day_2.ma20) {
    return true;
  }
  else {
    return false;
  }
}

function mode101(today, day_1, day_2, day_3, day_4, max, min, max_30, min_30, upper_count_5, upper_count_20, jump_count_20, pump_count_20, pump_count_10, f_count, f_count_4) {
  //mode101: mode1潜伏，穿入穿出(前mode7),ma5高于ma20 2%，强反弹，
  if (upper_count_20 >= 6 && jump_count_20 == 1 && pump_count_20 == 1 && today.ma5 > today.ma20 && ((today.open > today.ma20 && today.low < today.ma20) || (day_1.open > day_1.ma20 && day_1.low < day_1.ma20))) {
    return true;
  }
  else {
    return false;
  }
}

function mode102(today, day_1, day_2, day_3, day_4, max, min, max_30, min_30, upper_count_5, upper_count_20, jump_count_20, pump_count_20, pump_count_10, f_count, f_count_4) {
  //mode102: mode1潜伏，ma5,ma10在上，上触20日线的
  if (day_1.close < day_1.ma5 && day_1.close < day_1.ma10 && day_1.close < day_1.ma20
    && today.percent > 0 && today.percent < -1 * day_1.percent && today.low < today.ma20 && today.high >= today.ma20 - 0.01 && today.ma5 >= today.ma20 && today.ma10 >= today.ma20) {
    return true;
  }
  else {
    return false;
  }
}

function mode11(today, day_1, day_2, day_3, day_4, max, min, max_30, min_30, upper_count_5, upper_count_20, jump_count_20, pump_count_20, pump_count_10, f_count, f_count_4) {
  //mode11:mode1的后续，涨3%破线，而前两日在20日线下（涨幅小于1.5%),近3月最高在15%以上+当日高于20日最高,最高-收盘<1%（无套人）或者量都小于第一日,后续两天最高都大于第一日
  if (day_2.open <= day_2.ma20 &&
    max > day_2.close * 1.15 && day_2.percent > 2 && day_2.high <= day_2.close * 1.01 && day_2.close > day_2.ma5 && day_2.close > day_2.ma10 && day_2.close > day_2.ma20 && day_2.close > day_2.ma30 &&
    day_1.percent > -1 && (day_1.high < day_1.close * 1.01 || day_1.volume < day_2.volume) && day_1.high > day_2.high & day_1.close > day_1.ma5 &&
    today.percent > -1 && (today.high < today.close * 1.01 || today.volume < day_2.volume) && today.close > today.ma5) {
    return true;
  }
  else {
    return false;
  }
}

function mode111(today, day_1, day_2, day_3, day_4, max, min, max_30, min_30, upper_count_5, upper_count_20, jump_count_20, pump_count_20, pump_count_10, f_count, f_count_4) {
  //mode111:底部上升,过5日线，缓慢接近10,20日线，5日无新低
  if (day_3.close <= min * 1.1 &&
    today.high > day_1.high && day_1.high > day_2.high && day_2.high > day_3.high &&
    today.ma5 < today.ma10 && today.ma10 * 1.03 < today.ma20) {
    return true;
  }
  else {
    return false;
  }
}

function mode2(today, day_1, day_2, day_3, day_4, max, min, max_30, min_30, upper_count_5, upper_count_20, jump_count_20, pump_count_20, pump_count_10, f_count, f_count_4) {
  //mode2:小涨幅突破30日最高，10日线上稳过5日线，高于20日线，002685 2017-07-07
  if (today.percent > 0 && today.percent < 3 && today.close >= max_30 && today.high < today.close * 1.01
    && today.open < today.ma5 && today.close > today.ma5 && today.ma5 >= today.ma10 && today.ma5 >= today.ma20) {
    return true;
  }
  else {
    return false;
  }
}

function mode211(today, day_1, day_2, day_3, day_4, max, min, max_30, min_30, upper_count_5, upper_count_20, jump_count_20, pump_count_20, pump_count_10, f_count, f_count_4) {
  //mode211:前3日2.5%以上涨幅，20日新高，光头阳线（无套人），缩量回调2日（>0% && <1.5%)且无套人，不破均线（600816 2017/06/15）
  if (day_2.percent > 2.5 && day_2.high < day_2.close * 1.01 && day_1.volume < day_2.volume && day_1.high < day_1.close * 1.01 && day_1.percent > 0 && day_1.percent < 1.5 && day_1.close > day_1.ma5
    && (today.volume < day_2.volume || today.high > day_2.high) && today.high < today.close * 1.01 && today.percent > -1 && today.close > today.ma5) {
    return true;
  }
  else {
    return false;
  }
}

function mode212(today, day_1, day_2, day_3, day_4, max, min, max_30, min_30, upper_count_5, upper_count_20, jump_count_20, pump_count_20, pump_count_10, f_count, f_count_4) {
  //mode212:底部开拉2%,再涨1%,再涨2%，1天高过ma5 1%
  if (day_2.percent > 2 && day_2.high < day_2.close * 1.01 && day_2.low <= day_2.ma5 && day_2.close > day_2.ma5 && day_2.close > day_2.ma10 && day_2.close > day_2.ma20
    && day_1.high > day_2.high && day_1.percent > 0 && day_1.percent < 1.5 && day_1.close > day_1.ma5
    && today.percent > 2 && today.high < today.close * 1.01 && today.close > today.ma5) {
    return true;
  }
  else {
    return false;
  }
}

function mode222(today, day_1, day_2, day_3, day_4, max, min, max_30, min_30, upper_count_5, upper_count_20, jump_count_20, pump_count_20, pump_count_10, f_count, f_count_4) {
  //mode222:单日涨幅高于4%,2日回调
  if (day_2.percent >= 4
    && day_1.percent < 0
    && (today.percent < 0 || today.low < day_1.low) && today.ma5 > today.ma10 && today.ma10 > today.ma20) {
    return true;
  }
  else {
    return false;
  }
}

function mode2222(today, day_1, day_2, day_3, day_4, max, min, max_30, min_30, upper_count_5, upper_count_20, jump_count_20, pump_count_20, pump_count_10, f_count, f_count_4) {
  //mode2222:2日振幅>4%,2日回调
  if (((day_3.high >= day_3.low * 1.04 && day_3.percent > 2) || day_3.percent >= 4) && ((day_2.high >= day_2.low * 1.04 && day_2.percent > 2) || day_2.percent >= 4)
    && day_1.percent < 0
    && (today.percent < 0 || today.low < day_1.low)) {
    return true;
  }
  else {
    return false;
  }
}

function mode25(today, day_1, day_2, day_3, day_4, max, min, max_30, min_30, upper_count_5, upper_count_20, jump_count_20, pump_count_20, pump_count_10, f_count, f_count_4) {
  //mode25:5日之内两次上穿5日和10日线
  if (pump_count_10 >= 2
    && today.ma5 > today.ma20 * 1.03 && today.ma10 > today.ma20 && today.percent > 0
    && today.low < today.ma5 && today.close >= today.ma5 && today.low < today.ma10 && today.close >= today.ma10) {
    return true;
  }
  else {
    return false;
  }
}

function mode123(today, day_1, day_2, day_3, day_4, max, min, max_30, min_30, upper_count_5, upper_count_20, jump_count_20, pump_count_20, pump_count_10, f_count, f_count_4) {
  //mode123:ma5上拉1%再拉2%，无套人
  if (day_1.percent > 1 && day_1.percent < 1.8 && day_1.close > day_1.ma5 * 1.008
    && today.percent > 1.8 && today.percent < 3 && today.low >= today.ma5 && today.high < today.close * 1.01) {
    return true;
  }
  else {
    return false;
  }
}

function mode233(today, day_1, day_2, day_3, day_4, max, min, max_30, min_30, upper_count_5, upper_count_20, jump_count_20, pump_count_20, pump_count_10, f_count, f_count_4) {
  //mode233:高于5日线，1天涨1,第2天涨2.5-4%,第3天
  if (day_1.percent > 1.5 && day_1.percent < 2 && day_1.close > day_1.ma5
    && today.percent > 2.5 && today.percent < 4 && today.close > today.ma5 && today.high < today.close * 1.01) {
    return true;
  }
  else {
    return false;
  }
}

function mode3(today, day_1, day_2, day_3, day_4, max, min, max_30, min_30, upper_count_5, upper_count_20, jump_count_20, pump_count_20, pump_count_10, f_count, f_count_4) {
  //mode3:大振幅跟踪，连续3日涨幅大于3% 但不涨停(002695 2017/06/07)
  if (day_2.percent > 2 && day_2.percent < 5
    && day_1.percent > 3 && day_1.percent < 8
    && today.percent > 3 && today.percent < 8) {
    return true;
  }
  else {
    return false;
  }
}

function mode31(today, day_1, day_2, day_3, day_4, max, min, max_30, min_30, upper_count_5, upper_count_20, jump_count_20, pump_count_20, pump_count_10, f_count, f_count_4) {
  //mode31:涨停开版跟踪，前一天是一字板
  if (day_1.percent >= 9.9 && day_1.low > day_1.close * 0.98
    && (today.open < day_1.close * 1.098 || today.percent < 9.9)) {
    return true;
  }
  else {
    return false;
  }
}
function modeTOP1(today, day_1, day_2, day_3, day_4, max, min, max_30, min_30, upper_count_5, upper_count_20, jump_count_20, pump_count_20, pump_count_10, f_count, f_count_4) {
  //modeTOP1:强势股首阴,大于30日最低30%,5日线大于10日线2%,阴收高于5日线
  if (today.open >= min_30 * 1.3 && today.ma5 > today.ma10 * 1.02 && today.percent < 0 && today.low > today.ma5) {
    return true;
  }
  else {
    return false;
  }
}

function modeTOP2(today, day_1, day_2, day_3, day_4, max, min, max_30, min_30, upper_count_5, upper_count_20, jump_count_20, pump_count_20, pump_count_10, f_count, f_count_4) {
  //modeTOP2:强势股小涨幅,大于30日最低30%,5日线大于10日线2%,小涨幅<3.5%,收高于5日线
  if (today.open >= min_30 * 1.3 && today.ma5 > today.ma10 * 1.02 && today.percent > 0 && today.percent < 3.5 && today.close > today.ma5) {
    return true;
  }
  else {
    return false;
  }
}

function modeTOP(today, day_1, day_2, day_3, day_4, max, min, max_30, min_30, upper_count_5, upper_count_20, jump_count_20, pump_count_20, pump_count_10, f_count, f_count_4) {
  //modeTOP:强势股跟踪,大于30日最低30%
  if (today.open >= min_30 * 1.3) {
    return true;
  }
  else {
    return false;
  }
}

function mode310(today, day_1, day_2, day_3, day_4, max, min, max_30, min_30, upper_count_5, upper_count_20, jump_count_20, pump_count_20, pump_count_10, f_count, f_count_4) {
  //mode310:涨停股跟踪
  if (today.percent >= 9.9) {
    return true;
  }
  else {
    return false;
  }
}

function mode301(today, day_1, day_2, day_3, day_4, max, min, max_30, min_30, upper_count_5, upper_count_20, jump_count_20, pump_count_20, pump_count_10, f_count, f_count_4) {
  //mode301:跌停股跟踪
  if (today.percent <= -9.9) {
    return true;
  }
  else {
    return false;
  }
}
function mode303(today, day_1, day_2, day_3, day_4, max, min, max_30, min_30, upper_count_5, upper_count_20, jump_count_20, pump_count_20, pump_count_10, f_count, f_count_4) {
  //mode303:涨3%跟踪
  if (today.percent >= 3) {
    return true;
  }
  else {
    return false;
  }
}

function mode313(today, day_1, day_2, day_3, day_4, max, min, max_30, min_30, upper_count_5, upper_count_20, jump_count_20, pump_count_20, pump_count_10, f_count, f_count_4) {
  //mode313:跌3%跟踪
  if (today.percent <= -3) {
    return true;
  }
  else {
    return false;
  }
}


function mode32(today, day_1, day_2, day_3, day_4, max, min, max_30, min_30, upper_count_5, upper_count_20, jump_count_20, pump_count_20, pump_count_10, f_count, f_count_4) {
  //mode32:顶部股跟踪，30日最高，且涨3%，或者昨日3%
  if ((today.high >= max_30 && today.percent >= 3 && today.percent < 5 && today.high < today.close * 1.01)
    || (today.high >= max_30 && today.percent > 1 && day_1.percent >= 3 && day_1.percent < 5 && day_1.high < day_1.close * 1.01)) {
    return true;
  }
  else {
    return false;
  }
}

function mode33(today, day_1, day_2, day_3, day_4, max, min, max_30, min_30, upper_count_5, upper_count_20, jump_count_20, pump_count_20, pump_count_10, f_count, f_count_4) {
  //mode33:高于5日线，1天涨3,第2天涨3-4%,第3天
  if (today.percent > 3 && today.percent < 4 && today.close > today.ma5 && today.high < today.close * 1.01
    && day_1.percent > 2.5 && day_1.percent < 4 && day_1.close > day_1.ma5 * 1.01 && day_1.high < day_1.close * 1.01) {
    return true;
  }
  else {
    return false;
  }
}


function mode4(today, day_1, day_2, day_3, day_4, max, min, max_30, min_30, upper_count_5, upper_count_20, jump_count_20, pump_count_20, pump_count_10, f_count, f_count_4) {
  //mode4:均匀上升超过10日，顶部股today.close>=max*0.9，f_count_4=0,阴线收盘 (10日内7日在5日线上)
  if (upper_count_5 >= 7 && today.close >= max * 0.9 && f_count <= 1 && f_count_4 <= 1 && today.percent < 0) {
    return true;
  }
  else {
    return false;
  }
}

function mode41(today, day_1, day_2, day_3, day_4, max, min, max_30, min_30, upper_count_5, upper_count_20, jump_count_20, pump_count_20, pump_count_10, f_count, f_count_4) {
  //mode41:均匀上升超过10日，首近10日线
  if (upper_count_5 >= 7 && today.close >= max * 0.9 && today.close < today.ma5 && today.low <= today.ma10
    && day_1.low > day_1.ma5 && day_1.low > day_1.ma10 && day_1.low > day_1.ma20) {
    return true;
  }
  else {
    return false;
  }
}

function mode42(today, day_1, day_2, day_3, day_4, max, min, max_30, min_30, upper_count_5, upper_count_20, jump_count_20, pump_count_20, pump_count_10, f_count, f_count_4) {
  //mode42:均匀上升股,首近20日线
  if (upper_count_5 >= 7 && today.close >= max * 0.9 && today.close < today.ma5 && today.low <= today.ma20
    && ((day_1.low > day_1.ma5 && day_1.low > day_1.ma10 && day_1.low > day_1.ma20) || (day_2.low > day_2.ma5 && day_2.low > day_2.ma10 && day_2.low > day_2.ma20))) {
    return true;
  }
  else {
    return false;
  }
}

function mode5(today, day_1, day_2, day_3, day_4, max, min, max_30, min_30, upper_count_5, upper_count_20, jump_count_20, pump_count_20, pump_count_10, f_count, f_count_4) {
  //mode5:大幅上升股跟踪，5日线和10日线之间差3%以上，或者昨日5日线和10日线之间差3%以上。
  if ((today.ma5 - today.ma10) / today.close > 0.03 || (day_1.ma5 - day_1.ma10) / day_1.close > 0.03) {
    return true;
  }
  else {
    return false;
  }
}

function mode51(today, day_1, day_2, day_3, day_4, max, min, max_30, min_30, upper_count_5, upper_count_20, jump_count_20, pump_count_20, pump_count_10, f_count, f_count_4) {
  //mode51:大幅上升股跟踪，昨日接近5日线，今日接近10日线。
  if (today.ma5 > today.ma10 * 1.03 && today.low < today.ma10 * 1.015 && today.low > today.ma10 * 0.99 && today.close >= today.ma10
    && day_1.low > today.low
    && day_2.low > day_2.ma5
    && day_3.low > day_3.ma5) {
    return true;
  }
  else {
    return false;
  }
}

function mode52(today, day_1, day_2, day_3, day_4, max, min, max_30, min_30, upper_count_5, upper_count_20, jump_count_20, pump_count_20, pump_count_10, f_count, f_count_4) {
  //mode52:大幅上升股跟踪，昨日接近5日线，今日接近20日线。
  if (today.ma10 > today.ma20 * 1.03 && today.low < today.ma20 * 1.015 && today.low > today.ma20 * 0.99 && today.close >= today.ma20
    && day_1.low > today.low
    && day_2.low > day_2.ma10
    && day_3.low > day_3.ma10) {
    return true;
  }
  else {
    return false;
  }
}

function mode53(today, day_1, day_2, day_3, day_4, max, min, max_30, min_30, upper_count_5, upper_count_20, jump_count_20, pump_count_20, pump_count_10, f_count, f_count_4) {
  //mode53:大幅上升股跟踪，昨日接近5日线，今日接近30日线。
  if (today.ma20 > today.ma30 * 1.03 && today.low < today.ma30 * 1.015 && today.low > today.ma30 * 0.99 && today.close >= today.ma30
    && day_1.low > today.low
    && day_2.low > day_2.ma30
    && day_3.low > day_3.ma30) {
    return true;
  }
  else {
    return false;
  }
}

function mode6(today, day_1, day_2, day_3, day_4, max, min, max_30, min_30, upper_count_5, upper_count_20, jump_count_20, pump_count_20, pump_count_10, f_count, f_count_4) {
  //mode6:昨日倒纺锤，今日从底部开拉，高过昨日开盘价
  if (day_1.close > day_1.ma5 && day_1.close < day_1.open && day_1.high > day_1.open && day_1.high > day_2.high && day_1.high > day_3.high && day_1.high > day_4.high
    && today.open < day_1.close && today.close > day_1.open && today.percent > 1.5) {
    return true;
  }
  else {
    return false;
  }
}

function j1(today, day_1, day_2, day_3, day_4, max, min, max_30, min_30, upper_count_5, upper_count_20, jump_count_20, pump_count_20, pump_count_10, f_count, f_count_4) {
  //j1:昨日倒纺锤，低开，拉升监控
  if (day_1.close > day_1.ma5 && day_1.close < day_1.open && day_1.high > day_1.open && day_1.high > day_2.high && day_1.high > day_3.high && day_1.high > day_4.high
    && today.open < day_1.close) {
    return true;
  }
  else {
    return false;
  }
}

function j2(today, day_1, day_2, day_3, day_4, max, min, max_30, min_30, upper_count_5, upper_count_20, jump_count_20, pump_count_20, pump_count_10, f_count, f_count_4) {
  //j2:强势股首阴,大于30日最低30%,5日线大于10日线2%,阴收高于5日线，第二天监控低开触5日线
  if (day_1.open >= min_30 * 1.3 && day_1.ma5 > day_1.ma10 * 1.02 && day_1.percent < 0 && day_1.low > day_1.ma5) {
    return true;
  }
  else {
    return false;
  }
}

function j3(today, day_1, day_2, day_3, day_4, max, min, max_30, min_30, upper_count_5, upper_count_20, jump_count_20, pump_count_20, pump_count_10, f_count, f_count_4) {
  //j3:涨停开板跟踪，前一天是一字板
  if (day_1.percent >= 9.9 && day_1.low > day_1.close * 0.98
    && (today.open < day_1.close * 1.098 || today.percent < 9.9)) {
    return true;
  }
  else {
    return false;
  }
}

function j4(today, day_1, day_2, day_3, day_4, max, min, max_30, min_30, upper_count_5, upper_count_20, jump_count_20, pump_count_20, pump_count_10, f_count, f_count_4) {
  //j4:强势股跟踪,大于30日最低30%,触5日线，10日线监控
  if (today.open >= min_30 * 1.3) {
    return true;
  }
  else {
    return false;
  }
}

function j222(today, day_1, day_2, day_3, day_4, max, min, max_30, min_30, upper_count_5, upper_count_20, jump_count_20, pump_count_20, pump_count_10, f_count, f_count_4) {
  //j222:单日涨幅高于4%,2日回调,破5日线，接近10日线监控
  if ((day_3.percent >= 4
    && day_2.percent < 0
    && (day_1.percent < 0 || day_1.low < day_2.low) && day_1.ma5 > day_1.ma10 && day_1.ma10 > day_1.ma20) ||
    (day_2.percent >= 4
    && day_1.percent < 0
    && (today.percent < 0 || today.low < day_1.low) && today.ma5 > today.ma10 && today.ma10 > today.ma20)) {
    return true;
  }
  else {
    return false;
  }
}

function j2222(today, day_1, day_2, day_3, day_4, max, min, max_30, min_30, upper_count_5, upper_count_20, jump_count_20, pump_count_20, pump_count_10, f_count, f_count_4) {
  //j2222:2日振幅>4%,2日回调,破5日线，接近10日线监控
  if ((((day_3.high >= day_3.low * 1.04 && day_3.percent > 2) || day_3.percent >= 4) && ((day_2.high >= day_2.low * 1.04 && day_2.percent > 2) || day_2.percent >= 4)
    && day_1.percent < 0
    && (today.percent < 0 || today.low < day_1.low))
    ||
    (((day_4.high >= day_4.low * 1.04 && day_4.percent > 2) || day_4.percent >= 4) && ((day_3.high >= day_3.low * 1.04 && day_3.percent > 2) || day_3.percent >= 4)
    && day_2.percent < 0
    && (day_1.percent < 0 || day_1.low < day_2.low))) {
    return true;
  }
  else {
    return false;
  }
}

/*
 Remove every node under document.body
 */
function removeEverything() {
  while (document.body.firstChild) {
    document.body.firstChild.remove();
  }
}

function update_stock_code_dk(note_key, stock_str, command) {

  var h1 = note_key;
  var h2 = stock_str;
  var h3 = null;
  var h4 = null;
  var h5 = null;
  var h6 = null;
  var h7 = null;


  browser.runtime.sendMessage({
    source: "get_dk.js",
    command: command,
    h1: h1,
    h2: h2,
    h3: h3,
    h4: h4,
    h5: h5,
    h6: h6,
    h7: h7
  });

}
function getInnerstr(strHTML, sstr, estr) {
  var p1 = strHTML.indexOf(sstr);
  var p2 = strHTML.indexOf(estr, p1 + sstr.length);
  return strHTML.slice(p1 + sstr.length, p2);
}

function concat_codestr(in_str1, in_str2) {
  var str1 = in_str1;
  var str2 = in_str2;
  if (str1 == undefined) {
    str1 = "";
  }

  if (str1 == "") {
    return str2;
  }
  else if (str2.length > 0) {
    return str1 + ',' + str2;
  }
  else {
    return str1;
  }
}

function merge_codestr(in_str1, in_str2) {
  var str1 = in_str1;
  var str2 = in_str2;
  if (str1 == undefined) {
    str1 = "";
  }
  console.log("merging:" + str1 + '||||' + str2);
  //if (str1=="") {return str2;}
  var str2s = str2.split(',');
  var s_m = "";
  for (s2 of str2s) {
    if (str1.indexOf(s2) == -1) {
      console.log("before s_m:" + s_m);
      s_m = concat_codestr(s_m, s2);
      console.log("after s_m:" + s_m);
    }
  }
  str1 = concat_codestr(str1, s_m);
  return str1;
}

function minus_codestr(in_str1, in_str2) {
  var str1 = in_str1;
  var str2 = in_str2;
  if (str1 == undefined) {
    str1 = "";
  }
  //console.log("minus:"+str1+'||||'+str2);
  var str1s = str1.split(',');
  var s_m = "";
  for (s1 of str1s) {
    if (str2.indexOf(s1) == -1) {
      s_m = concat_codestr(s_m, s1);
    }
  }
  return s_m;
}

function add_stocktype(stock_code) {
  //getstockdata('600008');
  var stock_code1;
  if (stock_code.substr(0, 2) == '60') {
    stock_code1 = 'SH' + stock_code;
  }
  else {
    stock_code1 = 'SZ' + stock_code;
  }
  return stock_code1;
}
/*
 Assign beastify() as a listener for messages from the extension.
 */
browser.runtime.onMessage.addListener(dk);