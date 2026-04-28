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
let USERS_URL = "https://join-3135-default-rtdb.europe-west1.firebasedatabase.app/users.json";

let editName = '';
let editEmail = '';
let editPhone = '';
let editUserIndex = '';

function init() {
  getUsers();
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
    singleContacts.innerHTML += renderAlphabetTable(alphabet[i]);
  }
  userContectList();
}

function renderAlphabetTable(alphabet) {
  return /*html*/ `
        <div id="${alphabet}">
        <p class="first-letter">${alphabet}</p>
        <div class="letter-divider"></div> 
        </div>`;
}

function userContectList() {
  for (let i = 0; i < USERS.length; i++) {
    let user = USERS[i];
    let firstLetter = user.name.charAt(0).toUpperCase();
    let targetContainer = document.getElementById(firstLetter);
    if (targetContainer) {
      targetContainer.innerHTML += getSingelUser(user, i);
    }
  }
}

function getSingelUser(user, i) {
  let initials = getInitials(user.name);
  let firstLetter = user.name.charAt(0).toUpperCase();
  let color = contactColors[firstLetter];

  return /*html*/` <div id="${i}" class="user-Selection" onclick="getUserDetails(${i})">
        <div class="initials" style="background-color: ${color}">
           ${initials}         </div>
         <div class="contact-info-text">
            <div class="name">${user.name}</div>
            <p class="email">${user.email}</p>
        </div> `;
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

function openEditDialog() {
  const dialogRef = document.getElementById('openNewDialog');
  dialogRef.classList.remove('hide');
  dialogRef.innerHTML = renderHtmlEditContactDialogTpl(editUserIndex);
  dialogRef.showModal();

  document.getElementById('editName').value = editName;
  document.getElementById('editEmail').value = editEmail;
  document.getElementById('editPhone').value = editPhone;
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
  const userSelectionID = document.getElementById(userIndex);
  const isAlreadyActive = userSelectionID.classList.contains('bg-color-active');
  removeAllBgColors(user, isAlreadyActive, userSelectionID, userIndex);
}

function removeAllBgColors(user, isAlreadyActive, userSelectionID, i) {
  const allSelections = document.querySelectorAll('.user-Selection');
  allSelections.forEach(element => {
    element.classList.remove('bg-color-active');
  });
  showDetails(user, isAlreadyActive, userSelectionID, i);
}

function showDetails(user, isAlreadyActive, userSelectionID, i) {
  const dialogRef = document.getElementById('contactDetailsDialog');
  if (!isAlreadyActive) {
    userSelectionID.classList.add('bg-color-active');
    dialogRef.innerHTML = renderShowDetailsTpl(user, i);
  } else {
    dialogRef.innerHTML = '';
  }
}

function renderShowDetailsTpl(user, i) {
  let initials = getInitials(user.name);
  let firstLetter = user.name.charAt(0).toUpperCase();
  let color = contactColors[firstLetter];
  return /*html*/ `<div class="contact-details-box show">
  <header class="header-contect-details">
    <div class="initials-large" style="background-color:${color}">
      ${initials}
    </div>
    <div class="name-and-buttons">
      <h1 class="h1-contact-details">${user.name}</h1>
      <div class="edit-delete-container">
        <button type="button" class="edit-delete-button" onclick="openEditContactDialog()"><svg class="edit-svg"><use
            href="../assets/img/icons/general/edit-contacts.svg"></use></svg>Edit</button>
        <button type="button" class="edit-delete-button" onclick="deleteContact(${i})"><svg class="delete-svg">
            <use href="../assets/img/icons/general/trash-contact.svg"></use></svg>Delete</button>
      </div>
    </div>
  </header>
  <main class="main-contact-details">
    <div class="contact-information">
      Contact Information</div>
    <ul class="email-and-phone">
      <li class="contact-email">Email</li>
      <li><a href="mailto:${user.email}" class="email">${user.email}</a></li>
      <li class="contact-phone">Phone</li>
      <li>${user.phone}</li>
    </ul>
  </main>
</div>`;
}

function openEditContactDialog() {
  openEditDialog();
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
  const contactIndex = USERS.findIndex(user => user.id === newContact.id);
  sortUserContactList();
  if (contactIndex == -1) {
    getUserDetails(newContact);
  }
  closeContactDialog();
  syncNewContact(newContact);
  showSuccessBanner();
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
  let deleteSelectedUser = USERS[index];
  let deleteUser = deleteSelectedUser.firebaseKey;
  document.getElementById(index).remove();
  const response = await fetch(`https://join-3135-default-rtdb.europe-west1.firebasedatabase.app/users/${deleteUser}.json`, {
    method: 'DELETE'
  });

  if (response.ok) {
    await getUsers();
    document.getElementById('contactDetailsDialog').innerHTML = '';

  } else {
    console.error('Fehler beim Löschen');
  }
  closeContactDialog();
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

  const response = await fetch(`https://join-3135-default-rtdb.europe-west1.firebasedatabase.app/users/${key}.json`, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(updatedData)
  });

  if (response.ok) {
    console.log('Update erfolgreich!');
    await getUsers();
    await closeEditDialog();
  } else {
    console.error('Fehler beim Updaten');
  }
}













