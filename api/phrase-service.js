const Utils = require('../utils');
const deepai = require('deepai');
deepai.setApiKey(process.env.DEEP_AI_API_KEY);

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

function extractPhrasesFrom(text, numPhrases) {
  const sentenceArray = text.split(/[\.\!\?\,]/);
  const phrases = new Array(numPhrases);
  let phraseIdx = 0;
  for (let i = 1; i < sentenceArray.length && phraseIdx < numPhrases; i++) {
    const sentence = sentenceArray[i];
    const words = sentence.trim().split(' ');
    const countBigWords = Utils.removeSmallWords(sentence.trim(), 4).split(' ').length;
    if (i >= sentenceArray.length - numPhrases || (words.length >= 3 && words.length <= 7 && countBigWords <= 5)) {
      phrases[phraseIdx++] = {'words': words.slice(0, Math.min(words.length, 7)).map((w) => w.trim())};
    }
  }
  return phrases;
}

const generatePhrasesFrom = exports.generatePhrasesFrom = async function(seedText, numPhrases = 3) {
  return extractPhrasesFrom(await generateText(seedText), numPhrases);
}