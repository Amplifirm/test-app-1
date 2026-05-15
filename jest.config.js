// Pure-logic Jest config — no react-native renderer.
// Runs the matching tests + smoke tests against ts-jest.
// React Native module imports are mocked so we can test pure functions
// without a metro bundler / native runtime.

module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  testMatch: ['**/__tests__/**/*.test.ts'],
  setupFiles: ['<rootDir>/__tests__/setup.ts'],
  transform: {
    '^.+\\.tsx?$': ['ts-jest', { tsconfig: { strict: true, esModuleInterop: true, skipLibCheck: true } }],
  },
  moduleNameMapper: {
    '^~/(.*)$': '<rootDir>/src/$1',
    '^@/(.*)$': '<rootDir>/$1',
    '^react-native$': '<rootDir>/__tests__/__mocks__/react-native.ts',
    '^@react-native-async-storage/async-storage$': '<rootDir>/__tests__/__mocks__/async-storage.ts',
    '^expo-secure-store$': '<rootDir>/__tests__/__mocks__/expo-secure-store.ts',
    '^expo-haptics$': '<rootDir>/__tests__/__mocks__/expo-haptics.ts',
  },
};
