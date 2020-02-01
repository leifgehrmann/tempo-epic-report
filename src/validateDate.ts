export default (dateString: string): void => {
  const date = Date.parse(dateString);
  if (Number.isNaN(date)) {
    throw new Error(
      `Invalid date: ${dateString}. `
      + 'Must be of format YYYY-MM-DD.',
    );
  }
};
