const TASK_URL = (key = "", section = "") => {
  return `https://join-3135-default-rtdb.europe-west1.firebasedatabase.app/tasks/${key ? key + "/" : ""}${section ? section + "/" : ""}.json`;
};
const STATUS = ["todo", "progress", "feedback", "done"];
let TASKS = [];
let DRAG_ID;
let DRAG_OLD_STATUS;

function initBoard() {
  loadTasksFromFirebase();
}

async function loadTasksFromFirebase() {
  try {
    const RESPONSE = await fetch(TASK_URL());
    if (!RESPONSE.ok) {
      throw new Error(`loading task faild: ${RESPONSE.status}`);
    }
    const RESULT = await RESPONSE.json();
    const TASKS_ARRAY = getArryFromResult(RESULT);
    sessionStorage.setItem("tasks", JSON.stringify(TASKS_ARRAY));
    TASKS.push(TASKS_ARRAY);
    renderBoard(TASKS_ARRAY);
  } catch (er) {
    console.error(er);
  }
}

//get ids into the tasks array for the dragging functions
function getArryFromResult(result) {
  return Object.entries(result).map(([key, values], index) => ({
    id: index,
    firebaseKey: key,
    ...values,
  }));
}

async function updateTaskStatus(firebaseKey, status) {
  try {
    await fetch(TASK_URL(firebaseKey,'status'), {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(status),
    });
  } catch (er) {
    console.error(er);
  }
}

function renderBoard(tasks) {
  STATUS.forEach((status) => {
    renderColumn(
      status,
      tasks.filter((task) => task.status === status),
    );
  });
}

function renderColumn(status, tasks) {
  const LIST = document.getElementById(status + "_list");
  LIST.innerHTML = "";
  if (tasks.length === 0) {
    LIST.innerHTML = getNoTasksTemplate(status);
    return;
  }
  tasks.forEach((task) => (LIST.innerHTML += buildTaskCard(task)));
}

function buildTaskCard(task) {
  const WRAPPER = document.createElement("div");
  WRAPPER.innerHTML = getTaskCardTemplet(task.title, task.description, task.category, task.id);

  const SUBTASKS = task.subtasks || [];
  const SUB_TOTAL = SUBTASKS.length;
  const SUB_DONE = SUBTASKS.filter((s) => s.done === true).length;
  WRAPPER.querySelector(".subtask--progress-container").innerHTML = getSubtaskProgressTemplate(SUB_DONE, SUB_TOTAL);

  const ASSIGNEES_LIST = WRAPPER.querySelector(".task--assignees");
  (task.assignedTo || []).forEach((name) => {
    ASSIGNEES_LIST.innerHTML += getTaskAssignToTemplet(name, getInitials(name));
  });
  return WRAPPER.innerHTML;
}

function getInitials(name) {
  const parts = name.trim().split(" ");
  const last = parts.length > 1 ? parts[parts.length - 1].charAt(0).toUpperCase() : "";
  return parts[0].charAt(0).toUpperCase() + last;
}

function renderNoTasksElemt(status) {
  let LIST = document.getElementById(status + "_list");
  LIST.innerHTML = "";
  LIST.innerHTML += getNoTasksTemplate(status);
}

//drag start
function taskDragStart(id) {
  DRAG_ID = id;
  const ALL_TASKS = JSON.parse(sessionStorage.tasks);
  DRAG_OLD_STATUS = ALL_TASKS.find((el) => el.id === id)?.status;
}

//drag over
function allowDrop(ev) {
  ev.preventDefault();
}
//drag enter

//drag leave

//drag drop
function taskDragDrop(status) {
  const ALL_TASKS = JSON.parse(sessionStorage.tasks);
  const CURRENT_TASK = ALL_TASKS.find((el) => el.id === DRAG_ID);
  if (!CURRENT_TASK || CURRENT_TASK.status === status) return;
  CURRENT_TASK.status = status;
  sessionStorage.setItem("tasks", JSON.stringify(ALL_TASKS));
  renderColumn(
    DRAG_OLD_STATUS,
    ALL_TASKS.filter((t) => t.status === DRAG_OLD_STATUS),
  );
  renderColumn(
    status,
    ALL_TASKS.filter((t) => t.status === status),
  );
  updateTaskStatus(CURRENT_TASK.firebaseKey, status);
}
