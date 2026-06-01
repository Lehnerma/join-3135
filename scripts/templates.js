/**
 * Returns the HTML for a user row in the "Assigned To" dropdown.
 * @param {string} color - CSS color for the initials badge.
 * @param {string} initials - Two-letter initials.
 * @param {Object} user - User object with a name property.
 * @returns {string} HTML string for a dropdown label.
 */
function getFillUserDropown(color, initials, user) {
  return `
      <li class="user-item assignedTo" onclick="toggleUser(this)">
        <div class="logoNameField">
          <div class="initials" style="background-color:${color}">
            ${initials}
          </div>

          <div class="contact-info-text">
            <span>${user.name}</span>
          </div>
        </div>

        <input type="checkbox" value="${user.name}" data-color="${color}">
      </li>
    `;
}

/**
 * The template for the subtasks
 * @returns the html code for creat a subtask
 */
function getSubtaskTemplate(title, index) {
  return `
    <span id="subtask_${index}" class="subtask-text">${escapeHtml(title)}</span>
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
    <li class="custom-dropdown__item${checked ? " selected" : ""}" data-value="${id}" data-name="${name}" data-color="${color}">
      <span class="contact-badge" style="background-color: ${color}">${initials}</span>
      <span class="custom-dropdown__name">${name}</span>
      <input type="checkbox" class="custom-dropdown__checkbox"${checked ? " checked" : ""} />
    </li>`;
}

/**
 * Returns the HTML for a single assigned-user circle badge.
 * @param {string} name     - Full name of the user (used for title attribute).
 * @param {string} initials - 1–2 letter initials.
 * @param {string} color    - CSS background color.
 * @returns {string} HTML string for one circle.
 */
function getUserCircleTemplate(name, initials, color) {
  return `<li class="assigned-circle" style="background-color:${color}" title="${name}">${initials}</li>`;
}

/**
 * Returns the HTML wrapper containing all assigned-user circles.
 * @param {string} circlesHtml - Concatenated circle HTML strings.
 * @returns {string} HTML string for the wrapper div.
 */
function getAssignedUsersTemplate(circlesHtml) {
  return `<ul class="assigned-wrapper">${circlesHtml}</ul>`;
}

/**
 * Returns the HTML for a "+N" overflow circle badge.
 * @param {number} count - Number of hidden users.
 * @returns {string} HTML string for the overflow circle.
 */
function getAssignedUsersMoreTemplate(count) {
  return `<li class="assigned-circle assigned-circle--more" title="+${count} weitere">+${count}</li>`;
}

/**
 * Returns the HTML for the subtask progress bar, or an empty string if there are no subtasks.
 * @param {number} done - Number of completed subtasks.
 * @param {number} total - Total number of subtasks.
 * @returns {string} HTML string, or "" if total is 0.
 */
function getSubtaskProgressTemplate(done, total) {
  if (total === 0) return "";
  return `
    <div class="subtask--progress">
      <progress class="subtask--progressbar" max="${total}" value="${done}"></progress>
      <span class="subtask--description">${done}/${total} Subtasks</span>
    </div>`;
}

/**
 * Returns the HTML for the "no tasks" placeholder in a board column.
 * @param {string} status - The column status key.
 * @returns {string} HTML string for the placeholder list item.
 */
function getNoTasksTemplate(status) {
  return `
    <li class="board-task no-task">No tasks ${capitalizeFirstLetter(status)}</li>
  `;
}

/**
 * Returns the HTML for a task card on the board.
 * @param {string} title - Task title.
 * @param {string} description - Task description.
 * @param {string} category - Task category.
 * @param {number} id - Task id.
 * @param {string} priority - Priority level ("low", "medium", "urgent").
 * @returns {string} HTML string for the task card list item.
 */
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

/**
 * Returns the HTML for the "+N" overflow badge when more assignees exist than are shown.
 * @param {number} count - Number of hidden assignees.
 * @returns {string} HTML string for the overflow list item.
 */
function getAssigneeMoreTemplate(count) {
  return `
<li class="assignee">
  <abbr class="assignee--initials assignee--more" title="+${count} weitere">+${count}</abbr>
</li>`;
}

/**
 * Returns the HTML for a single assignee badge (initials only).
 * @param {string} fullName - The full name of the assignee.
 * @param {string} initials - Two-letter initials.
 * @param {string} color - CSS background color.
 * @returns {string} HTML string for an assignee list item.
 */
function getTaskAssignToTemplet(fullName, initials, color) {
  return `
<li class="assignee">
  <abbr class="assignee--initials" style="background-color:${color}" title="${fullName}">${initials}</abbr>
</li>`;
}

/**
 * Returns the HTML for an assignee badge with the full name displayed.
 * @param {string} fullName - The full name of the assignee.
 * @param {string} initials - Two-letter initials.
 * @param {string} color - CSS background color.
 * @returns {string} HTML string for an assignee list item with name.
 */
function getTaskAssignToTempletWithName(fullName, initials, color) {
  return `
<li class="assignee f-row">
  <abbr class="assignee--initials" style="background-color:${color}" title="${fullName}">${initials}</abbr>
  <p class="assignee--name">${fullName}</p>
</li>`;
}

/**
 * Returns the HTML for the full task detail view inside the detail dialog.
 * @param {Object} task - The task object with all detail fields.
 * @returns {string} HTML string for the detail view.
 */
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

    <article class="detail-task--content" aria-label="detailed information of the task">

      <div class="detail-task--description detail-task--text">${task.description}</div>

      <section class="detail-task--infos f-col">
        <div class="detail-task--date f-row">
          <h4 class="detail-task--subheading">Due date:</h4>
          <p class="detail-task--text">${toDisplayDate(task.dueDate)}</p>
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
        <h4 class="detail-task--subheading">Subtasks</h4>
        <ul id="detail_subtask_list" class="detail-task--subtasks-list" aria-label="list of subtasks">

        </ul>
      </section>
    </article>

    <footer class="detail-task--footer f-row">
        <button type="button" class="btn btn--delete f-row" onclick="deleteTask(current_detail_task)">
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

/**
 * Returns the HTML for a single subtask row in the detail view.
 * @param {string} title - The subtask title.
 * @param {boolean} [checked=false] - Whether the subtask is done.
 * @param {number} id - The parent task's id (used for the checkbox id).
 * @returns {string} HTML string for a subtask list item.
 */
function getDetailSubtaskTemplate(title, checked = false, taskId, subtaskIndex) {
  const IS_CHECKED = checked === true || checked === "true";
  return `
    <li class="detail-task--subtask-item f-row">
      <input type="checkbox" id="sub_check_${taskId}_${subtaskIndex}" class="detail-task--subtask-checkbox"${IS_CHECKED ? " checked" : ""} onchange="toggleSubtaskDone(${taskId}, ${subtaskIndex})" />
      <label for="sub_check_${taskId}_${subtaskIndex}" class="detail-task--subtask-text"><span class="subtask-dot">•</span>${title}</label>
    </li>`;
}

/**
 * Returns the HTML for the edit-task dialog form.
 * @returns {string} HTML string for the edit task form dialog.
 */
function getEditTaskDialogTemplate() {
  return /*html*/ `
    <header class="edit-task--header">
      <button class="btn btn--close" onclick="closeEditTaskDialog()">
        <img src="../assets/img/icons/subtask/close.svg" alt="X" />
      </button>
    </header>

    <form class="edit-task--form" id="form_edit_task">
      <section class="input-section">
        <label for="title" class="required">Title</label>
        <input id="title" class="input" type="text" placeholder="Enter a title" required />
      </section>

      <section class="input-section">
        <label for="description">Description</label>
        <textarea id="description" class="input" placeholder="Enter a Description" rows="3"></textarea>
      </section>

      <section class="input-section">
        <label for="due_date" class="required">Due date</label>
        <div class="date-wrapper">
        <input id="due_date" class="input input-date" type="date" autocomplete="off">
        <button type="button" class="date-icon-btn date-icon-btn--right" onclick="openDatePicker('due_date')" tabindex="-1">
          <img class="date-icon-img" src="../assets/img/icons/input/event.svg" alt="calendar">
        </button>
        </div>
      </section>

      <section class="input-section">
        <label class="label--bold">Priority
          <div class="priority-group">
            <button type="button" id="btn_urgent" class="btn btn--prio" onclick="selectPriority('urgent')">Urgent <img
                class="img-prio urgent" src="../assets/img/icons/prio/urgent.svg" /></button>
            <button type="button" id="btn_medium" class="btn btn--prio" onclick="selectPriority('medium')">Medium <img
                class="img-prio medium" src="../assets/img/icons/prio/medium.svg" /></button>
            <button type="button" id="btn_low" class="btn btn--prio" onclick="selectPriority('low')">Low <img
                class="img-prio low" src="../assets/img/icons/prio/low.svg" /></button>
          </div>
        </label>
      </section>

      <section class="input-section">
        <label for="assigned_to_search">Assigned to</label>
        <div class="custom-dropdown" id="assigned_to_dropdown">
          <div class="custom-dropdown__trigger">
            <input type="text" id="assigned_to_search" onkeyup="filterUsers()" class="input custom-dropdown__input"
              onclick="toggleDropdown(event)" placeholder="Select contacts to assign" autocomplete="off" />
            <button type="button" class="custom-dropdown__toggle" onclick="toggleDropdown(event)">
              <span class="custom-dropdown__arrow"></span>
            </button>
          </div>
          <div id="assigned_preview"></div>
          <ul class="custom-dropdown__list" id="assigned_to_list"></ul>
        </div>
      </section>

      <section class="input-section">
        <label class="">Category</label>
        <div class="custom-dropdown" id="category_dropdown_edit">
          <div class="custom-dropdown__trigger">
            <input type="text" id="category" class="input custom-dropdown__input" readonly
              onclick="toggleDropdown(event)" placeholder="Select task category" autocomplete="off" />
            <button type="button" class="custom-dropdown__toggle" aria-label="Toggle category dropdown">
              <span class="custom-dropdown__arrow"></span>
            </button>
          </div>
          <ul class="custom-dropdown__list" id="category_list_edit">
            <li class="custom-dropdown__item" onclick="selectCategoryEdit('Technical Task')">Technical Task</li>
            <li class="custom-dropdown__item" onclick="selectCategoryEdit('User Story')">User Story</li>
          </ul>
        </div>
      </section>

      <section class="input-section">
        <label for="subtask_input">Subtasks</label>
        <div class="input--section">
          <input id="subtask_input" class="input" type="text" placeholder="Add subtask" />
          <div class="subtask--btns">
            <button type="button" id="subtask_close" class="btn--subtask close"
              onclick="clearSubtaskInput(event)"><img src="../assets/img/icons/subtask/close.svg" /></button>
            <span class="div-vert"></span>
            <button type="button" id="subtask_save" class="btn--subtask check" onclick="addSubtask(event)"><img
                src="../assets/img/icons/subtask/check.svg" /></button>
          </div>
        </div>
        <ul id="subtask_list" class="subtask-list"></ul>
      </section>
    </form>

    <footer class="edit-task--footer">
      <button type="submit" form="form_edit_task" class="btn btn--add">Ok <img
          src="../assets/img/icons/subtask/check.svg" alt="✓" /></button>
    </footer>
  `;
}

/**
 * Returns the HTML for the add-task dialog form.
 * @returns {string} HTML string for the add task form dialog.
 */
function getAddTaskDialogTemplate() {
  return /*html*/ `
    <div class="dat-container">
      <div class="dat-headline">
        <button class="btn btn--close" onclick="closeAddTaskDialog()">
          <img src="../assets/img/icons/subtask/close.svg" alt="X">
        </button>
        <h1 class="dat-title">Add Task</h1>
      </div>

      <form class="dat-form" id="form_task" novalidate>
        <section class="dat-col">
          <div class="input-section">
            <label for="title_edit" class="required">Title</label>
            <input id="title_edit" class="input" type="text" placeholder="Enter a title" required />
          </div>
          <div class="input-section">
            <label for="description">Description</label>
            <textarea id="description" class="input" placeholder="Enter a Description" rows="3"></textarea>
          </div>
           <div class="input-section">
             <label for="due_date_edit" class="required">Due date</label>
             <div class="date-wrapper">
               <input id="due_date_edit" class="input input-date" type="date" autocomplete="off">
               <button type="button" class="date-icon-btn date-icon-btn--right" onclick="openDatePicker('due_date_edit')" tabindex="-1">
                 <img class="date-icon-img" src="../assets/img/icons/input/event.svg" alt="calendar">
               </button>
             </div>
           </div>
        </section>

        <section class="dat-col">
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
            <label for="assigned_to_search">Assigned to</label>
            <div class="custom-dropdown" id="assigned_to_dropdown">
              <div class="custom-dropdown__trigger">
                <input type="text" id="assigned_to_search" onkeyup="filterUsers()" class="input custom-dropdown__input" onclick="toggleDropdown(event)" placeholder="Select contacts to assign" autocomplete="off" />
                <button type="button" class="custom-dropdown__toggle" onclick="toggleDropdown(event)">
                  <span class="custom-dropdown__arrow"></span>
                </button>
              </div>
              <div id="assigned_preview"></div>
              <ul class="custom-dropdown__list" id="assigned_to_list"></ul>
            </div>
          </div>

          <div class="input-section">
            <label class="required">Category</label>
            <div class="custom-dropdown" id="category_dropdown_edit">
              <div class="custom-dropdown__trigger">
                <input type="text" id="category_edit" class="input custom-dropdown__input" readonly
                  onclick="toggleDropdown(event)" placeholder="Select task category" autocomplete="off" />
                <button type="button" class="custom-dropdown__toggle" onclick="toggleDropdown(event)" aria-label="Toggle category dropdown">
                  <span class="custom-dropdown__arrow"></span>
                </button>
              </div>
              <ul class="custom-dropdown__list" id="category_list_edit">
                <li class="custom-dropdown__item" onclick="selectCategoryEdit('Technical Task')">Technical Task</li>
                <li class="custom-dropdown__item" onclick="selectCategoryEdit('User Story')">User Story</li>
              </ul>
            </div>
          </div>

          <div class="input-section">
            <label for="subtask_input">Subtasks</label>
            <div class="input--section">
              <input id="subtask_input" class="input" type="text" placeholder="Add subtask" />
              <div class="subtask--btns">
                <button type="button" id="subtask_close" class="btn--subtask close" onclick="clearSubtaskInput(event)"><img src="../assets/img/icons/subtask/close.svg"></button>
                <span class="div-vert"></span>
                <button type="button" id="subtask_save" class="btn--subtask check" onclick="addSubtask(event)"><img src="../assets/img/icons/subtask/check.svg"></button>
              </div>
            </div>
            <ul id="subtask_list" class="subtask-list"></ul>
          </div>
        </section>
      </form>

      <p class="dat-info"><b class="form-info">*</b> This field is required</p>

      <div class="dat-footer">
        <button id="form_clear" type="button" class="btn btn--secondary clear" onclick="clearForm()">Clear</button>
        <button id="btn_create_task" type="submit" form="form_task" class="btn btn--primary">Create Task</button>
      </div>
    </div>
  `;
}

/**
 * Returns the inner HTML for the move-task dropdown.
 * @param {number} taskId - The id of the task.
 * @param {Array<Object>} targets - List of move targets with status and direction.
 * @returns {string} HTML string for the dropdown content.
 */
function getMoveDropdownTemplate(taskId, targets) {
  const BTNS = targets.map((t) => getMoveButtonTemplate(taskId, t)).join("");
  return `
    <p class="moveTaskDropdown--label">Move to</p>
    <ul class="moveTaskDropdown--list">${BTNS}</ul>
  `;
}

/**
 * Returns the HTML for a single move button in the move-task dropdown.
 * @param {number} taskId - The id of the task.
 * @param {Object} target - Move target with status and direction.
 * @param {string} target.status - The target status key.
 * @param {string} target.direction - "up" or "down".
 * @returns {string} HTML string for one list item button.
 */
function getMoveButtonTemplate(taskId, { status, direction }) {
  const ICON = direction === "up" ? "arrow_upward" : "arrow_downward";
  return `
    <li>
      <button type="button" class="btn--moveTaskDropdown" onclick="moveTaskToStatus(${taskId}, '${status}')">
        <img src="../assets/img/icons/general/${ICON}.svg" alt="${direction}" class="moveTaskDropdown--arrow">
        <span>${STATUS_LABELS[status]}</span>
      </button>
    </li>
  `;
}

/**
 * Returns the HTML for the legacy task detail/action dialog.
 * @param {Object} task - Task object with id, title, description, category, dueDate, priority, assignedTo, subtasks, and firebaseKey.
 * @returns {string} HTML string for the dialog.
 */
function getTaskDialogTemplate(task) {
  const ASSIGNED_NAMES = task.assignedTo ? task.assignedTo.join(", ") : "None";
  const SUBTASK_NAMES = task.subtasks ? task.subtasks.map(s => s.title).join(", ") : "None";
  return `
    <p>Category: ${escapeHtml(task.category)}</p>
    <h2>${escapeHtml(task.title)}</h2>
    <p>${escapeHtml(task.description)}</p>
    <p>Due Date: ${escapeHtml(task.dueDate)}</p>
    <p>Priority: ${escapeHtml(task.priority)}</p>
    <p>Assigned To: ${escapeHtml(ASSIGNED_NAMES)}</p>
    <p>Subtasks: ${escapeHtml(SUBTASK_NAMES)}</p>
    
    <button onclick="closeTaskDialog()">X</button>
    <button onclick="deleteTask('${task.firebaseKey}')">Delete</button>
    <button onclick="editTask('${task.firebaseKey}')">Edit</button>
  `;
}