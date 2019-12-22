const Twitter = require('twitter');

const twitterClient = new Twitter({
  consumer_key: process.env.TWITTER_CONSUMER_KEY,
  consumer_secret: process.env.TWITTER_CONSUMER_SECRET,
  access_token_key: process.env.TWITTER_ACCESS_TOKEN_KEY,
  access_token_secret: process.env.TWITTER_ACCESS_TOKEN_SECRET
});

const sendTweet = exports.sendTweet = function(tweetText) {
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