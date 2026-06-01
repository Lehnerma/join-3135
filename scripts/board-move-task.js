/**
 * Status label map for the move-task dropdown.
 */
const STATUS_LABELS = {
  todo: "To-do",
  progress: "Progress",
  feedback: "Feedback",
  done: "Done",
};

/**
 * Move targets configuration for each task status.
 */
const MOVE_TARGETS = {
  todo: [{ status: "progress", direction: "down" }],
  progress: [
    { status: "todo", direction: "up" },
    { status: "feedback", direction: "down" },
  ],
  feedback: [
    { status: "progress", direction: "up" },
    { status: "done", direction: "down" },
  ],
  done: [{ status: "feedback", direction: "up" }],
};

/**
 * Opens the move-task dropdown for a task card.
 * @param {Event} event - The click event (stops propagation).
 * @param {number} taskId - The id of the task to move.
 * @param {HTMLElement} btn - The button that triggered the dropdown.
 */
function openMoveTaskDialog(event, taskId, btn) {
  event.stopPropagation();
  const ALL_TASKS = JSON.parse(sessionStorage.tasks);
  const TASK = ALL_TASKS.find((task) => task.id === taskId);
  if (!TASK) return;

  closeMoveDropdown();

  const TARGETS = MOVE_TARGETS[TASK.status] ?? [];
  const DROPDOWN = buildMoveDropdown(taskId, TARGETS);
  document.body.appendChild(DROPDOWN);
  positionDropdown(DROPDOWN, btn);

  setTimeout(() => document.addEventListener("click", closeMoveDropdownOnOutside), 0);
  document.addEventListener("scroll", closeMoveDropdown, { capture: true, once: true });
}

/**
 * Creates the move-task dropdown element and fills it with move options.
 * @param {number} taskId - The id of the task.
 * @param {Array<Object>} targets - List of move targets with status and direction.
 * @returns {HTMLElement} The constructed dropdown element.
 */
function buildMoveDropdown(taskId, targets) {
  const BUTTONS_HTML = buildMoveButtonsHtml(taskId, targets);
  const ELEMENT = document.createElement("div");
  ELEMENT.id = "move_task_dropdown";
  ELEMENT.className = "moveTaskDropdown";
  ELEMENT.innerHTML = getMoveDropdownTemplate(BUTTONS_HTML);
  return ELEMENT;
}

/**
 * Builds the HTML for all move-target buttons.
 * @param {number} taskId - The id of the task.
 * @param {Array<Object>} targets - List of move targets with status and direction.
 * @returns {string} Concatenated list item HTML.
 */
function buildMoveButtonsHtml(taskId, targets) {
  return targets.map((target) => {
    const icon = target.direction === "up" ? "arrow_upward" : "arrow_downward";
    const label = STATUS_LABELS[target.status];
    return getMoveButtonTemplate(taskId, target.status, target.direction, icon, label);
  }).join("");
}

/**
 * Positions the dropdown for setting the next status relative to the button.
 * @param {HTMLElement} dropdown - The dropdown element to position.
 * @param {HTMLElement} btn - The button element to position relative to.
 */
function positionDropdown(dropdown, btn) {
  const RECT = btn.getBoundingClientRect();
  dropdown.style.top = `${RECT.bottom - 24}px`;

  const OVERFLOWS_RIGHT = RECT.left + dropdown.offsetWidth > window.innerWidth - 8;
  dropdown.style.left = OVERFLOWS_RIGHT ? `${RECT.right - dropdown.offsetWidth + 24}px` : `${RECT.left}px`;
}

/**
 * Removes the move-task dropdown from the DOM and cleans up its event listener.
 */
function closeMoveDropdown() {
  document.getElementById("move_task_dropdown")?.remove();
  document.removeEventListener("click", closeMoveDropdownOnOutside);
}

/**
 * Closes the move dropdown when the user clicks outside it.
 * @param {MouseEvent} e - The click event.
 */
function closeMoveDropdownOnOutside(e) {
  if (!document.getElementById("move_task_dropdown")?.contains(e.target)) {
    closeMoveDropdown();
  }
}

/**
 * Moves a task to a new status, updates session storage, re-renders the affected columns, and syncs to Firebase.
 * @param {number} taskId - The id of the task to move.
 * @param {string} newStatus - The target status key.
 * @returns {Promise<void>}
 */
async function moveTaskToStatus(taskId, newStatus) {
  closeMoveDropdown();
  const ALL_TASKS = JSON.parse(sessionStorage.tasks);
  const TASK = ALL_TASKS.find((t) => t.id === taskId);
  if (!TASK || TASK.status === newStatus) return;

  const OLD_STATUS = TASK.status;
  TASK.status = newStatus;
  sessionStorage.setItem("tasks", JSON.stringify(ALL_TASKS));

  renderColumn(
    OLD_STATUS,
    ALL_TASKS.filter((t) => t.status === OLD_STATUS),
  );
  renderColumn(
    newStatus,
    ALL_TASKS.filter((t) => t.status === newStatus),
  );
  await updateTaskStatus(TASK.firebaseKey, newStatus);
}