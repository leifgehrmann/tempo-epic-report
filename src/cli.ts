#!/usr/bin/env node

import yargs from 'yargs'

const validateDate = (dateString: string): void => {
  const date = Date.parse(dateString)
  if (isNaN(date)) {
    throw new Error(
      `Invalid date: ${dateString}. ` +
      `Must be of format YYYY-MM-DD.`
    )
  }
}

const argv = yargs
  .help()
  .option('config', {
    alias: 'c',
    describe: 'Config filepath',
    type: 'string'
  }).option('usernames', {
    alias: 'u',
    describe: 'A CSV of usernames',
    type: 'string'
  })
  .option('start-date', {
    alias: 's',
    describe: 'Start date',
    type: 'string'
  })
  .option('end-date', {
    alias: 'e',
    describe: 'End date',
    type: 'string'
  })
  .demandOption(['config', 'start-date', 'end-date'])
  .check((args) => {
    validateDate(args['start-date']);
    validateDate(args['end-date']);
    return true;
  }).argv

// 1. Parse CLI arguments
console.log(argv.usernames)
// 2. Instantiate node and tempo clients
// 3. Fetch all the worklogs for the team
// 4. For each worklog, fetch the issue
// 5. For each issue, fetch the epic
// 6. Accumulate the worklog timings for each worklog, grouped by epic or issue
