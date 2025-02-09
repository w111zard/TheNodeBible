# Оглавление

+ [Немного истории](#немного-истории)
+ [Паттерны](#паттерны)
+ [CommonJS](#commonjs)
  + [module.exports VS exports](#moduleexports-vs-exports)
  + [Require - синхронный](#require---синхронный)
  + [Resolving algorithm](#resolving-algorithm)
  + [Module definition patterns](#module-definitions-patterns)
+ [ES Modules](#es-modules)
  + [Как использовать в проекте?](#как-использовать-в-проекте)

# Немного истории

+ В отличие от других платформ первоначально в JavaScript не было модульной системы
+ Когда впервые вышел в свет Node.js была создана модульная система **CommonJS**
+ В 2015 вышла спецификация **ECMA Script 6** (ECMA Script 2015), в которой содержалось описание (но не реализация!) новой модульной системы **ECMA Script modules** (ESM)
+ В Node 13.2 впервые удалось реализовать данную спецификацию **ESM**

# Паттерны

+ Существует множество паттернов для системы модулей
+ Самый простой паттерн - **Revialing Module Pattern** представлен в [файле](1-revealing-module-pattern.js)
+ Собственная реализация **CommonJS** модулей представлена в [файле](2-my-require.js) 

# CommonJS

## module.exports VS exports

При создании модуля создается объект:

```javascript
const module = {
  exports: {},
  ...
}
```

**exports** - это просто ссылка на **module.exports**

Если мы захотим переобъявить **exports**, то она перестанет ссылаться на объект **module**, что сделает ее использование бессмысленным

```javascript
exports = () => {} // уже не будет иметь смысла

module.exports = () => {} // но module.exports так может
```

## Require - синхронный

+ **require** работает синхронно. Это важно для того, чтобы модули загружались в объявленном порядке. Если бы они загружались асинхронно, то порядок был бы непредсказуем и из-за этого могли возникнуть ошибки
+ Ранее существовала асинхронная версия **require**, однако, она не используется из-за ее пере усложненности

## Resolving algorithm

Есть такое понятие как **dependency hell** - это когда в программе есть модули, которые зависят от одной библиотеки, но при этом в разных частях требуют разную версию этой зависимости. Node.js решает эту проблему, предоставляя
для каждой части свою версию зависимости. Например, модуля А будет предоставлена отдельная версия зависимости А, а модулю B также будет предоставлена отдельная версия зависимости для него.

Чтобы была возможность загружать разные версии зависимостей Node.js использует специальный алгоритм:
+ **File modules**: 
  + если имя модуля начинается с /, Node.js воспринимает это как абсолютный путь до файла и пытается загрузить модуль по этому пути
  + если имя модуля начинается с ./, Node.js воспринимает это как относительный путь и соединяет его с путем, где вызывается эта зависимость
+ **Core modules**:
  + если модуль не начинается с / или ./, Node.js пытается найти глобальный модуль с таким именем (например: **fs**, **path**, **http**)
+ **Package modules**:
  + если глобальный модуль не найден, Node.js начинает искать папку **node_modules**. Если в директории вызова модуля ее нет, то алгоритм поднимается на директории выше и продолжает поиски. Алгоритм продолжается, пока не дойдет до корневой директории.

![commonjs-tree.png](../resources/commonjs-tree.png)

Выше представлен пример зависимостей в проекте. У нас есть 3 зависимости: **depA**, **depB**, **depC**.
**depB** и **depC** зависят от **depA**, но для каждой этой зависимости есть своя копия **depA**, во избежание
**dependency hell** 

+ Вызов `require('debA')` в `app.js` загрузит зависимость из `node_modules/debA`
+ Вызов `require('debA')` в `node/modules/depB` загрузит зависимость из `node_modules/debB/node_modules/debA`
+ Вызов `require('debA')` в `node/modules/depC` загрузит зависимость из `node_modules/debC/node_modules/debA`

Благодаря алгоритму разрешения зависимостей, модули получат свои собственные версии зависимостей!

## Module definitions patterns

### Named exports

`logger.js`
```javascript
exports.info = (message) => {
  console.log(`info: ${message}`);
}

exports.error = (message) => {
  console.log(`error: ${message}`);
}
```

`index.js`
```javascript
const logger = require('./logger')

logger.info('this is info')
logger.error('this is error')
```

### Exporting a function

`logger.js`
```javascript
module.exports = (message) => {
  console.log(message);
}
```

`index.js`
```javascript
const logger = require('./logger')
logger('my message')
```

### Exporting a class

`logger.js`
```javascript
class Logger {
  info(message) {
    console.log(`info: ${message}`)
  }
  
  error(message) {
    console.log(`error: ${message}`)
  }
}

module.exports = Logger;
```

`index.js`
```javascript
const Logger = require('./logger')
const logger = new Logger();
logger.info('info');
```

### Exporting an instance

+ Зачастую это считается реализаций паттерна **singleton**, однако, подобная реализация не дает гарантии, что будет создан исключительно один экземпляр из-за алгоритма разрешения модулей (описан выше)

`logger.js`
```javascript
class Logger {
  ...
}

module.exports = new Logger();
```

`index.js`
```javascript
const logger = require('./logger')
logger.info()
```

### Monkey patching

+ Является очень плохой практикой

`pather.js`
```javascript
require('./logger').customMessage = () => { ... }
```

`index.js`
```javascript
require('./patcher')
const logger = require('./logger')
logger.customMessage('...')
```

# ES Modules

## Как использовать в проекте?

По умолчанию Node.js считает, что все файлы `.js` используют **CommonJS**, поэтому если попытаться использовать **ESM**, то Node.js выдаст ошибку

Следующим способами можно использовать **ESM** модули в проекте:
+ Использовать `.mjs`
+ В `package.json` прописать `"type": "module"` 

## Виды импортов/экспортов

Существуют следующие виды экспортов/импортов:
+ Named exports/import - именованные экспорты/импорты
+ Default exports/import - экспорты/импорты по умолчанию (лучше это вообще не переводить на русский)

## Named exports and imports

```javascript
// logger.js

export function log(msg) {
  console.log(msg);
}

export class Logger {
  // ...
}
```

```javascript
// index.js

import * from './logger.js' // Ошибка! Мы должны использовать 'as'
import * as loggerModule from './logger.js' // импорт всего модуля
import { log } from './logger.js' // иморт только одной функции
import { log as myLog } from './logger.js' // импорт одной функции и переименовывание ее
```

## Default exports and imports

```javascript
// logger.js

export default class Logger {
  // ...
}
```

```javascript
import MyLogger from './logger.js' // можем назвать класс как угодно

const logger = new MyLogger()
```

Мы также можем сделать так:

```javascript
import * as MyModule from './logger.js'

console.log(MyModule) // [Module] { default: [Function: Logger] }
```

Но мы не можем сделать так:

```javascript
import { default } from './logger.js' // Ошибка! Syntax Error: Unexpected reserved word
import { default as MyLogger} from './logger.js' // ок, но зачем???
```

**default** не может быть именем переменной

## Mixed Exports

Мы можем одновременно использовать default и named export/import

```javascript
// logger.js

export default class Logger { 
  // ... 
}

export function log() { 
  // ...
}
```

```javascript
// index.js
import MyLogger, { log } from './logger.js'
```

## named vs default

+ При named exports/imports IDE будет легче делать автоматические импорты, автокомплиты и рефакторинг. Например, мы пишим writeFile и IDE уже знает, что это метод из модуля fs и автоматически импортирует его `import { writeFile } from 'fs'`. С default imports/exports все гораздо сложнее
+ При default exports/imports пользователю не нужно знать какой конкретно метод импортировать, что делает использование модуля удобнее
+ При default exports/imports сложнее использовать [tree shaking](https://developer.mozilla.org/en-US/docs/Glossary/Tree_shaking) (dead code elimination) 

Книга Node.js Design Patterns советует использовать named exports, особенно если необходимо экспортировать несколько функциональностей, и использовать default exports только когда экспортируется одна функциональность