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
  triggerAnimations();
  btnInit();
}


/**
 * Main function to initialize login event listeners and the signup toggle button.
 */
function btnInit() {
  initLoginEvents();
  initSignupNavigation();
}


/**
 * Initializes all event listeners for the login form and email validation.
 */
function initLoginEvents() {
  const FORM_LOGIN = document.getElementById("login");
  const GUEST_LOGIN = document.getElementById("guest_login");
  const EMAIL_INPUT = document.getElementById("email_input_login");
  FORM_LOGIN.addEventListener("submit", (event) => loginUser(event));
  GUEST_LOGIN.addEventListener("click", guestLogin);
  EMAIL_INPUT.addEventListener("blur", validateEmailOnBlur);
  EMAIL_INPUT.addEventListener("focus", clearEmailErrorOnInput);
}


/**
 * Binds a one‑time click listener to both signup toggle buttons (nav & mobile).
 * On first click initSignupEvents() is called and the signup form is opened.
 * listeners that initSignupEvents() registers on the same buttons.
 */
function initSignupNavigation() {
  const SIGNUP = document.getElementById("signup_btn");
  const SIGNUP_PHONE = document.getElementById("signup_phone_btn");
  const handleFirst = function (event) {
    event.stopImmediatePropagation();
    initSignupEvents();
    toggleForms(event);
  };
  SIGNUP.addEventListener("click", handleFirst, { once: true });
  SIGNUP_PHONE.addEventListener("click", handleFirst, { once: true });
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
  }
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
  }
  if (NAV_PHONE) {
    NAV_PHONE.classList[show_signup ? "add" : "remove"]("dnone");
  }
  removeFade(LOGIN_FORM);
  if (NAV_LOGIN) removeFade(NAV_LOGIN);
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
      handleLoginFail(btn);
      return;
    }
    handleLoginSuccess(ACTIV_USER);
  } catch (error) {
    console.error("Login process failed:", error);
    if (btn) btn.disabled = false;
  }
}


/**
 * Saves session data and redirects to summary page.
 * @param {Object} user - The authenticated user.
 */
function handleLoginSuccess(user) {
  saveSession(user);
  window.location.href = "./html/summary.html";
}


/**
 * Shows login error styling and re-enables the submit button.
 * @param {HTMLElement|null} btn - The submit button to re-enable.
 */
function handleLoginFail(btn) {
  showFailEntriesLogin();
  if (btn) btn.disabled = false;
}


/**
 * Shows error styles if login fails.
 */
function showFailEntriesLogin() {
  const MAIL = document.getElementById("email_input_login");
  const PASSWORD_CONTAINER = document.getElementById("pw_container_login");
  const PASSWORD = document.getElementById("pw_input_login");
  MAIL.classList.add("invalid-login");
  PASSWORD.classList.add("invalid-login");
  PASSWORD_CONTAINER.classList.add("invalid-login-pw");
  changeLockToEye('pw_input_login', 'lock_login');
  MAIL.addEventListener('input', function () {
    MAIL.classList.remove('invalid-login');
    PASSWORD.classList.remove('invalid-login');
    PASSWORD_CONTAINER.classList.remove('invalid-login-pw');
  });
}


/**
 * Fetches all users from Firebase and stores them in the module-level users array.
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
  LOGIN_FORM.reset();
  SIGNUP_FORM.reset();
  clearLoginFormErrors();
  clearSignupFormErrors();
  resetPasswordVisibility('pw_input_login', 'lock_login');
  resetPasswordVisibility('pw_input', 'lock');
  resetPasswordVisibility('pw_input_confirm', 'lock_confirm');
}


/**
 * Removes all error classes from the login form fields.
 */
function clearLoginFormErrors() {
  const MAIL = document.getElementById("email_input_login");
  const PASSWORD_CONTAINER = document.getElementById("pw_container_login");
  const PASSWORD = document.getElementById("pw_input_login");
  MAIL.classList.remove("invalid-login");
  PASSWORD.classList.remove("invalid-login");
  PASSWORD_CONTAINER.classList.remove("invalid-login-pw");
}


/**
 * Resets the password field to hidden and shows the lock icon.
 * @param {string} pwInputID - ID of the input field.
 * @param {string} iconID - ID of the icon image.
 */
function resetPasswordVisibility(pwInputID, iconID) {
  const PW_CONFIRM_CONTAINER = document.getElementById('pw_confirm_signup');
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
 * Checks whether a value looks like a valid email address.
 * @param {string} value
 * @returns {boolean}
 */
function isValidEmail(value) {
  if (!value) return true;
  return /^[a-z0-9._%+\-]+@[a-z0-9.\-]+\.[a-z]{2,}$/i.test(value.trim());
}


/**
 * Validates the email input on blur (when leaving the field).
 */
function validateEmailOnBlur() {
  const MAIL = document.getElementById("email_input_login");
  const PASSWORD_CONTAINER = document.getElementById("pw_container_login");
  if (MAIL.value.trim().length > 0 && !isValidEmail(MAIL.value)) {
    MAIL.classList.add("invalid-login");
    PASSWORD_CONTAINER.classList.add("invalid-login-pw");
  }
}


/**
 * Removes error styling from the email field as soon as the user starts typing.
 */
function clearEmailErrorOnInput() {
  const MAIL = document.getElementById("email_input_login");
  const PASSWORD_CONTAINER = document.getElementById("pw_container_login");
  MAIL.classList.remove("invalid-login");
  PASSWORD_CONTAINER.classList.remove("invalid-login-pw");
}