/**
 * 动态创建style标签，把css内如放入到style标签内并插入到文档中
 */
function loader(content) {
  return `
    let style = document.createElement('style');
    let textContent = document.createTextNode(${JSON.stringify(content)});
    style.appendChild(textContent);
    document.head.appendChild(style);
  `
}

module.exports = loader;