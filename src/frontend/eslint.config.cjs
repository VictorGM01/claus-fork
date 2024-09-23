module.exports = {
  root: true,
  env: { browser: true, es2020: true, jest: true },
  extends: [
    'eslint:recommended',
    'plugin:react/recommended',
    'plugin:react/jsx-runtime',
    'plugin:react-hooks/recommended',
    'plugin:prettier/recommended'
  ],
  ignorePatterns: ['dist', '.eslintrc.cjs'],
  parserOptions: { ecmaVersion: 'latest', sourceType: 'module' },
  settings: { react: { version: '18.2' } },
  plugins: ['prettier', 'react-refresh'],
  rules: {
    'react/jsx-no-target-blank': 'off',
    'react-refresh/only-export-components': [
      'warn',
      { allowConstantExport: true }
    ],
    'react/self-closing-comp': 'error',
    'react-hooks/exhaustive-deps': 'warn',
    'react-hooks/rules-of-hooks': 'error',
    'no-unused-vars': ['warn', { varsIgnorePattern: '^React$' }],
    'no-undef': 'warn',
    'no-constant-condition': 'warn',
    'no-empty': 'warn',
    'object-curly-spacing': ['error', 'always'],
    indent: ['error', 2],
    'prettier/prettier': 'error'
  }
};
