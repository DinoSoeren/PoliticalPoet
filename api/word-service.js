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
  'earth','climate','food','country','democracy','crime',
  'death','banana','joke','monkey','news','politics','healthcare',
  'taxes','kickboxing','music','starwars','Tupac'
];

const VERBS = [
  'take', 'get', 'think', 'like', 'love',
  'hate', 'tweet', 'debate', 'run', 'post',
  'forget', 'remember', 'kill', 'destroy',
  'extract', 'prolong', 'imagine', 'join',
  'fortell', 'include', 'exclude', 'judge',
  'want', 'steal', 'embrace', 'fight', 'resist'
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

async function getRhymingWordsAsync(word) {
  const perfectRhymeUrl = `https://api.datamuse.com/words?rel_rhy=${word}`;
  const nearRhymeUrl = `https://api.datamuse.com/words?rel_nry=${word}`;
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
    }
  }

  return words;
}

const getRhymeAsync = exports.getRhymeAsync = async function(word) {
  word = Utils.removePunctuation(word);
  let rhymes = await getRhymingWordsAsync(word);
  if (!rhymes || rhymes.length === 0) {
    rhymes = [{word: word}];
  }
  const maxIdx = Math.floor(Math.min(4, rhymes.length/4));
  const rhyme = rhymes.length > 0 ? Utils.getRandomItem(rhymes, maxIdx).word : word;
  console.log(`Using ${rhyme} to rhyme with ${word}`);
  return rhyme;
}

async function getSynonymsAsync(word) {
  const synonymUrl = `https://api.datamuse.com/words?rel_syn=${word}`;
  const soundsLikeUrl = `https://api.datamuse.com/words?sl=${word}`;
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
    }
  }

  return words;
}

const getSynonymAsync = exports.getSynonymAsync = async function(word) {
  word = Utils.removePunctuation(word);
  let synonyms = await getSynonymsAsync(word);
  if (!synonyms || synonyms.length === 0) {
    synonyms = [{word: word}];
  }
  const maxIdx = Math.floor(Math.min(4, synonyms.length/4));
  const synonym = Utils.getRandomItem(synonyms, maxIdx).word;
  console.log(`Using ${synonym} as a synonym for ${word}`);
  return synonym;
}

async function getPredecessorsAsync(word) {
  const url = `https://api.datamuse.com/words?rel_bgb=${word}`;
  let words;

  try {
    words = await HttpService.httpGet(url);
    console.log(`Found ${words.length} predecessors of ${word}.`);
  } catch (err) {
    console.log(`Failed to get predecessors for ${word}. ${err.message}`);
  }

  return words;
}

const getPredecessorAsync = exports.getPredecessorAsync = async function(word) {
  word = Utils.removePunctuation(word);
  let predecessors = await getPredecessorsAsync(word);
  if (!predecessors || predecessors.length === 0) {
    predecessors = [{word: generateAdjective()}];
  }
  const maxIdx = Math.floor(Math.min(4, predecessors.length/4));
  const predecessor = Utils.getRandomItem(predecessors, maxIdx).word;
  console.log(`Using ${predecessor} as a predecessor for ${word}`);
  return predecessor;
}