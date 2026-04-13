document.addEventListener('DOMContentLoaded', () => {
    init();
});


function init() {
    logoAnimation();
}

/**
 * @function logoAnimation();
 * @description Checks if the animation has already run in this session
   If yes: Turn off animation
   If no: Run animation and set flag
 */

function logoAnimation() {
    const joinLogoFadeInElements = document.querySelectorAll('.join-logo, .nav-login, .login-content, .form-login ');
        if (sessionStorage.getItem('animationPlayed')){
        joinLogoFadeInElements.forEach(fadeInOff => {
            fadeInOff.classList.add('no-animation')
        })
    } else {
        sessionStorage.setItem('animationPlayed', 'true');
    }
};






