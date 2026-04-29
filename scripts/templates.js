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
        <h3 class="task--title">${title}</h3>
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
  const color = contactColors[initials[0].toUpperCase()] || '#888';
  return `
<li class="assignee">
  <abbr class="assignee--initials" style="--assignee-color: ${color}" title="${fullName}">${initials}</abbr>
</li>`;
}

const contactColors = {
  A: 'rgba(147, 39, 255, 1)',
  B: 'rgba(110, 82, 255, 1)',
  C: 'rgba(252, 113, 255, 1)',
  D: 'rgba(255, 187, 43, 1)',
  E: 'rgba(31, 215, 193, 1)',
  F: 'rgba(70, 47, 138, 1)',
  G: 'rgba(255, 70, 70, 1)',
  H: 'rgba(0, 190, 232, 1)',
  I: 'rgba(42, 61, 89, 1)',
  J: 'rgba(255, 94, 179, 1)',
  K: 'rgba(255, 116, 94, 1)',
  L: 'rgba(255, 163, 94, 1)',
  M: 'rgba(255, 199, 1, 1)',
  N: 'rgba(0, 56, 255, 1)',
  O: 'rgba(195, 255, 43, 1)',
  P: 'rgba(255, 230, 43, 1)',
  Q: 'rgba(255, 70, 150, 1)',
  R: 'rgba(0, 150, 130, 1)',
  S: 'rgba(255, 120, 0, 1)',
  T: 'rgba(0, 120, 255, 1)',
  U: 'rgba(180, 40, 40, 1)',
  V: 'rgba(100, 200, 0, 1)',
  W: 'rgba(150, 0, 255, 1)',
  X: 'rgba(0, 255, 200, 1)',
  Y: 'rgba(200, 150, 0, 1)',
  Z: 'rgba(120, 120, 120, 1)'
};