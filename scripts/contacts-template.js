function renderHtmlContactDialogTpl() {
  return /*html*/ `
  <div class="dialog-container" onclick="closeDialogOutsite(event)">

      <aside class="aside-content">
        <img class="aside-logo" src="../assets/img/logo-join.svg" alt="logo-join" />
        <section class="aside-text-wrapper">
          <h2 class="aside-h2">Add contact</h2>
          <p class="aside-p">Tasks are better with a team!</p>
          <div class="blue-line-horizontal"></div>
        </section>
      </aside> 

      <header class="dialog-header">
        <button type="button" id="close-btn" class="close-btn-overlay" onclick="closeContactDialog()"><svg class="img-x"><use href="../assets/img/icons/general/close-white.svg"></use></svg></button>
      </header>

      <main class="dialog-main">

        <div class="person-Logo-container">
          <img class="person-logo" src="../assets/img/icons/input/person.svg" alt="Profile" class="large-profile-icon">
        </div>

        <form id="formRef">
          <section class="dialog-input-container">
            <div class="dialog-input-section">
              <input class="dialog-input" id="name" type="text" name="name" placeholder="Name" required />
              <img src="../assets/img/icons/input/person.svg" alt="icon" class="dialog-input-icon" />
            </div>

            <div class="dialog-input-section">
              <input class="dialog-input" id="email" type="email" name="email" placeholder="Email" required />
              <img src="../assets/img/icons/input/mail.svg" alt="icon" class="dialog-input-icon" />
            </div>

            <div class="dialog-input-section">
              <input class="dialog-input" id="phone" type="tel" name="phone" placeholder="Phone" pattern="[0-9+ ]*"
                title="Bitte nur Zahlen, Leerzeichen oder ein + eingeben" required />
              <img src="../assets/img/icons/input/phone.svg" alt="icon" class="dialog-input-icon" />
            </div>
          </section>
          <section class="dialog-login-buttons">
            <button type="button" class="btn btn--secondary btn--login btn-cancel-text "
              onclick="closeContactDialog()">Cancel<svg class="img-x"><use href="../assets/img/icons/general/close-white.svg"></use></svg></button>
            <button type="submit" class="btn btn--primary btn--login" onclick="createContact">Create contact<img class="img-check"
                src="../assets/img/icons/general/check.svg" alt="create check"></button>
          </section>
        </form>
      </main>
    </div>`;
}


function renderHtmlEditContactDialogTpl() {
  return /*html*/` <div class="dialog-container" onclick="closeDialogOutsite(event)">

      <aside class="aside-content">
        <img class="aside-logo" src="../assets/img/logo-join.svg" alt="logo-join" />
        <section class="aside-text-wrapper">
          <h2 class="aside-h2">Edit contact</h2>
         
          <div class="blue-line-horizontal"></div>
        </section>
      </aside>

      <header class="dialog-header">
        <button type="button" id="close-btn" class="close-btn-overlay" onclick="closeContactDialog()"></button>
      </header>

      <main class="dialog-main">

        <div class="person-Logo-container">
          <img class="person-logo" src="../assets/img/icons/input/person.svg" alt="Profile" class="large-profile-icon">
        </div>

        <form>
          <section class="dialog-input-container">
            <div class="dialog-input-section">
              <input class="dialog-input" type="text" name="name" placeholder="Name" required />
              <img src="../assets/img/icons/input/person.svg" alt="icon" class="dialog-input-icon" />
            </div>

            <div class="dialog-input-section">
              <input class="dialog-input" id="email" type="email" name="email" placeholder="Email" required />
              <img src="../assets/img/icons/input/mail.svg" alt="icon" class="dialog-input-icon" />
            </div>

            <div class="dialog-input-section">
              <input class="dialog-input" type="tel" name="phone" placeholder="Phone" required />
              <img src="../assets/img/icons/input/phone.svg" alt="icon" class="dialog-input-icon" />
            </div>
          </section>
          <section class="dialog-login-buttons">
            <button type="button" class="btn btn--secondary btn--login"
              onclick="document.getElementById('addNewContact').close()" onclick="deleteContact()">Delete</button>
            <button type="submit" class="btn btn--primary btn--login" onclick="saveContact()">Save<img class="img-check"
                src="../assets/img/icons/general/check.svg" alt="create check"></button>
          </section>
        </form>
        <script></script>
      </main>
    </div>`;

}

