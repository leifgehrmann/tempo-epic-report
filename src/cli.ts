#!/usr/bin/env node

import yargs from 'yargs';
import fs from 'fs';
import parse from './configParser';
import App from './app';
import validateDate from './validateDate';

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

const configText = fs.readFileSync(argv.config).toString();
const config = parse(configText);
const app = new App(config);

const reportQuery = {
  usernames: argv.usernames.split(','),
  from: new Date(argv['start-date']),
  to: new Date(argv['end-date']),
};

app.execute(reportQuery).then((result) => {
  // eslint-disable-next-line no-console
  console.log(result);
});
