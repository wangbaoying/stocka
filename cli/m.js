var request = require('request');
var path = require('path');
var fs = require('fs');
var encoding = require('encoding');
var crypto = require('crypto');
var moment = require('moment');
var _ = require('lodash');

// .........................
var files = [
  'models/m0.js', 
  'models/m1.js',
  'models/m2.js',
  'models/m3.js',
  'models/m4.js'
];

// 
var mreq = require('./m-require')();
function load_models(files) {
  var arg_names = [];
  return files.map(function(fn, idx){
    var sourceCode = fs.readFileSync(path.join(__dirname, fn),'utf-8');
    var id = fn;  // 相对目录
    mreq.define_f(id, sourceCode, arg_names);
    return {id};
  });
}
//









var args = {  // 通用函数
  x: ' world'
};



var model0 = mreq.require_f('models/m0.js', args);
var model1 = mreq.require_f('models/m0.js', args);
console.log(model0.m===model1.m, model0.n);
