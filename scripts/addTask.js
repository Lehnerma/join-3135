const TASK_URL = "https://join-3135-default-rtdb.europe-west1.firebasedatabase.app/tasks" + ".json";

let selectedPriority = "medium";
let SUBTASKS = [];



function init() {
  console.log("INIT läuft");
  console.log("dropdown:", document.getElementById("dropdown"));

  btnInit();
  subtaskInit();
  initDateInput();
  loadUsers();

}

/**
 * Initial all btns in the form.
 */
function btnInit() {
  const FORM = document.getElementById("form_task");
  const CLEAR_FORM = document.getElementById("form_clear");
  FORM.addEventListener("submit", (event) => getFormData(event));
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
      fillUserDropdown(data);
    })
    .catch((error) => console.error("Error fetching users:", error));
}




function fillUserDropdown(users) {
  // console.log("USERS DATA:", users);
  const container = document.getElementById("dropdown");

  let html = "";

  for (const userId in users) {
    const user = users[userId];
    let firstLetter = user.name.charAt(0).toUpperCase();
    let color = contactColors[firstLetter];
    let initials = user.name.charAt(0);

    html += `
          <label  class="user-item user-Selection assignedTo" onclick="toggleUser(this)">
            <div class="logoNameField">
              <div class="initials" style="background-color: ${color};">
                ${initials}
              </div>
            
              <div class="contact-info-text">
                <span>${user.name}</span>
              </div>
            </div>
            
              <input type="checkbox" value="${user.name}">
          </label>
    `;

  }

  container.innerHTML = html;
}

function toggleUser(el) {
  const checkbox = el.querySelector("input");

  checkbox.checked = !checkbox.checked;
  el.classList.toggle("active", checkbox.checked);
}





function getAssignedUsers() {
  const checkboxes = document.querySelectorAll("#dropdown input[type='checkbox']:checked");
  return Array.from(checkboxes).map(cb => cb.value);
}


function toggleDropdown() {
  document.getElementById("dropdown").classList.toggle("hidden");
}


/**
 *  User Assignment Dropdown functions
 */



/**
 * Initial all subtasks function after loading the body
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
 * Resets the task form to its default state and clears all subtasks.
 */
function clearForm() {
  document.getElementById("form_task").reset();
  initDateInput();
  selectPriority("medium");
  SUBTASKS = [];
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

/**
 * Get the Form inputs into a Object to put it into firebase
 * @param {event} ev - the browser knows where we click
 * @returns
 */
function getFormData(ev) {
  ev.preventDefault();
  return buildTaskObj();
}

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
    assignedTo: getAssignedUsers(),
    priority: selectedPriority,
    status: "todo",
    subtasks: SUBTASKS,
  };
}

/**
 * Adds the subtask to the array (SUBTASKS) and render the subtasks
 * @returns a savety point to get out of the funktion if no title is in it. or it`s length is shorter than 5 letters.
 */
function addSubtask(ev) {
  ev.preventDefault();
  const INPUT = document.getElementById("subtask_input");
  const title = INPUT.value.trim();
  if (!title) return;
  const INDEX = SUBTASKS.length;
  SUBTASKS.push({ title });
  INPUT.value = "";

  renderSubtaskItem(INDEX, title);
}

/**
 * Creates a subtask list item and appends it to the subtask list in the DOM.
 * Sets the element's index via dataset and id, renders its HTML via template,
 * and attaches all required event listeners.
 * @param {number} index - The position of the subtask in the SUBTASKS array.
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
  span.textContent = subtasks[parseInt(li.dataset.index)].title;
  span.addEventListener("dblclick", () => startEditSubtask(li));
  li.replaceChild(span, input);

  li.classList.remove("editing");
  li.querySelector(".btn--edit img").src = "../assets/img/icons/subtask/edit.svg";
}

/**
 * Removes a subtask from the SUBTASKS array and from the DOM.
 * Re-indexes all remaining subtask items after deletion.
 * @param {HTMLLIElement} li - The subtask list item to delete.
 */
function deleteSubtask(li) {
  subtasks.splice(parseInt(li.dataset.index), 1);
  li.remove();
  document.querySelectorAll("#subtask_list .subtask-item").forEach((item, i) => {
    item.dataset.index = i;
  });
}

/**
 * Saves the edited subtask title and exits inline edit mode.
 * Updates the SUBTASKS array and replaces the input with a text span.
 * @param {HTMLLIElement} li - The subtask list item being edited.
 */
function saveSubtask(li) {
  const input = li.querySelector(".subtask-edit-input");
  if (!input) return;

  const newTitle = input.value.trim();
  if (!newTitle) return;

  SUBTASKS[parseInt(li.dataset.index)].title = newTitle;

  const span = document.createElement("span");
  span.className = "subtask-text";
  span.textContent = newTitle;
  span.addEventListener("dblclick", () => startEditSubtask(li));
  li.replaceChild(span, input);

  li.classList.remove("editing");
  li.querySelector(".btn--edit img").src = "../assets/img/icons/subtask/edit.svg";
}



async function postTask(task) {
  const response = await fetch(TASK_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(task),
  });

  if (!response.ok) {
    throw new Error("Firebase speichern fehlgeschlagen");
  }

  const data = await response.json();
  console.log("Firebase Response:", data);

  return data;
}


async function getFormData(ev) {
  ev.preventDefault();

  try {
    const task = buildTaskObj();
    await postTask(task);

    //  Toast bei erfolgreichem Speichern anzeigen
    const toast = document.getElementById("toast");
    toast.classList.add("show");

    setTimeout(() => {
      toast.classList.remove("show");
    }, 2000);

  } catch (error) {
    console.error("Fehler beim Speichern:", error);
  }
}