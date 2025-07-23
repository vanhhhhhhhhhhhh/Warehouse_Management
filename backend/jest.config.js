module.exports = {
  setupFilesAfterEnv: ['<rootDir>/test/setup.js'],
  testEnvironment: 'node',
  verbose: true,
  collectCoverage: false,
  testMatch: ['**/__tests__/**/*.js', '**/?(*.)+(spec|test).js'],
  testPathIgnorePatterns: ['/node_modules/'],
  forceExit: true,
  detectOpenHandles: true,
  reporters: ['default', [
    './node_modules/jest-html-reporter',
    {
      pageTitle: 'Warehouse Management System',
      outputPath: 'test-report.html',
      includeFailureMsg: true,
      includeConsoleLog: true,
    }
  ]]
}; 