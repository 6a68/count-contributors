// TODO:
// 1. switch from node-github to https://github.com/github-tools/github, browser-centric
// 2. insert the input form into the page and handle submissions / responses.
// 3. put the whole thing in index.html
// 4. update github pages to just use the master branch. donezo

const Client = require('github');
const config = require('./config.js');


// TODO: when we create the input form,
// have users pass in start and end dates and a list of repos.
// for now, hard code it to the list of test pilot repos:
const repos = [
  {owner: 'mozilla', repo: 'testpilot'},
  {owner: 'mozilla', repo: 'testpilot-containers'},
  {owner: 'bwinton', repo: 'SnoozeTabs'},
  {owner: 'mozilla', repo: 'pulse'},
  {owner: 'mozilla-services', repo: 'screenshots'},
  {owner: 'meandavejustice', repo: 'min-vid'},
  {owner: 'mozilla', repo: 'activity-stream'},
  {owner: 'bwinton', repo: 'TabCenter'},
  {owner: 'cliqz-oss', repo: 'browser-core'}
];

// TODO: when we create the input form,
// pass in the start and end dates.
// for now, just use april 1 as the start date, june 30 the end date.
const startTime = new Date('4/1/17').getTime();
const endTime = new Date('6/30/17').getTime();

const gh = new Client({
  debug: false,
  protocol: 'https',
  host: 'api.github.com',
  timeout: 2000,
  headers: {
    'user-agent': '6a68/count-contributors'
  },
  Promise: require('bluebird')
});

// for each repo,
//   get recently-closed PRs;
//     for each PR,
//       if it was merged,
//       add to a list of contributions
//         (include the repo, PR number, PR title, username, PR URL)
// return the list of contributions.
// because the github API requires push access to list collaborators / org members,
// you have to do this manually for each repo.
//
// this ensures the app can't unintentionally do something really stupid with push rights ^_^

// each contribution is of the form
// { repo, PR number, title, author username, merged date}
const contributions = [];

repos.forEach(r => {
  // TODO: support pagination all the way back to startDate
  gh.pullRequests.getAll({
    owner: r.owner,
    repo: r.repo,
    state: 'closed',
  }).then(pulls => {
    console.log(`looking at pulls landed in ${r.repo}. there are ${pulls.data.length}`);
    pulls.data.forEach(pull => {
      // Ignore PRs closed without merging (in that case, merged_at is null).
      if (pull.merged_at === null) { return; }
      // Ignore PRs merged outside the start and end dates.
      const mergeTime = new Date(pull.merged_at).getTime();
      if (mergeTime < startTime || mergeTime > endTime) {
        return;
      }
      // We can't tell if the author is a contributor or not, so just
      // add all the remaining PRs to the potential list.
      contributions.push({
        user: pull.user.login,
        number: pull.number,
        title: pull.title,
        repo: r.repo,
        owner: r.owner,
        mergeDate: pull.merged_at
      });
    });
  }, console.error);
});

setTimeout(() => { 
  console.log('in all, we found ', contributions.length, ' contributions');
  contributions.forEach(c => {
    console.log(`${c.owner}/${c.repo}/pulls/${c.number} ${c.user} "${c.title}"`);
  });
}, 10 * 1000);
