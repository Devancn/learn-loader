let { getOptions } = require("loader-utils");
let postcss = require("postcss");
let Tokenizer = require("css-selector-tokenizer");

function loader(inputSource) {
  let loaderOptions = getOptions(this) || {};
  let callback = this.async();
  const cssPlugin = (options) => {
    return (root) => {
      root.walkAtRules(/^import$/i, rule => {
        rule.remove(); // 把@import删除
        options.imports.push(rule.params.slice(1, -1)) // 取出import函数内的参数

      })
    };
  };
  let options = { imports: [] };
  let pipeline = postcss([cssPlugin(options)]);
  pipeline.process(inputSource).then(result => {
    let {importLoaders = 0} = loaderOptions; // 
    let {loaders, loaderIndex} = this;
    let loadersRequest = loaders.slice(
      loaderIndex,
      loaderIndex + 1 + importLoaders
    ).map(x => x.request).join('!');
    let importCSS = options.imports.map(url => `list.push(...require('./global.css'))`).join('\r\n');
    let script = `
      var list = [];
      list.toString = function() {return this.join('')}
      ${importCSS}
      list.push(\'${result.css}\');
      module.exports = list;
    `;
    callback(null, script);
  });
}

module.exports = loader;
