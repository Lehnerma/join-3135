let CURRENT_DETAIL_TASK = null;

/**
 * Closes a dialog with a slide-out animation.
 * It waits for the animation to finish before closing the dialog completely.
 *
 * @param {HTMLElement} dialog - The dialog element to close.
 * @returns {Promise} A promise that resolves when the animation is done.
 */
function slideOutDialog(dialog) {
  return new Promise((resolve) => {
    dialog.classList.add("slide-out");
    dialog.addEventListener(
      "animationend",
      () => {
        dialog.classList.remove("slide-out");
        dialog.close();
        resolve();
      },
      { once: true },
    );
  });
}

/**
 * Shows a temporary success message (toast) when a task is created.
 * The message fades in, stays for 1.5 seconds, and then fades out.
 */
function showTaskCreatedToast() {
  const toast = document.getElementById("task_created_toast");
  toast.classList.add("taskCreatedToast--visible");
  setTimeout(() => {
    toast.classList.remove("taskCreatedToast--visible");
    toast.classList.add("taskCreatedToast--hidden");
    toast.addEventListener(
      "animationend",
      () => {
        toast.classList.add = "dnone";
        toast.classList.remove("taskCreatedToast--hidden");
      },
      { once: true },
    );
  }, 1500);
}

/**
 * Initializes the event listeners for the board.
 * It sets up buttons for adding tasks, searching, and clicking on task details.
 */
function initBoardTask() {
  const ADD_BTN_HEAD = document.getElementById("add_task_head");
  ADD_BTN_HEAD.addEventListener("click", () => {
    window.location.href = "../html/addTaskPage.html";
  });

  const SEARCH_TASKS_BTN = document.getElementById("search_tasks_btn");
  SEARCH_TASKS_BTN.addEventListener("click", () => searchTasks());

  const SEARCH_INPUT = document.getElementById("search_tasks");
  SEARCH_INPUT.addEventListener("input", searchTasks); //check if input or change is better for the search function.

  const TASK_DETAIL_DIALOG = document.getElementById("task_detail_dialog");
  TASK_DETAIL_DIALOG.addEventListener("click", closeDialogOnBackdropClick);
}

/**
 * Closes a dialog if the user clicks on the background (backdrop) instead of the content.
 *
 * @param {Event} event - The click event.
 */
function closeDialogOnBackdropClick(event) {
  if (event.target === this) {
    slideOutDialog(this);
  }
}

/**
 * We set the status into the session storage and redirect to addtask.html.
 *
 * @param {string} status - The status for the new task (e.g., 'inProgress').
 */
function addStatusTask(status) {
  sessionStorage.setItem("task-status", status);
  window.location.href = "../html/addTaskPage.html"
}

/**
 * Filters the tasks on the board based on the user's search input.
 * It searches through titles and descriptions and updates the view.
 */
function searchTasks() {
  const ALL_TASKS = JSON.parse(sessionStorage.tasks);
  const SEARCH_INPUT = document.getElementById("search_tasks").value;
  const SEARCH_CONTAINER = document.getElementById("search_container");
  const SEARCH_VALUE = [];

  ALL_TASKS.filter((task) => {
    const TITLE = String(task.title || "").toLowerCase();
    const DESCRIPTION = String(task.description || "").toLowerCase();
    const SEARCH_LOWER = SEARCH_INPUT.trim().toLowerCase();
    if (TITLE.includes(SEARCH_LOWER) || DESCRIPTION.includes(SEARCH_LOWER)) {
      SEARCH_VALUE.push(task);
    }
  });

  SEARCH_CONTAINER.classList.toggle("nothing-found", SEARCH_VALUE.length === 0);

  renderBoard(SEARCH_VALUE);
}

/**
 * Opens the detailed view of a task.
 * It finds the task by ID and fills the detail dialog with its information.
 *
 * @param {string} taskId - The ID of the task to show.
 */
function openTaskDetailDialog(taskId) {
  const TASK_DETAIL_DIALOG = document.getElementById("task_detail_dialog");
  TASK_DETAIL_DIALOG.innerHTML = ""; // Clear previous content

  const ALL_TASKS = JSON.parse(sessionStorage.tasks);
  const TASK = ALL_TASKS.find((task) => task.id === taskId);
  if (TASK) {
    CURRENT_DETAIL_TASK = TASK;
    TASK_DETAIL_DIALOG.innerHTML = buildTaskDetailDialog(TASK);
    TASK_DETAIL_DIALOG.showModal();
    TASK_DETAIL_DIALOG.querySelector(".detail-task--content").scrollTop = 0;
  }
}

/**
 * Closes the task detail dialog when the user clicks the background.
 *
 * @param {Event} event - The click event.
 */
function closeTaskDetailDialogOnBackdropClick(event) {
  const TASK_DETAIL_DIALOG = document.getElementById("task_detail_dialog");
  if (event.target === TASK_DETAIL_DIALOG) {
    closeTaskDetailDialog();
  }
}

/**
 * Closes the task detail dialog using the slide-out animation.
 *
 * @returns {Promise} Resolves when the dialog is closed.
 */
function closeTaskDetailDialog() {
  const TASK_DETAIL_DIALOG = document.getElementById("task_detail_dialog");
  return slideOutDialog(TASK_DETAIL_DIALOG);
}

/**
 * Creates the HTML content for the task detail window.
 * It fills the template with the task information, adds the assigned users,
 * and lists all subtasks.
 *
 * @param {Object} task - The task object containing all details.
 * @returns {string} The finished HTML code for the dialog.
 */
function buildTaskDetailDialog(task) {
  let taskID = task.id;
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
      SUBTASK_LIST.innerHTML += getDetailSubtaskTemplate(subtask.title, subtask.done, taskID);
    });
  }
  return WRAPPER.innerHTML;
}

/**
 * Starts the edit process.
 * Opens the edit dialog on top of the detail view — no slide animation.
 *
 * @param {string} taskId - The ID of the task to be edited.
 */
function openEditTaskDialog(taskId) {
  const ALL_TASKS = JSON.parse(sessionStorage.tasks);
  const task = ALL_TASKS.find((t) => t.id === taskId);
  if (!task) return;
  const dialog = document.getElementById("edit_task_dialog");
  dialog.addEventListener("click", closeEditDialogOnBackdropClick);
  dialog.showModal();
  fillEditFormFields(task);
  setupEditTaskInteractions(task);
}

/**
 * Fills the basic text fields and priority in the edit form.
 *
 * @param {Object} task - The task object with all information.
 */
function fillEditFormFields(task) {
  const form = document.getElementById("form_edit_task");
  if (form) form.scrollTop = 0;
  document.getElementById("title").value = task.title || "";
  document.getElementById("description").value = task.description || "";
  document.getElementById("category").value = task.category || "";
  const dueDateInput = document.getElementById("dueDate");
  dueDateInput.min = new Date().toISOString().split("T")[0];
  dueDateInput.value = task.dueDate || "";
  selectPriority(task.priority || "medium");
}

/**
 * Prepares the subtasks, users, and the save button for the edit form.
 *
 * @param {Object} task - The task object with all information.
 */
function setupEditTaskInteractions(task) {
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

/**
 * Closes the edit task dialog instantly (no animation).
 * The detail dialog remains open underneath.
 */
function closeEditTaskDialog() {
  const dialog = document.getElementById("edit_task_dialog");
  dialog.close();
}

/**
 * Closes the edit window when the user clicks on the dark background (backdrop).
 * It checks if the click was on the background and not on the content inside.
 *
 * @param {Event} event - The mouse click event.
 */
function closeEditDialogOnBackdropClick(event) {
  if (event.target === document.getElementById("edit_task_dialog")) {
    closeEditTaskDialog();
  }
}

/**
 * Loads all users from the database to edit a task.
 * It fills the dropdown menu and checks the boxes for users already assigned to the task.
 * Finally, it updates the small preview icons.
 *
 * @param {Array} assignedTo - A list of user names already assigned to this task.
 */
async function loadUsersForEdit(assignedTo) {
  const USER_URL = "https://join-3135-default-rtdb.europe-west1.firebasedatabase.app/users.json";
  try {
    const response = await fetch(USER_URL);
    const data = await response.json();
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
  } catch (err) {
    console.error("Error in loadUsersForEdit:", err);
  }
}

/**
 * Main function to handle the edit process.
 * Coordinates data building, saving, and UI updates.
 */
async function saveEditedTask(task) {
  const updated = buildTaskObj();
  updated.id = task.id;
  updated.status = task.status;
  updated.firebaseKey = task.firebaseKey;
  await updateTaskData(updated);
  const ALL_TASKS = JSON.parse(sessionStorage.tasks);
  renderBoard(ALL_TASKS);
  closeEditTaskDialog();
  refreshTaskDetailDialog(updated.id);
}

/**
 * Refreshes the detail dialog content in-place without reopening it.
 *
 * @param {string} taskId - The ID of the task to refresh.
 */
function refreshTaskDetailDialog(taskId) {
  const TASK_DETAIL_DIALOG = document.getElementById("task_detail_dialog");
  const ALL_TASKS = JSON.parse(sessionStorage.tasks);
  const TASK = ALL_TASKS.find((task) => task.id === taskId);
  if (TASK) {
    CURRENT_DETAIL_TASK = TASK;
    TASK_DETAIL_DIALOG.innerHTML = buildTaskDetailDialog(TASK);
    TASK_DETAIL_DIALOG.querySelector(".detail-task--content").scrollTop = 0;
  }
}

/**
 * Handles saving the task to SessionStorage and Firebase.
 */
async function updateTaskData(updatedTask) {
  const ALL_TASKS = JSON.parse(sessionStorage.tasks || "[]");
  const idx = ALL_TASKS.findIndex((t) => t.id === updatedTask.id);
  if (idx !== -1) {
    ALL_TASKS[idx] = updatedTask;
    sessionStorage.tasks = JSON.stringify(ALL_TASKS);
  }
  try {
    const response = await fetch(getTaskURL(updatedTask.firebaseKey), {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        title: updatedTask.title,
        description: updatedTask.description,
        dueDate: updatedTask.dueDate,
        category: updatedTask.category,
        assignedTo: updatedTask.assignedTo,
        priority: updatedTask.priority,
        subtasks: updatedTask.subtasks,
      }),
    });
  } catch (err) {
    console.error("Error saving edited task to Firebase:", err);
  }
}

/**
 * Deletes a task from the board and the database.
 * It removes the task from the local storage, updates the board view,
 * closes the detail window, and deletes the task from Firebase.
 *
 * @param {Object} task - The task object that should be deleted.
 */
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
