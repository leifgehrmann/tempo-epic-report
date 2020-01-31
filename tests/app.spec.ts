import App from '../src/app';

describe('App', () => {
  it('Constructor succeeds', async () => {
    const config = {
      jiraHost: 'www.example.com',
      jiraUsername: 'user@example.com',
      jiraPassword: 'myPassword',
      jiraEpicCustomFieldKey: 'customfield_12345',
      tempoApiBearerToken: 'myToken',
      hoursInDay: 7,
    };
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const report = new App(config);
  });
});
