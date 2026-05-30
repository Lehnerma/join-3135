const contactColors = [
  'rgba(255, 122, 0, 1)', 'rgba(147, 39, 255, 1)', 'rgba(110, 82, 255, 1)',
  'rgba(252, 113, 255, 1)', 'rgba(255, 187, 43, 1)', 'rgba(31, 215, 193, 1)',
  'rgba(70, 47, 138, 1)', 'rgba(255, 70, 70, 1)', 'rgba(0, 190, 232, 1)',
  'rgba(42, 61, 89, 1)', 'rgba(255, 94, 179, 1)', 'rgba(255, 116, 94, 1)',
  'rgba(255, 163, 94, 1)', 'rgba(255, 199, 1, 1)', 'rgba(0, 56, 255, 1)',
  'rgba(195, 255, 43, 1)', 'rgba(255, 230, 43, 1)'
];

const ALPHABET = "ABCDEFGHIJKLMNOPQRSTUVWXYZ".split("");

let users = [];
let editName = '', editEmail = '', editPhone = '', editUserIndex = '';
let user = {};
let colorIsAlreadyActive;
let detailAnimation = false;

const LEFT_CONTENT = document.getElementById('left_content');
const BACK_ARROW_BUTTON = document.getElementById('back_arrow_button');
const EDIT_MENU_BUTTON = document.getElementById('edit_menu_button');
const EDIT_MENU_ICON = document.getElementById('edit_menu_icon');
const BACK_ARROW_ICON = document.getElementById('back_arrow_icon');
const USERS_URL = "https://join-3135-default-rtdb.europe-west1.firebasedatabase.app/users.json";

/**
 * Initializes the application by loading the user.
 */
function init() {
  getUsers();
}

/**
 * Processes a single user from the Firebase response.
 * @param {Object} person - The raw user object from Firebase.
 * @param {string} key - The Firebase key of the user.
 * @returns {Object} The processed user object.
 */
function processUser(person, key) {
  person.firebaseKey = key;
  if (!person.color) {
    person.color = contactColors[Math.floor(Math.random() * contactColors.length)];
    updateFirebaseContact(key, { color: person.color });
  }
  person.phone = person.phone || "";
  return person;
}

/**
 * Loads users from Firebase, fixes missing colors/phones, and saves them to the USERS array.
 * @async
 * @function getUsers
 * @returns {Promise}
 */
async function getUsers() {
  try {
    const RESPONSE = await fetch(USERS_URL);
    const RESULT = await RESPONSE.json();
    users = [];
    for (let key in RESULT) {
      users.push(processUser(RESULT[key], key));
    }
    sortUserContactList();
  } catch (error) {
    console.error("Fehler beim Laden der Kontakte:", error);
  }
}

/**
 * Sorts the global USERS list alphabetically by name.
 */
function sortUserContactList() {
  users.sort((a, b) => a.name.toLowerCase().localeCompare(b.name.toLowerCase()));
  addAlphabetTable();
}

/**
 * Creates the letter containers for the contact list based on the alphabet.
 */
function addAlphabetTable() {
  const SINGLE_CONTACTS = document.getElementById('single_contacts');
  if (!SINGLE_CONTACTS) return;
  SINGLE_CONTACTS.innerHTML = '';
  ALPHABET.forEach(letter => {
    SINGLE_CONTACTS.innerHTML += renderAlphabetTableTpl(letter);
  });
  userContectList();
}

/**
 * Assigns users to the corresponding letter containers in the list.
 */
function userContectList() {
  users.forEach((user, i) => {
    const firstLetter = user.name.trim().charAt(0).toUpperCase();
    const targetContainer = document.getElementById(firstLetter);
    if (targetContainer) {
      targetContainer.innerHTML += getSingleUser(user, i);
    }
  });
}

/**
 * Generates the HTML structure for a single user in the list.
 * @param {Object} user - The user object.
 * @param {number} i - The user's index in the USERS array.
 * @returns {string} The rendered HTML template.
 */
function getSingleUser(user, i) {
  const initials = getInitials(user.name);
  return renderSingleUserHtmlTpl(user, i, initials, user.color);
}

/**
 * Extracts the initials from a name (first and last name).
 * @param {string} name - The full name.
 * @returns {string} The initials in uppercase.
 */
function getInitials(name) {
  if (!name) return "??";
  const splitNames = name.trim().split(' ');
  let initials = splitNames[0].charAt(0).toUpperCase();
  if (splitNames.length > 1) {
    initials += splitNames[splitNames.length - 1].charAt(0).toUpperCase();
  }
  return initials;
}

/**
 * opens the dialog box for creating a new contact.
 */
function openContactDialog() {
  const dialogRef = document.getElementById('open_new_dialog');
  dialogRef.classList.remove('hide');
  dialogRef.innerHTML = renderHtmlContactDialogTpl();
  dialogRef.showModal();
  initContactFormValidation();
}

/**
 * Opens the dialog box for editing an existing contact.
 * @param {number} editUserIndex - The index of the user to be edited.
 * @param {string} initials - The user's initials.
 * @param {string} color - The user's assigned color.
 */
function openEditDialog(index, initials, color) {
  const dialogRef = document.getElementById('open_new_dialog');
  dialogRef.classList.remove('hide');
  dialogRef.innerHTML = renderHtmlEditContactDialogTpl(index, initials, color);
  dialogRef.showModal();
  document.getElementById('edit_name').value = users[index].name;
  document.getElementById('edit_email').value = users[index].email;
  document.getElementById('edit_phone').value = users[index].phone;
}

/**
 * Prepares the data for editing a contact and opens the dialog.
 * @param {number} editUserIndex - The user's index.
 */
function addEditContactDetails(index) {
  const currUser = users[index];
  const initials = getInitials(currUser.name);
  openEditDialog(index, initials, currUser.color);
}

/**
 * Auxiliary function for opening the editing dialog using the global index.
 */
function openEditContactDialog() {
  addEditContactDetails(editUserIndex);
}

/**
 * Closes the contact dialog box and resets the form.
 */
function closeContactDialog() {
  const dialogRef = document.getElementById('open_new_dialog');
  dialogRef.close();
  dialogRef.classList.add('hide');
}

/**
 * Sets the details of the selected user and controls the view (desktop/mobile).
 * @param {number} userIndex - The index of the selected user.
 */
function getUserDetails(userIndex) {
  editUserIndex = userIndex;
  user = users[userIndex];
  if (window.innerWidth >= 651) {
    const userElement = document.getElementById(userIndex);
    colorIsAlreadyActive = userElement ? userElement.classList.contains('bg-color-active') : false;
    removeAllBgColors();
  } else {
    mobileDetails();
  }
}

/**
 * Controls the display of contact details in the mobile view.
 */
function mobileDetails() {
  if (window.innerWidth <= 650) {
    activateMobileView();
  } else {
    deactivateMobileView();
  }
  showDetails();
}

/**
 * Activates the classes for the mobile detail view.
 */
function activateMobileView() {
  LEFT_CONTENT?.classList.add('contact-list-off');
  BACK_ARROW_BUTTON?.classList.add('btn--arrow', 'btn', 'mobile-buttons-on');
  EDIT_MENU_BUTTON?.classList.add('edit-menu-box', 'btn--addPerson', 'mobile-buttons-on');
  [EDIT_MENU_ICON, BACK_ARROW_ICON].forEach(el => el?.classList.add('mobile-buttons-on'));
  removeAllBgColors();
}

/**
 * Disables classes for the mobile detail view.
 */
function deactivateMobileView() {
  LEFT_CONTENT?.classList.remove('contact-list-off');
  BACK_ARROW_BUTTON?.classList.remove('btn--arrow', 'btn', 'mobile-buttons-on');
  EDIT_MENU_BUTTON?.classList.remove('edit-menu-box', 'btn--addPerson', 'mobile-buttons-on');
  [EDIT_MENU_ICON, BACK_ARROW_ICON].forEach(el => el?.classList.remove('mobile-buttons-on'));
}

/**
 * Returns from the detailed view to the contact list in the mobile view.
 */
function backToContactlist() {
  deactivateMobileView();
}

/**
 * Removes the active background marker from all contacts in the list.
 */
function removeAllBgColors() {
  document.querySelectorAll('.user-Selection').forEach(el => el.classList.remove('bg-color-active'));
  showDetails();
}

/**
 * Displays the details of the selected user in the details container.
 */
function showDetails() {
  const dialogRef = document.getElementById('contact_details_dialog');
  if (!dialogRef) return;
  if (window.innerWidth <= 650 || (!colorIsAlreadyActive && window.innerWidth >= 651)) {
    const userElement = document.getElementById(editUserIndex);
    userElement?.classList.add('bg-color-active');
    dialogRef.innerHTML = addShowDetails();
  } else {
    dialogRef.innerHTML = '';
  }
  checkDetailAnimation();
}

/**
 * Checks and disables the detail box's pop-up animation, if necessary.
 */
function checkDetailAnimation() {
  const dialogRef = document.getElementById('contact_details_dialog');
  const detailBox = dialogRef?.querySelector('.contact-details-box');
  if (detailAnimation && detailBox) {
    detailBox.classList.add('no-animation');
    detailAnimation = false;
  }
}

/** *
 * Prepares the HTML template for the detail view.
 * @returns {string} The rendered HTML of the detail view.
 */
function addShowDetails() {
  const initials = getInitials(user.name);
  return renderShowDetailsTpl(user, editUserIndex, initials, user.color);
}

/**
 * Gets values from the input fields and builds a contact object.
 * @returns {Object|null} The contact object or null if fields are empty.
 */
function buildContactObject() {
  const name = document.getElementById('create_name')?.value.trim();
  const email = document.getElementById('create_email')?.value.trim();
  const phone = document.getElementById('create_phone')?.value.trim();
  if (!name || !email) return null;
  return {
    name, email, phone,
    id: Math.floor(1000 + Math.random() * 9000),
    color: contactColors[Math.floor(Math.random() * contactColors.length)]
  };
}

/**
 * Main function to create and save a new contact.
 */
async function createContact() {
  if (!addContactCheckInputValue()) return;
  const contactData = buildContactObject();
  if (!contactData) return;
  const btn = document.getElementById('btn_create_contact');
  if (btn) btn.disabled = true;
  try {
    await addNewContact(contactData);
  } catch (error) {
    console.error("Fehler beim Erstellen des Kontakts:", error);
  } finally {
    if (btn) btn.disabled = false;
  }
}

/**
 * Adds a new contact locally, sorts the list, and synchronizes with the database.
 * @param {Object} newContact - The new contact to be created.
 */
async function addNewContact(newContactData) {
  const firebaseKey = await syncNewContact(newContactData);
  newContactData.firebaseKey = firebaseKey;
  users.push(newContactData);
  sortUserContactList();
  const index = users.findIndex(u => u.id === newContactData.id);
  if (index !== -1) {
    detailAnimation = true;
    getUserDetails(index);
    setTimeout(() => scrollToUser(index), 100);
  }
  closeContactDialog();
  showSuccessBanner();
}

/**
 * Smoothly scrolls to a specific user in the contact list.
 * @param {number} index - The user's index.
 */
function scrollToUser(index) {
  const target = document.getElementById(index);
  const container = document.getElementById('left_content');
  if (!target || !container) return;
  const containerRect = container.getBoundingClientRect();
  const targetRect = target.getBoundingClientRect();
  const offset = targetRect.top - containerRect.top + container.scrollTop - containerRect.height / 2 + targetRect.height / 2;
  container.scrollTo({ top: offset, behavior: 'smooth' });
}

/**
 * Saves the new contact to the Firebase database via POST.
 * @param {Object} newContact - The contact to be saved. 
 */
async function syncNewContact(newContactData) {
  const RESPONSE = await fetch(USERS_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(newContactData)
  });
  if (!RESPONSE.ok) {
    throw new Error(`Kontakt konnte nicht gespeichert werden (${RESPONSE.status})`);
  }
  const RESULT = await RESPONSE.json();
  return RESULT.name;
}

/**
 * Deletes a contact from the list and the database based on its index.
 * @param {number} index - The index of the user to be deleted.
 */
async function deleteContact(index) {
  const userKey = users[index].firebaseKey;
  const success = await deleteUserFromDatabase(userKey);
  if (success) {
    document.getElementById('contact_details_dialog').innerHTML = '';
    await getUsers();
    backToContactlist();
  }
}

/**
 * Sends a DELETE request to Firebase to permanently remove a user.
 * @param {string} firebaseKey - The user's unique Firebase key.
 * @returns {boolean} Returns true if the deletion was successful.
 */
async function deleteUserFromDatabase(firebaseKey) {
  const url = `https://join-3135-default-rtdb.europe-west1.firebasedatabase.app/users/${firebaseKey}.json`;
  try {
    const response = await fetch(url, { method: 'DELETE' });
    return response.ok;
  } catch (error) {
    return false;
  }
}

/**
 * Displays a success banner for a short time after creating a contact.
 */
function showSuccessBanner() {
  const banner = document.getElementById('contact_success_overlay');
  if (!banner) return;
  banner.classList.remove('hide-overlay');
  setTimeout(() => banner.classList.add('hide-overlay'), 2000);
}

/**
 * Gathers the input values from the edit form.
 * @param {string} color - The user's current color.
 * @returns {Object} The updated data object.
 */
function getUpdatedContactData(color) {
  return {
    name: document.getElementById('edit_name').value,
    email: document.getElementById('edit_email').value,
    phone: document.getElementById('edit_phone').value,
    color
  };
}

/**
 * Handles the saving process for an edited contact.
 * @param {number} index - The user's index in the global array.
 */
async function saveNewContactData(index) {
  if (!validateEditContactForm()) return;
  try {
    const firebaseKey = users[index].firebaseKey;
    const response = await updateFirebaseContact(firebaseKey, getUpdatedContactData(users[index].color));
    if (!response.ok) throw new Error(response.status);
    await getUsers();
    const newIndex = users.findIndex(u => u.firebaseKey === firebaseKey);
    if (newIndex !== -1) {
      editUserIndex = newIndex;
      user = users[newIndex];
      showDetails();
      setTimeout(() => scrollToUser(newIndex), 100);
    }
    closeContactDialog();
  } catch (error) {
    console.error("Failed to save contact:", error);
  }
}

/**
 * Sends a PATCH request to Firebase to update a contact's data.
 * @param {string} key - The contact's Firebase key.
 * @param {Object} updatedData - The contact's updated data.
 * @returns {Promise<Response>} The server's response.
 */
async function updateFirebaseContact(key, updatedData) {
  return await fetch(`https://join-3135-default-rtdb.europe-west1.firebasedatabase.app/users/${key}.json`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(updatedData)
  });
}

/**
 * Opens or closes the mobile editing menu.
 * @param {Event} event - The click event.
 */
function openEditMenu(event) {
  event.stopPropagation();
  document.querySelector('.edit-delete-container')?.classList.toggle('show');
}

/**
 * Prevents the dialog from closing when clicking inside the dialog container.
 * If the click is on the backdrop (outside .dialog-container), closes the dialog.
 * @param {Event} event - The click event.
 */
function closeDialogOutsite(event) {
  event.stopPropagation();
}


