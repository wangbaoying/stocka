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

  function define_by_code(moduleId, code) {
    // Object.keys(global);
    // var factory_func = new Function("require", "exports", "module", code);
    var args = ["require", "exports", "module", code];
    var factory_func = new (Function.prototype.bind.apply(Function, [null].concat(args)))();
    _mk_define(moduleId, factory_func);
    //
    return function get_module() {
      return require(moduleId)
    }
  }

  // ######################################################
  function _mk_define(moduleId, func_body, o_funcs) {
    define(moduleId, function (require, exports, module) {
      func_body.apply(null, [require, exports, module].concat(o_funcs || []));
    });
  }
  function _mk_define_f(moduleId, func_body) {
    define(moduleId, function (require, exports, module) {
      module.exports = func_body;
    });
  }

  function define_f(moduleId, code, o_func_names) {
    // Object.keys(global);  // 这里可以屏蔽已知的全局变量(window, documents....)
    var signature = o_func_names || [];
    var arg_names = ["require", "exports", "module"].concat(signature).concat([code]);
    // 这里最好能够输出更容易看的信息。
    var factory_func = new (Function.prototype.bind.apply(Function, [null].concat(arg_names)))();
    define(moduleId, {
      signature: o_func_names,
      factory: factory_func
    });
  }

  function require_f(moduleId, func_map) {
    const {signature, factory} = require(moduleId);
    const a_moduleId = "require_f_" + (new Date()).getTime();
    const o_funcs = signature.map(function(key, idx){
      return func_map[key];
    });
    _mk_define(a_moduleId, factory, o_funcs);  // 这么做是为了让 代码块 中的 "require", "exports", "module" 可以使用
    // 
    try {
      const eval_value = require(a_moduleId);
      delete _modules[a_moduleId];
      return eval_value;
    } catch (e) {
      delete _modules[a_moduleId];
      throw e;
    }
  }
  //
  return {
    define, defined, require, define_by_code, define_f, require_f
  }
};

module.exports = _mk_req;
