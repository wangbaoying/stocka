define("utils/typeofex", ["require", "exports", "module"], function (require, exports, module) {

  var _typeof = function (x_var) {
    // if (x_var === null) return "null";
    var x_type = typeof x_var;
    if (x_type.toLocaleLowerCase() !== "object") {
      return x_type;
    }
    // [object array]
    x_type = Object.prototype.toString.apply(x_var).toLowerCase();
    x_type = x_type.substring(8, x_type.length - 1);
    if (x_type.toLocaleLowerCase() !== "object") {
      return x_type;
    }
    if (x_var.constructor === Object) {
      return x_type;
    }
    var get_func_name = function (fn) {
      var reg = /\W*function\s+([\w\$]+)\s*\(/;
      var name = reg.exec(fn);
      if (!name) {
        return '(Anonymous)';
      }
      return name[1];
    };
    if (typeof x_var.constructor === "function") {
      return get_func_name(x_var.constructor);
    }
    return "unknow type";
  }

  module.exports = _typeof;
});


