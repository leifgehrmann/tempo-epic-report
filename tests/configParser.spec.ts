import parse from '../src/configParser';

const validConfig: { [key: string]: number|string } = {
  jiraHost: 'www.example.com',
  jiraUsername: 'user@example.com',
  jiraPassword: 'myPassword',
  jiraEpicCustomFieldKey: 'customfield_12345',
  tempoApiBearerToken: 'myToken',
  hoursInDay: 7,
};

describe('configParser', () => {
  it('parses valid json', () => {
    const validOutput = parse(JSON.stringify(validConfig));
    expect(validOutput.jiraHost).toEqual('www.example.com');
    expect(validOutput.jiraUsername).toEqual('user@example.com');
    expect(validOutput.jiraPassword).toEqual('myPassword');
    expect(validOutput.jiraEpicCustomFieldKey).toEqual('customfield_12345');
    expect(validOutput.tempoApiBearerToken).toEqual('myToken');
    expect(validOutput.hoursInDay).toEqual(7);
  });

  it('parses invalid json', () => {
    expect.assertions(1);
    try {
      parse(JSON.stringify('{'));
    } catch (e) {
      expect(e.message).toMatch('Config is not an object');
    }
  });

  it('parses invalid json with missing required properties', () => {
    const allKeys = Object.keys(validConfig);
    expect.assertions(allKeys.length);
    allKeys.forEach((key) => {
      const invalidConfig = { ...validConfig };
      delete invalidConfig[key];
      try {
        parse(JSON.stringify(invalidConfig));
      } catch (e) {
        if (key === 'hoursInDay') {
          expect(e.message).toMatch(`Failed to parse config: ${key} is not a number`);
        } else {
          expect(e.message).toMatch(`Failed to parse config: ${key} is not a string`);
        }
      }
    });
  });
});
