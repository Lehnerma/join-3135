/**
 * The template for the subtasks
 * @returns the html code for creat a subtask
 */
function getSubtaskTemplate(title, index){
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
    </div>`
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
    <li class="custom-dropdown__item${checked ? ' selected' : ''}" data-value="${id}" data-name="${name}">
      <span class="contact-badge" style="background-color: ${color}">${initials}</span>
      <span class="custom-dropdown__name">${name}</span>
      <input type="checkbox" class="custom-dropdown__checkbox"${checked ? ' checked' : ''} />
    </li>`;
}

