const contactColors = {
  A: "rgba(147, 39, 255, 1)",
  B: "rgba(110, 82, 255, 1)",
  C: "rgba(252, 113, 255, 1)",
  D: "rgba(255, 187, 43, 1)",
  E: "rgba(31, 215, 193, 1)",
  F: "rgba(70, 47, 138, 1)",
  G: "rgba(255, 70, 70, 1)",
  H: "rgba(0, 190, 232, 1)",
  I: "rgba(42, 61, 89, 1)",
  J: "rgba(255, 94, 179, 1)",
  K: "rgba(255, 116, 94, 1)",
  L: "rgba(255, 163, 94, 1)",
  M: "rgba(255, 199, 1, 1)",
  N: "rgba(0, 56, 255, 1)",
  O: "rgba(195, 255, 43, 1)",
  P: "rgba(255, 230, 43, 1)",
  Q: "rgba(255, 70, 150, 1)",
  R: "rgba(0, 150, 130, 1)",
  S: "rgba(255, 120, 0, 1)",
  T: "rgba(0, 120, 255, 1)",
  U: "rgba(180, 40, 40, 1)",
  V: "rgba(100, 200, 0, 1)",
  W: "rgba(150, 0, 255, 1)",
  X: "rgba(0, 255, 200, 1)",
  Y: "rgba(200, 150, 0, 1)",
  Z: "rgba(120, 120, 120, 1)",
};

function getFillUserDropown(color, initials, user) {
  return `
      <label class="user-item assignedTo" onclick="toggleUser(this)">
        <div class="logoNameField">
          <div class="initials" style="background-color:${color}">
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

/**
 * The template for the subtasks
 * @returns the html code for creat a subtask
 */
function getSubtaskTemplate(title, index) {
  return `
    <span id="subtask${index}" class="subtask-text">${escapeHtml(title)}</span>
    <div class="subtask-item--btns">
      <button type="button" class="btn--subtask btn--delete">
        <img src="../assets/img/icons/subtask/bin.svg" alt="delete" />
      </button>
      <span class="div-vert"></span>
      <button type="button" class="btn--subtask btn--edit">
        <img src="../assets/img/icons/subtask/edit.svg" alt="edit" />
      </button>
    </div>`;
}

/**
 * Template for a single contact row in the "Assigned To" dropdown.
 * @param {string|number} id     - Unique contact id (used for data-value)
 * @param {string}        name   - Full name of the contact
 * @param {string}        initials - Two-letter initials, e.g. "MA"
 * @param {string}        color  - CSS color value, e.g. "var(--contact-color-1)" or "#ff7a00"
 * @param {boolean}       checked - Whether the contact is already assigned
 * @returns {string} HTML string for one <li> item
 */
function getAssignedToItemTemplate(id, name, initials, color, checked = false) {
  return `
    <li class="custom-dropdown__item${checked ? " selected" : ""}" data-value="${id}" data-name="${name}">
      <span class="contact-badge" style="background-color: ${color}">${initials}</span>
      <span class="custom-dropdown__name">${name}</span>
      <input type="checkbox" class="custom-dropdown__checkbox"${checked ? " checked" : ""} />
    </li>`;
}

function getSubtaskProgressTemplate(done, total) {
  if (total === 0) return "";
  return `
    <div class="subtask--progress">
      <progress class="subtask--progressbar" max="${total}" value="${done}"></progress>
      <span class="subtask--description">${done}/${total} Subtasks</span>
    </div>`;
}

function getNoTasksTemplate(status) {
  return `
    <li class="board-task no-task">No tasks ${capitalizeFirstLetter(status)}</li>
  `;
}

function getTaskCardTemplet(title, description, category, id, priority) {
  return `
<li class="task" onclick="openTaskDetailDialog(${id})" draggable="true" ondragstart="taskDragStart(event, ${id})" data-id=${id}>
  <article class="task--card">
    <header class="task--header">
      <span class="task--category-label ${toClassName(category)}">${category}</span>
      <button type="button" class="btn task--status-move" onclick="openMoveTaskDialog(event, ${id}, this)">
        <img src="../assets/img/icons/general/double-arrow.svg" alt="Move Arrows" class="move-icon">
      </button>
    </header>
    <section class="task--content" aria-label="task content">
      <div class="task--title-wrapper">
        <h3 class="task--title">${title}</h3>
        <p class="task--description">${description}</p>
      </div>

      <div class="subtask--progress-container"></div>
    </section>
    <footer class="task--footer">
      <ul class="task--assignees" aria-label="Zugewiesene Personen">

      </ul>
      <img src="../assets/img/icons/prio/${priority}.svg" alt="${priority} priority" class="prio-icon">
    </footer>
  </article>
</li>`;
}

function getTaskAssignToTemplet(fullName, initials) {
  const color = contactColors[(initials?.[0] ?? "").toUpperCase()] || "#888";
  return `
<li class="assignee">
  <abbr class="assignee--initials" style="--assignee-color: ${color}" title="${fullName}">${initials}</abbr>
</li>`;
}

function getTaskAssignToTempletWithName(fullName, initials) {
  const color = contactColors[(initials?.[0] ?? "").toUpperCase()] || "#888";
  return `
<li class="assignee f-row">
  <abbr class="assignee--initials" style="--assignee-color: ${color}" title="${fullName}">${initials}</abbr>
  <p class="assignee--name">${fullName}</p>
</li>`;
}

function getDetailTaskTemplate(task) {
  return `
    <header class="detail-task--header f-col">
      <div class="detail-task--category">
        <span class="task--category-label ${toClassName(task.category)}">${task.category}</span>
        <button type="button" class=" btn btn--close" onclick="closeTaskDetailDialog()">
          <img src="../assets/img/icons/general/close-dark.svg" alt="close" />
        </button>
      </div>
      <h2 class="detail-task--title">${task.title}</h2>
    </header>

    <article class="detail-task--content f-col" aria-label="detailed information of the task">

      <div class="detail-task--description detail-task--text">${task.description}</div>

      <section class="detail-task--infos f-col">
        <div class="detail-task--date f-row">
          <h4 class="detail-task--subheading">Due date:</h4>
          <p class="detail-task--text">${task.dueDate}</p>
        </div>

        <div class="detail-task--prio f-row">
          <h4 class="detail-task--subheading">Priority:</h4>
          <div class="detail-task--prio-content f-row">
            <p class="detail-task--text">${capitalizeFirstLetter(task.priority)}</p>
            <img src="../assets/img/icons/prio/${task.priority}.svg" alt="${task.priority} priority" class="prio-icon">
          </div>
        </div>
      </section>

      <section class="detail-task--assignees f-col">
        <h4 class="detail-task--subheading">Assigned to:</h4>
        <ul id="detail_task_assignees" class="detail-task--assignees-list " aria-label="assigned contacts">
        </ul>
      </section>

      <section class="detail-task--subtasks">
        <h4>Subtasks</h4>
        <ul id="detail_subtask_list" class="detail-task--subtasks-list" aria-label="list of subtasks">

        </ul>
      </section>
    </article>

    <footer class="detail-task--footer f-row">
        <button type="button" class="btn btn--delete f-row" onclick="deleteTask(CURRENT_DETAIL_TASK)">
          <img src="../assets/img/icons/subtask/bin.svg" alt="delete" />
          Delete
        </button>
        <div class="divider-vert"></div>
        <button type="button" class="btn btn--edit f-row" onclick="openEditTaskDialog(${task.id})">
          <img src="../assets/img/icons/subtask/edit.svg" alt="edit" />
          Edit
        </button>

    </footer>`;
}

function getDetailSubtaskTemplate(title, checked = false, id) {
  return `
    <li class="detail-task--subtask-item f-row">
      <input type="checkbox" id="sub_check${id}" class="detail-task--subtask-checkbox"${checked ? " checked" : ""} />
      <label for="sub_check${id}" class="detail-task--subtask-text">${title}</label>
    </li>`;
}

function getEditTaskDialogTemplate() {
  return /*html*/ `
    <div class="edit-task-dialog">
      <header class="edit-task-dialog__header">
        <h2>Edit Task</h2>
        <button class="close-dialog-btn edit-task-dialog__close" onclick="closeEditTaskDialog()">
          <img src="../assets/img/icons/subtask/close.svg" alt="X">
        </button>
      </header>

      <form class="form-task" id="form_edit_task">
        <div class="input-section">
          <label for="title" class="required">Title</label>
          <input id="title" class="input" type="text" placeholder="Enter a title" required />
          <span class="field-error">This field is required</span>
        </div>

        <div class="input-section">
          <label for="description">Description</label>
          <textarea id="description" class="input" placeholder="Enter a Description" rows="3"></textarea>
        </div>

        <div class="input-section">
          <label for="dueDate" class="required">Due date</label>
          <input id="dueDate" class="input input-date" type="date" required />
          <span class="field-error">This field is required</span>
        </div>

        <div class="input-section">
          <label class="label--bold">Priority</label>
          <div class="priority-group">
            <button type="button" id="btn_urgent" class="btn btn--prio" onclick="selectPriority('urgent')">
              Urgent <img class="img-prio urgent" src="../assets/img/icons/prio/urgent.svg">
            </button>
            <button type="button" id="btn_medium" class="btn btn--prio" onclick="selectPriority('medium')">
              Medium <img class="img-prio medium" src="../assets/img/icons/prio/medium.svg">
            </button>
            <button type="button" id="btn_low" class="btn btn--prio" onclick="selectPriority('low')">
              Low <img class="img-prio low" src="../assets/img/icons/prio/low.svg">
            </button>
          </div>
        </div>

        <div class="input-section">
          <label for="assignedToSearch">Assigned to</label>
          <div class="custom-dropdown" id="assignedToDropdown">
            <div class="custom-dropdown__trigger">
              <input type="text" id="assignedToSearch" onkeyup="filterUsers()" class="input custom-dropdown__input" onclick="toggleDropdown(event)" placeholder="Select contacts to assign" autocomplete="off" />
              <button type="button" class="custom-dropdown__toggle" onclick="toggleDropdown(event)">
                <span class="custom-dropdown__arrow"></span>
              </button>
            </div>
            <ul class="custom-dropdown__list" id="assignedToList"></ul>
          </div>
          <div id="assignedPreview"></div>
        </div>

        <div class="input-section">
          <label for="category" class="required">Category</label>
          <select id="category" class="input dropdown form--select" required>
            <option value="" selected disabled>Select task category</option>
            <option value="Technical Task">Technical Task</option>
            <option value="User Story">User Story</option>
          </select>
          <span class="field-error">This field is required</span>
        </div>

        <div class="input-section">
          <label for="subtask_input">Subtasks</label>
          <div class="input--section">
            <input id="subtask_input" class="input" type="text" placeholder="Add subtask" />
            <div class="subtask--btns">
              <button type="button" id="subtask-close" class="btn--subtask close" onclick="clearSubtaskInput(event)"><img src="../assets/img/icons/subtask/close.svg"></button>
              <span class="div-vert"></span>
              <button type="button" id="subtask-save" class="btn--subtask check" onclick="addSubtask(event)"><img src="../assets/img/icons/subtask/check.svg"></button>
            </div>
          </div>
          <ul id="subtask_list" class="subtask-list"></ul>
        </div>
      </form>

      <footer class="edit-task-dialog__footer">
        <button type="submit" form="form_edit_task" class="btn btn--ok">
          Ok <img src="../assets/img/icons/subtask/check.svg" alt="✓">
        </button>
      </footer>
    </div>
  `;
}

function getAddTaskDialogTemplate() {
  return /*html*/ `
    <div class="task-container-dialog">
      <!-- Schließbutton oben rechts -->
      <div class="dialog-add-headline">
        <button class="btn btn--close" onclick="closeAddTaskDialog()">
          <img src="../assets/img/icons/subtask/close.svg" alt="X">
        </button>

        <h1 class="input--title">Add Task</h1>
      </div>

      <form class="form-task form-columns" id="form_task">
        <!-- Linke Spalte -->
        <section class="column left">
          <div class="input-section">
            <label for="title" class="required">Title</label>
            <input id="title" class="input" type="text" placeholder="Enter a title" required />
            <span class="field-error">This field is required</span>
          </div>
          <div class="input-section">
            <label for="description">Description</label>
            <textarea id="description" class="input" placeholder="Enter a Description" rows="3"></textarea>
          </div>
          <div class="input-section">
            <label for="dueDate" class="required">Due date</label>
            <input id="dueDate" class="input input-date" type="date" required />
            <span class="field-error">This field is required</span>
          </div>
        </section>

        <div class="divider"></div>

        <!-- Rechte Spalte -->
        <section class="column right">
          <div class="input-section">
            <label for="priority">Priority</label>
            <div class="priority-group">
              <button type="button" id="btn_urgent" class="btn btn--prio" onclick="selectPriority('urgent')">
                Urgent <img class="img-prio urgent" src="../assets/img/icons/prio/urgent.svg">
              </button>
              <button type="button" id="btn_medium" class="btn btn--prio medium-active" onclick="selectPriority('medium')">
                Medium <img class="img-prio medium" src="../assets/img/icons/prio/medium.svg">
              </button>
              <button type="button" id="btn_low" class="btn btn--prio" onclick="selectPriority('low')">
                Low <img class="img-prio low" src="../assets/img/icons/prio/low.svg">
              </button>
            </div>
          </div>

          <div class="input-section">
            <label for="assignedToSearch">Assigned to</label>
            <div class="custom-dropdown" id="assignedToDropdown">
              <div class="custom-dropdown__trigger">
                <input type="text" id="assignedToSearch" onkeyup="filterUsers()" class="input custom-dropdown__input" onclick="toggleDropdown(event)" placeholder="Select contacts to assign" autocomplete="off" />
                <button type="button" class="custom-dropdown__toggle" onclick="toggleDropdown(event)">
                  <span class="custom-dropdown__arrow"></span>
                </button>
              </div>
              <div id="assignedPreview"></div>
              <ul class="custom-dropdown__list" id="assignedToList"></ul>
            </div>
          </div>

          <div class="input-section">
            <label for="category" class="required">Category</label>
            <select id="category" class="input dropdown form--select" required>
              <option value="" selected disabled>Select task category</option>
              <option value="Technical Task">Technical Task</option>
              <option value="User Story">User Story</option>
            </select>
          </div>

          <div class="input-section">
            <label for="subtask_input">Subtasks</label>
            <div class="input--section">
              <input id="subtask_input" class="input" type="text" placeholder="Add subtask" />
              <div class="subtask--btns">
                <button type="button" id="subtask-close" class="btn--subtask close" onclick="clearSubtaskInput(event)"><img src="../assets/img/icons/subtask/close.svg"></button>
                <span class="div-vert"></span>
                <button type="button" id="subtask-save" class="btn--subtask check" onclick="addSubtask(event)"><img src="../assets/img/icons/subtask/check.svg"></button>
              </div>
            </div>
            <ul id="subtask_list" class="subtask-list"></ul>
          </div>
        </section>

        <section class="form-info-section">
          <p><b class="form-info">*</b> This field is required</p>
        </section>
      </form>

      <section class="form-footer">
        <div class="action-btns">
          <button id="form_clear" type="button" class="btn btn--secondary clear" onclick="clearForm()">Clear</button>
          <button type="submit" form="form_task" class="btn btn--primary">Create Task</button>
        </div>
      </section>
    </div>
  `;
}

/**
 * Template für Task-Dialog mit Details, Delete & Edit Buttons
 * @param {object} task - Task mit id, title, description, category, dueDate, priority, assignedTo, subtasks, firebaseKey
 * @returns {string} HTML für Task-Dialog
 */
function getTaskDialogTemplate(task) {
  const assignedNames = task.assignedTo ? task.assignedTo.join(", ") : "None";
  const subtaskNames = task.subtasks ? task.subtasks.map(s => s.title).join(", ") : "None";
  return `
    <p>Category: ${escapeHtml(task.category)}</p>
    <h2>${escapeHtml(task.title)}</h2>
    <p>${escapeHtml(task.description)}</p>
    <p>Due Date: ${escapeHtml(task.dueDate)}</p>
    <p>Priority: ${escapeHtml(task.priority)}</p>
    <p>Assigned To: ${escapeHtml(assignedNames)}</p>
    <p>Subtasks: ${escapeHtml(subtaskNames)}</p>
    
    <button onclick="closeTaskDialog()">X</button>
    <button onclick="deleteTask('${task.firebaseKey}')">Delete</button>
    <button onclick="editTask('${task.firebaseKey}')">Edit</button>
  `;
}
