/**
 * Gets references to the contact form input containers and inputs.
 * @returns {{nameContainer: HTMLElement|null, emailContainer: HTMLElement|null, phoneContainer: HTMLElement|null, nameInput: HTMLElement|null, emailInput: HTMLElement|null}}
 */
function getContactFormElements() {
  return {
    nameContainer: document.getElementById('add_name'),
    emailContainer: document.getElementById('add_email'),
    phoneContainer: document.getElementById('add_phone'),
    nameInput: document.getElementById('create_name'),
    emailInput: document.getElementById('create_email'),
  };
}

/**
 * Removes all error classes from the contact form.
 */
function clearAllContactErrors() {
  const nameContainer = document.getElementById('add_name');
  const emailContainer = document.getElementById('add_email');
  const phoneContainer = document.getElementById('add_phone');
  if (nameContainer) {
    nameContainer.classList.remove('invalid-login');
  }
  if (emailContainer) {
    emailContainer.classList.remove('invalid-login');
  }
  if (phoneContainer) {
    phoneContainer.classList.remove('invalid-contact-form');
  }
}

/**
 * Sets up live validation events for the contact form.
 * - Removes all errors while the user types in name or email.
 * - Validates the email format when the email field loses focus.
 */
function initContactFormValidation() {
  const els = getContactFormElements();
  const inputs = [els.nameInput, els.emailInput];
  inputs.forEach(input => {
    if (!input) return;
    input.addEventListener('input', clearAllContactErrors);
  });
  if (els.emailInput) {
    els.emailInput.addEventListener('blur', validateContactEmailOnBlur);
    els.emailInput.addEventListener('focus', clearContactEmailError);
  }
}

/**
 * Checks the email format when the email field loses focus.
 * Shows an error if the email is not empty but has an invalid format.
 */
function validateContactEmailOnBlur() {
  const els = getContactFormElements();
  const value = els.emailInput?.value.trim();
  if (value.length > 0 && !els.emailInput.checkValidity()) {
    els.emailContainer?.classList.add('invalid-login');
    els.phoneContainer?.classList.add('invalid-contact-form');
  }
}

/**
 * Removes the email error classes when the email field gets focus.
 */
function clearContactEmailError() {
  const els = getContactFormElements();
  els.emailContainer?.classList.remove('invalid-login');
  els.phoneContainer?.classList.remove('invalid-contact-form');
}

/**
 * Validates the name field. Returns true if there is an error.
 * @param {Object} els - The form elements from getContactFormElements().
 * @param {string} nameVal - The trimmed name value.
 * @returns {boolean} True if the name is invalid.
 */
function validateContactName(els, nameVal) {
  if (!nameVal) {
    els.nameContainer?.classList.add('invalid-login');
    return true;
  }
  return false;
}

/**
 * Validates the email field. Returns true if there is an error.
 * @param {Object} els - The form elements from getContactFormElements().
 * @param {string} emailVal - The trimmed email value.
 * @returns {boolean} True if the email is invalid.
 */
function validateContactEmail(els, emailVal) {
  if (!emailVal) {
    els.emailContainer?.classList.add('invalid-login');
    return true;
  }
  if (!els.emailInput.checkValidity()) {
    els.emailContainer?.classList.add('invalid-login');
    return true;
  }
  return false;
}

/**
 * Validates the contact form before saving.
 * Name and email are required. Shows red borders and an error message if invalid.
 * @returns {boolean} True if the form is valid, false otherwise.
 */
function addContactCheckInputValue() {
  clearAllContactErrors();
  const els = getContactFormElements();
  const nameVal = els.nameInput?.value.trim();
  const emailVal = els.emailInput?.value.trim();
  const nameInvalid = validateContactName(els, nameVal);
  const emailInvalid = validateContactEmail(els, emailVal);
  if (nameInvalid || emailInvalid) {
    els.phoneContainer?.classList.add('invalid-contact-form');
    return false;
  }
  return true;
}