export function getRandomBetween(i, j) {
  return Math.floor(Math.random() * j) + i;
}

export function getRandomBool() {
  return getRandomBetween(0, 2) === 0;
}

export function getRandomItem(arr, maxIdx = Infinity) {
  return arr[getRandomBetween(0, Math.min(arr.length, maxIdx))];
}

export function getLastItem(arr) {
  return arr[arr.length-1];
}

export function getLongestWord(words) {
  let longest = words[0];
  words.forEach((word) => word.length > longest.length ? longest = word : word = word);
  return longest;
}

export function cleanText(text) {
  return text.replace('\n', '').replace(/[^A-Za-z'\.\!\,\? ]/g, '');
}

export function removeSmallWords(text, minLength = -1) {
  if (minLength === -1) minLength = getRandomBetween(0, 4);
  const newText = text.split(' ').filter((w) => w.trim().replace(/[^A-Za-z']/g, '').length > minLength).join(' ');
  return newText.trim() || text;
}