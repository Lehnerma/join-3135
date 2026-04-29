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

function getNoTasksTemplate(status) {
  return `
    <li class="board-task no-task">No tasks ${status}</li>
  `;
}

function getTaskCardTemplet(title, description) {
  return `
<li class="task" draggable="true">
  <article class="task--card">
    <header>
      <span class="task--category-label user-story">User Story</span>
    </header>
    <section class="task--content" aria-label="task content">
      <div class="task--title-wrapper">
        <h3 class="task--title">${title}}</h3>
        <p class="task--description">${description}</p>
      </div>
      
      <div class="subtask--progress">
        <progress class="subtask--progressbar" max="2" value="1"></progress>
        <span class="subtask--description">1/2 Subtasks</span>
      </div>
    </section>
    <footer class="task--footer">
      <ul class="task--assignees" aria-label="Zugewiesene Personen">
        
      </ul>
      <img src="../assets/img/icons/prio/low.svg" alt="low priority" class="prio-icon">
    </footer>
  </article>
</li>`;
}

function getTaskAssignToTemplet(fullName, initials) {
  return `
<li class="assignee">
  <abbr class="assignee--initials" title="${fullName}">${initials}</abbr>
</li>`;
}
