/**
 * Adds an invalid class to a contact input field.
 * @param {HTMLElement} input
 */
function setContactError(input) {
  input?.classList.add("contact-invalid");
}

/**
 * Adds an invalid-email class to a contact input field.
 * @param {HTMLElement} input
 */
function setContactEmailError(input) {
  input?.classList.add("contact-invalid-email");
}

/**
 * Removes all error classes from a contact input field.
 * @param {HTMLElement} input
 */
function clearContactError(input) {
  input?.classList.remove("contact-invalid", "contact-invalid-email");
}

/**
 * Validates three contact input fields (name, email, phone) by their IDs.
 * Marks invalid inputs with error classes and shows inline error messages via CSS ::after.
 * Used by both create and edit contact dialogs.
 * @param {string} nameId
 * @param {string} emailId
 * @param {string} phoneId
 * @returns {boolean} True if all fields are valid.
 */
function validateContactFields(nameId, emailId, phoneId) {
  const nameInput = document.getElementById(nameId);
  const emailInput = document.getElementById(emailId);
  const phoneInput = document.getElementById(phoneId);
  [nameInput, emailInput, phoneInput].forEach(clearContactError);
  let valid = true;
  if (!nameInput?.value.trim()) {
    setContactError(nameInput);
    valid = false;
  }
  if (!emailInput?.value.trim()) {
    setContactError(emailInput);
    valid = false;
  } else if (!emailInput.checkValidity()) {
    setContactEmailError(emailInput);
    valid = false;
  }
  if (!phoneInput?.value.trim()) {
    setContactError(phoneInput);
    valid = false;
  }
  return valid;
}

/**
 * Sets up live validation for a contact dialog's input fields.
 * Clears errors on input, re-validates email format on blur.
 * @param {string} nameId
 * @param {string} emailId
 * @param {string} phoneId
 */
function initContactValidation(nameId, emailId, phoneId) {
  const nameInput = document.getElementById(nameId);
  const emailInput = document.getElementById(emailId);
  const phoneInput = document.getElementById(phoneId);
  [nameInput, emailInput, phoneInput].forEach((input) => {
    input?.addEventListener("input", () => clearContactError(input));
  });
  emailInput?.addEventListener("blur", () => {
    if (emailInput.value.trim() && !emailInput.checkValidity()) {
      setContactEmailError(emailInput);
    }
  });
}

/**
 * Validates the create contact form. Called before saving a new contact.
 * @returns {boolean}
 */
function addContactCheckInputValue() {
  return validateContactFields("create_name", "create_email", "create_phone");
}

/**
 * Validates the edit contact form. Called before saving an edited contact.
 * @returns {boolean}
 */
function validateEditContactForm() {
  return validateContactFields("edit_name", "edit_email", "edit_phone");
}
