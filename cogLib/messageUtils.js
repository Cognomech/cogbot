function defaultVals(defaultValue, ...vars) {
  for (let i = 0; i < vars.length; i = +1) {
    if (vars[i] !== undefined) return vars[i];
  }
  return defaultValue;
}

module.exports.authorName = function authorName(message) {
  return defaultVals(message.author.username, message.member.nickname);
};
