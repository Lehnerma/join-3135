const ADDTASK_URL  = "https://join-3135-default-rtdb.europe-west1.firebasedatabase.app/tasks" + ".json";

let selectedPriority = "medium";
let subtasksList  = [];
let remoteUsers  = [];

/** 
 * The Main Boss .
 */
function init() {
  btnInit();
  subtaskInit();
  initDateInput();
  loadUsers();
  initDropdownOutsideClick();
}

/**
 * Initial all btns in the form.
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
 * Get the actuall Date - and set the default value of the date input to today.
 */

function initDateInput() {
  const dueDateInput = document.getElementById("dueDate");
  const now = new Date();
  const today = now.toISOString().split("T")[0];
  dueDateInput.min = today;
  dueDateInput.value = today;
}

/**
 * set the priority of the Task - and hightlight it.
 * @param {String} priority
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
 *  User Assignment Dropdown functions
 */

function loadUsers() {

  const USER_URL = "https://join-3135-default-rtdb.europe-west1.firebasedatabase.app/users.json";

  fetch(USER_URL)
    .then((response) => response.json())
    .then((data) => {
      remoteUsers  = Object.values(data);
      console.log("Firebase remoteUsers :", data);
      fillUserDropdown(data);
    })
    .catch((error) => console.error("Error fetching users:", error));
}

function fillUserDropdown(users) {
  const container = document.getElementById("assignedToList");

  if (!container) {
    console.error(" assignedToList Element nicht gefunden!");
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

function filterUsers() {
  let search = document.getElementById('assignedToSearch').value.toLowerCase(); // Eingabe in Kleinbuchstaben
  let container = document.getElementById("assignedToList");

  // Filtere das USERS-Array (das du bereits in loadUsers befüllst)
  let filteredUsers = remoteUsers .filter(user =>
    user.name.toLowerCase().includes(search)
  );

  // Das Dropdown mit den gefilterten Ergebnissen neu befüllen
  fillUserDropdown(filteredUsers);
}





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



function getAssignedUsers() {
  const checkboxes = document.querySelectorAll("#assignedToList input[type='checkbox']:checked");
  return Array.from(checkboxes).map((cb) => cb.value);
}


function toggleDropdown(e) {
  e.stopPropagation();
  const dropdown = document.getElementById("assignedToDropdown");
  dropdown.classList.toggle("open");
}

document.addEventListener("keydown", (e) => {
  if (e.key === "Escape") {
    document.getElementById("assignedToDropdown")?.classList.remove("open");
  }
});


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

function updateAssignedPreview() {
  const container = document.getElementById("assignedPreview");
  const selected = getAssignedUsers();

  container.innerHTML = renderAssignedUsers(selected);


}


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
 *  User Assignment Dropdown functions
 */

/**
 * Initial all addSubtask function after loading the body
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
 * Get the Form inputs into a Object to put it into firebase
 * @param {event} ev - the browser knows where we click
 * @returns
 */


/**
 * Helper func to creat the task object for put to database
 * @returns Task Object
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
    subtasks: subtasksList ,
  };
}

/**
 * Adds the subtask to the array (addSubtask) and render the subtasks
 * @returns a savety point to get out of the funktion if no title is in it. or it`s length is shorter than 5 letters.
 */
function addSubtask(ev) {
  ev.preventDefault();
  const INPUT = document.getElementById("subtask_input");
  const title = INPUT.value.trim();
  if (!title) return;
  const INDEX = subtasksList .length;
  subtasksList .push({
    title: title,
    done: false,
  });
  INPUT.value = "";

  renderSubtaskItem(INDEX, title);
}

/**
 * Creates a subtask list item and appends it to the subtask list in the DOM.
 * Sets the element's index via dataset and id, renders its HTML via template,
 * and attaches all required event listeners.
 * @param {number} index - The position of the subtask in the addSubtask array.
 * @param {string} title - The display text of the subtask.
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
 * Attaches event listeners to a subtask list item for inline editing and deletion.
 * - Dblclick on the text starts inline editing.
 * - Click on the delete button removes the subtask.
 * - Click on the edit button toggles between saving and starting inline editing.
 * @param {HTMLLIElement} LI - The subtask list item element to attach listeners to.
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
 * Escapes special HTML characters in a string to prevent XSS.
 * @param {string} str - The raw string to escape.
 * @returns {string} The escaped HTML-safe string.
 */
function escapeHtml(str) {
  const div = document.createElement("div");
  div.textContent = str;
  return div.innerHTML;
}

/**
 * Switches a subtask list item into inline edit mode.
 * Replaces the text span with an input field and updates the edit button icon.
 * @param {HTMLLIElement} li - The subtask list item to edit.
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
 * Cancels inline editing and restores the original subtask text.
 * @param {HTMLLIElement} li - The subtask list item being edited.
 */
function cancelEditSubtask(li) {
  const input = li.querySelector(".subtask-edit-input");
  if (!input) return;

  const span = document.createElement("span");
  span.className = "subtask-text";
  span.textContent = subtasksList [parseInt(li.dataset.index)].title;

  li.replaceChild(span, input);
}

/**
 * Removes a subtask from the addSubtask array and from the DOM.
 * Re-indexes all remaining subtask items after deletion.
 * @param {HTMLLIElement} li - The subtask list item to delete.
 */
function deleteSubtask(li) {
  addSubtask.splice(parseInt(li.dataset.index), 1);
  li.remove();
}

/**
 * Saves the edited subtask title and exits inline edit mode.
 * Updates the addSubtask array and replaces the input with a text span.
 * @param {HTMLLIElement} li - The subtask list item being edited.
 */
function saveSubtask(li) {
  const input = li.querySelector(".subtask-edit-input");
  if (!input) return;

  const newTitle = input.value.trim();
  if (!newTitle) return;

  subtasksList [parseInt(li.dataset.index)].title = newTitle;

  const span = document.createElement("span");
  span.className = "subtask-text";
  span.textContent = newTitle;
  span.addEventListener("dblclick", () => startEditSubtask(li));
  li.replaceChild(span, input);

  li.classList.remove("editing");
  li.querySelector(".btn--edit img").src = "../assets/img/icons/subtask/edit.svg";
}


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




async function postTask(task) {
  const response = await fetch(ADDTASK_URL, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(task),
  });
  return response.json();
}







/**
 * Resets the task form to its default state and clears all subtasks.
 */
function clearForm() {
  document.getElementById("form_task").reset();
  initDateInput();
  selectPriority("medium");
  document.getElementById("assignedPreview").innerHTML = "";
  fillUserDropdown(remoteUsers );
  subtasksList  = [];
  document.getElementById("subtask_list").innerHTML = "";
}

/**
 * Clear the input of the Subtask
 */
const clearSubtaskInput = (ev) => {
  ev.preventDefault();
  let SUBTASK_INPUT = document.getElementById("subtask_input");
  SUBTASK_INPUT.value = "";
};




