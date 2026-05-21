const getTaskURL = (key = "", section = "") => {
  return `https://join-3135-default-rtdb.europe-west1.firebasedatabase.app/tasks/${key ? key + "/" : ""}${section ? section + "/" : ""}.json`;
};

let TASKS = [];
let DRAG_ID;
let DRAG_OLD_STATUS;
let DRAG_HEIGHT;
const USERS=[]

function initBoard() {
  initBoardTask();
  loadTasksFromFirebase();
  loadUsersFromFirebase()
}

async function loadTasksFromFirebase() {
  try {
    const RESPONSE = await fetch(getTaskURL());
    if (!RESPONSE.ok) {
      throw new Error(`loading task faild: ${RESPONSE.status}`);
    }
    const RESULT = await RESPONSE.json();
    const TASKS_ARRAY = getArryFromResult(RESULT);
    sessionStorage.setItem("tasks", JSON.stringify(TASKS_ARRAY));
    TASKS.push(...TASKS_ARRAY);
    renderBoard(TASKS_ARRAY);
  } catch (er) {
    console.error(er);
  }
}

const USER_URL = "https://join-3135-default-rtdb.europe-west1.firebasedatabase.app/users"+".json"
async function loadUsersFromFirebase() {
  try {
    const RESPONSE = await fetch(USER_URL);
    if (!RESPONSE.ok) {
      throw new Error(`loading users failed: ${RESPONSE.status}`);
    }
    const RESULT = await RESPONSE.json();
    const USER_ARRY = getUserArry(RESULT)
    USERS.push(...USER_ARRY)
    sessionStorage.setItem("users", JSON.stringify(USER_ARRY));
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
function getUserArry(result) {
  return Object.entries(result).map(([key, values], index) => ({
    id: index,
    name: values.name,
    color: values.color
  }));
}

// Schreibt den vollständigen Task per PUT in Firebase – überschreibt alle Felder am richtigen Key.
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

function renderBoard(tasks) {
  const STATUS = ["todo", "progress", "feedback", "done"];
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

function getAssigneeColor(name){
  const users = JSON.parse(sessionStorage.getItem('users'))
  const user = users.find((u) => u.name === name);
  return user ? user.color : "#ccc";
}

function buildTaskCard(task) {
  const WRAPPER = document.createElement("div");
  WRAPPER.innerHTML = getTaskCardTemplet(task.title, task.description, task.category, task.id, getPriority(task.priority));

  const SUBTASKS = Array.isArray(task.subtasks) ? task.subtasks : [];
  const SUB_TOTAL = SUBTASKS.length;
  const SUB_DONE = SUBTASKS.filter((s) => s.done === true).length;
  WRAPPER.querySelector(".subtask--progress-container").innerHTML = getSubtaskProgressTemplate(SUB_DONE, SUB_TOTAL);

  const ASSIGNEES_LIST = WRAPPER.querySelector(".task--assignees");
  if (task.assignedTo) {
    task.assignedTo.forEach((name) => {
      ASSIGNEES_LIST.innerHTML += getTaskAssignToTemplet(name, getInitials(name), getAssigneeColor(name));
    });
  }

  return WRAPPER.innerHTML;
}

function openTaskDialog(id) {
  const task = TASKS.find((t) => t.id === id);
  if (!task) return;

  const dialog = document.getElementById("taskDialog");
  dialog.classList.remove("d-none");
  dialog.innerHTML = getTaskDialogTemplate(task);
}

function closeTaskDialog() {
  const dialog = document.getElementById("taskDialog");

  dialog.classList.add("d-none");
  dialog.innerHTML = "";
}

async function deleteTask(firebaseKey) {
  try {
    const response = await fetch(getBoardTaskURL(firebaseKey), {
      method: "DELETE",
    });
    if (!response.ok) {
      throw new Error(`Delete failed: ${response.status}`);
    }

    TASKS = TASKS.filter((task) => task.firebaseKey !== firebaseKey);
    renderBoard(TASKS);
    closeTaskDialog();

    console.log("Task deleted");
  } catch (error) {
    console.error(error);
  }
}

function getPriority(priority) {
  const PRIO = ["low", "medium", "urgent"];
  return PRIO.includes(priority) ? priority : "low";
}

function getInitials(name = "") {
  if (typeof name !== "string") return "";
  const parts = name.trim().split(" ");
  if (!parts[0]) return "";
  const last = parts.length > 1 ? parts[parts.length - 1].charAt(0).toUpperCase() : "";
  return parts[0].charAt(0).toUpperCase() + last;
}

function renderNoTasksElemt(status) {
  let LIST = document.getElementById(status + "_list");
  LIST.innerHTML = "";
  LIST.innerHTML += getNoTasksTemplate(status);
}

//drag start
function taskDragStart(ev, id) {
  DRAG_ID = id;
  DRAG_HEIGHT = ev.currentTarget.offsetHeight;
  ev.currentTarget.classList.add("task--dragging");
  const ALL_TASKS = JSON.parse(sessionStorage.tasks);
  DRAG_OLD_STATUS = ALL_TASKS.find((el) => el.id === id)?.status;
}

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

function columnDragOver(ev, status) {
  ev.preventDefault();
  if (status === DRAG_OLD_STATUS) return;
  const LIST = document.getElementById(status + "_list");
  LIST.querySelector(".no-task")?.style.setProperty("display", "none");

  let placeholder = LIST.querySelector(".drag-placeholder");
  if (!placeholder) {
    placeholder = document.createElement("li");
    placeholder.classList.add("drag-placeholder");
    if (DRAG_HEIGHT) placeholder.style.height = DRAG_HEIGHT + "px";
  }

  const afterElement = getDragAfterElement(LIST, ev.clientY);
  afterElement ? LIST.insertBefore(placeholder, afterElement) : LIST.appendChild(placeholder);
}

function columnDragLeave(ev) {
  if (ev.currentTarget.contains(ev.relatedTarget)) return;
  ev.currentTarget.querySelector(".drag-placeholder")?.remove();
  ev.currentTarget.querySelector(".no-task")?.style.removeProperty("display");
}

//drag drop
function taskDragDrop(status) {
  document.querySelectorAll(".drag-placeholder").forEach((el) => el.remove());
  document.querySelectorAll(".task--dragging").forEach((el) => el.classList.remove("task--dragging"));
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
