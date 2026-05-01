const GREETING = document.getElementById('summary-greeting');
const OVERVIEW = document.getElementById('summary-overview');
const HEADLINE = document.getElementById('summary-headline');

function loggedInUserName() {
  const GREETING_NAME = document.getElementById("greeting-name");
  const GREETING_TEXT = document.getElementById("greeting-text");
  const FULL_NAME = sessionStorage.getItem('activeUserName');
  let current_greeting = showGreetingText();
  if (FULL_NAME !== "Guest") {
    GREETING_TEXT.innerHTML = current_greeting + ",";
    GREETING_NAME.innerHTML = FULL_NAME;
  } else {
    GREETING_TEXT.innerHTML = current_greeting + "!";
    GREETING_NAME.innerHTML = "";
  }
}

function showGreetingText() {
  const TIME_NOW = new Date();
  const HOUR = TIME_NOW.getHours();
  let current_greeting;
  if (HOUR < 11) {
    current_greeting = "Good morning";
  } else if (HOUR < 15) {
    current_greeting = "Good day";
  } else if (HOUR < 18) {
    current_greeting = "Good afternoon";
  } else {
    current_greeting = "Good evening";
  }
  return current_greeting;
}

function showGreeting() {
  const WIDTH = window.innerWidth;
  const referrer = document.referrer;
  if (WIDTH >= 1024) {
    GREETING.classList.remove('d-none');
    OVERVIEW.classList.remove('d-none');
    HEADLINE.classList.remove('d-none');
    return;
  }
  else if (WIDTH < 1024 && referrer.includes('index.html') && sessionStorage.getItem('justLoggedIn') === 'true') {
    showMobileWithGreeting();
  } else {
    showMobileWithoutGreeting();
  }
}

function showMobileWithGreeting() {
  GREETING.classList.add('summary-greeting-mobile');
  GREETING.classList.remove('d-none');
  setTimeout(() => {
    GREETING.classList.add('animate-fade-out');
    setTimeout(() => {
      OVERVIEW.classList.remove('d-none');
      HEADLINE.classList.remove('d-none');
      GREETING.classList.add('d-none');
      GREETING.classList.remove('summary-greeting-mobile');
    }, 1000);
  }, 2500);
  sessionStorage.setItem('justLoggedIn', 'false');
}

function showMobileWithoutGreeting() {
  GREETING.classList.remove('summary-greeting-mobile');
  GREETING.classList.add('d-none');
  OVERVIEW.classList.remove('d-none');
  HEADLINE.classList.remove('d-none');
}