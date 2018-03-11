/**
 * 用于动态加载模型代码。
 *
 * @param parentId
 * @param moduleName
 * @returns {*}
 */
var normalizeModule = function (parentId, moduleName) {
  // normalize plugin requires
  if (moduleName.indexOf("!") !== -1) {
    var chunks = moduleName.split("!");
    return normalizeModule(parentId, chunks[0]) + "!" + normalizeModule(parentId, chunks[1]);
  }
  // normalize relative requires
  if (moduleName.charAt(0) == ".") {
    var base = parentId.split("/").slice(0, -1).join("/");
    moduleName = base + "/" + moduleName;

    while (moduleName.indexOf(".") !== -1 && previous != moduleName) {
      var previous = moduleName;
      moduleName = moduleName.replace(/\/\.\//, "/").replace(/[^\/]+\/\.\.\//, "");
    }
  }
  return moduleName;
};

// 
var _mk_req = function () {
  var _ret_obj = {};
  var _modules = {}, _payloads = {};
  //
  function define(module, deps, payload) {
    if (typeof module !== 'string') {
      console.error('dropping module because define wasn\'t a string.');
      console.trace();
      return;
    }
    if (arguments.length == 2) {
      payload = deps;
    }
    _payloads[module] = payload;
    _modules[module] = null;
  }

  //
  function _require(parentId, module, callback) {
    if (Object.prototype.toString.call(module) === "[object Array]") {
      var params = [];
      for (var i = 0, l = module.length; i < l; ++i) {
        var dep = _lookup(parentId, module[i]);
        params.push(dep);
      }
      if (callback) {
        callback.apply(null, params);
      }
    } else if (typeof module === 'string') {
      var payload = _lookup(parentId, module);
      if (callback) {
        callback();
      }
      return payload;
    }
  }

  function require(module, callback) {
    return _require('', module, callback);
  }

  //
  function _lookup(parentId, moduleName) {
    moduleName = normalizeModule(parentId, moduleName);
    var module = _modules[moduleName];
    if (!module) {
      module = _payloads[moduleName];
      if (typeof module === 'function') {
        var exports = {};
        var mod = {
          id: moduleName,
          exports: exports,
          packaged: true
        };
        var req = function (module, callback) {
          return _require(moduleName, module, callback);
        };
        var returnValue = module(req, exports, mod);
        exports = returnValue || mod.exports;
        _modules[moduleName] = exports;
        delete _payloads[moduleName];
      }
      module = _modules[moduleName] = exports || module;
    }
    if (!module) {
      console.warn("NOT FOUND module.", parentId, moduleName);
    }
    return module;
  }

  /**
   * 判断指定的Module是否被定义了。
   *
   * 没有定义时返回false,
   * 被定义时 返回一个 factory 函数 用于获得这个Module。
   *
   * @param moduleId
   */
  function defined(moduleId) {
    moduleId = normalizeModule("", moduleId);
    if (_modules.hasOwnProperty(moduleId) === true) {
      return function get_module() {
        return require(moduleId)
      }
    }
    return false;
  }

  /**
   *
   *
   * @param moduleId
   * @param code
   */
  function define_by_code(moduleId, code) {
    // Object.keys(global);
    // var factory_func = new Function("require", "exports", "module", code);
    var args = ["require", "exports", "module", code];
    var factory_func = new (Function.prototype.bind.apply(Function, [null].concat(args)))();
    var mk_define = function (moduleId, func_body) {
      define(moduleId, function (require, exports, module) {
        func_body.apply(null, [require, exports, module]);
      });
    };
    mk_define(moduleId, factory_func);
    //
    return function get_module() {
      return require(moduleId)
    }
  }

  //
  return {
    define, defined, define_by_code, require
  }
};


module.exports = _mk_req;
