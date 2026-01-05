const LISTS_STORAGE_KEY = "pocket-atlas-lists-v1";
const SCHOOL_STORAGE_KEY = "pocket-atlas-school-v1";

const pages = {
  home: document.getElementById("page-home"),
  lists: document.getElementById("page-lists"),
  note: document.getElementById("page-note"),
  school: document.getElementById("page-school"),
  semester: document.getElementById("page-semester"),
  class: document.getElementById("page-class")
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
const exportButton = document.getElementById("export-data");
const importButton = document.getElementById("import-data");
const importFileInput = document.getElementById("import-file");
const installButton = document.getElementById("install-btn");
const installHint = document.getElementById("install-hint");
const menuToggle = document.getElementById("menu-toggle");
const menuClose = document.getElementById("menu-close");
const sideMenu = document.getElementById("side-menu");
const menuScrim = document.getElementById("menu-scrim");

const schoolCards = document.querySelectorAll(".school-card");
const semesterTitle = document.getElementById("semester-title");
const classForm = document.getElementById("class-form");
const classCodeInput = document.getElementById("class-code");
const classNameInput = document.getElementById("class-name");
const classCrnInput = document.getElementById("class-crn");
const classStats = document.getElementById("class-stats");
const classTableBody = document.getElementById("class-table-body");
const classEmpty = document.getElementById("class-empty");

const classTitle = document.getElementById("class-title");
const classSubtitle = document.getElementById("class-subtitle");
const classGrade = document.getElementById("class-grade");
const classWeight = document.getElementById("class-weight");
const assignmentForm = document.getElementById("assignment-form");
const assignmentNameInput = document.getElementById("assignment-name");
const assignmentWeightInput = document.getElementById("assignment-weight");
const assignmentGradeInput = document.getElementById("assignment-grade");
const assignmentTableBody = document.getElementById("assignment-table-body");
const assignmentEmpty = document.getElementById("assignment-empty");

let deferredInstallPrompt = null;
let lists = loadLists();
let currentListId = null;
let schoolData = loadSchoolData();
let currentSemesterId = null;
let currentClassId = null;

const semesterNames = {
  "3rd-year-winter": "3rd Year Winter",
  "4th-year-fall": "4th Year Fall",
  "4th-year-winter": "4th Year Winter"
};

function createEmptySchoolData() {
  return {
    semesters: {
      "3rd-year-winter": { classes: [] },
      "4th-year-fall": { classes: [] },
      "4th-year-winter": { classes: [] }
    }
  };
}

function normalizeSchoolData(data) {
  const base = createEmptySchoolData();
  if (!data || typeof data !== "object") return base;
  if (!data.semesters || typeof data.semesters !== "object") return base;

  Object.keys(base.semesters).forEach((key) => {
    const semester = data.semesters[key];
    if (semester && Array.isArray(semester.classes)) {
      base.semesters[key].classes = semester.classes;
    }
  });

  return base;
}

function loadLists() {
  const raw = localStorage.getItem(LISTS_STORAGE_KEY);
  if (!raw) return [];
  try {
    return JSON.parse(raw);
  } catch (error) {
    console.warn("Failed to parse lists", error);
    return [];
  }
}

function saveLists() {
  localStorage.setItem(LISTS_STORAGE_KEY, JSON.stringify(lists));
}

function loadSchoolData() {
  const raw = localStorage.getItem(SCHOOL_STORAGE_KEY);
  if (!raw) {
    return createEmptySchoolData();
  }
  try {
    return normalizeSchoolData(JSON.parse(raw));
  } catch (error) {
    console.warn("Failed to parse school data", error);
    return createEmptySchoolData();
  }
}

function saveSchoolData() {
  localStorage.setItem(SCHOOL_STORAGE_KEY, JSON.stringify(schoolData));
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

    textBlock.appendChild(title);

    if (list.deleted) {
      const actions = document.createElement("div");

      const recoverBtn = document.createElement("button");
      recoverBtn.type = "button";
      recoverBtn.textContent = "Recover";
      recoverBtn.addEventListener("click", () => recoverList(list.id));

      const confirmBtn = document.createElement("button");
      confirmBtn.type = "button";
      confirmBtn.textContent = "Confirm Delete";
      confirmBtn.addEventListener("click", () => confirmDeleteList(list.id));

      actions.appendChild(recoverBtn);
      actions.appendChild(confirmBtn);

      li.appendChild(textBlock);
      li.appendChild(actions);
      listList.appendChild(li);
      return;
    }

    const meta = document.createElement("p");
    meta.textContent = `Updated ${formatUpdated(list.updatedAt)}`;
    textBlock.appendChild(meta);

    const actions = document.createElement("div");

    const openBtn = document.createElement("button");
    openBtn.type = "button";
    openBtn.textContent = "Open";
    openBtn.addEventListener("click", () => openList(list.id));

    const deleteBtn = document.createElement("button");
    deleteBtn.type = "button";
    deleteBtn.textContent = "Delete";
    deleteBtn.addEventListener("click", () => softDeleteList(list.id));

    actions.appendChild(openBtn);
    actions.appendChild(deleteBtn);

    li.appendChild(textBlock);
    li.appendChild(actions);
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
    updatedAt: Date.now(),
    deleted: false
  };

  lists.unshift(newList);
  saveLists();
  renderLists();
  openList(newList.id);
}

function openList(id) {
  const list = lists.find((item) => item.id === id);
  if (!list || list.deleted) return;

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
  if (!list || list.deleted) return;

  list.content = noteEditor.innerHTML;
  list.textSize = noteEditor.classList.contains("large") ? "large" : "normal";
  list.updatedAt = Date.now();

  saveLists();
  renderLists();
}

function softDeleteList(id) {
  const index = lists.findIndex((item) => item.id === id);
  if (index === -1) return;
  const [list] = lists.splice(index, 1);
  list.deleted = true;
  list.deletedAt = Date.now();
  lists.push(list);
  saveLists();
  renderLists();
}

function recoverList(id) {
  const index = lists.findIndex((item) => item.id === id);
  if (index === -1) return;
  const [list] = lists.splice(index, 1);
  list.deleted = false;
  list.deletedAt = null;
  list.updatedAt = Date.now();
  lists.unshift(list);
  saveLists();
  renderLists();
}

function confirmDeleteList(id) {
  lists = lists.filter((item) => item.id !== id);
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
  if (safeTarget === "semester" && !currentSemesterId) {
    safeTarget = "school";
  }
  if (safeTarget === "class" && !currentClassId) {
    safeTarget = "semester";
  }

  Object.values(pages).forEach((page) => page.classList.remove("is-active"));
  if (pages[safeTarget]) {
    pages[safeTarget].classList.add("is-active");
  }

  if (safeTarget === "lists") {
    listTitleInput.focus();
  }
  if (safeTarget === "class") {
    assignmentNameInput.focus();
  }
}

function handleNavigation(target) {
  setPage(target);
  history.replaceState(null, "", `#${target}`);
}

function openMenu() {
  sideMenu.classList.add("is-open");
  sideMenu.setAttribute("aria-hidden", "false");
  menuScrim.hidden = false;
}

function closeMenu() {
  sideMenu.classList.remove("is-open");
  sideMenu.setAttribute("aria-hidden", "true");
  menuScrim.hidden = true;
}

function getSemester(semesterId) {
  return schoolData.semesters[semesterId];
}

function getClass(semesterId, classId) {
  const semester = getSemester(semesterId);
  if (!semester) return null;
  return semester.classes.find((item) => item.id === classId) || null;
}

function computeClassStats(classItem) {
  if (!classItem || !classItem.assignments.length) {
    return { grade: null, weight: 0 };
  }

  const gradedItems = classItem.assignments.filter(
    (item) => typeof item.grade === "number" && !Number.isNaN(item.grade)
  );

  if (gradedItems.length === 0) {
    return { grade: null, weight: 0 };
  }

  const weightTotal = gradedItems.reduce(
    (sum, item) => sum + (Number(item.weight) || 0),
    0
  );
  const weightedGrade = gradedItems.reduce((sum, item) => {
    const weight = Number(item.weight) || 0;
    const grade = Number(item.grade) || 0;
    return sum + weight * grade;
  }, 0);

  if (weightTotal <= 0) {
    return { grade: null, weight: 0 };
  }

  return {
    grade: weightedGrade / weightTotal,
    weight: weightTotal
  };
}

function renderSemester() {
  const semester = getSemester(currentSemesterId);
  if (!semester) return;

  semesterTitle.textContent = semesterNames[currentSemesterId] || "Semester";
  classTableBody.innerHTML = "";

  const classes = semester.classes;
  classStats.textContent = `${classes.length} / 6 classes`;
  classEmpty.hidden = classes.length !== 0;
  classForm.querySelector("button").disabled = classes.length >= 6;

  classes.forEach((item) => {
    const stats = computeClassStats(item);
    const gradeText = stats.grade === null ? "--" : `${stats.grade.toFixed(1)}%`;
    const weightText = stats.weight === 0 ? "0%" : `${stats.weight.toFixed(1)}%`;

    const row = document.createElement("tr");

    const codeCell = document.createElement("td");
    codeCell.textContent = item.code;

    const nameCell = document.createElement("td");
    nameCell.textContent = item.name;

    const gradeCell = document.createElement("td");
    gradeCell.textContent = gradeText;

    const weightCell = document.createElement("td");
    weightCell.textContent = weightText;

    const crnCell = document.createElement("td");
    crnCell.textContent = item.crn;

    const openCell = document.createElement("td");
    const openBtn = document.createElement("button");
    openBtn.type = "button";
    openBtn.textContent = "Open";
    openBtn.addEventListener("click", () => openClass(item.id));
    openCell.appendChild(openBtn);

    row.appendChild(codeCell);
    row.appendChild(nameCell);
    row.appendChild(gradeCell);
    row.appendChild(weightCell);
    row.appendChild(crnCell);
    row.appendChild(openCell);

    classTableBody.appendChild(row);
  });

  saveSchoolData();
}

function openSemester(semesterId) {
  currentSemesterId = semesterId;
  renderSemester();
  setPage("semester");
  history.replaceState(null, "", "#semester");
}

function createClass() {
  const semester = getSemester(currentSemesterId);
  if (!semester) return;
  if (semester.classes.length >= 6) return;

  const code = classCodeInput.value.trim();
  const name = classNameInput.value.trim();
  const crn = classCrnInput.value.trim();
  if (!code || !name || !crn) return;

  semester.classes.push({
    id: crypto.randomUUID(),
    code,
    name,
    crn,
    assignments: []
  });

  classCodeInput.value = "";
  classNameInput.value = "";
  classCrnInput.value = "";

  renderSemester();
}

function renderClass() {
  const classItem = getClass(currentSemesterId, currentClassId);
  if (!classItem) return;

  classTitle.textContent = `${classItem.code} - ${classItem.name}`;
  classSubtitle.textContent = `CRN ${classItem.crn}`;

  const stats = computeClassStats(classItem);
  classGrade.textContent = stats.grade === null ? "--" : `${stats.grade.toFixed(1)}%`;
  classWeight.textContent = `${stats.weight.toFixed(1)}%`;

  assignmentTableBody.innerHTML = "";
  assignmentEmpty.hidden = classItem.assignments.length !== 0;

  classItem.assignments.forEach((assignment) => {
    const row = document.createElement("tr");

    const nameCell = document.createElement("td");
    nameCell.textContent = assignment.name;

    const weightCell = document.createElement("td");
    weightCell.textContent = Number(assignment.weight).toFixed(1);

    const gradeCell = document.createElement("td");
    gradeCell.textContent =
      typeof assignment.grade === "number" && !Number.isNaN(assignment.grade)
        ? Number(assignment.grade).toFixed(1)
        : "--";

    const deleteCell = document.createElement("td");
    const deleteBtn = document.createElement("button");
    deleteBtn.type = "button";
    deleteBtn.textContent = "Remove";
    deleteBtn.addEventListener("click", () => removeAssignment(assignment.id));
    deleteCell.appendChild(deleteBtn);

    row.appendChild(nameCell);
    row.appendChild(weightCell);
    row.appendChild(gradeCell);
    row.appendChild(deleteCell);

    assignmentTableBody.appendChild(row);
  });

  saveSchoolData();
  renderSemester();
}

function openClass(classId) {
  currentClassId = classId;
  renderClass();
  setPage("class");
  history.replaceState(null, "", "#class");
}

function addAssignment() {
  const classItem = getClass(currentSemesterId, currentClassId);
  if (!classItem) return;

  const name = assignmentNameInput.value.trim();
  const weight = Number(assignmentWeightInput.value);
  const gradeRaw = assignmentGradeInput.value.trim();
  const grade = gradeRaw === "" ? null : Number(gradeRaw);

  if (!name) return;
  if (Number.isNaN(weight)) return;
  if (gradeRaw !== "" && Number.isNaN(grade)) return;

  classItem.assignments.push({
    id: crypto.randomUUID(),
    name,
    weight,
    grade
  });

  assignmentNameInput.value = "";
  assignmentWeightInput.value = "";
  assignmentGradeInput.value = "";

  renderClass();
}

function removeAssignment(assignmentId) {
  const classItem = getClass(currentSemesterId, currentClassId);
  if (!classItem) return;

  classItem.assignments = classItem.assignments.filter(
    (item) => item.id !== assignmentId
  );
  renderClass();
}

navButtons.forEach((button) => {
  button.addEventListener("click", () => {
    const target = button.dataset.target;
    handleNavigation(target);
    closeMenu();
  });
});

schoolCards.forEach((card) => {
  card.addEventListener("click", () => {
    openSemester(card.dataset.semester);
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

noteEditor.addEventListener("keydown", (event) => {
  if (event.key !== "Enter") return;
  const selection = window.getSelection();
  if (!selection || !selection.anchorNode) return;

  const anchor = selection.anchorNode;
  const block = anchor.nodeType === Node.ELEMENT_NODE
    ? anchor.closest("div")
    : anchor.parentElement
    ? anchor.parentElement.closest("div")
    : null;

  if (block && noteEditor.contains(block)) {
    const check = block.querySelector(".check");
    event.preventDefault();

    if (check) {
      const isCircle = check.classList.contains("check-circle");
      const checkClass = isCircle ? "check check-circle" : "check";
      const newBlock = document.createElement("div");
      newBlock.innerHTML = `<span class="${checkClass}" contenteditable="false" data-checked="false"></span>&nbsp;`;
      block.after(newBlock);
      placeCaretAtEnd(newBlock, selection);
      return;
    }

    const newBlock = document.createElement("div");
    newBlock.innerHTML = "&nbsp;";
    block.after(newBlock);
    placeCaretAtEnd(newBlock, selection);
    return;
  }

  event.preventDefault();
  const newBlock = document.createElement("div");
  newBlock.innerHTML = "&nbsp;";
  noteEditor.appendChild(newBlock);
  placeCaretAtEnd(newBlock, selection);
});

function placeCaretAtEnd(element, selection) {
  const range = document.createRange();
  range.selectNodeContents(element);
  range.collapse(false);
  selection.removeAllRanges();
  selection.addRange(range);
}

noteEditor.addEventListener("click", (event) => {
  const target = event.target;
  if (!(target instanceof HTMLElement)) return;
  if (!target.classList.contains("check")) return;
  target.classList.toggle("checked");
  if (!target.classList.contains("check-circle")) {
    reorderSquareChecks();
  }
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

function reorderSquareChecks() {
  const squareBlocks = Array.from(
    noteEditor.querySelectorAll(".check:not(.check-circle)")
  )
    .map((check) => check.closest("div"))
    .filter(Boolean);

  if (squareBlocks.length < 2) return;

  const unchecked = [];
  const checked = [];

  squareBlocks.forEach((block) => {
    const check = block.querySelector(".check:not(.check-circle)");
    if (!check) return;
    if (check.classList.contains("checked")) {
      checked.push(block);
    } else {
      unchecked.push(block);
    }
  });

  const ordered = unchecked.concat(checked);
  ordered.forEach((block) => {
    noteEditor.appendChild(block);
  });
}

classForm.addEventListener("submit", (event) => {
  event.preventDefault();
  createClass();
});

assignmentForm.addEventListener("submit", (event) => {
  event.preventDefault();
  addAssignment();
});

menuToggle.addEventListener("click", () => {
  openMenu();
});

menuClose.addEventListener("click", () => {
  closeMenu();
});

menuScrim.addEventListener("click", () => {
  closeMenu();
});

exportButton.addEventListener("click", () => {
  const payload = {
    version: 1,
    exportedAt: new Date().toISOString(),
    lists,
    schoolData
  };
  const blob = new Blob([JSON.stringify(payload, null, 2)], {
    type: "application/json"
  });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = "pocket-atlas-backup.json";
  document.body.appendChild(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(url);
});

importButton.addEventListener("click", () => {
  importFileInput.click();
});

importFileInput.addEventListener("change", (event) => {
  const file = event.target.files[0];
  if (!file) return;

  const reader = new FileReader();
  reader.onload = () => {
    try {
      const parsed = JSON.parse(reader.result);
      const nextLists = Array.isArray(parsed.lists) ? parsed.lists : [];
      const nextSchool = normalizeSchoolData(parsed.schoolData);

      const confirmed = window.confirm(
        "Importing will replace your current data. Continue?"
      );
      if (!confirmed) return;

      lists = nextLists;
      schoolData = nextSchool;
      currentListId = null;
      currentSemesterId = null;
      currentClassId = null;
      saveLists();
      saveSchoolData();
      renderLists();
      setPage("home");
    } catch (error) {
      console.warn("Import failed", error);
      window.alert("Import failed. Please use a valid backup JSON file.");
    } finally {
      importFileInput.value = "";
    }
  };
  reader.readAsText(file);
});

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
