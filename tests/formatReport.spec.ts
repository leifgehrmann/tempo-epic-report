import { EpicsTotalTimeReport } from '../src/report';
import formatReport from '../src/formatReport';

describe('formatReport', () => {
  it('formats report correctly', () => {
    const report: EpicsTotalTimeReport = {
      'TEST-1': {
        epicIssue: { fields: { summary: 'Illiad' } },
        totalTimeSpentSeconds: 10000,
      },
      'TEST-2': {
        epicIssue: { fields: { summary: 'Odyssey' } },
        totalTimeSpentSeconds: 20000,
      },
    };
    const result = formatReport(report, 7);
    expect(result).toEqual(
      `[0.4 days] Illiad
[0.8 days] Odyssey`,
    );
  });
});
