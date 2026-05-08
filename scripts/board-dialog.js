function initBoardTask() {
  const ADD_BTN_HEAD = document.getElementById("add_task_head");
  ADD_BTN_HEAD.addEventListener("click", openAddTaskDialog);

  const TASK_DIALOG = document.getElementById("add_task_dialog");
  TASK_DIALOG.addEventListener("click", closeDialogOnBackdropClick);

  const SEARCH_TASKS_BTN = document.getElementById("search_tasks_btn");
  SEARCH_TASKS_BTN.addEventListener("click", () => searchTasks());

  const SEARCH_INPUT = document.getElementById("search_tasks");
  SEARCH_INPUT.addEventListener("input",searchTasks); //check if input or change is better for the search function.

}

function openAddTaskDialog(status = 'todo') {
  const dialog = document.getElementById('add_task_dialog');
  dialog.innerHTML = getAddTaskDialogTemplate();

  dialog.showModal();

  // Diese Funktionen müssen in deiner addTask.js definiert sein
  initDateInput();
  selectPriority('medium');
  subtaskInit(); // Wichtig für Subtask-Buttons
  loadUsers(); // Lädt Kontakte in die Liste
  initDropdownOutsideClick(); // Aktiviert das Schließen des Dropdowns

  // Formular-Submit für den Dialog
  const form = document.getElementById('form_task');
  if (form) {
    form.addEventListener('submit', async (event) => {
      event.preventDefault();
      await createTask(status); // Wir übergeben den Status
    });
  }
}


async function createTask(status = 'todo') {
  const task = buildTaskObj(); // Holt Daten aus dem Dialog-Formular
  task.status = status; // Setzt den Status (todo, progress, etc.)

  try {
    // WICHTIG: Nutze ADDTASK_URL (den neuen Namen aus deiner addTask.js)
    const response = await fetch(ADDTASK_URL, { 
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(task)
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
  const dialog = document.getElementById('add_task_dialog');
  dialog.close();
}

function initAddTaskDialog() {
  initDateInput();
  selectPriority('medium');
  subtaskInit();
  // Listener für das neue Formular im Dialog setzen
  const form = document.getElementById('form_task_dialog');
  if (form) {
    form.addEventListener('submit', (e) => {
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
  const TEST_ARRAY = [];

    ALL_TASKS.filter((task) => {
    const TITLE = String(task.title || "").toLowerCase();
    const DESCRIPTION = String(task.description || "").toLowerCase();
    const SEARCH_LOWER = SEARCH_INPUT.trim().toLowerCase();
    // only for testing.
    if (TITLE.includes(SEARCH_LOWER) || DESCRIPTION.includes(SEARCH_LOWER)) {
      TEST_ARRAY.push(task);
    }
    //end of testing
  });
  renderBoard(TEST_ARRAY);
}


