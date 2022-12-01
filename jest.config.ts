export default {
  clearMocks: true,
  testEnvironment: 'node',
  testMatch: ['**/src/**/*.(spec|test).ts'],
  testPathIgnorePatterns: ['\\\\node_modules\\\\'],
  transform: {
    '^.+\\.(t|j)s$': 'ts-jest',
  },
};
