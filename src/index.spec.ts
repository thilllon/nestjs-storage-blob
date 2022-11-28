import * as blob from './blob/index';
import * as s3 from './s3/index';

describe('Index', () => {
  test('should return 4 exports', () => {
    expect(Object.keys(blob)).toHaveLength(4);
  });

  it('should return 5 exports', () => {
    expect(Object.keys(s3)).toHaveLength(5);
  });
});
