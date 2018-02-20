var wxRPC = require("wxRPC");

function _main(chrome) {

  wxRPC.reg("needLogin", function (sender) {
  });

  // 构建右键-上下文菜单
  function buildContextMenu() {
  }

  buildContextMenu();
}

_main(window.browser === undefined ? window.chrome : window.browser);