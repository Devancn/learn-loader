function loader(source) {
  console.log("inline-loader2");
  return source + "//inline-loader2";
}
loader.pitch = function() {
  console.log("inline2-pitch");
}
module.exports = loader;
