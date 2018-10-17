'use strict';

// npm packages
const express = require('express');
const mongoose = require('mongoose');
const passport = require('passport');

// models
const User = require('../models/User');

// initialization
const router = express.Router();

// middlewares
const options = { session: false, failWithError: true };
const jwtAuth = passport.authenticate('jwt', options);
router.use('/', jwtAuth);

/* ========== GET THE USERS NEXT WORD ========== */
router.get('/', (req, res, next) => {
  const userId = req.user.id;

  if (!mongoose.Types.ObjectId.isValid(userId)) {
    const err = new Error('The `userId` is not valid');
    err.status = 400;
    return next(err);
  }

  // send the next question for that User
  User
    .findById(userId, 'questions head')
    .populate('questions.wordId')
    .then(results => {
      // console.log(results);
      if (results) {
        let head = results.head;
        let nextWord = {
          word: results.questions[head].wordId.russian,
          translit: results.questions[head].wordId.translit
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

/* ========== POST THE USERS GUESS FOR CURRENT WORD ========== */
router.post('/', (req, res, next) => {
  const userId = req.user.id;
  req.body.userId = userId;
  
  // validate all required field were submitted
  const requiredFields = ['answer'];
  const missingField = requiredFields.find(field => !(field in req.body));
  if (missingField) {
    const err = new Error(`Missing \`${missingField}\` in request body`);
    err.status = 422;
    err.reason = 'ValidationError';
    err.location = `${missingField}`;
    return next(err);
  }
  
  // validate fields that should be strings are actually of type 'string'
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
  
  // validate fields that should be mongoose ObjectIds are valid ObjectIds
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
  
  // checked for existence and 'stringness' above,
  // otherwise would have thrown an error already
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
    
      // save current question & head for use later
      const currQuestion = user.questions[user.head];
      const currHead = user.head;
      // update the head to point at next question
      user.head = currQuestion.next;

      // build response
      response.answer = currQuestion.wordId.english;
      response.correct = (answer === response.answer);

      // mutate current question node based on answer
      currQuestion.attempts += 1;
      currQuestion.sessionAttempts += 1;
      const wordScore = response.correct ? 1 : 0;
      currQuestion.score += wordScore;
      currQuestion.sessionScore += wordScore;
      currQuestion.mValue = response.correct ? currQuestion.mValue * 2 : 1;
      
      // cycle through questions to find currQuestion's
      // new location based on new mValue
      let nextNode = currQuestion;
      for (let i=0; i < currQuestion.mValue; i++) {
        nextNode = user.questions[nextNode.next];
      }
      
      // swap next pointers to insert currQuestion after nextNode
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
