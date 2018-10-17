'use strict';

require('dotenv').config();
const mongoose = require('mongoose');

const { DATABASE_URL } = require('../config');

const Word = require('../models/Word');
const seedWords = require('../db/seed/words');

console.log(`Connecting to mongodb at ${DATABASE_URL}`);
mongoose.connect(DATABASE_URL, { useNewUrlParser: true })
  .then(() => {
    console.info('Dropping Database');
    return mongoose.connection.db.dropDatabase();
  })
  .then(() => {
    console.info('Seeding Database');
    return Word.insertMany(seedWords);
  })
  .then(() => {
    console.info('Disconnecting');
    return mongoose.disconnect();
  })
  .catch(err => {
    console.error(err);
    return mongoose.disconnect();
  });
