const path = require("path");
const mime = require("mime");
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
  let options = getOptions(this) || {};
  let { limit = 1024, fallback = "file-loader" } = options;
  const mimeType = mime.getType(this.resourcePath); // image/jpeg
  if (content.length < limit) {
    let base64Str = `data:${mimeType};base64,${content.toString("base64")}`;
    return `module.exports = ${JSON.stringify(base64Str)}`; //esm
  } else {
    let fileLoader = require(fallback);
    return fileLoader.call(this, content);
  }
}
// 表示该loader的content是一个Buffer
loader.raw = true;
module.exports = loader;
