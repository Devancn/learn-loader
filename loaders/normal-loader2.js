function loader(source) {
  console.log("normal-loader2");
  return source + "//normal-loader2";
}
loader.pitch = function () {
  console.log("normal2-pitch");
};
module.exports = loader;
