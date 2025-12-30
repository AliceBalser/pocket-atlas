const STORAGE_KEY = "pocket-atlas-todos-v1";

const pages = {
  home: document.getElementById("page-home"),
  todo: document.getElementById("page-todo")
};

const navButtons = document.querySelectorAll("[data-target]");
const todoForm = document.getElementById("todo-form");
const todoInput = document.getElementById("todo-input");
const todoList = document.getElementById("todo-list");
const todoStats = document.getElementById("todo-stats");
const todoEmpty = document.getElementById("todo-empty");
const installButton = document.getElementById("install-btn");
const installHint = document.getElementById("install-hint");

let deferredInstallPrompt = null;
let todos = loadTodos();

function loadTodos() {
  const raw = localStorage.getItem(STORAGE_KEY);
  if (!raw) return [];
  try {
    return JSON.parse(raw);
  } catch (error) {
    console.warn("Failed to parse todos", error);
    return [];
  }
}

function saveTodos() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(todos));
}

function renderTodos() {
  todoList.innerHTML = "";

  if (todos.length === 0) {
    todoEmpty.hidden = false;
  } else {
    todoEmpty.hidden = true;
  }

  const remaining = todos.filter((item) => !item.done).length;
  todoStats.textContent = `${todos.length} item${todos.length === 1 ? "" : "s"} (${remaining} open)`;

  todos.forEach((item) => {
    const li = document.createElement("li");
    li.className = `todo-item${item.done ? " done" : ""}`;

    const label = document.createElement("span");
    label.textContent = item.text;

    const actions = document.createElement("div");

    const toggleBtn = document.createElement("button");
    toggleBtn.type = "button";
    toggleBtn.textContent = item.done ? "Undo" : "Done";
    toggleBtn.addEventListener("click", () => toggleTodo(item.id));

    const deleteBtn = document.createElement("button");
    deleteBtn.type = "button";
    deleteBtn.textContent = "Delete";
    deleteBtn.addEventListener("click", () => deleteTodo(item.id));

    actions.appendChild(toggleBtn);
    actions.appendChild(deleteBtn);

    li.appendChild(label);
    li.appendChild(actions);

    todoList.appendChild(li);
  });
}

function addTodo(text) {
  const trimmed = text.trim();
  if (!trimmed) return;

  todos.unshift({
    id: crypto.randomUUID(),
    text: trimmed,
    done: false,
    createdAt: Date.now()
  });

  saveTodos();
  renderTodos();
}

function toggleTodo(id) {
  todos = todos.map((item) =>
    item.id === id ? { ...item, done: !item.done } : item
  );
  saveTodos();
  renderTodos();
}

function deleteTodo(id) {
  todos = todos.filter((item) => item.id !== id);
  saveTodos();
  renderTodos();
}

function setPage(target) {
  Object.values(pages).forEach((page) => page.classList.remove("is-active"));
  if (pages[target]) {
    pages[target].classList.add("is-active");
  }
  if (target === "todo") {
    todoInput.focus();
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

todoForm.addEventListener("submit", (event) => {
  event.preventDefault();
  addTodo(todoInput.value);
  todoInput.value = "";
});

renderTodos();

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