const TASK_URL = "https://join-3135-default-rtdb.europe-west1.firebasedatabase.app/tasks" + ".json";

let selectedPriority = "medium";
let subtasks = [];

function init() {
  btnInit();
}

function btnInit() {
  const FORM = document.getElementById("form_task");
  subtaskInit();
  FORM.addEventListener("submit", (event) => getFormData(event));

}

function selectPriority(priority) {
  const priorities = ["urgent", "medium", "low"];
  priorities.forEach((prio) => {
    document.getElementById(`btn_${prio}`).classList.remove(`${prio}-active`);
  });
  document.getElementById(`btn_${priority}`).classList.add(`${priority}-active`);
  selectedPriority = priority;
}

function subtaskInit(){
  const SUBTASK_INPUT = document.getElementById("subtask");
  const SUBTASK_SAVE = document.getElementById("subtask-save");
  const SUBTASK_CLEAR = document.getElementById("subtask-close");
  SUBTASK_SAVE.addEventListener("click", addSubtask);
  SUBTASK_CLEAR.addEventListener("click", () => {
    SUBTASK_INPUT.value = ""; // closing the subtask 
  });

//   SUBTASK_INPUT.addEventListener("keydown", (e) => {
//     if (e.key === "Enter") {
//       e.preventDefault();
//       addSubtask();
//     }
//   });
}


function addSubtask() {
  const INPUT = document.getElementById("subtask");
  const TITLE = input.value.trim();
  if (!TITLE) return;

  const INDEX = subtasks.length;
  subtasks.push({ TITLE });
  INPUT.value = "";

  renderSubtaskItem(INDEX, TITLE);
}

function renderSubtaskItem(index, title) {
  const list = document.getElementById("subtask-list");
  const li = document.createElement("li");
  li.className = "subtask-item";
  li.dataset.index = index;
  li.innerHTML = `
    <span class="subtask-text">${escapeHtml(title)}</span>
    <div class="subtask-item--btns">
      <button type="button" class="btn--subtask btn--delete">
        <img src="../assets/img/icons/subtask/bin.svg" alt="delete" />
      </button>
      <span class="div-vert"></span>
      <button type="button" class="btn--subtask btn--edit">
        <img src="../assets/img/icons/subtask/edit.svg" alt="edit" />
      </button>
    </div>`;

  li.querySelector(".subtask-text").addEventListener("dblclick", () => startEditSubtask(li));
  li.querySelector(".btn--delete").addEventListener("click", () => deleteSubtask(li));
  li.querySelector(".btn--edit").addEventListener("click", () => {
    if (li.classList.contains("editing")) saveSubtask(li);
    else startEditSubtask(li);
  });

  list.appendChild(li);
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
