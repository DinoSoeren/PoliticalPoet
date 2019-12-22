const https = require('https');
const deepai = require('deepai');
deepai.setApiKey('quickstart-QUdJIGlzIGNvbWluZy4uLi4K');
var Sentencer = require('sentencer');

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

const SUBJECTS = [
  'earth','climate','gender',
  'jealousy','health','mindfulness',
  'treason','democracy','serenity',
  'love','hate','sex','crime',
  'death',
  'banana'
];

const VERBS = [
  'is', 'goes', 'takes', 'looks', 'gets', 'talks',
  'thinks', 'hopes', 'dreams', 'fakes', 'likes', 'hates',
  'argues', 'waves', 'blesses', 'prays', 'yells', 'tweets',
  'debates', 'runs', 'focuses', 'forgets', 'remembers'
];

function getRandomBetween(i, j) {
  return Math.floor(Math.random() * j) + i;
}

function getRandomItem(arr) {
  return arr[getRandomBetween(0, arr.length)];
}

function getRandomTopic() {
  return getRandomItem(SUBJECTS);
}

function getRandomPerson() {
  return getRandomItem(PEOPLE);
}

function getRandomVerb() {
  return getRandomItem(VERBS);
}

function getLongestWord(words) {
  let longest = words[0];
  words.forEach((word) => word.length > longest.length ? longest = word : word = word);
  return longest;
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
      console.log(`HTTP Error: ${err.message}`);
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
      console.log(`Failed to get rhymes for ${word}: ${err.message}`);
      reject(err);
    });
  });
}

function getRandomRhymingWord(word) {
  return new Promise((resolve, reject) => {
    getRhymingWords(word).then((rhymingWords) => {
      const rhyme = getRandomItem(rhymingWords).word;
      console.log(`Using ${rhyme} to rhyme with ${word}`);
      resolve(rhyme);
    }).catch((err) => {
      console.log(`Failed to get rhyme for ${word}: ${err.message}`);
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
      console.log(`Failed to get synonyms for ${word}: ${err.message}`);
      reject(err);
    });
  });
}

function getRandomSynonym(word) {
  return new Promise((resolve, reject) => {
    getSynonyms(word).then((words) => {
      const synonym = getRandomItem(words).word;
      console.log(`Using ${synonym} as a synonym for ${word}`);
      resolve(synonym);
    }).catch((err) => {
      console.log(`Failed to get synonym for ${word}: ${err.message}`);
      reject(err);
    });
  });
}

function sendLinguatoolsSentenceRequest(options) {
  let url = `https://lt-nlgservice.herokuapp.com/rest/english/realise?subject=${options.subject}`;
  if (options.verb) {
    url += `&verb=${options.verb}`;
  }
  if (options.object) {
    url += `&object=${options.object}`;
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

function generateNoun() {
  return Sentencer.make("{{ noun }}");
}

function clean(text) {
  return text.replace('\n', '').replace(/[^A-Za-z'\.\!\,\? ]/g, '');
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
    phrases[i] = {'words': words.slice(0, Math.min(words.length, 5))};
  }
  return phrases;
}

const POEM_LINE_COUNT = 4;

async function writePoemAsync(person) {
  const topic = getRandomTopic();
  const isTopicFirst = getRandomBetween(0, 2) === 0;
  const subject = isTopicFirst ? person.name : topic;
  const object = isTopicFirst ? topic : person.name;
  console.log(`Chosen subject: ${subject}`);
  const poemLines = [];
  const personSentence = await getSentence({'subject': subject, 'verb': getRandomVerb(), 'object': object});
  poemLines.push(personSentence);
  const personRhymeSentence = await getSentence({'subject': generateNoun(), 'verb': getRandomVerb(), 'object': await getRandomRhymingWord(object)});
  poemLines.push(personRhymeSentence);
  console.log(`Poem so far:\n ${poemLines.join('\n')}`);
  const text = await generateText(personSentence);
  const phrases = extractPhrasesFrom(text, (POEM_LINE_COUNT-2)/2);
  for (let i = 0; i < phrases.length; i++) {
    poemLines.push(phrases[i].words.join(' '));
    const words = phrases[i].words;
    const rhyme = await getRandomRhymingWord(words[words.length-1]);
    const synonym = await getRandomSynonym(getLongestWord(words));
    const rhymingSentence = await getSentence({'subject': synonym, 'verb': getRandomVerb(), 'object': rhyme});
    poemLines.push(rhymingSentence);
  }
  // Swap consecutive lines
  for (let i = 0; i < POEM_LINE_COUNT; i+=4) {
    const temp = poemLines[i+1];
    poemLines[i+1] = poemLines[i+3];
    poemLines[i+3] = temp;
  }
  const shiftAmount = getRandomBetween(1, 3) * 2;
  console.log(`Shifting lines by ${shiftAmount}`);
  for (let i = 0; i < shiftAmount; i++) {
    poemLines.push(poemLines.shift());
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

