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
  const radioId = `r-${newId()}`;
  const radioButton = document.createElement('input');
  radioButton.type = 'radio';
  radioButton.name = name;
  radioButton.id = radioId;
  wrapperDiv.appendChild(radioButton);
  const radioLabel = document.createElement('label');
  radioLabel.htmlFor = radioId;
  radioLabel.innerText = label;
  wrapperDiv.appendChild(radioLabel);
  return wrapperDiv;
}
function getRadioButtonIndex(name,defaultValue){
  const radioButtons = document.getElementsByName(name);
  for(let i=0; i<radioButtons.length; i++){
    if(radioButtons[i].checked) return i;
  }
  return defaultValue;
}

function createAppendButton(target){
  const appendButton = createSubactionButton("+");
  appendButton.style.marginTop = '-8px';
  appendButton.onclick = ()=>{
    const inputJsonString = prompt("Enter JSON to append: ");
    if(inputJsonString===null||inputJsonString.length<2) return;
    try{
      renderJson(JSON.parse(inputJsonString), target);
    } catch(err){
      console.warn(err);
      alert("Invalid JSON");
      return;
    }
  };
  return appendButton;
}



function renderJson(obj, container) {
  let c = 1;
  for (const key in obj) {
    const value = obj[key];

    const wrapperDiv = document.createElement('div');
    wrapperDiv.className = 'trans-section';

    const keyInput = document.createElement('input');
    keyInput.className = 'trans-key';
    keyInput.id = `t-l-${newId()}`;
    keyInput.value = key;
    const keyLabel = document.createElement('label');
    keyLabel.className = 'trans-label';
    keyLabel.htmlFor = keyInput.id;
    keyLabel.innerText = c++;
    wrapperDiv.appendChild(keyLabel);
    wrapperDiv.appendChild(keyInput);

    if (typeof value === 'object' && value !== null) {
      const nestedDiv = document.createElement('div');
      nestedDiv.className = 'trans-obj';
      renderJson(value, nestedDiv);
      wrapperDiv.appendChild(nestedDiv);

      wrapperDiv.appendChild(createAppendButton(nestedDiv));
    } else {
      const textarea = document.createElement('textarea');
      textarea.className = 'trans-value';
      textarea.id = `t-v-${newId()}`;
      if(value===null || value.length===0){
        textarea.style.backgroundColor = 'red';
      } else textarea.value = value;
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
    const keyInput = section.querySelector(':scope > .trans-key');
    if (!keyInput) continue;

    const key = keyInput.value.trim();
    if(!key) continue;

    const objContainer = section.querySelector(':scope > .trans-obj');
    const textarea = section.querySelector(':scope > .trans-value');

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

function drawTranslation(jsonData,index, container){
  try {
    const currentId = index??translations.length-1;

    const outputDiv = document.createElement('div');
    outputDiv.id = `t-c-${currentId}`;
    const titleInput = document.createElement('input');
    titleInput.className = 'trans-title';
    titleInput.id = `t-t-${currentId}`;
    titleInput.value = translationNames[currentId]??'';
    titleInput.placeholder = "Title";
    titleInput.onchange = (e)=>{
      const title = e.target.value.trim();
      if(title.length>0){
        translationNames[currentId] = title;
      }
    };
    container.appendChild(titleInput);
    const actionsDiv = document.createElement('div');
    actionsDiv.className = 'trans-actions';
    const revertButton = createActionButton("Revert");
    revertButton.onclick = ()=>{
      container.innerHTML = '';
      drawTranslation(translations[currentId],currentId, container);
    };
    actionsDiv.appendChild(revertButton);
    const exportButton = createActionButton("Copy to Clipboard");
    exportButton.onclick = ()=>{
      const jsonData = packJson(outputDiv);
      exportCopyTrans(jsonData);
    };
    actionsDiv.appendChild(exportButton);
    const saveButton = createActionButton("Save");
    saveButton.onclick = ()=>{
      translations[currentId] = packJson(outputDiv);
      saveWork(currentId);
    };
    actionsDiv.appendChild(saveButton);
    const syncSourceRadio = createRadioButton(NAME_RADIO_SYNCsOURCE,"Sync source");
    //if(currentId===syncSourceIndex) syncSourceRadio.click();
    actionsDiv.appendChild(syncSourceRadio);
    container.appendChild(actionsDiv);

    renderJson(jsonData, outputDiv);
    container.appendChild(outputDiv);

    const appendButton = createAppendButton(outputDiv);
    appendButton.innerText = 'Append';
    appendButton.style.fontSize = 'large';
    container.appendChild(appendButton);
  } catch (err) {
    alert("Invalid JSON file.");
    console.error(err);
  }
}
function createNewTranslation(jsonData){
  const container = document.getElementById('container');
  const currentId = translations.length-1;
  const wrapperDiv = document.createElement('div');
  wrapperDiv.className = 'planet';
  wrapperDiv.id = `t-${currentId}`;
  drawTranslation(jsonData,currentId, wrapperDiv);
  container.appendChild(wrapperDiv);
}