function init() {
  btnInit();
}

function btnInit() {
  const SIGNUP = document.getElementById("signup_btn");
  const SIGNUP_BACK = document.getElementById("signup_back");
  const FORM_LOGIN = document.getElementById("login");
  const FORM_SIGNUP = document.getElementById("signup");

  SIGNUP_BACK.addEventListener("click", toggelForms);
  SIGNUP.addEventListener("click", toggelForms);
}

function toggelForms() {
  const LOGIN_FORM = document.getElementById("login");
  const SIGUNUP_FORM = document.getElementById("signup");
  LOGIN_FORM.classList.toggle("dnone");
  SIGUNUP_FORM.classList.toggle("dnone");
}
