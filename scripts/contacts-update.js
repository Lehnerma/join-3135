/**
 * Gets references to the contact form input containers and inputs.
 * Works for both the create and edit dialog.
 * @returns {{nameContainer: HTMLElement|null, emailContainer: HTMLElement|null, phoneContainer: HTMLElement|null, nameInput: HTMLElement|null, emailInput: HTMLElement|null, phoneInput: HTMLElement|null}}
 */
function getContactFormElements() {
  const nameInput = document.getElementById('create_name') || document.getElementById('edit_name_input');
  const emailInput = document.getElementById('create_email') || document.getElementById('edit_email_input');
  const phoneInput = document.getElementById('create_phone') || document.getElementById('edit_phone_input');
  return {
    nameContainer: document.getElementById('add_name') || document.getElementById('edit_name'),
    emailContainer: document.getElementById('add_email') || document.getElementById('edit_email'),
    phoneContainer: document.getElementById('add_phone') || document.getElementById('edit_phone'),
    nameInput,
    emailInput,
    phoneInput,
  };
}

/**
 * Removes all error classes from the contact form.
 */
function clearAllContactErrors() {
  const containers = [
    document.getElementById('add_name'),
    document.getElementById('edit_name'),
    document.getElementById('add_email'),
    document.getElementById('edit_email'),
    document.getElementById('add_phone'),
    document.getElementById('edit_phone'),
  ];
  containers.forEach(container => {
    if (container) {
      container.classList.remove('invalid-contact-form');
    }
  });
}

/**
 * Sets up live validation events for the contact form.
 * - Removes all errors while the user types in name or email.
 * - Validates the email format when the email field loses focus.
 */
function initContactFormValidation() {
  const els = getContactFormElements();
  const inputs = [els.nameInput, els.emailInput, els.phoneInput];
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
    els.emailContainer?.classList.add('invalid-contact-form');
  }
}

/**
 * Removes the email error classes when the email field gets focus.
 */
function clearContactEmailError() {
  const els = getContactFormElements();
  els.emailContainer?.classList.remove('invalid-contact-form');
}

/**
 * Validates the name field. Returns true if there is an error.
 * @param {Object} els - The form elements from getContactFormElements().
 * @param {string} nameVal - The trimmed name value.
 * @returns {boolean} True if the name is invalid.
 */
function validateContactName(els, nameVal) {
  if (!nameVal) {
    els.nameContainer?.classList.add('invalid-contact-form');
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
    els.emailContainer?.classList.add('invalid-contact-form');
    return true;
  }
  if (!els.emailInput.checkValidity()) {
    els.emailContainer?.classList.add('invalid-contact-form');
    return true;
  }
  return false;
}

/**
 * Validates the contact form before saving.
 * Name, email and phone are required. Shows red borders and an error message if invalid.
 * Only the fields that are actually missing get marked red. Correctly filled fields stay untouched.
 * Works for both the create and edit dialog.
 * @returns {boolean} True if the form is valid, false otherwise.
 */
function addContactCheckInputValue() {
  clearAllContactErrors();
  const els = getContactFormElements();
  const nameVal = (els.nameInput?.value || '').trim();
  const emailVal = (els.emailInput?.value || '').trim();
  const phoneVal = (els.phoneInput?.value || '').trim();
  let hasError = false;
  if (!nameVal) {
    els.nameContainer?.classList.add('invalid-contact-form');
    hasError = true;
  }
  if (!emailVal) {
    els.emailContainer?.classList.add('invalid-contact-form');
    hasError = true;
  } else if (!els.emailInput.checkValidity()) {
    els.emailContainer?.classList.add('invalid-contact-form');
    hasError = true;
  }
  if (!phoneVal) {
    els.phoneContainer?.classList.add('invalid-contact-form');
    hasError = true;
  }
  return !hasError;
}