const path = require("path");
const core = require("@babel/core");
/**
 *
 * @param {*} source
 * @param {*} inputSourceMap 输入的sourceMap
 * @param {*} data 额外的数据,与当前loader pitch中的data共享
 */
function loader(source, inputSourceMap, data) {
  const options = {
    presets: ["@babel/preset-env"],
    inputSourceMap,
    sourceMaps: true,
    filename: path.basename(this.resourcePath),
  };
  let { code, map, ast } = core.transform(source, options);
  /**
   * 当需要返回多个值时需要使用this.callback来传递多个值
   * 也可以直接返回 return code
   */
  return this.callback(null, code, map, ast);
}
loader.pitch = function(remainingRequest, previousRequest,data) {
  data.name = 'babel-loader-pitch'
} 
module.exports = loader;
