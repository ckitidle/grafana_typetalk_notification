var express = require('express');
var bodyParser = require('body-parser');
var request = require('request-promise');

// Variables.
const TYPETALK_TOPIC_URL = 'https://typetalk.com/api/v1/topics/';

// Server settings.
var app = express();
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
var server = app.listen(3000, () => console.log("Listening on port " + server.address().port));

// Router settings.
app.post("/v1/topics/:topic_id", (req, res) => {
  let topic_id = req.params.topic_id;
  let access_token = req.query.typetalkToken;
  if (!topic_id || !access_token) {
    res.status(400).json({ message: 'Invalid request.' })
  } else {
    // Parse Grafana JSON to Typetalk JSON.
    messages = [];
    messages.push('[STATE] ' + req.body.state);
    messages.push('[RULE] (' + req.body.ruleId + ') ' + req.body.ruleName);
    messages.push(req.body.ruleUrl);
    messages.push('[MESSAGE]');
    messages.push(req.body.message);
    var body = { message: messages.join('\n') }
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
        res.status(err.stattusCode).json({ message: err.message })
      });
  }
});

// Handler settings.
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(err.status || 500).send({ message: err.message });
});
