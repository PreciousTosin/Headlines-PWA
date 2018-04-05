/* eslint-disable import/no-extraneous-dependencies */
import 'bootstrap';
import 'bootstrap/dist/css/bootstrap.min.css';
import runtime from 'serviceworker-webpack-plugin/lib/runtime';
import '../public/stylesheets/styles.css';

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

$(document).ready(() => {
  // displayPosts();
  registerServiceWorker();
});

