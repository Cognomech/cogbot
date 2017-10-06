const promisify = require("./promisify.js");
const fs = require("fs");
const path = require("path");

const asyncReaddir = promisify(fs.readdir);
const asyncStat = promisify(fs.stat);

module.exports.asyncRecursiveReaddir = async function asyncDeepReaddir(dir) {
  const results = [];

  await (async function subFunc(currentDir = dir) {
    const files = await asyncReaddir(currentDir);
    await Promise.all(files.map(async (file) => {
      const filePath = path.resolve(`${currentDir}/${file}`);
      const fileStats = await asyncStat(filePath);

      if (fileStats.isDirectory()) {
        await subFunc(filePath);
      } else {
        results.push(filePath);
      }
    }));
  }());

  return results;
};
