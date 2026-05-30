checkAuth();

/**
 * Initializes general utility configurations by rendering user initials 
 * and setting up the responsive layout for external or logged-in pages.
 */
function initUtilitys() {
  renderHeadInitals();
  showExternalUtilityPages();
  setBodyAuthClass();
  initDateIconVisibility();
}

/**
 * Detects Firefox and hides the custom calendar icon button,
 * since Firefox cannot suppress its native date picker icon via CSS.
 * In all other browsers the custom icon button remains visible.
 */
function initDateIconVisibility() {
  if (navigator.userAgent.includes("Firefox")) {
    document.body.classList.add("is-firefox");
  }
}

/**
 * Checks if the current visitor is authorized to view the page.
 * Redirects unauthorized users to the landing page, while allowing access 
 * for valid users, guests, and public legal/privacy pages.
 * @returns {Promise<void>}
 */
async function checkAuth() {
  const ID = sessionStorage.getItem("user_id");
  const BOOL = await checkUserId(ID);
  if (BOOL) {
    return;
  } else if (ID === "guest") {
    return;
  } else if (window.location.pathname.includes("privacyPolicy.html") || window.location.pathname.includes("legalNotice.html")) {
    return;
  } else {
    window.location.href = "../index.html";
  }
}

/**
 * Fetches all registered users from the backend and checks if the provided ID exists.
 * @param {string|null} id - The user ID to look for in the database.
 * @returns {Promise<boolean>} Resolves to true if the ID exists, otherwise false.
 */
async function checkUserId(id) {
  try {
    const RESPONS = await fetch("https://join-3135-default-rtdb.europe-west1.firebasedatabase.app/users.json");
    if (!RESPONS.ok) {
      throw new Error(RESPONS.status);
    }
    const RESULT = await RESPONS.json();
    const ALLIDS = Object.values(RESULT).map((items) => items.id);
    return Object.values(RESULT).some((item) => item.id === id);
  } catch (er) {
    console.error(er);
  }
}

/**
 * Converts a display name to a CSS-compatible class name.
 * Example: 'Technical Task' => 'technical-task'
 * @param {string} name - The raw string name.
 * @returns {string} The formatted, lowercased string with hyphens.
 */
function toClassName(name) {
  return name.trim().toLowerCase().replace(" ", "-");
}

/**
 * Capitalizes the first letter of a string.
 * Example: 'hello' => 'Hello'
 * @param {string} str - The target string.
 * @returns {string} String with the first letter capitalized.
 */
function capitalizeFirstLetter(str) {
  return str.charAt(0).toUpperCase() + str.slice(1);
}

/**
 * Extracts the first letters of the user's first and last name from session storage
 * and renders them as uppercase initials inside the header profile button.
 */
function renderHeadInitals() {
  const ID = sessionStorage.getItem("user_id");
  if (ID == null) {
    return;
  } else {
    const USER_NAME = sessionStorage.getItem("activeUserName");
    const USER_INITIALS = document.getElementById("user_menu_button");
    if (!USER_INITIALS) return;
    if (USER_NAME === "Guest") {
      USER_INITIALS.innerText = "G";
      return;
    }
    const SPLITTED_NAME = USER_NAME.trim().split(/\s+/);
    let INITIALS = SPLITTED_NAME[0][0];
    if (SPLITTED_NAME.length > 1) {
      INITIALS += SPLITTED_NAME[SPLITTED_NAME.length - 1][0];
    }
    INITIALS = INITIALS.toUpperCase();
    USER_INITIALS.innerText = INITIALS;
  }
}


/**
 * Funktion 1: Kümmert sich NUR um die Sichtbarkeit der Buttons/Elemente
 * Dieser Name bleibt gleich, wie von dir gewünscht.
 */
function showExternalUtilityPages() {
  const ID = sessionStorage.getItem("user_id");
  const view_user = document.getElementById("view-user");
  const view_external = document.getElementById("view-external");
  const user_menu_button = document.getElementById("user_menu_button");

  if (ID !== null) {
    if (view_user) view_user.classList.remove("d-none");
    if (view_external) view_external.classList.add("d-none");
    if (user_menu_button) user_menu_button.classList.remove("d-none");
  } else {
    if (view_user) view_user.classList.add("d-none");
    if (view_external) view_external.classList.remove("d-none");
    if (user_menu_button) user_menu_button.classList.add("d-none");
  }
}

/**
 * Funktion 2: Kümmert sich NUR um die Klassen im Body-Tag
 * Neu benannt, um Konflikte zu vermeiden.
 */
function setBodyAuthClass() {
  const ID = sessionStorage.getItem("user_id");
  const BODY = document.body;

  if (ID !== null) {
    BODY.classList.add("user-logged-in");
    BODY.classList.remove("user-not-logged-in");
  } else {
    BODY.classList.add("user-not-logged-in");
    BODY.classList.remove("user-logged-in");
  }
}

/**
 * Opens the profile options menu dialog overlay.
 */
function openUserMenu() {
  const DIALOG = document.getElementById("user-menu-dialog");
  DIALOG.showModal();
}

/**
 * Closes the profile options menu dialog overlay.
 */
function closeDialog() {
  const DIALOG = document.getElementById("user-menu-dialog");
  DIALOG.close();
}

/**
 * Prevents click events from bubbling up, stopping a dialog container 
 * from closing automatically when clicking inside its content zone.
 * @param {Event} event - The triggered interaction or click event.
 */
function preventCloseDialogOnDialog(event) {
  event.stopPropagation();
}

/**
 * Navigates the browser window back one step in the session history.
 */
function goBack() {
  window.history.back();
}

/**
 * Logs out the current user by clearing the session storage 
 * and redirecting the browser to the index landing page.
 */
function logOut() {
  sessionStorage.clear();
  window.location.href = "../index.html";
}