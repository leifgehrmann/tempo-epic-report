import fs from 'fs';

interface Config {
  jiraHost: string;
  jiraUsername: string;
  jiraPassword: string;
  tempoApiBearerToken: string;
}

function throwError(error: string): never {
  throw Error(`Failed to parse config: ${error}`);
}

export default function parse(configFilePath: string): Config {
  const rawConfigData = JSON.parse(fs.readFileSync(configFilePath).toString());
  if (typeof rawConfigData !== 'object') {
    throwError('Config is not an array');
  }
  if (typeof rawConfigData.jiraHost !== 'string') {
    throwError('jiraHost is not a string');
  }
  if (typeof rawConfigData.jiraUsername !== 'string') {
    throwError('jiraUsername is not a string');
  }
  if (typeof rawConfigData.jiraPassword !== 'string') {
    throwError('jiraPassword is not a string');
  }
  if (typeof rawConfigData.tempoApiBearerToken !== 'string') {
    throwError('tempoApiBearerToken is not a string');
  }
  return rawConfigData as Config;
}
