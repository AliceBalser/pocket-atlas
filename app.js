const STORAGE_KEY = "pocket-atlas-lists-v1";

const pages = {
  home: document.getElementById("page-home"),
  lists: document.getElementById("page-lists"),
  note: document.getElementById("page-note")
};

const navButtons = document.querySelectorAll("[data-target]");
const listForm = document.getElementById("list-form");
const listTitleInput = document.getElementById("list-title-input");
const listList = document.getElementById("list-list");
const listStats = document.getElementById("list-stats");
const listEmpty = document.getElementById("list-empty");
const noteEditor = document.getElementById("note-editor");
const textToggle = document.getElementById("text-toggle");
const textBold = document.getElementById("text-bold");
const insertSquare = document.getElementById("insert-square");
const insertCircle = document.getElementById("insert-circle");
const installButton = document.getElementById("install-btn");
const installHint = document.getElementById("install-hint");

let deferredInstallPrompt = null;
let lists = loadLists();
let currentListId = null;

function loadLists() {
  const raw = localStorage.getItem(STORAGE_KEY);
  if (!raw) return [];
  try {
    return JSON.parse(raw);
  } catch (error) {
    console.warn("Failed to parse lists", error);
    return [];
  }
}

function saveLists() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(lists));
}

function formatUpdated(timestamp) {
  if (!timestamp) return "Never";
  return new Date(timestamp).toLocaleDateString();
}

function renderLists() {
  listList.innerHTML = "";

  if (lists.length === 0) {
    listEmpty.hidden = false;
  } else {
    listEmpty.hidden = true;
  }

  listStats.textContent = `${lists.length} list${lists.length === 1 ? "" : "s"}`;

  lists.forEach((list) => {
    const li = document.createElement("li");
    li.className = "list-item";

    const textBlock = document.createElement("div");

    const title = document.createElement("h4");
    title.textContent = list.title;

    const meta = document.createElement("p");
    meta.textContent = `Updated ${formatUpdated(list.updatedAt)}`;

    textBlock.appendChild(title);
    textBlock.appendChild(meta);

    const openBtn = document.createElement("button");
    openBtn.type = "button";
    openBtn.textContent = "Open";
    openBtn.addEventListener("click", () => openList(list.id));

    li.appendChild(textBlock);
    li.appendChild(openBtn);
    listList.appendChild(li);
  });
}

function createList(title) {
  const trimmed = title.trim();
  const listTitle = trimmed || "Untitled list";

  const newList = {
    id: crypto.randomUUID(),
    title: listTitle,
    content: "",
    textSize: "normal",
    updatedAt: Date.now()
  };

  lists.unshift(newList);
  saveLists();
  renderLists();
  openList(newList.id);
}

function openList(id) {
  const list = lists.find((item) => item.id === id);
  if (!list) return;

  currentListId = id;
  noteEditor.innerHTML = list.content || "";
  applyTextSize(list.textSize || "normal");
  setPage("note");
  history.replaceState(null, "", "#note");
  noteEditor.focus();
}

function updateCurrentList() {
  if (!currentListId) return;
  const list = lists.find((item) => item.id === currentListId);
  if (!list) return;

  list.content = noteEditor.innerHTML;
  list.textSize = noteEditor.classList.contains("large") ? "large" : "normal";
  list.updatedAt = Date.now();

  saveLists();
  renderLists();
}

function applyTextSize(size) {
  const isLarge = size === "large";
  noteEditor.classList.toggle("large", isLarge);
  textToggle.textContent = isLarge ? "Text: Large" : "Text: Normal";
  textToggle.classList.toggle("is-active", isLarge);
}

function insertHtmlAtCursor(html) {
  const selection = window.getSelection();
  if (!selection) {
    noteEditor.innerHTML += html;
    return;
  }

  let range = selection.rangeCount ? selection.getRangeAt(0) : null;
  if (!range || !noteEditor.contains(range.startContainer)) {
    noteEditor.focus();
    range = document.createRange();
    range.selectNodeContents(noteEditor);
    range.collapse(false);
  }

  const fragment = document.createDocumentFragment();
  const temp = document.createElement("div");
  temp.innerHTML = html;

  let node;
  let lastNode = null;
  while ((node = temp.firstChild)) {
    lastNode = fragment.appendChild(node);
  }

  range.deleteContents();
  range.insertNode(fragment);

  if (lastNode) {
    range = range.cloneRange();
    range.setStartAfter(lastNode);
    range.collapse(true);
    selection.removeAllRanges();
    selection.addRange(range);
  }
}

function insertCheck(type) {
  const checkClass = type === "circle" ? "check check-circle" : "check";
  const html = `<div><span class="${checkClass}" contenteditable="false" data-checked="false"></span>&nbsp;</div>`;
  insertHtmlAtCursor(html);
  updateCurrentList();
}

function setPage(target) {
  let safeTarget = target;
  if (safeTarget === "note" && !currentListId) {
    safeTarget = "lists";
  }

  Object.values(pages).forEach((page) => page.classList.remove("is-active"));
  if (pages[safeTarget]) {
    pages[safeTarget].classList.add("is-active");
  }

  if (safeTarget === "lists") {
    listTitleInput.focus();
  }
}

function handleNavigation(target) {
  setPage(target);
  history.replaceState(null, "", `#${target}`);
}

navButtons.forEach((button) => {
  button.addEventListener("click", () => {
    const target = button.dataset.target;
    handleNavigation(target);
  });
});

window.addEventListener("hashchange", () => {
  const target = location.hash.replace("#", "") || "home";
  setPage(target);
});

if (location.hash) {
  setPage(location.hash.replace("#", ""));
}

listForm.addEventListener("submit", (event) => {
  event.preventDefault();
  createList(listTitleInput.value);
  listTitleInput.value = "";
});

noteEditor.addEventListener("input", updateCurrentList);

noteEditor.addEventListener("click", (event) => {
  const target = event.target;
  if (!(target instanceof HTMLElement)) return;
  if (!target.classList.contains("check")) return;
  target.classList.toggle("checked");
  updateCurrentList();
});

textToggle.addEventListener("click", () => {
  const nextSize = noteEditor.classList.contains("large") ? "normal" : "large";
  applyTextSize(nextSize);
  updateCurrentList();
});

textBold.addEventListener("click", () => {
  noteEditor.focus();
  document.execCommand("bold");
  updateCurrentList();
});

insertSquare.addEventListener("click", () => insertCheck("square"));
insertCircle.addEventListener("click", () => insertCheck("circle"));

renderLists();

if ("serviceWorker" in navigator) {
  window.addEventListener("load", () => {
    navigator.serviceWorker.register("service-worker.js");
  });
}

window.addEventListener("beforeinstallprompt", (event) => {
  event.preventDefault();
  deferredInstallPrompt = event;
  installButton.hidden = false;
  installHint.hidden = true;
});

installButton.addEventListener("click", async () => {
  if (!deferredInstallPrompt) return;
  deferredInstallPrompt.prompt();
  await deferredInstallPrompt.userChoice;
  deferredInstallPrompt = null;
  installButton.hidden = true;
  installHint.hidden = false;
});
