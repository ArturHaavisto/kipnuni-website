module.exports = {
  locales: ['en', 'fi', 'zh', 'ar'],
  output: 'src/i18n/locales/$LOCALE.json',
  input: 'src/**/*.{ts,tsx}',
  defaultNamespace: 'translation',
  keySeparator: '.',
  namespaceSeparator: false,
};
