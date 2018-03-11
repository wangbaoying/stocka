var mreq = require('./m-require')();
mreq.define_by_code("aaa", "console.log('mmmm aaaa');")
mreq.define('bbb', function (require, exports, module) {
  var aaa = require('aaa');
  console.log('bbbb', aaa);
});

var args = ["require", "exports", "module", 'console.log("vvv")'];
var factory_func = new (Function.prototype.bind.apply(Function, [null].concat(args)))();




console.log(factory_func());
