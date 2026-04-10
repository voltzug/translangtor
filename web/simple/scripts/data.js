/*
 Copyright (C) 2026  voltzug  translangtor
 for the full copyright notice see the LICENSE file in the root of repository
*/
const KEY_TRANS = "trans";
const translations = [];
const translationNames = [];
let syncLiveEnabled = false;
let syncSourceIndex = -1;
let _idCounter = 0;
function newId() {
  return _idCounter++;
}

function getSyncSourceTranslationIndex() {
  const selectedIndex = getRadioButtonIndex(NAME_RADIO_SYNCsOURCE, -1);
  return selectedIndex >= 0 ? selectedIndex : syncSourceIndex;
}

function getSyncSourceTranslation() {
  const index = getSyncSourceTranslationIndex();
  if (index < 0 || index >= translations.length) return null;
  syncSourceIndex = index;
  return translations[index];
}

function setSyncLiveState(enabled) {
  syncLiveEnabled = Boolean(enabled);
  const button = document.getElementById("syncLiveButton");
  if (button) {
    button.innerText = syncLiveEnabled ? "Sync: ON" : "Sync: OFF";
  }
}

function isSyncLiveEnabled() {
  return syncLiveEnabled;
}

function syncLiveShouldRun() {
  return syncLiveEnabled && getSyncSourceTranslationIndex() !== -1;
}

function clearWorkspaceState() {
  translations.length = 0;
  translationNames.length = 0;
  syncSourceIndex = -1;
  setSyncLiveState(false);
  _idCounter = 0;
}

function normalizeTranslationData(raw) {
  if (raw && typeof raw === "object" && !Array.isArray(raw)) return raw;
  return {};
}

function loadWorkspaceData(transData) {
  const trans = normalizeTranslationData(transData);
  clearWorkspaceState();
  clearTranslations();
  for (const key in trans) {
    translationNames.push(key);
    translations.push(trans[key]);
    createNewTranslation(trans[key]);
  }
}

function loadWork() {
  const transData = localStorage.getItem(KEY_TRANS);
  if (transData === null) return;
  loadWorkspaceData(JSON.parse(transData));
}

function saveTranslations(transData) {
  localStorage.setItem(KEY_TRANS, JSON.stringify(transData));
}

function loadSavedTranslations() {
  return JSON.parse(localStorage.getItem(KEY_TRANS) ?? "{}");
}

function saveSingleTranslation(translationIndex, fallbackName) {
  let transName = translationNames[translationIndex];
  if (!transName) {
    if (fallbackName) {
      transName = fallbackName;
    } else {
      const inputName = prompt("Name this thanslation: ");
      if (!inputName) return;
      transName = inputName;
    }
  }
  const transData = loadSavedTranslations();
  transData[transName] = translations[translationIndex];
  saveTranslations(transData);
}

function saveAllWork() {
  const transData = {};
  for (let i = 0; i < translationNames.length; i++) {
    const key = translationNames[i] ?? `t${i}`;
    const element = document.getElementById(`t-c-${i}`);
    if (element === null) continue;
    translations[i] = packJson(element);
    transData[key] = translations[i];
  }
  saveTranslations(transData);
}

function getSyncSourceTranslation() {
  const index = getSyncSourceTranslationIndex();
  if (index < 0 || index >= translations.length) return null;
  syncSourceIndex = index;
  return translations[index];
}

function syncAllTranslationsFromSource() {
  const source = getSyncSourceTranslation();
  if (!source) return;
  for (let index = 0; index < translations.length; index++) {
    if (index === syncSourceIndex) continue;
    const targetContainer = document.getElementById(`t-${index}`);
    if (!targetContainer) continue;
    const sync = syncJsonStructure(translations[index], source);
    translations[index] = sync;
    targetContainer.innerHTML = "";
    drawTranslation(sync, index, targetContainer);
  }
  requestAnimationFrame(syncTranslationLayout);
}

function maybeLiveSyncTranslations() {
  if (!syncLiveShouldRun()) return;
  syncAllTranslationsFromSource();
}

function syncJsonStructure(target, source) {
  const sync = {};

  for (const key in source) {
    if (typeof source[key] === "object" && source[key] !== null) {
      const targetValue = target[key] ?? "";
      sync[key] = syncJsonStructure(targetValue, source[key]);
    } else {
      sync[key] = target[key] ?? "";
    }
  }
  return sync;
}

function syncWithSource() {
  if (translations.length < 2) {
    alert("Too few translations to sync");
    return;
  }
  syncSourceIndex = getRadioButtonIndex(NAME_RADIO_SYNCsOURCE, -1);
  if (syncSourceIndex === -1) {
    alert("Select sync source firstly");
    return;
  }

  syncAllTranslationsFromSource();
}

function clearTranslations() {
  const container = document.getElementById("container");
  container.innerHTML = "";
  closeActiveModal();
}

function clearWorkspace() {
  clearWorkspaceState();
  clearTranslations();
}

function importWorkspaceData(transData) {
  if (!confirm("Replace current workspace with imported JSON?")) return;
  loadWorkspaceData(transData);
}

function exportWorkspaceData() {
  const transData = {};
  for (let i = 0; i < translationNames.length; i++) {
    const element = document.getElementById(`t-c-${i}`);
    if (element === null) continue;
    transData[translationNames[i] ?? `t${i}`] = packJson(element);
  }
  return transData;
}

function removeTranslationSection(section) {
  if (!section) return;
  section.remove();
  maybeLiveSyncTranslations();
}

function moveTranslationSection(section, targetIndex) {
  if (!section) return;
  const parent = section.parentElement;
  if (!parent) return;

  const sections = Array.from(parent.querySelectorAll(":scope > .trans-section"));
  const movingIndex = sections.indexOf(section);
  if (movingIndex === -1) return;

  const clampedIndex = Math.max(1, Math.min(targetIndex, sections.length));
  if (movingIndex + 1 === clampedIndex) return;

  sections.splice(movingIndex, 1);
  sections.splice(clampedIndex - 1, 0, section);

  parent.innerHTML = "";
  for (const item of sections) parent.appendChild(item);
  renumberSections(parent);
  maybeLiveSyncTranslations();
}
