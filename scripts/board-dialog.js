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

function openAddTaskDialog() {
  document.getElementById("add_task_dialog").showModal();
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


function buildTaskDetailDialog(task) {
  const WRAPPER = document.createElement("div");
  WRAPPER.innerHTML = getDetailTaskTemplate(task);

  const ASSIGNEES_LIST = WRAPPER.querySelector("#detail_task_assignees");
  (task.assignedTo || []).filter(Boolean).forEach((name) => {
    ASSIGNEES_LIST.innerHTML += getTaskAssignToTempletWithName(name, getInitials(name));
  });
  return WRAPPER.innerHTML;
}