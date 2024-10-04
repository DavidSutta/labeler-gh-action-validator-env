module.exports = {
  clearMocks: true,
  moduleFileExtensions: ['js', 'ts'],
  testEnvironment: 'node',
  testMatch: ['<rootDir>/tests/**/*.test.ts'],
  transform: {
    '^.+\\.ts$': 'ts-jest'
  },
  verbose: true,
  rootDir: '/workspaces/labeler-gh-action-validator-env',
  reporters: [
    "default",
	  ["./node_modules/jest-html-reporter", {
		"pageTitle": "Test Report",
    "includeFailureMsg": true,
    "includeConsoleLog": true
	  }]
  ]
}