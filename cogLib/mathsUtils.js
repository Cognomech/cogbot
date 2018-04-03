module.exports.percentile = function percentile(numbers, percent) {
  numbers.sort((a, b) => a - b);
  let index = (percent / 100) * numbers.length;

  if (Number.isInteger(index)) {
    return (numbers[index - 1] + numbers[index]) / 2;
  }

  index = Math.ceil(index);
  return numbers[index - 1];
};

module.exports.numberText = ["zero", "one", "two", "three", "four", "five", "six", "seven", "eight", "nine"];

module.exports.numberUnicode = ["\u0030\u20E3", "\u0031\u20E3", "\u0032\u20E3", "\u0033\u20E3", "\u0034\u20E3", "\u0035\u20E3", "\u0036\u20E3", "\u0037\u20E3", "\u0038\u20E3", "\u0039\u20E3"];
