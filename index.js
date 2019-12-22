const https = require('https');
const deepai = require('deepai');
deepai.setApiKey('quickstart-QUdJIGlzIGNvbWluZy4uLi4K');
var Sentencer = require('sentencer');

const people = [
  {name: 'Andrew Yang', twitter: '@AndrewYang'},
  {name: 'Bernie Sanders', twitter: '@BernieSanders'},
  {name: 'Donald Trump', twitter: '@realDonaldTrump'},
  {name: 'Joe Biden', twitter: '@JoeBiden'},
  {name: 'Elizabeth Warren', twitter: '@ewarren'},
  {name: 'Pete Buttigieg', twitter: '@PeteButtigieg'},
  {name: 'Amy Klobuchar', twitter: '@amyklobuchar'},
  {name: 'Tulsi Gabbard', twitter: '@TulsiGabbard'},
];

const subjects = [
  'earth','climate','gender',
  'jealousy','health','mindfulness',
  'treason','democracy','serenity',
  'love','hate','sex','crime',
  'death',
  'banana'
];

const verbs = [
  'is', 'goes', 'takes', 'looks', 'gets', 'talks',
  'thinks', 'hopes', 'dreams', 'fakes', 'likes', 'hates',
  'argues', 'waves', 'blesses', 'prays', 'yells', 'tweets',
  'debates', 'runs', 'focuses', 'forgets', 'remembers'
];

function getRandomBetween(i, j) {
  return Math.floor(Math.random() * j) + i;
}

function getRandomSubject() {
  return subjects[getRandomBetween(0, subjects.length)];
}

function getRandomPerson() {
  return people[getRandomBetween(0, people.length)];
}

function getRandomVerb() {
  return verbs[getRandomBetween(0, verbs.length)];
}

function httpGet(api) {
  console.log(`GET: ${api}`);
  return new Promise((resolve, reject) => {
    https.get(api, (resp) => {
      let data = '';
      resp.on('data', (chunk) => {
        data += chunk;
      });
      resp.on('end', () => {
        const result = JSON.parse(data);
        resolve(result);
      });
    }).on("error", (err) => {
      console.log("HTTP Error: " + err.message);
      reject(err);
    });
  });
}

function sendDatamuseRhymeRequest(word) {
  return httpGet(`https://api.datamuse.com/words?rel_rhy=${word}`);
}

function getRhymingWords(word) {
  return new Promise((resolve, reject) => {
    sendDatamuseRhymeRequest(word).then((words) => {
      console.log(`Found ${words.length} words that rhyme with ${word}.`);
      resolve(words);
    }).catch((err) => {
      console.log(`Failed to get rhymes for ${word}: ` + err.message);
      reject(err);
    });
  });
}

function sendDatamuseSynonymRequest(word) {
  return httpGet(`https://api.datamuse.com/words?rel_syn=${word}`);
}

function getSynonyms(word) {
  return new Promise((resolve, reject) => {
    sendDatamuseSynonymRequest(word).then((words) => {
      console.log(`Found ${words.length} synonyms of ${word}.`);
      resolve(words);
    }).catch((err) => {
      console.log(`Failed to get synonyms for ${word}: ` + err.message);
      reject(err);
    });
  });
}

function sendLinguatoolsSentenceRequest(options) {
  let url = `https://lt-nlgservice.herokuapp.com/rest/english/realise?subject=${options.subject}`;
  if (options.verb) {
    url += `&verb=${options.verb}`;
  }
  if (options.objects && Array.isArray(options.objects) && options.objects.length > 0) {
    options.objects.forEach((obj) => url += `&object=${obj}`);
  }
  return httpGet(url);
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

function generateAdjective() {
  return Sentencer.make("{{ adjective }}");
}

function clean(text) {
  return text.replace('\n', '').replace(/[^A-Za-z' ]/g, '');
}

function generateText(basis) {
  return new Promise((resolve, reject) => {
    console.log(`Calling DeepAI to generate text from: ${basis}`);
    deepai.callStandardApi('text-generator', {
      'text': basis,
    }).then((text) => {
      const cleanedText = clean(text.output);
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
  const startIdx = getRandomBetween(1, sentenceArray.length);
  for (let i = 0; i < numPhrases; i++) {
    const sentence = sentenceArray[startIdx + i];
    const words = sentence.trim().split(' ').map((w) => w.trim());
    phrases[i] = {'words': words.slice(0, Math.min(words.length, 8))};
  }
  return phrases;
}

const POEM_LINE_COUNT = 6;

async function writePoemAsync(person) {
  const subject = getRandomSubject();
  console.log(`Chosen subject: ${subject}`);
  const poemLines = [];
  const personSentence = await getSentence({'subject': person.name, 'verb': getRandomVerb(), 'objects': [subject]});
  poemLines.push(personSentence);
  const text = await generateText(personSentence);
  const phrases = extractPhrasesFrom(text, POEM_LINE_COUNT/2);
  poemLines.push(phrases[0].words.join(' '));
  for (let i = 1; i < phrases.length; i++) {
    poemLines.push(phrases[i].words.join(' '));
    const words = phrases[i].words;
    const rhymingWords = await getRhymingWords(words[words.length-1]);
    const rhyme = rhymingWords.map((w) => w.word)[getRandomBetween(0, rhymingWords.length)];
    const synonyms = await getSynonyms(words[words.length-1]);
    const synonym = synonyms.map((w) => w.word)[getRandomBetween(0, synonyms.length)];
    const rhymingSentence = await getSentence({'subject': synonym, 'verb': getRandomVerb(), 'objects': [rhyme]});
    poemLines.push(rhymingSentence);
  }
  return poemLines.join('\n');
}

/**
 * Responds to any HTTP request.
 *
 * @param {!express:Request} req HTTP request context.
 * @param {!express:Response} res HTTP response context.
 */
exports.writePoem = (req, res) => {
  const personName = req.query.name || req.body.name;
  const person = personName ? {name: personName} : getRandomPerson();
  writePoemAsync(person).then((poem) => {
    res.status(200).send(poem);
  }).catch((err) => {
    res.status(500).send(err);
  });
};

