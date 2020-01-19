#!/usr/bin/env node

import yargs from 'yargs';
import TempoApi from 'tempo-client';
import JiraApi from 'jira-client';
import parse from './configParser';
import Report from './report';

const validateDate = (dateString: string): void => {
  const date = Date.parse(dateString);
  if (Number.isNaN(date)) {
    throw new Error(
      `Invalid date: ${dateString}. `
      + 'Must be of format YYYY-MM-DD.',
    );
  }
};

const { argv } = yargs
  .help()
  .option('config', {
    alias: 'c',
    describe: 'Config filepath',
    type: 'string',
  }).option('usernames', {
    alias: 'u',
    describe: 'A CSV of usernames',
    type: 'string',
  })
  .option('start-date', {
    alias: 's',
    describe: 'Start date',
    type: 'string',
  })
  .option('end-date', {
    alias: 'e',
    describe: 'End date',
    type: 'string',
  })
  .demandOption(['usernames', 'config', 'start-date', 'end-date'])
  .check((args) => {
    validateDate(args['start-date']);
    validateDate(args['end-date']);
    return true;
  });

// 1. Parse CLI arguments
const config = parse(argv.config);

// 2. Instantiate node and tempo clients
const jira = new JiraApi({
  protocol: 'https',
  host: config.jiraHost,
  username: config.jiraUsername,
  password: config.jiraPassword,
  apiVersion: '2',
  strictSSL: true,
});
const tempo = new TempoApi({
  protocol: 'https',
  host: 'api.tempo.io',
  bearerToken: config.tempoApiBearerToken,
  apiVersion: '3',
});

const from = new Date(argv['start-date']);
const to = new Date(argv['end-date']);
const usernames = argv.usernames.split(',');

const report = new Report(jira, tempo, config.jiraEpicCustomFieldKey);
report.execute(
  {
    usernames,
    from,
    to,
  },
).then((output) => {
  // eslint-disable-next-line no-console
  console.log(output);
});
