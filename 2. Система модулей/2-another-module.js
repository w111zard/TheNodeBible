function publicFunction() {
  console.log('This is a public function!');
}

function privateFunction() {
  console.log('This is a private function!')
}

/*
  Здесь у нас есть доступ к myModule, т.к этот код
  при вызове будет обернут в IIFE функцию с параметрами
  myModule и myRequire
 */
myModule.exports = { publicFunction };