const HttpService = require('./api/http-service');
const TwitterService = require('./api/twitter-service');
const WordService = require('./api/word-service');
const Utils = require('./utils');

const deepai = require('deepai');
deepai.setApiKey(process.env.DEEP_AI_API_KEY);

async function sendLinguatoolsSentenceRequest(options) {
  const host = 'https://lt-nlgservice.herokuapp.com/rest/english/realise';
  let url = `${host}?subject=${options.subject}&verb=${options.verb}&object=${options.object}`;
  if (options.useObjDet) url += `&objdet=the`;
  const isPerfect = typeof options.isPerfect !== 'undefined' ? options.isPerfect : Utils.getRandomBool();
  if (isPerfect) url += '&perfect=perfect';
  const isPassive = typeof options.isPassive !== 'undefined' ? options.isPassive : Utils.getRandomBool();
  if (!isPerfect && isPassive) url += '&passive=passive';
  const isQuestion = typeof options.isQuestion !== 'undefined' ? options.isQuestion : Utils.getRandomBool();
  if (isQuestion) url += '&sentencetype=yesno';
  const hasModifier = typeof options.hasModifier !== 'undefined' ? options.hasModifier : Utils.getRandomBetween(0, 4) !== 0;
  if (hasModifier) url += `&objmod=${Utils.getRandomBool() ? WordService.generateAdjective() : await WordService.getRandomPredecessorAsync(options.object)}`;
  return await HttpService.httpGet(url);
}

function getSentence(options) {
  return new Promise((resolve, reject) => {
    sendLinguatoolsSentenceRequest(options).then((response) => {
      const sentence = response.sentence.replace('The ', '');
      console.log(`Generated sentence from Linguatools: ${sentence}`);
      resolve(sentence);
    }).catch((err) => {
      console.log(`Error: Failed to get sentence for '${options}'. ${err}`);
      reject(err);
    });
  });
}

function generateText(basis) {
  return new Promise((resolve, reject) => {
    console.log(`Calling DeepAI to generate text from: ${basis}`);
    deepai.callStandardApi('text-generator', {
      'text': basis,
    }).then((text) => {
      const cleanedText = Utils.cleanText(text.output);
      console.log(`Generated text from DeepAI: ${cleanedText}`);
      resolve(cleanedText);
    }).catch((err) => {
      console.log(`Error: Failed to generate text for '${basis}'. ${err}`);
      reject(err);
    });
  });
}

function extractPhrasesFrom(text, numPhrases = 3) {
  const sentenceArray = text.split(/[\.\!\?\,]/);
  const phrases = new Array(numPhrases);
  const startIdx = Utils.getRandomBetween(1, sentenceArray.length - numPhrases);
  for (let i = 0; i < numPhrases; i++) {
    const sentence = sentenceArray[startIdx + i];
    const words = sentence.trim().split(' ').map((w) => w.trim());
    phrases[i] = {'words': words.slice(0, Math.min(words.length, 5))};
  }
  return phrases;
}

const POEM_LINE_COUNT = 4;

async function writePoemAsync(person) {
  const selectedTopic = Utils.getRandomBetween(0, 4) === 0 ? WordService.getRandomTopic() : WordService.generateNoun();
  const topic = Utils.getRandomBetween(0, 4) === 0 ? selectedTopic : await WordService.getRandomSynonymAsync(selectedTopic);
  const isPersonFirst = Utils.getRandomBool();
  const subject = isPersonFirst ? person.name : topic;
  const object = isPersonFirst ? topic : person.name;
  console.log(`Chosen subject: ${subject}`);
  const poemLines = [];
  const personSentence = Utils.removeSmallWords(await getSentence({'subject': subject, 'verb': WordService.getRandomVerb(), 'object': object, 'useObjDet': isPersonFirst}));
  poemLines.push(personSentence);
  const personRhymeSentence = Utils.removeSmallWords(await getSentence({'subject': WordService.generateNoun(), 'verb': WordService.getRandomVerb(), 'object': await WordService.getRandomRhymingWordAsync(Utils.getLastItem(personSentence.split(' ')))}));
  poemLines.push(personRhymeSentence);
  console.log(`Poem so far:\n ${poemLines.join('\n')}`);
  const text = await generateText(personSentence);
  const phrases = extractPhrasesFrom(text, (POEM_LINE_COUNT-2)/2);
  for (let i = 0; i < phrases.length; i++) {
    const phrase = Utils.removeSmallWords(phrases[i].words.join(' '));
    poemLines.push(phrase);
    const words = phrase.split(' ');
    const rhyme = await WordService.getRandomRhymingWordAsync(Utils.getLastItem(words));
    const synonym = await WordService.getRandomSynonymAsync(Utils.getLongestWord(words));
    const rhymingSentence = Utils.removeSmallWords(await getSentence({'subject': synonym, 'verb': WordService.getRandomVerb(), 'object': rhyme, 'isPassive': false}));
    poemLines.push(rhymingSentence);
  }
  // Swap consecutive lines
  for (let i = 0; i < POEM_LINE_COUNT; i+=4) {
    const temp = poemLines[i+1];
    poemLines[i+1] = poemLines[i+2];
    poemLines[i+2] = temp;
  }
  const shiftAmount = Utils.getRandomBetween(0, POEM_LINE_COUNT);
  console.log(`Shifting lines by ${shiftAmount}`);
  for (let i = 0; i < shiftAmount; i++) {
    poemLines.push(poemLines.shift());
  }
  return poemLines.map((line) => line.replace(/[^A-Za-z' ]/g, '')).map((line) => line.charAt(0).toUpperCase() + line.substring(1)).join('\n');
}

/**
 * Responds to any HTTP request.
 *
 * @param {!express:Request} req HTTP request context.
 * @param {!express:Response} res HTTP response context.
 */
exports.writePoem = (req, res) => {
  const personName = req.query.name || req.body.name;
  const person = personName ? {name: personName} : WordService.getRandomPerson();
  writePoemAsync(person).then((poem) => {
    const tweet = `${poem}\n\n~~a #shittypoem about ${person.twitter} written by a bot 🤖~~`;
    res.status(200).send(tweet);
    if (process.env.SEND_TWEET) {
      TwitterService.sendTweet(tweet);
    }
  }).catch((err) => {
    res.status(500).send(err);
  });
};
