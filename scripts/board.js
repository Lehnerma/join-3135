const getTaskURL = (key = "", section = "") => {
  return `https://join-3135-default-rtdb.europe-west1.firebasedatabase.app/tasks/${key ? key + "/" : ""}${section ? section + "/" : ""}.json`;
}; 

let TASKS = [];
let DRAG_ID;
let DRAG_OLD_STATUS;
let DRAG_HEIGHT;



function initBoard() {
  initBoardTask();
  loadTasksFromFirebase();
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
    // console.log(TASKS);
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
    await fetch(getTaskURL (firebaseKey, "status"), {
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

function buildTaskCard(task) {
  const WRAPPER = document.createElement("div");
  WRAPPER.innerHTML = getTaskCardTemplet(task.title, task.description, task.category, task.id, getPriority(task.priority));

  const SUBTASKS = Array.isArray(task.subtasks) ? task.subtasks : [];
  const SUB_TOTAL = SUBTASKS.length;
  const SUB_DONE = SUBTASKS.filter((s) => s.done === true).length;
  WRAPPER.querySelector(".subtask--progress-container").innerHTML = getSubtaskProgressTemplate(SUB_DONE, SUB_TOTAL);

  const ASSIGNEES_LIST = WRAPPER.querySelector(".task--assignees");
  (task.assignedTo || []).filter(Boolean).forEach((name) => {
    ASSIGNEES_LIST.innerHTML += getTaskAssignToTemplet(name, getInitials(name));
  });


  return WRAPPER.innerHTML;
}

function openTaskDialog(id) {
  const task = TASKS.find(t => t.id === id);
  if (!task) return;

  console.log(task);
  const dialog = document.getElementById("taskDialog");
  dialog.classList.remove("d-none");



  dialog.innerHTML = `
  <p>Category: ${task.category}</p>
  <h2>${task.title}</h2>
  <p>${task.description}</p>
  <p>Due Date: ${task.dueDate}</p>
  <p>Priority: ${task.priority}</p>
  <p>Assigned To: ${task.assignedTo ? task.assignedTo.join(", ") : "None"}</p>
  <p>Subtasks: ${task.subtasks ? task.subtasks.map(s => s.title).join(", ") : "None"}</p>
  
  <button onclick="closeTaskDialog()">X</button>

  <button onclick="deleteTask('${task.firebaseKey}')">
    Delete
  </button>


  <button onclick="editTask('${task.firebaseKey}')">
    Edit
  </button>
  `;
}


function closeTaskDialog() {
  const dialog = document.getElementById("taskDialog");

  dialog.classList.add("d-none");
  dialog.innerHTML = "";
}



async function deleteTask(firebaseKey) {
  try {
    const response = await fetch(getBoardTaskURL(firebaseKey),
      {
        method: "DELETE",
      });
      
    if (!response.ok) {throw new Error(`Delete failed: ${response.status}`);}

    TASKS = TASKS.filter(task =>task.firebaseKey !== firebaseKey);
    renderBoard(TASKS);
    closeTaskDialog();  

    console.log("Task deleted");
  }

  catch (error) {console.error(error);}

}



function getPriority(priority) {
  const VALID = ["low", "medium", "urgent"];
  return VALID.includes(priority) ? priority : "low";
}


function getInitials(name = "") {
  if (typeof name !== "string") return "";
  const parts = name.trim().split(" ");
  if (!parts[0]) return "";
  const last =
    parts.length > 1
      ? parts[parts.length - 1].charAt(0).toUpperCase()
      : "";
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
  const ALL_TASKS = JSON.parse(sessionStorage.tasks);
  DRAG_OLD_STATUS = ALL_TASKS.find((el) => el.id === id)?.status;
}

//drag over
function allowDrop(ev) {
  ev.preventDefault();
}


//drag enter
function columnDragEnter(ev, status) {
  ev.preventDefault();
  const LIST = document.getElementById(status + "_list");
  if (LIST.querySelector(".drag-placeholder")) return;
  const PLACE_HOLDER = document.createElement("li"); //change the name of the variable
  PLACE_HOLDER.classList.add("drag-placeholder");
  if (DRAG_HEIGHT) PLACE_HOLDER.style.height = DRAG_HEIGHT + "px";
  LIST.appendChild(PLACE_HOLDER);
}


//drag leave
function columnDragLeave(ev) {
  if (ev.currentTarget.contains(ev.relatedTarget)) return;
  ev.currentTarget.querySelector(".drag-placeholder")?.remove();
}


//drag drop
function taskDragDrop(status) {
  document.querySelectorAll(".drag-placeholder").forEach((el) => el.remove());
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
