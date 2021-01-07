function loader(source) {
  console.log("pre-loader2");
  return source + "//pre-loader2";
}
loader.pitch = function () {
  console.log("pre2-pitch");
  return '哈哈哈哈我不继续readFile了'
};
module.exports = loader;
