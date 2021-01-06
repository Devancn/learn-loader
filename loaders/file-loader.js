const path = require("path");
const { getOptions, interpolateName } = require("loader-utils");
/**
 * 负责打包加载图片
 * 把原始的文件拷贝一份到目标目录dist，然后返回新的文件名
 * @param {*} source
 * @param {*} inputSourceMap
 * @param {*} data
 */
function loader(source, inputSourceMap, data) {
  // this => loaderContext
  let options = getOptions(this) || {}; // 获取loader配置的options
  let filename = interpolateName(this, options.name, { content: source });
  // 向输出的目录里多写一个文件名，assets[filename] = source
  this.emitFile(filename, source);
  if (typeof options.esModule === undefined || options.esModule) {
    return `export default "${filename}"`; //esm
  } else {
    return `module.exports="${filename}"`;
  }
}

module.exports = loader;
