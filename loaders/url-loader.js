const path = require("path");
const { getOptions, interpolateName } = require("loader-utils");
/**
 * 负责打包加载图片
 * 把原始的文件拷贝一份到目标目录dist，然后返回新的文件名
 * @param {*} content
 * @param {*} inputSourceMap
 * @param {*} data
 */
function loader(content, inputSourceMap, data) {
  // this => loaderContext
 
}

module.exports = loader;
