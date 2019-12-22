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

exports.getRandomTopic = function() {
  return Utils.getRandomItem(TOPICS);
}

exports.getRandomPerson = function() {
  return Utils.getRandomItem(PEOPLE);
}

exports.getRandomVerb = function() {
  return Utils.getRandomItem(VERBS);
}

exports.generateAdjective = function() {
  return Sentencer.make("{{ adjective }}");
}

exports.generateNoun = function() {
  return Sentencer.make("{{ noun }}");
}

function sendDatamuseRhymeRequest(word) {
  return HttpService.httpGet(`https://api.datamuse.com/words?rel_nry=${word.replace(/[^A-Za-z]/g, '')}`);
}

exports.getRhymingWordsAsync = function(word) {
  return new Promise((resolve, reject) => {
    sendDatamuseRhymeRequest(word).then((words) => {
      console.log(`Found ${words.length} words that rhyme with ${word}.`);
      resolve(words);
    }).catch((err) => {
      console.log(`Failed to get rhymes for ${word}: ${err.message}`);
      reject(err);
    });
  });
}

exports.getRandomRhymingWordAsync = function(word) {
  return new Promise((resolve) => {
    getRhymingWordsAsync(word).then((rhymingWords) => {
      const rhyme = rhymingWords.length > 0 ? getRandomItem(rhymingWords, 5).word : word;
      console.log(`Using ${rhyme} to rhyme with ${word}`);
      resolve(rhyme);
    }).catch((err) => {
      console.log(`Failed to get rhyme for ${word}: ${err.message}`);
      resolve(word);
    });
  });
}

function sendDatamuseSynonymRequest(word) {
  return HttpService.httpGet(`https://api.datamuse.com/words?rel_syn=${word.replace(/[^A-Za-z]/g, '')}`);
}

exports.getSynonymsAsync = function(word) {
  return new Promise((resolve, reject) => {
    sendDatamuseSynonymRequest(word).then((words) => {
      console.log(`Found ${words.length} synonyms of ${word}.`);
      resolve(words);
    }).catch((err) => {
      console.log(`Failed to get synonyms for ${word}: ${err.message}`);
      reject(err);
    });
  });
}

exports.getRandomSynonymAsync = function(word) {
  return new Promise((resolve) => {
    getSynonymsAsync(word).then((words) => {
      const synonym = words.length > 0 ? getRandomItem(words, 5).word : word;
      console.log(`Using ${synonym} as a synonym for ${word}`);
      resolve(synonym);
    }).catch((err) => {
      console.log(`Failed to get synonym for ${word}: ${err.message}`);
      resolve(word);
    });
  });
}

function sendDatamusePredecessorsRequest(word) {
  return HttpService.httpGet(`https://api.datamuse.com/words?rel_bgb=${word.replace(/[^A-Za-z]/g, '')}`);
}

exports.getPredecessorsAsync = function(word) {
  return new Promise((resolve, reject) => {
    sendDatamusePredecessorsRequest(word).then((words) => {
      console.log(`Found ${words.length} predecessors of ${word}.`);
      resolve(words);
    }).catch((err) => {
      console.log(`Failed to get predecessors for ${word}: ${err.message}`);
      reject(err);
    });
  });
}

exports.getRandomPredecessorAsync = function(word) {
  return new Promise((resolve) => {
    getPredecessorsAsync(word).then((words) => {
      const predecessor = words.length > 0 ? getRandomItem(words, 5).word : word;
      console.log(`Using ${predecessor} as a predecessor for ${word}`);
      resolve(predecessor);
    }).catch((err) => {
      console.log(`Failed to get predecessor for ${word}: ${err.message}`);
      resolve(word);
    });
  });
}