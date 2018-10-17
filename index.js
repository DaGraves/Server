'use strict';

const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const { catQ, dogQ } = require('./queue-class');
const { PORT, CLIENT_ORIGIN } = require('./config');
const { dbConnect } = require('./db-mongoose');
// const {dbConnect} = require('./db-knex');

const app = express();

app.use(
  morgan(process.env.NODE_ENV === 'production' ? 'common' : 'dev', {
    skip: (req, res) => process.env.NODE_ENV === 'test'
  })
);

app.use(
  cors({
    origin: CLIENT_ORIGIN
  })
);

app.get('/api/cat', (req, res, next) => {
  res.json(catQ.peek());
});

app.get('/api/dog', (req, res, next) => {
  res.json(dogQ.peek());
});

app.delete('/api/cat', (req, res, next) => {
  catQ.dequeue();
  res.sendStatus(204);
});

app.delete('/api/dog', (req, res, next) => {
  dogQ.dequeue();
  res.sendStatus(204);
});

function runServer(port = PORT) {
  const server = app
    .listen(port, () => {
      console.info(`App listening on port ${server.address().port}`);
    })
    .on('error', err => {
      console.error('Express failed to start');
      console.error(err);
    });
}

if (require.main === module) {
  dbConnect();
  runServer();
}

module.exports = { app };
