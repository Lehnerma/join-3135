/**
 * Creates the HTML template for a letter container in the contact list.
 * @param {string} alphabet - The letter for the category (e.g., "A").
 * @returns {string} The HTML template as a string.
 */
function renderAlphabetTableTpl(alphabet) {
  return /*html*/ `
        <div id="${alphabet}">
        <p class="first-letter">${alphabet}</p>
        <div class="letter-divider"></div> 
        </div>`;
}


/**
 * Creates the HTML template for a single user in the contact list.
 * @param {Object} user - The user object containing the contact details.
 * @param {number} i - The user's unique index.
 * @param {string} initials - The user's initials.
 * @param {string} color - Background color for the profile circle.
 * @returns {string} The HTML template as a string.
 */
function renderSingleUserHtmlTpl(user, i, initials, color) {
  return /*html*/`
    <div id="${i}" class="user-Selection" onclick="getUserDetails(${i})">
      <div class="initials" style="background-color: ${color}">
        ${initials}
      </div>
      <div class="contact-info-text">
        <div class="name">${user.name}</div>
        <p class="email">${user.email}</p>
      </div>
    </div>`;
}


/**
 * Creates the HTML template for the dialog box for creating a new contact.
 * @returns {string} The HTML template for the contact dialog.
 */
function renderHtmlContactDialogTpl() {
  return /*html*/ `
  <div class="dialog-container" onclick="closeDialogOutsite(event)">
      <aside class="aside-content">
             <section class="aside-text-wrapper">
           <img class="aside-logo" src="../assets/img/icons/contacts/Capa.svg" alt="logo-join" />
           <div class="aside-headline">
          <h2 class="aside-h2">Add contact</h2>
          <p class="aside-p">Tasks are better with a team!</p>
          <div class="blue-line-horizontal"></div>
          </div>
        </section>
      </aside> 
      <header class="dialog-header">
        <button type="button" id="close-btn" class="close-btn-overlay" onclick="closeContactDialog()"></button>
      </header>
      <main class="dialog-main">
          <div class="person-logo-ellipse">
               <img class="person-logo" src="../assets/img/icons/contacts/person.svg" alt="Profile" class="large-profile-icon">
           </div>
        <form id="formRef">
          <section class="dialog-input-container">
            <div class="dialog-input-section">
              <input class="dialog-input" id="createName" type="text" name="name" placeholder="Name" required />
              <img src="../assets/img/icons/input/person.svg" alt="icon" class="dialog-input-icon" />
            </div>
            <div class="dialog-input-section">
              <input class="dialog-input" id="createEmail" type="email" name="email" placeholder="Email" pattern="[a-z0-9._%+-]+@[a-z0-9.-]+\.[a-z]{2,4}$" title="Bitte geben Sie eine gültige E-Mail-Adresse ein (z. B. name@beispiel.de)." required />
              <img src="../assets/img/icons/input/mail.svg" alt="icon" class="dialog-input-icon" />
            </div>
            <div class="dialog-input-section">
              <input class="dialog-input" id="createPhone" type="tel" name="phone" placeholder="Phone" pattern="[0-9+ ]*"
                title="Bitte nur Zahlen, Leerzeichen oder ein + eingeben" required />
              <img src="../assets/img/icons/input/phone.svg" alt="icon" class="dialog-input-icon" />
            </div>
          </section>
          <section class="dialog-login-buttons">
            <button id="cancelButton" type="reset" class="btn btn--secondary btn--login btn-cancel" 
              onclick="closeContactDialog()">Cancel</button>
            <button type="button" class="btn btn--primary btn--login " onclick="createContact()">Create contact</button>
          </section>
        </form>
      </main>
    </div>`;
}


/**
 * Creates the HTML template for the dialog box used to edit a contact.
 * @param {number} editUserIndex - The index of the user to be edited.
 * @param {string} initials - The user's initials.
 * @param {string} color - Color for the profile circle.
 * @returns {string} The HTML dialog template for editing the contact.
 */
function renderHtmlEditContactDialogTpl(editUserIndex, initials, color) {
  return /*html*/ `
   <div class="dialog-container" onclick="closeDialogOutsite(event)">

  <aside class="aside-content">
    <section class="aside-text-wrapper">
      <img class="aside-logo" src="../assets/img/icons/contacts/Capa.svg" alt="logo-join" />
      <div class="aside-headline">
        <h2 class="aside-h2-edit">Edit contact</h2>
        <div class="blue-line-horizontal"></div>
      </div>
    </section>
  </aside>

  <header class="dialog-header">
    <button type="button" id="close-btn" class="close-btn-overlay" onclick="closeContactDialog()"></button>
  </header>

  <main class="dialog-main">

    <div class="person-logo-ellipse">
      <div class="initials-large-edit-dialog" style="background-color: ${color}">${initials}</div>
    </div>

    <form>

      <section class="dialog-input-container">
        <div class="dialog-input-section">
          <input class="dialog-input" id="editName" type="text" name="name" placeholder="Name" required />
          <img src="../assets/img/icons/input/person.svg" alt="icon" class="dialog-input-icon" />
        </div>
        <div class="dialog-input-section">
          <input class="dialog-input" id="editEmail" type="email" name="email" placeholder="Email" pattern="[a-z0-9._%+-]+@[a-z0-9.-]+\.[a-z]{2,4}$" title="Bitte geben Sie eine gültige E-Mail-Adresse ein (z. B. name@beispiel.de)." required />
          <img src="../assets/img/icons/input/mail.svg" alt="icon" class="dialog-input-icon" />
        </div>
        <div class="dialog-input-section">
          <input class="dialog-input" id="editPhone" type="tel" name="phone" placeholder="Phone" required />
          <img src="../assets/img/icons/input/phone.svg" alt="icon" class="dialog-input-icon" />
        </div>
      </section>

      <section class="dialog-login-buttons">
        <button type="button" class="btn btn--secondary-delete btn--login"
          onclick="deleteContact(${editUserIndex})">
          Delete
        </button>
        <button type="submit" class="btn btn--primary btn--login"
          onclick="saveNewContactData(${editUserIndex})">
          Save
         </button>
      </section>
    </form>
  </main>
</div>`;
}


/**
 * Creates the HTML template for the detail view of a selected contact.
 * @param {Object} user - The user object containing name, email, and phone number.
 * @param {number} i - The user's index.
 * @param {string} initials - The user's initials.
 * @param {string} color - Color for the profile circle.
 * @returns {string} The HTML template for the contact details.
 */
function renderShowDetailsTpl(user, i, initials, color) {
  return /*html*/ `
    <div class="contact-details-box" >
    
      <header class="header-contect-details" >
        <div class="initials-large" style="background-color: ${color}">
          ${initials}
        </div>

        <div class="name-and-buttons"   >
          <h1 class="h1-contact-details">${user.name}</h1>
          <div class="edit-delete-container">
            <button type="button" class="edit-delete-button" onclick="openEditContactDialog()">
              <svg class="edit-svg"><use href="../assets/img/icons/contacts/edit.svg"></use></svg>
              Edit
            </button>
            <button type="button" class="edit-delete-button" onclick="deleteContact(${i})">
              <svg class="delete-svg"><use href="../assets/img/icons/contacts/delete.svg"></use></svg>
              Delete
            </button>
          </div>
        </div>
      </header>

      <main class="main-contact-details">
        <div class="contact-information">Contact Information</div>
        <ul class="email-and-phone">
          <li class="contact-email">Email</li>
          <li><a href="mailto:${user.email}" class="email">${user.email}</a></li>
          <li class="contact-phone">Phone</li>
          <li>${user.phone}</li>
        </ul>
      </main>
    </div>`;
}