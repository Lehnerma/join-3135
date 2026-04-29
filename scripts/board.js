const TASK_URL = "https://join-3135-default-rtdb.europe-west1.firebasedatabase.app/tasks" + ".json";
const STATUS = ["todo", "progress", "feedback", "done"];
let TASKS = [];

function initBoard() {
  NO_TASKS();
  loadTasksFirebase();
}

// function loadTasks() {
//   return JSON.parse(localStorage.getItem("tasks")) || [];
// }

// function renderBoard() {
//   let tasks = loadTasks();

//   let todo = document.getElementById("todo-list");
//   let inProgress = document.getElementById("inprogress-list");
//   let feedback = document.getElementById("feedback-list");
//   let done = document.getElementById("done-list");

//   todo.innerHTML = "";
//   inProgress.innerHTML = "";
//   feedback.innerHTML = "";
//   done.innerHTML = "";

//   function getProgress(subtasks) {
//     let done = subtasks.filter((s) => s.done).length;
//     let total = subtasks.length;
//     return { done, total };
//   }

//   for (let i = 0; i < tasks.length; i++) {
//     let task = tasks[i];

//     let progress = getProgress(task.subtasks || []);
//     let percent = progress.total ? (progress.done / progress.total) * 100 : 0;

let card = `
                            <div class="task-card">
                            
                                <div class="category-label">${task.category}</div>
                                <div class="task-title">${task.title}</div>
                                <div class="task-description">${task.description}</div>
                            
                                ${
                                  progress.total > 0
                                    ? `
                                <div class="subtask-progress" title="${progress.done} of ${progress.total} subtasks done">
                                    <div class="progress-bar-bg">
                                        <div class="progress-bar-fill" style="width:${percent}%"></div>
                                    </div>
                                    <span>${progress.done}/${progress.total} Subtasks</span>
                                </div>
                                `
                                    : ""
                                }
                            
                                <div class="subtask-list">
                                    ${(task.subtasks || [])
                                      .map(
                                        (sub, subIndex) => `
                                        <div class="subtask-item" onclick="toggleSubtask(${i}, ${subIndex})">
                                            ${sub.done ? "✔" : "❌"} ${sub.title}
                                        </div>
                                    `,
                                      )
                                      .join("")}
                                </div>
                            
                                <div class="task-footer">
                                    <span>${task.priority}</span>
                                </div>
                            
                            </div>
                            `;

//     if (task.status === "todo") {
//       todo.innerHTML += card;
//     }

//     if (task.status === "inProgress") {
//       inProgress.innerHTML += card;
//     }

//     if (task.status === "feedback") {
//       feedback.innerHTML += card;
//     }

//     if (task.status === "done") {
//       done.innerHTML += card;
//     }
//   }
// }

// renderBoard();

// function toggleSubtask(taskIndex, subIndex) {
//   let tasks = JSON.parse(localStorage.getItem("tasks"));

//   tasks[taskIndex].subtasks[subIndex].done = !tasks[taskIndex].subtasks[subIndex].done;

//   localStorage.setItem("tasks", JSON.stringify(tasks));
//   renderBoard();
// }

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

async function loadTasksFirebase() {
  try {
    const RESPONSE = await fetch(TASK_URL);
    if (!RESPONSE.ok) {
      throw new Error(`loading task faild: ${RESPONSE.status}`);
    }
    const RESULT = await RESPONSE.json();
    TASKS.push(RESULT);
  } catch (er) {
    console.error(er);
  }
}
