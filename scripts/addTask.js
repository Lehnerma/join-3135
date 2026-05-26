const ADDTASK_URL = "https://join-3135-default-rtdb.europe-west1.firebasedatabase.app/tasks" + ".json";
let selectedPriority = "medium";
let remoteUsers = [];
sessionStorage.removeItem("task-status");

/**
 * Main entry point called on page load.
 * Initializes all modules and UI components.
 */
function init() {
  btnInit();
  subtaskInit();
  initDateInput();
  loadUsers();
  initDropdownOutsideClick();
  initAssignedPreviewResize();
  initValidationClearListeners();
}

/**
 * Attaches submit and clear listeners to the main form and clear button.
 */
function btnInit() {
  const FORM = document.getElementById("form_task");
  const CLEAR_FORM = document.getElementById("form_clear");
  registerFormSubmitListener(FORM);
  registerClearFormListener(CLEAR_FORM);
}

/**
 * Adds the red error border to an input and shows the error message.
 * @param {HTMLElement} input - The input element to mark invalid.
 * @param {string} errorId - The ID of the error message span.
 * @param {string} message - The error text to display (optional).
 */
function setError(input, errorId, message = "") {
  input.classList.add("input-invalid");

  const ERROR_EL = document.getElementById(errorId);
  if (ERROR_EL) {
    ERROR_EL.classList.remove("dnone");
    if (message) {
      ERROR_EL.textContent = message;
    }
  }
}

/**
 * Removes the red error border from an input and hides the error message.
 * @param {HTMLElement} input - The input element to clear.
 * @param {string} errorId - The ID of the error message span.
 */
function clearError(input, errorId) {
  input.classList.remove("input-invalid");
  const ERROR_EL = document.getElementById(errorId);
  if (ERROR_EL) {
    ERROR_EL.classList.add("dnone");
  }
}

/**
 * Attaches input/change listeners to required fields so validation errors
 * are cleared as soon as the user starts filling in the field.
 */
function initValidationClearListeners() {
  const fields = [
    { id: "title",    errorId: "title_error",    event: "input"  },
    { id: "due_date", errorId: "date_error",     event: "input"  },
    { id: "category", errorId: "category_error", event: "change" },
  ];
  fields.forEach(({ id, errorId, event }) => {
    const el = document.getElementById(id);
    if (!el) return;
    el.addEventListener(event, () => clearError(el, errorId));
  });
}

/**
 * Registers the submit event listener on the task form.
 * Prevents the default submission and triggers task creation.
 * @param {HTMLFormElement|null} form - The task form element.
 */
function registerFormSubmitListener(form) {
  if (!form) return;
  form.addEventListener("submit", (event) => {
    event.preventDefault();
    createTask();
  });
}

/**
 * Registers the click event listener on the clear-form button.
 * @param {HTMLElement|null} clearBtn - The clear button element.
 */
function registerClearFormListener(clearBtn) {
  if (!clearBtn) return;
  clearBtn.addEventListener("click", () => clearForm());
}

/**
 * Sets the date input to today's date on first focus and prevents past dates.
 */
function initDateInput() {
  const DUE_DATE_INPUT = document.getElementById("due_date");
  if (!DUE_DATE_INPUT) return;
  const NOW = new Date();
  const TODAY = NOW.toISOString().split("T")[0];
  DUE_DATE_INPUT.min = TODAY;
  DUE_DATE_INPUT.addEventListener("focus", () => {
    if (!DUE_DATE_INPUT.value) {
      DUE_DATE_INPUT.value = TODAY;
    }
  });
}

/**
 * Highlights the selected priority button and stores the choice.
 * @param {string} priority - One of 'urgent', 'medium', or 'low'.
 */
function selectPriority(priority) {
  const PRIORITIES = ["urgent", "medium", "low"];
  PRIORITIES.forEach((prio) => {
    document.getElementById(`btn_${prio}`).classList.remove(`${prio}-active`);
  });
  document.getElementById(`btn_${priority}`).classList.add(`${priority}-active`);
  selectedPriority = priority;
}

/**
 * Moves the active user to the front of the list, then sorts the rest alphabetically.
 * @param {Array<Object>} users - Array of user objects with a `name` property.
 * @returns {Array<Object>} Sorted array with the active user at position 0.
 */
function sortUsersWithActiveFirst(users) {
  const ACTIV_USER = sessionStorage.getItem("activeUserName");
  const SORTED = users.toSorted((a, b) => a.name.localeCompare(b.name));

  if (ACTIV_USER) {
    const ACTIVE_USER_INDEX = SORTED.findIndex((user) => user.name == ACTIV_USER);
    const ACTIVE_USER = SORTED.splice(ACTIVE_USER_INDEX, 1)[0];
    SORTED.unshift(ACTIVE_USER);
  }

  return SORTED;
}

/**
 * Fetches users from Firebase and fills the assignment dropdown.
 */
async function loadUsers() {
  const USER_URL = "https://join-3135-default-rtdb.europe-west1.firebasedatabase.app/users.json";
  try {
    const response = await fetch(USER_URL);
    const data = await response.json();
    remoteUsers = Object.values(data);
    const SORTED_USERS = sortUsersWithActiveFirst(remoteUsers);
    fillUserDropdown(SORTED_USERS);
  } catch (error) {
    console.error("Fehler beim Laden der Benutzer:", error);
  }
}

/**
 * Renders users into the assignment dropdown list.
 * @param {Object} users - Object or array of user data.
 */
function fillUserDropdown(users) {
  const CONTAINER = document.getElementById("assigned_to_list");
  if (!CONTAINER) {
    console.error("assignedToList Element nicht gefunden!");
    return;
  }
  let html = "";
  for (const USER_ID in users) {
    const USER = users[USER_ID];
    if (!USER || !USER.name) continue;

    const FIRST_LETTER = USER.name.charAt(0).toUpperCase();
    const COLOR = USER.color || "#ccc";
    const INITIALS = USER.name.charAt(0);
    html += getFillUserDropown(COLOR, INITIALS, USER);
  }
  CONTAINER.innerHTML = html;
}

/**
 * Filters the displayed user list by the search input value.
 */
function filterUsers() {
  const SEARCH = document.getElementById("assigned_to_search").value.toLowerCase();
  const FILTERED_USERS = remoteUsers.filter((user) => user.name.toLowerCase().includes(SEARCH));
  fillUserDropdown(FILTERED_USERS);
}

/**
 * Toggles a user's checkbox selection and updates the preview badges.
 * @param {HTMLElement} el - The clicked user element in the dropdown.
 */
function toggleUser(el) {
  const CHECKBOX = el.querySelector("input");
  CHECKBOX.checked = !CHECKBOX.checked;
  if (CHECKBOX.checked) {
    el.classList.add("selected");
  } else {
    el.classList.remove("selected");
  }
  updateAssignedPreview();
}

/**
 * Collects all checked users from the assignment dropdown.
 * @returns {Array<{name: string, color: string}>} Selected users.
 */
function getAssignedUsers() {
  const checkboxes = document.querySelectorAll("#assigned_to_list input[type='checkbox']:checked");
  return Array.from(checkboxes).map((cb) => ({ name: cb.value, color: cb.dataset.color }));
}

/**
 * Opens or closes the user assignment dropdown.
 * @param {Event} e - The click event on the dropdown trigger.
 */
function toggleDropdown(e) {
  e.stopPropagation();
  const dropdown = document.getElementById("assigned_to_dropdown");
  const assigneeList = document.getElementById("assigned_to_list");
  if (dropdown) {
    dropdown.classList.toggle("open");
    assigneeList?.scrollTo({ top: 0 });
  }
}

/**
 * Closes the assignment dropdown when the Escape key is pressed.
 */
document.addEventListener("keydown", (e) => {
  if (e.key === "Escape") {
    document.getElementById("assigned_to_dropdown")?.classList.remove("open");
  }
});

/**
 * Closes the assignment dropdown when clicking outside of it.
 */
function initDropdownOutsideClick() {
  document.addEventListener("click", (e) => {
    const DROPDOWN = document.getElementById("assigned_to_dropdown");
    if (!DROPDOWN) return;
    const CLICKED_INSIDE = DROPDOWN.contains(e.target);
    if (!CLICKED_INSIDE) {
      DROPDOWN.classList.remove("open");
    }
  });
}

/**
 * Refreshes the assigned-user preview section below the dropdown.
 */
function updateAssignedPreview() {
  const container = document.getElementById("assigned_preview");
  const selected = getAssignedUsers();
  container.innerHTML = renderAssignedUsers(selected);
}

/**
 * Re-renders the assigned preview on window resize using debounce.
 */
function initAssignedPreviewResize() {
  let debounceTimer;
  window.addEventListener("resize", () => {
    clearTimeout(debounceTimer);
    debounceTimer = setTimeout(updateAssignedPreview, 150);
  });
}

/**
 * Returns how many 36px slots fit inside the #assigned_to_dropdown width.
 * @returns {number} Number of visible badge slots (minimum 1).
 */
function getAssignedDropdownCapacity() {
  const dropdown = document.getElementById("assigned_to_dropdown");
  const width = dropdown?.offsetWidth ?? 0;
  return Math.max(1, Math.floor(width / 34));
}

/**
 * Builds a basic task card HTML string.
 * @param {Object} task - The task object with title, description and assignedTo.
 * @returns {string} HTML for the task card.
 */
function buildTaskCard(task) {
  return `
    <div class="task-card">
      <div class="task-title">${task.title}</div>
      <div class="task-desc">${task.description}</div>
      <div class="assigned-users">
        ${renderAssignedUsers(task.assignedTo)}
      </div>
    </div>
  `;
}

/**
 * Extracts initials from a full name.
 * @param {string} name - The user's full name.
 * @returns {string} One or two uppercase letters.
 */
function getUserInitials(name) {
  const parts = name.trim().split(" ");
  return parts.length > 1
    ? (parts[0][0] + parts[parts.length - 1][0]).toUpperCase()
    : parts[0].slice(0, 2).toUpperCase();
}

/**
 * Creates the colored circles with initials for assigned users.
 * Shows up to 10 circles; if more exist, appends a "+N" overflow badge.
 * @param {Array<{name: string, color: string}>} users - List of user objects.
 * @returns {string} HTML string with user badges.
 */
function renderAssignedUsers(users = []) {
  if (!Array.isArray(users) || users.length === 0) return "";
  const MAX_VISIBLE = getAssignedDropdownCapacity()
  const valid = users.filter(({ name }) => name);
  const visible = valid.slice(0, MAX_VISIBLE);
  const remaining = valid.length - MAX_VISIBLE;
  const circles = visible
    .map(({ name, color }) => getUserCircleTemplate(name, getUserInitials(name), color))
    .join("");
  const more = remaining > 0 ? getAssignedUsersMoreTemplate(remaining) : "";
  return getAssignedUsersTemplate(circles + more);
}



/**
 * Gathers all form values and builds a task object ready for the API.
 * @param {string} [status="todo"] - The initial board status.
 * @returns {Object} The task object.
 */
function buildTaskObj(status = "todo") {
  const val = (id) => document.getElementById(id).value;
  return {
    title: val("title"),
    description: val("description"),
    dueDate: val("due_date"),
    category: val("category"),
    assignedTo: getAssignedUsers() || [],
    priority: selectedPriority,
    status: status,
    subtasks: subtasksList,
  };
}

/**
 * Checks all three required fields and shows/hides error messages.
 * @param {HTMLElement} title - The title input.
 * @param {HTMLElement} dueDate - The due-date input.
 * @param {HTMLElement} category - The category select.
 * @returns {boolean} True when all three fields are valid.
 */
function validateTaskForm(title, dueDate, category) {
  const HAS_TITLE = !!title.value.trim();
  const HAS_DATE = !!dueDate.value;
  const HAS_CATEGORY = !!category.value;

  HAS_TITLE ? clearError(title, "title_error") : setError(title, "title_error", "This field is required");
  HAS_DATE ? clearError(dueDate, "date_error") : setError(dueDate, "date_error", "This field is required");
  HAS_CATEGORY ? clearError(category, "category_error") : setError(category, "category_error", "This field is required");

  return HAS_TITLE && HAS_DATE && HAS_CATEGORY;
}

/**
 * POSTs the task object to Firebase and handles success/failure UI.
 * @param {Object} task - The complete task object to send.
 * @param {HTMLElement|null} btn - The submit button (for re-enabling).
 */
async function sendTaskRequest(task, btn) {
  try {
    const RESPONSE = await fetch(ADDTASK_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(task),
    });
    if (RESPONSE.ok) {
      const onBoard = !!document.getElementById("task_created_toast");
      if (onBoard) {
        closeAddTaskDialog();
        await showBoardToast();
        loadTasksFromFirebase();
      } else {
        document.getElementById("toast")?.classList.add("show");
        setTimeout(() => { window.location.href = "board.html"; }, 1000);
      }
    } else if (btn) {
      btn.disabled = false;
    }
  } catch (error) {
    console.error(error);
    if (btn) btn.disabled = false;
  }
}

/**
 * Validates the form and, if valid, sends the task to the backend.
 */
async function createTask() {
  const TITLE = document.getElementById("title");
  const DUE_DATE = document.getElementById("due_date");
  const CATEGORY = document.getElementById("category");
  const BTN = document.getElementById("btnCreateTask");
  if (BTN) BTN.disabled = true;
  if (!validateTaskForm(TITLE, DUE_DATE, CATEGORY)) {
    if (BTN) BTN.disabled = false;
    return;
  }
  const status = sessionStorage.getItem("task-status") ?? "todo";
  await sendTaskRequest(buildTaskObj(status), BTN);
}

/**
 * Posts a task object directly and returns the parsed JSON response.
 * @param {Object} task - The task to save.
 * @returns {Promise<Object>} The response body as JSON.
 */
async function postTask(task) {
  const RESPONSE = await fetch(ADDTASK_URL, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(task),
  });
  return RESPONSE.json();
}

/**
 * Resets all form fields and UI state to their defaults.
 */
function clearForm() {
  document.getElementById("form_task").reset();
  document.getElementById("due_date").value = "";
  selectPriority("medium");
  document.getElementById("assigned_preview").innerHTML = "";
  fillUserDropdown(remoteUsers);
  subtasksList = [];
  document.getElementById("subtask_list").innerHTML = "";
  clearSubtaskInput(new Event("reset"));

  /* Reset all validation errors */
  clearError(document.getElementById("title"), "title_error");
  clearError(document.getElementById("due_date"), "date_error");
  clearError(document.getElementById("category"), "category_error");
}
