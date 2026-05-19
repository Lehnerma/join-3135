let SHOW_SIGNUP = false;
let USERS = [];

const USERS_URL = (id = "") => "https://join-3135-default-rtdb.europe-west1.firebasedatabase.app/users/" + id + ".json";

/**
 * Initializes the page functions.
 */
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
  if (window.innerWidth <= 600) {
    FORM_CONTAINER.classList.add("mobile-fade-in");
  }
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
 * Switches between the login and signup forms.
 * @param {Event} event - The click event.
 */
function toggleForms(event) {
  if (event && typeof event.preventDefault === 'function') {
    event.preventDefault();
  };
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
  if (NAV_LOGIN) {
    NAV_LOGIN.classList[SHOW_SIGNUP ? "add" : "remove"]("dnone");
  } if (NAV_PHONE) {
    NAV_PHONE.classList[SHOW_SIGNUP ? "add" : "remove"]("dnone");
  }
  removeFade(LOGIN_FORM);
  if (NAV_LOGIN) removeFade(NAV_LOGIN);
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
  successMessage();
  setTimeout(() => {
    toggleForms();
    ev.target.reset();
  }, 1200);
}


/**
 * Verifies that the password and confirm password fields match.
 * @returns {boolean} - true if passwords match, false otherwise
 */
function verifyPassword() {
  const password = document.getElementById("pwInput");
  const confirmPassword = document.getElementById("pwInputConfirm");
  return password.value === confirmPassword.value;
}


/**
 * Validates that both password input fields match and updates the UI accordingly.
 * Adds an error class if passwords don't match, removes it if they do.
 */
function confirmPassword() {
  const password = document.getElementById("pwInput");
  const confirmPassword = document.getElementById("pwInputConfirm");
  const confirmPasswordContainer = document.getElementById("pwConfirmSignup");
  confirmPasswordContainer.classList.remove("invalid-signup-pw");
  if (password.value.length === 0) {
    return;
  } if (password.value === confirmPassword.value) {
    confirmPasswordContainer.classList.remove("invalid-signup-pw");
    confirmPasswordContainer.classList.add("success-signup-pw");
    return true;
  } if (confirmPassword.value.length >= password.value.length) {
    confirmPasswordContainer.classList.add("invalid-signup-pw");
    confirmPasswordContainer.classList.remove("success-signup-pw");
    return false;
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
 * Checks login data and logs the user in.
 * @param {Event} ev - The submit event.
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
 * Loads all users from the server.
 */
async function getUsers() {
  const RESPONSE = await fetch(USERS_URL());
  const RESULT = await RESPONSE.json();
  USERS = Object.values(RESULT);
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
  let inputPW = document.getElementById(pwInputID);
  let lock = document.getElementById(iconID);
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
 * Toggles between showing and hiding the password text.
 * @param {string} inputID - ID of the input field.
 * @param {string} icon - ID of the icon image.
 */
function showPasswordInput(inputID, icon) {
  const eyeON = "../assets/img/icons/input/visibility.svg";
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


/**
 * Clears all text from both the login and signup forms
 * and resets all password icons back to their original state.
 */
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
  const pwConfirmContainer = document.getElementById('pwConfirmSignup'); // Container suchen
  const input = document.getElementById(pwInputID);
  const icon = document.getElementById(iconID);
  if (!input || !icon) return;
  input.type = 'password';
  if (input.value.length === 0) {
    icon.src = "../assets/img/icons/input/lock.svg";
    if (pwConfirmContainer) {
      pwConfirmContainer.classList.remove('invalid-signup-pw');
      pwConfirmContainer.classList.remove('success-signup-pw');
    }
  } else {
    icon.src = "../assets/img/icons/input/visibility_off.svg";
  }
}

/**
 * Shows a success message banner and a dark background shadow.
 * Both elements disappear automatically after 1.6 seconds.
 */
function successMessage() {
  const banner = document.getElementById('success_message');
  const dim = document.getElementById('dim'); 
  banner.classList.add('show-animation');
  dim.classList.remove('dnone');
  setTimeout(() => {
    banner.classList.remove('show-animation');
    dim.classList.add('dnone');
  }, 1200);
}