let CURRENT_DETAIL_TASK = null;

function slideOutDialog(dialog) {
  return new Promise((resolve) => {
    dialog.classList.add("slide-out");
    dialog.addEventListener("animationend", () => {
      dialog.classList.remove("slide-out");
      dialog.close();
      resolve();
    }, { once: true });
  });
}

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

function addStatusTask(status) {
  openAddTaskDialog();
  console.log(status);
}

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
    CURRENT_DETAIL_TASK = TASK;
    TASK_DETAIL_DIALOG.innerHTML = buildTaskDetailDialog(TASK);
    TASK_DETAIL_DIALOG.showModal();
    TASK_DETAIL_DIALOG.scrollTop = 0; // Scrollt zum Anfang des Dialogs
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

function openEditTaskDialog(taskId) {
  const ALL_TASKS = JSON.parse(sessionStorage.tasks);
  const task = ALL_TASKS.find((t) => t.id === taskId);
  if (!task) return;

  closeTaskDetailDialog();

  const dialog = document.getElementById("edit_task_dialog");
  dialog.addEventListener("click", closeEditDialogOnBackdropClick);
  dialog.showModal();
  document.getElementById("form_edit_task").scrollTop = 0;

  document.getElementById("title").value = task.title || "";
  document.getElementById("description").value = task.description || "";
  document.getElementById("category").value = task.category || "";

  const dueDateInput = document.getElementById("dueDate");
  dueDateInput.min = new Date().toISOString().split("T")[0];
  dueDateInput.value = task.dueDate || "";

  selectPriority(task.priority || "medium");

  subtasksList = (task.subtasks || []).map((s) => ({ title: s.title, done: s.done }));
  subtaskInit();
  subtasksList.forEach((sub, i) => renderSubtaskItem(i, sub.title));

  loadUsersForEdit(task.assignedTo || []);
  initDropdownOutsideClick();

  const form = document.getElementById("form_edit_task");
  if (form) {
    form.addEventListener("submit", async (event) => {
      event.preventDefault();
      await saveEditedTask(task);
    });
  }
}

function closeEditTaskDialog() {
  document.getElementById("edit_task_dialog").close();
}

function closeEditDialogOnBackdropClick(event) {
  if (event.target === document.getElementById("edit_task_dialog")) {
    closeEditTaskDialog();
  }
}

function loadUsersForEdit(assignedTo) {
  const USER_URL = "https://join-3135-default-rtdb.europe-west1.firebasedatabase.app/users.json";
  fetch(USER_URL)
    .then((r) => r.json())
    .then((data) => {
      remoteUsers = Object.values(data);
      fillUserDropdown(data);
      document.querySelectorAll("#assignedToList label.user-item").forEach((label) => {
        const checkbox = label.querySelector("input[type='checkbox']");
        if (checkbox && assignedTo.includes(checkbox.value)) {
          checkbox.checked = true;
          label.classList.add("selected");
        }
      });
      updateAssignedPreview();
    })
    .catch((err) => console.error("Error loading users for edit:", err));
}

async function saveEditedTask(task) {
  const updated = buildTaskObj();
  updated.id = task.id;
  updated.status = task.status;
  updated.firebaseKey = task.firebaseKey;

  const ALL_TASKS = JSON.parse(sessionStorage.tasks);
  const idx = ALL_TASKS.findIndex((t) => t.id === task.id);
  if (idx !== -1) ALL_TASKS[idx] = updated;
  sessionStorage.tasks = JSON.stringify(ALL_TASKS);

  try {
    await fetch(getTaskURL(task.firebaseKey), {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        title: updated.title,
        description: updated.description,
        dueDate: updated.dueDate,
        category: updated.category,
        assignedTo: updated.assignedTo,
        priority: updated.priority,
        subtasks: updated.subtasks,
      }),
    });
  } catch (err) {
    console.error("Error saving edited task:", err);
  }

  renderBoard(ALL_TASKS);
  closeEditTaskDialog();
  openTaskDetailDialog(task.id);
}

// Löscht den Task aus sessionStorage, dem Board und Firebase – nutzt firebaseKey aus dem Task-Object.
async function deleteTask(task) {
  try {
    const ALL_TASKS = JSON.parse(sessionStorage.tasks);
    const TASK_INDEX = ALL_TASKS.findIndex((ta) => ta.id === task.id);
    ALL_TASKS.splice(TASK_INDEX, 1);
    sessionStorage.tasks = JSON.stringify(ALL_TASKS);
    renderBoard(ALL_TASKS);
    closeTaskDetailDialog();
    await fetch(getTaskURL(task.firebaseKey), {
      method: "DELETE",
    });
  } catch (error) {
    console.error("Fehler beim Löschen des Tasks:", error);
  }
}
