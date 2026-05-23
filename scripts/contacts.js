const contactColors = [
  'rgba(255, 122, 0, 1)',
  'rgba(147, 39, 255, 1)',
  'rgba(110, 82, 255, 1)',
  'rgba(252, 113, 255, 1)',
  'rgba(255, 187, 43, 1)',
  'rgba(31, 215, 193, 1)',
  'rgba(70, 47, 138, 1)',
  'rgba(255, 70, 70, 1)',
  'rgba(0, 190, 232, 1)',
  'rgba(42, 61, 89, 1)',
  'rgba(255, 94, 179, 1)',
  'rgba(255, 116, 94, 1)',
  'rgba(255, 163, 94, 1)',
  'rgba(255, 199, 1, 1)',
  'rgba(0, 56, 255, 1)',
  'rgba(195, 255, 43, 1)',
  'rgba(255, 230, 43, 1)'
];


const alphabet = [
  "A", "B", "C", "D", "E", "F", "G", "H", "I", "J", "K", "L", "M",
  "N", "O", "P", "Q", "R", "S", "T", "U", "V", "W", "X", "Y", "Z"
];


USERS = [];
let newContact = "";
let editName = '';
let editEmail = '';
let editPhone = '';
let editUserIndex = '';
let user = {};
let userSelectionID = {};
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
 * Loads users from Firebase, fixes missing colors/phones, and saves them to the USERS array.
 * * @async
 * @function getUsers
 * @returns {Promise}
 */
async function getUsers() {
    const RESPONSE = await fetch(USERS_URL);
  const RESULT = await RESPONSE.json();
  USERS = [];
  for (let key in RESULT) {
    const PERSON = RESULT[key];
    PERSON.firebaseKey = key;
    PERSON.color ??= contactColors[Math.floor(Math.random() * contactColors.length)]
    PERSON.phone ??= PERSON.phone = "";
    updateFirebaseContact(key, { color: PERSON.color }, { phone: PERSON.email });
    USERS.push(PERSON)
  }
  sortUserContactList();
  await loadUsers();
}


/**
 * Sorts the global USERS list alphabetically by name.
 */
function sortUserContactList() {
  USERS.sort(function (a, b) {
    const X = a.name.toLowerCase();
    const Y = b.name.toLowerCase();
    if (X < Y) { return -1; }
    if (X > Y) { return 1; }
    return 0;
  })
  addAlphabetTable();
}


/**
 * Creates the letter containers for the contact list based on the alphabet.
 */
function addAlphabetTable() {
  const SINGLE_CONTACTS = document.getElementById('single_contacts');
  SINGLE_CONTACTS.innerHTML = '';
  for (let i = 0; i < alphabet.length; i++) {
    SINGLE_CONTACTS.innerHTML += renderAlphabetTableTpl(alphabet[i]);
  }
  userContectList();
}


/**
 * Assigns users to the corresponding letter containers in the list.
 */
function userContectList() {
  for (let i = 0; i < USERS.length; i++) {
    let user = USERS[i];
    let firstLetter = user.name.charAt(0).toUpperCase();
    let targetContainer = document.getElementById(firstLetter);
    if (targetContainer) {
      targetContainer.innerHTML += getSingleUser(user, i);
    }
  }
}


/**
 * Generates the HTML structure for a single user in the list.
 * @param {Object} user - The user object.
 * @param {number} i - The user's index in the USERS array.
 * @returns {string} The rendered HTML template.
 */
function getSingleUser(user, i) {
  let initials = getInitials(user.name);
  const firstLetter = user.name.charAt(0).toUpperCase();
  return renderSingleUserHtmlTpl(user, i, initials, user.color);
}


/**
 * Extracts the initials from a name (first and last name).
 * @param {string} name - The full name.
 * @returns {string} The initials in uppercase.
 */
function getInitials(name) {
  let splitNames = name.trim().split(' ');
  let currentInitial = '';
  currentInitial += splitNames[0].charAt(0).toUpperCase();
  if (splitNames.length > 1) {
    currentInitial += splitNames[splitNames.length - 1].charAt(0).toUpperCase();
  }
  return currentInitial;
}


/**
 * opens the dialog box for creating a new contact.
 */
function openContactDialog() {
  const dialogRef = document.getElementById('open_new_dialog');
  dialogRef.classList.remove('hide');
  dialogRef.innerHTML = renderHtmlContactDialogTpl();
  dialogRef.showModal();
}


/**
 * Opens the dialog box for editing an existing contact.
 * @param {number} editUserIndex - The index of the user to be edited.
 * @param {string} initials - The user's initials.
 * @param {string} color - The user's assigned color.
 */
function openEditDialog(editUserIndex, initials, color) {
  const dialogRef = document.getElementById('open_new_dialog');
  dialogRef.classList.remove('hide');
  dialogRef.innerHTML = renderHtmlEditContactDialogTpl(editUserIndex, initials, color);
  dialogRef.showModal();
  document.getElementById('edit_name').value = editName;
  document.getElementById('edit_email').value = editEmail;
  document.getElementById('edit_phone').value = editPhone;
}


/**
 * Prepares the data for editing a contact and opens the dialog.
 * @param {number} editUserIndex - The user's index.
 */
function addEditContactDetails(editUserIndex) {
  let user = USERS[editUserIndex];
  let initials = getInitials(user.name);
  let firstLetter = user.name.charAt(0).toUpperCase();
  openEditDialog(editUserIndex, initials, user.color);
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
  const formRef = document.getElementById('form_ref');
  if (formRef) {
    formRef.reset();
  }
}


/**
 * Prevents the dialog from closing when clicking on the dialog's interior.
 * @param {Event} event - The click event.
 */
function closeDialogOutsite(event) {
  event.stopPropagation();
}


/**
 * Sets the details of the selected user and controls the view (desktop/mobile).
 * @param {number} userIndex - The index of the selected user.
 */
function getUserDetails(userIndex) {
  editUserIndex = userIndex;
  user = USERS[userIndex];
  editName = user.name;
  editEmail = user.email;
  editPhone = user.phone;
  if (window.innerWidth >= 651) {
    userSelectionID = document.getElementById(userIndex);
    colorIsAlreadyActive = userSelectionID.classList.contains('bg-color-active');
    removeAllBgColors();
  } else {
    mobileDetails();
  }
}


/**
 * Controls the display of contact details in the mobile view.
 */
function mobileDetails() {
  let index = editUserIndex;
  index = true;
  const isMobileView = window.innerWidth <= 650 && index;
  if (isMobileView) {
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
  LEFT_CONTENT.classList.add('contact-list-off');
  BACK_ARROW_BUTTON.classList.add('btn--arrow', 'btn', 'mobile-buttons-on');
  EDIT_MENU_BUTTON.classList.add('edit-menu-box', 'btn--addPerson', 'mobile-buttons-on');
  [EDIT_MENU_ICON, BACK_ARROW_ICON].forEach(el => el.classList.add('mobile-buttons-on'));
  removeAllBgColors();
}


/**
 * Disables classes for the mobile detail view.
 */
function deactivateMobileView() {
  LEFT_CONTENT.classList.remove('contact-list-off');
  BACK_ARROW_BUTTON.classList.remove('btn--arrow', 'btn', 'mobile-buttons-on');
  EDIT_MENU_BUTTON.classList.remove('edit-menu-box', 'btn--addPerson', 'mobile-buttons-on');
  [EDIT_MENU_ICON, BACK_ARROW_ICON].forEach(el => el.classList.remove('mobile-buttons-on'));
}


/**
 * Returns from the detailed view to the contact list in the mobile view.
 */
function backToContactlist() {
  LEFT_CONTENT.classList.remove('contact-list-off');
  BACK_ARROW_BUTTON.classList.remove('btn--arrow', 'btn');
  EDIT_MENU_BUTTON.classList.remove('edit-menu-box', 'btn--addPerson');
}


/**
 * Removes the active background marker from all contacts in the list.
 */
function removeAllBgColors() {
  const allSelections = document.querySelectorAll('.user-Selection');
  allSelections.forEach(element => {
    element.classList.remove('bg-color-active');
  });
  showDetails();
}


/**
 * Displays the details of the selected user in the details container.
 */
function showDetails() {
  const dialogRef = document.getElementById('contact_details_dialog');
  if (!colorIsAlreadyActive && window.innerWidth >= 651) {
    userSelectionID.classList.add('bg-color-active');
    dialogRef.innerHTML = addShowDetails();
  }
  else if (window.innerWidth <= 650) {
    dialogRef.innerHTML = addShowDetails();
  }
  else {
    dialogRef.innerHTML = '';
  }
  checkDetailAnimation();
}


/**
 * Checks and disables the detail box's pop-up animation, if necessary.
 */
function checkDetailAnimation() {
  const dialogRef = document.getElementById('contact_details_dialog');
  const detailBox = dialogRef.querySelector('.contact-details-box');
  if (detailAnimation && detailBox) {
    if (detailBox) {
      detailBox.classList.add('no-animation');
    }
    detailAnimation = false;
  }
}


/** *
 * Prepares the HTML template for the detail view.
 * @returns {string} The rendered HTML of the detail view.
 */
function addShowDetails() {
  const initials = getInitials(user.name);
  const firstLetter = user.name.charAt(0).toUpperCase();
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
    name: name,
    email: email,
    phone: phone,
    id: Math.floor(1000 + Math.random() * 9000),
    color: contactColors[Math.floor(Math.random() * contactColors.length)]
  };
}


/**
 * Main function to create and save a new contact.
 */
async function createContact() {
  const btn = document.getElementById('btn_create_contact');
  const contactData = buildContactObject();
  if (!contactData) return;
  if (btn) btn.disabled = true;
  try {
    newContact = contactData; // Sets the global variable from your code
    await addNewContact(newContact);
  } catch (error) {
    console.error("Error creating contact:", error);
    if (btn) btn.disabled = false;
  }
}


/**
 * Adds a new contact locally, sorts the list, and synchronizes with the database.
 * @param {Object} newContact - The new contact to be created.
 */
async function addNewContact(newContact) {
  USERS.push(newContact);
  sortUserContactList();
  const addNewContactUser = USERS.findIndex(user => user.id === newContact.id);
  if (addNewContactUser !== -1) {
    detailAnimation = true;
    getUserDetails(addNewContactUser);
    scrollToUser(addNewContactUser);
  }
  closeContactDialog();
  syncNewContact(newContact);
  showSuccessBanner();
}


/**
 * Smoothly scrolls to a specific user in the contact list.
 * @param {number} index - The user's index.
 */
function scrollToUser(index) {
  let id = document.getElementById(index);
  if (id) {
    id.scrollIntoView({ behavior: 'smooth', block: 'center' });
  }
}


/**
 * Saves the new contact to the Firebase database via POST.
 * @param {Object} newContact - The contact to be saved. 
 */
async function syncNewContact(newContact) {
  const RESPONSE = await fetch(USERS_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(newContact)
  });
  if (RESPONSE.ok) {
    const RESULT = await RESPONSE.json();
    const generatedKey = await RESULT.name;
    newContact.firebaseKey = generatedKey;
  }
}


/**
 * Deletes a contact from the list and the database based on its index.
 * @param {number} index - The index of the user to be deleted.
 */
async function deleteContact(index) {
  const userKey = USERS[index].firebaseKey;
  const success = await deleteUserFromDatabase(userKey);
  if (success) {
    document.getElementById(index).remove();
    document.getElementById('contact_details_dialog').innerHTML = '';
    await getUsers();
    closeContactDialog();
    backToContactlist();
  } else {
    console.error('Fehler beim Löschen des Kontakts');
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
    console.error("Fetch-Fehler:", error);
    return false;
  }
}


/**
 * Displays a success banner for a short time after creating a contact.
 */
function showSuccessBanner() {
  const banner = document.getElementById('contact_success_overlay');
  banner.classList.remove('hide-overlay');
  setTimeout(() => {
    banner.classList.add('hide-overlay');
  }, 900);
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
 * Closes the edit view by checking available functions.
 */
function closeEditView() {
  typeof closeEditDialog === 'function' ? closeEditDialog() : closeContactDialog();
}


/**
 * Handles the saving process for an edited contact.
 * @param {number} index - The user's index in the global array.
 */
async function saveNewContactData(index) {
  const btn = document.getElementById('btn_edit_save_contact');
  if (btn) btn.disabled = true;
  try {
    const user = USERS[index];
    const response = await updateFirebaseContact(user.firebaseKey, getUpdatedContactData(user.color));
        if (response.ok) {
      await getUsers();
      closeEditView();
    } else if (btn) {
      btn.disabled = false;
    }
  } catch (error) {
    console.error('Update failed:', error);
    if (btn) btn.disabled = false;
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
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(updatedData)
  });
}


/**
 * Closes the mobile menu (Edit/Delete menu).
 */
function closeMobileMenu() {
  const menu = document.querySelector('.edit-delete-container');
  if (menu) {
    menu.classList.remove('show');
  }
}


/**
 * Opens or closes the mobile editing menu.
 * @param {Event} event - The click event.
 */
function openEditMenu(event) {
  event.stopPropagation();
  const menu = document.querySelector('.edit-delete-container');
  menu.classList.toggle('show');
}
