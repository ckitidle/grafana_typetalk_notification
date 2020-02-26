const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const request = require('request-promise');
const morgan = require('morgan');
const ejs = require('ejs');
const fs = require('fs');
const path = require('path');
//const parse = require('./parser');

// Variables

const TYPETALK_TOPIC_URL = 'https://typetalk.com/api/v1/topics/';
const PORT = 3000;
const VIEWS_DIR = path.join(__dirname, 'views');

// Server settings

var app = express();
app.use(morgan('combined'));
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(cors());
app.use((err, req, res, next) => {
  console.log(err.stack);
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
    return res.status(400).json({ message: 'Invalid request.' })
  }

  // Create request body for typetalk API.
  let templateFile = topicId + '.ejs';
  let templatePath = path.join(VIEWS_DIR, templateFile);
  var body = '';

  try {
    let template = fs.readFileSync(templatePath, 'utf8');
    body = ejs.render(template, req.body);
  } catch (err) {
    return res.status(400).json({ message: 'Template file is not found. - ' + templatePath })
  }

  if (isTest) {
    return res.status(200).json(body);
  }

  // Send request to Typetalk.
  let options = {
    url: TYPETALK_TOPIC_URL + topicId,
    method: 'POST',
    qs: {
      typetalkToken: token,
    },
    body: body,
    json: true,
  }
  request(options)
    .then((body) => {
      res.status(200).json({ message: body })
    })
    .catch((err) => {
      res.status(err.statusCode).json({ message: err.message })
    });
});

// Start server.
const server = app.listen(PORT, () => console.log("Listening on port " + server.address().port));
