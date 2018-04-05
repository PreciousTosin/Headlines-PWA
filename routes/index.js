/* eslint no-plusplus: ["error", { "allowForLoopAfterthoughts": true }] */
const express = require('express');
const requestPromise = require('request-promise');
// const path = require('path');

const router = express.Router();

// let newsArray = '';
const completeNews = [];

function retrieveNews(country = '', sources = '', page = 1) {
  const options = {
    uri: 'https://newsapi.org/v2/top-headlines',
    qs: {
      apiKey: process.env.NEWSAPI, // -> uri + '?access_token=xxxxx%20xxxxx'
      category: 'general',
      pageSize: 100,
      country,
      sources,
      page,
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

/* function populateNewsArray(country, sources, page = 1) {
  const completeNews = [];
  // const newsPage = page;
  retrieveNews(undefined, undefined, page)
    .then((response) => {
      if (response.status !== 'ok') return;
      const noPages = Math.floor((response.totalResults) / 100);
      response.articles.forEach(article => completeNews.push(article));
      // completeNews.push(response.articles);
      for (let i = 2; i <= noPages; i++) {
        retrieveNews(undefined, undefined, 1)
          .then((result) => {
            if (result.status !== 'ok') return;
            result.articles.forEach(article => completeNews.push(article));
            console.log(`NEWS PAGE: ${i} NUMBER OF NEWS ITEM: ${completeNews.length}`);
            // completeNews.push(result.articles);
          });
      }
      console.log('NUMBER OF NEWS ITEM: ', completeNews.length);
    })
    .catch(error => console.log(error));
} */

/* async function populateNewsArray(country, sources, page = 1) {
  const completeNews = [];
  // const newsPage = page;
  const response = await retrieveNews(undefined, undefined, page);
  if (response.status !== 'ok') return;
  const noPages = Math.floor((response.totalResults) / 100);
  response.articles.forEach(article => completeNews.push(article));
  for (let i = 2; i <= noPages; i++) {
    const result = await retrieveNews(undefined, undefined, 1);
    if (result.status !== 'ok') return;
    result.articles.forEach(article => completeNews.push(article));
    console.log(`NEWS PAGE: ${i} NUMBER OF NEWS ITEM: ${completeNews.length}`);
  }
  console.log('TOTAL NUMBER OF NEWS ITEM: ', completeNews.length);
} */

/* async function that makes request from the news api and add the results to an array
 * -- how it works -
  *-- make api request using the initial parameters
  *-- check if request is successful(if status === ok),
  *-- then calculate no of pages based on totalResults in response
  *-- check if array is empty, if it is, add the first page to array
  *   otherwise skip
  *-- then create a for loop that makes a no of requests based on total
  *   no of pages and then add the promise returned to 'newsPromise' array in the order
  *   that the request were made
  *-- Use Promise.all to retrieve the values of the fulfilled promises and add the values to
  *-- the 'completeNews' array in that order
  *-- return 'completeNews' array  */
async function populateNewsArray(country, sources, page = 1) {
  // const completeNews = [];
  const newsPromise = [];
  // const newsPage = page;
  const response = await retrieveNews(undefined, undefined, page);
  if (response.status !== 'ok') return completeNews;
  const noPages = Math.floor((response.totalResults) / 100);
  if (completeNews.length === 0) {
    response.articles.forEach(article => completeNews.push(article));
  }
  for (let i = 2; i <= noPages; i++) {
    newsPromise.push(Promise.resolve(retrieveNews(undefined, undefined, i)));
  }
  await Promise.all(newsPromise).then((values) => {
    values.forEach((value, index) => {
      if (value.status !== 'ok') return completeNews;
      value.articles.forEach(article => completeNews.push(article));
      console.log(`NEWS PAGE: ${index} NUMBER OF NEWS ITEM: ${completeNews.length}`);
      return completeNews;
    });
  });
  return completeNews;
  // console.log('TOTAL NUMBER OF NEWS ITEM: ', completeNews.length);
}

router.get('/', (req, res) => {
  // completeNews.splice(0, completeNews.length);
  if (process.env.ENV === 'production') {
    // res.sendFile(path.join(__dirname, '../public_build/index.html'));
  }

  if (completeNews.length === 0) {
    retrieveNews(undefined, undefined, 10)
      .then((response) => {
        // newsArray = response.articles.splice(0, 100);
        // completeNews.push(response.articles);
        response.articles.forEach(article => completeNews.push(article));
        console.log(completeNews.length);
        res.render('post', { completeNews });
        populateNewsArray()
          .then(results => console.log(results[1].author));
      })
      .catch(error => console.log(error));
  } else {
    res.render('post', { completeNews });
  }
});

module.exports = router;
