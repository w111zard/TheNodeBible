const fs = require('fs')
const path = require('path')

function loadModule (filename, myModule, myRequire) {
  /*
    Хитрая функция. После вызова eval у нас в файле будут доступны
    myModule и myRequire, с помощью которых мы сможем экспортировать/импортировать
    данные

    Важно!!! Здесь не просто так используется синхронная загрузка файла. Это сделано для того,
    чтобы модули загружались в объявленном порядке. Если бы они загружались асинхронно, то
    порядок мог быть нарушен, что могло привезти к ошибкам. Настоящий require работает точно также
   */
  const wrappedSrc = `
    (function (myModule, exports,  myRequire) {
      ${fs.readFileSync(filename, { encoding: 'utf8' })}
    })(myModule, myModule.exports, myRequire)
  `;

  eval(wrappedSrc);
}

// Собственный аналог require
function myRequire(moduleName) {
  console.log(`Invoked for the module ${moduleName}`);

  // 1. Получаем id - абсолютный путь до файла
  const id = myRequire.resolve(moduleName);

  // 2. Проверяем есть ли id в кэше. Если есть, то возвращаем данные из кэша
  if (myRequire.cache[id]) {
    return myRequire.cache[id].exports;
  }

  // 3. Если в кэше ничего нет, то создаем новые данные
  const module = {
    exports: {},
    id,
  };

  // 4. Добавляем созданные данные в кэш
  myRequire.cache[id] = module;

  // 5. Загружаем модуль
  loadModule(id, module, myRequire);

  // 6. Возвращаем экспортированные данные
  return module.exports;
}

// Здесь хранится кэш
myRequire.cache = {}

// Это функция для получения id
myRequire.resolve = (moduleName) => {
  return path.resolve(__dirname, moduleName)
}

const data = myRequire('./2-another-module.js');
console.log(data)
data.publicFunction()