let selectedPriority = "medium";
let subtasks = [];

function selectPriority(prio) {
  selectedPriority = prio;

  document.getElementById("btn-urgent").classList.remove("urgent-active");
  document.getElementById("btn-medium").classList.remove("medium-active");
  document.getElementById("btn-low").classList.remove("low-active");

  const activeBtn = document.getElementById("btn-" + prio);
  activeBtn.classList.add(prio + "-active");
}

function createTask(event) {
  event.preventDefault();

  let title = document.getElementById("title").value;
  let dueDate = document.getElementById("dueDate").value;

  if (!title || !dueDate) {
    alert("Title and Due Date are required!");
    return;
  }

  let task = {
    title: title,
    description: document.getElementById("description").value,
    dueDate: dueDate,
    category: document.getElementById("category").value,
    assignedTo: document.getElementById("assignedTo").value,
    priority: selectedPriority,
    status: "todo",
    subtasks: subtasks,
  };

  let tasks = JSON.parse(localStorage.getItem("tasks")) || [];
  tasks.push(task);
  localStorage.setItem("tasks", JSON.stringify(tasks));

  showToast("Task added to board ✅");

  setTimeout(() => {
    window.location.href = "board.html";
  }, 1000);
}

window.onload = function () {
  selectPriority("medium");
};

function showToast(message) {
  let toast = document.getElementById("toast");
  toast.innerText = message;
  toast.classList.add("show");

  setTimeout(() => {
    toast.classList.remove("show");
  }, 2000);
}

function addSubtask() {
  let input = document.getElementById("subtaskInput");
  let value = input.value.trim();

  if (value === "") return;

  subtasks.push({
    title: value,
    done: false,
  });

  input.value = "";
  renderSubtasks();
}

function renderSubtasks() {
  let container = document.getElementById("subtaskList");

  container.innerHTML = "";

  for (let i = 0; i < subtasks.length; i++) {
    container.innerHTML += `
      <div class="subtask-item">
          <span class="dot">•</span>
          <span>${subtasks[i].title}</span>
          <span onclick="removeSubtask(${i})">✕</span>
      </div>
  `;
  }
}

function removeSubtask(index) {
  subtasks.splice(index, 1);
  renderSubtasks();
}

renderSubtasks();
