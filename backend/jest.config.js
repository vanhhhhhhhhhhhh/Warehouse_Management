module.exports = {
  setupFilesAfterEnv: ['<rootDir>/test/setup.js'],
  testEnvironment: 'node',
  verbose: true,
  collectCoverage: false,
  testMatch: ['**/__tests__/**/*.js', '**/?(*.)+(spec|test).js'],
  testPathIgnorePatterns: ['/node_modules/'],
  forceExit: true,
  detectOpenHandles: true
}; 