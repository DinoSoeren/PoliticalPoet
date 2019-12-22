const https = require('https');
const deepai = require('deepai');
deepai.setApiKey('quickstart-QUdJIGlzIGNvbWluZy4uLi4K');
const Sentencer = require('sentencer');
const Twitter = require('twitter');

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

const twitterClient = new Twitter({
  consumer_key: process.env.TWITTER_CONSUMER_KEY,
  consumer_secret: process.env.TWITTER_CONSUMER_SECRET,
  access_token_key: process.env.TWITTER_ACCESS_TOKEN_KEY,
  access_token_secret: process.env.TWITTER_ACCESS_TOKEN_SECRET
});

function sendTweet(tweetText) {
  console.log(`Sending tweet: ${tweetText}`);
  return new Promise((resolve, reject) => {
    twitterClient.post('statuses/update', {'status': tweetText}, (error, tweet, response) => {
      if (error) {
        console.log(`Error: Failed to send tweet. ${JSON.stringify(error)}`);
        reject(error);
      } else {
        console.log(`Successfully posted tweet: ${tweet}`);
        console.log(`Response: ${JSON.stringify(response)}`);
        resolve(response);
      }
    });
  });
}

function getRandomBetween(i, j) {
  return Math.floor(Math.random() * j) + i;
}

function getRandomItem(arr) {
  return arr[getRandomBetween(0, arr.length)];
}

function getLastItem(arr) {
  return arr[arr.length-1];
}

function getRandomTopic() {
  return getRandomItem(TOPICS);
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

function generateAdjective() {
  return Sentencer.make("{{ adjective }}");
}

function generateNoun() {
  return Sentencer.make("{{ noun }}");
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
  return httpGet(`https://api.datamuse.com/words?rel_rhy=${word.replace(/[^A-Za-z]/g, '')}`);
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
  return new Promise((resolve) => {
    getRhymingWords(word).then((rhymingWords) => {
      const rhyme = rhymingWords.length > 0 ? getRandomItem(rhymingWords).word : word;
      console.log(`Using ${rhyme} to rhyme with ${word}`);
      resolve(rhyme);
    }).catch((err) => {
      console.log(`Failed to get rhyme for ${word}: ${err.message}`);
      resolve(word);
    });
  });
}

function sendDatamuseSynonymRequest(word) {
  return httpGet(`https://api.datamuse.com/words?sl=${word.replace(/[^A-Za-z]/g, '')}`);
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
  return new Promise((resolve) => {
    getSynonyms(word).then((words) => {
      const synonym = words.length > 0 ? getRandomItem(words).word : word;
      console.log(`Using ${synonym} as a synonym for ${word}`);
      resolve(synonym);
    }).catch((err) => {
      console.log(`Failed to get synonym for ${word}: ${err.message}`);
      resolve(word);
    });
  });
}

function sendLinguatoolsSentenceRequest(options) {
  const host = 'https://lt-nlgservice.herokuapp.com/rest/english/realise';
  let url = `${host}?subject=${options.subject}&verb=${options.verb}&object=${options.object}`;
  if (options.useObjDet) url += `&objdet=the`;
  const isPerfect = typeof options.isPerfect !== 'undefined' ? options.isPerfect : getRandomBetween(0, 2) === 0;
  if (isPerfect) url += '&perfect=perfect';
  const isPassive = typeof options.isPassive !== 'undefined' ? options.isPassive : getRandomBetween(0, 2) === 0;
  if (!isPerfect && isPassive) url += '&passive=passive';
  const isQuestion = typeof options.isQuestion !== 'undefined' ? options.isQuestion : getRandomBetween(0, 2) === 0;
  if (isQuestion) url += '&sentencetype=yesno';
  const hasModifier = typeof options.hasModifier !== 'undefined' ? options.hasModifier : getRandomBetween(0, 4) !== 0;
  if (hasModifier) url += `&objmod=${generateAdjective()}`;
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

function clean(text) {
  return text.replace('\n', '').replace(/[^A-Za-z'\.\!\,\? ]/g, '');
}

function removeSmallWords(text) {
  return text.split(' ').filter((w) => w.trim().replace(/[^A-Za-z']/g, '').length > 3).join(' ');
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
  const startIdx = 1; // getRandomBetween(1, sentenceArray.length);
  for (let i = 0; i < numPhrases; i++) {
    const sentence = sentenceArray[startIdx + i];
    const words = sentence.trim().split(' ').map((w) => w.trim());
    phrases[i] = {'words': words.slice(0, Math.min(words.length, 5))};
  }
  return phrases;
}

const POEM_LINE_COUNT = 4;

async function writePoemAsync(person) {
  const topic = await getRandomSynonym(getRandomTopic());
  const isPersonFirst = getRandomBetween(0, 2) === 0;
  const subject = isPersonFirst ? person.name : topic;
  const object = isPersonFirst ? topic : person.name;
  console.log(`Chosen subject: ${subject}`);
  const poemLines = [];
  const personSentence = removeSmallWords(await getSentence({'subject': subject, 'verb': getRandomVerb(), 'object': object, 'useObjDet': isPersonFirst}));
  poemLines.push(personSentence);
  const personRhymeSentence = removeSmallWords(await getSentence({'subject': generateNoun(), 'verb': getRandomVerb(), 'object': await getRandomRhymingWord(getLastItem(personSentence.split(' ')))}));
  poemLines.push(personRhymeSentence);
  console.log(`Poem so far:\n ${poemLines.join('\n')}`);
  const text = await generateText(personSentence);
  const phrases = extractPhrasesFrom(text, (POEM_LINE_COUNT-2)/2);
  for (let i = 0; i < phrases.length; i++) {
    const phrase = removeSmallWords(phrases[i].words.join(' '));
    poemLines.push(phrase);
    const words = phrase.split(' ');
    const rhyme = await getRandomRhymingWord(getLastItem(words));
    const synonym = await getRandomSynonym(getLongestWord(words));
    const rhymingSentence = removeSmallWords(await getSentence({'subject': synonym, 'verb': getRandomVerb(), 'object': rhyme, 'isPassive': false}));
    poemLines.push(rhymingSentence);
  }
  // Swap consecutive lines
  for (let i = 0; i < POEM_LINE_COUNT; i+=4) {
    const temp = poemLines[i+1];
    poemLines[i+1] = poemLines[i+2];
    poemLines[i+2] = temp;
  }
  const shiftAmount = getRandomBetween(0, (POEM_LINE_COUNT/2)) * 2;
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
  const person = personName ? {name: personName} : getRandomPerson();
  writePoemAsync(person).then((poem) => {
    const tweet = `${poem}\n~~a shitty poem about ${person.twitter}~~`;
    res.status(200).send(tweet);
    if (process.env.SEND_TWEET) {
      sendTweet(tweet);
    }
  }).catch((err) => {
    res.status(500).send(err);
  });
};
