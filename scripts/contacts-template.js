function renderAlphabetTableTpl(alphabet) {
  return /*html*/ `
        <div id="${alphabet}">
        <p class="first-letter">${alphabet}</p>
        <div class="letter-divider"></div> 
        </div>`;
}


function renderSingleUserHtmlTpl(user, i, initials, color) {
  return /*html*/`
    <div id="${i}" class="user-Selection desktop-only" onclick="getUserDetails(${i})">
        <div class="initials" style="background-color: ${color}">
            ${initials}
        </div>
        <div class="contact-info-text">
            <div class="name">${user.name}</div>
            <p class="email">${user.email}</p>
        </div>
    </div>

    // <div id="${i}" class="user-Selection mobile-only " onclick="getMobileDetails(${i})">
    //     <div class="initials" style="background-color: ${color}">
    //         ${initials}
    //     </div>
    //     <div class="contact-info-text">
    //         <div class="name">${user.name}</div>
    //         <p class="email">${user.email}</p>
    //     </div>
    // </div>`;
}


function renderHtmlContactDialogTpl() {
  return /*html*/ `
  <div class="dialog-container" onclick="closeDialogOutsite(event)">

      <aside class="aside-content">
     
        <section class="aside-text-wrapper">
           <img class="aside-logo" src="../assets/img/icons/contacts/Capa_1.svg" alt="logo-join" />
           <div class="aside-headline">
          <h2 class="aside-h2">Add contact</h2>
          <p class="aside-p">Tasks are better with a team!</p>
          <div class="blue-line-horizontal"></div>
          </div>
        </section>
      </aside> 

      <header class="dialog-header">
        <button type="button" id="close-btn" class="close-btn-overlay" onclick="closeContactDialog()"><svg class="close-x"><use href="../assets/img/icons/contacts/close-white.svg"></use></svg></button>
      </header>

      <main class="dialog-main">
        
        <div class="person-Logo-container">
          <img class="person-logo" src="../assets/img/icons/contacts/person.svg" alt="Profile" class="large-profile-icon">
        </div>

        <form id="formRef">
          <section class="dialog-input-container">
            <div class="dialog-input-section">
              <input class="dialog-input" id="createName" type="text" name="name" placeholder="Name" required />
              <img src="../assets/img/icons/input/person.svg" alt="icon" class="dialog-input-icon" />
            </div>

            <div class="dialog-input-section">
              <input class="dialog-input" id="createEmail" type="email" name="email" placeholder="Email" required />
              <img src="../assets/img/icons/input/mail.svg" alt="icon" class="dialog-input-icon" />
            </div>

            <div class="dialog-input-section">
              <input class="dialog-input" id="createPhone" type="tel" name="phone" placeholder="Phone" pattern="[0-9+ ]*"
                title="Bitte nur Zahlen, Leerzeichen oder ein + eingeben" required />
              <img src="../assets/img/icons/input/phone.svg" alt="icon" class="dialog-input-icon" />
            </div>
          </section>
          <section class="dialog-login-buttons">
            <button id="cancelButton" type="button" class="btn btn--secondary btn--login btn-cancel" 
              onclick="closeContactDialog()">Cancel<svg class="cancel-img-x"><use href="../assets/img/icons/contacts/close-white.svg"></use></svg></button>
            <button type="button" class="btn btn--primary btn--login btn-create " onclick="createContact()">Create contact<img class="img-check"
                src="../assets/img/icons/contacts/check.svg" alt="create check"></button>
          </section>
        </form>
        
      </main>
    </div>`;
}

function renderHtmlEditContactDialogTpl(editUserIndex, initials, color) {
 
  return /*html*/ `
    <div class="dialog-container" onclick="closeDialogOutsite(event)">
      <aside class="aside-content">
      <section class="aside-text-wrapper">
           <img class="aside-logo" src="../assets/img/icons/contacts/Capa_1.svg" alt="logo-join" />
           <div class="aside-headline">
          <h2 class="aside-h2-edit">Edit contact</h2>
          <div class="blue-line-horizontal"></div>
          </div>
        </section>
      </aside>

       <header class="dialog-header">
        <button type="button" id="close-btn" class="close-btn-overlay" onclick="closeContactDialog()"><svg class="close-x"><use href="../assets/img/icons/contacts/close-white.svg"></use></svg></button>
      </header>


      <main class="dialog-main">
        
          <div class="person-Logo-container">
           <div class="initials-large-dialog" style="background-color: ${color}">${initials}</div>
           </div>

          <form>
            <section class="dialog-input-container">
              <div class="dialog-input-section">
                <input class="dialog-input" id="editName" type="text" name="name" placeholder="Name" required />
                <img src="../assets/img/icons/input/person.svg" alt="icon" class="dialog-input-icon" />
              </div>
              <div class="dialog-input-section">
                <input class="dialog-input" id="editEmail" type="email" name="email" placeholder="Email" required />
                <img src="../assets/img/icons/input/mail.svg" alt="icon" class="dialog-input-icon" />
              </div>
              <div class="dialog-input-section">
                <input class="dialog-input" id="editPhone" type="tel" name="phone" placeholder="Phone" required />
                <img src="../assets/img/icons/input/phone.svg" alt="icon" class="dialog-input-icon" />
              </div>
            </section>

            <section class="dialog-login-buttons">
              <button  type="button" class="btn btn--secondary btn--login btn-delete" onclick="deleteContact(${editUserIndex})">
                Delete
              </button>
              <button type="submit" class="btn btn--primary btn--login btn-save" onclick="saveNewContactData(${editUserIndex})">
                Save
                <img class="img-check" src="../assets/img/icons/contacts/check.svg" alt="create check">
              </button>
            </section>
          </form>
        </div>
      </main>
    </div>`;
}


function renderShowDetailsTpl(user, i, initials, color) {
  return /*html*/ `
    <div class="contact-details-box" onclick="closeDialogOutsite(event)">
    
      <header class="header-contect-details">
        <div class="initials-large" style="background-color: ${color}">
          ${initials}
        </div>

        <div class="name-and-buttons">
          <h1 class="h1-contact-details">${user.name}</h1>
          <div class="edit-delete-container">
            <button type="button" class="edit-delete-button" onclick="openEditContactDialog()">
              <svg class="edit-svg"><use href="../assets/img/icons/contacts/edit-contacts.svg"></use></svg>
              Edit
            </button>
            <button type="button" class="edit-delete-button" onclick="deleteContact(${i})">
              <svg class="delete-svg"><use href="../assets/img/icons/contacts/trash-contact.svg"></use></svg>
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