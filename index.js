'use strict';

const express = require('express');
const cors = require('cors');
const request = require('request-promise');
const morgan = require('morgan');
const ejs = require('ejs');
const fs = require('fs');
const path = require('path');
const log4js = require('log4js');

// Variables

const TYPETALK_TOPIC_URL = 'https://typetalk.com/api/v1/topics/';
const VIEWS_DIR = path.join(__dirname, 'views');
log4js.configure({
  appenders: {
    system: {type: 'file', filename: 'logs/error.log'}
  },
  categories: {
    default: {appenders:['system'], level: 'debug'}
  }
});
const logger = log4js.getLogger();

// Server settings

var app = express();
app.use(morgan('combined'));
// NOTE: Grafana can't send Content-Type header, so it always parses a request body as JSON format.
app.use(express.json({ type: '*/*' }));
app.use(express.urlencoded({ extended: true }));
app.use(cors());
app.use((err, req, res, next) => {
  logger.error(err.message + '\n' + err.stack);
  res.status(err.status || 500).json({ message: err.message });
});

// Router settings

app.options("*", (req, res) => {
  res.status(200).send('OK');
});

app.post("/v1/topics/:topicId", (req, res) => {
  // Get parameters.
  let topicId = req.params.topicId;
  let token = req.query.typetalkToken;
  let isTest = req.query.isTest;
  if (!topicId || !token || !req.body) {
    logger.error('Invalid request');
    return res.status(400).json({ message: 'Invalid request' })
  }

  // Create request body for typetalk API.
  let templatePath = path.join(VIEWS_DIR, topicId + '.ejs');
  var message = '';

  try {
    let template = fs.readFileSync(templatePath, 'utf8');
    message = ejs.render(template, req.body);
  } catch (err) {
    logger.error({ message: err.message, body: req.body });
    return res.status(400).json({ message: err.message, body: req.body })
  }

  if (isTest) {
    return res.status(200).json(message);
  }

  // Send request to Typetalk.
  let options = {
    url: TYPETALK_TOPIC_URL + topicId,
    method: 'POST',
    qs: {
      typetalkToken: token,
    },
    body: { message: message },
    json: true,
  }
  request(options)
    .then((body) => {
      res.status(200).json({ message: body })
    })
    .catch((err) => {
      logger.error('Failed to request to Typetalk API: ' + err.message);
      logger.info('\n' + message);
      res.status(err.statusCode).json({ message: err.message })
    });
});

// Start server.
const server = app.listen(process.env.PORT || 3000, () => console.log("Listening on port " + server.address().port));
