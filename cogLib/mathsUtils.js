module.exports.percentile = function percentile(numbers, percent) {
  numbers.sort((a, b) => a - b);
  let index = (percent / 100) * numbers.length;

  if (Number.isInteger(index)) {
    return (numbers[index - 1] + numbers[index]) / 2;
  }

  index = Math.ceil(index);
  return numbers[index - 1];
};
