'use strict';

const mongoose = require('mongoose');

mongoose.Promise = global.Promise;

const wordSchema = mongoose.Schema({
  portuguese: { type: String, required: true },
  english: { type: String, required: true }
});

wordSchema.set('toObject', {
  virtuals: true,
  versionKey: false,
  transform: (doc, ret) => {
    delete ret._id;
  }
});

module.exports = mongoose.model('Word', wordSchema);
