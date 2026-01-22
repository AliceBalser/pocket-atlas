const LISTS_STORAGE_KEY = "pocket-atlas-lists-v1";
const SCHOOL_STORAGE_KEY = "pocket-atlas-school-v1";
const HABITS_STORAGE_KEY = "pocket-atlas-habits-v1";
const GOALS_STORAGE_KEY = "pocket-atlas-goals-v1";
const HOBBIES_STORAGE_KEY = "pocket-atlas-hobbies-v1";
const PLANS_STORAGE_KEY = "pocket-atlas-plans-v1";

const pages = {
  home: document.getElementById("page-home"),
  lists: document.getElementById("page-lists"),
  note: document.getElementById("page-note"),
  school: document.getElementById("page-school"),
  semester: document.getElementById("page-semester"),
  class: document.getElementById("page-class"),
  habits: document.getElementById("page-habits"),
  "habits-morning": document.getElementById("page-habits-morning"),
  "habits-evening": document.getElementById("page-habits-evening"),
  "habits-lavender": document.getElementById("page-habits-lavender"),
  goals: document.getElementById("page-goals"),
  hobbies: document.getElementById("page-hobbies"),
  plans: document.getElementById("page-plans"),
  calendar: document.getElementById("page-calendar")
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
const bodyElement = document.body;

const schoolCards = document.querySelectorAll(".school-card");
const semesterTitle = document.getElementById("semester-title");
const semesterLockButton = document.getElementById("semester-lock");
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

const habitForms = document.querySelectorAll(".habit-form");
const habitListContainers = {
  morning: document.getElementById("habit-list-morning"),
  evening: document.getElementById("habit-list-evening"),
  lavender: document.getElementById("habit-list-lavender")
};
const habitEmptyStates = {
  morning: document.getElementById("habit-empty-morning"),
  evening: document.getElementById("habit-empty-evening"),
  lavender: document.getElementById("habit-empty-lavender")
};

const goalForm = document.getElementById("goal-form");
const goalTitleInput = document.getElementById("goal-title");
const goalTargetInput = document.getElementById("goal-target");
const goalList = document.getElementById("goal-list");
const goalEmpty = document.getElementById("goal-empty");

const hobbyForm = document.getElementById("hobby-form");
const hobbyTitleInput = document.getElementById("hobby-title");
const hobbyList = document.getElementById("hobby-list");
const hobbyEmpty = document.getElementById("hobby-empty");

const planForm = document.getElementById("plan-form");
const planTitleInput = document.getElementById("plan-title");
const planAddChildButton = document.getElementById("plan-add-child");
const planTree = document.getElementById("plan-tree");
const planEmpty = document.getElementById("plan-empty");
const planSelectedLabel = document.getElementById("plan-selected-label");
const planEditorTitle = document.getElementById("plan-editor-title");
const planEditorNotes = document.getElementById("plan-editor-notes");

let deferredInstallPrompt = null;
let lists = loadLists();
let currentListId = null;
let schoolData = loadSchoolData();
let currentSemesterId = null;
let currentClassId = null;
let habits = loadHabits();
let goals = loadGoals();
let hobbies = loadHobbies();
let plans = loadPlans();
let currentPlanId = null;

const semesterNames = {
  "3rd-year-winter": "3rd Year Winter",
  "4th-year-fall": "4th Year Fall",
  "4th-year-winter": "4th Year Winter"
};

const dayLabels = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
const HABIT_DAY_START_HOUR = 4;

function createEmptySchoolData() {
  return {
    semesters: {
      "3rd-year-winter": { classes: [], locked: false },
      "4th-year-fall": { classes: [], locked: false },
      "4th-year-winter": { classes: [], locked: false }
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
    if (semester && typeof semester.locked === "boolean") {
      base.semesters[key].locked = semester.locked;
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

function loadHabits() {
  const raw = localStorage.getItem(HABITS_STORAGE_KEY);
  if (!raw) return [];
  try {
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch (error) {
    console.warn("Failed to parse habits", error);
    return [];
  }
}

function saveHabits() {
  localStorage.setItem(HABITS_STORAGE_KEY, JSON.stringify(habits));
}

function loadGoals() {
  const raw = localStorage.getItem(GOALS_STORAGE_KEY);
  if (!raw) return [];
  try {
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch (error) {
    console.warn("Failed to parse goals", error);
    return [];
  }
}

function saveGoals() {
  localStorage.setItem(GOALS_STORAGE_KEY, JSON.stringify(goals));
}

function loadHobbies() {
  const raw = localStorage.getItem(HOBBIES_STORAGE_KEY);
  if (!raw) return [];
  try {
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch (error) {
    console.warn("Failed to parse hobbies", error);
    return [];
  }
}

function saveHobbies() {
  localStorage.setItem(HOBBIES_STORAGE_KEY, JSON.stringify(hobbies));
}

function loadPlans() {
  const raw = localStorage.getItem(PLANS_STORAGE_KEY);
  if (!raw) return [];
  try {
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch (error) {
    console.warn("Failed to parse plans", error);
    return [];
  }
}

function savePlans() {
  localStorage.setItem(PLANS_STORAGE_KEY, JSON.stringify(plans));
}

function formatUpdated(timestamp) {
  if (!timestamp) return "Never";
  return new Date(timestamp).toLocaleDateString();
}

function toHabitDay(date) {
  const shifted = new Date(date.getTime() - HABIT_DAY_START_HOUR * 60 * 60 * 1000);
  return new Date(shifted.getFullYear(), shifted.getMonth(), shifted.getDate());
}

function formatDateKey(date) {
  const day = toHabitDay(date);
  const year = day.getFullYear();
  const month = String(day.getMonth() + 1).padStart(2, "0");
  const dayNum = String(day.getDate()).padStart(2, "0");
  return `${year}-${month}-${dayNum}`;
}

function parseDateKey(key) {
  if (!key) return null;
  const [year, month, day] = key.split("-").map(Number);
  if (!year || !month || !day) return null;
  return new Date(year, month - 1, day);
}

function addDays(date, amount) {
  const next = new Date(date);
  next.setDate(next.getDate() + amount);
  return next;
}

function daysBetween(startDate, endDate) {
  const start = toHabitDay(startDate);
  const end = toHabitDay(endDate);
  return Math.round((end - start) / (1000 * 60 * 60 * 24));
}

function getWeekStart(date) {
  const day = new Date(date);
  const weekday = day.getDay();
  const diff = (weekday + 6) % 7;
  day.setDate(day.getDate() - diff);
  return new Date(day.getFullYear(), day.getMonth(), day.getDate());
}

function getWeekKey(date) {
  return formatDateKey(getWeekStart(date));
}

function isDueOnDate(habit, date) {
  const schedule = habit.schedule || { type: "daily" };
  const startDate = parseDateKey(habit.createdAt) || toHabitDay(date);
  const diff = daysBetween(startDate, date);
  if (diff < 0) return false;

  switch (schedule.type) {
    case "days":
      return Array.isArray(schedule.daysOfWeek)
        ? schedule.daysOfWeek.includes(date.getDay())
        : false;
    case "days-per-week":
      return true;
    case "every-days":
      return schedule.interval > 0 ? diff % schedule.interval === 0 : false;
    case "every-weeks":
      return true;
    case "daily":
    default:
      return true;
  }
}

function getCalendarDates(days = 28) {
  const today = toHabitDay(new Date());
  const dates = [];
  for (let i = days - 1; i >= 0; i -= 1) {
    dates.push(addDays(today, -i));
  }
  return dates;
}

function computeCompletionRate(habit, days = 7) {
  const today = toHabitDay(new Date());
  let due = 0;
  let done = 0;

  for (let i = 0; i < days; i += 1) {
    const date = addDays(today, -i);
    if (!isDueOnDate(habit, date)) continue;
    due += 1;
    if (habit.completions && habit.completions[formatDateKey(date)]) {
      done += 1;
    }
  }

  return due === 0 ? 0 : done / due;
}

function computeStreaks(habit) {
  const startDate = parseDateKey(habit.createdAt);
  if (!startDate) return { current: 0, longest: 0 };
  const today = toHabitDay(new Date());
  const schedule = habit.schedule || { type: "daily" };

  if (schedule.type === "every-weeks" && schedule.interval > 0) {
    const completionKeys = Object.keys(habit.completions || {}).sort();
    if (completionKeys.length === 0) return { current: 0, longest: 0 };
    const dates = completionKeys.map(parseDateKey).filter(Boolean);
    dates.sort((a, b) => a - b);
    const maxGap = schedule.interval * 7;
    let longest = 1;
    let running = 1;
    for (let i = 1; i < dates.length; i += 1) {
      const gap = daysBetween(dates[i - 1], dates[i]);
      if (gap <= maxGap) {
        running += 1;
        if (running > longest) longest = running;
      } else {
        running = 1;
      }
    }
    const last = dates[dates.length - 1];
    const current = daysBetween(last, today) <= maxGap ? running : 0;
    return { current, longest };
  }

  if (schedule.type === "days-per-week") {
    const target = Math.max(1, schedule.targetDays || 1);
    const completions = habit.completions || {};
    const weekCounts = new Map();
    Object.keys(completions).forEach((key) => {
      const date = parseDateKey(key);
      if (!date) return;
      const weekKey = getWeekKey(date);
      weekCounts.set(weekKey, (weekCounts.get(weekKey) || 0) + 1);
    });

    const startWeek = getWeekStart(startDate);
    const endWeek = getWeekStart(today);
    let longest = 0;
    let running = 0;
    for (let week = new Date(startWeek); week <= endWeek; week = addDays(week, 7)) {
      const count = weekCounts.get(getWeekKey(week)) || 0;
      if (count >= target) {
        running += 1;
        if (running > longest) longest = running;
      } else {
        running = 0;
      }
    }

    let current = 0;
    for (let week = new Date(endWeek); week >= startWeek; week = addDays(week, -7)) {
      const count = weekCounts.get(getWeekKey(week)) || 0;
      if (count >= target) {
        current += 1;
      } else {
        break;
      }
    }

    return { current, longest };
  }

  let longest = 0;
  let running = 0;

  for (let date = toHabitDay(startDate); date <= today; date = addDays(date, 1)) {
    if (!isDueOnDate(habit, date)) continue;
    const key = formatDateKey(date);
    if (habit.completions && habit.completions[key]) {
      running += 1;
      if (running > longest) longest = running;
    } else {
      running = 0;
    }
  }

  let current = 0;
  for (let date = today; date >= startDate; date = addDays(date, -1)) {
    if (!isDueOnDate(habit, date)) continue;
    const key = formatDateKey(date);
    if (habit.completions && habit.completions[key]) {
      current += 1;
    } else {
      break;
    }
  }

  return { current, longest };
}

function formatScheduleSummary(habit) {
  const schedule = habit.schedule || { type: "daily" };
  if (schedule.type === "days") {
    const days = Array.isArray(schedule.daysOfWeek) ? schedule.daysOfWeek : [];
    if (days.length === 0) return "Specific days";
    return days.map((day) => dayLabels[day]).join(", ");
  }
  if (schedule.type === "days-per-week") {
    return `${schedule.targetDays || 1} days / week`;
  }
  if (schedule.type === "every-days") {
    return `Every ${schedule.interval} days`;
  }
  if (schedule.type === "every-weeks") {
    return `Every ${schedule.interval} weeks`;
  }
  return "Daily";
}
function renderLists() {
  listList.innerHTML = "";

  if (lists.length === 0) {
    listEmpty.hidden = false;
  } else {
    listEmpty.hidden = true;
  }

  listStats.textContent = `${lists.length} list${lists.length === 1 ? "" : "s"}`;

  const activeLists = lists
    .filter((item) => !item.deleted)
    .sort((a, b) => (b.updatedAt || 0) - (a.updatedAt || 0));
  const deletedLists = lists.filter((item) => item.deleted);

  [...activeLists, ...deletedLists].forEach((list) => {
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

    const deleteBtn = document.createElement("button");
    deleteBtn.type = "button";
    deleteBtn.textContent = "Delete";
    deleteBtn.addEventListener("click", (event) => {
      event.stopPropagation();
      softDeleteList(list.id);
    });

    actions.appendChild(deleteBtn);

    li.appendChild(textBlock);
    li.appendChild(actions);
    li.addEventListener("click", () => openList(list.id));
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

  bodyElement.classList.remove("habit-morning", "habit-evening", "habit-lavender");
  if (safeTarget === "habits-morning") {
    bodyElement.classList.add("habit-morning");
  }
  if (safeTarget === "habits-evening") {
    bodyElement.classList.add("habit-evening");
  }
  if (safeTarget === "habits-lavender") {
    bodyElement.classList.add("habit-lavender");
  }

  Object.values(pages).forEach((page) => page.classList.remove("is-active"));
  if (pages[safeTarget]) {
    pages[safeTarget].classList.add("is-active");
  }

  if (safeTarget === "lists") {
    listTitleInput.blur();
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
  const lockReached = classes.length >= 6 || semester.locked;
  classForm.querySelector("button").disabled = lockReached;
  classForm.hidden = lockReached;
  classForm.style.display = lockReached ? "none" : "grid";
  semesterLockButton.hidden = semester.locked || classes.length === 0;

  classes.forEach((item) => {
    const stats = computeClassStats(item);
    const gradeText = stats.grade === null ? "--" : `${stats.grade.toFixed(1)}%`;
    const weightText = stats.weight === 0 ? "0%" : `${stats.weight.toFixed(1)}%`;

    const row = document.createElement("tr");

    const codeCell = document.createElement("td");
    codeCell.textContent = item.code;

    const nameCell = document.createElement("td");
    const nameButton = document.createElement("button");
    nameButton.type = "button";
    nameButton.className = "class-name-link";
    nameButton.textContent = item.name;
    nameButton.addEventListener("click", () => openClass(item.id));
    nameCell.appendChild(nameButton);

    const gradeCell = document.createElement("td");
    gradeCell.textContent = gradeText;

    const weightCell = document.createElement("td");
    weightCell.textContent = weightText;

    const crnCell = document.createElement("td");
    crnCell.textContent = item.crn;

    const deleteCell = document.createElement("td");
    const deleteBtn = document.createElement("button");
    deleteBtn.type = "button";
    deleteBtn.textContent = "Delete";
    deleteBtn.addEventListener("click", () => deleteClass(item.id));
    deleteCell.appendChild(deleteBtn);

    row.appendChild(codeCell);
    row.appendChild(nameCell);
    row.appendChild(gradeCell);
    row.appendChild(weightCell);
    row.appendChild(crnCell);
    row.appendChild(deleteCell);

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

  const weightTotal = classItem.assignments.reduce(
    (sum, assignment) => sum + (Number(assignment.weight) || 0),
    0
  );
  const hideAssignments = weightTotal >= 100;
  assignmentForm.hidden = hideAssignments;
  assignmentForm.style.display = hideAssignments ? "none" : "grid";

  assignmentTableBody.innerHTML = "";
  assignmentEmpty.hidden = classItem.assignments.length !== 0;

  classItem.assignments.forEach((assignment) => {
    const row = document.createElement("tr");

    const nameCell = document.createElement("td");
    nameCell.textContent = assignment.name;

    const weightCell = document.createElement("td");
    weightCell.textContent = Number(assignment.weight).toFixed(1);

    const gradeCell = document.createElement("td");
    const gradeInput = document.createElement("input");
    gradeInput.type = "number";
    gradeInput.inputMode = "decimal";
    gradeInput.min = "0";
    gradeInput.max = "100";
    gradeInput.step = "0.1";
    gradeInput.value =
      typeof assignment.grade === "number" && !Number.isNaN(assignment.grade)
        ? assignment.grade
        : "";
    gradeInput.placeholder = "--";
    const handleGradeUpdate = (event) => {
      updateAssignmentGrade(assignment.id, event.target.value);
    };
    gradeInput.addEventListener("change", handleGradeUpdate);
    gradeInput.addEventListener("blur", handleGradeUpdate);
    gradeCell.appendChild(gradeInput);

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

  const currentWeightTotal = classItem.assignments.reduce(
    (sum, assignment) => sum + (Number(assignment.weight) || 0),
    0
  );
  if (currentWeightTotal + weight > 100) return;

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

function updateAssignmentGrade(assignmentId, value) {
  const classItem = getClass(currentSemesterId, currentClassId);
  if (!classItem) return;
  const assignment = classItem.assignments.find((item) => item.id === assignmentId);
  if (!assignment) return;

  const trimmed = String(value).trim();
  assignment.grade = trimmed === "" ? null : Number(trimmed);
  if (assignment.grade !== null && Number.isNaN(assignment.grade)) {
    assignment.grade = null;
  }

  renderClass();
}

function lockSemester() {
  const semester = getSemester(currentSemesterId);
  if (!semester) return;
  semester.locked = true;
  renderSemester();
}

function deleteClass(classId) {
  const semester = getSemester(currentSemesterId);
  if (!semester) return;
  semester.classes = semester.classes.filter((item) => item.id !== classId);
  if (currentClassId === classId) {
    currentClassId = null;
  }
  renderSemester();
}
function updateHabitForm(form) {
  const schedule = form.querySelector(".habit-schedule").value;
  const daysRow = form.querySelector(".habit-days");
  const intervalDays = form.querySelector(".habit-interval-days");
  const intervalWeeks = form.querySelector(".habit-interval-weeks");
  const intervalWeekly = form.querySelector(".habit-interval-weekly");

  daysRow.style.display = schedule === "days" ? "flex" : "none";
  intervalDays.classList.toggle("is-active", schedule === "every-days");
  intervalWeeks.classList.toggle("is-active", schedule === "every-weeks");
  intervalWeekly.classList.toggle("is-active", schedule === "days-per-week");
}

function createHabitFromForm(form) {
  const name = form.querySelector(".habit-name").value.trim();
  if (!name) return;

  const scheduleType = form.querySelector(".habit-schedule").value;
  const daysSelected = Array.from(form.querySelectorAll(".habit-days input:checked"))
    .map((input) => Number(input.dataset.day))
    .filter((day) => !Number.isNaN(day));

  const dayDefault = [new Date().getDay()];
  const intervalInput = scheduleType === "every-weeks"
    ? form.querySelector(".habit-interval-weeks .habit-interval-input")
    : scheduleType === "days-per-week"
    ? form.querySelector(".habit-interval-weekly .habit-interval-input")
    : form.querySelector(".habit-interval-days .habit-interval-input");
  const intervalValue = Number(intervalInput ? intervalInput.value : 1) || 1;

  let schedule = { type: scheduleType };
  if (scheduleType === "days") {
    schedule = { type: "days", daysOfWeek: daysSelected.length ? daysSelected : dayDefault };
  } else if (scheduleType === "every-days") {
    schedule = { type: "every-days", interval: Math.max(1, intervalValue) };
  } else if (scheduleType === "every-weeks") {
    schedule = { type: "every-weeks", interval: Math.max(1, intervalValue) };
  } else if (scheduleType === "days-per-week") {
    schedule = { type: "days-per-week", targetDays: Math.max(1, intervalValue) };
  }

  const habit = {
    id: crypto.randomUUID(),
    name,
    category: form.dataset.category,
    createdAt: formatDateKey(new Date()),
    schedule,
    completions: {}
  };

  habits.unshift(habit);
  saveHabits();
  renderHabits(form.dataset.category);

  form.reset();
  updateHabitForm(form);
}

function renderHabits(category) {
  const container = habitListContainers[category];
  if (!container) return;
  container.innerHTML = "";

  const filtered = habits.filter((habit) => habit.category === category);
  const emptyState = habitEmptyStates[category];
  if (emptyState) {
    emptyState.hidden = filtered.length !== 0;
  }

  filtered.forEach((habit) => {
    const card = document.createElement("div");
    card.className = "habit-card";

    const header = document.createElement("div");
    header.className = "habit-header";

    const ring = document.createElement("button");
    ring.type = "button";
    ring.className = "habit-ring";
    ring.dataset.habitId = habit.id;

    const today = toHabitDay(new Date());
    const todayKey = formatDateKey(today);
    const doneToday = habit.completions && habit.completions[todayKey];
    if (doneToday) {
      ring.classList.add("is-done");
    }

    ring.style.setProperty("--progress", doneToday ? 1 : 0);
    ring.title = "Tap to toggle today";

    const titleWrap = document.createElement("div");
    const title = document.createElement("div");
    title.className = "habit-title";
    title.textContent = habit.name;

    const meta = document.createElement("div");
    meta.className = "habit-meta";
    meta.textContent = formatScheduleSummary(habit);

    titleWrap.appendChild(title);
    titleWrap.appendChild(meta);

    header.appendChild(ring);
    header.appendChild(titleWrap);

    const streaks = computeStreaks(habit);
    const streakRow = document.createElement("div");
    streakRow.className = "habit-streaks";
    streakRow.innerHTML = `<span>Streak ${streaks.current}</span><span>Best ${streaks.longest}</span>`;

    const calendar = document.createElement("div");
    calendar.className = "habit-calendar";
    const dates = getCalendarDates(28);
    dates.forEach((date) => {
      const cell = document.createElement("div");
      cell.className = "habit-day";
      if (isDueOnDate(habit, date)) {
        cell.classList.add("is-due");
      }
      const key = formatDateKey(date);
      if (habit.completions && habit.completions[key]) {
        cell.classList.add("is-done");
      }
      calendar.appendChild(cell);
    });

    card.appendChild(header);
    card.appendChild(streakRow);
    card.appendChild(calendar);
    container.appendChild(card);
  });
}

function renderAllHabits() {
  renderHabits("morning");
  renderHabits("evening");
  renderHabits("lavender");
}

function renderGoals() {
  goalList.innerHTML = "";
  goalEmpty.hidden = goals.length !== 0;

  goals.forEach((goal) => {
    const card = document.createElement("div");
    card.className = "goal-card";

    const title = document.createElement("h3");
    title.textContent = goal.title;

    const meta = document.createElement("div");
    meta.className = "goal-meta";
    meta.textContent = `Created ${formatGoalDate(goal.createdAt)}${goal.targetDate ? ` · Target ${formatGoalDate(goal.targetDate)}` : ""}`;

    const notes = document.createElement("textarea");
    notes.placeholder = "Add notes...";
    notes.value = goal.notes || "";
    notes.addEventListener("input", (event) => {
      updateGoalNotes(goal.id, event.target.value);
    });

    card.appendChild(title);
    card.appendChild(meta);
    card.appendChild(notes);
    goalList.appendChild(card);
  });
}

function createGoal(title) {
  const trimmed = title.trim();
  if (!trimmed) return;

  goals.unshift({
    id: crypto.randomUUID(),
    title: trimmed,
    notes: "",
    createdAt: Date.now(),
    targetDate: goalTargetInput.value || ""
  });

  saveGoals();
  renderGoals();
}

function updateGoalNotes(goalId, notes) {
  const goal = goals.find((item) => item.id === goalId);
  if (!goal) return;
  goal.notes = notes;
  saveGoals();
}

function formatGoalDate(value) {
  if (!value) return "—";
  const date = typeof value === "number" ? new Date(value) : new Date(value);
  if (Number.isNaN(date.getTime())) return "—";
  return date.toLocaleDateString();
}

function renderHobbies() {
  hobbyList.innerHTML = "";
  hobbyEmpty.hidden = hobbies.length !== 0;

  hobbies.forEach((hobby) => {
    const card = document.createElement("div");
    card.className = "hobby-card";

    const title = document.createElement("h3");
    title.textContent = hobby.title;

    const stars = document.createElement("div");
    stars.className = "hobby-stars";

    for (let i = 1; i <= 5; i += 1) {
      const starBtn = document.createElement("button");
      starBtn.type = "button";
      starBtn.textContent = "★";
      starBtn.classList.toggle("is-active", i <= (hobby.rating || 0));
      starBtn.addEventListener("click", () => updateHobbyRating(hobby.id, i));
      stars.appendChild(starBtn);
    }

    const notes = document.createElement("textarea");
    notes.placeholder = "Add notes...";
    notes.value = hobby.notes || "";
    notes.addEventListener("input", (event) => {
      updateHobbyNotes(hobby.id, event.target.value);
    });

    card.appendChild(title);
    card.appendChild(stars);
    card.appendChild(notes);
    hobbyList.appendChild(card);
  });
}

function createHobby(title) {
  const trimmed = title.trim();
  if (!trimmed) return;

  hobbies.unshift({
    id: crypto.randomUUID(),
    title: trimmed,
    notes: "",
    rating: 0,
    createdAt: Date.now()
  });

  saveHobbies();
  renderHobbies();
}

function updateHobbyNotes(hobbyId, notes) {
  const hobby = hobbies.find((item) => item.id === hobbyId);
  if (!hobby) return;
  hobby.notes = notes;
  saveHobbies();
}

function updateHobbyRating(hobbyId, rating) {
  const hobby = hobbies.find((item) => item.id === hobbyId);
  if (!hobby) return;
  hobby.rating = rating;
  saveHobbies();
  renderHobbies();
}

function renderPlans() {
  planTree.innerHTML = "";
  planEmpty.hidden = plans.length !== 0;

  const childrenMap = new Map();
  plans.forEach((node) => {
    const key = node.parentId || "root";
    if (!childrenMap.has(key)) {
      childrenMap.set(key, []);
    }
    childrenMap.get(key).push(node);
  });

  function buildList(parentId, container) {
    const nodes = childrenMap.get(parentId) || [];
    nodes.forEach((node) => {
      const li = document.createElement("li");

      const button = document.createElement("button");
      button.type = "button";
      button.className = "plan-node";
      button.textContent = node.title || "Untitled";
      button.classList.toggle("is-active", node.id === currentPlanId);
      button.addEventListener("click", () => selectPlan(node.id));

      li.appendChild(button);

      const childList = document.createElement("ul");
      buildList(node.id, childList);
      if (childList.childElementCount > 0) {
        li.appendChild(childList);
      }

      container.appendChild(li);
    });
  }

  buildList("root", planTree);
  updatePlanEditor();
}

function createPlan(title) {
  const trimmed = title.trim();
  if (!trimmed) return;

  const node = {
    id: crypto.randomUUID(),
    parentId: null,
    title: trimmed,
    notes: "",
    createdAt: Date.now()
  };

  plans.unshift(node);
  currentPlanId = node.id;
  savePlans();
  renderPlans();
}

function addChildPlan() {
  if (!currentPlanId) return;
  const parent = plans.find((node) => node.id === currentPlanId);
  if (!parent) return;

  const node = {
    id: crypto.randomUUID(),
    parentId: parent.id,
    title: "New branch",
    notes: "",
    createdAt: Date.now()
  };

  plans.unshift(node);
  currentPlanId = node.id;
  savePlans();
  renderPlans();
}

function selectPlan(planId) {
  currentPlanId = planId;
  renderPlans();
}

function updatePlanEditor() {
  const node = plans.find((item) => item.id === currentPlanId);
  const hasSelection = Boolean(node);
  planAddChildButton.disabled = !hasSelection;
  planEditorTitle.disabled = !hasSelection;
  planEditorNotes.disabled = !hasSelection;

  if (!node) {
    planSelectedLabel.textContent = "Select a node to edit";
    planEditorTitle.value = "";
    planEditorNotes.value = "";
    return;
  }

  planSelectedLabel.textContent = "Editing node";
  planEditorTitle.value = node.title || "";
  planEditorNotes.value = node.notes || "";
}

function updatePlanTitle(value) {
  const node = plans.find((item) => item.id === currentPlanId);
  if (!node) return;
  node.title = value;
  savePlans();
  renderPlans();
}

function updatePlanNotes(value) {
  const node = plans.find((item) => item.id === currentPlanId);
  if (!node) return;
  node.notes = value;
  savePlans();
}

function toggleHabitToday(habitId) {
  const habit = habits.find((item) => item.id === habitId);
  if (!habit) return;

  const today = toHabitDay(new Date());
  if (!isDueOnDate(habit, today)) return;

  const key = formatDateKey(today);
  habit.completions = habit.completions || {};
  if (habit.completions[key]) {
    delete habit.completions[key];
  } else {
    habit.completions[key] = true;
  }

  saveHabits();
  renderHabits(habit.category);
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
    if (card.dataset.semester) {
      openSemester(card.dataset.semester);
      return;
    }
    const target = card.dataset.target;
    if (target) {
      handleNavigation(target);
    }
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

noteEditor.addEventListener("input", (event) => {
  updateCurrentList();
  const selection = window.getSelection();
  if (!selection || !selection.anchorNode) return;
  const block = getLineBlockFromSelection(selection);
  if (!block || !block.dataset.spaceCleared) return;
  if (block.textContent.replace(/\u00a0/g, "").trim() !== "") {
    block.removeAttribute("data-space-cleared");
  }
});

noteEditor.addEventListener("keydown", (event) => {
  if (event.key !== "Enter" && event.key !== "Backspace") return;
  const selection = window.getSelection();
  if (!selection || !selection.anchorNode) return;

  const block = getLineBlockFromSelection(selection);

  if (block && noteEditor.contains(block)) {
    const check = block.querySelector(".check");

    if (event.key === "Enter") {
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

    if (event.key === "Backspace" && check && selection.isCollapsed) {
      if (!isCaretAtStart(selection, block)) return;
      const textValue = block.textContent.replace(/\u00a0/g, "").trim();
      if (textValue.length > 0) return;

      if (!block.dataset.spaceCleared) {
        event.preventDefault();
        block.dataset.spaceCleared = "true";
        return;
      }

      event.preventDefault();
      check.remove();
      block.removeAttribute("data-space-cleared");
      block.innerHTML = "&nbsp;";
      placeCaretAtEnd(block, selection);
      return;
    }
  }

  if (event.key === "Enter") {
    event.preventDefault();
    const newBlock = document.createElement("div");
    newBlock.innerHTML = "&nbsp;";
    noteEditor.appendChild(newBlock);
    placeCaretAtEnd(newBlock, selection);
  }
});

function placeCaretAtEnd(element, selection) {
  const range = document.createRange();
  range.selectNodeContents(element);
  range.collapse(false);
  selection.removeAllRanges();
  selection.addRange(range);
}

function getLineBlockFromSelection(selection) {
  let node = selection.anchorNode;
  if (!node) return null;
  if (node.nodeType === Node.TEXT_NODE) {
    node = node.parentElement;
  }
  if (!(node instanceof HTMLElement)) return null;
  if (node === noteEditor) return null;
  return node.closest("div");
}

function isCaretAtStart(selection, block) {
  if (!selection.rangeCount) return false;
  const range = selection.getRangeAt(0).cloneRange();
  range.setStart(block, 0);
  range.setEnd(selection.anchorNode, selection.anchorOffset);
  const text = range.toString().replace(/\u00a0/g, "");
  return text.length === 0;
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
  let node = noteEditor.firstElementChild;
  while (node) {
    if (!isSquareBlock(node)) {
      node = node.nextElementSibling;
      continue;
    }

    const run = [];
    let cursor = node;
    while (cursor && isSquareBlock(cursor)) {
      run.push(cursor);
      cursor = cursor.nextElementSibling;
    }
    const nextAfterRun = cursor;

    const unchecked = [];
    const checked = [];
    run.forEach((block) => {
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
      noteEditor.insertBefore(block, nextAfterRun);
    });

    node = nextAfterRun;
  }
}

function isSquareBlock(block) {
  if (!(block instanceof HTMLElement)) return false;
  const check = block.querySelector(".check");
  return Boolean(check && !check.classList.contains("check-circle"));
}

classForm.addEventListener("submit", (event) => {
  event.preventDefault();
  createClass();
});

assignmentForm.addEventListener("submit", (event) => {
  event.preventDefault();
  addAssignment();
});

habitForms.forEach((form) => {
  updateHabitForm(form);
  form.querySelector(".habit-schedule").addEventListener("change", () => {
    updateHabitForm(form);
  });
  form.addEventListener("submit", (event) => {
    event.preventDefault();
    createHabitFromForm(form);
  });
});

goalForm.addEventListener("submit", (event) => {
  event.preventDefault();
  createGoal(goalTitleInput.value);
  goalTitleInput.value = "";
  goalTargetInput.value = "";
});

hobbyForm.addEventListener("submit", (event) => {
  event.preventDefault();
  createHobby(hobbyTitleInput.value);
  hobbyTitleInput.value = "";
});

planForm.addEventListener("submit", (event) => {
  event.preventDefault();
  createPlan(planTitleInput.value);
  planTitleInput.value = "";
});

planAddChildButton.addEventListener("click", () => {
  addChildPlan();
});

planEditorTitle.addEventListener("input", (event) => {
  updatePlanTitle(event.target.value);
});

planEditorNotes.addEventListener("input", (event) => {
  updatePlanNotes(event.target.value);
});

document.addEventListener("click", (event) => {
  const button = event.target.closest(".habit-ring");
  if (!button) return;
  event.preventDefault();
  toggleHabitToday(button.dataset.habitId);
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

semesterLockButton.addEventListener("click", () => {
  lockSemester();
});

exportButton.addEventListener("click", () => {
  const payload = {
    version: 5,
    exportedAt: new Date().toISOString(),
    lists,
    schoolData,
    habits,
    goals,
    hobbies,
    plans
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
      const nextHabits = Array.isArray(parsed.habits) ? parsed.habits : [];
      const nextGoals = Array.isArray(parsed.goals) ? parsed.goals : [];
      const nextHobbies = Array.isArray(parsed.hobbies) ? parsed.hobbies : [];
      const nextPlans = Array.isArray(parsed.plans) ? parsed.plans : [];

      const confirmed = window.confirm(
        "Importing will replace your current data. Continue?"
      );
      if (!confirmed) return;

      lists = nextLists;
      schoolData = nextSchool;
      habits = nextHabits;
      goals = nextGoals;
      hobbies = nextHobbies;
      plans = nextPlans;
      currentListId = null;
      currentSemesterId = null;
      currentClassId = null;
      saveLists();
      saveSchoolData();
      saveHabits();
      saveGoals();
      saveHobbies();
      savePlans();
      renderLists();
      renderAllHabits();
      renderGoals();
      renderHobbies();
      renderPlans();
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
renderAllHabits();
renderGoals();
renderHobbies();
renderPlans();

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
