const https = require('https');

exports.httpGet = function(api) {
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