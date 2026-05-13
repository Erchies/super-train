const fs = require("fs");

if (process.platform === "win32") {
  const originalReadlink = fs.readlink;
  const originalReadlinkSync = fs.readlinkSync;
  const originalPromisesReadlink = fs.promises.readlink;

  function normalizeReadlinkError(error) {
    if (error && error.code === "EISDIR" && error.syscall === "readlink") {
      error.code = "EINVAL";
      error.message = error.message.replace("EISDIR", "EINVAL");
    }

    return error;
  }

  fs.readlink = function patchedReadlink(path, options, callback) {
    if (typeof options === "function") {
      callback = options;
      options = undefined;
    }

    return originalReadlink.call(fs, path, options, (error, linkString) => {
      callback(normalizeReadlinkError(error), linkString);
    });
  };

  fs.readlinkSync = function patchedReadlinkSync(path, options) {
    try {
      return originalReadlinkSync.call(fs, path, options);
    } catch (error) {
      throw normalizeReadlinkError(error);
    }
  };

  fs.promises.readlink = async function patchedPromisesReadlink(path, options) {
    try {
      return await originalPromisesReadlink.call(fs.promises, path, options);
    } catch (error) {
      throw normalizeReadlinkError(error);
    }
  };
}
