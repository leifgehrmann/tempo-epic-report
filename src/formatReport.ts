import { EpicsTotalTimeReport } from './report';

export default (epicsTotalTimeReport: EpicsTotalTimeReport, hoursInDay: number): string => {
  const output: string[] = [];

  Object.values(epicsTotalTimeReport).forEach((epicTotalTimeReport) => {
    const epicName = epicTotalTimeReport.epicIssue.fields.summary;
    const totalTimeInSeconds = epicTotalTimeReport.totalTimeSpentSeconds;
    const totalTimeInDays = (totalTimeInSeconds / (60 * 60 * hoursInDay)).toFixed(1);
    output.push(`[${totalTimeInDays} days] ${epicName}`);
  });

  return output.join('\n');
};
