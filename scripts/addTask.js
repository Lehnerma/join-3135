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
  validetInput();
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
 * Configures a single date input: sets today as min date and fills it on first focus.
 * @param {string} id - The HTML id of the date input element.
 */
function setupDateInput(id) {
  const input = document.getElementById(id);
  if (!input) return;
  const today = new Date().toISOString().split("T")[0];
  input.min = today;
  input.addEventListener("focus", () => {
    if (!input.value) input.value = today;
  });
}

/**
 * Sets the date input to today's date on first focus and prevents past dates.
 */
function initDateInput() {
  setupDateInput("due_date");
  setupDateInput("due_date_edit");
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
    fillUserDropdown(sortUsersWithActiveFirst(remoteUsers));
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
  fillUserDropdown(sortUsersWithActiveFirst(FILTERED_USERS));
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
 * Returns how many badge slots fit inside the #assigned_to_dropdown width.
 * @returns {number} Number of visible badge slots (minimum 1).
 */
function getAssignedDropdownCapacity() {
  const dropdown = document.getElementById("assigned_to_dropdown");
  const width = dropdown?.offsetWidth ?? 0;
  return Math.max(1, Math.floor(width / 34));
}

/**
 * Extracts initials from a full name.
 * @param {string} name - The user's full name.
 * @returns {string} One or two uppercase letters.
 */
function getUserInitials(name) {
  const parts = name.trim().split(" ");
  return parts.length > 1 ? (parts[0][0] + parts[parts.length - 1][0]).toUpperCase() : parts[0].slice(0, 2).toUpperCase();
}

/**
 * Creates the colored circles with initials for assigned users.
 * Shows up to a calculated number of circles; if more exist, appends a "+N" overflow badge.
 * @param {Array<{name: string, color: string}>} users - List of user objects.
 * @returns {string} HTML string with user badges.
 */
function renderAssignedUsers(users = []) {
  if (!Array.isArray(users) || users.length === 0) return "";
  const MAX_VISIBLE = Math.max(2, getAssignedDropdownCapacity());
  const valid = users.filter(({ name }) => name);
  const visible = valid.slice(0, MAX_VISIBLE);
  const remaining = valid.length - MAX_VISIBLE;
  const circles = visible.map(({ name, color }) => getUserCircleTemplate(name, getUserInitials(name), color)).join("");
  const more = remaining > 0 ? getAssignedUsersMoreTemplate(remaining) : "";
  return getAssignedUsersTemplate(circles + more);
}

/**
 * Gathers all form values and builds a task object ready for the API.
 * @param {string} [status="todo"] - The initial board status.
 * @returns {Object} The task object.
 */
function buildTaskObj(status = "todo") {
  const val = (id) => document.getElementById(id)?.value ?? "";
  const isDialog = !!document.getElementById("title_edit");
  const sfx = isDialog ? "_edit" : "";
  return {
    title: val("title" + sfx),
    description: val("description"),
    dueDate: val("due_date" + sfx),
    category: val("category" + sfx),
    assignedTo: getAssignedUsers() || [],
    priority: selectedPriority,
    status: status,
    subtasks: subtasksList,
  };
}

// ###### Validate Tasks ########

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

  HAS_TITLE ? clearError(title) : setError(title);
  HAS_DATE ? clearError(dueDate) : setError(dueDate);
  HAS_CATEGORY ? clearError(category) : setError(category);

  return HAS_TITLE && HAS_DATE && HAS_CATEGORY;
}

/**
 * Adds the red error border to an input.
 * @param {HTMLElement} input - The input element to mark invalid.
 */
function setError(input) {
  input.classList.add("input-invalid");
}

/**
 * Removes the red error border from an input.
 * @param {HTMLElement} input - The input element to clear.
 */
function clearError(input) {
  input.classList.remove("input-invalid");
}

/**
 * Returns the field configuration array for validation listeners.
 * @returns {Array<{id: string, event: string}>} Field config objects.
 */
function getValidationFields() {
  return [
    { id: "title", event: "input" },
    { id: "due_date", event: "click" },
    { id: "category", event: "change" },
    { id: "title_edit", event: "input" },
    { id: "due_date_edit", event: "click" },
    { id: "category_edit", event: "change" },
  ];
}

/**
 * Attaches a validation listener to a single field.
 * Clears error when a value is entered; shows error when field is left empty.
 * @param {string} id - The HTML id of the input element.
 * @param {string} eventType - The event name to listen for.
 */
function bindFieldValidation(id, eventType) {
  const el = document.getElementById(id);
  if (!el) return;
  el.addEventListener(eventType, () => {
    el.value.trim() ? clearError(el) : setError(el);
  });
  el.addEventListener("blur", () => {
    if (!el.value.trim()) setError(el);
  });
}

/**
 * Attaches input/change/blur listeners to all required fields.
 */
function validetInput() {
  getValidationFields().forEach(({ id, event }) => bindFieldValidation(id, event));
}

/**
 * Handles the UI after a task was successfully created.
 * Shows the toast on the add-task page or closes the board dialog and refreshes.
 */
function handleTaskCreated() {
  const onBoard = !!document.getElementById("task_created_toast");
  if (onBoard) {
    closeAddTaskDialog();
    showBoardToast().then(() => loadTasksFromFirebase());
  } else {
    document.getElementById("toast")?.classList.add("show-animation");
    setTimeout(() => {
      window.location.href = "board.html";
    }, 1000);
  }
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
      handleTaskCreated();
    } else if (btn) {
      btn.disabled = false;
    }
  } catch (error) {
    console.error(error);
    if (btn) btn.disabled = false;
  }
}

/**
 * Returns the suffix (_edit or empty) depending on whether the dialog is open.
 * @returns {string} "_edit" when the add-task dialog is active, else "".
 */
function getInputSuffix() {
  return document.getElementById("title_edit") ? "_edit" : "";
}

/**
 * Validates all three required form inputs by toggling error styles.
 * @param {HTMLElement} title - The title input.
 * @param {HTMLElement} dueDate - The due-date input.
 * @param {HTMLElement} category - The category select.
 * @returns {boolean} True when all three fields have a value.
 */
function validateRequiredFields(title, dueDate, category) {
  const hasTitle = !!title?.value.trim();
  const hasDate = !!dueDate?.value;
  const hasCategory = !!category?.value;

  hasTitle ? clearError(title) : setError(title);
  hasDate ? clearError(dueDate) : setError(dueDate);
  hasCategory ? clearError(category) : setError(category);

  return hasTitle && hasDate && hasCategory;
}

/**
 * Validates the form and, if valid, sends the task to the backend.
 */
async function createTask() {
  const sfx = getInputSuffix();
  const TITLE = document.getElementById("title" + sfx);
  const DUE_DATE = document.getElementById("due_date" + sfx);
  const CATEGORY = document.getElementById("category" + sfx);
  const BTN = document.getElementById("btnCreateTask");
  if (BTN) BTN.disabled = true;

  if (!validateRequiredFields(TITLE, DUE_DATE, CATEGORY)) {
    if (BTN) BTN.disabled = false;
    return;
  }
  const status = sessionStorage.getItem("task-status") ?? "todo";
  await sendTaskRequest(buildTaskObj(status), BTN);
}

/**
 * Resets all form fields and UI state to their defaults.
 * Works for both the add-task page and the board dialog.
 */
function clearForm() {
  const sfx = getInputSuffix();
  document.getElementById("form_task").reset();
  const dueDate = document.getElementById("due_date" + sfx);
  if (dueDate) dueDate.value = "";
  selectPriority("medium");
  document.getElementById("assigned_preview").innerHTML = "";
  fillUserDropdown(sortUsersWithActiveFirst(remoteUsers));
  subtasksList = [];
  document.getElementById("subtask_list").innerHTML = "";
  clearSubtaskInput(new Event("reset"));

  clearError(document.getElementById("title" + sfx));
  clearError(document.getElementById("due_date" + sfx));
  clearError(document.getElementById("category" + sfx));
}
