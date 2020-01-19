import parse from '../src/configParser';

describe('configParser', () => {
  it('parses valid json', () => {
    const validOutput = parse('tests/samples/valid.json');
    expect(validOutput.jiraHost).toEqual('www.example.com');
    expect(validOutput.jiraUsername).toEqual('user@example.com');
    expect(validOutput.jiraPassword).toEqual('myPassword');
    expect(validOutput.tempoApiBearerToken).toEqual('myToken');
  });
  it('parses invalid json', () => {
    expect.assertions(1);
    try {
      parse('tests/samples/invalid.json');
    } catch (e) {
      expect(e.message).toMatch('tempoApiBearerToken is not a string');
    }
  });
});
