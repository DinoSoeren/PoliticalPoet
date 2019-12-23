const HttpService = require('./http-service');
const WordService = require('./word-service');
const Utils = require('../utils');

const Sentencer = require('sentencer');

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
    sentence = response.sentence;
    if (Utils.getRandomBool()) {
      sentence = sentence.replace(/the /ig, '');
    }
    console.log(`Generated sentence from Linguatools: ${sentence}`);
  } catch(err) {
    console.log(`Error: Failed to get sentence for '${JSON.stringify(options)}'. ${err}`);
  }

  return sentence;
}

function generateThing(canUseModifier = true, canUsePlural = true) {
  const useAn = canUseModifier ? Utils.getRandomBool() : false;
  const useThe = canUseModifier ? (useAn ? false : Utils.getRandomBool()) : false;
  const useAdjective = Utils.getRandomBool();
  const isPlural = (!canUsePlural || useAn) ? false : Utils.getRandomBool();
  const adjective = useAdjective ? (useAn ? '{{ an_adjective }} ' : '{{ adjective }} ') : '';
  const noun = isPlural ? '{{ nouns }}' : (!useAdjective && useAn ? '{{ a_noun }}' : '{{ noun }}');
  return Sentencer.make(`${useThe ? 'the ' : ''}${adjective}${noun}`);
}

async function sentencify(basicSentence, mustEndWithIt = false) {
  const verb1 = WordService.getRandomVerb();
  const verb2 = WordService.getRandomVerb();
  const word = await WordService.getSynonymAsync(WordService.generateNoun());
  const adjective = WordService.generateAdjective();
  const templates = [
    `unlike ${basicSentence}`,
    `who made ${basicSentence}?`,
    `have you seen ${basicSentence}?`,
    `it's ${adjective} to ${verb1} ${basicSentence}`,
    `i have ${basicSentence}`,
    `you have ${basicSentence}`,
    `they have ${basicSentence}`,
    `i said ${basicSentence}`,
    `you said ${basicSentence}`,
    `they said ${basicSentence}`,
    `i am ${basicSentence}`,
    `you are ${basicSentence}`,
    `they are ${basicSentence}`,
    `i ${verb1} ${basicSentence}`,
    `you ${verb1} ${basicSentence}`,
    `they ${verb1} ${basicSentence}`,
    `i want to ${verb1} ${basicSentence}`,
    `you want to ${verb1} ${basicSentence}`,
    `they want to ${verb1} ${basicSentence}`,
    `i have to ${verb1} ${basicSentence}`,
    `you have to ${verb1} ${basicSentence}`,
    `they have to ${verb1} ${basicSentence}`,
  ];
  const templatesBeforeEnd = [
    `${basicSentence} won't ${verb1} it`,
    `${basicSentence} to ${verb2} something`,
    `${basicSentence} is ${word}`,
    `${basicSentence} can't be ${word}`,
    `${basicSentence} can't be ${adjective}`,
    `${basicSentence} is ${adjective}`,
  ];
  return Utils.getRandomItem(templates.concat(mustEndWithIt ? [] : templatesBeforeEnd));
}

const generateSentence = exports.generateSentence = async function(topic = '', rhymesWith = '') {
  const usesVerb = Utils.getRandomBool();
  const rhymeWord = !!rhymesWith ? await WordService.getRhymeAsync(rhymesWith) : '';
  if (usesVerb) {
    const topicIsSubject = !!rhymesWith ? true : Utils.getRandomBool();
    return await buildSentence({
      subject: (topicIsSubject ? topic : '') || generateThing(false, false),
      verb: WordService.getRandomVerb(),
      object: rhymeWord || (topicIsSubject ? '' : topic) || generateThing(false, false),
      hasModifier: false,
      isPassive: !!rhymesWith ? false : Utils.getRandomBool(),
    });
  } else {
    return sentencify(generateThing());
  }
}