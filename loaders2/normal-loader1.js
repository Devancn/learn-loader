function loader(source) {
  console.log("normal-loader1");
  return source + "//normal-loader1";
}

loader.pitch = function () {
  console.log("normal1-pitch");
};
module.exports = loader;
