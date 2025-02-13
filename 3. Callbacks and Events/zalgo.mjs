import { readFile } from 'fs'

const cache = new Map();

/*
  Функция чтения файла

  Написана в ужасном стиле, потому что может отдавать ответ, то синхронно, то нет
 */
function unpredictableReader(file, callback) {
  if (cache.has(file)) {
    // Здесь ответ будет дан синхронно
    return callback(null, cache.get(file));
  }

  // Здесь асинхронно
  readFile(file, 'utf8', (err, data) => {
    if (err) {
      console.error(err);
      process.exit(1);
    }

    cache.set(file, data);
    callback(null, data);
  })
}

/*
  Функция позволяющая добавлять подписчиков на событие чтения файла
 */
function createFileReader(file) {
  const listeners = [];

  unpredictableReader(file, (err, data) => {
    if (err) {
      console.error(err);
      process.exit(1);
    }

    // Как только файл прочитан, отдаем содержимое подписчикам
    listeners.forEach(listener => listener(data));
  })

  return {
    // Метод добавления нового подписчика
    onDataReady: (listener) => listeners.push(listener)
  }
}

function main() {
  // 1. Создаем новый reader
  const fileReader1 = createFileReader('file1'); // 1

  // 2. Добавляем подписчика
  fileReader1.onDataReady(data => {
    // 3. Файл будет прочитан асинхронно и этот код выполнится, все ок
    console.log('Получено содержимое первого файла!')

    /*
      Создаем новый reader. И тут важный момент: file1 будет находиться в кэше, значит unpredictableReader
      вернет значение СИНХРОННО => дальнейшая подписка не сработает, т.к содержимое файла будет возвращено
      до вызова метода подписки
     */
    const fileReader2 = createFileReader('file1'); // 4

    fileReader2.onDataReady(data => {
      // Никогда не будет вызван
      console.log('Получено содержимое второго файла!')
    })
  })
}

main();