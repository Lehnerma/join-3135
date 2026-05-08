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
    <li class="board-task no-task">No tasks ${status}</li>
  `;
}

function getTaskCardTemplet(title, description, category, id, priority) {
  return `
<li class="task" onclick="openTaskDetailDialog(${id})" draggable="true" ondragstart="taskDragStart(event, ${id})" data-id=${id}>
  <article class="task--card">
    <header>
      <span class="task--category-label ${toClassName(category)}">${category}</span>
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
<li class="assignee">
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

      <div class="detail-task--description">${task.description}</div>

      <section class="detail-task--infos f-col">
        <div class="detail-task--date f-row">
          <h4>Due date:</h4>
          <p>${task.dueDate}</p>
        </div>

        <div class="detail-task--prio f-row">
          <h4 class="detail-task--subheading">Priority:</h4>
          <div class="detail-task--prio-content f-row">
            <p>${task.priority}</p>
            <img src="../assets/img/icons/prio/${task.priority}.svg" alt="${task.priority} priority" class="prio-icon">
          </div>
        </div>
      </section>

      <section class="detail-task--assignees">
        <h4>Assigned to:</h4>
        <ul id="detail_task_assignees" class="detail-task--assignees-list" aria-label="assigned contacts">
        </ul>
      </section>

      <section class="detail-task--subtasks">
        <h4>Subtasks</h4>
        <ul id="detail_subtask_list" class="detail-task--subtasks-list" aria-label="list of subtasks">

        </ul>
      </section>
    </article>

    <footer class="detail-task--footer">
      <button type="button" class="btn--delete-task">
        <img src="../assets/img/icons/subtask/bin.svg" alt="delete" />
      </button>
      <button type="button" class="btn--edit-task">
        <img src="../assets/img/icons/subtask/edit.svg" alt="edit" />
      </button>
    </footer>`;
}

function getDetailSubtaskTemplate(title, checked = false) {
  return `
    <li class="detail-task--subtask-item">
      <input type="checkbox" class="detail-task--subtask-checkbox"${checked ? " checked" : ""} />
      <p class="detail-task--subtask-text">${title}</p>
    </li>`;
}

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
