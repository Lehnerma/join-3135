const TASK_URL = "https://join-3135-default-rtdb.europe-west1.firebasedatabase.app/tasks" + ".json";

let selectedPriority = "medium";
let SUBTASKS = [];

function init() {
  btnInit();
  subtaskInit();
  initDateInput();
}

function btnInit() {
  const FORM = document.getElementById("form_task");

  FORM.addEventListener("submit", (event) => getFormData(event));
}

/**
 * Get the actuall Date - and set the default value of the date input to today.
 */
function initDateInput() {
  const dueDateInput = document.getElementById("dueDate");
  const now = new Date();
  const today = now.toISOString().split('T')[0];
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
 * Initial all subtasks function after loading the body
 */
function subtaskInit() {
  const SUBTASK_SAVE = document.getElementById("subtask-save");
  const SUBTASK_CLEAR = document.getElementById("subtask-close");
  const SUBTASK_INPUT = document.getElementById("subtask_input");
  SUBTASK_SAVE.addEventListener("click", (event) => addSubtask(event));
  SUBTASK_CLEAR.addEventListener("click", (event) => clearSubtaskInput(event));
  SUBTASK_INPUT.addEventListener("keydown", (e) => {
    if (e.key === "Enter") {
      e.preventDefault();
      addSubtask();
    }
  });
}

/**
 * Clear the input of the Subtask
 */
const clearSubtaskInput = (ev) => {
  ev.preventDefault();
  let SUBTASK_INPUT = document.getElementById("subtask_input");
  SUBTASK_INPUT.value = "";
};

/**
 * Adds the subtask to the array (SUBTASKS) and render the subtasks
 * @returns a savety point to get out of the funktion if no title is in it. or it`s length is shorter than 5 letters.
 */
function addSubtask(ev) {
  ev.preventDefault();
  const INPUT = document.getElementById("subtask_input");
  const TITLE = INPUT.value.trim();
  if (!TITLE && TITLE.length > 5) return;
  const INDEX = SUBTASKS.length;
  SUBTASKS.push({ TITLE });
  INPUT.value = "";

  renderSubtaskItem(INDEX, TITLE);
}

/**
 * Render the subtask - also creat the eventlistender for the subtask to edit it inline - also set dataset with an index.
 * @param {String} index
 * @param {String} title
 */
function renderSubtaskItem(index, title) {
  const LIST = document.getElementById("subtask-list");
  const LI = document.createElement("li");
  LI.className = "subtask-item";
  LI.dataset.index = index;
  LI.innerHTML = getSubtaskTemplate(title);

  LI.querySelector(".subtask-text").addEventListener("dblclick", () => startEditSubtask(LI));
  LI.querySelector(".btn--delete").addEventListener("click", () => deleteSubtask(LI));
  LI.querySelector(".btn--edit").addEventListener("click", () => {
    if (LI.classList.contains("editing")) {
      saveSubtask(LI);
    } else {
      startEditSubtask(LI);
    }
  });

  LIST.appendChild(LI);
}

function startEditSubtask(li) {
  if (li.classList.contains("editing")) return;

  li.classList.add("editing");

  const span = li.querySelector(".subtask-text");
  const input = document.createElement("input");
  input.type = "text";
  input.className = "subtask-edit-input";
  input.value = span.textContent;
  input.addEventListener("keydown", (e) => {
    if (e.key === "Enter") saveSubtask(li);
    if (e.key === "Escape") cancelEditSubtask(li);
  });

  li.replaceChild(input, span);
  li.querySelector(".btn--edit img").src = "../assets/img/icons/subtask/check.svg";

  input.focus();
  input.select();
}

function saveSubtask(li) {
  const input = li.querySelector(".subtask-edit-input");
  if (!input) return;

  const newTitle = input.value.trim();
  if (!newTitle) return;

  subtasks[parseInt(li.dataset.index)].title = newTitle;

  const span = document.createElement("span");
  span.className = "subtask-text";
  span.textContent = newTitle;
  span.addEventListener("dblclick", () => startEditSubtask(li));
  li.replaceChild(span, input);

  li.classList.remove("editing");
  li.querySelector(".btn--edit img").src = "../assets/img/icons/subtask/edit.svg";
}

function cancelEditSubtask(li) {
  const input = li.querySelector(".subtask-edit-input");
  if (!input) return;

  const span = document.createElement("span");
  span.className = "subtask-text";
  span.textContent = subtasks[parseInt(li.dataset.index)].title;
  span.addEventListener("dblclick", () => startEditSubtask(li));
  li.replaceChild(span, input);

  li.classList.remove("editing");
  li.querySelector(".btn--edit img").src = "../assets/img/icons/subtask/edit.svg";
}

function deleteSubtask(li) {
  subtasks.splice(parseInt(li.dataset.index), 1);
  li.remove();
  document.querySelectorAll("#subtask-list .subtask-item").forEach((item, i) => {
    item.dataset.index = i;
  });
}

function escapeHtml(str) {
  const div = document.createElement("div");
  div.textContent = str;
  return div.innerHTML;
}

function getFormData(ev) {
  ev.preventDefault();
  const task = buildTaskObj();
  console.log(task);
  return task;
}

function buildTaskObj() {
  return {
    title: document.getElementById("title").value,
    description: document.getElementById("description").value,
    dueDate: document.getElementById("dueDate").value,
    category: document.getElementById("category").value,
    assignedTo: document.getElementById("assignedTo").value,
    priority: selectedPriority,
    status: "todo",
    subtasks: subtasks,
  };
}
