var ejs_engine = require('./lib/ejs');


module.exports = function () {
  var ejs = ejs_engine();
  //
  function ejs_compile(inc_name, content) {
    var template_fn = ejs.cache.get(inc_name);
    if (template_fn) {
      return template_fn;
    }
    template_fn = ejs.compile(content, {
      cache: true, filename: inc_name
    });
    ejs.cache.set(inc_name, template_fn);
    return template_fn;
  }

  return {
    engine: ejs,
    compile: ejs_compile
  }
};