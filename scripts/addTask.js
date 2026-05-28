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
  validetInput();
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
 * Converts a yyyy-mm-dd date from storage to dd/mm/yyyy for display.
 * @param {string} yyyymmdd - Date string in storage format (e.g. "2025-12-24").
 * @returns {string} Date in display format (e.g. "24/12/2025").
 */
function toDisplayDate(yyyymmdd) {
  if (!yyyymmdd) return "";
  const parts = yyyymmdd.split("-");
  return parts[2] + "." + parts[1] + "." + parts[0];
}

/**
 * Converts a dd/mm/yyyy date from the input field to yyyy-mm-dd for storing.
 * @param {string} ddmmyyyy - Date string like "24/12/2025".
 * @returns {string} Storage-format date (e.g. "2025-12-24"), or empty if invalid.
 */
function toStorageDate(ddmmyyyy) {
  const match = ddmmyyyy.match(/^(\d{1,2})\.(\d{1,2})\.(\d{4})$/);
  if (!match) return "";
  return match[3] + "-" + match[2].padStart(2, "0") + "-" + match[1].padStart(2, "0");
}

/**
 * Initialises both due-date inputs (page + dialog).
 * Sets today as minimum and prefills on first focus.
 */
function initDateInput() {
  setupSingleDateInput("due_date");
  setupSingleDateInput("due_date_edit");
  initDatePicker();
  initAutoFormatDate("due_date");
  initAutoFormatDate("due_date_edit");
}

/**
 * Automatically inserts dots (.) while the user types a date.
 * Example: "28122025" → "28.12.2025"
 * @param {string} id - The element ID of the date input.
 */
function initAutoFormatDate(id) {
  const input = document.getElementById(id);
  if (!input) return;
  let formatting = false;

  input.addEventListener("input", () => {
    if (formatting) return;
    formatting = true;

    const cursorPos = input.selectionStart;
    const rawBefore = input.value.slice(0, cursorPos);
    const digitsBefore = rawBefore.replace(/[^0-9]/g, "").length;

    let val = input.value.replace(/[^0-9]/g, "");
    if (val.length > 8) val = val.slice(0, 8);

    let day = val.slice(0, 2);
    let month = val.slice(2, 4);
    let year = val.slice(4, 8);

    // Validate day when user starts typing month (3+ digits)
    if (val.length >= 3) {
      const dayNum = parseInt(day);
      if (dayNum > 31) day = "31";
      else if (dayNum === 0 && day.length === 2) day = "01";
    }

    // Validate month when user starts typing year (5+ digits)
    if (val.length >= 5) {
      const monthNum = parseInt(month);
      if (monthNum > 12) month = "12";
      else if (monthNum === 0 && month.length === 2) month = "01";
    }

    // Build formatted string
    let formatted = day;
    if (val.length > 2) formatted += "." + month;
    if (val.length > 4) formatted += "." + year;

    input.value = formatted;

    // Restore cursor position
    let newPos = digitsBefore;
    if (digitsBefore > 2) newPos++;
    if (digitsBefore > 4) newPos++;
    input.setSelectionRange(newPos, newPos);

    formatting = false;

    // Trigger validation after formatting
    input.dispatchEvent(new Event("validate", { bubbles: false }));
  });
}

/**
 * Configures a single date text input.
 * Sets today as the minimum selectable date on the associated hidden picker.
 * @param {string} id - The element ID of the date input.
 */
function setupSingleDateInput(id) {
  const input = document.getElementById(id);
  if (!input) return;
  const todayIso = new Date().toISOString().split("T")[0];
  const today = toDisplayDate(todayIso);
  const picker = document.getElementById(id + "_picker");
  if (picker) picker.min = todayIso;
  input.addEventListener("focus", () => {
    if (!input.value) input.value = today;
  });
}

/**
 * Wires calendar icon buttons to open native date pickers.
 * Handles both the main add-task page and the board dialog variants.
 * When a date is chosen, it updates the text input with dd/mm/yyyy format.
 */
function initDatePicker() {
  wireDatePicker("due_date_picker", "due_date", "date_icon_btn");
  wireDatePicker("due_date_picker_edit", "due_date_edit", "date_icon_btn_edit");
}

/**
 * Wires a single date picker to its icon button and text input.
 * @param {string} pickerId - ID of the hidden native date input.
 * @param {string} textInputId - ID of the visible text input.
 * @param {string} iconBtnId - ID of the calendar icon button.
 */
function wireDatePicker(pickerId, textInputId, iconBtnId) {
  const picker = document.getElementById(pickerId);
  const textInput = document.getElementById(textInputId);
  const iconBtn = document.getElementById(iconBtnId);
  if (!picker || !textInput || !iconBtn) return;

  iconBtn.addEventListener("click", () => {
    if ("showPicker" in picker) {
      picker.showPicker();
    } else {
      picker.click();
    }
  });

  picker.addEventListener("change", () => {
    if (picker.value) {
      textInput.value = toDisplayDate(picker.value);
      const val = textInput.value.trim();
      if (!val) { clearError(textInput); setError(textInput); }
      else if (isDateInPast(val)) { clearError(textInput); setErrorPast(textInput); }
      else clearError(textInput);
    }
  });
}

/**
 * Checks whether a date string in dd/mm/yyyy format lies before today.
 * @param {string} ddmmyyyy - Date string like "24/12/2025".
 * @returns {boolean} True if the date is valid and in the past.
 */
function isDateInPast(ddmmyyyy) {
  const match = ddmmyyyy.match(/^(\d{1,2})\.(\d{1,2})\.(\d{4})$/);
  if (!match) return false;
  const inputDate = new Date(+match[3], +match[2] - 1, +match[1]);
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  inputDate.setHours(0, 0, 0, 0);
  return inputDate < today;
}

/**
 * Checks whether a date string matches the dd.mm.yyyy format.
 * @param {string} val - Date string to check.
 * @returns {boolean} True if the format is valid.
 */
function isValidDateFormat(val) {
  return /^(\d{1,2})\.(\d{1,2})\.(\d{4})$/.test(val);
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
    dueDate: toStorageDate(read("due_date" + sfx)),
    category: read("category" + sfx),
    assignedTo: getAssignedUsers(),
    priority: selectedPriority,
    status: status,
    subtasks: subtasksList,
  };
}

/**
 * POSTs the finished task object to Firebase.
 * @param {Object} task - The task object to send.
 * @param {HTMLElement|null} btn - Submit button (re-enabled on error).
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
 * After a successful task creation, shows a toast and either closes the
 * board dialog or redirects to the board page.
 */
function handleTaskCreated() {
  if (document.getElementById("task_created_toast")) {
    closeAddTaskDialog();
    showBoardToast().then(() => loadTasksFromFirebase());
  } else {
    document.getElementById("toast")?.classList.add("show-animation");
    setTimeout(() => window.location.href = "board.html", 1000);
  }
}

/**
 * Returns "_edit" if the board add-task dialog is open, otherwise "".
 * @returns {string} The suffix string.
 */
function getInputSuffix() {
  return document.getElementById("title_edit") ? "_edit" : "";
}

/**
 * Checks the three mandatory fields and toggles red error borders.
 * @param {HTMLElement} title - Title input.
 * @param {HTMLElement} dueDate - Due-date input.
 * @param {HTMLElement} category - Category input.
 * @returns {boolean} True when all three fields have a value.
 */
function validateRequiredFields(title, dueDate, category) {
  const ok = (el) => { clearError(el); return true; };
  const fail = (el) => { setError(el); return false; };
  const failPast = (el) => { clearError(el); setErrorPast(el); return false; };
  const t = title?.value.trim() ? ok(title) : fail(title);
  const d = dueDate?.value ? (isDateInPast(dueDate.value) ? failPast(dueDate) : ok(dueDate)) : fail(dueDate);
  const c = category?.value ? ok(category) : fail(category);
  return t && d && c;
}

/**
 * Validates the form and, if everything is filled in, sends the task.
 */
async function createTask() {
  const sfx = getInputSuffix();
  const title = document.getElementById("title" + sfx);
  const dueDate = document.getElementById("due_date" + sfx);
  const category = document.getElementById("category" + sfx);
  const btn = document.getElementById("btnCreateTask");
  if (btn) btn.disabled = true;

  if (!validateRequiredFields(title, dueDate, category)) {
    if (btn) btn.disabled = false;
    return;
  }
  await sendTaskRequest(buildTaskObj(sessionStorage.getItem("task-status") ?? "todo"), btn);
}

/**
 * Adds a red error border to an input element (required / empty).
 * @param {HTMLElement} input - The element to mark.
 */
function setError(input) { input.classList.add("input-invalid"); }

/**
 * Adds a red error border specifically for a date that lies in the past.
 * @param {HTMLElement} input - The date input element to mark.
 */
function setErrorPast(input) { input.classList.add("input-invalid-past"); }

/**
 * Removes all error classes from an input element.
 * @param {HTMLElement} input - The element to clear.
 */
function clearError(input) {
  input.classList.remove("input-invalid");
  input.classList.remove("input-invalid-past");
}

/**
 * Attaches live validation (input/click/blur) to all required fields.
 */
function validetInput() {
  const fields = [
    { id: "title", event: "input" },
    { id: "due_date", event: "input" },
    { id: "category", event: "input" },
    { id: "title_edit", event: "input" },
    { id: "due_date_edit", event: "input" },
    { id: "category_edit", event: "input" },
  ];
  fields.forEach(({ id, event }) => bindFieldValidation(id, event));
}

/**
 * Adds on-input and on-blur validation to a single field.
 * @param {string} id - The element ID.
 * @param {string} eventType - The event name (e.g. "input", "click").
 */
function bindFieldValidation(id, eventType) {
  const el = document.getElementById(id);
  if (!el) return;
  const isDateField = id.startsWith("due_date");

  function validate(el) {
    const val = el.value.trim();
    if (!val) { clearError(el); setError(el); }
    else if (isDateField && !isValidDateFormat(val)) { clearError(el); setError(el); }
    else if (isDateField && isDateInPast(val)) { clearError(el); setErrorPast(el); }
    else clearError(el);
  }

  if (isDateField) {
    // Validation only via custom "validate" event (fired after auto-format) + blur
    el.addEventListener("validate", () => validate(el));
    el.addEventListener("blur", () => validate(el));
  } else {
    el.addEventListener(eventType, () => validate(el));
    el.addEventListener("blur", () => validate(el));
  }
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