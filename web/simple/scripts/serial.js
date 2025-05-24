/* 
 Copyright (C) 2025  volodymyr-tsukanov  translangtor
 for the full copyright notice see the LICENSE file in the root of repository
*/
function createActionButton(label){
  const actionButton = document.createElement('button');
  actionButton.className = 'trans-butt';
  actionButton.innerText = label;
  return actionButton;
}

function loadTrans() {
  const fileInput = document.getElementById('transFile');
  const file = fileInput.files[0];
  if (!file) {
    return;
  }

  const reader = new FileReader();
  reader.onload = function (e) {
    const jsonData = JSON.parse(e.target.result);
    translations.push(jsonData);
    translationNames.push(null);
    drawTranslation(jsonData);
  };
  reader.readAsText(file);
}

function exportCopyTrans(jsonData){
  const jsonString = JSON.stringify(jsonData, null, 2);
  navigator.clipboard.writeText(jsonString).then(() => {
    alert("JSON copied!");
  }, () => {
    alert("Failed to copy to clipboard.");
  });
}