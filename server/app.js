/* eslint import/no-extraneous-dependencies: 'off' */
import express from 'express';
import path from 'path';
import favicon from 'serve-favicon';
import logger from 'morgan';
import cookieParser from 'cookie-parser';
import bodyParser from 'body-parser';
import webpack from 'webpack';
import config from './webpack.config';

import index from './routes/index';
import users from './routes/users';

require('dotenv').config();

const app = express();

let compiler = '';
let webpackDevMiddleware = '';
let webpackHotMiddleware = '';

if (process.env.ENV !== 'production') {
  compiler = webpack(config);

  // eslint-disable-next-line global-require
  webpackDevMiddleware = require('webpack-dev-middleware')(compiler, {
    quiet: false,
    noInfo: false,
    publicPath: config.output.publicPath,
  });

  // eslint-disable-next-line global-require
  webpackHotMiddleware = require('webpack-hot-middleware')(compiler, {
    log: console.log,
    path: '/__webpack_hmr',
    heartbeat: 10 * 1000,
  });
}

// view engine setup
app.set('views', path.join(__dirname, '../views'));
// app.set('view engine', 'hbs');

// uncomment after placing your favicon in /public
app.use(favicon(path.join(__dirname, '../public', 'favicon.ico')));
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());
if (process.env.ENV === 'production') {
  app.use(express.static(path.join(__dirname, './public_build')));
}
app.use(express.static(path.join(__dirname, '../public')));

if (process.env.ENV !== 'production') {
  app.use(webpackDevMiddleware);
  app.use(webpackHotMiddleware);
}

app.use('/', index);
app.use('/users', users);

// catch 404 and forward to error handler
app.use((req, res, next) => {
  const err = new Error('Not Found');
  err.status = 404;
  next(err);
});

// error handler
app.use((err, req, res) => {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

export default app;

