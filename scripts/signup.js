/**
 * Initializes all permanent event listeners for the signup form and navigation.
 * Called only once when the user first clicks any signup toggle button.
 */
function initSignupEvents() {
  const FORM_SIGNUP = document.getElementById("signup");
  const SIGNUP = document.getElementById("signup_btn");
  const SIGNUP_BACK = document.getElementById("signup_back");
  const SIGNUP_PHONE = document.getElementById("signup_phone_btn");
  FORM_SIGNUP.addEventListener("submit", (event) => {
    event.preventDefault();
    if (checkFormInputSignUp()) creatUser(event);
  });
  SIGNUP.addEventListener("click", (event) => toggleForms(event));
  SIGNUP_BACK.addEventListener("click", (event) => toggleForms(event));
  SIGNUP_PHONE.addEventListener("click", (event) => toggleForms(event));
  initSignupInputEvents();
}


/**
 * Registers blur / focus validators for the signup name and email fields.
 */
function initSignupInputEvents() {
  const SIGNUP_NAME = document.getElementById("signup_name");
  const SIGNUP_EMAIL = document.getElementById("signup_email");
  SIGNUP_NAME.addEventListener("blur", validateSignupNameOnBlur);
  SIGNUP_NAME.addEventListener("focus", clearSignupNameErrorOnFocus);
  SIGNUP_EMAIL.addEventListener("blur", validateSignupEmailOnBlur);
  SIGNUP_EMAIL.addEventListener("focus", clearSignupEmailErrorOnFocus);
}


/**
 * Checks if all signup form fields are filled.
 * Only the actually empty fields receive error styling.
 * @returns {boolean} true if the form is valid, false otherwise.
 */
function checkFormInputSignUp() {
  const SIGNUP_NAME = document.getElementById('signup_name');
  const SIGNUP_EMAIL = document.getElementById('signup_email');
  const PASSWORD = document.getElementById('pw_input');
  const PASSWORD_CONFIRM = document.getElementById('pw_input_confirm');
  const CONTAINER = document.getElementById('pw_confirm_signup');
  const PRIVACY_CHECKBOX = document.getElementById('privacy');
  const PRIVACY_CONTAINER = document.querySelector('.privacy-content');
  let hasError = false;
  if (validateSignupNameField(SIGNUP_NAME)) hasError = true;
  if (validateSignupEmailField(SIGNUP_EMAIL)) hasError = true;
  if (validateSignupPasswordFields(PASSWORD, PASSWORD_CONFIRM, CONTAINER)) hasError = true;
  if (hasAnySignupFieldFilled() && validateSignupPrivacyField(PRIVACY_CHECKBOX, PRIVACY_CONTAINER)) hasError = true;
  return !hasError;
}


/**
 * Checks whether at least one signup text field contains a value.
 * Used to decide whether the privacy error should be shown.
 * @returns {boolean}
 */
function hasAnySignupFieldFilled() {
  const fields = [
    document.getElementById('signup_name'),
    document.getElementById('signup_email'),
    document.getElementById('pw_input'),
    document.getElementById('pw_input_confirm')
  ];
  return fields.some(f => f && f.value.trim().length > 0);
}


/**
 * Marks the name field as invalid when empty.
 * @param {HTMLElement} el
 * @returns {boolean} true if error was added.
 */
function validateSignupNameField(el) {
  if (!el.value.trim()) {
    el.classList.add("invalid-login");
    setClearOnInput(el, ["invalid-login"]);
    return true;
  }
  return false;
}


/**
 * Marks the email field as invalid when empty.
 * @param {HTMLElement} el
 * @returns {boolean} true if error was added.
 */
function validateSignupEmailField(el) {
  if (!el.value.trim()) {
    el.classList.add("invalid-login");
    setClearOnInput(el, ["invalid-login"]);
    return true;
  }
  return false;
}


/**
 * Marks password and/or confirm fields as invalid when empty.
 * @param {HTMLElement} pwEl
 * @param {HTMLElement} confirmEl
 * @param {HTMLElement} container
 * @returns {boolean} true if at least one error was added.
 */
function validateSignupPasswordFields(pwEl, confirmEl, container) {
  let err = false;
  if (!pwEl.value) {
    pwEl.classList.add("invalid-login");
    container.classList.add("invalid-signup-all");
    setClearOnInput(pwEl, ["invalid-login"], container, ["invalid-signup-all"]);
    err = true;
  }
  if (!confirmEl.value) {
    confirmEl.classList.add("invalid-login");
    container.classList.add("invalid-signup-all");
    setClearOnInput(confirmEl, ["invalid-login"], container, ["invalid-signup-all"]);
    err = true;
  }
  return err;
}


/**
 * Marks the privacy checkbox area as invalid when not checked.
 * @param {HTMLElement} checkbox
 * @param {HTMLElement} container
 * @returns {boolean} true if error was added.
 */
function validateSignupPrivacyField(checkbox, container) {
  if (!checkbox.checked) {
    container.classList.add('invalid-privacy');
    checkbox.addEventListener('change', function clearOnCheck() {
      container.classList.remove('invalid-privacy');
      checkbox.removeEventListener('change', clearOnCheck);
    });
    return true;
  }
  return false;
}


/**
 * Adds an input listener to one or more elements that removes given CSS classes
 * on the first input event.
 * @param {HTMLElement} el - Primary element to listen on.
 * @param {string[]} elClasses - Classes to remove from el.
 * @param {HTMLElement} [el2] - Optional second element.
 * @param {string[]} [el2Classes] - Classes to remove from el2.
 */
function setClearOnInput(el, elClasses, el2, el2Classes) {
  const handler = function () {
    elClasses.forEach(c => el.classList.remove(c));
    if (el2 && el2Classes) {
      el2Classes.forEach(c => el2.classList.remove(c));
    }
    el.removeEventListener("input", handler);
  };
  el.addEventListener("input", handler);
}


/**
 * Gathers input data from the signup form and creates a user object.
 * @param {HTMLFormElement} formElement - The signup form.
 * @returns {Object} The fresh user object with a unique ID.
 */
function buildUserData(formElement) {
  const FORM = new FormData(formElement);
  const NEW_USER = Object.fromEntries(FORM.entries());
  NEW_USER.id = generateId();
  return NEW_USER;
}


/**
 * Resets the signup form and reactivates the submit button.
 * @param {HTMLFormElement} form - The signup form.
 * @param {HTMLElement|null} btn - The submit button.
 */
function finalizeSignup(form, btn) {
  toggleForms();
  form.reset();
  if (btn) btn.disabled = false;
}


/**
 * Handles the signup form submission and prevents double submits.
 * @param {Event} ev - The form submit event.
 */
async function creatUser(ev) {
  ev.preventDefault();
  if (!verifyPassword()) return;
  const btn = ev.target.querySelector('button[type="submit"]');
  if (btn) btn.disabled = true;
  try {
    const newUser = buildUserData(ev.target);
    await pushUser(newUser);
    successMessage();
    setTimeout(() => finalizeSignup(ev.target, btn), 1200);
  } catch (error) {
    console.error("Signup failed:", error);
    if (btn) btn.disabled = false;
  }
}


/**
 * Verifies that the password and confirm password fields match.
 * @returns {boolean} - true if passwords match, false otherwise
 */
function verifyPassword() {
  const PASSWORD = document.getElementById("pw_input");
  const CONFIRM_PASSWORD = document.getElementById("pw_input_confirm");
  return PASSWORD.value === CONFIRM_PASSWORD.value;
}


/**
 * Validates that both password input fields match and updates the UI accordingly.
 * Adds an error class if passwords don't match, removes it if they do.
 */
function confirmPassword() {
  const PASSWORD = document.getElementById("pw_input");
  const CONFIRM_PASSWORD = document.getElementById("pw_input_confirm");
  const CONFIRM_PASSWORD_CONTAINER = document.getElementById("pw_confirm_signup");
  CONFIRM_PASSWORD_CONTAINER.classList.remove("invalid-signup-pw");
  if (PASSWORD.value.length === 0) {
    return;
  }
  if (PASSWORD.value === CONFIRM_PASSWORD.value) {
    CONFIRM_PASSWORD_CONTAINER.classList.remove("invalid-signup-pw");
    CONFIRM_PASSWORD_CONTAINER.classList.add("success-signup-pw");
    return true;
  }
  if (CONFIRM_PASSWORD.value.length >= PASSWORD.value.length) {
    CONFIRM_PASSWORD_CONTAINER.classList.add("invalid-signup-pw");
    CONFIRM_PASSWORD_CONTAINER.classList.remove("success-signup-pw");
    return false;
  }
}


/**
 * Generates a short unique id from the current timestamp and a random value.
 * @returns {string} A 6-character alphanumeric id.
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
      throw new Error(`Status: ${RESPONSE.status}`);
    }
  } catch (er) {
    console.error(`push user status: ${er}`);
  }
}


/**
 * Shows a success message banner and a dark background shadow.
 * Both elements disappear automatically after 1.2 seconds.
 */
function successMessage() {
  const BANNER = document.getElementById('success_message');
  const DIM = document.getElementById('dim');
  BANNER.classList.add('show-animation');
  DIM.classList.remove('dnone');
  setTimeout(() => {
    BANNER.classList.remove('show-animation');
    DIM.classList.add('dnone');
  }, 1200);
}


/**
 * Validates the signup name input on blur.
 * If the field is not empty but contains invalid characters, adds error styling.
 */
function validateSignupNameOnBlur() {
  const NAME = document.getElementById("signup_name");
  const CONTAINER = document.getElementById("pw_confirm_signup");
  const NAME_PATTERN = /^[a-zA-ZÀ-ÿ\s\-\.]+$/;
  if (NAME.value.trim().length > 0 && !NAME_PATTERN.test(NAME.value.trim())) {
    NAME.classList.add("invalid-login");
    CONTAINER.classList.add("invalid-signup-all");
  }
}


/**
 * Removes error styling from the signup name field as soon as the user focuses it.
 */
function clearSignupNameErrorOnFocus() {
  const NAME = document.getElementById("signup_name");
  const CONTAINER = document.getElementById("pw_confirm_signup");
  NAME.classList.remove("invalid-login");
  CONTAINER.classList.remove("invalid-signup-all");
}


/**
 * Validates the signup email input on blur.
 * If the field is not empty and not a valid email address, adds error styling.
 */
function validateSignupEmailOnBlur() {
  const MAIL = document.getElementById("signup_email");
  const CONTAINER = document.getElementById("pw_confirm_signup");
  if (MAIL.value.trim().length > 0 && !isValidEmail(MAIL.value)) {
    MAIL.classList.add("invalid-login");
    CONTAINER.classList.add("invalid-signup-all");
  }
}


/**
 * Removes error styling from the signup email field as soon as the user focuses it.
 */
function clearSignupEmailErrorOnFocus() {
  const MAIL = document.getElementById("signup_email");
  const CONTAINER = document.getElementById("pw_confirm_signup");
  MAIL.classList.remove("invalid-login");
  CONTAINER.classList.remove("invalid-signup-all");
}


/**
 * Removes all error classes from the signup form fields.
 */
function clearSignupFormErrors() {
  const SIGNUP_NAME = document.getElementById("signup_name");
  const SIGNUP_EMAIL = document.getElementById("signup_email");
  const SIGNUP_PW = document.getElementById("pw_input");
  const SIGNUP_PW_CONFIRM = document.getElementById("pw_input_confirm");
  const SIGNUP_CONTAINER = document.getElementById("pw_confirm_signup");
  const PRIVACY_CONTAINER = document.querySelector(".privacy-content");
  SIGNUP_NAME.classList.remove("invalid-login");
  SIGNUP_EMAIL.classList.remove("invalid-login");
  SIGNUP_PW.classList.remove("invalid-login");
  SIGNUP_PW_CONFIRM.classList.remove("invalid-login");
  SIGNUP_CONTAINER.classList.remove("invalid-signup-all");
  if (PRIVACY_CONTAINER) PRIVACY_CONTAINER.classList.remove("invalid-privacy");
}