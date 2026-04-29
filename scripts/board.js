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

// function loadTasks() {
//   return JSON.parse(sessionStorage.getItem("tasks")) || [];
// }

function renderBoard(tasks){
  const TASKS = tasks;
  // for (let t = 0; t < TASKS.length; t++) {
  //   console.log(TASKS[t]);
    
  // }
  TASKS.forEach((task) => {
    
    
  })
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


