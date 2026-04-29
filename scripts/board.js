const TASK_URL = "https://join-3135-default-rtdb.europe-west1.firebasedatabase.app/tasks" + ".json";
const STATUS = ["todo", "progress", "feedback", "done"];
let TASKS = [];

function initBoard() {
  //NO_TASKS();
  loadTasksFromFirebase();
}

async function loadTasksFromFirebase() {
  try {
    const RESPONSE = await fetch(TASK_URL);
    if (!RESPONSE.ok) {
      throw new Error(`loading task faild: ${RESPONSE.status}`);
    }
    const RESULT = await RESPONSE.json();
    const TASKS_ARRAY = Object.entries(RESULT).map(([id, values]) => ({
      id,
      ...values,
    }));
    sessionStorage.setItem("tasks", JSON.stringify(TASKS_ARRAY));
    TASKS.push(TASKS_ARRAY);
    renderBoard(TASKS_ARRAY);
  } catch (er) {
    console.error(er);
  }
}

const renderBoard = (tasks) => {
  STATUS.forEach((status) => {
    renderColumn(
      status,
      tasks.filter((task) => task.status === status),
    );
  });
};

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
  WRAPPER.innerHTML = getTaskCardTemplet(task.title, task.description);
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
