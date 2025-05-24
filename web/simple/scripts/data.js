/* 
 Copyright (C) 2025  volodymyr-tsukanov  translangtor
 for the full copyright notice see the LICENSE file in the root of repository
*/
const KEY_TRANS = 'trans';
const translations = [];
const translationNames = [];



function loadWork(){
  const transData = localStorage.getItem(KEY_TRANS);
  if(transData===null) return;
  const trans = JSON.parse(transData);
  translations.length = 0;
  translationNames.length = 0;
  clearTranslations();
  for (const key in trans) {
    const value = trans[key];
    translationNames.push(key);
    translations.push(value);
    drawTranslation(value);
  }
}

function saveWork(translationIndex){
  let transName = translationNames[translationIndex];
  if(transName===null){
    const inputName = prompt("Name this thanslation: ");
    if(inputName===null) return;
    transName = inputName;
  }
  const transData = JSON.parse(localStorage.getItem(KEY_TRANS)??'{}');
  transData[transName] = translations[translationIndex];
  localStorage.setItem(KEY_TRANS, JSON.stringify(transData));
}



function renderJson(obj, container) {
  for (const key in obj) {
    const value = obj[key];

    const wrapperDiv = document.createElement('div');
    wrapperDiv.className = 'trans-section';

    const label = document.createElement('input');
    label.value = key;
    label.className = 'trans-label';
    wrapperDiv.appendChild(label);

    if (typeof value === 'object' && value !== null) {
      const nestedDiv = document.createElement('div');
      nestedDiv.className = 'trans-obj';
      renderJson(value, nestedDiv);
      wrapperDiv.appendChild(nestedDiv);
    } else {
      const textarea = document.createElement('textarea');
      textarea.value = value;
      wrapperDiv.appendChild(textarea);
    }

    container.appendChild(wrapperDiv);
  }
}

function packJson(container) {
  const result = {};

  const sections = container.querySelectorAll(':scope > .trans-section');
  for (const section of sections) {
    const keyInput = section.querySelector(':scope > .trans-label');
    if (!keyInput) continue;

    const key = keyInput.value || keyInput.placeholder || 'unnamed';

    const objContainer = section.querySelector(':scope > .trans-obj');
    const textarea = section.querySelector(':scope > textarea');

    if (objContainer) {
      result[key] = packJson(objContainer);
    } else if (textarea) {
      result[key] = textarea.value;
    } else {
      result[key] = '';
    }
  }

  return result;
}