let tasks = [];
let dragId;
let dragOldStatus;
let dragHeight;

/**
 * Builds the Firebase REST API URL for tasks.
 * @param {string} [key=""] - Optional Firebase key of a specific task.
 * @param {string} [section=""] - Optional field path within the task.
 * @returns {string} The full Firebase URL.
 */
const getTaskURL = (key = "", section = "") => {
  return `https://join-3135-default-rtdb.europe-west1.firebasedatabase.app/tasks/${key ? key + "/" : ""}${section ? section + "/" : ""}.json`;
};

/**
 * Initialises the board: sets up UI interactions and loads data from Firebase.
 */
async function initBoard() {
  initBoardTask();
  loadTasksFromFirebase();
}

/**
 * Fetches all tasks from Firebase, stores them in session storage, and renders the board.
 * @returns {Promise<void>}
 */
async function loadTasksFromFirebase() {
  try {
    const RESPONSE = await fetch(getTaskURL());
    if (!RESPONSE.ok) {
      throw new Error(`loading task failed: ${RESPONSE.status}`);
    }
    const RESULT = await RESPONSE.json();
    const TASKS_ARRAY = getArryFromResult(RESULT);
    sessionStorage.setItem("tasks", JSON.stringify(TASKS_ARRAY));
    tasks = TASKS_ARRAY;
    renderBoard(tasks);
  } catch (er) {
    console.error(er);
  }
}


/**
 * Converts the Firebase result object into an array with id and firebaseKey added.
 * @param {Object} result - Raw Firebase response object.
 * @returns {Array<Object>} Array of task objects enriched with id and firebaseKey.
 */
function getArryFromResult(result) {
  if (!result) return [];
  
  return Object.entries(result).map(([key, values], index) => ({
    id: index,
    firebaseKey: key,
    ...values,
  }));
}

/**
 * Writes the full task to Firebase via PUT, overwriting all fields at the given key.
 * @param {Object} task - The task object including firebaseKey and id.
 * @returns {Promise<void>}
 */
async function syncTaskWithFirebase(task) {
  const { firebaseKey, id, ...data } = task;
  try {
    await fetch(getTaskURL(firebaseKey), {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
  } catch (er) {
    console.error("syncTaskWithFirebase fehlgeschlagen:", er);
  }
}

/**
 * Updates only the status field of a task in Firebase.
 * @param {string} firebaseKey - The Firebase key of the task.
 * @param {string} status - The new status value.
 * @returns {Promise<void>}
 */
async function updateTaskStatus(firebaseKey, status) {
  try {
    await fetch(getTaskURL(firebaseKey, "status"), {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(status),
    });
  } catch (er) {
    console.error(er);
  }
}

/**
 * Renders all four board columns for the given tasks.
 * @param {Array<Object>} tasks - Array of all task objects.
 */
function renderBoard(tasks) {
  const STATUS = ["todo", "progress", "feedback", "done"];
  STATUS.forEach((status) => {
    renderColumn(
      status,
      tasks.filter((task) => task.status === status),
    );
  });
}

/**
 * Renders a single board column with the matching tasks.
 * @param {string} status - The column status key (e.g. "todo", "progress").
 * @param {Array<Object>} tasks - Tasks to display in this column.
 */
function renderColumn(status, tasks) {
  const LIST = document.getElementById(status + "_list");
  LIST.innerHTML = "";
  if (tasks.length === 0) {
    LIST.innerHTML = getNoTasksTemplate(status);
    return;
  }
  tasks.forEach((task) => (LIST.innerHTML += buildTaskCard(task)));
}


/**
 * Builds the HTML string for a single task card, including subtask progress and assignees.
 * @param {Object} task - The task object.
 * @returns {string} HTML string for the task card.
 */
function buildTaskCard(task) {
  const WRAPPER = document.createElement("div");  
  WRAPPER.innerHTML = getTaskCardTemplet(task.title, task.description, task.category, task.id, getPriority(task.priority));
  addSubtaskProgress(WRAPPER, task.subtasks);
  addAssignees(WRAPPER, task.assignedTo);
  return WRAPPER.innerHTML;
}

/**
 * Adds subtask progress to the task card.
 * @param {HTMLElement} wrapper - The task card wrapper element.
 * @param {Array<Object>} subtasks - The subtasks array.
 */
function addSubtaskProgress(wrapper, subtasks) {
  const SUBTASKS = Array.isArray(subtasks) ? subtasks : [];
  const SUB_DONE = SUBTASKS.filter((s) => s.done === true).length;
  wrapper.querySelector(".subtask--progress-container").innerHTML = getSubtaskProgressTemplate(SUB_DONE, SUBTASKS.length);
}

/**
 * Adds assignees to the task card.
 * @param {HTMLElement} wrapper - The task card wrapper element.
 * @param {Array<{name: string, color: string}>} assignedTo - The assignees array.
 */
function addAssignees(wrapper, assignedTo) {
  const ASSIGNEES_LIST = wrapper.querySelector(".task--assignees");
  if (!ASSIGNEES_LIST || !assignedTo?.length) return;
  ASSIGNEES_LIST.innerHTML = assignedTo
    .map(({ name, color }) => getTaskAssignToTemplet(name, getInitials(name), color))
    .join("");
}

/**
 * Opens the task overview dialog and populates it with the given task's data.
 * @param {number} id - The local id of the task.
 */
function openTaskDialog(id) {
  const task = tasks.find((t) => t.id === id);
  if (!task) return;
  const dialog = document.getElementById("taskDialog");
  dialog.classList.remove("d-none");
  dialog.innerHTML = getTaskDialogTemplate(task);
}

/**
 * Hides and clears the task overview dialog.
 */
function closeTaskDialog() {
  const dialog = document.getElementById("taskDialog");

  dialog.classList.add("d-none");
  dialog.innerHTML = "";
}

/**
 * Deletes a task from Firebase, removes it from the local list, and refreshes the board.
 * @param {string} firebaseKey - The Firebase key of the task to delete.
 * @returns {Promise<void>}
 */
async function deleteTask(firebaseKey) {
  try {
    const response = await fetch(getBoardTaskURL(firebaseKey), {
      method: "DELETE",
    });
    if (!response.ok) {
      throw new Error(`Delete failed: ${response.status}`);
    }
    tasks = tasks.filter((task) => task.firebaseKey !== firebaseKey);
    renderBoard(tasks);
    closeTaskDialog();
  } catch (error) {
    console.error(error);
  }
}

/**
 * Returns the priority string if valid, otherwise falls back to "low".
 * @param {string} priority - The raw priority value.
 * @returns {string} A valid priority: "low", "medium", or "urgent".
 */
function getPriority(priority) {
  const PRIO = ["low", "medium", "urgent"];
  return PRIO.includes(priority) ? priority : "low";
}

/**
 * Extracts the uppercase initials from a full name.
 * @param {string} [name=""] - The full name.
 * @returns {string} Up to two uppercase initial letters.
 */
function getInitials(name = "") {
  if (typeof name !== "string") return "";
  const parts = name.trim().split(" ");
  if (!parts[0]) return "";
  const last = parts.length > 1 ? parts[parts.length - 1].charAt(0).toUpperCase() : "";
  return parts[0].charAt(0).toUpperCase() + last;
}

/**
 * Renders the "no tasks" placeholder into the given status column.
 * @param {string} status - The column status key.
 */
function renderNoTasksElemt(status) {
  let LIST = document.getElementById(status + "_list");
  LIST.innerHTML = "";
  LIST.innerHTML += getNoTasksTemplate(status);
}

/**
 * Handles the dragstart event for a task card.
 * @param {DragEvent} ev - The drag event.
 * @param {number} id - The id of the task being dragged.
 */
function taskDragStart(ev, id) {
  dragId = id;
  dragHeight = ev.currentTarget.offsetHeight;
  ev.currentTarget.classList.add("task--dragging");
  const ALL_TASKS = JSON.parse(sessionStorage.tasks);
  dragOldStatus = ALL_TASKS.find((el) => el.id === id)?.status;
}

/**
 * Finds the task element directly after the cursor position during a drag.
 * @param {HTMLElement} list - The column list element.
 * @param {number} y - The current cursor Y position.
 * @returns {HTMLElement|null} The element to insert before, or null to append at the end.
 */
function getDragAfterElement(list, y) {
  const tasks = [...list.querySelectorAll(".task")];
  return (
    tasks.reduce(
      (closest, child) => {
        const box = child.getBoundingClientRect();
        const offset = y - box.top - box.height / 2;
        if (offset < 0 && offset > closest.offset) {
          return { offset, element: child };
        }
        return closest;
      },
      { offset: Number.NEGATIVE_INFINITY },
    ).element ?? null
  );
}

/**
 * Handles dragover on a board column: shows a positional drop placeholder.
 * @param {DragEvent} ev - The drag event.
 * @param {string} status - The target column's status key.
 */
function columnDragOver(ev, status) {
  ev.preventDefault();
  if (status === dragOldStatus) return;
  const LIST = document.getElementById(status + "_list");
  LIST.querySelector(".no-task")?.style.setProperty("display", "none");

  let placeholder = LIST.querySelector(".drag-placeholder");
  if (!placeholder) {
    placeholder = document.createElement("li");
    placeholder.classList.add("drag-placeholder");
    if (dragHeight) placeholder.style.height = dragHeight + "px";
  }

  const afterElement = getDragAfterElement(LIST, ev.clientY);
  afterElement ? LIST.insertBefore(placeholder, afterElement) : LIST.appendChild(placeholder);
}

/**
 * Handles dragleave on a board column: removes the drop placeholder.
 * @param {DragEvent} ev - The drag event.
 */
function columnDragLeave(ev) {
  if (ev.currentTarget.contains(ev.relatedTarget)) return;
  ev.currentTarget.querySelector(".drag-placeholder")?.remove();
  ev.currentTarget.querySelector(".no-task")?.style.removeProperty("display");
}

/**
 * Clears drag-related UI elements and styles.
 */
function clearDragState() {
  document.querySelectorAll(".drag-placeholder").forEach((el) => el.remove());
  document.querySelectorAll(".task--dragging").forEach((el) => el.classList.remove("task--dragging"));
}

/**
 * Updates task status and re-renders affected columns.
 * @param {string} oldStatus - The previous column's status key.
 * @param {string} newStatus - The target column's status key.
 * @param {Array} allTasks - All tasks from sessionStorage.
 */
function updateTaskColumns(oldStatus, newStatus, allTasks) {
  renderColumn(
    oldStatus,
    allTasks.filter((t) => t.status === oldStatus),
  );
  renderColumn(
    newStatus,
    allTasks.filter((t) => t.status === newStatus),
  );
}

/**
 * Handles a drop on a board column: updates the task status locally and in Firebase.
 * @param {string} status - The target column's status key.
 */
function taskDragDrop(status) {
  clearDragState();
  const ALL_TASKS = JSON.parse(sessionStorage.tasks);
  const CURRENT_TASK = ALL_TASKS.find((el) => el.id === dragId);
  if (!CURRENT_TASK || CURRENT_TASK.status === status) return;
  CURRENT_TASK.status = status;
  sessionStorage.setItem("tasks", JSON.stringify(ALL_TASKS));
  updateTaskColumns(dragOldStatus, status, ALL_TASKS);
  updateTaskStatus(CURRENT_TASK.firebaseKey, status);
}