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
  let contactList = document.getElementById('contactList');
  contactList.innerHTML = '';
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
    <div class="letter-divider">${firstLetter}</div>
    <div id="${userID}" class="userSelection" onclick="showDetails(${i})">
        <div class="initials" style="background-color: ${color}">
            ${initials}
        </div>
        <div class="contact-info-text">
            <div class="name">${user.name}</div>
            <a href="mailto:${user.email}" class="email">${user.email}</a>
        </div>
    </div>`;
}


function getInitials(name) {
  let splitNames = name.split(' ');
  console.log(splitNames);
  let currentInitial = '';
  currentInitial += splitNames[0].charAt(0).toUpperCase();
  if (splitNames.length > 1) {
    currentInitial += splitNames[splitNames.length - 1].charAt(0).toUpperCase();
  }
  return currentInitial;
}


function openContactDialog() {
  const dialogRef = document.getElementById("openNewDialog");
  // dialogRef.classList.remove('hide');
  dialogRef.innerHTML = renderHtmlContactDialog();
  dialogRef.showModal();

}




function closeContactDialog() {
  const dialogRef = document.getElementById("openNewDialog");
  dialogRef.close();
  // dialogRef.classList.add('hide');
  const formRef = document.getElementById('formRef');

  if (formRef) {
    formRef.reset();
  }
}

function closeDialogOutsite(event) {
  event.stopPropagation();
}


function showDetails(index) {
  let user = userContent[index];
  const dialogRef = document.getElementById('openNewDialog');
  
  dialogRef.innerHTML = renderShowDetailsTpl(user);
  dialogRef.showModal();


}


function renderShowDetailsTpl(user) {

  let initials = getInitials(user.name);
  let firstLetter = user.name.charAt(0).toUpperCase();
  let color = contactColors[firstLetter];
  return /*html*/ `
   <div class="contact-details" onclick="closeDialogOutsite(event)" >
            <header class="header-contect-details">
             <div class="initials-large" style="background-color: ${color}">
            ${initials}
            </div>
           <nav class="nav-contect-details">
          <div class="name-and-buttons">
             <h1 class="h1-contact-details">${user.name}</h1>
            <button type="button"><img src="../assets/img/icons/general/edit-contacts.svg" alt="edit contact">Edit</button>
            <button type="button"><img src="../assets/img/icons/general/trash-contact-.svg" alt="contacts delete">Delete</button>
          </div>
        </nav>
      </header>
      <main class="main-contact-details">
      
      <div class="contact-information"></div>
      
      
      
      
      </main>
    </div>`;

}
