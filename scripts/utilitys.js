checkAuth();

function initUtilitys() {
  renderHeadInitals();
  showExternalUtilityPages();
}
/**
 * Check if the User can enter the side or not
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
  }
  else {
    window.location.href = "../index.html";
  }
}

/**
 *Function to check if the user id is available in the backend
 * @param {string} id
 * @returns Bool if the id is true ore false
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
 * @param {string} name
 * @returns {string}
 */
function toClassName(name) {
  return name.trim().toLowerCase().replace(" ", "-");
}

/**
 * Capitalizes the first letter of a string.
 * Example: 'hello' => 'Hello'
 * @param {string} str
 * @returns {string}
 */
function capitalizeFirstLetter(str) {
  return str.charAt(0).toUpperCase() + str.slice(1);
}

function renderHeadInitals() {
  const ID = sessionStorage.getItem("user_id");
  if (ID == null) {
    return;
  } else {
  const USER_NAME = sessionStorage.getItem("activeUserName");
  const USER_INITIALS = document.getElementById("user_menu_button");
  const SPLITTED_NAME = USER_NAME.split(" ");
  let INITIALS = SPLITTED_NAME[0][0];
  if (SPLITTED_NAME.length > 1) {
    INITIALS += SPLITTED_NAME[SPLITTED_NAME.length - 1][0];
  }
  INITIALS = INITIALS.toUpperCase();
  USER_INITIALS.innerText = INITIALS;
  if (USER_NAME === "Guest") {
    USER_INITIALS.innerText = "G";
  }
}
}

function showExternalUtilityPages() {
  const ID = sessionStorage.getItem("user_id");
  console.log(ID);
  let VIEW_USER = document.getElementById("view-user");
  let VIEW_EXTERNAL = document.getElementById("view-external");
  let USER_MENU_BUTTON = document.getElementById("user_menu_button");
  if (ID !== null) {
    VIEW_USER.classList.remove("d-none");
    VIEW_EXTERNAL.classList.add("d-none");
    USER_MENU_BUTTON.classList.remove("d-none");
  } else {
    VIEW_USER.classList.add("d-none");
    VIEW_EXTERNAL.classList.remove("d-none");
    USER_MENU_BUTTON.classList.add("d-none");
  }
}

function showExternalUtilityPages() {
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