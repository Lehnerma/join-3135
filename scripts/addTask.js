const TASK_URL = "https://join-3135-default-rtdb.europe-west1.firebasedatabase.app/tasks" + ".json";
const USER_URL = "https://join-3135-default-rtdb.europe-west1.firebasedatabase.app/users" + ".json";
let selectedPriority = "medium";
let SUBTASKS = [];
let USERS = [];

const contactColors = {
  A: 'rgba(147, 39, 255, 1)',
  B: 'rgba(110, 82, 255, 1)',
  C: 'rgba(252, 113, 255, 1)',
  D: 'rgba(255, 187, 43, 1)',
  E: 'rgba(31, 215, 193, 1)',
  F: 'rgba(70, 47, 138, 1)',
  G: 'rgba(255, 70, 70, 1)',
  H: 'rgba(0, 190, 232, 1)',
  I: 'rgba(42, 61, 89, 1)',
  J: 'rgba(255, 94, 179, 1)',
  K: 'rgba(255, 116, 94, 1)',
  L: 'rgba(255, 163, 94, 1)',
  M: 'rgba(255, 199, 1, 1)',
  N: 'rgba(0, 56, 255, 1)',
  O: 'rgba(195, 255, 43, 1)',
  P: 'rgba(255, 230, 43, 1)',
  Q: 'rgba(255, 70, 150, 1)',
  R: 'rgba(0, 150, 130, 1)',
  T: 'rgba(0, 120, 255, 1)',
  U: 'rgba(180, 40, 40, 1)',
  V: 'rgba(100, 200, 0, 1)',
  W: 'rgba(150, 0, 255, 1)',
  X: 'rgba(0, 255, 200, 1)',
  Y: 'rgba(200, 150, 0, 1)',
  Z: 'rgba(120, 120, 120, 1)'
};

function init() {
  console.log("INIT läuft");
  console.log("dropdown:", document.getElementById("dropdown"));

  btnInit();
  initDateInput();
  loadUserFromFirebase();
}

/**
 * Initial all btns in the form.
 */
function btnInit() {
  const FORM = document.getElementById("form_task");
  const CLEAR_FORM = document.getElementById("form_clear");
  FORM.addEventListener("submit", (event) => getFormData(event));
}

/**
 * Get the actuall Date - and set the default value of the date input to today.
 */
function initDateInput() {
  const dueDateInput = document.getElementById("dueDate");
  const now = new Date();
  const today = now.toISOString().split("T")[0];
  dueDateInput.min = today;
  dueDateInput.value = today;
}

/**
 * set the priority of the Task - and hightlight it.
 * @param {String} priority
 */
function selectPriority(priority) {
  const priorities = ["urgent", "medium", "low"];
  priorities.forEach((prio) => {
    document.getElementById(`btn_${prio}`).classList.remove(`${prio}-active`);
  });
  document.getElementById(`btn_${priority}`).classList.add(`${priority}-active`);
  selectedPriority = priority;
}

/**
 * Resets the task form to its default state and clears all subtasks.
 */
function clearForm() {
  document.getElementById("form_task").reset();
  initDateInput();
  selectPriority("medium");
  SUBTASKS = [];
  document.getElementById("subtask_list").innerHTML = "";
}

/**
 * Get the Form inputs into a Object to put it into firebase
 * @param {event} ev - the browser knows where we click
 * @returns
 */
function getFormData(ev) {
  ev.preventDefault();
  return buildTaskObj();
}

/**
 * Helper func to creat the task object for put to database
 * @returns Task Object
 */
function buildTaskObj() {
  const val = (id) => document.getElementById(id).value;
  return {
    title: val("title"),
    description: val("description"),
    dueDate: val("dueDate"),
    category: val("category"),
    assignedTo: getAssignedUsers(),
    priority: selectedPriority,
    status: "todo",
    subtasks: SUBTASKS,
  };
}

// user loading for the assignet to dropdown
// displaz the user icon

async function loadUserFromFirebase() {
  try {
    const RESPONSE = await fetch(USER_URL);
    if (!RESPONSE.ok) {
      throw new Error(`${RESPONSE.status}`);
    }
    const USERS_RESULT = await RESPONSE.json();
    // sessionStorage.setItem("users", JSON.stringify(USERS_RESULT));
    const USERS_ARRAY = Object.values(USERS_RESULT);
    
  } catch (error) {
    console.error(error);
  }
}

function getInitials(name) {
  let splitNames = name.split(' ');
  console.log(splitNames);
  let currentInitial = '';
  currentInitial += splitNames[0].charAt(0).toUpperCase();
  if (splitNames.length > 1) {
    currentInitial += splitNames[splitNames.length - 1].charAt(0).toUpperCase();
  }
  return currentInitial;
}