var express = require('express');
var bodyParser = require('body-parser');
var request = require('request-promise');

const parse = require('./parser');

// Variables.
const TYPETALK_TOPIC_URL = 'https://typetalk.com/api/v1/topics/';

// Server settings.
var app = express();
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(function (req, res, next) {
  res.header("Access-Control-Allow-Origin", process.env.CORS_ALLOW_ORIGIN || '*');
  res.header('Access-Control-Allow-Headers', process.env.CORS_ALLOW_HEADERS || 'Content-Type, Accept');
  res.header('Access-Control-Allow-Methods', process.env.CORS_ALLOW_METHODS || 'POST, OPTIONS');
  res.header('Access-Control-Max-Age', process.env.CORS_MAX_AGE || '86400');
  next();
});

var server = app.listen(3000, () => console.log("Listening on port " + server.address().port));

// Router settings.
app.options("*", (req, res) => {
  res.sendStatus(200);
});

app.post("/v1/topics/:topic_id", (req, res) => {
  let topic_id = req.params.topic_id;
  let access_token = req.query.typetalkToken;
  if (!topic_id || !access_token || !req.body) {
    res.status(400).json({ message: 'Invalid request.' })
  } else {
    // Parse Grafana JSON to Typetalk JSON.
    let body = { message: parse(req.body) }
    // Send topic request.
    let options = {
      url: TYPETALK_TOPIC_URL + topic_id,
      method: 'POST',
      qs: {
        typetalkToken: access_token,
      },
      body: body,
      json: true,
    }
    request(options)
      .then((body) => {
        res.json({ message: body })
      })
      .catch((err) => {
        res.status(err.statusCode).json({ message: err.message })
      });
  }
});

// Handler settings.
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(err.status || 500).send({ message: err.message });
});
