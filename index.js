const https = require('https');
const deepai = require('deepai');
deepai.setApiKey('quickstart-QUdJIGlzIGNvbWluZy4uLi4K');

const subjects = [
  'earth','climate','gender',
  'jealousy','health','mindfulness',
  'treason','democracy','serenity',
  'love','hate','sex','crime',
  'death',
  'banana'
];

function getRandomBetween(i, j) {
  return Math.floor(Math.random() * j) + i;
}

function getRandomSubject() {
  return subjects[getRandomBetween(0, subjects.length)];
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
  return new Promise((resolve) => {
    sendDatamuseRhymeRequest(word).then((words) => {
      resolve(words);
    }).catch(() => {
      resolve([]);
    });
  });
}

function sendLinguatoolsSentenceRequest(options) {
  let url = `https://lt-nlgservice.herokuapp.com/rest/english/realise?subject=${options.subject}`;
  if (options.objects && Array.isArray(options.objects) && options.objects.length > 0) {
    options.objects.forEach((obj) => url += `&object=${obj}`);
  }
  return httpGet(url);
}

function getSentence(options) {
  return new Promise((resolve) => {
    sendLinguatoolsSentenceRequest(options).then((sentence) => {
      resolve(sentence);
    }).catch(() => {
      resolve('No sentence for: ' + options);
    });
  });
}

function generateText(basis) {
  return new Promise((resolve) => {
    deepai.callStandardApi('text-generator', {
      'text': basis,
    }).then((text) => {
      resolve(text);
    }).catch(() => {
      resolve('No text for: ' + basis);
    });
  });
}

/**
 * Responds to any HTTP request.
 *
 * @param {!express:Request} req HTTP request context.
 * @param {!express:Response} res HTTP response context.
 */
exports.writePoem = (req, res) => {
  const word = req.query.word || req.body.word || 'Yang';
  const subject = getRandomSubject();
  console.log(`Chosen subject: ${subject}`);
  getRhymingWords(word).then((rhymingWords) => {
  	console.log(`Found ${rhymingWords.length} words that rhyme with ${word}.`);
    const objects = rhymingWords.map((w) => w.word).slice(0,3);
    // getSentence({'subject': subject, 'objects': objects})
    generateText(objects.join(' ')).then((text) => {
      res.status(200).send(text);
    });
  });
};

