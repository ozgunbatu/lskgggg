/** @type {import('jest').Config} */
module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  testMatch: ['**/__tests__/**/*.test.ts'],
  globals: {
    'ts-jest': {
      tsconfig: 'tsconfig.test.json',
    },
  },
  moduleNameMapper: {
    '^../lib/db$': '<rootDir>/src/__mocks__/db.ts',
    '^../../lib/db$': '<rootDir>/src/__mocks__/db.ts',
  },
};
