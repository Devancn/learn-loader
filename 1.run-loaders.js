let path = require("path");
let fs = require("fs");
let { runLoaders } = require("loader-runner");
const loader = require("./loaders/inline-loader1");
let filePath = path.resolve(__dirname, "src", "index.js");
let request = `inline-loader1!inline-loader2!${filePath}`;
let parts = request.replace(/^-?!+/, "").split("!");
let resource = parts.pop();
let resolveLoader = (loader) => path.resolve(__dirname, "loaders", loader);
let inlineLoaders = parts.map(resolveLoader);
let rules = [
  {
    test: /\.js$/,
    use: ["normal-loader1", "normal-loader2"],
  },
  {
    test: /\.js$/,
    enforce: "post",
    use: ["post-loader1", "post-loader2"],
  },
  {
    test: /\.js$/,
    enforce: "pre",
    use: ["pre-loader1", "pre-loader2"],
  },
];

let preLoaders = [];
let postLoaders = [];
let normalLoaders = [];

for (let i = 0; i < rules.length; i++) {
  let rule = rules[i];
  if (rules[i].test.test(resource)) {
    if (rule.enforce === "pre") {
      preLoaders.push(...rule.use);
    } else if (rule.enforce === "post") {
      postLoaders.push(...rule.use);
    } else {
      normalLoaders.push(...rule.use);
    }
  }
}

preLoaders = preLoaders.map(resolveLoader);
postLoaders = postLoaders.map(resolveLoader);
normalLoaders = normalLoaders.map(resolveLoader);

let loaders = [];
if (request.startsWith("!!")) {
  loaders = [...inlineLoaders];
} else if (request.startsWith("-!")) {
  loaders = [...postLoaders, ...inlineLoaders];
} else if (request.startsWith("!")) {
  loaders = [...postLoaders, ...inlineLoaders, ...preLoaders];
} else {
  loaders = [...postLoaders, ...inlineLoaders, ...normalLoaders, ...preLoaders];
}

/**
 * 1. 读取要价在的资源
 * 2. 把资源传递给loader链条， 一一处理，最后得到结果
 */
runLoaders(
  {
    // 要价在和转换的资源
    resource: "",
    // loader的绝对路径数组
    loaders,
    // 额外的loader上下文对象
    context: { name: "Devan" },
    // 读取文件的方法
    readResource: fs.readFile.bind(fs),
  },
  function (err, result) {
    // console.log(err);
    console.log(result);
  }
);
