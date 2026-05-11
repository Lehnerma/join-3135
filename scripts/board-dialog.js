function initBoardTask() {
  const ADD_BTN_HEAD = document.getElementById("add_task_head");
  ADD_BTN_HEAD.addEventListener("click", openAddTaskDialog);

  const TASK_DIALOG = document.getElementById("add_task_dialog");
  TASK_DIALOG.addEventListener("click", closeDialogOnBackdropClick);

  const SEARCH_TASKS_BTN = document.getElementById("search_tasks_btn");
  SEARCH_TASKS_BTN.addEventListener("click", () => searchTasks());

  const SEARCH_INPUT = document.getElementById("search_tasks");
  SEARCH_INPUT.addEventListener("input", searchTasks); //check if input or change is better for the search function.

  const TASK_DETAIL_DIALOG = document.getElementById("task_detail_dialog");
  TASK_DETAIL_DIALOG.addEventListener("click", closeDialogOnBackdropClick);
}

function openAddTaskDialog(status = "todo") {
  const dialog = document.getElementById("add_task_dialog");
  dialog.innerHTML = getAddTaskDialogTemplate();

  dialog.showModal();

  // Diese Funktionen müssen in deiner addTask.js definiert sein
  initDateInput();
  selectPriority("medium");
  subtaskInit(); // Wichtig für Subtask-Buttons
  loadUsers(); // Lädt Kontakte in die Liste
  initDropdownOutsideClick(); // Aktiviert das Schließen des Dropdowns

  // Formular-Submit für den Dialog
  const form = document.getElementById("form_task");
  if (form) {
    form.addEventListener("submit", async (event) => {
      event.preventDefault();
      await createTask(status); // Wir übergeben den Status
    });
  }
}

async function createTask(status = "todo") {
  const task = buildTaskObj(); // Holt Daten aus dem Dialog-Formular
  task.status = status; // Setzt den Status (todo, progress, etc.)

  try {
    // WICHTIG: Nutze ADDTASK_URL (den neuen Namen aus deiner addTask.js)
    const response = await fetch(ADDTASK_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(task),
    });

    if (response.ok) {
      closeAddTaskDialog(); // Schließt das Fenster
      await loadTasksFromFirebase(); // Lädt das Board neu, damit der Task erscheint
    }
  } catch (error) {
    console.error("Fehler beim Erstellen im Dialog:", error);
  }
}

function closeAddTaskDialog() {
  const dialog = document.getElementById("add_task_dialog");
  dialog.close();
}

function initAddTaskDialog() {
  initDateInput();
  selectPriority("medium");
  subtaskInit();
  // Listener für das neue Formular im Dialog setzen
  const form = document.getElementById("form_task_dialog");
  if (form) {
    form.addEventListener("submit", (e) => {
      e.preventDefault();
      createTask(); // Nutzt deine Speicher-Logik
    });
  }
}

function closeDialogOnBackdropClick(event) {
  if (event.target === this) {
    this.close();
  }
}

// Add function to open the add task dialog and set the status of the right column
function addStatusTask(status) {
  openAddTaskDialog();
  console.log(status);
}

//search function.
function searchTasks() {
  const ALL_TASKS = JSON.parse(sessionStorage.tasks);
  const SEARCH_INPUT = document.getElementById("search_tasks").value;
  const SEARCH_VALUE = [];

  ALL_TASKS.filter((task) => {
    const TITLE = String(task.title || "").toLowerCase();
    const DESCRIPTION = String(task.description || "").toLowerCase();
    const SEARCH_LOWER = SEARCH_INPUT.trim().toLowerCase();
    if (TITLE.includes(SEARCH_LOWER) || DESCRIPTION.includes(SEARCH_LOWER)) {
      SEARCH_VALUE.push(task);
    }
  });
  renderBoard(SEARCH_VALUE);
}

function openTaskDetailDialog(taskId) {
  const TASK_DETAIL_DIALOG = document.getElementById("task_detail_dialog");
  TASK_DETAIL_DIALOG.innerHTML = ""; // Clear previous content

  const ALL_TASKS = JSON.parse(sessionStorage.tasks);
  const TASK = ALL_TASKS.find((task) => task.id === taskId);
  if (TASK) {
    // Store task data in dialog's dataset for reference
    TASK_DETAIL_DIALOG.dataset.taskId = TASK.id;
    TASK_DETAIL_DIALOG.innerHTML = buildTaskDetailDialog(TASK);
    TASK_DETAIL_DIALOG.showModal();
  }
}

// Close task detail dialog on backdrop click
function closeTaskDetailDialogOnBackdropClick(event) {
  const TASK_DETAIL_DIALOG = document.getElementById("task_detail_dialog");
  if (event.target === TASK_DETAIL_DIALOG) {
    TASK_DETAIL_DIALOG.close();
  }
}

// Close task detail dialog with button
function closeTaskDetailDialog() {
  const TASK_DETAIL_DIALOG = document.getElementById("task_detail_dialog");
  TASK_DETAIL_DIALOG.close();
}

function buildTaskDetailDialog(task) {
  const WRAPPER = document.createElement("div");
  WRAPPER.innerHTML = getDetailTaskTemplate(task);

  const ASSIGNEES_LIST = WRAPPER.querySelector("#detail_task_assignees");
  (task.assignedTo || []).filter(Boolean).forEach((name) => {
    ASSIGNEES_LIST.innerHTML += getTaskAssignToTempletWithName(name, getInitials(name));
  });

  const SUBTASKS = task.subtasks || [];
  const SUB_TOTAL = SUBTASKS.length;
  const SUBTASK_LIST = WRAPPER.querySelector("#detail_subtask_list");
  if (SUB_TOTAL > 0) {
    SUBTASKS.forEach((subtask) => {
      SUBTASK_LIST.innerHTML += getDetailSubtaskTemplate(subtask.title, subtask.done);
    });
  }

  return WRAPPER.innerHTML;
}

function deleteTask(taskId) {
  try {
    const ALL_TASKS = JSON.parse(sessionStorage.tasks);
    const TASK_INDEX = ALL_TASKS.findIndex((task) => task.id === taskId);

    if (TASK_INDEX !== -1) {
      ALL_TASKS.splice(TASK_INDEX, 1);
      sessionStorage.tasks = JSON.stringify(ALL_TASKS);

      renderBoard(ALL_TASKS);
      closeTaskDetailDialog();
      syncSessionStorageWithFirebase(taskId);
    }
  } catch (error) {
    console.error("Fehler beim Löschen des Tasks:", error);
  }
}

function syncSessionStorageWithFirebase(taskId) {
  try {
    const response = fetch(DELETETASK_URL + taskId, {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
    });

    if (response.ok) {
      loadTasksFromFirebase();
    }
  } catch (error) {
    console.error("Fehler beim Synchronisieren mit Firebase:", error);
  }
}
