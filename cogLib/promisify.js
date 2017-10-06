module.exports = func => (...args) => new Promise((resolve, reject) => {
  func(...args, (err, callback) => {
    if (err) reject(err);
    else resolve(callback);
  });
});

