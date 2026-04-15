let SHOW_SIGNUP = false;
let USERS = [];
const USERS_URL = "https://join-3135-default-rtdb.europe-west1.firebasedatabase.app/users" + ".json";

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
  const USER_ID = generateId();
  pushUser(NEW_USER, USER_ID);
}

function generateId() {
  return (Date.now().toString(36) + Math.random().toString(36)).substring(0, 6);
}

async function getUsers() {
  const RESPONSE = await fetch(USERS_URL);
  const RESULT = await RESPONSE.json();
  USERS = [];
  USERS.push(RESULT);
}

async function pushUser(user) {
  try {
    const RESPONSE = await fetch(USERS_URL, {
      method: "PUT",
      body: JSON.stringify({ title: generateId(), content: user }),
    });
    if (!RESPONSE.ok) {
      throw new Error(`Push the User to Firebase don't work see: ${RESPONSE.status}`);
    }
  } catch (er) {
    console.error(`the function pushUser() don't worke see: ${er}`);
  }
}

async function loginUser(user_id) {
  const USER = "";
  const PW = "";
  await getUsers();
  const ACTIV_USER = Object.values(USERS).find((u) => u.id === user_id);
  console.log(ACTIV_USER);
}
