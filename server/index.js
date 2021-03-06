// @flow

import express from 'express';
import morgan from 'morgan';
import mincer from 'mincer';
import path from 'path';
import Router from 'named-routes';
import debug from 'debug';

import sequelize from './db';

const debugServer = debug('interview:server');
const app = express();
app.set('view engine', 'jade');
app.use(morgan('dev'));

mincer.logger.use(console);

let environment = new mincer.Environment();
environment.enable('source_maps');
environment.enable('autoprefixer');
environment.appendPath('public/css');
environment.appendPath('public/js');
environment.appendPath('node_modules');

app.use('/assets', mincer.createServer(environment));

if (process.env.NODE_ENV === 'production') {
  environment.cache = new mincer.FileStore(path.join(__dirname, 'cache'));
  environment.jsCompressor = 'uglify';
  environment.cssCompressor = 'csswring';
  environment = environment.index;
}

const router = new Router();
router.extendExpress(app);
router.registerAppHelpers(app);

app.get('/', 'home', (req, res) => {
  res.render('index');
});

sequelize.sync({ force: true }).then(() => {
  debugServer('connected to database');
});

const port = process.env.PORT || 3000;
const server = app.listen(port, err => {
  if (err) {
    debugServer(err);
  }
  debugServer(`Started on http://localhost:${port}`);
});

export default server;
