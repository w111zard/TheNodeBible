const SUPPORTED_LANGUAGES = ['ru', 'en']

const selectedLanguage = process.argv[2] // получаем нужный язык

if (!SUPPORTED_LANGUAGES.includes(selectedLanguage)) {
  console.error('The specified language does not exist');
  process.exit(1);
}

const translationModule = `./3-strings-${selectedLanguage}.mjs`

import(translationModule) // динамически загружаем модуль
  .then((strings) => {
    console.log(strings.HELLO);
  })