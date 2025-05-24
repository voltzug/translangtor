/* 
 Copyright (C) 2025  volodymyr-tsukanov  translangtor
 for the full copyright notice see the LICENSE file in the root of repository
*/
const NAME_RADIO_SYNCsOURCE = 't-r-syncSource';



function createActionButton(label){
  const actionButton = document.createElement('button');
  actionButton.className = 'trans-butt';
  actionButton.innerText = label;
  return actionButton;
}

function createSubactionButton(label){
  const subactionButton = document.createElement('button');
  subactionButton.className = 'trans-subaction';
  subactionButton.innerText = label;
  return subactionButton;
}

function createRadioButton(name,label){
  const wrapperDiv = document.createElement('div');
  const radioId = `r-${Date.now()}`;
  const radioButton = document.createElement('input');
  radioButton.type = 'radio';
  radioButton.name = name;
  radioButton.id = radioId;
  wrapperDiv.append(radioButton);
  const radioLabel = document.createElement('label');
  radioLabel.htmlFor = radioId;
  radioLabel.innerText = label;
  wrapperDiv.append(radioLabel);
  return wrapperDiv;
}
function getRadioButtonIndex(name,defaultValue){
  const radioButtons = document.getElementsByName(name);
  for(let i=0; i<radioButtons.length; i++){
    if(radioButtons[i].checked) return i;
  }
  return defaultValue;
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
      const removeButton = createSubactionButton("Remove");
      removeButton.onclick = ()=>{
        if(confirm(`Remove ${key}?`)==true){
          wrapperDiv.innerHTML = '';
        }
      };
      wrapperDiv.append(removeButton);
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



function clearTranslations(){
  const container = document.getElementById('container');
  container.innerHTML = '';
}

function drawTranslation(jsonData,index){
  const container = document.getElementById('container');
  try {
    const currentId = index??translations.length-1;

    const wrapperDiv = document.createElement('div');
    wrapperDiv.className = 'planet';
    const outputDiv = document.createElement('div');
    outputDiv.id = `t-${currentId}`;
    const titleInput = document.createElement('input');
    titleInput.className = 'trans-title';
    titleInput.value = translationNames[currentId]??'';
    titleInput.placeholder = "Title";
    titleInput.onchange = (e)=>{
      const title = e.target.value;
      if(title.length>0){
        translationNames[currentId] = title;
      }
    };
    wrapperDiv.append(titleInput);
    const actionsDiv = document.createElement('div');
    actionsDiv.className = 'trans-actions';
    const revertButton = createActionButton("Revert");
    revertButton.onclick = ()=>{

    };
    actionsDiv.append(revertButton);
    const exportButton = createActionButton("Copy to Clipboard");
    exportButton.onclick = ()=>{
      const jsonData = packJson(outputDiv);
      exportCopyTrans(jsonData);
    };
    actionsDiv.append(exportButton);
    const saveButton = createActionButton("Save");
    saveButton.onclick = ()=>{
      translations[currentId] = packJson(outputDiv);
      saveWork(currentId);
    };
    actionsDiv.append(saveButton);
    const syncSourceRadio = createRadioButton(NAME_RADIO_SYNCsOURCE,"Sync source");
    //if(currentId===syncSourceIndex) syncSourceRadio.click();
    actionsDiv.append(syncSourceRadio);
    wrapperDiv.append(actionsDiv);

    renderJson(jsonData, outputDiv);
    wrapperDiv.append(outputDiv);
    container.append(wrapperDiv);
  } catch (err) {
    alert("Invalid JSON file.");
    console.error(err);
  }
}