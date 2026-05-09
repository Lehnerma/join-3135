const GREETING = document.getElementById('summary-greeting');
const OVERVIEW = document.getElementById('summary-overview');
const HEADLINE = document.getElementById('summary-headline');
const TASKS_URL = "https://join-3135-default-rtdb.europe-west1.firebasedatabase.app/tasks" + ".json";


function initSummary() {
  loggedInUserName();
  showGreeting();
  renderAmountOfTasks();
}

function loggedInUserName() {
  const GREETING_NAME = document.getElementById("greeting-name");
  const GREETING_TEXT = document.getElementById("greeting-text");
  const FULL_NAME = sessionStorage.getItem('activeUserName');
  let current_greeting = showGreetingText();
  if (FULL_NAME !== "Guest") {
    GREETING_TEXT.innerHTML = current_greeting + ",";
    GREETING_NAME.innerHTML = FULL_NAME;
  } else {
    GREETING_TEXT.innerHTML = current_greeting + "!";
    GREETING_NAME.innerHTML = "";
  }
}

function showGreetingText() {
  const TIME_NOW = new Date();
  const HOUR = TIME_NOW.getHours();
  let current_greeting;
  if (HOUR < 11) {
    current_greeting = "Good morning";
  } else if (HOUR < 15) {
    current_greeting = "Good day";
  } else if (HOUR < 18) {
    current_greeting = "Good afternoon";
  } else {
    current_greeting = "Good evening";
  }
  return current_greeting;
}

function showGreeting() {
  const WIDTH = window.innerWidth;
  const referrer = document.referrer;
  if (WIDTH >= 1024) {
    GREETING.classList.remove('d-none');
    OVERVIEW.classList.remove('d-none');
    HEADLINE.classList.remove('d-none');
    return;
  }
  else if (WIDTH < 1024 && referrer.includes('index.html') && sessionStorage.getItem('justLoggedIn') === 'true') {
    showMobileWithGreeting();
  } else {
    showMobileWithoutGreeting();
  }
}

function showMobileWithGreeting() {
  GREETING.classList.remove('summary-greeting');
  GREETING.classList.add('summary-greeting-mobile');
  GREETING.classList.remove('d-none');
  setTimeout(() => {
    GREETING.classList.add('animate-fade-out');
    setTimeout(() => {
      OVERVIEW.classList.remove('d-none');
      HEADLINE.classList.remove('d-none');
      GREETING.classList.add('d-none');
      GREETING.classList.remove('summary-greeting-mobile');
    }, 1000);
  }, 2500);
  sessionStorage.setItem('justLoggedIn', 'false');
}

function showMobileWithoutGreeting() {
  GREETING.classList.remove('summary-greeting-mobile');
  GREETING.classList.add('d-none');
  OVERVIEW.classList.remove('d-none');
  HEADLINE.classList.remove('d-none');
}

async function fetchTasks() {
  let tasksResult = await fetch(TASKS_URL);
  let tasksData = await tasksResult.json();
  return tasksData;
}

function renderAmountOfTasks() {
  fetchTasks().then(tasksData => {
    const TODO_AMOUNT = document.getElementById('todo-amount');
    const DONE_AMOUNT = document.getElementById('done-amount');
    const URGENT_AMOUNT = document.getElementById('urgent-amount');
    const BOARD_AMOUNT = document.getElementById('board-amount');
    const PROGRESS_AMOUNT = document.getElementById('progress-amount');
    const FEEDBACK_AMOUNT = document.getElementById('feedback-amount');
    const URGENT_TEXT = document.getElementById('summary-urgent-text');
    TODO_AMOUNT.innerHTML = showAmountOfTasks(tasksData, 'todo');
    DONE_AMOUNT.innerHTML = showAmountOfTasks(tasksData, 'done');
    URGENT_AMOUNT.innerHTML = showAmountOfUrgentTasks(tasksData, "urgent");
    BOARD_AMOUNT.innerHTML = showAmountOnBoard(tasksData);
    PROGRESS_AMOUNT.innerHTML = showAmountOfTasks(tasksData, 'progress');
    FEEDBACK_AMOUNT.innerHTML = showAmountOfTasks(tasksData, 'feedback');
    showDeadlineOfUrgentTasks(tasksData, URGENT_TEXT);
  });
}


function showAmountOfTasks(data, status) {
  // const TASKS = JSON.parse('tasksData');
  let amountStatus = Object.values(data).filter(task => task.status === status).length;
  return amountStatus;
}

function showAmountOnBoard(data) {
  let amountOnBoard = Object.values(data).filter(task => task.status !== 'done').length;
  return amountOnBoard;
}

function showAmountOfUrgentTasks(data, priority) {
  let amountUrgent = Object.values(data).filter(task => task.priority === priority && task.status !== 'done').length;
  return amountUrgent;
}

function openBoard(currentTab) {
  document.getElementById(currentTab).classList.add('is-loading');
  window.location.href = './board.html';
}

function showDeadlineOfUrgentTasks(data, URGENT_TEXT) {
  console.log("Daten in Deadline-Funktion:", data);
  const URGENT_DATE = document.getElementById('summary-urgent-date');
  const TASKS = Object.values(data);
  console.log("Gefundene Tasks:", TASKS);
  const URGENT_TASKS = TASKS.filter(task => {
    if (task.priority !== 'urgent' || task.status === 'done' || !task.dueDate) {
      return false;
    }
    const taskDate = new Date(task.dueDate);
    return !isNaN(taskDate.getTime());
  });
  console.log("Gefundene Urgent-Tasks nach Filter:", URGENT_TASKS);
  if (URGENT_TASKS.length === 0) {
    URGENT_DATE.innerHTML = "";
    URGENT_TEXT.innerHTML = "No upcoming deadlines";
  } else {
    URGENT_TASKS.sort((a, b) => {
      return new Date(a.dueDate) - new Date(b.dueDate);
    });
    URGENT_DATE.innerHTML = formatDate(URGENT_TASKS[0].dueDate);
    URGENT_TEXT.innerHTML = "Upcoming deadline";
  }
}

function formatDate(dateString) {
  if (!dateString) return "";
  const date = new Date(dateString);
  if (isNaN(date.getTime())) return "";

  const options = { month: 'long', day: 'numeric', year: 'numeric' };
  return date.toLocaleDateString('en-US', options);
}
