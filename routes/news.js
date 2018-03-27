const express = require('express');
const requestPromise = require('request-promise');

const router = express.Router();

function retrieveNews() {
  const options = {
    uri: 'https://newsapi.org/v2/top-headlines',
    qs: {
      apiKey: process.env.NEWSAPI, // -> uri + '?access_token=xxxxx%20xxxxx'
      country: 'ng',
    },
    headers: {
      'User-Agent': 'Request-Promise',
    },
    json: true, // Automatically parses the JSON string in the response
  };
  return new Promise((resolve, reject) => {
    requestPromise(options)
      .then(data => resolve(data))
      .catch(error => reject(error));
  });
}

router.get('/', (req, res) => {
  retrieveNews()
    .then(response => res.json(response));
});

module.exports = router;
