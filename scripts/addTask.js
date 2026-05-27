const ADDTASK_URL =
  "https://join-3135-default-rtdb.europe-west1.firebasedatabase.app/tasks.json";

let selectedPriority = "medium";
let remoteUsers = [];
sessionStorage.removeItem("task-status");

/**
 * Entry point called on page load.
 * Sets up all modules and event listeners.
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
 * Binds submit and clear listeners to the task form.
 */
function btnInit() {
  const form = document.getElementById("form_task");
  const clearBtn = document.getElementById("form_clear");
  if (form) form.addEventListener("submit", (e) => { e.preventDefault(); createTask(); });
  if (clearBtn) clearBtn.addEventListener("click", clearForm);
}

/**
 * Initialises both due-date inputs (page + dialog).
 * Sets today as minimum and prefills on first focus.
 */
function initDateInput() {
  setupSingleDateInput("due_date");
  setupSingleDateInput("due_date_edit");
}

/**
 * Configures a single date input: sets today as min and fills on first focus.
 * @param {string} id - The element ID of the date input.
 */
function setupSingleDateInput(id) {
  const input = document.getElementById(id);
  if (!input) return;
  const today = new Date().toISOString().split("T")[0];
  input.min = today;
  input.addEventListener("focus", () => {
    if (!input.value) input.value = today;
  });
}

/**
 * Highlights the selected priority button and stores the choice globally.
 * @param {string} priority - "urgent", "medium" or "low".
 */
function selectPriority(priority) {
  ["urgent", "medium", "low"].forEach((p) => {
    document.getElementById("btn_" + p).classList.remove(p + "-active");
  });
  document.getElementById("btn_" + priority).classList.add(priority + "-active");
  selectedPriority = priority;
}

/**
 * Fetches all users from Firebase and fills the assignment dropdown,
 * putting the currently logged-in user first.
 */
async function loadUsers() {
  const url = "https://join-3135-default-rtdb.europe-west1.firebasedatabase.app/users.json";
  try {
    const response = await fetch(url);
    const data = await response.json();
    remoteUsers = Object.values(data);
    fillUserDropdown(sortUsersWithActiveFirst(remoteUsers));
  } catch (error) {
    console.error("Fehler beim Laden der Benutzer:", error);
  }
}

/**
 * Moves the active (logged-in) user to the front, then sorts the rest A–Z.
 * @param {Object[]} users - Array of user objects with a `name` property.
 * @returns {Object[]} Sorted array with the active user at index 0.
 */
function sortUsersWithActiveFirst(users) {
  const activeName = sessionStorage.getItem("activeUserName");
  const sorted = users.toSorted((a, b) => a.name.localeCompare(b.name));
  if (activeName) {
    const idx = sorted.findIndex((u) => u.name === activeName);
    if (idx > -1) {
      const activeUser = sorted.splice(idx, 1)[0];
      sorted.unshift(activeUser);
    }
  }
  return sorted;
}

/**
 * Renders the given users into the assignment dropdown list.
 * @param {Object} users - Object whose values are user data.
 */
function fillUserDropdown(users) {
  const list = document.getElementById("assigned_to_list");
  if (!list) return;
  list.innerHTML = "";
  for (const key in users) {
    const user = users[key];
    if (!user?.name) continue;
    list.innerHTML += getFillUserDropown(user.color || "#ccc", user.name[0], user);
  }
}

/**
 * Filters the assignment dropdown by the current search term.
 */
function filterUsers() {
  const search = document.getElementById("assigned_to_search").value.toLowerCase();
  const filtered = remoteUsers.filter((u) => u.name.toLowerCase().includes(search));
  fillUserDropdown(sortUsersWithActiveFirst(filtered));
}

/**
 * Toggles any custom dropdown (assigned-to or category) open/closed.
 * Closes all other open dropdowns first.
 * @param {Event} event - The click event on the dropdown trigger.
 */
function toggleDropdown(event) {
  event.stopPropagation();
  const dropdown = event.target.closest(".custom-dropdown");
  if (!dropdown) return;

  document.querySelectorAll(".custom-dropdown").forEach((d) => {
    if (d !== dropdown) d.classList.remove("open");
  });

  dropdown.classList.toggle("open");
  dropdown.querySelector(".custom-dropdown__list")?.scrollTo({ top: 0 });
}

/**
 * Closes all open custom dropdowns when Escape is pressed.
 */
document.addEventListener("keydown", (e) => {
  if (e.key === "Escape") document.querySelectorAll(".custom-dropdown.open").forEach((d) => d.classList.remove("open"));
});

/**
 * Registers a global click listener that closes any custom dropdown
 * when the user clicks outside of it.
 */
function initDropdownOutsideClick() {
  document.addEventListener("click", (e) => {
    document.querySelectorAll(".custom-dropdown").forEach((d) => {
      if (!d.contains(e.target)) d.classList.remove("open");
    });
  });
}

/**
 * Sets the selected category on the main add-task page.
 * @param {string} category - The category to select (e.g. "Technical Task").
 */
function selectCategory(category) {
  setCategoryValue("category", "category_dropdown", category);
}

/**
 * Sets the selected category inside an opened dialog.
 * @param {string} category - The category to select.
 */
function selectCategoryEdit(category) {
  const sfx = getInputSuffix();
  setCategoryValue("category" + sfx, "category_dropdown_edit", category);
}

/**
 * Writes the chosen category into the hidden input, highlights the matching
 * dropdown item and closes the dropdown.
 * @param {string} inputId - ID of the readonly input element.
 * @param {string} dropdownId - ID of the custom-dropdown wrapper.
 * @param {string} category - The category label to set.
 */
function setCategoryValue(inputId, dropdownId, category) {
  const input = document.getElementById(inputId);
  const dropdown = document.getElementById(dropdownId);
  if (!input || !dropdown) return;

  input.value = category;
  input.dispatchEvent(new Event("input", { bubbles: true }));

  dropdown.querySelectorAll(".custom-dropdown__item").forEach((item) => {
    item.classList.toggle("selected", item.textContent.trim() === category);
  });
  dropdown.classList.remove("open");
}

/**
 * Toggles the checkbox inside a user row and updates the "selected" highlight.
 * @param {HTMLElement} el - The clicked user list item.
 */
function toggleUser(el) {
  const cb = el.querySelector("input");
  cb.checked = !cb.checked;
  el.classList.toggle("selected", cb.checked);
  updateAssignedPreview();
}

/**
 * Collects all currently checked users from the assignment dropdown.
 * @returns {Array<{name: string, color: string}>} Selected user objects.
 */
function getAssignedUsers() {
  const checked = document.querySelectorAll("#assigned_to_list input[type='checkbox']:checked");
  return Array.from(checked).map((cb) => ({ name: cb.value, color: cb.dataset.color }));
}

/**
 * Refreshes the row of coloured initial-badges below the assignment dropdown.
 */
function updateAssignedPreview() {
  document.getElementById("assigned_preview").innerHTML = renderAssignedUsers(getAssignedUsers());
}

/**
 * Re-renders the assigned-user preview on window resize (debounced).
 */
function initAssignedPreviewResize() {
  let timer;
  window.addEventListener("resize", () => {
    clearTimeout(timer);
    timer = setTimeout(updateAssignedPreview, 150);
  });
}

/**
 * Calculates how many user badges fit in the dropdown width.
 * @returns {number} Maximum badge count (at least 1).
 */
function getAssignedDropdownCapacity() {
  const width = document.getElementById("assigned_to_dropdown")?.offsetWidth ?? 0;
  return Math.max(1, Math.floor(width / 34));
}

/**
 * Extracts up to two uppercase initials from a full name.
 * @param {string} name - Full name of the user.
 * @returns {string} One or two uppercase letters.
 */
function getUserInitials(name) {
  const parts = name.trim().split(" ");
  return parts.length > 1
    ? (parts[0][0] + parts[parts.length - 1][0]).toUpperCase()
    : parts[0].slice(0, 2).toUpperCase();
}

/**
 * Builds the HTML snippet showing coloured circle badges for assigned users.
 * Displays up to a calculated maximum, appending a "+N" overflow badge if needed.
 * @param {Array<{name: string, color: string}>} users - Selected users.
 * @returns {string} HTML string of badge elements.
 */
function renderAssignedUsers(users = []) {
  if (!users.length) return "";
  const max = Math.max(2, getAssignedDropdownCapacity());
  const visible = users.slice(0, max);
  const remaining = users.length - max;

  let html = visible
    .map((u) => getUserCircleTemplate(u.name, getUserInitials(u.name), u.color))
    .join("");
  if (remaining > 0) html += getAssignedUsersMoreTemplate(remaining);

  return getAssignedUsersTemplate(html);
}

/**
 * Reads all form fields and assembles the task object for the API.
 * @param {string} [status="todo"] - Board-column status for new tasks.
 * @returns {Object} The complete task data object.
 */
function buildTaskObj(status = "todo") {
  const read = (id) => document.getElementById(id)?.value ?? "";
  const sfx = document.getElementById("title_edit") ? "_edit" : "";
  return {
    title: read("title" + sfx),
    description: read("description"),
    dueDate: read("due_date" + sfx),
    category: read("category" + sfx),
    assignedTo: getAssignedUsers(),
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
    const res = await fetch(ADDTASK_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(task),
    });
    if (res.ok) handleTaskCreated();
    else if (btn) btn.disabled = false;
  } catch (err) {
    console.error(err);
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
 * Adds on-input and on-blur validation to a single field.
 * @param {string} id - The element ID.
 * @param {string} eventType - The event name (e.g. "input", "click").
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
 * Resets the entire task form to its default empty state.
 */
function clearForm() {
  const sfx = getInputSuffix();
  resetFormData(sfx);
  resetDropdowns();
  clearAllErrors(sfx);
}

/**
 * Clears text fields, date, priority and subtask list.
 * @param {string} sfx - The element ID suffix ("_edit" or "").
 */
function resetFormData(sfx) {
  document.getElementById("form_task").reset();
  const dueDate = document.getElementById("due_date" + sfx);
  if (dueDate) dueDate.value = "";
  selectPriority("medium");
  subtasksList = [];
  document.getElementById("subtask_list").innerHTML = "";
  clearSubtaskInput(new Event("reset"));
}

/**
 * Resets both the assigned-users dropdown and the category dropdown.
 */
function resetDropdowns() {
  document.getElementById("assigned_preview").innerHTML = "";
  fillUserDropdown(sortUsersWithActiveFirst(remoteUsers));

  const sfx = getInputSuffix();
  const catInput = document.getElementById("category" + sfx);
  if (catInput) catInput.value = "";

  const catDropdown = document.getElementById(sfx ? "category_dropdown_edit" : "category_dropdown");
  catDropdown?.querySelectorAll(".custom-dropdown__item").forEach((i) => i.classList.remove("selected"));
}

/**
 * Removes red error borders from the three mandatory inputs.
 * @param {string} sfx - The element ID suffix.
 */
function clearAllErrors(sfx) {
  clearError(document.getElementById("title" + sfx));
  clearError(document.getElementById("due_date" + sfx));
  clearError(document.getElementById("category" + sfx));
}