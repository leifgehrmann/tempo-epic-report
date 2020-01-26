# Tempo Weekly Epic Report

[![Build Status](https://github.com/leifgehrmann/tempo-epic-report/workflows/Tests/badge.svg?branch=master)](https://github.com/leifgehrmann/tempo-epic-report/actions)
[![Code Coverage](https://codecov.io/gh/leifgehrmann/tempo-epic-report/branch/master/graph/badge.svg)](https://codecov.io/gh/leifgehrmann/tempo-epic-report)
[![dependency Status](https://david-dm.org/leifgehrmann/tempo-epic-report/status.svg)](https://david-dm.org/leifgehrmann/tempo-epic-report)
[![devDependency Status](https://david-dm.org/leifgehrmann/tempo-epic-report/dev-status.svg)](https://david-dm.org/leifgehrmann/tempo-epic-report?type=dev)

Script to calculate [Tempo] worklog totals for [JIRA] epics.

[Tempo]: https://www.tempo.io
[JIRA]: https://www.atlassian.com/software/jira 

### Usage

#### Setting up the config file

First, create a JSON file anywhere with the following details:

```json
{
  "jiraHost": "[yourDomain].atlassian.net",
  "jiraUsername": "user@example.com",
  "jiraPassword": "myJiraToken",
  "jiraEpicCustomFieldKey": "customfield_12345",
  "tempoApiBearerToken": "myTempoToken", 
  "hoursInDay": 6.5
}
```

The `jiraPassword` can be generated from here: https://confluence.atlassian.com/cloud/api-tokens-938839638.html

The `tempoApiBearerToken` can be generated from here: https://tempo-io.atlassian.net/wiki/spaces/KB/pages/199065601/How+to+use+Tempo+Cloud+REST+APIs

The `jiraEpicCustomField` can be found by using an app like Postman and figuring out which field contains the issue key of the epic in the API response in JIRA.
It will normally look something like `"customfield_10001": "JT-123"`. 

#### Install

Checkout this repo, then install and build (NPM/Node required):

```shell script
$ npm install
$ npm build
```

#### Running

```shell script
$ ./lib/cli.js
Options:
  --version         Show version number                                [boolean]
  --help            Show help                                          [boolean]
  --config, -c      Config filepath                          [string] [required]
  --usernames, -u   A CSV of usernames                       [string] [required]
  --start-date, -s  Start date                               [string] [required]
  --end-date, -e    End date                                 [string] [required]

Missing required arguments: usernames, config, start-date, end-date

$ ./lib/cli.js --config config.json --usernames "user1@example,user2@example.com" --start-date 2020-01-13 --end-date 2020-01-17
```

This will then output something that looks like this:

```
[0.6 days] Sales
[0.2 days] Code Review
[0.2 days] Meetings
[1.0 days] Holiday/Absence
```

### Development

For development, running it in "dev" mode will automatically
recompile the typescript code.

```shell script
$ npm run build # Run this at least once.
$ npm run dev
```

#### Linting

```
$ npm run lint
```

#### Auto-formatting

```
$ npm run format
```
