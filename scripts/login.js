let SHOW_SIGNUP = false;
let USERS = [];

const USERS_URL = (id = "") => "https://join-3135-default-rtdb.europe-west1.firebasedatabase.app/users/" + id + ".json";

function init() {
  btnInit();
  triggerAnimations();
}

function btnInit() {
  const SIGNUP = document.getElementById("signup_btn");
  const SIGNUP_BACK = document.getElementById("signup_back");
  const FORM_LOGIN = document.getElementById("login");
  const FORM_SIGNUP = document.getElementById("signup");
  const GUEST_LOGIN = document.getElementById("guest_login");

  SIGNUP_BACK.addEventListener("click", (event) => toggelForms(event));
  SIGNUP.addEventListener("click", (event) => toggelForms(event));
  GUEST_LOGIN.addEventListener("click", guestLogin);

  FORM_LOGIN.addEventListener("submit", (event) => loginUser(event));
  FORM_SIGNUP.addEventListener("submit", (event) => creatUser(event));
}

function triggerAnimations() {
  const JOIN_LOGO = document.querySelector(".join-logo");
  JOIN_LOGO.classList.add("logo-animation");
  const FORM_CONTAINER = document.querySelector(".form--container");
  FORM_CONTAINER.classList.add("fade-in");
  const NAV_LOGIN = document.querySelector(".nav-login");
  NAV_LOGIN.classList.add("fade-in");
  const FOOTER_LOGIN = document.querySelector(".footer-login");
  FOOTER_LOGIN.classList.add("fade-in");
}

function removeFade(container) {
  container.classList.remove("fade-in");
  container.style.opacity = "1";
}

function toggelForms(event) {
  event.preventDefault();
  const LOGIN_FORM = document.getElementById("login");
  const SIGNUP_FORM = document.getElementById("signup");
  const NAV_LOGIN = document.getElementById("nav_login");

  SHOW_SIGNUP = !SHOW_SIGNUP;
  LOGIN_FORM.classList[SHOW_SIGNUP ? "add" : "remove"]("dnone");
  NAV_LOGIN.classList[SHOW_SIGNUP ? "add" : "remove"]("dnone");
  SIGNUP_FORM.classList[SHOW_SIGNUP ? "remove" : "add"]("dnone");

  removeFade(LOGIN_FORM);
  removeFade(NAV_LOGIN);
  setRequired(SHOW_SIGNUP);
}

function setRequired(condition) {
  const INPUTS = document.querySelectorAll(".input_signup");
  if (condition) {
    INPUTS.forEach((e) => (e.required = true));
  } else {
    INPUTS.forEach((e) => (e.required = false));
  }
}

function guestLogin() {
  window.location.href = "./html/summary.html";
}

async function creatUser(ev) {
  ev.preventDefault(); // verhindert das neuladen der seite.
  const FORM = new FormData(ev.target);
  const NEW_USER = Object.fromEntries(FORM.entries());
  NEW_USER.id = generateId();
  pushUser(NEW_USER);
}

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
