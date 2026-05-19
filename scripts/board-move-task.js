const STATUS_LABELS = {
  todo: "To do",
  progress: "In Progress",
  feedback: "Await feedback",
  done: "Done",
};

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

function openMoveTaskDialog(event, taskId, btn) {
  event.stopPropagation();
  const ALL_TASKS = JSON.parse(sessionStorage.tasks);
  const TASK = ALL_TASKS.find((t) => t.id === taskId);
  if (!TASK) return;

  closeMoveDropdown();

  const targets = MOVE_TARGETS[TASK.status] ?? [];
  const dropdown = buildMoveDropdown(taskId, targets);
  positionDropdown(dropdown, btn);
  document.body.appendChild(dropdown);

  setTimeout(() => document.addEventListener("click", closeMoveDropdownOnOutside, { once: true }), 0);
}

function buildMoveDropdown(taskId, targets) {
  const el = document.createElement("div");
  el.id = "move_task_dropdown";
  el.className = "moveTaskDropdown";
  el.innerHTML = getMoveDropdownTemplate(taskId, targets);
  return el;
}

function positionDropdown(dropdown, btn) {
  const rect = btn.getBoundingClientRect();
  dropdown.style.top = `${rect.bottom + 8}px`;
  dropdown.style.left = `${rect.left + rect.width / 2}px`;
  dropdown.style.transform = "translateX(-50%)";
}

function getMoveDropdownTemplate(taskId, targets) {
  const btns = targets.map((t) => getMoveButtonTemplate(taskId, t)).join("");
  return `
    <p class="moveTaskDropdown__label">Move to</p>
    <ul class="moveTaskDropdown__list">${btns}</ul>
  `;
}

function getMoveButtonTemplate(taskId, { status, direction }) {
  const icon = direction === "up" ? "arrow_drop_up" : "arrow_drop_down";
  return `
    <li>
      <button type="button" class="moveTaskDropdown__btn" onclick="moveTaskToStatus(${taskId}, '${status}')">
        <img src="../assets/img/icons/general/${icon}.svg" alt="${direction}" class="moveTaskDropdown__arrow">
        <span>${STATUS_LABELS[status]}</span>
      </button>
    </li>
  `;
}

function closeMoveDropdown() {
  document.getElementById("move_task_dropdown")?.remove();
}

function closeMoveDropdownOnOutside(e) {
  if (!document.getElementById("move_task_dropdown")?.contains(e.target)) {
    closeMoveDropdown();
  }
}

async function moveTaskToStatus(taskId, newStatus) {
  closeMoveDropdown();
  const ALL_TASKS = JSON.parse(sessionStorage.tasks);
  const TASK = ALL_TASKS.find((t) => t.id === taskId);
  if (!TASK || TASK.status === newStatus) return;

  const OLD_STATUS = TASK.status;
  TASK.status = newStatus;
  sessionStorage.setItem("tasks", JSON.stringify(ALL_TASKS));

  renderColumn(OLD_STATUS, ALL_TASKS.filter((t) => t.status === OLD_STATUS));
  renderColumn(newStatus, ALL_TASKS.filter((t) => t.status === newStatus));
  await updateTaskStatus(TASK.firebaseKey, newStatus);
}
