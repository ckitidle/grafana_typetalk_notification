module.exports = function parse(notifications) {
  messages = [];
  messages.push('[STATE] ' + notifications.state);
  messages.push('[RULE] (' + notifications.ruleId + ') ' + notifications.ruleName);
  messages.push(notifications.ruleUrl);
  messages.push('[MESSAGE]');
  messages.push(notifications.message);
  return messages.join('\n');
};