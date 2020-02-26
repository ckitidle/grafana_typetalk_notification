const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const request = require('request-promise');
const morgan = require('morgan');
const parse = require('./parser');

// Variables

const TYPETALK_TOPIC_URL = 'https://typetalk.com/api/v1/topics/';
const PORT = 3000;

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
  let topicId = req.params.topicId;
  let token = req.query.typetalkToken;
  let isTest = req.query.isTest;

  if (!topicId || !token || !req.body) {
    return res.status(400).json({ message: 'Invalid request.' })
  }

  // Convert Grafana JSON to Typetalk JSON.
  let body = { message: parse(req.body) }
  if (isTest) {
    return res.status(200).json(body);
  }

  // Send topic request.
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
