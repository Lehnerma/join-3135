function initBoardTask() {
  const ADD_BTN_HEAD = document.getElementById("add_task_head");
  ADD_BTN_HEAD.addEventListener("click", openAddTaskDialog);

  const TASK_DIALOG = document.getElementById("add_task_dialog");
  TASK_DIALOG.addEventListener("click", closeDialogOnBackdropClick);

  const SEARCH_TASKS_BTN = document.getElementById("search_tasks_btn");
  SEARCH_TASKS_BTN.addEventListener("click", () => searchTasks());

  const SEARCH_INPUT = document.getElementById("search_tasks");
  SEARCH_INPUT.addEventListener("input",searchTasks);

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
