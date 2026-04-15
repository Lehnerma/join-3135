let SHOW_SIGNUP = false;

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
