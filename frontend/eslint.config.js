const js = require('@eslint/js');
const globals = require('globals');

module.exports = [
  js.configs.recommended,

  {
    files: ['**/*.js'],

    languageOptions: {
      ecmaVersion: 'latest',

      globals: {
        ...globals.browser,
        ...globals.node,

        // biblioteki ładowane przez <script>
        Quill: 'readonly',
      },
    },

    rules: {
      // wymaganie === zamiast ==
      eqeqeq: 'error',

      // let -> const gdy zmienna nie jest nadpisywana
      'prefer-const': 'warn',

      // niewykorzystane zmienne
      'no-unused-vars': [
        'warn',
        {
          argsIgnorePattern: '^_',
          varsIgnorePattern: '^_',
        },
      ],

      // maksymalnie jedna pusta linia
      'no-multiple-empty-lines': [
        'error',
        {
          max: 1,
          maxEOF: 0,
          maxBOF: 0,
        },
      ],

      // pusta linia pomiędzy funkcjami
      'padding-line-between-statements': [
        'error',

        {
          blankLine: 'always',
          prev: 'function',
          next: 'function',
        },

        {
          blankLine: 'always',
          prev: 'block-like',
          next: 'function',
        },
      ],
    },
  },
];
