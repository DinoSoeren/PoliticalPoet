const HttpService = require('./http-service');
const WordService = require('./word-service');
const Utils = require('../utils');

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
  if (hasModifier) url += `&objmod=${await WordService.getPredecessorAsync(options.object)}`;
  return await HttpService.httpGet(url);
}

const buildSentence = exports.buildSentence = async function(options) {
  let sentence;
  
  try {
    const response = await sendLinguatoolsSentenceRequest(options);
    sentence = response.sentence; //.replace('The ', '');
    console.log(`Generated sentence from Linguatools: ${sentence}`);
  } catch(err) {
    console.log(`Error: Failed to get sentence for '${JSON.stringify(options)}'. ${err}`);
  }

  return sentence;
}