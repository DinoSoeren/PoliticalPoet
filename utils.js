exports.getRandomBetween = function(i, j) {
  return Math.floor(Math.random() * j) + i;
}

exports.getRandomBool = function() {
  return getRandomBetween(0, 2) === 0;
}

exports.getRandomItem = function(arr, maxIdx = Infinity) {
  return arr[getRandomBetween(0, Math.min(arr.length, maxIdx))];
}

exports.getLastItem = function(arr) {
  return arr[arr.length-1];
}

exports.getLongestWord = function(words) {
  let longest = words[0];
  words.forEach((word) => word.length > longest.length ? longest = word : word = word);
  return longest;
}

exports.cleanText = function(text) {
  return text.replace('\n', '').replace(/[^A-Za-z'\.\!\,\? ]/g, '');
}

exports.removeSmallWords = function(text, minLength = -1) {
  if (minLength === -1) minLength = getRandomBetween(0, 4);
  const newText = text.split(' ').filter((w) => w.trim().replace(/[^A-Za-z']/g, '').length > minLength).join(' ');
  return newText.trim() || text;
}