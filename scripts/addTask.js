const TASK_URL = "https://join-3135-default-rtdb.europe-west1.firebasedatabase.app/tasks" + ".json";

let selectedPriority = "medium";
let SUBTASKS = [];

function init() {
  btnInit();
  initDateInput();
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
    assignedTo: val("assignedTo"),
    priority: selectedPriority,
    status: "todo",
    subtasks: SUBTASKS,
  };
}

// user loading for the assignet to dropdown
// displaz the user icon

