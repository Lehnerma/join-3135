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
  T: 'rgba(0, 120, 255, 1)',
  U: 'rgba(180, 40, 40, 1)',
  V: 'rgba(100, 200, 0, 1)',
  W: 'rgba(150, 0, 255, 1)',
  X: 'rgba(0, 255, 200, 1)',
  Y: 'rgba(200, 150, 0, 1)',
  Z: 'rgba(120, 120, 120, 1)'
};

let USERS = [];
let userContent = [];

function init() {
  getUsers();
  getSavedContact();
}

async function getUsers() {
  const USERS_URL = "https://join-3135-default-rtdb.europe-west1.firebasedatabase.app/users.json";
  const RESPONSE = await fetch(USERS_URL);
  const RESULT = await RESPONSE.json();
  USERS = Object.values(RESULT);
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
  UserContectList();
  }

function UserContectList() {
 
  contactList.innerHTML = '';
  userContent = [];
  for (let i = 0; i < USERS.length; i++) {
    userContent.push(USERS[i]);
    contactList.innerHTML += renderContectListTpl(USERS[i], i);
  }
  console.log(userContent);
}



function renderContectListTpl(user, i) {
  
  let firstLetter = user.name.charAt(0).toUpperCase();
  let userID = user.id
  let initials = getInitials(user.name);
  let color = contactColors[firstLetter];
  
  

  return /*html*/ `
        <div id="singleContacts" class="single-contacts">
        <p class="first-letter">${firstLetter}</p>
        <div class="letter-divider"></div> 
        </div>
              <div id="${userID}" class="user-Selection" onclick="getUserDetails(${i})">
        <div class="initials" style="background-color: ${color}">
            ${initials}
        </div>
        <div class="contact-info-text">
            <div class="name">${user.name}</div>
            <p class="email">${user.email}</p>
        </div>
    </div>
    `;

}

// if (color == initials[0].charAt(0).toUpperCase()){
//     let singleContacts = document.getElementById('singleContacts');
//   }
//   else{
 

//   }






function getInitials(name) {
  let splitNames = name.split(' ');
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

function showEditDialog() {
  const dialogRef = document.getElementById('openNewDialog');
  dialogRef.classList.remove('hide');
  dialogRef.innerHTML = renderHtmlEditContactDialogTpl();
  dialogRef.showModal();

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
  let user = userContent[userIndex];
  console.log(user);

  let currentUserID = user.id;
  const userSelectionID = document.getElementById(currentUserID);
  const isAlreadyActive = userSelectionID.classList.contains('bg-color-active');
  removeAllBgColors(user, isAlreadyActive, userSelectionID);
}


function removeAllBgColors(user, isAlreadyActive, userSelectionID) {
  const allSelections = document.querySelectorAll('.user-Selection');
  allSelections.forEach(element => {
    element.classList.remove('bg-color-active');
  });
  showDetails(user, isAlreadyActive, userSelectionID);
}


function showDetails(user, isAlreadyActive, userSelectionID) {
  const dialogRef = document.getElementById('contactDetailsDialog');
  if (!isAlreadyActive) {
    userSelectionID.classList.add('bg-color-active');
    dialogRef.innerHTML = renderShowDetailsTpl(user);
  } else {
    dialogRef.innerHTML = '';
  }
}


function renderShowDetailsTpl(user) {
  let initials = getInitials(user.name);
  let firstLetter = user.name.charAt(0).toUpperCase();
  let color = contactColors[firstLetter];
  return /*html*/ `<div class="contact-details-box">
  <header class="header-contect-details">
    <div class="initials-large" style="background-color:${color}">
      ${initials}
    </div>
    <div class="name-and-buttons">
      <h1 class="h1-contact-details">${user.name}</h1>
      <div class="edit-delete-container">
        <button type="button" class="edit-delete-button" onclick="openEditContactDialog()"><svg class="edit-svg"><use
            href="../assets/img/icons/general/edit-contacts.svg"></use></svg>Edit</button>
        <button type="button" class="edit-delete-button" onclick="deleteContact(${user.id})"><svg class="delete-svg">
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
  showEditDialog();
}


function createContact() {
  const name = document.getElementById('createName').value;
  const email = document.getElementById('createEmail').value;
  const phone = document.getElementById('createPhone').value;
  const id = Math.floor(1000 + Math.random() * 9000);
  const newContact = ({
    name: name,
    email: email,
    phone: phone,
    id: id
  });
  addNewContact(newContact);
}


function addNewContact(newContact) {
  USERS.push(newContact);
  const contactIndex = userContent.findIndex(user => user.id === newContact.id);
  sortUserContactList();
  
      
  if (contactIndex) {
    getUserDetails(newContact);
  }
  closeContactDialog();
  syncNewContact(newContact);
  localStorageNewcontact();
}


function localStorageNewcontact() {
  localStorage.setItem('tempContact'.JSON.stringify(newContact));
  }


  function getSavedContact() {
  const saved = localStorage.getItem('tempContact');
  return saved ? JSON.parse(saved) : null;
}


async function syncNewContact(newContact) {
  const response = await fetch('https://join-3135-default-rtdb.europe-west1.firebasedatabase.app/users.json', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(newContact)
  });
  if (response.ok) {
    console.log('Kontakt erfolgreich synchronisiert!');

  } else {
    console.error('Fehler beim Speichern');
  }
}



function deleteContact(deleteUser) {
localStorage.removeItem('userContent');
getUsers();
deleteContact();
}

async function deleteContact(deleteUser) {
  const response = await fetch(`https://join-3135-default-rtdb.europe-west1.firebasedatabase.app/users/${deleteUser}.json`, {
    method: 'DELETE'
  });

  if (response.ok) {
    console.log('Kontakt erfolgreich gelöscht!');
  } else {
    console.error('Fehler beim Löschen');
  }
}






function saveEditContact() {

}
