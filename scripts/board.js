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
    sessionStorage.setItem('tasks', JSON.stringify(RESULT))
    renderBoard(RESULT)
  } catch (er) {
    console.error(er);
  }
}


const renderBoard = (tasks) => {
  STATUS.forEach((status) => {
    renderColumn(status, tasks.filter((task) => task.status === status));
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
  const wrapper = document.createElement("div");
  wrapper.innerHTML = getTaskCardTemplet(task.title, task.description);
  const assigneesList = wrapper.querySelector(".task--assignees");
  console.log(assigneesList);
  
  (task.assignee || []).forEach((name) => {
    assigneesList.innerHTML += getTaskAssignToTemplet(name, getInitials(name));
  });
  return wrapper.innerHTML;
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

// only for programming
function NO_TASKS() {
  STATUS.forEach((s) => {
    renderNoTasksElemt(s);
  });
}


