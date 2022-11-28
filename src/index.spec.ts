import * as blob from './blob/index';

describe('Index', () => {
  test('should return 4 exports', () => {
    expect(Object.keys(blob)).toHaveLength(4);
  });
});
