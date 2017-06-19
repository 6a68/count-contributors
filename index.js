const Client = require('github');
const config = require('./config.js');

// TODO: when we create the form input,
// have users pass in start and end dates, a github API key, 
// and a list of repos.

const gh = new Client({
  debug: true,
  protocol: 'https',
  host: 'api.github.com',
  timeout: 2000,
  headers: {
    'user-agent': '6a68/count-contributors'
  },
  Promise: require('bluebird')
});

gh.authenticate({
  type: 'oauth',
  token: config.token
});

