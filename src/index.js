import 'bootstrap';
import 'bootstrap/dist/css/bootstrap.min.css';
import '../public/stylesheets/styles.css';

import appendPostBody from './ui';

const $ = require('jquery');

function displayPosts() {
  const element = $('.headlines--container');
  appendPostBody(element);
}

$(document).ready(() => {
  displayPosts();
});

