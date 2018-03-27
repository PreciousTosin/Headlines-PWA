const express = require('express');
const requestPromise = require('request-promise');

const router = express.Router();

function retrieveNews() {
  const options = {
    uri: 'https://newsapi.org/v2/top-headlines',
    qs: {
      apiKey: '73c7461f52904c29887e309a2075087d', // -> uri + '?access_token=xxxxx%20xxxxx'
      country: 'ng',
    },
    headers: {
      'User-Agent': 'Request-Promise',
    },
    json: true, // Automatically parses the JSON string in the response
  };
  return new Promise((resolve) => {
    requestPromise(options).then(data => resolve(data));
  });
}

router.get('/', (req, res) => {
  retrieveNews()
    .then(response => res.json(response));
});

module.exports = router;
