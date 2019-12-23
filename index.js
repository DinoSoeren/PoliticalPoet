const PhraseService = require('./api/phrase-service');
const SentenceService = require('./api/sentence-service');
const TwitterService = require('./api/twitter-service');
const WordService = require('./api/word-service');
const Utils = require('./utils');

const POEM_LINE_COUNT = 4;

async function writePoemAsync(person) {
  const selectedTopic = Utils.getRandomBetween(0, 4) === 0 ? WordService.getRandomTopic() : WordService.generateNoun();
  const topic = Utils.getRandomBetween(0, 4) === 0 ? selectedTopic : await WordService.getSynonymAsync(selectedTopic);
  const isPersonFirst = Utils.getRandomBool();
  const subject = isPersonFirst ? person.name : topic;
  const object = isPersonFirst ? topic : person.name;
  console.log(`Chosen subject: ${subject}`);
  const poemLines = [];
  const personSentence = Utils.removeSmallWords(await SentenceService.buildSentence({'subject': subject, 'verb': WordService.getRandomVerb(), 'object': object, 'useObjDet': isPersonFirst}));
  poemLines.push(personSentence);
  const personRhymeSentence = Utils.removeSmallWords(await SentenceService.buildSentence({'subject': WordService.generateNoun(), 'verb': WordService.getRandomVerb(), 'object': await WordService.getRhymeAsync(Utils.getLastItem(personSentence.split(' ')))}));
  poemLines.push(personRhymeSentence);
  console.log(`Poem so far:\n ${poemLines.join('\n')}`);
  const phrases = await PhraseService.generatePhrasesFrom(personSentence, (POEM_LINE_COUNT-2)/2);
  for (let i = 0; i < phrases.length; i++) {
    const phrase = Utils.removeSmallWords(phrases[i].words.join(' '));
    poemLines.push(phrase);
    const words = phrase.split(' ');
    const rhyme = await WordService.getRhymeAsync(Utils.getLastItem(words));
    const synonym = await WordService.getSynonymAsync(WordService.generateNoun());
    const rhymingSentence = Utils.removeSmallWords(await SentenceService.buildSentence({'subject': synonym, 'verb': WordService.getRandomVerb(), 'object': rhyme, 'isPassive': false}));
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
    console.log(`Error: ${JSON.stringify(err)}`);
    res.status(500).send(err);
  });
};
