import Config from './config';

function throwError(error: string): never {
  throw Error(`Failed to parse config: ${error}`);
}

export default function parse(configText: string): Config {
  const rawConfigData = JSON.parse(configText);
  if (typeof rawConfigData !== 'object') {
    throwError('Config is not an object');
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
  if (typeof rawConfigData.jiraEpicCustomFieldKey !== 'string') {
    throwError('jiraEpicCustomFieldKey is not a string');
  }
  if (typeof rawConfigData.tempoApiBearerToken !== 'string') {
    throwError('tempoApiBearerToken is not a string');
  }
  if (typeof rawConfigData.hoursInDay !== 'number') {
    throwError('hoursInDay is not a number');
  }
  return rawConfigData as Config;
}
