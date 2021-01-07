let fs = require("fs");
let path = require("path");
let readFile = fs.readFile.bind(this);
let PATH_QUERY_FRAGMENT_REGEXP = /^([^?#]*)(\?[^#]*)?(#.*)?$/;
function parsePathQueryFragment(resource) {
  let result = PATH_QUERY_FRAGMENT_REGEXP.exec(resource);
  return {
    path: result[1], // 路径名
    query: result[2], // 查询字符串
    fragment: result[3], // 片段（锚点）
  };
}

function createLoaderObject(request) {
  let loaderObj = {
    path: "",
    query: "",
    fragment: "",
    normal: null, // loader 函数本身
    pitch: null, // pitch函数本身
    raw: false, // 是否转成buffer
    data: {}, // 每个loader都会有一个自定义的data对象，用来存放一些自定义信息
    pitchExecuted: false, // 是否已经执行过pitch函数
    normalExecuted: false, // 是否已经执行过normal函数
  };
  Object.defineProperty(loaderObj, "request", {
    get() {
      return loaderObj.path + loaderObj.query + loaderObj.fragment;
    },
    set(request) {
      let { path, fragment, query } = parsePathQueryFragment(request);
      loaderObj.path = path;
      loaderObj.fragment = fragment;
      loaderObj.query = query;
    },
  });
  loaderObj.request = request;
  let normal = require(loaderObj.path);
  loaderObj.normal = normal;
  loaderObj.raw = normal.raw;
  let pitch = normal.pitch;
  loaderObj.pitch = pitch;
  return loaderObj;
}

function processResource(processOptions, loaderContext, finalCallback) {
  loaderContext.loaderIndex = loaderContext.loaderIndex - 1;
  let resourcePath = loaderContext.resourcePath;
  console.log(resourcePath, "resourcePath");
  loaderContext.readResource(resourcePath, (err, resultBuffer) => {
    if (err) return finalCallback(err);
    processOptions.resourceBuffer = resultBuffer;
    iterateNormalLoaders(
      processOptions,
      loaderContext,
      [resultBuffer],
      finalCallback
    );
  });
}

function iterateNormalLoaders(
  processOptions,
  loaderContext,
  args,
  finalCallback
) {
  if (loaderContext.loaderIndex < 0) {
    return finalCallback(null, args);
  }
  // 获取当前的loader
  let currentLoaderObject = loaderContext.loaders[loaderContext.loaderIndex];
  if (currentLoaderObject.normalExecuted) {
    loaderContext.loaderIndex--;
    return iterateNormalLoaders(
      processOptions,
      loaderContext,
      args,
      finalCallback
    );
  }
  let normalFunction = currentLoaderObject.normal;
  // 表示loader函数的pitch函数已经执行过了
  currentLoaderObject.normalExecuted = true;
  convertArgs(args, currentLoaderObject.raw);
  runSyncOrAsync(normalFunction, loaderContext, args, (err, ...values) => {
    if (err) finalCallback(err);
    iterateNormalLoaders(processOptions, loaderContext, values, finalCallback);
  });
}

function convertArgs(args, raw) {
  if (raw && !Buffer.isBuffer(args[0])) {
    args[0] = Buffer.from(args[0]);
  } else if (!raw && Buffer.isBuffer(args[0])) {
    args[0] = args[0].toString("utf-8");
  }
}

function iteratePitchingLoaders(processOptions, loaderContext, finalCallback) {
  if (loaderContext.loaderIndex >= loaderContext.loaders.length) {
    return processResource(processOptions, loaderContext, finalCallback);
  }
  // 获取当前的loader
  let currentLoaderObject = loaderContext.loaders[loaderContext.loaderIndex];
  if (currentLoaderObject.pitchExecuted) {
    loaderContext.loaderIndex++;
    return iteratePitchingLoaders(processOptions, loaderContext, finalCallback);
  }
  let pitchFunction = currentLoaderObject.pitch;
  // 表示loader函数的pitch函数已经执行过了
  currentLoaderObject.pitchExecuted = true;
  // 如果没有pitch方法
  if (!pitchFunction) {
    return iteratePitchingLoaders(processOptions, loaderContext, finalCallback);
  }
  runSyncOrAsync(
    pitchFunction,
    loaderContext,
    [
      loaderContext.remainingRequest,
      loaderContext.previousRequest,
      loaderContext.data,
    ],
    (err, ...values) => {
      // 表示pitch已经执行完成该执行norm loader
      if (values.length > 0 && !!values[0]) {
        loaderContext.loaderIndex--;
        iterateNormalLoaders(processOptions, loaderContext, values, finalCallback);
      } else {
        iteratePitchingLoaders(processOptions, loaderContext, finalCallback);
      }
    }
  );
}

function runSyncOrAsync(fn, context, args, callback) {
  // 是否同步，默认为true
  let isSync = true;
  // 是否fn已经执行完成，默认为false
  let isDone = false;
  const innerCallback = (context.callback = function (err, ...values) {
    isDone = true;
    isSync = false;
    callback(err, ...values);
  });
  context.async = function () {
    isSync = false;
    return innerCallback;
  };

  // pitch的返回值可有可无
  let result = fn.apply(context, args);
  if (isSync) {
    isDone = true;
    return callback(null, result);
  }
}

function runLoaders(options, callback) {
  // 要加载的资源
  let resource = options.resource || "";
  // loader绝对路径数组
  let loaders = options.loaders || [];
  // 这个对象会成为loader函数执行的this
  let loaderContext = options.context || {};
  let readResource = options.readResource || readFile;
  let splittedResource = parsePathQueryFragment(resource);
  let resourcePath = splittedResource.path;
  let resourceQuery = splittedResource.query;
  let resourceFragment = splittedResource.fragment;
  let contextDirectory = path.dirname(resourcePath); // 加载资源所在的目录

  let loaderObjects = loaders.map(createLoaderObject);

  loaderContext.context = contextDirectory;
  loaderContext.resourceQuery = resourceQuery;
  loaderContext.resourceFragment = resourceFragment;
  loaderContext.resource = resource;
  loaderContext.resourcePath = resourcePath;
  loaderContext.readResource = readResource;

  loaderContext.loaderIndex = 0; // 控制执行哪个loader
  loaderContext.loaders = loaderObjects;
  loaderContext.callback = null;
  loaderContext.async = null;

  // 要加载的资源，不包含loader
  Object.defineProperty(loaderContext, "resource", {
    get() {
      const { resourcePath, resourceQuery, resourceFragment } = loaderContext;
      return resourcePath + resourceQuery + resourceFragment;
    },
  });
  // 要加载的资源，包含loader
  Object.defineProperty(loaderContext, "request", {
    get() {
      const { loaders } = loaderContext;
      return loaders
        .map((loader) => loader.request)
        .concat(loaderContext.resource)
        .join("!");
    },
  });
  Object.defineProperty(loaderContext, "remainingRequest", {
    get() {
      const { loaders, loaderIndex } = loaderContext;
      return loaders
        .slice(loaderIndex + 1)
        .concat(loaderContext.resource)
        .join("!");
    },
  });
  Object.defineProperty(loaderContext, "currentRequest", {
    get() {
      const { loaders, loaderIndex } = loaderContext;
      return loaders
        .slice(loaderIndex)
        .concat(loaderContext.resource)
        .join("!");
    },
  });
  Object.defineProperty(loaderContext, "previousRequest", {
    get() {
      const { loaders, loaderIndex } = loaderContext;
      return loaders.slice(0, loaderIndex).join("!");
    },
  });
  // 当前的loader的query
  Object.defineProperty(loaderContext, "query", {
    get() {
      const { loaders, loaderIndex } = loaderContext;
      let loaderObj = loaders[loaderIndex];
      return loaderObj.options || loaderObj.query;
    },
  });
  // 当前loader的data
  Object.defineProperty(loaderContext, "data", {
    get() {
      const { loaders, loaderIndex } = loaderContext;
      let loaderObj = loaders[loaderIndex];
      return loaderObj.data;
    },
  });
  let processOptions = {
    resourceBuffer: null,
  };

  // 开始执行loader
  iteratePitchingLoaders(processOptions, loaderContext, (err, result) => {
    callback(null, {
      result,
      resourceBuffer: processOptions.resourceBuffer,
    });
  });
}
exports.runLoaders = runLoaders;
