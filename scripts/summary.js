function loggedInUserName() {
  const GREETING_NAME = document.getElementById("greeting-name");
  const FULL_NAME = sessionStorage.getItem('activeUserName');
  GREETING_NAME.innerHTML = FULL_NAME;
}