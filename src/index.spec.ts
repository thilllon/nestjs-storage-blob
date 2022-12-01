import * as blob from './storage-blob/index';

describe('Index', () => {
  test('should return N exports', () => {
    expect(Object.keys(blob)).toHaveLength(5);
  });
});
