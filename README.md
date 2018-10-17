# Privet! - Server

The Node.js api powering our [client application](https://github.com/thinkful-ei22/Privet-client-DanKyle) to learn Russian words based on the [spaced-repetition](https://en.wikipedia.org/wiki/Spaced_repetition) algorithm.

Check out the [live version here](https://privet-hello.herokuapp.com/).

## Table of Contents

- [API EXAMPLES](#api---request--response-examples)
- [TECH STACK](#tech-stack)
- [GETTING STARTED](#getting-started)
- [WORKING ON THE PROJECT](#working-on-the-project)
- [DATABASE](#database)
- [DEPLOYMENT](#deployment)

## API - Request & Response examples

- [POST /api/login](#post-apilogin)
- [POST /api/refresh](#post-apirefresh)
- [POST /api/users](#post-apiusers)
- [GET  /api/users/progress](#get-apiusersprogress)
- [PUT  /api/users/reset](#put-apiusersreset)
- [GET  /api/word](#get-apiword)
- [POST /api/word](#post-apiword)

### POST /api/login

Example: POST <https://example.com/api/login>

Request body:

```json
{
  "username": "JohnSmith",
  "password": "correct-horse-battery-staple"
}
```

[ [more examples](#api---request--response-examples) ]
[ [return to top](#table-of-contents) ]

### POST /api/refresh

Example: POST <https://example.com/api/refresh>

Response body:

```json
{
  "authToken": "A_VALID_JWT"
}
```

[ [more examples](#api---request--response-examples) ]
[ [return to top](#table-of-contents) ]

### POST /api/users

Example: POST <https://example.com/api/users>

Request body:

```json
{
  "name": "John Smith",
  "username": "JohnSmith",
  "password": "correct-horse-battery-staple"
}
```

Response body:

```json
{
  "id": "MONGO_DOCUMENT_ID",
  "name": "John Smith",
  "username": "JohnSmith"
}
```

[ [more examples](#api---request--response-examples) ]
[ [return to top](#table-of-contents) ]

### GET /api/users/progress

Example: <https://example.com/api/users/progress>

Response body:

```json
{
  "questions": [
    {
      "russian": "Привет",
      "translit": "pree-vyEt",
      "english": "hello",
      "score": "1",
      "attempts": "1",
      "sessionScore": "1",
      "sessionAttempts": "1"
    },
    { "repeat": "for" },
    { "each": "word" }
  ]
}
```

[ [more examples](#api---request--response-examples) ]
[ [return to top](#table-of-contents) ]

### PUT /api/users/reset

Example: PUT <http://example.com/api/users/reset>

Request body: `empty`

Response: `status 200`

[ [more examples](#api---request--response-examples) ]
[ [return to top](#table-of-contents) ]

### GET /api/word

Example: <http://example.com/api/word>

Response body:

```json
{
  "word": "Привет",
  "translit": "pree-vyEt"
}
```

[ [more examples](#api---request--response-examples) ]
[ [return to top](#table-of-contents) ]

### POST /api/word

Example: POST <http://example.com/api/word>

Request body:

```json
{
  "answer": "hello" //_user_input
}
```

Response body:

```json
{
  "answer": "hello", //_answer_from_database
  "correct": "true"
}
```

[ [more examples](#api---request--response-examples) ]
[ [return to top](#table-of-contents) ]

## Tech Stack

Front-end: React / Redux / CSS Grid [ [repo](https://github.com/thinkful-ei22/Privet-client-DanKyle) ]

Back-end:

- Express.js server
- Node.js
- Passport/JWT for authentication
- MongoDB/Mongoose for data persistence
- Mocha/Chai for testing

[ [return to top](#table-of-contents) ]

## Getting started

### Setting up the API server

Move into your projects directory:

```bash
  cd ~/YOUR_PROJECTS_DIRECTORY
```

Clone this repository:

```bash
  git clone https://github.com/thinkful-ei22/Privet-server-DanKyle YOUR_PROJECT_NAME
```

Move into the project directory:

```bash
  cd YOUR_PROJECT_NAME
```

Install the dependencies:

```bash
  npm install
```

Create a new repo on GitHub: https://github.com/new

* Make sure the "Initialize this repository with a README" option is left unchecked

Update the remote to point to your GitHub repository:

```bash
  git remote set-url origin https://github.com/YOUR_GITHUB_USERNAME/YOUR_REPOSITORY_NAME
```

[ [return to top](#table-of-contents) ]

### Working on the project

Move into the project directory:

```bash
  cd ~/YOUR_PROJECTS_DIRECTORY/YOUR_PROJECT_NAME
```

Run the development task:

```bash
  npm start
```

* Starts a server running at http://localhost:8080
* Automatically restarts when any of your files change

[ [return to top](#table-of-contents) ]

## Database

The server is configured to connect to a MongoDB database using Mongoose. The `DATABASE_URL` defaults to `mongodb://localhost:27017/privet-backend`, but can be configured via environment variables. We recommend utilizing [dotenv](https://github.com/motdotla/dotenv) to store your variables locally in a `.env` file.

[ [return to top](#table-of-contents) ]

## Deployment

Instructions require the [Heroku CLI client](https://devcenter.heroku.com/articles/heroku-command-line).

### Setting up the project on Heroku

Move into the project directory:

```bash
  cd ~/YOUR_PROJECTS_DIRECTORY/YOUR_PROJECT_NAME
```

Create the Heroku app:

```bash
  heroku create PROJECT_NAME
```

Configure the database URL:

```bash
  heroku config:set DATABASE_URL=mongodb://USERNAME:PASSWORD@HOST:PORT/DATABASE_NAME
```

If you are creating a full-stack app, you need to configure the client origin:

```bash
  heroku config:set CLIENT_ORIGIN=https://www.YOUR_DEPLOYED_CLIENT.com
```

### Deploying to Heroku

Push your code to Heroku:

```bash
  git push heroku master
```

[ [return to top](#table-of-contents) ]
