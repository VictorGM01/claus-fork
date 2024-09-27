module.exports = {
  setupFilesAfterEnv: [require.resolve('@testing-library/jest-dom')],
  transform: {
    '^.+\\.jsx?$': 'babel-jest', 
    '^.+\\.css$': 'jest-transform-css' 
  },
  testEnvironment: 'jsdom',
  moduleFileExtensions: ['js', 'jsx'],
  moduleNameMapper: {
    '\\.(css|less|scss|sass)$': 'identity-obj-proxy',
  },
  transformIgnorePatterns: [
    'node_modules/(?!(react-datepicker)/)', // Permite que o Jest entenda o "react-datepicker"
  ],
};
