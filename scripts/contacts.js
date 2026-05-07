const contactColors = {
  A: 'rgba(147, 39, 255, 1)',
  B: 'rgba(110, 82, 255, 1)',
  C: 'rgba(252, 113, 255, 1)',
  D: 'rgba(255, 187, 43, 1)',
  E: 'rgba(31, 215, 193, 1)',
  F: 'rgba(70, 47, 138, 1)',
  G: 'rgba(255, 70, 70, 1)',
  H: 'rgba(0, 190, 232, 1)',
  I: 'rgba(42, 61, 89, 1)',
  J: 'rgba(255, 94, 179, 1)',
  K: 'rgba(255, 116, 94, 1)',
  L: 'rgba(255, 163, 94, 1)',
  M: 'rgba(255, 199, 1, 1)',
  N: 'rgba(0, 56, 255, 1)',
  O: 'rgba(195, 255, 43, 1)',
  P: 'rgba(255, 230, 43, 1)',
  Q: 'rgba(255, 70, 150, 1)',
  R: 'rgba(0, 150, 130, 1)',
  S: 'rgba(255, 120, 0, 1)',
  T: 'rgba(0, 120, 255, 1)',
  U: 'rgba(180, 40, 40, 1)',
  V: 'rgba(100, 200, 0, 1)',
  W: 'rgba(150, 0, 255, 1)',
  X: 'rgba(0, 255, 200, 1)',
  Y: 'rgba(200, 150, 0, 1)',
  Z: 'rgba(120, 120, 120, 1)'
};


const alphabet = [
  "A", "B", "C", "D", "E", "F", "G", "H", "I", "J", "K", "L", "M",
  "N", "O", "P", "Q", "R", "S", "T", "U", "V", "W", "X", "Y", "Z"
];


let USERS = [];
let newContact = "";
let editName = '';
let editEmail = '';
let editPhone = '';
let editUserIndex = '';
let user = {};
let userSelectionID = {};
let colorIsAlreadyActive;
const leftContent = document.getElementById('leftContent');
const backArrowButton = document.getElementById('backArrowButton');
const editMenuButton = document.getElementById('editMenuButton');
const editMenuIcon = document.getElementById('editMenuIcon');
const backArrowIcon = document.getElementById('backArrowIcon');
let USERS_URL = "https://join-3135-default-rtdb.europe-west1.firebasedatabase.app/users.json";


function init() {
  getUsers();
  changeButton();
  window.addEventListener('resize', changeButton);
  window.addEventListener('resize', mobileDetails);
}


async function getUsers() {
  const RESPONSE = await fetch(USERS_URL);
  let RESULT = await RESPONSE.json();
  USERS = [];
  for (let key in RESULT) {
    let person = RESULT[key];
    person.firebaseKey = key;
    USERS.push(person);
  }
  sortUserContactList();
}


function sortUserContactList() {
  USERS.sort(function (a, b) {
    let x = a.name.toLowerCase();
    let y = b.name.toLowerCase();
    if (x < y) { return -1; }
    if (x > y) { return 1; }
    return 0;
  })
  addAlphabetTable();
}


function addAlphabetTable() {
  let singleContacts = document.getElementById('singleContacts');
  singleContacts.innerHTML = '';
  for (let i = 0; i < alphabet.length; i++) {
    singleContacts.innerHTML += renderAlphabetTableTpl(alphabet[i]);
  }
  userContectList();
}


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


function getSingleUser(user, i) {
  let initials = getInitials(user.name);
  const firstLetter = user.name.charAt(0).toUpperCase();
  let scolor = contactColors[firstLetter];
  return renderSingleUserHtml(user, i, initials, color);
}


function getInitials(name) {
  let splitNames = name.trim().split(' ');
  let currentInitial = '';
  currentInitial += splitNames[0].charAt(0).toUpperCase();
  if (splitNames.length > 1) {
    currentInitial += splitNames[splitNames.length - 1].charAt(0).toUpperCase();
  }
  return currentInitial;
}


function openContactDialog() {
  const dialogRef = document.getElementById('openNewDialog');
  dialogRef.classList.remove('hide');
  dialogRef.innerHTML = renderHtmlContactDialogTpl();
  dialogRef.showModal();
}


function openEditDialog(editUserIndex, initials, color) {
  const dialogRef = document.getElementById('openNewDialog');
  dialogRef.classList.remove('hide');
  dialogRef.innerHTML = renderHtmlEditContactDialogTpl(editUserIndex, initials, color);
  dialogRef.showModal();
  document.getElementById('editName').value = editName;
  document.getElementById('editEmail').value = editEmail;
  document.getElementById('editPhone').value = editPhone;

}


function addEditContactDetails(editUserIndex) {
  let user = USERS[editUserIndex];
  let initials = getInitials(user.name);
  let firstLetter = user.name.charAt(0).toUpperCase();
  let color = contactColors[firstLetter];
  openEditDialog(editUserIndex, initials, color);
}


function openEditContactDialog() {
  addEditContactDetails(editUserIndex);
}


function closeContactDialog() {
  const dialogRef = document.getElementById('openNewDialog');
  dialogRef.close();
  dialogRef.classList.add('hide');
  const formRef = document.getElementById('formRef');
  if (formRef) {
    formRef.reset();
  }
}


function closeDialogOutsite(event) {
  event.stopPropagation();
}


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


function mobileDetails() {
  const isMobileView = window.innerWidth <= 650 && editUserIndex;

  if (isMobileView) {
    activateMobileView();
  } else {
    deactivateMobileView();
  }
  showDetails();
}


function activateMobileView() {
  leftContent.classList.add('contact-list-off');
  backArrowButton.classList.add('back-arrow-box', 'mobile-buttons-on');
  editMenuButton.classList.add('edit-menu-box', 'btn--addPerson', 'mobile-buttons-on');
  [editMenuIcon, backArrowIcon].forEach(el => el.classList.add('mobile-buttons-on'));
  removeAllBgColors();
}


function deactivateMobileView() {
  leftContent.classList.remove('contact-list-off');
  backArrowButton.classList.remove('back-arrow-box', 'mobile-buttons-on');
  editMenuButton.classList.remove('edit-menu-box', 'btn--addPerson', 'mobile-buttons-on');
  [editMenuIcon, backArrowIcon].forEach(el => el.classList.remove('mobile-buttons-on'));
}


function backToContactlist() {
  leftContent.classList.remove('contact-list-off');
  backArrowButton.classList.remove('back-arrow-box');
  editMenuButton.classList.remove('edit-menu-box', 'btn--addPerson');
}


function removeAllBgColors() {
  const allSelections = document.querySelectorAll('.user-Selection');
  allSelections.forEach(element => {
    element.classList.remove('bg-color-active');
  });
  showDetails();
}


function showDetails() {
  const dialogRef = document.getElementById('contactDetailsDialog');
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
}


function addShowDetails() {
  const initials = getInitials(user.name);
  const firstLetter = user.name.charAt(0).toUpperCase();
  const color = contactColors[firstLetter];
  return renderShowDetailsTpl(user, editUserIndex, initials, color);
}


function createContact() {
  const name = document.getElementById('createName').value;
  const email = document.getElementById('createEmail').value;
  const phone = document.getElementById('createPhone').value;
  const id = Math.floor(1000 + Math.random() * 9000);
  newContact = ({
    name: name,
    email: email,
    phone: phone,
    id: id
  });
  addNewContact(newContact);
}


async function addNewContact(newContact) {
  USERS.push(newContact);
  sortUserContactList();
  const addNewContactUser = USERS.findIndex(user => user.id === newContact.id);
  if (addNewContactUser !== -1) {
    getUserDetails(addNewContactUser);
    scrollToUser(addNewContactUser);
  }
  closeContactDialog();
  syncNewContact(newContact);
  showSuccessBanner();
}


function scrollToUser(index) {
      let id = document.getElementById(index); 
  if (id) {
    id.scrollIntoView({ behavior: 'smooth', block: 'center' });
  }
}

async function syncNewContact(newContact) {
  const response = await fetch(USERS_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(newContact)
  });
  if (response.ok) {
    const RESULT = await response.json();
    const generatedKey = await RESULT.name;
    newContact.firebaseKey = generatedKey;
  }
}


async function deleteContact(index) {
  const userKey = USERS[index].firebaseKey;
  const success = await deleteUserFromDatabase(userKey);
  if (success) {
    document.getElementById(index).remove();
    document.getElementById('contactDetailsDialog').innerHTML = '';
    await getUsers();
    closeContactDialog();
  } else {
    console.error('Fehler beim Löschen des Kontakts');
  }
}


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


function showSuccessBanner() {
  const banner = document.getElementById('contactSuccessOverlay');
  banner.classList.remove('hide-overlay');
  setTimeout(() => {
    banner.classList.add('hide-overlay');
  }, 800);
}


async function saveNewContactData(index) {
  let user = USERS[index];
  let key = user.firebaseKey;
  let updatedData = {
    name: document.getElementById('editName').value,
    email: document.getElementById('editEmail').value,
    phone: document.getElementById('editPhone').value,
  };

  const response = await updateFirebaseContact(key, updatedData);

  if (response.ok) {
    await getUsers();
    await closeEditDialog();
  } else {
    console.error('Fehler beim Updaten');
  }
} 


async function updateFirebaseContact(key, updatedData) {
  return await fetch(`https://join-3135-default-rtdb.europe-west1.firebasedatabase.app/users/${key}.json`, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(updatedData)
  });
}


function getSingleUser(user, i) {
  const initials = getInitials(user.name);
  const firstLetter = user.name.charAt(0).toUpperCase();
  const color = contactColors[firstLetter];
  return renderSingleUserHtml(user, i, initials, color);
}


function changeButton() {
  let addButton = document.getElementById('addButton');
  const isMobile = window.innerWidth <= 650;
  isMobile ? addButton.classList.remove('btn', 'btn--primary', 'add-button-size')
    : addButton.classList.add('btn', 'btn--primary', 'add-button-size');
  isMobile ? addButton.classList.add('btn--addPerson')
    : addButton.classList.remove('btn--addPerson');
}














