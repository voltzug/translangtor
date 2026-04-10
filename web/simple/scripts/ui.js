/*
 Copyright (C) 2026  voltzug  translangtor
 for the full copyright notice see the LICENSE file in the root of repository
*/
const NAME_RADIO_SYNCsOURCE = "t-r-syncSource";
const NAME_APPEND_TYPE = "t-append-type";
const NAME_APPEND_MODE = "t-append-mode";

function isLiveSyncActive() {
  return syncLiveEnabled && getRadioButtonIndex(NAME_RADIO_SYNCsOURCE, -1) !== -1;
}

function getSyncSourceIndex() {
  return getRadioButtonIndex(NAME_RADIO_SYNCsOURCE, -1);
}

function restoreSyncSourceSelection() {
  if (!syncLiveEnabled) return;
  const selectedIndex = syncSourceIndex >= 0 ? syncSourceIndex : getSyncSourceIndex();
  if (selectedIndex < 0) return;
  const radioButtons = document.getElementsByName(NAME_RADIO_SYNCsOURCE);
  if (radioButtons[selectedIndex]) {
    radioButtons[selectedIndex].checked = true;
  }
  syncSourceIndex = selectedIndex;
}



function getSyncSourceContainer() {
  const syncSourceIndex = getSyncSourceIndex();
  if (syncSourceIndex < 0) return null;
  return document.getElementById(`t-c-${syncSourceIndex}`);
}

function ensureSyncSourceSelected() {
  if (!syncLiveEnabled) return -1;
  const syncIndex = getSyncSourceIndex();
  if (syncIndex < 0) {
    syncLiveEnabled = false;
    const button = document.getElementById("syncLiveButton");
    if (button) button.innerText = "Sync: OFF";
    return -1;
  }

  syncSourceIndex = syncIndex;
  restoreSyncSourceSelection();
  return syncIndex;
}

function getSyncGroupContainers() {
  return Array.from(document.querySelectorAll(".planet"));
}

function syncGroupLayout() {
  const groups = [
    document.getElementById("importExportGroup"),
    document.getElementById("syncGroup"),
  ].filter(Boolean);

  if (!groups.length) return;

  let maxHeight = 0;
  groups.forEach((group) => {
    group.style.minHeight = "0px";
    maxHeight = Math.max(maxHeight, group.scrollHeight);
  });
  // groups.forEach((group) => {
  //   group.style.minHeight = `${maxHeight}px`;
  // });
}

function refreshLiveSync() {
  if (!isLiveSyncActive()) return;

  const syncIndex = ensureSyncSourceSelected();
  if (syncIndex < 0) return;

  const sourceContainer = document.getElementById(`t-c-${syncIndex}`);
  if (!sourceContainer) return;

  const sourceData = packJson(sourceContainer);
  translations[syncIndex] = sourceData;

  for (let index = 0; index < translations.length; index++) {
    if (index === syncIndex) continue;

    const targetContainer = document.getElementById(`t-c-${index}`);
    if (!targetContainer) continue;

    const synced = syncJsonStructure(packJson(targetContainer), sourceData);
    translations[index] = synced;

    const planet = document.getElementById(`t-${index}`);
    if (!planet) continue;

    planet.innerHTML = "";
    drawTranslation(synced, index, planet);
  }

  restoreSyncSourceSelection();
  syncTranslationLayout();
}

function createActionButton(label) {
  const actionButton = document.createElement("button");
  actionButton.className = "trans-butt";
  actionButton.innerText = label;
  return actionButton;
}

function createSubactionButton(label) {
  const subactionButton = document.createElement("button");
  subactionButton.className = "trans-subaction";
  subactionButton.innerText = label;
  return subactionButton;
}

function createRadioButton(name, label) {
  const wrapperDiv = document.createElement("div");
  const radioId = `r-${newId()}`;
  const radioButton = document.createElement("input");
  radioButton.type = "radio";
  radioButton.name = name;
  radioButton.id = radioId;
  wrapperDiv.appendChild(radioButton);
  const radioLabel = document.createElement("label");
  radioLabel.htmlFor = radioId;
  radioLabel.innerText = label;
  wrapperDiv.appendChild(radioLabel);
  return wrapperDiv;
}
function getRadioButtonIndex(name, defaultValue) {
  const radioButtons = document.getElementsByName(name);
  for (let i = 0; i < radioButtons.length; i++) {
    if (radioButtons[i].checked) return i;
  }
  return defaultValue;
}

function closeActiveModal() {
  const overlay = document.getElementById("dialogBackdrop");
  if (overlay) overlay.classList.remove("open");
  const body = document.getElementById("dialogBody");
  if (body) body.innerHTML = "";
  const actions = document.getElementById("dialogActions");
  if (actions) actions.innerHTML = "";
}

function openDialog(title, contentBuilder, actionsBuilder) {
  const overlay = document.getElementById("dialogBackdrop");
  const titleNode = document.getElementById("dialogTitle");
  const body = document.getElementById("dialogBody");
  const actions = document.getElementById("dialogActions");

  if (!overlay || !titleNode || !body || !actions) return;

  titleNode.innerText = title;
  body.innerHTML = "";
  actions.innerHTML = "";
  contentBuilder(body);
  actionsBuilder(actions);
  overlay.classList.add("open");
}

function toggleSyncLive(button) {
  syncLiveEnabled = !syncLiveEnabled;
  if (button) {
    button.innerText = syncLiveEnabled ? "Sync: ON" : "Sync: OFF";
  }
  if (syncLiveEnabled) {
    ensureSyncSourceSelected();
    refreshLiveSync();
  }
}

function openAppendModal(target) {
  openDialog(
    "Append element",
    (body) => {
      const keyLabel = document.createElement("label");
      keyLabel.innerText = "Key";
      const keyInput = document.createElement("input");
      keyInput.type = "text";
      keyInput.className = "trans-modal-input";
      keyInput.placeholder = "new_key";

      const typeLabel = document.createElement("label");
      typeLabel.innerText = "Type";
      const typeRow = document.createElement("div");
      typeRow.className = "trans-modal-row";

      const textId = `append-type-text-${newId()}`;
      const objectId = `append-type-object-${newId()}`;

      const textRadio = document.createElement("input");
      textRadio.type = "radio";
      textRadio.name = NAME_APPEND_TYPE;
      textRadio.id = textId;
      textRadio.checked = true;
      const textRadioLabel = document.createElement("label");
      textRadioLabel.htmlFor = textId;
      textRadioLabel.innerText = "Text";

      const objectRadio = document.createElement("input");
      objectRadio.type = "radio";
      objectRadio.name = NAME_APPEND_TYPE;
      objectRadio.id = objectId;
      const objectRadioLabel = document.createElement("label");
      objectRadioLabel.htmlFor = objectId;
      objectRadioLabel.innerText = "Object";

      typeRow.appendChild(textRadio);
      typeRow.appendChild(textRadioLabel);
      typeRow.appendChild(objectRadio);
      typeRow.appendChild(objectRadioLabel);

      const modeLabel = document.createElement("label");
      modeLabel.innerText = "Input mode";
      const modeRow = document.createElement("div");
      modeRow.className = "trans-modal-row";
      const manualJsonId = `append-mode-manual-${newId()}`;
      const simpleId = `append-mode-simple-${newId()}`;

      const simpleRadio = document.createElement("input");
      simpleRadio.type = "radio";
      simpleRadio.name = NAME_APPEND_MODE;
      simpleRadio.id = simpleId;
      simpleRadio.checked = true;
      const simpleRadioLabel = document.createElement("label");
      simpleRadioLabel.htmlFor = simpleId;
      simpleRadioLabel.innerText = "Simple";

      const manualRadio = document.createElement("input");
      manualRadio.type = "radio";
      manualRadio.name = NAME_APPEND_MODE;
      manualRadio.id = manualJsonId;
      const manualRadioLabel = document.createElement("label");
      manualRadioLabel.htmlFor = manualJsonId;
      manualRadioLabel.innerText = "Manual JSON";

      modeRow.appendChild(simpleRadio);
      modeRow.appendChild(simpleRadioLabel);
      modeRow.appendChild(manualRadio);
      modeRow.appendChild(manualRadioLabel);

      const valueLabel = document.createElement("label");
      valueLabel.innerText = "Value / JSON";
      const valueInput = document.createElement("textarea");
      valueInput.className = "trans-modal-textarea";
      valueInput.placeholder = "Value for text type, or JSON for manual mode";

      body.appendChild(keyLabel);
      body.appendChild(keyInput);
      body.appendChild(typeLabel);
      body.appendChild(typeRow);
      body.appendChild(modeLabel);
      body.appendChild(modeRow);
      body.appendChild(valueLabel);
      body.appendChild(valueInput);

      keyInput.focus();
    },
    (actions) => {
      const cancelButton = createSubactionButton("Cancel");
      cancelButton.onclick = closeActiveModal;

      const createButton = createActionButton("Append");
      createButton.onclick = () => {
        const body = document.getElementById("dialogBody");
        const keyInput = body?.querySelector(".trans-modal-input");
        const valueInput = body?.querySelector(".trans-modal-textarea");
        if (!keyInput || !valueInput) return;

        const key = keyInput.value.trim();
        if (!key) {
          alert("Key required");
          return;
        }

        const type = document
          .querySelector(`input[name="${NAME_APPEND_TYPE}"]:checked`)
          ?.id?.includes("object")
          ? "object"
          : "text";
        const manualMode = document
          .querySelector(`input[name="${NAME_APPEND_MODE}"]:checked`)
          ?.id?.includes("manual");

        let value = "";
        if (manualMode) {
          try {
            value = JSON.parse(valueInput.value);
          } catch (err) {
            console.warn(err);
            alert("Invalid JSON");
            return;
          }
        } else if (type === "object") {
          value = {};
        } else {
          value = valueInput.value;
        }

        appendTranslationItem(target, key, value);
        closeActiveModal();
        refreshLiveSync();
        restoreSyncSourceSelection();
      };

      actions.appendChild(cancelButton);
      actions.appendChild(createButton);
    },
  );
}

function createAppendButton(target) {
  const appendButton = createSubactionButton("+");
  appendButton.style.marginTop = "-8px";
  appendButton.onclick = () => {
    openAppendModal(target);
  };
  return appendButton;
}

function appendTranslationItem(container, key, value) {
  renderJson({ [key]: value }, container);
  renumberSections(container);
  maybeLiveSyncTranslations();
  restoreSyncSourceSelection();
}

function renderJson(obj, container, insertBeforeNode = null) {
  let c = 1;
  for (const key in obj) {
    const value = obj[key];

    const wrapperDiv = document.createElement("div");
    wrapperDiv.className = "trans-section";

    const keyInput = document.createElement("input");
    keyInput.className = "trans-key";
    keyInput.id = `t-l-${newId()}`;
    keyInput.value = key;
    const keyLabel = document.createElement("label");
    keyLabel.className = "trans-label";
    keyLabel.htmlFor = keyInput.id;
    keyLabel.innerText = c++;
    keyLabel.onclick = () => promptReorderSection(wrapperDiv);
    wrapperDiv.appendChild(keyLabel);
    wrapperDiv.appendChild(keyInput);

    if (typeof value === "object" && value !== null) {
      const nestedDiv = document.createElement("div");
      nestedDiv.className = "trans-obj";
      renderJson(value, nestedDiv);
      wrapperDiv.appendChild(nestedDiv);

      wrapperDiv.appendChild(createAppendButton(nestedDiv));
    } else {
      const textarea = document.createElement("textarea");
      textarea.className = "trans-value";
      textarea.id = `t-v-${newId()}`;
      if (value === null || value.length === 0) {
        textarea.style.backgroundColor = "red";
      } else textarea.value = value;
      wrapperDiv.appendChild(textarea);
      const removeButton = createSubactionButton("Remove");
      removeButton.onclick = () => {
        if (confirm(`Remove ${key}?`) == true) {
          wrapperDiv.remove();
          maybeLiveSyncTranslations();
        }
      };
      wrapperDiv.append(removeButton);
    }

    if (insertBeforeNode && insertBeforeNode.parentNode === container) {
      container.insertBefore(wrapperDiv, insertBeforeNode);
    } else {
      container.appendChild(wrapperDiv);
    }
  }
}

function promptReorderSection(section) {
  const parent = section.parentElement;
  if (!parent) return;

  const sections = Array.from(
    parent.querySelectorAll(":scope > .trans-section"),
  );
  const total = sections.length;
  const currentIndex = sections.indexOf(section) + 1;
  const input = prompt(
    `Move item to position 1-${total}:`,
    String(currentIndex),
  );
  if (input === null) return;

  const nextIndex = Number.parseInt(input, 10);
  if (!Number.isInteger(nextIndex) || nextIndex < 1) {
    alert("Position must be unsigned 1-based number");
    return;
  }

  const targetIndex = Math.min(nextIndex, total);
  const movingIndex = sections.indexOf(section);
  if (movingIndex === -1 || movingIndex + 1 === targetIndex) return;

  sections.splice(movingIndex, 1);
  sections.splice(targetIndex - 1, 0, section);

  parent.innerHTML = "";
  for (const item of sections) {
    parent.appendChild(item);
  }
  renumberSections(parent);
  maybeLiveSyncTranslations();
  restoreSyncSourceSelection();
}

function renumberSections(container) {
  const sections = container.querySelectorAll(":scope > .trans-section");
  let index = 1;
  for (const section of sections) {
    const label = section.querySelector(":scope > .trans-label");
    if (label) label.innerText = index++;
  }
}

function syncTranslationLayout() {
  const cards = document.querySelectorAll(".planet");
  let maxHeight = 0;
  cards.forEach((card) => {
    card.style.minHeight = "0px";
    maxHeight = Math.max(maxHeight, card.scrollHeight);
  });
  // cards.forEach((card) => {
  //   card.style.minHeight = `${maxHeight}px`;
  // });
}

function packJson(container) {
  const result = {};

  const sections = container.querySelectorAll(":scope > .trans-section");
  for (const section of sections) {
    const keyInput = section.querySelector(":scope > .trans-key");
    if (!keyInput) continue;

    const key = keyInput.value.trim();
    if (!key) continue;

    const objContainer = section.querySelector(":scope > .trans-obj");
    const textarea = section.querySelector(":scope > .trans-value");

    if (objContainer) {
      result[key] = packJson(objContainer);
    } else if (textarea) {
      result[key] = textarea.value;
    } else {
      result[key] = "";
    }
  }

  return result;
}

function clearTranslations() {
  const container = document.getElementById("container");
  container.innerHTML = "";
  closeActiveModal();
}

function drawTranslation(jsonData, index, container) {
  try {
    const currentId = index ?? translations.length - 1;

    const outputDiv = document.createElement("div");
    outputDiv.id = `t-c-${currentId}`;
    outputDiv.className = "trans-output";
    outputDiv.dataset.original = JSON.stringify(jsonData);
    const titleInput = document.createElement("input");
    titleInput.className = "trans-title";
    titleInput.id = `t-t-${currentId}`;
    titleInput.value = translationNames[currentId] ?? "";
    titleInput.placeholder = "Title";
    titleInput.onchange = (e) => {
      const title = e.target.value.trim();
      if (title.length > 0) {
        translationNames[currentId] = title;
      }
    };
    container.appendChild(titleInput);
    const deleteButton = document.createElement("button");
    deleteButton.className = "trans-delete";
    deleteButton.id = `t-d-${currentId}`;
    deleteButton.innerText = "X";
    deleteButton.onclick = () => {
      const confirmation = translationNames[currentId] ?? "delete";
      const inputConfirm = prompt(
        `Confirm translation deletion by typing '${confirmation}': `,
      );
      if (inputConfirm === confirmation) {
        outputDiv.innerHTML = "";
        container.className = "";
        container.innerHTML = "";
        delete translations[currentId];
        delete translationNames[currentId];
        maybeLiveSyncTranslations();
      }
    };
    container.appendChild(deleteButton);
    const actionsDiv = document.createElement("div");
    actionsDiv.className = "trans-actions";
    const revertButton = createActionButton("Revert");
    revertButton.onclick = () => {
      const original = JSON.parse(outputDiv.dataset.original ?? "{}");
      container.innerHTML = "";
      drawTranslation(original, currentId, container);
      translations[currentId] = original;
      maybeLiveSyncTranslations();
      restoreSyncSourceSelection();
    };
    actionsDiv.appendChild(revertButton);
    const exportButton = createActionButton("Copy to Clipboard");
    exportButton.onclick = () => {
      const jsonData = packJson(outputDiv);
      exportCopyTrans(jsonData);
    };
    actionsDiv.appendChild(exportButton);
    const saveButton = createActionButton("Save");
    saveButton.onclick = () => {
      translations[currentId] = packJson(outputDiv);
      saveSingleTranslation(currentId);
    };
    actionsDiv.appendChild(saveButton);
    const syncSourceRadio = createRadioButton(
      NAME_RADIO_SYNCsOURCE,
      "Sync source",
    );
    syncSourceRadio.querySelector("input").onchange = () => {
      syncSourceIndex = currentId;
      if (syncLiveEnabled) {
        ensureSyncSourceSelected();
        refreshLiveSync();
      }
      syncGroupLayout();
    };
    actionsDiv.appendChild(syncSourceRadio);
    container.appendChild(actionsDiv);

    renderJson(jsonData, outputDiv);
    container.appendChild(outputDiv);

    requestAnimationFrame(() => {
      syncTranslationLayout();
      syncGroupLayout();
      restoreSyncSourceSelection();
    });

    const appendButton = createAppendButton(outputDiv);
    appendButton.innerText = "Append";
    appendButton.style.fontSize = "large";
    container.appendChild(appendButton);
  } catch (err) {
    alert("Invalid JSON file.");
    console.error(err);
  }
}
function createNewTranslation(jsonData) {
  const container = document.getElementById("container");
  const currentId = translations.length - 1;
  const wrapperDiv = document.createElement("div");
  wrapperDiv.className = "planet";
  wrapperDiv.id = `t-${currentId}`;
  drawTranslation(jsonData, currentId, wrapperDiv);
  container.appendChild(wrapperDiv);
  requestAnimationFrame(() => {
    syncTranslationLayout();
    syncGroupLayout();
    restoreSyncSourceSelection();
  });
}
