module.exports = {
  setupFilesAfterEnv: ['./jest.setup.js'],
  transform: {
    '^.+\\.jsx?$': 'babel-jest', 
    '^.+\\.css$': 'jest-transform-css' 
  },
  testEnvironment: 'jsdom',
  moduleFileExtensions: ['js', 'jsx']
};
