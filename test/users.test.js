'use strict';

const { app } = require('../index');
const chai = require('chai');
const chaiHttp = require('chai-http');
const mongoose = require('mongoose');

const { TEST_DATABASE_URL } = require('../config');
const { createAuthToken } = require('../utils/auth');

const User = require('../models/User');
const Word = require('../models/Word');
const seedWords = require('../db/seed/words');

const expect = chai.expect;

process.env.JWT_SECRET = 'TESTING_SECRET';
chai.use(chaiHttp);

describe('Privet API - Users', function () {

  before(function () {
    return mongoose
      .connect(TEST_DATABASE_URL, { useNewUrlParser: true })
      .then(() => mongoose.connection.db.dropDatabase());
  });

  beforeEach(function () {
    return Promise.all([
      User.createIndexes(),

      Word.insertMany(seedWords),
      Word.createIndexes()
    ]);
  });

  afterEach(function () {
    return mongoose.connection.db.dropDatabase();
  });

  after(function () {
    return mongoose.disconnect();
  });

  describe('/api/users', function () {

    describe('POST', function () {
      it('should create a new user', function () {
        const testUser = {
          name: 'testUser',
          username: 'testUser',
          password: 'testPassword'
        };
        let res;

        return chai
          .request(app)
          .post('/api/users')
          .send(testUser)
          .then(_res => {
            res = _res;
            expect(res).to.have.status(201);

            expect(res.body).to.be.an('object');

            return User.findOne({ username: testUser.username });
          })
          .then(user => {
            expect(user).to.exist;

            expect(user.id).to.equal(res.body.id);
            expect(user.name).to.equal(testUser.name);

            return user.validatePassword(testUser.password);
          })
          .then(isValid => {
            expect(isValid).to.be.true;
          });
      });

      it('should create a new user with correct fields', function () {
        const testUser = {
          name: 'testUser',
          username: 'testUser',
          password: 'testPassword'
        };
        let res;

        return chai
          .request(app)
          .post('/api/users')
          .send(testUser)
          .then(_res => {
            res = _res;
            expect(res).to.have.status(201);

            const body = res.body;
            expect(body).to.be.an('object');
            expect(body).to.have.keys('id', 'name', 'username');

            expect(body.id).to.exist;
            expect(body.name).to.equal(testUser.name);
            expect(body.username).to.equal(testUser.username);

            return User.findOne({ username: testUser.username });
          })
          .then(user => {
            expect(user).to.exist;

            expect(user.id).to.equal(res.body.id);
            expect(user.name).to.equal(testUser.name);
            expect(user.questions).to.be.an('array');
            expect(user.questions.length).to.equal(seedWords.length);
            user.questions.forEach(question => {
              expect(question).to.be.an('object');
            });
          });
      });

      it('should reject users with a missing name', function () {
        const testUser = {
          username: 'testUser',
          password: 'testPassword'
        };

        return chai
          .request(app)
          .post('/api/users')
          .send(testUser)
          .then(res => {
            expect(res).to.have.status(422);

            const body = res.body;
            expect(body).to.be.an('object');
            expect(body.reason).to.equal('ValidationError');
            expect(body.message).to.equal('Missing `name` in request body');
            expect(body.location).to.equal('name');
          });
      });

      it('should reject users with a missing username', function () {
        const testUser = {
          name: 'testUser',
          password: 'testPassword'
        };

        return chai
          .request(app)
          .post('/api/users')
          .send(testUser)
          .then(res => {
            expect(res).to.have.status(422);
            
            const body = res.body;
            expect(body).to.be.an('object');
            expect(body.reason).to.equal('ValidationError');
            expect(body.message).to.equal('Missing `username` in request body');
            expect(body.location).to.equal('username');
          });
      });

      it('should reject users with a missing password', function () {
        const testUser = {
          name: 'testUser',
          username: 'testUser'
        };

        return chai
          .request(app)
          .post('/api/users')
          .send(testUser)
          .then(res => {
            expect(res).to.have.status(422);

            const body = res.body;
            expect(body).to.be.an('object');
            expect(body.reason).to.equal('ValidationError');
            expect(body.message).to.equal('Missing `password` in request body');
            expect(body.location).to.equal('password');
          });
      });

      it('should reject users with a non-string name', function () {
        const testUser = {
          name: 12345,
          username: 'testUser',
          password: 'testPassword'
        };

        return chai
          .request(app)
          .post('/api/users')
          .send(testUser)
          .then(res => {
            expect(res).to.have.status(422);
            
            const body = res.body;
            expect(body).to.be.an('object');
            expect(body.reason).to.equal('ValidationError');
            expect(body.message).to.equal('The `name` must be of type `string`');
            expect(body.location).to.equal('name');
          });
      });

      it('should reject users with a non-string username', function () {
        const testUser = {
          name: 'testUser',
          username: true,
          password: 'testPassword'
        };

        return chai
          .request(app)
          .post('/api/users')
          .send(testUser)
          .then(res => {
            expect(res).to.have.status(422);
            
            const body = res.body;
            expect(body).to.be.an('object');
            expect(body.reason).to.equal('ValidationError');
            expect(body.message).to.equal('The `username` must be of type `string`');
            expect(body.location).to.equal('username');
          });
      });

      it('should reject users with a non-string password', function () {
        const testUser = {
          name: 'testUser',
          username: 'testUser',
          password: ['testPassword']
        };

        return chai
          .request(app)
          .post('/api/users')
          .send(testUser)
          .then(res => {
            expect(res).to.have.status(422);
            
            const body = res.body;
            expect(body).to.be.an('object');
            expect(body.reason).to.equal('ValidationError');
            expect(body.message).to.equal('The `password` must be of type `string`');
            expect(body.location).to.equal('password');
          });
      });

      it('should reject users with a non-trimmed username', function () {
        const testUser = {
          name: 'testUser',
          username: ' whiteSpace ',
          password: 'testPassword'
        };

        return chai
          .request(app)
          .post('/api/users')
          .send(testUser)
          .then(res => {
            expect(res).to.have.status(422);

            const body = res.body;
            expect(body).to.be.an('object');
            expect(body.reason).to.equal('ValidationError');
            expect(body.message).to.equal('The `username` cannot begin or end with whitespace');
            expect(body.location).to.equal('username');
          });
      });

      it('should reject users with a non-trimmed password', function () {
        const testUser = {
          name: 'testUser',
          username: 'testUser',
          password: ' whiteSpace '
        };

        return chai
          .request(app)
          .post('/api/users')
          .send(testUser)
          .then(res => {
            expect(res).to.have.status(422);

            const body = res.body;
            expect(body).to.be.an('object');
            expect(body.reason).to.equal('ValidationError');
            expect(body.message).to.equal('The `password` cannot begin or end with whitespace');
            expect(body.location).to.equal('password');
          });
      });

      it('should reject users with an empty name', function () {
        const testUser = {
          name: '',
          username: 'testUser',
          password: 'testPassword'
        };

        return chai
          .request(app)
          .post('/api/users')
          .send(testUser)
          .then(res => {
            expect(res).to.have.status(422);

            const body = res.body;
            expect(body).to.be.an('object');
            expect(body.reason).to.equal('ValidationError');
            expect(body.message).to.equal('Must be at least 1 characters long');
            expect(body.location).to.equal('name');
          });
      });

      it('should reject users with an empty username', function () {
        const testUser = {
          name: 'testUser',
          username: '',
          password: 'testPassword'
        };

        return chai
          .request(app)
          .post('/api/users')
          .send(testUser)
          .then(res => {
            expect(res).to.have.status(422);

            const body = res.body;
            expect(body).to.be.an('object');
            expect(body.reason).to.equal('ValidationError');
            expect(body.message).to.equal('Must be at least 1 characters long');
            expect(body.location).to.equal('username');
          });
      });

      it('should reject users with a password less than 8 characters', function () {
        const testUser = {
          name: 'testUser',
          username: 'testUser',
          password: '123456789'
        };

        return chai
          .request(app)
          .post('/api/users')
          .send(testUser)
          .then(res => {
            expect(res).to.have.status(422);

            const body = res.body;
            expect(body).to.be.an('object');
            expect(body.reason).to.equal('ValidationError');
            expect(body.message).to.equal('Must be at least 10 characters long');
            expect(body.location).to.equal('password');
          });
      });

      it('should reject users with a password greater than 72 characters', function () {
        const testUser = {
          name: 'testUser',
          username: 'testUser',
          password: ''
        };
        for (let i=0; i < 73; i++) {
          testUser.password = testUser.password + 'a';
        }
        expect(testUser.password.length).to.equal(73);

        return chai
          .request(app)
          .post('/api/users')
          .send(testUser)
          .then(res => {
            expect(res).to.have.status(422);

            const body = res.body;
            expect(body).to.be.an('object');
            expect(body.reason).to.equal('ValidationError');
            expect(body.message).to.equal('Must be at most 72 characters long');
            expect(body.location).to.equal('password');
          });
      });

      it('should reject users with duplicate username');

      it('should trim name');
    });
  });

  describe('/api/users/progress', function () {

    describe('GET', function () {
      
      it('should return the users progress when given a valid, logged-in user', function () {
        const sampleUser = {
          name: 'sampleUser',
          username: 'sampleUser',
          password: 'samplePassword'
        };
        let res;

        return chai
          .request(app)
          .post('/api/users')
          .send(sampleUser)
          .then(_res => {
            res = _res;
            // generate token for logged-in status
            const authToken = createAuthToken(res.body);

            return Promise.all([
              chai
                .request(app)
                .get('/api/users/progress')
                .set('Authorization', `Bearer ${authToken}`),
              User
                .findById(res.body.id, 'questions')
                .populate('questions.wordId')
            ]);
          })
          .then(([response, data]) => {
            expect(response).to.exist;
            expect(response).to.have.status(200);
            expect(data).to.exist;
            
            const body = response.body;
            expect(body).to.be.an('object');
            expect(body).to.have.keys(['questions']);

            const questions = body.questions;
            expect(questions).to.be.an('array');
            questions.forEach((question, i) => {
              expect(question).to.be.an('object');
              expect(question).to.have.keys(['russian', 'translit', 'english', 'score', 'attempts', 'sessionScore', 'sessionAttempts']);
              expect(question.russian).to.equal(data.questions[i].wordId.russian);
              expect(question.translit).to.equal(data.questions[i].wordId.translit);
              expect(question.english).to.equal(data.questions[i].wordId.english);
              expect(question.score).to.equal(data.questions[i].score);
              expect(question.attempts).to.equal(data.questions[i].attempts);
              expect(question.sessionScore).to.equal(data.questions[i].sessionScore);
              expect(question.sessionAttempts).to.equal(data.questions[i].sessionAttempts);
            });

          });
      });
    });
  });

  describe('/api/users/reset', function () {

    describe('POST', function () {

      it('should reset a valid users session score and session attempts', function () {

        const sampleUser = {
          name: 'sampleUser',
          username: 'sampleUser',
          password: 'samplePassword'
        };
        const sampleSubmission = {
          answer: 'hello'
        };
        let res;
        let authToken;
        let initialProgress;

        return chai
          .request(app)
          .post('/api/users')
          .send(sampleUser)
          .then(_res => {
            res = _res;
            // generate token for logged-in status
            authToken = createAuthToken(res.body);

            return chai
              .request(app)
              .post('/api/word')
              .send(sampleSubmission)
              .set('Authorization', `Bearer ${authToken}`);
          })
          .then(response => {
            expect(response).to.have.status(200);

            return User
              .findById(res.body.id)
              .populate('questions.wordId');
          })
          .then(_data => {
            const data = _data.toJSON();

            initialProgress = data.questions;
            expect(initialProgress).to.exist;
            expect(initialProgress).to.be.an('array');

            let answeredQ = initialProgress[0];
            expect(answeredQ).to.be.an('object');
            expect(answeredQ).to.have.keys(['_id', 'wordId', 'score', 'attempts', 'sessionScore', 'sessionAttempts', 'mValue', 'next']);
            expect(answeredQ.mValue).to.equal(2);
            expect(answeredQ.score).to.equal(1);
            expect(answeredQ.attempts).to.equal(1);
            expect(answeredQ.sessionScore).to.equal(1);
            expect(answeredQ.sessionAttempts).to.equal(1);

            return chai
              .request(app)
              .put('/api/users/reset')
              .set('Authorization', `Bearer ${authToken}`);
          })
          .then(response => {
            expect(response).to.have.status(200);

            return User
              .findById(res.body.id)
              .populate('questions.wordId');
          })
          .then(_data => {
            const data = _data.toJSON();
            const resetProgress = data.questions;

            expect(resetProgress).to.exist;
            expect(resetProgress).to.be.an('array');

            let answeredQ = resetProgress[0];
            expect(answeredQ).to.be.an('object');
            expect(answeredQ).to.have.keys(['_id', 'wordId', 'score', 'attempts', 'sessionScore', 'sessionAttempts', 'mValue', 'next']);
            expect(answeredQ.mValue).to.equal(2);
            expect(answeredQ.score).to.equal(1);
            expect(answeredQ.attempts).to.equal(1);
            expect(answeredQ.sessionScore).to.equal(0);
            expect(answeredQ.sessionAttempts).to.equal(0);
          });
      });
    });
  });
});
