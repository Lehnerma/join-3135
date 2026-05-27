const ADDTASK_URL =
  "https://join-3135-default-rtdb.europe-west1.firebasedatabase.app/tasks.json";

let selectedPriority = "medium";
let remoteUsers = [];
sessionStorage.removeItem("task-status");

// ###########################################################
//  INITIALISIERUNG
// ###########################################################

function init() {
  btnInit();
  subtaskInit();
  initDateInput();
  loadUsers();
  initDropdownOutsideClick();
  initAssignedPreviewResize();
  validetInput();
}

function btnInit() {
  const form = document.getElementById("form_task");
  const clearBtn = document.getElementById("form_clear");
  if (form) form.addEventListener("submit", (e) => { e.preventDefault(); createTask(); });
  if (clearBtn) clearBtn.addEventListener("click", clearForm);
}

// ###########################################################
//  DATUM
// ###########################################################

function toDisplayDate(yyyymmdd) {
  if (!yyyymmdd) return "";
  const parts = yyyymmdd.split("-");
  return parts[2] + "/" + parts[1] + "/" + parts[0];
}

function toStorageDate(ddmmyyyy) {
  const match = ddmmyyyy.match(/^(\d{1,2})\/(\d{1,2})\/(\d{4})$/);
  if (!match) return "";
  return match[3] + "-" + match[2].padStart(2, "0") + "-" + match[1].padStart(2, "0");
}

function initDateInput() {
  setupSingleDateInput("due_date");
  setupSingleDateInput("due_date_edit");
}

function setupSingleDateInput(id) {
  const input = document.getElementById(id);
  if (!input) return;
  const today = toDisplayDate(new Date().toISOString().split("T")[0]);
  input.addEventListener("focus", () => {
    if (!input.value) input.value = today;
  });
}

// ###########################################################
//  PRIORITÄT
// ###########################################################

function selectPriority(priority) {
  ["urgent", "medium", "low"].forEach((p) => {
    document.getElementById("btn_" + p).classList.remove(p + "-active");
  });
  document.getElementById("btn_" + priority).classList.add(priority + "-active");
  selectedPriority = priority;
}

// ###########################################################
//  BENUTER LADEN & DROPDOWN FÜLLEN
// ###########################################################

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

function filterUsers() {
  const search = document.getElementById("assigned_to_search").value.toLowerCase();
  const filtered = remoteUsers.filter((u) => u.name.toLowerCase().includes(search));
  fillUserDropdown(sortUsersWithActiveFirst(filtered));
}

// ###########################################################
//  CUSTOM DROPDOWNS (Assigned To & Category)
// ###########################################################

function toggleDropdown(event) {
  event.stopPropagation();
  const dropdown = event.target.closest(".custom-dropdown");
  if (!dropdown) return;

  // Alle anderen Dropdowns schließen
  document.querySelectorAll(".custom-dropdown").forEach((d) => {
    if (d !== dropdown) d.classList.remove("open");
  });

  dropdown.classList.toggle("open");
  dropdown.querySelector(".custom-dropdown__list")?.scrollTo({ top: 0 });
}

document.addEventListener("keydown", (e) => {
  if (e.key === "Escape") document.querySelectorAll(".custom-dropdown.open").forEach((d) => d.classList.remove("open"));
});

function initDropdownOutsideClick() {
  document.addEventListener("click", (e) => {
    document.querySelectorAll(".custom-dropdown").forEach((d) => {
      if (!d.contains(e.target)) d.classList.remove("open");
    });
  });
}

// ------------------- Category -------------------

function selectCategory(category) {
  setCategoryValue("category", "category_dropdown", category);
}

function selectCategoryEdit(category) {
  const sfx = getInputSuffix();
  setCategoryValue("category" + sfx, "category_dropdown_edit", category);
}

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

// ------------------- Assigned To -------------------

function toggleUser(el) {
  const cb = el.querySelector("input");
  cb.checked = !cb.checked;
  el.classList.toggle("selected", cb.checked);
  updateAssignedPreview();
}

function getAssignedUsers() {
  const checked = document.querySelectorAll("#assigned_to_list input[type='checkbox']:checked");
  return Array.from(checked).map((cb) => ({ name: cb.value, color: cb.dataset.color }));
}

function updateAssignedPreview() {
  document.getElementById("assigned_preview").innerHTML = renderAssignedUsers(getAssignedUsers());
}

// ###########################################################
//  ASSIGNED PREVIEW BADGES
// ###########################################################

function initAssignedPreviewResize() {
  let timer;
  window.addEventListener("resize", () => {
    clearTimeout(timer);
    timer = setTimeout(updateAssignedPreview, 150);
  });
}

function getAssignedDropdownCapacity() {
  const width = document.getElementById("assigned_to_dropdown")?.offsetWidth ?? 0;
  return Math.max(1, Math.floor(width / 34));
}

function getUserInitials(name) {
  const parts = name.trim().split(" ");
  return parts.length > 1
    ? (parts[0][0] + parts[parts.length - 1][0]).toUpperCase()
    : parts[0].slice(0, 2).toUpperCase();
}

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

// ###########################################################
//  TASK OBJEKT BAUEN & API
// ###########################################################

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

function handleTaskCreated() {
  if (document.getElementById("task_created_toast")) {
    closeAddTaskDialog();
    showBoardToast().then(() => loadTasksFromFirebase());
  } else {
    document.getElementById("toast")?.classList.add("show-animation");
    setTimeout(() => window.location.href = "board.html", 1000);
  }
}

// ###########################################################
//  VALIDIERUNG
// ###########################################################

function getInputSuffix() {
  return document.getElementById("title_edit") ? "_edit" : "";
}

function validateRequiredFields(title, dueDate, category) {
  const ok = (el) => { clearError(el); return true; };
  const fail = (el) => { setError(el); return false; };
  const t = title?.value.trim() ? ok(title) : fail(title);
  const d = dueDate?.value ? ok(dueDate) : fail(dueDate);
  const c = category?.value ? ok(category) : fail(category);
  return t && d && c;
}

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

// ###########################################################
//  VALIDIERUNG LIVE (ROTE RÄNDER BEIM AUSFÜLLEN)
// ###########################################################

function setError(input) { input.classList.add("input-invalid"); }
function clearError(input) { input.classList.remove("input-invalid"); }

function validetInput() {
  const fields = [
    { id: "title", event: "input" },
    { id: "due_date", event: "click" },
    { id: "category", event: "input" },
    { id: "title_edit", event: "input" },
    { id: "due_date_edit", event: "click" },
    { id: "category_edit", event: "input" },
  ];
  fields.forEach(({ id, event }) => bindFieldValidation(id, event));
}

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

// ###########################################################
//  FORMULAR ZURÜCKSETZEN
// ###########################################################

function clearForm() {
  const sfx = getInputSuffix();
  resetFormData(sfx);
  resetDropdowns();
  clearAllErrors(sfx);
}

function resetFormData(sfx) {
  document.getElementById("form_task").reset();
  const dueDate = document.getElementById("due_date" + sfx);
  if (dueDate) dueDate.value = "";
  selectPriority("medium");
  subtasksList = [];
  document.getElementById("subtask_list").innerHTML = "";
  clearSubtaskInput(new Event("reset"));
}

function resetDropdowns() {
  document.getElementById("assigned_preview").innerHTML = "";
  fillUserDropdown(sortUsersWithActiveFirst(remoteUsers));

  const sfx = getInputSuffix();
  const catInput = document.getElementById("category" + sfx);
  if (catInput) catInput.value = "";

  const catDropdown = document.getElementById(sfx ? "category_dropdown_edit" : "category_dropdown");
  catDropdown?.querySelectorAll(".custom-dropdown__item").forEach((i) => i.classList.remove("selected"));
}

function clearAllErrors(sfx) {
  clearError(document.getElementById("title" + sfx));
  clearError(document.getElementById("due_date" + sfx));
  clearError(document.getElementById("category" + sfx));
}