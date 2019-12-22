const getRandomBetween = exports.getRandomBetween = function(i, j) {
  return Math.floor(Math.random() * j) + i;
}

const getRandomBool = exports.getRandomBool = function() {
  return getRandomBetween(0, 2) === 0;
}

const getRandomItem = exports.getRandomItem = function(arr, maxIdx = Infinity) {
  return arr[getRandomBetween(0, Math.min(arr.length, maxIdx))];
}

const getLastItem = exports.getLastItem = function(arr) {
  return arr[arr.length-1];
}

const getLongestWord = exports.getLongestWord = function(words) {
  let longest = words[0];
  words.forEach((word) => word.length > longest.length ? longest = word : word = word);
  return longest;
}

const cleanText = exports.cleanText = function(text) {
  return text.replace('\n', '').replace(/[^A-Za-z'\.\!\,\? ]/g, '');
}

const removeSmallWords = exports.removeSmallWords = function(text, minLength = -1) {
  if (minLength === -1) minLength = getRandomBetween(0, 4);
  const newText = text.split(' ').filter((w) => w.trim().replace(/[^A-Za-z']/g, '').length > minLength).join(' ');
  return newText.trim() || text;
}

const removePunctuation = exports.removePunctuation = function(word) {
  return word.replace(/[^A-Za-z]/g, '');
}