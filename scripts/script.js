document.addEventListener("DOMContentLoaded", () => {
  init();
});

/**
 * Entry point called on DOMContentLoaded. Runs the logo animation.
 */
function init() {
  logoAnimation();
}

/**
 * Runs the logo fade-in animation on first visit.
 * If the animation has already played this session, it is skipped via a sessionStorage flag.
 */
function logoAnimation() {
  const JOIN_LOGO_FADE_IN_ELEMENTS = document.querySelectorAll(".join-logo, .nav-login, .login-content, .form-login ");
  if (sessionStorage.getItem("animationPlayed")) {
    JOIN_LOGO_FADE_IN_ELEMENTS.forEach((fadeInOff) => {
      fadeInOff.classList.add("no-animation");
    });
  } else {
    sessionStorage.setItem("animationPlayed", "true");
  }
}