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
      console.log(`Generated sentence from Linguatools: ${response.sentence}`);
      resolve(response.sentence);
    }).catch((err) => {
      console.log(`Error: Failed to get sentence for '${options}'. ${err}`);
      reject(err);
    });
  });
}

function generateAdjective() {
  return Sentencer.make("{{ adjective }}");
}

function generateText(basis) {
  return new Promise((resolve, reject) => {
    console.log(`Calling DeepAI to generate text from: ${basis}`);
    deepai.callStandardApi('text-generator', {
      'text': basis,
    }).then((text) => {
      console.log(`Generated text from DeepAI: ${JSON.stringify(text)}`);
      resolve(text.output);
    }).catch((err) => {
      console.log(`Error: Failed to generate text for '${basis}'. ${err}`);
      reject(err);
    });
  });
}

function extractPhrasesFrom(text, numPhrases = 3) {
  const sentenceArray = text.replace('\n', ' ').split('.');
  const phrases = new Array(numPhrases);
  for (let i = 0; i < numPhrases; i++) {
    const sentence = sentenceArray[getRandomBetween(0, sentenceArray.length)];
    const words = sentence.trim().split(' ');
    const startWordIdx = Math.max(0, getRandomBetween(0, words.length - 6));
    phrases[i] = {'words': words.slice(startWordIdx, Math.min(words.length, startWordIdx + 6))};
  }
  return phrases;
}

const POEM_LINE_COUNT = 4;

async function writePoemAsync(person) {
  const subject = getRandomSubject();
  console.log(`Chosen subject: ${subject}`);
  const poemLines = [];
  const personSentence = await getSentence({'subject': person.name, 'verb': getRandomVerb(), 'objects': [subject]});
  poemLines.push(personSentence);
  const text = await generateText(personSentence);
  const wordArray = text.split(' ');
  const phrases = extractPhrasesFrom(text, POEM_LINE_COUNT/2);
  poemLines.push(phrases[0].words.join(' '));
  for (let i = 1; i < phrases.length; i++) {
    poemLines.push(phrases[i].words.join(' '));
    const words = phrases[i].words;
    const rhymingWords = await getRhymingWords(words[words.length-1]);
    const rhyme = rhymingWords.map((w) => w.word)[getRandomBetween(0, rhymingWords.length)];
    const rhymingSentence = await getSentence({'subject': wordArray[getRandomBetween(0, wordArray.length)], 'verb': getRandomVerb(), 'objects': [rhyme]});
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

