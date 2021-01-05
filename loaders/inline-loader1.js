function loader(source) {
  console.log("inline-loader1");
  return source + "//inline-loader1";
}
loader.pitch = function () {
  console.log("inline1-pitch");
  return "inline1-pitch";
};

module.exports = loader;
