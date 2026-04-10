/*
 Copyright (C) 2026  voltzug  translangtor
 for the full copyright notice see the LICENSE file in the root of repository
*/
function loadTrans() {
  const fileInput = document.getElementById("transFile");
  const file = fileInput.files[0];
  if (!file) {
    return;
  }

  const reader = new FileReader();
  reader.onload = function (e) {
    let jsonData;
    try {
      jsonData = JSON.parse(e.target.result);
    } catch (err) {
      console.warn(err);
      alert("Invalid JSON file.");
      return;
    }

    if (!confirm("Replace current workspace with imported data?")) {
      fileInput.value = "";
      return;
    }

    loadWorkspaceData(jsonData);
    fileInput.value = "";
  };
  reader.readAsText(file);
}

function importWorkspace() {
  const fileInput = document.getElementById("workspaceFile");
  const file = fileInput.files[0];
  if (!file) {
    return;
  }

  const reader = new FileReader();
  reader.onload = function (e) {
    let jsonData;
    try {
      jsonData = JSON.parse(e.target.result);
    } catch (err) {
      console.warn(err);
      alert("Invalid JSON file.");
      return;
    }

    if (!confirm("Replace current workspace with imported data?")) {
      fileInput.value = "";
      return;
    }

    loadWorkspaceData(jsonData);
    fileInput.value = "";
  };
  reader.readAsText(file);
}

function exportCopyTrans(jsonData) {
  const jsonString = JSON.stringify(jsonData, null, 2);
  navigator.clipboard.writeText(jsonString).then(
    () => {
      alert("JSON copied!");
    },
    () => {
      alert("Failed to copy to clipboard.");
    },
  );
}

function exportDownloadTrans(jsonData) {
  const jsonString = JSON.stringify(jsonData, null, 2);
  const blob = new Blob([jsonString], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = "translangtor.json";
  document.body.appendChild(anchor);
  anchor.click();
  anchor.remove();
  URL.revokeObjectURL(url);
}
