/** Shared array holding all subtask objects for the current task. */
let subtasksList = [];

/**
 * Initializes subtask input field and its save/clear buttons.
 * Attaches click and keydown handlers for adding and clearing subtasks.
 */
function subtaskInit() {
  const SUBTASK_SAVE = document.getElementById("subtask_save");
  const SUBTASK_CLEAR = document.getElementById("subtask_close");
  const SUBTASK_INPUT = document.getElementById("subtask_input");

  if (!SUBTASK_SAVE || !SUBTASK_CLEAR || !SUBTASK_INPUT) return;
  SUBTASK_SAVE.onclick = (event) => addSubtask(event);
  SUBTASK_CLEAR.onclick = (event) => clearSubtaskInput(event);
  SUBTASK_INPUT.onkeydown = (e) => {
    if (e.key === "Enter") {
      addSubtask(e);
    }
  };
}

/**
 * Clears the subtask text input and resets any visible error.
 * @param {Event} ev - The DOM event that triggered the clear action.
 */
function clearSubtaskInput(ev) {
  ev.preventDefault();
  let SUBTASK_INPUT = document.getElementById("subtask_input");
  SUBTASK_INPUT.value = "";
}

/**
 * Reads the input value, creates a new subtask object, pushes it into
 * subtasksList, clears the input, and renders the subtask in the list.
 * @param {Event} ev - The DOM event that triggered the add action.
 */
function addSubtask(ev) {
  ev.preventDefault();
  const INPUT = document.getElementById("subtask_input");
  const title = INPUT.value.trim();
  if (!title) return;
  const INDEX = subtasksList.length;
  subtasksList.push({ title: title, done: false });
  INPUT.value = "";
  renderSubtaskItem(INDEX, title);
}

/**
 * Builds a list-item element for a subtask, fills it with the template,
 * attaches event listeners, and appends it to the subtask list container.
 * @param {number} index - Position of the subtask inside subtasksList.
 * @param {string} title - Display text of the subtask.
 */
function renderSubtaskItem(index, title) {
  const LIST = document.getElementById("subtask_list");
  const LI = document.createElement("li");
  LI.className = "subtask-item input--section";
  LI.dataset.index = index;
  LI.id = "subtask_" + index;
  LI.innerHTML = getSubtaskTemplate(title, index);
  addSubtaskEventListener(LI);
  LIST.appendChild(LI);
}

/**
 * Attaches the double-click (edit), delete, and edit-button listeners
 * to a single subtask list item.
 * @param {HTMLLIElement} LI - The subtask list-item element.
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
 * @param {string} str - The untrusted text to sanitize.
 * @returns {string} The HTML-escaped string.
 */
function escapeHtml(str) {
  const DIV = document.createElement("div");
  DIV.textContent = str;
  return DIV.innerHTML;
}

/**
 * Switches a subtask item into inline-edit mode: replaces the text span
 * with an input field and swaps the edit icon to a checkmark.
 * @param {HTMLLIElement} li - The subtask list item to edit.
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
 * Cancels inline editing on a subtask and restores the original text span.
 * @param {HTMLLIElement} li - The subtask list item being edited.
 */
function cancelEditSubtask(li) {
  const INPUT = li.querySelector(".subtask-edit-input");
  if (!INPUT) return;
  const SPAN = document.createElement("span");
  SPAN.className = "subtask-text";
  SPAN.textContent = subtasksList[parseInt(li.dataset.index)].title;
  SPAN.addEventListener("dblclick", () => startEditSubtask(li));
  li.replaceChild(SPAN, INPUT);
  li.classList.remove("editing");
  li.querySelector(".btn--edit img").src = "../assets/img/icons/subtask/edit.svg";
}

/**
 * Removes a subtask from the internal array and from the DOM,
 * then re-indexes all remaining subtask items.
 * @param {HTMLLIElement} li - The subtask list item to delete.
 */
function deleteSubtask(li) {
  subtasksList.splice(parseInt(li.dataset.index), 1);
  li.remove();
  document.querySelectorAll("#subtask_list .subtask-item").forEach((item, i) => {
    item.dataset.index = i;
    item.id = "subtask_" + i;
  });
}

/**
 * Saves the edited title from the inline input, updates subtasksList,
 * and switches the item back to display mode.
 * @param {HTMLLIElement} li - The subtask list item being edited.
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
