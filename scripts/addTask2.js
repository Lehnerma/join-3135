const TASK_URL = "https://join-3135-default-rtdb.europe-west1.firebasedatabase.app/tasks" + ".json";

let selectedPriority = "medium";
let subtasks = [];

function init() {
  btnInit();
}

function btnInit() {
  const FORM = document.getElementById("form_task");
  FORM.addEventListener("submit", (event) => getFormData(event));

  document.getElementById("subtask-save").addEventListener("click", addSubtask);
}

function selectPriority(priority) {
  const priorities = ["urgent", "medium", "low"];
  priorities.forEach((prio) => {
    document.getElementById(`btn_${prio}`).classList.remove(`${prio}-active`);
  });
  document.getElementById(`btn_${priority}`).classList.add(`${priority}-active`);
  selectedPriority = priority;
}

function addSubtask() {
  const input = document.getElementById("subtask");
  const title = input.value.trim();
  if (!title) return;
  subtasks.push({ title });
  input.value = "";
  console.log(subtasks);
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
