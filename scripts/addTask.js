const ADDTASK_URL = "https://join-3135-default-rtdb.europe-west1.firebasedatabase.app/tasks" + ".json";
let selectedPriority = "medium";
let subtasksList = [];
let remoteUsers = [];

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
  if (FORM) {
    FORM.addEventListener("submit", (event) => {
      event.preventDefault();
      createTask();
    });
  }
  if (CLEAR_FORM) {
    CLEAR_FORM.addEventListener("click", () => {
      clearForm();
    });
  }
}


/**
 * Initializes the date input field: Sets the minimum date and the default value to today.
 */
function initDateInput() {
  const dueDateInput = document.getElementById("dueDate");
  const now = new Date();
  const today = now.toISOString().split("T")[0];
  dueDateInput.min = today;
  dueDateInput.value = today;
}


/**
 * Sets the task priority and updates the visual appearance of the buttons.
 * @param {string} priority - The selected priority ('urgent', 'medium', or 'low').
 */
function selectPriority(priority) {
  const priorities = ["urgent", "medium", "low"];
  priorities.forEach((prio) => {
    document.getElementById(`btn_${prio}`).classList.remove(`${prio}-active`);
  });
  document.getElementById(`btn_${priority}`).classList.add(`${priority}-active`);
  selectedPriority = priority;
}


/**
 * Loads the user list from the Firebase database.
 */
function loadUsers() {
  const USER_URL = "https://join-3135-default-rtdb.europe-west1.firebasedatabase.app/users.json";
  fetch(USER_URL)
    .then((response) => response.json())
    .then((data) => {
        remoteUsers = Object.entries(data).map(([id, user]) => ({ id, ...user }));
      console.log("Firebase remoteUsers :", data);
      fillUserDropdown(data);
    })
    .catch((error) => console.error("Fehler beim Laden der Benutzer:", error));
}


/**
 * Populates the dropdown menu with the list of available users.
 * @param {Object} users - An object containing user data.
 */
function fillUserDropdown(users) {
  const container = document.getElementById("assignedToList");
  if (!container) {
    console.error("assignedToList Element nicht gefunden!");
    return;
  }
  let html = "";
  for (const userId in users) {
    const user = users[userId];
    if (!user || !user.name) continue;
    const firstLetter = user.name.charAt(0).toUpperCase();
    const color = contactColors?.[firstLetter] || "#ccc";
    const initials = user.name.charAt(0);
    html += getFillUserDropown(color, initials, user);
  }
  container.innerHTML = html;
}


/**
 * Filters the user list based on the search input in the dropdown menu.
 */
function filterUsers() {
  let search = document.getElementById('assignedToSearch').value.toLowerCase();
  let filteredUsers = remoteUsers.filter(user =>
    user.name.toLowerCase().includes(search)
  );
  fillUserDropdown(filteredUsers);
}


/**
 * Toggles the selection status of a user in the dropdown menu.
 * @param {HTMLElement} el - The element selected by the user.
 */
function toggleUser(el) {
  const checkbox = el.querySelector("input");
  checkbox.checked = !checkbox.checked;
  if (checkbox.checked) {
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
  const checkboxes = document.querySelectorAll(
    "#assignedToList input[type='checkbox']:checked"
  );

  console.log("CHECKBOXES:", checkboxes);

  const values = Array.from(checkboxes).map((cb) => {
    console.log("VALUE:", cb.value);
    return cb.value;
  });

  console.log("FINAL ASSIGNED:", values);
  return values;
}


/**
 * Opens or closes the user dropdown menu.
 * @param {Event} e - The click event.
 */
function toggleDropdown(e) {
  e.stopPropagation();
  const dropdown = document.getElementById("assignedToDropdown");
  dropdown.classList.toggle("open");
}


/**
 * Event listener for the Escape key to close the dropdown menu.
 */
document.addEventListener("keydown", (e) => {
  if (e.key === "Escape") {
    document.getElementById("assignedToDropdown")?.classList.remove("open");
  }
});


/**
 * Initializes the closing of the dropdown menu when a click is made outside the element.
 */
function initDropdownOutsideClick() {
  document.addEventListener("click", (e) => {
    const dropdown = document.getElementById("assignedToDropdown");
    if (!dropdown) return;
    const clickedInside = dropdown.contains(e.target);
    if (!clickedInside) {
      dropdown.classList.remove("open");
    }
  });
}


/**
 * Updates the preview icons of the assigned users below the dropdown.
 */
function updateAssignedPreview() {
  const container = document.getElementById("assignedPreview");
  const selected = getAssignedUsers();
  container.innerHTML = renderAssignedUsers(selected);
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
    const firstLetter = name.charAt(0).toUpperCase();
    const color = contactColors?.[firstLetter] || "#ccc";
    if (!name) return;
    const parts = name.trim().split(" ");
    let initials = "";
    if (parts.length > 1) {
      initials = (parts[0][0] + parts[1][0]).toUpperCase();
    } else {
      initials = parts[0].slice(0, 2).toUpperCase();
    }
    html += `
      <div class="assigned-circle" style="background-color:${color}" title="${name}">
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
  const SUBTASK_SAVE = document.getElementById("subtask-save");
  const SUBTASK_CLEAR = document.getElementById("subtask-close");
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
    dueDate: val("dueDate"),
    category: val("category"),
    assignedTo: getAssignedUsers() || [],
    priority: selectedPriority,
    status: "todo",
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
  const div = document.createElement("div");
  div.textContent = str;
  return div.innerHTML;
}


/**
 * Enables edit mode for a subtask.
 * @param {HTMLLIElement} li - The list item of the subtask.
 */
function startEditSubtask(li) {
  if (li.classList.contains("editing")) return;
  li.classList.add("editing");
  const span = li.querySelector(".subtask-text");
  const input = document.createElement("input");
  input.type = "text";
  input.className = "subtask-edit-input";
  input.value = span.textContent;
  input.addEventListener("keydown", (e) => {
    if (e.key === "Enter") saveSubtask(li);
    if (e.key === "Escape") cancelEditSubtask(li);
  });
  li.replaceChild(input, span);
  li.querySelector(".btn--edit img").src = "../assets/img/icons/subtask/check.svg";
  input.focus();
  input.select();
}


/**
 * Cancels the editing mode of a subtask and restores the original text.
 * @param {HTMLLIElement} li - The list element of the subtask.
 */
function cancelEditSubtask(li) {
  const input = li.querySelector(".subtask-edit-input");
  if (!input) return;
  const span = document.createElement("span");
  span.className = "subtask-text";
  span.textContent = subtasksList[parseInt(li.dataset.index)].title;
  li.replaceChild(span, input);
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
  const input = li.querySelector(".subtask-edit-input");
  if (!input) return;
  const newTitle = input.value.trim();
  if (!newTitle) return;
  subtasksList[parseInt(li.dataset.index)].title = newTitle;
  const span = document.createElement("span");
  span.className = "subtask-text";
  span.textContent = newTitle;
  span.addEventListener("dblclick", () => startEditSubtask(li));
  li.replaceChild(span, input);
  li.classList.remove("editing");
  li.querySelector(".btn--edit img").src = "../assets/img/icons/subtask/edit.svg";
}


/**
 * Sends the new task object to the database and forwards it to the board.
 */
async function createTask() {
  const task = buildTaskObj();
  try {
    const response = await fetch(ADDTASK_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(task)
    });
    if (response.ok) {
      const toast = document.getElementById("toast");
      if (toast) toast.classList.add("show");
      setTimeout(() => {
        window.location.href = "board.html";
      }, 2000);
    }
  } catch (error) {
    console.error("Fehler beim Speichern:", error);
  }
}


/**
 * Helper function for sending a task to the database via POST.
 * @param {Object} task - The task to be saved.
 * @returns {Promise<Object>} The JSON result of the response.
 */
async function postTask(task) {
  const response = await fetch(ADDTASK_URL, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(task),
  });
  return response.json();
}


/**
 * Resets the form to its default state.
 */
function clearForm() {
  document.getElementById("form_task").reset();
  initDateInput();
  selectPriority("medium");
  document.getElementById("assignedPreview").innerHTML = "";
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