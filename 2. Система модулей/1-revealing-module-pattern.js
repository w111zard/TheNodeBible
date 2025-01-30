/*
  Этот паттерн использует механизм скопов
  Мы не можем обратиться к переменным myModule из вне
  myModule возвращает объекты, которые будут доступны из вне
 */

// IIFE
const myModule = (() => {
  const privateFunction = () => {};
  const publicFunction = () => {};

  const privateVariable = 'I am a private';
  const publicVariable = 'I am a public';

  // Данные, которые будут доступны
  const toExport = {
    publicFunction,
    publicVariable,
  }

  return toExport;
})()

myModule.publicFunction();

const data = myModule.publicVariable;
