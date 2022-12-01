import * as blob from './storage-blob/index';

describe('Index', () => {
  test('should return 4 exports', () => {
    expect(Object.keys(blob)).toHaveLength(4);
  });
});
