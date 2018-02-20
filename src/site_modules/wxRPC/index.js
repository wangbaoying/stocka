/**
 * webExtensions 的 background 与 content_scripts 交互的远程方法库。
 *
 * wxRPC同时适用于他们两边。
 *
 * 使用方法：
 * background.js：
 * ```
 * var wxRPC = require("wxRPC");
 * // 在 background 中注册一个方法
 * wxRPC.reg("bg_add", function(a, b, sender) { // background.js中，最后一个参数是调用者tab
 *     return a + b;
 * });
 * ```
 *
 * content_scripts.js
 * ```
 * var wxRPC = require("wxRPC");
 * var _rpc_call = wxRPC.mk_call();
 * var retPromise = _rpc_call("bg_add", 1, 2);
 * retPromise.then(function(ret){
 *  console.log(ret); <<<<<<<<<<<<<<<<<<<<< 3
 * })
 * ```
 */

/**
 *
 * @param chrome
 * @returns {{reg: (_register|*), mk_call: _mk_rpc_call}}
 * @private
 */
function _make(chrome) {

  var isBackground = (function (window) {
    // moz-extension://2036a91e-7a69-4116-acd0-4ceb9552707d/_generated_background_page.html
    // chrome-extension://hkoigaidmgcadmnbolgahdhjbnhkgden /_generated_background_page.html
    // return window.location.pathname === "/_generated_background_page.html";
    return window === chrome.extension.getBackgroundPage();
  })(window);


  /**
   * sendMessage to content_scripts.js from background.js
   * @param tab is required
   * @param msg
   * @returns {Promise}
   */
  function sendMessage2CS(tab, msg) {
    return new Promise(function (resolve, reject) {
      if (tab && tab.id) {
        chrome.tabs.sendMessage(tab.id, msg, function (response) {
          resolve(response);
        });
      } else {
        reject({
          code: -32400,
          message: "Invalid tab."
        })
      }
    });
  }

  /**
   * sendMessage to background.js from content_scripts.js
   * @param msg
   * @returns {Promise}
   */
  function sendMessage2BG(msg) {
    return new Promise(function (resolve, reject) {
      chrome.runtime.sendMessage(msg, function (response) {
        resolve(response);
      });
    });
  }

  var _mk_rpc_call = function (tab) {   // as a client
    var sendMsg =
      isBackground //  in background.js need sendMessage to content_scripts.js,,, !!!!!!!! 判断 background 的方法有问题，在插件页面中 moz-extension://80221d50-a680-42f0-8e00-756ea0533b33/cq-support.html 也是可以访问 chrome.tabs 的。
        ? (sendMessage2CS.bind(undefined, tab))
        : sendMessage2BG;
    var _seq = 1;
    return function (method) {
      var params = Array.prototype.slice.call(arguments, 1); // convert to a javascript array.
      return new Promise(function (resolve, reject) {
        var input = {method: method, params: params, id: (_seq++) + "-" + (new Date()).getTime()};
        sendMsg(input).then(function (output) {
          if (output.error !== undefined) {
            reject(output.error);
          } else {
            resolve(output.result);
          }
        }).catch(function (err) {
          reject({
            code: -32400,
            message: err.message,
            caused: err
          })
        });
      })
    };
  };
  var _bind_message_event_4_rpc = function () {
    var _repo = (function () {
      var _repository = [];

      var _register = function (namespace, handler) {
        _repository.push({
          namespace: namespace,
          handler: handler
        })
      };
      var _lookup = function (namespace) {
        for (var i = 0; i < _repository.length; i++) {
          var _rpc_method = _repository[i];
          if (namespace === _rpc_method.namespace) {
            return _rpc_method.handler;
          }
        }
      };
      var _invoke = function (input, sender) {
        return new Promise(function (resolve, reject) {
          var method_name = input.method;
          var method = _lookup(method_name);
          if (method === undefined) {
            return resolve({
              id: input && input.id || null,
              error: {
                code: -32601,
                message: "Method not found"
              }
            });
          } else {
            try {
              // when in background, then append senderTab be the last argument
              var _params = isBackground ? input.params.concat([sender]) : input.params;
              resolve({
                id: input && input.id || null,
                result: method.apply(method, _params)
              })
            } catch (err) {
              console.error("_invoke error...", err);
              resolve({
                id: input && input.id || null,
                error: err
              })
            }
          }
          //
        })
      };
      return {
        reg: _register,
        invoke: _invoke
      }
    })();
    //
    chrome.runtime.onMessage.addListener(function (request, sender, sendResponse) {
      setTimeout(function () {
        _repo.invoke(request, sender).then(function (output) {
          sendResponse(output);
        })
      }, 0);
      return true;
    });
    return _repo;
  };
  var _rpc_repo = _bind_message_event_4_rpc();

  return {
    reg: _rpc_repo.reg,
    mk_call: _mk_rpc_call
  };
}

//
module.exports = _make(window.browser === undefined ? window.chrome : window.browser);