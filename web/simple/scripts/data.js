/* 
 Copyright (C) 2025  volodymyr-tsukanov  translangtor
 for the full copyright notice see the LICENSE file in the root of repository
*/
const KEY_TRANS = 'trans';
const translations = [];
const translationNames = [];
let syncSourceIndex = -1;



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




function syncJsonStructure(target,source){
  const sync = {};

  for(const key in source){
    if(typeof source[key]==='object' && source[key]!==null){
      const targetValue = target[key]??source[key];
      sync[key] = syncJsonStructure(targetValue, source[key]);
    } else {
      sync[key] = target[key]??'';
    }
  }
  return sync;
}

function syncWithSource(){
  if(translations.length<2){
    alert("Too few translations to sync");
    return;
  }
  syncSourceIndex = getRadioButtonIndex(NAME_RADIO_SYNCsOURCE,-1);
  if(syncSourceIndex===-1){
    alert("Select sync source firstly");
    return;
  }

  const syncSource = translations[syncSourceIndex];
  clearTranslations();
  for(let index=0; index<translations.length; index++){
    if(index===syncSourceIndex){
      drawTranslation(syncSource,index);
      continue;
    }
    const sync = syncJsonStructure(translations[index],syncSource);
    translations[index] = sync;
    drawTranslation(sync,index);
  }
  alert("Synced");
}