const GREETING = document.getElementById('summary_greeting');
const OVERVIEW = document.getElementById('summary_overview');
const HEADLINE = document.getElementById('summary_headline');
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
  const GREETING_NAME = document.getElementById("greeting_name");
  const GREETING_TEXT = document.getElementById("greeting_text");
  const FULL_NAME = sessionStorage.getItem('activeUserName');
  const CURRENT_GREETING = showGreetingText();
  if (FULL_NAME !== "Guest") {
    GREETING_TEXT.innerHTML = CURRENT_GREETING + ",";
    GREETING_NAME.innerHTML = FULL_NAME;
  } else {
    GREETING_TEXT.innerHTML = CURRENT_GREETING + "!";
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
  const REFERRER = document.referrer;
  if (WIDTH >= 1024) {
    GREETING.classList.remove('d-none');
    OVERVIEW.classList.remove('d-none');
    HEADLINE.classList.remove('d-none');
    return;
  }
  else if (WIDTH < 1024 && REFERRER.includes('index.html') && sessionStorage.getItem('justLoggedIn') === 'true') {
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
  const TASKS_RESULT = await fetch(TASKS_URL);
  const TASKS_DATA = await TASKS_RESULT.json();
  return TASKS_DATA;
}

/**
 * Coordinates fetching task data and distributes filtered counts 
 * into the respective summary dashboard DOM elements.
 */
function renderAmountOfTasks() {
 fetchTasks().then(tasks_data => {
    document.getElementById('todo_amount').innerHTML = showAmountOfTasks(tasks_data, 'todo');
    document.getElementById('done_amount').innerHTML = showAmountOfTasks(tasks_data, 'done');
    document.getElementById('urgent_amount').innerHTML = showAmountOfUrgentTasks(tasks_data, "urgent");
    document.getElementById('board_amount').innerHTML = showAmountOnBoard(tasks_data);
    document.getElementById('progress_amount').innerHTML = showAmountOfTasks(tasks_data, 'progress');
    document.getElementById('feedback_amount').innerHTML = showAmountOfTasks(tasks_data, 'feedback');
    showDeadlineOfUrgentTasks(tasks_data, document.getElementById('summary_urgent_text'));
  });
}

/**
 * Counts tasks that match a specific status string.
 * @param {Object} data - The raw tasks database object.
 * @param {string} status - The task status to filter by (e.g., 'todo', 'done').
 * @returns {number} Amount of tasks matching the status.
 */
function showAmountOfTasks(data, status) {
  const AMOUNT_STATUS = Object.values(data).filter(task => task.status === status).length;
  return AMOUNT_STATUS;
}

/**
 * Counts all tasks currently on the board that are not yet 'done'.
 * @param {Object} data - The raw tasks database object.
 * @returns {number} Amount of active board tasks.
 */
function showAmountOnBoard(data) {
  const AMOUNT_ON_BOARD = Object.values(data).filter(task => task.status).length;
  return AMOUNT_ON_BOARD;
}

/**
 * Counts all tasks with a specific priority that are not yet 'done'.
 * @param {Object} data - The raw tasks database object.
 * @param {string} priority - The task priority to filter by (e.g., 'urgent').
 * @returns {number} Amount of tasks matching the priority.
 */
function showAmountOfUrgentTasks(data, priority) {
  const AMOUNT_URGENT = Object.values(data).filter(task => task.priority === priority && task.status !== 'done').length;
  return AMOUNT_URGENT;
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
  const URGENT_DATE = document.getElementById('summary_urgent_date');
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
  const DATE = new Date(dateString);
  if (isNaN(DATE.getTime())) return "";

  const OPTIONS = { month: 'long', day: 'numeric', year: 'numeric' };
  return DATE.toLocaleDateString('en-US', OPTIONS);
}