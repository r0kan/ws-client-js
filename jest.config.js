module.exports = {
  cacheDirectory: '<rootDir>/.cache/jest',
  roots: ['<rootDir>/test'],
  moduleFileExtensions: ['js', 'ts'],
  testMatch: ['<rootDir>/test/**/*.spec.ts'],
  transform: {
    '^.+\\.ts$': 'ts-jest',
  },
};
