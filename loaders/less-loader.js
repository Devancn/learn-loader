/**
 * 把Less编译成CSS字符串
 * @param {*} content 
 */
let less = require('less');
function loader(content) {
  // 把loader执行变成异步的,默认loader执行时同步的
  let callback = this.async();
  less.render(content, {filename: this.resource}, (err, output) => {
    callback(err, output.css);
  })
}

module.exports = loader;