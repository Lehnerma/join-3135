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
 * to show or hide the forms
 * @param {*} event -> to disable the reload for the switching
 */
function toggleForms(event) {
  if (event && typeof event.preventDefault === 'function') {
    event.preventDefault();
  }
  const LOGIN_FORM = document.getElementById("login");
  const SIGNUP_FORM = document.getElementById("signup");
  const NAV_LOGIN = document.getElementById("nav_login");
  const NAV_PHONE = document.getElementById("phone_signup");
  SHOW_SIGNUP = !SHOW_SIGNUP;
  LOGIN_FORM.classList[SHOW_SIGNUP ? "add" : "remove"]("dnone");
  SIGNUP_FORM.classList[SHOW_SIGNUP ? "remove" : "add"]("dnone");
  if (window.innerWidth > 600) {
    NAV_LOGIN.classList[SHOW_SIGNUP ? "add" : "remove"]("dnone");
  }
  if (window.innerWidth < 600) {
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
  sessionStorage.setItem('justLoggedIn', 'true');
}

/**
 *To sign up a new user.
 * @param {*} ev -> need for disable the reload of the side.
 */
async function creatUser(ev) {
  ev.preventDefault();
  const FORM = new FormData(ev.target);
  const NEW_USER = Object.fromEntries(FORM.entries());
  NEW_USER.id = generateId();
  pushUser(NEW_USER);
  showSuccessMessage();
  setTimeout(() => {
    hideSuccessMessage();
    ev.target.reset();
    toggleForms();
  }, 2000);
  console.log(ev.target);
}

function showSuccessMessage() {
    const msg = document.getElementById('success_message');
    document.body.classList.add('dim-background');
    msg.classList.remove('dnone');
    msg.classList.add('show-animation');
}

function hideSuccessMessage() {
    const msg = document.getElementById('success_message');
    document.body.classList.remove('dim-background');
    msg.classList.add('dnone');
    msg.classList.remove('show-animation');
}

/**
 * To generate a unique id for evry user witch is create from the time
 * @returns -> uniqe id
 */
function generateId() {
  return (Date.now().toString(36) + Math.random().toString(36)).substring(0, 6);
}

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

async function loginUser(ev) {
  ev.preventDefault();
  const FORM = new FormData(ev.target);
  const EMAIL = FORM.get("email");
  const PW = FORM.get("password");
  await getUsers();
  const ACTIV_USER = USERS.find((u) => u.email == EMAIL);
  if (ACTIV_USER.password === PW) {
    saveId(ACTIV_USER.id);
    sessionStorage.setItem("activeUserName", ACTIV_USER.name);
    sessionStorage.setItem('justLoggedIn', 'true');
    window.location.href = "./html/summary.html";
  }
}

async function getUsers() {
  const RESPONSE = await fetch(USERS_URL());
  const RESULT = await RESPONSE.json();
  USERS = Object.values(RESULT);
}

function saveId(id) {
  sessionStorage.setItem("user_id", id);
}


function logInChangeLockToEye() {
  const pwInputLogIn = document.getElementById('pwInputLogIn');
  const lockLogIn = document.getElementById('lockLogIn');
  const lockIcon = "../assets/img/icons/input/lock.svg";
  const eyeIcon = "../assets/img/icons/input/visibility_off.svg";
  lockLogIn.src = pwInputLogIn.value.length > 0 ? eyeIcon : lockIcon;
}

function signUpChangeLockToEye() {
  const pwInput = document.getElementById('pwInput');
  const lock = document.getElementById('lock');
  const pwInputConfirm = document.getElementById('pwInputConfirm');
  const lockConfirm = document.getElementById('lockConfirm');
  const lockIcon = "../assets/img/icons/input/lock.svg";
  const eyeIcon = "../assets/img/icons/input/visibility_off.svg";
  lock.src = pwInput.value.length > 0 ? eyeIcon : lockIcon;
  lockConfirm.src = pwInputConfirm.value.length > 0 ? eyeIcon : lockIcon;
}

function showPasswordInput(inputID, icon) {
  const eyeON = "../assets/img/icons/input/visibility.svg";
  const eyeOFF = "../assets/img/icons/input/visibility_off.svg";
  const input = document.getElementById(inputID);
  const changeIcon = document.getElementById(icon);
    if (input.type === "password") {
     input.type ="text";
     changeIcon.src = eyeON;
  }
  else{
    input.type = "password";
    changeIcon.src = eyeOFF;
  }
}
