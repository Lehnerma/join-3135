const ADDTASK_URL = "https://join-3135-default-rtdb.europe-west1.firebasedatabase.app/tasks" + ".json";
let selectedPriority = "medium";
let subtasksList = [];
let remoteUsers = [];
let initialTaskStatus = sessionStorage.getItem("task-status") ?? "todo";
sessionStorage.removeItem("task-status");

/**
 * Initializes the page and all necessary functions.
 */
function init() {
  btnInit();
  subtaskInit();
  initDateInput();
  loadUsers();
  initDropdownOutsideClick();
}

/**
 * Initializes the event listeners for the main form and the clear button.
 */
function btnInit() {
  const FORM = document.getElementById("form_task");
  const CLEAR_FORM = document.getElementById("form_clear");
  registerFormSubmitListener(FORM);
  registerClearFormListener(CLEAR_FORM);
}


function setError(input, errorId) {
  input.classList.add("input-invalid");

  const ERROR_EL = document.getElementById(errorId);
  if (ERROR_EL) {
    ERROR_EL.classList.remove("dnone");
  }
}

function clearError(input, errorId) {
  input.classList.remove("input-invalid");

  const ERROR_EL = document.getElementById(errorId);
  if (ERROR_EL) {
    ERROR_EL.classList.add("dnone");
  }
}

/**
 * Registers the submit event listener on the task form.
 * Prevents the default submission and triggers task creation.
 *
 * @param {HTMLFormElement|null} form - The task form element to attach the listener to.
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
 * Triggers the form reset when the button is clicked.
 *
 * @param {HTMLElement|null} clearBtn - The clear button element to attach the listener to.
 */
function registerClearFormListener(clearBtn) {
  if (!clearBtn) return;
  clearBtn.addEventListener("click", () => clearForm());
}

/**
 * Initializes the date input field: Sets the minimum date and the default value to today.
 */
function initDateInput() {
  const DUE_DATE_INPUT = document.getElementById("due_date");
  const NOW = new Date();
  const TODAY = NOW.toISOString().split("T")[0];
  DUE_DATE_INPUT.min = TODAY;
  DUE_DATE_INPUT.value = TODAY;
}

/**
 * Sets the task priority and updates the visual appearance of the buttons.
 * @param {string} priority - The selected priority ('urgent', 'medium', or 'low').
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
 * Sorts users with the active user first, followed by alphabetically sorted contacts.
 * @param {Array} users - The array of user objects to sort.
 * @returns {Array} - Sorted array with active user at position 0.
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
 * Loads the user list from the Firebase database.
 */
async function loadUsers() {
  const USER_URL = "https://join-3135-default-rtdb.europe-west1.firebasedatabase.app/users.json";
  try {
    const RESPONSE = await fetch(USER_URL);
    const DATA = await RESPONSE.json();
    remoteUsers = Object.values(DATA);
    const SORTET_USERS = sortUsersWithActiveFirst(remoteUsers);
    fillUserDropdown(SORTET_USERS);
  } catch (error) {
    console.error("Fehler beim Laden der Benutzer:", error);
  }
}

/**
 * Populates the dropdown menu with the list of available users.
 * @param {Object} users - An object containing user data.
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
 * Filters the user list based on the search input in the dropdown menu.
 */
function filterUsers() {
  const SEARCH = document.getElementById("assigned_to_search").value.toLowerCase();
  const FILTERED_USERS = remoteUsers.filter((user) => user.name.toLowerCase().includes(SEARCH));
  fillUserDropdown(FILTERED_USERS);
}

/**
 * Toggles the selection status of a user in the dropdown menu.
 * @param {HTMLElement} el - The element selected by the user.
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
 * Retrieves all currently selected users from the checklist.
 * @returns {string[]} An array containing the names of the selected users.
 */
function getAssignedUsers() {
  const CHECKBOXES = document.querySelectorAll("#assigned_to_list input[type='checkbox']:checked");
  return Array.from(CHECKBOXES).map((cb) => cb.value);
}

/**
 * Opens or closes the user dropdown menu.
 * @param {Event} e - The click event.
 */
function toggleDropdown(e) {
  e.stopPropagation();
  const DROPDOWN = document.getElementById("assigned_to_dropdown");
  const ASSIGNEE_LIST = document.getElementById("assigned_to_list");
  DROPDOWN.classList.toggle("open");
  ASSIGNEE_LIST.scrollTo({ top: 0 });
}

/**
 * Event listener for the Escape key to close the dropdown menu.
 */
document.addEventListener("keydown", (e) => {
  if (e.key === "Escape") {
    document.getElementById("assigned_to_dropdown")?.classList.remove("open");
  }
});

/**
 * Initializes the closing of the dropdown menu when a click is made outside the element.
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
 * Updates the preview icons of the assigned users below the dropdown.
 */
function updateAssignedPreview() {
  const CONTAINER = document.getElementById("assigned_preview");
  const SELECTED = getAssignedUsers();
  CONTAINER.innerHTML = renderAssignedUsers(SELECTED);
}

/**
 * Creates the basic HTML structure for a task card.
 * @param {Object} task - The task object.
 * @returns {string} HTML string of the task card.
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
 * Creates the HTML icons (circles with initials) for assigned users.
 * @param {string[]} users - Array of usernames.
 * @returns {string} HTML string of user icons.
 */
function renderAssignedUsers(users = []) {
  if (!Array.isArray(users) || users.length === 0) return "";
  let html = "";
  users.forEach((name) => {
    const FIRST_LETTER = name.charAt(0).toUpperCase();
    const COLOR = contactColors?.[FIRST_LETTER] || "#ccc";
    if (!name) return;
    const PARTS = name.trim().split(" ");
    let initials = "";
    if (PARTS.length > 1) {
      initials = (PARTS[0][0] + PARTS[1][0]).toUpperCase();
    } else {
      initials = PARTS[0].slice(0, 2).toUpperCase();
    }
    html += `
      <div class="assigned-circle" style="background-color:${COLOR}" title="${name}">
        ${initials}
      </div>
    `;
  });
  return `<div class="assigned-wrapper">${html}</div>`;
}

/**
 * Initializes the event listeners for subtask input.
 */
function subtaskInit() {
  const SUBTASK_SAVE = document.getElementById("subtask_save");
  const SUBTASK_CLEAR = document.getElementById("subtask_close");
  const SUBTASK_INPUT = document.getElementById("subtask_input");
  SUBTASK_SAVE.addEventListener("click", (event) => addSubtask(event));
  SUBTASK_CLEAR.addEventListener("click", (event) => clearSubtaskInput(event));
  SUBTASK_INPUT.addEventListener("keydown", (e) => {
    if (e.key === "Enter") {
      addSubtask(e);
    }
  });
}

/**
 * Collects all form data and creates a task object for the database.
 * @returns {Object} The finished task object.
 */
function buildTaskObj() {

  const val = (id) => document.getElementById(id).value;
  return {
    title: val("title"),
    description: val("description"),
    dueDate: val("due_date"),
    category: val("category"),
    assignedTo: getAssignedUsers() || [],
    priority: selectedPriority,
    status: initialTaskStatus,
    subtasks: subtasksList,
  };
}

/**
 * Adds a new subtask to the internal array and renders it in the list.
 * @param {Event} ev - The event object.
 */
function addSubtask(ev) {
  ev.preventDefault();
  const INPUT = document.getElementById("subtask_input");
  const title = INPUT.value.trim();
  if (!title) return;
  const INDEX = subtasksList.length;
  subtasksList.push({
    title: title,
    done: false,
  });
  INPUT.value = "";
  renderSubtaskItem(INDEX, title);
}

/**
 * Creates a list item for a subtask and adds it to the DOM.
 * @param {number} index - The index in the subtasksList array.
 * @param {string} title - The title of the subtask.
 */
function renderSubtaskItem(index, title) {
  const LIST = document.getElementById("subtask_list");

  const LI = document.createElement("li");
  LI.className = "subtask-item input--section";
  LI.dataset.index = index;
  LI.id = "subtask" + index;
  LI.innerHTML = getSubtaskTemplate(title, index);
  addSubtaskEventListener(LI);
  LIST.appendChild(LI);
}

/**
 * Adds event listeners for edit and delete to a subtask element.
 * @param {HTMLLIElement} LI - The list element of the subtask.
 */
function addSubtaskEventListener(LI) {
  LI.querySelector(".subtask-text").addEventListener("dblclick", () => startEditSubtask(LI));
  LI.querySelector(".btn--delete").addEventListener("click", () => deleteSubtask(LI));
  LI.querySelector(".btn--edit").addEventListener("click", () => {
    if (LI.classList.contains("editing")) {
      saveSubtask(LI);
    } else {
      startEditSubtask(LI);
    }
  });
}

/**
 * Converts special characters to HTML entities to prevent XSS.
 * @param {string} str - The text to be sanitized.
 * @returns {string} The sanitized text.
 */
function escapeHtml(str) {
  const DIV = document.createElement("div");
  DIV.textContent = str;
  return DIV.innerHTML;
}

/**
 * Enables edit mode for a subtask.
 * @param {HTMLLIElement} li - The list item of the subtask.
 */
function startEditSubtask(li) {
  if (li.classList.contains("editing")) return;
  li.classList.add("editing");
  const SPAN = li.querySelector(".subtask-text");
  const INPUT = document.createElement("input");
  INPUT.type = "text";
  INPUT.className = "subtask-edit-input";
  INPUT.value = SPAN.textContent;
  INPUT.addEventListener("keydown", (e) => {
    if (e.key === "Enter") saveSubtask(li);
    if (e.key === "Escape") cancelEditSubtask(li);
  });
  li.replaceChild(INPUT, SPAN);
  li.querySelector(".btn--edit img").src = "../assets/img/icons/subtask/check.svg";
  INPUT.focus();
  INPUT.select();
}

/**
 * Cancels the editing mode of a subtask and restores the original text.
 * @param {HTMLLIElement} li - The list element of the subtask.
 */
function cancelEditSubtask(li) {
  const INPUT = li.querySelector(".subtask-edit-input");
  if (!INPUT) return;
  const SPAN = document.createElement("span");
  SPAN.className = "subtask-text";
  SPAN.textContent = subtasksList[parseInt(li.dataset.index)].title;
  li.replaceChild(SPAN, INPUT);
}

/**
 * Removes a subtask from the array and from the DOM.
 * @param {HTMLLIElement} li - The list element of the subtask.
 */
function deleteSubtask(li) {
  subtasksList.splice(parseInt(li.dataset.index), 1);
  li.remove();
}

/**
 * Saves the modified text of a subtask and exits edit mode.
 * @param {HTMLLIElement} li - The list item of the subtask.
 */
function saveSubtask(li) {
  const INPUT = li.querySelector(".subtask-edit-input");
  if (!INPUT) return;
  const NEW_TITLE = INPUT.value.trim();
  if (!NEW_TITLE) return;
  subtasksList[parseInt(li.dataset.index)].title = NEW_TITLE;
  const SPAN = document.createElement("span");
  SPAN.className = "subtask-text";
  SPAN.textContent = NEW_TITLE;
  SPAN.addEventListener("dblclick", () => startEditSubtask(li));
  li.replaceChild(SPAN, INPUT);
  li.classList.remove("editing");
  li.querySelector(".btn--edit img").src = "../assets/img/icons/subtask/edit.svg";
}

/**
 * Validates the task form inputs.
 * @param {HTMLElement} title
 * @param {HTMLElement} dueDate
 * @param {HTMLElement} category
 * @returns {boolean} True if all fields are valid.
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
 * Sends the task data to the server.
 * @param {Object} task
 * @param {HTMLElement|null} btn
 */
async function sendTaskRequest(task, btn) {
  try {
    const RESPONSE = await fetch(ADDTASK_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(task),
    });
    if (RESPONSE.ok) {
      document.getElementById("toast")?.classList.add("show");
      setTimeout(() => { window.location.href = "board.html"; }, 1000);
    } else if (btn) {
      btn.disabled = false;
    }
  } catch (error) {
    console.error(error);
    if (btn) btn.disabled = false;
  }
}

/**
 * Main function to handle the task creation process.
 */
async function createTask() {
  const TITLE = document.getElementById("title");
  const DUE_DATE = document.getElementById("due_date");
  const CATEGORY = document.getElementById("category");
  const BTN = document.getElementById("btnCreateTask");
  if (BTN) BTN.disabled = true;
  if (!validateTaskForm(TITLE, DUE_DATE, CATEGORY)) {
    if (BTN) BTN.disabled = false; // Fix: Button wird bei Fehlern wieder freigegeben
    return;
  }
  await sendTaskRequest(buildTaskObj(), BTN);
}


/**
 * Helper function for sending a task to the database via POST.
 * @param {Object} task - The task to be saved.
 * @returns {Promise<Object>} The JSON result of the response.
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
 * Resets the form to its default state.
 */
function clearForm() {
  document.getElementById("form_task").reset();
  initDateInput();
  selectPriority("medium");
  document.getElementById("assigned_preview").innerHTML = "";
  fillUserDropdown(remoteUsers);
  subtasksList = [];
  document.getElementById("subtask_list").innerHTML = "";
}


/**
 * Clears the input field for subtasks.
 * @param {Event} ev - The event object.
 */
const clearSubtaskInput = (ev) => {
  ev.preventDefault();
  let SUBTASK_INPUT = document.getElementById("subtask_input");
  SUBTASK_INPUT.value = "";
};