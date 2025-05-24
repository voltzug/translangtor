/* 
 Copyright (C) 2025  volodymyr-tsukanov  translangtor
 for the full copyright notice see the LICENSE file in the root of repository
*/
function clearTranslations(){
  const container = document.getElementById('container');
  container.innerHTML = '';
}

function drawTranslation(jsonData){
  const container = document.getElementById('container');
  try {
    const currentId = translations.length-1;

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
      outputDiv.innerHTML = '';
      renderJson(translations[currentId], outputDiv);
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
    wrapperDiv.append(actionsDiv);

    renderJson(jsonData, outputDiv);
    wrapperDiv.append(outputDiv);
    container.append(wrapperDiv);
  } catch (err) {
    alert("Invalid JSON file.");
    console.error(err);
  }
}