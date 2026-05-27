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
  validateInput();
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
 * Sets the date input to today's date on first focus and prevents past dates.
 */
function initDateInput() {
  const DUE_DATE_INPUT = document.getElementById("due_date");
  const DUE_DATE_EDIT_INPUT = document.getElementById("due_date_edit");
  const NOW = new Date();
  const TODAY = NOW.toISOString().split("T")[0];

  if (DUE_DATE_INPUT) {
    DUE_DATE_INPUT.min = TODAY;
    DUE_DATE_INPUT.addEventListener("focus", () => {
      if (!DUE_DATE_INPUT.value) {
        DUE_DATE_INPUT.value = TODAY;
      }
    });
  }

  if (DUE_DATE_EDIT_INPUT) {
    DUE_DATE_EDIT_INPUT.min = TODAY;
    DUE_DATE_EDIT_INPUT.addEventListener("focus", () => {
      if (!DUE_DATE_EDIT_INPUT.value) {
        DUE_DATE_EDIT_INPUT.value = TODAY;
      }
    });
  }
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
 * Returns how many 36px slots fit inside the #assigned_to_dropdown width.
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
 * Shows up to 10 circles; if more exist, appends a "+N" overflow badge.
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
 * Now also prevents dates in the past.
 * @param {HTMLElement} title - The title input.
 * @param {HTMLElement} dueDate - The due-date input.
 * @param {HTMLElement} category - The category select.
 * @returns {boolean} True when all three fields are valid.
 */
function validateTaskForm(title, dueDate, category) {
  const IS_TITLE_VALID = isInputValid(title);
  const IS_DATE_VALID = isInputValid(dueDate);
  const IS_CATEGORY_VALID = isInputValid(category);

  IS_TITLE_VALID ? clearError(title, "title_er") : setError(title, "title_er");
  IS_DATE_VALID ? clearError(dueDate, "date_er") : setError(dueDate, "date_er");
  IS_CATEGORY_VALID ? clearError(category, "category_er") : setError(category, "category_er");

  return IS_TITLE_VALID && IS_DATE_VALID && IS_CATEGORY_VALID;
}

/**
 * Adds the red error border to an input and shows the error message using visibility.
 * @param {HTMLElement} input - The input element to mark invalid.
 * @param {string} errorId - The ID of the error message span.
 */
function setError(input, errorId) {
  input.classList.add("input-invalid");
  const ERROR_EL = document.getElementById(errorId);
  if (ERROR_EL) {
    ERROR_EL.classList.add("visible"); 
  }
}

/**
 * Removes the red error border from an input and hides the error message using visibility.
 * @param {HTMLElement} input - The input element to clear.
 * @param {string} errorId - The ID of the error message span.
 */
function clearError(input, errorId) {
  input.classList.remove("input-invalid");
  const ERROR_EL = document.getElementById(errorId);
  if (ERROR_EL) {
    ERROR_EL.classList.remove("visible"); // Macht den Text wieder unsichtbar, behält den Platz bei
  }
}


function isInputValid(element) {
  const value = element.value.trim();
  if (!value) return false;

  if (element.type === "date") {
    const selectedDate = new Date(value);
    const today = new Date();
    
    today.setHours(0, 0, 0, 0);
    selectedDate.setHours(0, 0, 0, 0);

    if (selectedDate < today) return false;
  }

  return true;
}

function toggleErrorState(element, errorId) {
  const errorElement = document.getElementById(errorId);
  if (isInputValid(element)) {
    clearError(element, errorId);
    return;
  }
  if (errorElement) {
    const value = element.value.trim();

    if (!value) {
      errorElement.innerText = "This field is required";
    } else if (element.type === "date") {
      errorElement.innerText = "Date can not be in the past";
    }
  }
  setError(element, errorId);
}

function validateInput() {
  const fields = [
    { id: "title", errorId: "title_er", event: "input" },
    { id: "due_date", errorId: "date_er", event: "change" }, 
    { id: "category", errorId: "category_er", event: "change" },
    { id: "title_edit", errorId: "title_edit_er", event: "input" },
    { id: "due_date_edit", errorId: "due_date_edit_er", event: "change" }, 
    { id: "category_edit", errorId: "category_edit_er", event: "change" },
  ];

  fields.forEach(({ id, errorId, event }) => {
    const el = document.getElementById(id);
    if (!el) return;
    el.addEventListener(event, () => toggleErrorState(el, errorId));
    el.addEventListener("blur", () => toggleErrorState(el, errorId));
  });
}


/**
 * Attaches input/change/blur listeners to required fields.
 * Clears error when a value is entered; shows error when field is left empty.
 */
// function validetInput() {
//   const fields = [
//     { id: "title", errorId: "title_er", event: "input" },
//     { id: "due_date", errorId: "date_er", event: "change" },
//     { id: "category", errorId: "category_er", event: "change" },
//     { id: "title_edit", errorId: "title_edit_er", event: "input" },
//     { id: "due_date_edit", errorId: "due_date_edit_er", event: "change" },
//     { id: "category_edit", errorId: "category_edit_er", event: "change" },
//   ];
//   fields.forEach(({ id, errorId, event }) => {
//     const el = document.getElementById(id);
//     if (!el) return;
//     el.addEventListener(event, () => {
//       el.value.trim() ? clearError(el, errorId) : setError(el, errorId);
//     });
//     el.addEventListener("blur", () => {
//       if (!el.value.trim()) setError(el, errorId);
//     });
//   });
// }

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
        document.getElementById("toast")?.classList.add("show-animation");
        setTimeout(() => {
          window.location.href = "board.html";
        }, 1000);
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
 * Checks for missing values and past dates, updating error messages dynamically.
 */
async function createTask() {
  const isDialog = !!document.getElementById("title_edit");
  const sfx = isDialog ? "_edit" : "";
  const TITLE = document.getElementById("title" + sfx);
  const DUE_DATE = document.getElementById("due_date" + sfx);
  const CATEGORY = document.getElementById("category" + sfx);
  const BTN = document.getElementById("btnCreateTask");
  if (BTN) BTN.disabled = true;
  const IS_TITLE_VALID = isInputValid(TITLE);
  const IS_DATE_VALID = isInputValid(DUE_DATE);
  const IS_CATEGORY_VALID = isInputValid(CATEGORY);
  const errorSfx = isDialog ? "_edit_er" : "_er";

  toggleErrorState(TITLE, "title" + errorSfx);
  toggleErrorState(DUE_DATE, "date" + errorSfx);
  toggleErrorState(CATEGORY, "category" + errorSfx);

  if (!IS_TITLE_VALID || !IS_DATE_VALID || !IS_CATEGORY_VALID) {
    if (BTN) BTN.disabled = false; // Button wieder freigeben
    return;
  }

  const status = sessionStorage.getItem("task-status") ?? "todo";
  await sendTaskRequest(buildTaskObj(status), BTN);
}

/**
 * Resets all form fields and UI state to their defaults.
 */
function clearForm() {
  document.getElementById("form_task").reset();
  document.getElementById("due_date").value = "";
  selectPriority("medium");
  document.getElementById("assigned_preview").innerHTML = "";
  fillUserDropdown(sortUsersWithActiveFirst(remoteUsers));
  subtasksList = [];
  document.getElementById("subtask_list").innerHTML = "";
  clearSubtaskInput(new Event("reset"));

  /* Reset all validation errors */
  clearError(document.getElementById("title"), "title_er");
  clearError(document.getElementById("due_date"), "date_er");
  clearError(document.getElementById("category"), "category_er");
}
