/* eslint-disable import/no-extraneous-dependencies */
import 'bootstrap';
import io from 'socket.io-client';
import idb from 'idb';
import 'bootstrap/dist/css/bootstrap.min.css';
import runtime from 'serviceworker-webpack-plugin/lib/runtime';
import '../public/stylesheets/styles.css';

import postTemplate from '../views/post.hbs';

// import appendPostBody from './ui';

const $ = require('jquery');

/* function displayPosts() {
  const element = $('.headlines--container');
  appendPostBody(element);
} */

function updateReady(worker) {
  // add code for dialog here if response is positive
  // run the subsequent code
  // worker.postMessage({ action: 'skipWaiting' });
  worker.addEventListener('statechange', () => {
    if (worker.state === 'activating') {
      console.log('WAITING SERVICE WORKER ACTIVATING');
    }
  });

  worker.addEventListener('statechange', () => {
    if (worker.state === 'activated') {
      console.log('WAITING SERVICE WORKER ACTIVATED');
    }
  });
  worker.postMessage({ action: 'skipWaiting' });
  // loose
}

function trackInstalling(worker) {
  worker.addEventListener('statechange', () => {
    if (worker.state === 'installed') {
      updateReady(worker);
      console.log('Worker Installed');
    }

    if (worker.state === 'activated') {
      updateReady(worker);
      console.log('Worker Activated');
    }
  });

  worker.addEventListener('onerror', () => {
    console.log('ERROR IN INSTALLATION');
  });
}

function registerServiceWorker() {
  if (!navigator.serviceWorker) return;
  const registration = runtime.register();
  console.log(registration);

  registration.then((reg) => {
    /* if (!navigator.serviceWorker.controller) {
      return;
    } */
    console.log(reg.installing);
    console.log(reg.waiting);

    if (reg.installing) {
      console.log('Worker Installing');
      trackInstalling(reg.installing);
    }

    if (reg.waiting) {
      console.log('Worker Waiting');
      updateReady(reg.waiting);
    }

    reg.addEventListener('updatefound', () => {
      console.log('FOUND WORKER UPDATE');
      trackInstalling(reg.installing);
    });
  });

  /* navigator.serviceWorker.register('sw/sw.js')
    .then((reg) => {
      if (!navigator.serviceWorker.controller) {
        return;
      }

      if (reg.installing) {
        trackInstalling(reg.installing);
      }

      if (reg.waiting) {
        updateReady(reg.waiting);
      }
    }); */
}

function createDatabase() {
  if (!navigator.serviceWorker) {
    return Promise.resolve();
  }
  return idb.open('newsapi', 1, (upgradeDb) => {
    const store = upgradeDb.createObjectStore('newsStore', {
      keyPath: 'publishedAt',
    });
  });
}

/* function storeNews(news) {
  // const parsedNews = JSON.parse(news);
  createDatabase().then((db) => {
    if (!db && news.length > 0) return;
    console.log('STORING NEWS!!!');
    const store = db.transaction('newsStore', 'readwrite')
      .objectStore('newsStore');
    news.forEach(newsItem => store.put(newsItem));
  });
} */

function idbMethods(dbPromise) {
  return {
    get(key) {
      return dbPromise().then(db =>
        db.transaction('newsStore')
          .objectStore('newsStore').get(key));
    },
    set(news) {
      console.log('STORING DATA IN DATABASE!!!!');
      return dbPromise().then((db) => {
        const tx = db.transaction('newsStore', 'readwrite');
        news.forEach(newsItem => tx.objectStore('newsStore').put(newsItem));
        return tx.complete;
      });
    },
    delete(key) {
      return dbPromise().then((db) => {
        const tx = db.transaction('newsStore', 'readwrite');
        tx.objectStore('newsStore').delete(key);
        return tx.complete;
      });
    },
    clear() {
      console.log('CLEARING DATABASE!!!!');
      return dbPromise().then((db) => {
        const tx = db.transaction('newsStore', 'readwrite');
        tx.objectStore('newsStore').clear();
        return tx.complete;
      });
    },
    keys() {
      return dbPromise().then((db) => {
        const tx = db.transaction('newsStore');
        const keys = [];
        const store = tx.objectStore('newsStore');

        // This would be store.getAllKeys(), but it isn't supported by Edge or Safari.
        // openKeyCursor isn't supported by Safari, so we fall back
        (store.iterateKeyCursor || store.iterateCursor).call(store, (cursor) => {
          if (!cursor) return;
          keys.push(cursor.key);
          cursor.continue();
        });

        return tx.complete.then(() => keys);
      });
    },
  };
}

function addNews(data) {
  console.log('ADDING NEWS!!!');
  document.querySelector('.container').innerHTML = postTemplate({ completeNews: data });
}

$(document).ready(() => {
  idbMethods(createDatabase).clear();
  registerServiceWorker();
  // createDatabase();
  // eslint-disable-next-line no-unused-vars
  const socket = io(); // connect to server
  socket.on('message', (data) => {
    console.log(data);
    // storeNews(data);
    if (data.length !== 0) idbMethods(createDatabase).set(data);
    addNews(data);
  });
  // displayPosts();
});

