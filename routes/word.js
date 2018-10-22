'use strict';

const express = require('express');
const mongoose = require('mongoose');
const passport = require('passport');
const User = require('../models/User');
const router = express.Router();

const options = { session: false, failWithError: true };
const jwtAuth = passport.authenticate('jwt', options);
router.use('/', jwtAuth);

router.get('/', (req, res, next) => {
  const userId = req.user.id;

  if (!mongoose.Types.ObjectId.isValid(userId)) {
    const err = new Error('The `userId` is not valid');
    err.status = 400;
    return next(err);
  }

  User
    .findById(userId, 'questions head')
    .populate('questions.wordId')
    .then(results => {
      if (results) {
        let head = results.head;
        let nextWord = {
          word: results.questions[head].wordId.portuguese
        };
        res.json(nextWord);
      } else {
        next();
      }
    })
    .catch(err => {
      next(err);
    });
});

router.post('/', (req, res, next) => {
  const userId = req.user.id;
  req.body.userId = userId;
  
  const requiredFields = ['answer'];
  const missingField = requiredFields.find(field => !(field in req.body));
  if (missingField) {
    const err = new Error(`Missing \`${missingField}\` in request body`);
    err.status = 422;
    err.reason = 'ValidationError';
    err.location = `${missingField}`;
    return next(err);
  }
  
  const stringFields = ['answer'];
  const nonStringField = stringFields.find(field => {
    return ((req.body[field]) && (typeof req.body[field] !== 'string'));
  });
  if (nonStringField) {
    const err = new Error(`The \`${nonStringField}\` must be of type \`string\``);
    err.status = 422;
    err.reason = 'ValidationError';
    err.location = `${nonStringField}`;
    return next(err);
  }
  
  const objectIdFields = ['userId'];
  const nonObjectIdField = objectIdFields.find(field => {
    return ((req.body[field]) && !mongoose.Types.ObjectId.isValid(req.body[field]));
  });
  if (nonObjectIdField) {
    const err = new Error(`The \`${nonObjectIdField}\` must be a valid ObjectId`);
    err.status = 422;
    err.reason = 'ValidationError';
    err.location = `${nonObjectIdField}`;
    return next(err);
  }

  let { answer } = req.body;
  answer = answer.trim().toLowerCase();
  const response = {};
  User
    .findById(userId, 'questions head')
    .populate('questions.wordId')
    .then(user => {
      if (!user) {
        const err = new Error('User not found');
        err.status = 404;
        err.location = 'userId';
        return next(err);
      }
    
      const currQuestion = user.questions[user.head];
      const currHead = user.head;
      user.head = currQuestion.next;

      response.answer = currQuestion.wordId.english;
      response.correct = (answer === response.answer);

      currQuestion.attempts += 1;
      currQuestion.sessionAttempts += 1;
      const wordScore = response.correct ? 1 : 0;
      currQuestion.score += wordScore;
      currQuestion.sessionScore += wordScore;
      currQuestion.mValue = response.correct ? currQuestion.mValue * 2 : 1;
      
      let nextNode = currQuestion;
      for (let i=0; i < currQuestion.mValue; i++) {
        nextNode = user.questions[nextNode.next];
      }
      
      currQuestion.next = nextNode.next;
      nextNode.next = currHead;
      
      return user.save();
    })
    .then(() => {
      return res.json(response);
    })
    .catch(err => {
      next(err);
    });
});

module.exports = router;
