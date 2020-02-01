import validateDate from '../src/validateDate';

describe('validateDate', () => {
  it('does not throw error if valid', () => {
    validateDate('2020-01-02');
  });
  it('throws error if invalid', () => {
    expect.assertions(1);
    try {
      validateDate('tomorrow');
    } catch (e) {
      expect(e.message).toEqual('Invalid date: tomorrow. Must be of format YYYY-MM-DD.');
    }
  });
});
