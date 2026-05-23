const GREETING = document.getElementById('summary-greeting');
const OVERVIEW = document.getElementById('summary-overview');
const HEADLINE = document.getElementById('summary-headline');
const TASKS_URL = "https://join-3135-default-rtdb.europe-west1.firebasedatabase.app/tasks" + ".json";

/**
 * Initializes the summary page by loading the user data, 
 * triggers the greeting logic, and renders the task statistics.
 */
function initSummary() {
  loggedInUserName();
  showGreeting();
  renderAmountOfTasks();
}

/**
 * Retrieves the active user from session storage, determines the greeting text 
 * based on the current time, and updates the DOM greeting elements.
 */
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

/**
 * Determines the appropriate greeting string based on the current hour of the day.
 * @returns {string} The greeting string (e.g., "Good morning", "Good evening").
 */
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

/**
 * Handles the responsive visibility of the greeting elements.
 * Displays a temporary fullscreen mobile animation if the user just logged in.
 */
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

/**
 * Executes the mobile-only greeting animation sequence and 
 * switches visibility to the overview container after a timeout.
 */
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
/**
 * Forces instant visibility of the summary content on mobile devices
 * bypassing the animated greeting sequence.
 */
function showMobileWithoutGreeting() {
  GREETING.classList.remove('summary-greeting-mobile');
  GREETING.classList.add('d-none');
  OVERVIEW.classList.remove('d-none');
  HEADLINE.classList.remove('d-none');
}

/**
 * Fetches tasks from the Firebase Realtime Database.
 * @returns {Promise<Object>} A promise resolving to the tasks data.
 */
async function fetchTasks() {
  let tasksResult = await fetch(TASKS_URL);
  let tasksData = await tasksResult.json();
  return tasksData;
}

/**
 * Coordinates fetching task data and distributes filtered counts 
 * into the respective summary dashboard DOM elements.
 */
function renderAmountOfTasks() {
 fetchTasks().then(tasksData => {
    document.getElementById('todo-amount').innerHTML = showAmountOfTasks(tasksData, 'todo');
    document.getElementById('done-amount').innerHTML = showAmountOfTasks(tasksData, 'done');
    document.getElementById('urgent-amount').innerHTML = showAmountOfUrgentTasks(tasksData, "urgent");
    document.getElementById('board-amount').innerHTML = showAmountOnBoard(tasksData);
    document.getElementById('progress-amount').innerHTML = showAmountOfTasks(tasksData, 'progress');
    document.getElementById('feedback-amount').innerHTML = showAmountOfTasks(tasksData, 'feedback');
    showDeadlineOfUrgentTasks(tasksData, document.getElementById('summary-urgent-text'));
  });
}

/**
 * Counts tasks that match a specific status string.
 * @param {Object} data - The raw tasks database object.
 * @param {string} status - The task status to filter by (e.g., 'todo', 'done').
 * @returns {number} Amount of tasks matching the status.
 */
function showAmountOfTasks(data, status) {
  let amountStatus = Object.values(data).filter(task => task.status === status).length;
  return amountStatus;
}

/**
 * Counts all tasks currently on the board that are not yet 'done'.
 * @param {Object} data - The raw tasks database object.
 * @returns {number} Amount of active board tasks.
 */
function showAmountOnBoard(data) {
  let amountOnBoard = Object.values(data).filter(task => task.status !== 'done').length;
  return amountOnBoard;
}

/**
 * Counts all tasks with a specific priority that are not yet 'done'.
 * @param {Object} data - The raw tasks database object.
 * @param {string} priority - The task priority to filter by (e.g., 'urgent').
 * @returns {number} Amount of tasks matching the priority.
 */
function showAmountOfUrgentTasks(data, priority) {
  let amountUrgent = Object.values(data).filter(task => task.priority === priority && task.status !== 'done').length;
  return amountUrgent;
}

/**
 * Triggers a loading visual indicator on a tab element and redirects to the board page.
 * @param {string} currentTab - The DOM ID of the clicked element to style.
 */
function openBoard(currentTab) {
  document.getElementById(currentTab).classList.add('is-loading');
  window.location.href = './board.html';
}

/**
 * Filters incomplete urgent tasks with valid due dates and sorts them chronologically.
 * @param {Object} data - The raw tasks database object.
 * @returns {Array} Sorted array of urgent task objects.
 */
function getSortedUrgentTasks(data) {
  return Object.values(data)
    .filter(t => t.priority === 'urgent' && t.status !== 'done' && t.dueDate && !isNaN(new Date(t.dueDate).getTime()))
    .sort((a, b) => new Date(a.dueDate) - new Date(b.dueDate));
}

/**
 * Filters out incomplete, urgent tasks, determines the earliest upcoming 
 * deadline date, and renders it inside the UI.
 * @param {Object} data - The raw tasks database object.
 * @param {HTMLElement} URGENT_TEXT - The DOM element where the status text is displayed.
 */
function showDeadlineOfUrgentTasks(data, URGENT_TEXT) {
  const URGENT_DATE = document.getElementById('summary-urgent-date');
  const URGENT_TASKS = getSortedUrgentTasks(data);
  
  if (URGENT_TASKS.length === 0) {
    URGENT_DATE.innerHTML = "";
    URGENT_TEXT.innerHTML = "No upcoming deadlines";
  } else {
    URGENT_DATE.innerHTML = formatDate(URGENT_TASKS[0].dueDate);
    URGENT_TEXT.innerHTML = "Upcoming deadline";
  }
}

/**
 * Formats a valid date string into an US-styled text format (e.g., "October 24, 2026").
 * @param {string} dateString - The raw date string from the database.
 * @returns {string} Formatted date text or an empty string if invalid.
 */
function formatDate(dateString) {
  if (!dateString) return "";
  const date = new Date(dateString);
  if (isNaN(date.getTime())) return "";

  const options = { month: 'long', day: 'numeric', year: 'numeric' };
  return date.toLocaleDateString('en-US', options);
}