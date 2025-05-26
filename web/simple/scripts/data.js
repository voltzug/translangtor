/* 
 Copyright (C) 2025  volodymyr-tsukanov  translangtor
 for the full copyright notice see the LICENSE file in the root of repository
*/
const KEY_TRANS = 'trans';
const translations = [];
const translationNames = [];
let syncSourceIndex = -1;
let _idCounter = 0;
function newId(){ return _idCounter++; }



function loadWork(){
  const transData = localStorage.getItem(KEY_TRANS);
  if(transData===null) return;
  const trans = JSON.parse(transData);
  if(translations.length>0){
    translations.forEach((value)=>{delete value});
    console.log(translations.length);
    translations.length = 0;
    translationNames.length = 0;
  }
  clearTranslations();
  for (const key in trans) {
    const value = trans[key];
    translationNames.push(key);
    translations.push(value);
    createNewTranslation(value);
  }
}

function saveTranslations(transData){
  localStorage.setItem(KEY_TRANS, JSON.stringify(transData));
}
function _clearLoadedTranslations(transData){
  for(const key in transData){
    if(!key in translationNames){
      delete transData[key];
    }
  }
}
function loadSavedTranslations(){
  const transData = JSON.parse(localStorage.getItem(KEY_TRANS)??'{}');
  _clearLoadedTranslations(transData);
  return transData;
}
function saveSingleTranslation(translationIndex,fallbackName){
  let transName = translationNames[translationIndex];
  if(!transName){
    if(fallbackName){
      transName = fallbackName;
    } else{
      const inputName = prompt("Name this thanslation: ");
      if(!inputName) return;
      transName = inputName;
    }
  }
  const transData = loadSavedTranslations();
  transData[transName] = translations[translationIndex];
  saveTranslations(transData);
}

function saveAllWork(){
  const transData = {};
  translations.length = 0;
  for(let i=0; i<translationNames.length; i++){
    const key = translationNames[i]??`t${i}`;
    const element = document.getElementById(`t-c-${i}`);
    if(element===null) continue;
    translations.push(packJson(element));
    transData[key] = translations[i];
  }
  saveTranslations(transData);
}




function syncJsonStructure(target,source){
  const sync = {};

  for(const key in source){
    if(typeof source[key]==='object' && source[key]!==null){
      const targetValue = target[key]??'';
      sync[key] = syncJsonStructure(targetValue, source[key]);
    } else {
      sync[key] = target[key]??'';
    }
  }
  delete target;
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
  for(let index=0; index<translations.length; index++){
    const targetContainer = document.getElementById(`t-${index}`);
    targetContainer.innerHTML = '';
    if(index===syncSourceIndex){
      drawTranslation(syncSource,index, targetContainer);
      continue;
    }
    const sync = syncJsonStructure(translations[index],syncSource);
    translations[index] = sync;
    drawTranslation(sync,index, targetContainer);
  }
  alert("Synced");
}
