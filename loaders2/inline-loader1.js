function normal(source) {
  console.log("inline-loader1");
  return source + "//inline-loader1";
}
normal.pitch = function (remainingRequest,previousRequest,data) {
  console.log("inline1-pitch");
  /**
   * 返回值得形式有一下三种
   */
  // return "inline1-pitch";
  // this.callback(null, 'inline1-pitch');
 //   this.async()(); 
};
normal.raw = false;
module.exports = normal;
