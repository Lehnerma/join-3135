let SHOW_SIGNUP = false;
let USERS = [];

const USERS_URL = (id = "") => "https://join-3135-default-rtdb.europe-west1.firebasedatabase.app/users/" + id + ".json";

function init() {
  btnInit();
  triggerAnimations();

}


/**
 * initial all buttons for eventlisteners
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
  setupInputEvents();
}


/**
 * function to trigger the animation on the beginning.
 */
function triggerAnimations() {
  const JOIN_LOGO = document.querySelector(".join-logo");
  const FORM_CONTAINER = document.querySelector(".form--container");
  const NAV_LOGIN = document.querySelector(".nav-login");
  const FOOTER_LOGIN = document.querySelector(".footer-login");
  JOIN_LOGO.classList.add("logo-animation");
  FORM_CONTAINER.classList.add("fade-in");
  NAV_LOGIN.classList.add("fade-in");
  FOOTER_LOGIN.classList.add("fade-in");
}


/**
 * Remove the fade of the forms to swap between the login in and sign up form.
 * @param {*} container - is the container for the style
 */
function removeFade(container) {
  container.classList.remove("fade-in");
  container.style.opacity = "1";
}


/**
 * Switches between the login form and the signup form.
 * It stops the page from reloading, clears the forms, 
 * changes the view state, and updates the screen.
 *  @param {Event} event - The click event from the browser that triggers this function.
 */
function toggleForms(event) {
  event.preventDefault();
  clearAndResetForms();
  SHOW_SIGNUP = !SHOW_SIGNUP;
  updateToggleUI();
}


/**
 * to show or hide the forms
 * @param {*} event -> to disable the reload for the switching
 */
function updateToggleUI() {
  const LOGIN_FORM = document.getElementById("login");
  const SIGNUP_FORM = document.getElementById("signup");
  const NAV_LOGIN = document.getElementById("nav_login");
  const NAV_PHONE = document.getElementById("phone_signup");
  LOGIN_FORM.classList[SHOW_SIGNUP ? "add" : "remove"]("dnone");
  SIGNUP_FORM.classList[SHOW_SIGNUP ? "remove" : "add"]("dnone");
  if (window.innerWidth > 600) {
    NAV_LOGIN.classList[SHOW_SIGNUP ? "add" : "remove"]("dnone");
  } if (window.innerWidth < 600) {
    NAV_PHONE.classList[SHOW_SIGNUP ? "add" : "remove"]("dnone");
  }
  removeFade(LOGIN_FORM);
  removeFade(NAV_LOGIN);
  setRequired(SHOW_SIGNUP);
}


/**
 * Workaround to get no Errors in the console
 * @param {*} condition -> is the condition if the form is hide or not
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
 * redirect for the guest login and set id for the session storage
 */
function guestLogin() {
  window.location.href = "./html/summary.html";
  sessionStorage.setItem("user_id", "guest");
  sessionStorage.setItem("activeUserName", "Guest");
  sessionStorage.setItem("justLoggedIn", "true");
}


/**
 *To sign up a new user.
 * @param {*} ev -> need for disable the reload of the side.
 */
async function creatUser(ev) {
  ev.preventDefault();
  if (!verifyPassword()) {
    return;
  }
  const FORM = new FormData(ev.target);
  const NEW_USER = Object.fromEntries(FORM.entries());
  NEW_USER.id = generateId();
  await pushUser(NEW_USER);
  ev.target.reset();
  toggleForms(ev);
}

/**
 * Verifies that the password and confirm password fields match.
 * @returns {boolean} - true if passwords match, false otherwise
 */
function verifyPassword() {
  const password = document.getElementById("pwInput");
  const confirmPassword = document.getElementById("pwInputConfirm");
  return password.value === confirmPassword;
}

/**
 * Validates that both password input fields match and updates the UI accordingly.
 * Adds an error class if passwords don't match, removes it if they do.
 */
function confirmPassword() {
  const password = document.getElementById("pwInput");
  const confoirmPassword = document.getElementById("pwInputConfirm");
  const confirmPasswordContainer = document.querySelector("#pwConfirmSignup");
  if (password.value !== confoirmPassword.value) {
    confirmPasswordContainer.classList.add("invalid-signup-pw");
  } else {
    confirmPasswordContainer.classList.remove("invalid-signup-pw");
  }
}
/**
 * To generate a unique id for evry user witch is create from the time
 * @returns -> uniqe id
 */
function generateId() {
  return (Date.now().toString(36) + Math.random().toString(36)).substring(0, 6);
}


/**
 * Sends the user's data to the database (Firebase) to save or update it.
 * If something goes wrong with the internet connection or the server, 
 * it catches the mistake and shows an error message in the console.
 * 
 * @param {Object} user - The user object that contains the data and the user ID.
 * @returns {Promise<void>} This is an async function, so it returns a promise that finishes when the saving is done.
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
 * Tries to log in the user. It gets the typed email and password,
 * loads all users from the database, checks if the password is correct,
 * saves the user info, and opens the summary page.
 * 
 * @param {Event} ev - The submit event from the login form.
 */
async function loginUser(ev) {
  ev.preventDefault();
  const FORM = new FormData(ev.target);
  const EMAIL = FORM.get("email");
  const PW = FORM.get("password");
  await getUsers();
  const ACTIV_USER = USERS.find((u) => u.email == EMAIL);
  if (!ACTIV_USER || !(ACTIV_USER.password === PW)) {
    showFailEntriesLogin();
    return;
  }
  saveSession(ACTIV_USER);
  window.location.href = "./html/summary.html";
}

function showFailEntriesLogin() {
  const MAIL = document.getElementById("email_input_login");
  const PASSWORD_CONTAINER = document.getElementById("pw_container_login");
  const PASSWORD = document.getElementById("pw_input_login");
  MAIL.classList.add("invalid-login");
  PASSWORD.classList.add("invalid-login");
  PASSWORD_CONTAINER.classList.add("invalid-login-pw");
}

async function getUsers() {
  const RESPONSE = await fetch(USERS_URL());
  const RESULT = await RESPONSE.json();
  USERS = Object.values(RESULT);
}

function saveSession(user) {
  sessionStorage.setItem("user_id", user.id);
  sessionStorage.setItem("activeUserName", user.name);
  sessionStorage.setItem("justLoggedIn", "true");
}

function logInChangeLockToEye() {
  const pwInputLogIn = document.getElementById("pwInputLogIn");
  const lockLogIn = document.getElementById("lockLogIn");
  const lockIcon = "../assets/img/icons/input/lock.svg";
  const eyeIcon = "../assets/img/icons/input/visibility_off.svg";
  lockLogIn.src = pwInputLogIn.value.length > 0 ? eyeIcon : lockIcon;
}

function signUpChangeLockToEye() {
  const pwInput = document.getElementById("pwInput");
  const lock = document.getElementById("lock");
  const pwInputConfirm = document.getElementById("pwInputConfirm");
  const lockConfirm = document.getElementById("lockConfirm");
  const lockIcon = "../assets/img/icons/input/lock.svg";
  const eyeOFF = "../assets/img/icons/input/visibility_off.svg";
  const eyeON = "../assets/img/icons/input/visibility.svg";
  if (inputPW.value.length === 0) {
    lock.src = lockIcon;
  } else if (inputPW.type === "password") {
    lock.src = eyeOFF;
  } else {
    lock.src = eyeON;
  }
}


/**
 * Toggles the password visibility. If the password is hidden, it shows it.
 * If it is visible, it hides it again. It also changes the eye icon.
 * 
 * @param {string} iconID - The ID of the icon image.
 * @param {string} pwInputID - The ID of the password input box.
 */
function showPasswordInput(iconID, pwInputID) {
  let input = document.getElementById(pwInputID);
  let icon = document.getElementById(iconID);
  const eyeOFF = "../assets/img/icons/input/visibility_off.svg";
  const eyeON = "../assets/img/icons/input/visibility.svg";
  if (input.type === 'password') {
    input.type = 'text';
    icon.src = eyeON;
  } else {
    input.type = 'password';
    icon.src = eyeOFF;
  }
}


/**
 * Resets the password input box back to hidden dots ('password' type)
 * and puts back the lock icon if the box is completely empty.
 * 
 * @param {string} pwInputID - The ID of the password input box.
 * @param {string} iconID - The ID of the icon image.
 */
function resetPasswordVisibility(pwInputID, iconID) {
  const input = document.getElementById(pwInputID);
  const icon = document.getElementById(iconID);
  const lockIcon = "../assets/img/icons/input/lock.svg";
  const eyeOFF = "../assets/img/icons/input/visibility_off.svg";
  const input = document.getElementById(inputID);
  const changeIcon = document.getElementById(icon);
  if (input.type === "password") {
    input.type = "text";
    changeIcon.src = eyeON;
  } else {
    input.type = "password";
    changeIcon.src = eyeOFF;
  }
}
