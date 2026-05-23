let show_signup = false;
let users = [];


/**
 * Builds the Firebase REST API URL for a specific user.
 * @param {string} [id=""] - Optional user id. Omit to target the entire users collection.
 * @returns {string} The full Firebase URL.
 */
const USERS_URL = (id = "") => "https://join-3135-default-rtdb.europe-west1.firebasedatabase.app/users/" + id + ".json";

/**
 * Initialises the login page: attaches all button listeners and starts the intro animations.
 */
function init() {
  btnInit();
  triggerAnimations();
}


/**
 * Attaches all event listeners to the login and signup buttons and forms.
 */
function btnInit() {
  const SIGNUP = document.getElementById("signup_btn");
  const SIGNUP_BACK = document.getElementById("signup_back");
  const SIGNUP_PHONE = document.getElementById("signup_phone_btn");
  const FORM_LOGIN = document.getElementById("login");
  const FORM_SIGNUP = document.getElementById("signup");
  const GUEST_LOGIN = document.getElementById("guest_login");
  SIGNUP_BACK.addEventListener("click", (event) => toggleForms(event));
  SIGNUP.addEventListener("click", (event) => toggleForms(event));
  SIGNUP_PHONE.addEventListener("click", (event) => toggleForms(event));
  GUEST_LOGIN.addEventListener("click", guestLogin);
  FORM_LOGIN.addEventListener("submit", (event) => loginUser(event));
  FORM_SIGNUP.addEventListener("submit", (event) => creatUser(event));
}


/**
 * Triggers intro animations for the logo, form container, nav, and footer.
 * On mobile (≤ 600 px) an additional mobile-specific animation class is added.
 */
function triggerAnimations() {
  const JOIN_LOGO = document.querySelector(".join-logo");
  const FORM_CONTAINER = document.querySelector(".form--container");
  const NAV_LOGIN = document.querySelector(".nav-login");
  const FOOTER_LOGIN = document.querySelector(".footer-login");
  JOIN_LOGO.classList.add("logo-animation");
  FORM_CONTAINER.classList.add("fade-in");
  if (window.innerWidth <= 600) {
    FORM_CONTAINER.classList.add("mobile-fade-in");
  }
  NAV_LOGIN.classList.add("fade-in");
  FOOTER_LOGIN.classList.add("fade-in");
}


/**
 * Removes the fade-in class from a container so it stays visible after the animation.
 * @param {HTMLElement} container - The element to un-fade.
 */
function removeFade(container) {
  container.classList.remove("fade-in");
  container.style.opacity = "1";
}


/**
 * Switches between the login and signup forms.
 * @param {Event} event - The click event.
 */
function toggleForms(event) {
  if (event && typeof event.preventDefault === 'function') {
    event.preventDefault();
  };
  clearAndResetForms();
  show_signup = !show_signup;
  updateToggleUI();
}


/**
 * Shows or hides the login and signup forms and updates related nav elements.
 */
function updateToggleUI() {
  const LOGIN_FORM = document.getElementById("login");
  const SIGNUP_FORM = document.getElementById("signup");
  const NAV_LOGIN = document.getElementById("nav_login");
  const NAV_PHONE = document.getElementById("phone_signup");
  LOGIN_FORM.classList[show_signup ? "add" : "remove"]("dnone");
  SIGNUP_FORM.classList[show_signup ? "remove" : "add"]("dnone");
  if (NAV_LOGIN) {
    NAV_LOGIN.classList[show_signup ? "add" : "remove"]("dnone");
  } if (NAV_PHONE) {
    NAV_PHONE.classList[show_signup ? "add" : "remove"]("dnone");
  }
  removeFade(LOGIN_FORM);
  if (NAV_LOGIN) removeFade(NAV_LOGIN);
  setRequired(show_signup);
}


/**
 * Toggles the required attribute on all signup inputs to avoid browser validation
 * errors on the hidden form.
 * @param {boolean} condition - true to make inputs required, false to remove it.
 */
function setRequired(condition) {
  const INPUTS = document.querySelectorAll(".input_signup");
  if (condition) {
    INPUTS.forEach((e) => (e.required = true));
  } else {
    INPUTS.forEach((e) => (e.required = false));
  }
}


/**
 * Redirects the guest user to the summary page and stores guest session data.
 */
function guestLogin() {
  window.location.href = "./html/summary.html";
  sessionStorage.setItem("user_id", "guest");
  sessionStorage.setItem("activeUserName", "Guest");
  sessionStorage.setItem("justLoggedIn", "true");
}


/**
 * Gathers input data from the signup form and creates a user object.
 * @param {HTMLFormElement} formElement - The signup form.
 * @returns {Object} The fresh user object with a unique ID.
 */
function buildUserData(formElement) {
  const FORM = new FormData(formElement);
  const NEW_USER = Object.fromEntries(FORM.entries());
  NEW_USER.id = generateId();
  return NEW_USER;
}


/**
 * Resets the signup form and reactivates the submit button.
 * @param {HTMLFormElement} form - The signup form.
 * @param {HTMLElement|null} btn - The submit button.
 */
function finalizeSignup(form, btn) {
  toggleForms();
  form.reset();
  if (btn) btn.disabled = false;
}


/**
 * Handles the signup form submission and prevents double submits.
 * @param {Event} ev - The form submit event.
 */
async function creatUser(ev) {
  ev.preventDefault();
  if (!verifyPassword()) return;
  const btn = ev.target.querySelector('button[type="submit"]');
  if (btn) btn.disabled = true;
  try {
    const newUser = buildUserData(ev.target);
    await pushUser(newUser);
    successMessage();
    setTimeout(() => finalizeSignup(ev.target, btn), 1200);
  } catch (error) {
    console.error("Signup failed:", error);
    if (btn) btn.disabled = false;
  }
}


/**
 * Validates the user credentials against the loaded users list.
 * @param {FormData} formData - The login form data.
 * @returns {Object|undefined} The matched user object or undefined.
 */
function findActiveUser(formData) {
  return users.find((u) => u.email === formData.get("email"));
}


/**
 * Handles user login, checks credentials, and blocks double clicks.
 * @param {Event} ev - The submit event.
 */
async function loginUser(ev) {
  ev.preventDefault();
  const btn = ev.target.querySelector('button[type="submit"]');
  if (btn) btn.disabled = true;
  try {
    const FORM = new FormData(ev.target);
    await getUsers();
    const ACTIV_USER = findActiveUser(FORM);
    if (!ACTIV_USER || ACTIV_USER.password !== FORM.get("password")) {
      showFailEntriesLogin();
      if (btn) btn.disabled = false;
      return;
    }
    saveSession(ACTIV_USER);
    window.location.href = "./html/summary.html";
  } catch (error) {
    console.error("Login process failed:", error);
    if (btn) btn.disabled = false;
  }
}


/**
 * Verifies that the password and confirm password fields match.
 * @returns {boolean} - true if passwords match, false otherwise
 */
function verifyPassword() {
  const PASSWORD = document.getElementById("pwInput");
  const CONFIRM_PASSWORD = document.getElementById("pwInputConfirm");
  return PASSWORD.value === CONFIRM_PASSWORD.value;
}


/**
 * Validates that both password input fields match and updates the UI accordingly.
 * Adds an error class if passwords don't match, removes it if they do.
 */
function confirmPassword() {
  const PASSWORD = document.getElementById("pwInput");
  const CONFIRM_PASSWORD = document.getElementById("pwInputConfirm");
  const CONFIRM_PASSWORD_CONTAINER = document.getElementById("pwConfirmSignup");
  CONFIRM_PASSWORD_CONTAINER.classList.remove("invalid-signup-pw");
  if (PASSWORD.value.length === 0) {
    return;
  } if (PASSWORD.value === CONFIRM_PASSWORD.value) {
    CONFIRM_PASSWORD_CONTAINER.classList.remove("invalid-signup-pw");
    CONFIRM_PASSWORD_CONTAINER.classList.add("success-signup-pw");
    return true;
  } if (CONFIRM_PASSWORD.value.length >= PASSWORD.value.length) {
    CONFIRM_PASSWORD_CONTAINER.classList.add("invalid-signup-pw");
    CONFIRM_PASSWORD_CONTAINER.classList.remove("success-signup-pw");
    return false;
  }
}


/**
 * Generates a short unique id from the current timestamp and a random value.
 * @returns {string} A 6-character alphanumeric id.
 */
function generateId() {
  return (Date.now().toString(36) + Math.random().toString(36)).substring(0, 6);
}


/**
 * Sends user data to the database.
 * @param {Object} user - The user object to save.
 */
async function pushUser(user) {
  try {
    const RESPONSE = await fetch(USERS_URL(user.id), {
      method: "PUT",
      body: JSON.stringify(user),
    });
    if (!RESPONSE.ok) {
      throw new Error(`Push the User to Firebase don't work see: ${RESPONSE.status}`);
    }
  } catch (er) {
    console.error(`the function pushUser() don't worke see: ${er}`);
  }
}


/**
 * Shows error styles if login fails.
 */
function showFailEntriesLogin() {
  const MAIL = document.getElementById("email_input_login");
  const PASSWORD_CONTAINER = document.getElementById("pw_container_login");
  const PASSWORD = document.getElementById("pwInputLogin");
  MAIL.classList.add("invalid-login");
  PASSWORD.classList.add("invalid-login");
  PASSWORD_CONTAINER.classList.add("invalid-login-pw");
  changeLockToEye('pwInputLogin', 'lockLogin');
}


/**
 * Fetches all users from Firebase and stores them in the module-level USERS array.
 * @returns {Promise<void>}
 */
async function getUsers() {
  const RESPONSE = await fetch(USERS_URL());
  const RESULT = await RESPONSE.json();
  users = Object.values(RESULT);
}


/**
 * Saves user info to session storage.
 * @param {Object} user - The active user.
 */
function saveSession(user) {
  sessionStorage.setItem("user_id", user.id);
  sessionStorage.setItem("activeUserName", user.name);
  sessionStorage.setItem("justLoggedIn", "true");
}


/**
 * Changes the icon from lock to eye when typing.
 * @param {string} pwInputID - ID of the password input.
 * @param {string} iconID - ID of the icon image.
 */
function changeLockToEye(pwInputID, iconID) {
  let input_pw = document.getElementById(pwInputID);
  let lock = document.getElementById(iconID);
  const LOCK_ICON = "../assets/img/icons/input/lock.svg";
  const EYE_OFF = "../assets/img/icons/input/visibility_off.svg";
  const EYE_ON = "../assets/img/icons/input/visibility.svg";
  if (input_pw.value.length === 0) {
    lock.src = LOCK_ICON;
  } else if (input_pw.type === "password") {
    lock.src = EYE_OFF;
  } else {
    lock.src = EYE_ON;
  }
}


/**
 * Toggles between showing and hiding the password text.
 * @param {string} inputID - ID of the input field.
 * @param {string} icon - ID of the icon image.
 */
function showPasswordInput(inputID, icon) {
  const EYE_ON = "../assets/img/icons/input/visibility.svg";
  const EYE_OFF = "../assets/img/icons/input/visibility_off.svg";
  const INPUT = document.getElementById(inputID);
  const CHANGE_ICON = document.getElementById(icon);
  if (INPUT.type === "password") {
    INPUT.type = "text";
    CHANGE_ICON.src = EYE_ON;
  } else {
    INPUT.type = "password";
    CHANGE_ICON.src = EYE_OFF;
  }
}


/**
 * Clears all text from both the login and signup forms
 * and resets all password icons and error styles.
 */
function clearAndResetForms() {
  const LOGIN_FORM = document.getElementById("login");
  const SIGNUP_FORM = document.getElementById("signup");
  const MAIL = document.getElementById("email_input_login");
  const PASSWORD_CONTAINER = document.getElementById("pw_container_login");
  const PASSWORD = document.getElementById("pwInputLogin");
  LOGIN_FORM.reset();
  SIGNUP_FORM.reset();
  MAIL.classList.remove("invalid-login");
  PASSWORD.classList.remove("invalid-login");
  PASSWORD_CONTAINER.classList.remove("invalid-login-pw");
  resetPasswordVisibility('pwInputLogin', 'lockLogin');
  resetPasswordVisibility('pwInput', 'lock');
  resetPasswordVisibility('pwInputConfirm', 'lockConfirm');
}


/**
 * Resets the password field to hidden and shows the lock icon.
 * @param {string} pwInputID - ID of the input field.
 * @param {string} iconID - ID of the icon image.
 */
function resetPasswordVisibility(pwInputID, iconID) {
  const PW_CONFIRM_CONTAINER = document.getElementById('pwConfirmSignup');
  const INPUT = document.getElementById(pwInputID);
  const ICON = document.getElementById(iconID);
  if (!INPUT || !ICON) return;
  INPUT.type = 'password';
  if (INPUT.value.length === 0) {
    ICON.src = "../assets/img/icons/input/lock.svg";
    if (PW_CONFIRM_CONTAINER) {
      PW_CONFIRM_CONTAINER.classList.remove('invalid-signup-pw');
      PW_CONFIRM_CONTAINER.classList.remove('success-signup-pw');
    }
  } else {
    ICON.src = "../assets/img/icons/input/visibility_off.svg";
  }
}


/**
 * Shows a success message banner and a dark background shadow.
 * Both elements disappear automatically after 1.6 seconds.
 */
function successMessage() {
  const BANNER = document.getElementById('success_message');
  const DIM = document.getElementById('dim'); 
  BANNER.classList.add('show-animation');
  DIM.classList.remove('dnone');
  setTimeout(() => {
    BANNER.classList.remove('show-animation');
    DIM.classList.add('dnone');
  }, 1200);
}