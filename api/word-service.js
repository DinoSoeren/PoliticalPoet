const HttpService = require('./http-service');
const Utils = require('../utils');
const Sentencer = require('sentencer');

const PEOPLE = [
  {name: 'Andrew Yang', twitter: '@AndrewYang'},
  {name: 'Bernie Sanders', twitter: '@BernieSanders'},
  {name: 'Donald Trump', twitter: '@realDonaldTrump'},
  {name: 'Joe Biden', twitter: '@JoeBiden'},
  {name: 'Elizabeth Warren', twitter: '@ewarren'},
  {name: 'Pete Buttigieg', twitter: '@PeteButtigieg'},
  {name: 'Amy Klobuchar', twitter: '@amyklobuchar'},
  {name: 'Tulsi Gabbard', twitter: '@TulsiGabbard'},
];

const TOPICS = [
  'earth','climate','gender',
  'food','health','brain',
  'treason','democracy','serenity',
  'love','hate','mail','crime',
  'death','banana','joke','monkey'
];

const VERBS = [
  'is', 'go', 'do', 'take', 'look', 'get', 'talk',
  'think', 'hope', 'dream', 'fake', 'like', 'hate',
  'argue', 'wave', 'blesse', 'pray', 'yell', 'tweet',
  'debate', 'run', 'focus', 'forget', 'remember'
];

const getRandomTopic = exports.getRandomTopic = function() {
  return Utils.getRandomItem(TOPICS);
}

const getRandomPerson = exports.getRandomPerson = function() {
  return Utils.getRandomItem(PEOPLE);
}

const getRandomVerb = exports.getRandomVerb = function() {
  return Utils.getRandomItem(VERBS);
}

const generateAdjective = exports.generateAdjective = function() {
  return Sentencer.make("{{ adjective }}");
}

const generateNoun = exports.generateNoun = function() {
  return Sentencer.make("{{ noun }}");
}

const getRhymingWordsAsync = exports.getRhymingWordsAsync = async function(word) {
  const wordWithNoPunctuation = word.replace(/[^A-Za-z]/g, '');
  const perfectRhymeUrl = `https://api.datamuse.com/words?rel_rhy=${wordWithNoPunctuation}`;
  const nearRhymeUrl = `https://api.datamuse.com/words?rel_nry=${wordWithNoPunctuation}`;
  let words;

  try {
    words = await HttpService.httpGet(perfectRhymeUrl);
    console.log(`Found ${words.length} perfect rhymes with ${word}.`);
  } catch (err) {
    console.log(`Failed to get perfect rhymes for ${word}. ${err.message}.`);
  }

  if (!words || words.length === 0) {
    try {
      words = await HttpService.httpGet(nearRhymeUrl);
      console.log(`Found ${words.length} near rhymes with ${word}.`);
    } catch (err) {
      console.log(`Failed to get rhymes for ${word}. ${err.message}.`);
      throw err;
    }
  }

  return words;
}

const getRhymeAsync = exports.getRhymeAsync = async function(word) {
  const rhymes = await getRhymingWordsAsync(word);
  const rhyme = rhymes.length > 0 ? Utils.getRandomItem(rhymingWords, Math.floor(Math.min(3, rhymes.length/3))).word : word;
  console.log(`Using ${rhyme} to rhyme with ${word}`);
  return rhyme;
}

const getSynonymsAsync = exports.getSynonymsAsync = async function(word) {
  const wordWithNoPunctuation = word.replace(/[^A-Za-z]/g, '');
  const synonymUrl = `https://api.datamuse.com/words?rel_syn=${wordWithNoPunctuation}`;
  const soundsLikeUrl = `https://api.datamuse.com/words?sl=${wordWithNoPunctuation}`;
  let words;

  try {
    words = await HttpService.httpGet(synonymUrl);
    console.log(`Found ${words.length} synonyms of ${word}.`);
  } catch (err) {
    console.log(`Failed to get synonyms for ${word}. ${err.message}.`);
  }

  if (!words || words.length === 0) {
    try {
      words = await HttpService.httpGet(soundsLikeUrl);
      console.log(`Found ${words.length} words that sound like ${word}.`);
    } catch (err) {
      console.log(`Failed to get words that sound like ${word}. ${err.message}.`);
      throw err;
    }
  }

  return words;
}

const getSynonymAsync = exports.getSynonymAsync = async function(word) {
  const synonyms = await getSynonymsAsync(word);
  if (!synonyms || synonyms.length === 0) {
    synonyms = [word];
  }
  const maxIdx = Math.floor(Math.min(4, synonyms.length/4));
  const synonym = Utils.getRandomItem(synonyms, maxIdx).word;
  console.log(`Using ${synonym} as a synonym for ${word}`);
  return synonym;
}

const getPredecessorsAsync = exports.getPredecessorsAsync = async function(word) {
  const wordWithNoPunctuation = word.replace(/[^A-Za-z]/g, '');
  const url = `https://api.datamuse.com/words?rel_bgb=${wordWithNoPunctuation}`;
  let words;

  try {
    words = await HttpService.httpGet(url);
    console.log(`Found ${words.length} predecessors of ${word}.`);
  } catch (err) {
    console.log(`Failed to get predecessors for ${word}. ${err.message}`);
    throw err;
  }

  return words;
}

const getPredecessorAsync = exports.getPredecessorAsync = async function(word) {
  const predecessors = await getPredecessorsAsync(word);
  if (!predecessors || predecessors.length === 0) {
    predecessors = [generateAdjective()];
  }
  const maxIdx = Math.floor(Math.min(4, predecessors.length/4));
  const predecessor = Utils.getRandomItem(predecessors, maxIdx).word;
  console.log(`Using ${predecessor} as a predecessor for ${word}`);
  return predecessor;
}