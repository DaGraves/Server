'use strict';

const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

mongoose.Promise = global.Promise;

const userSchema = mongoose.Schema({
  name: { type: String, required: true },
  username: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  questions: [{
    wordId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Word'
    },
    score: { type: Number, default: 0 },
    attempts: { type: Number, default: 0 },
    sessionScore: { type: Number, default: 0 },
    sessionAttempts: { type: Number, default: 0 },
    mValue: { type: Number, default: 1 },
    next: { type: Number }
  }],
  head: { type: Number, default: 0 }
});

userSchema.methods.validatePassword = function(password) {
  return bcrypt.compare(password, this.password);
};

userSchema.statics.hashPassword = function(password) {
  return bcrypt.hash(password, 10);
};

userSchema.set('toObject', {
  virtuals: true,
  versionKey: false,
  transform: (doc, ret) => {
    delete ret._id;
    delete ret.password;
  }
});

module.exports = mongoose.model('User', userSchema);
