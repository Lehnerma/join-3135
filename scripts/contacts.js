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

let URL = "";
let contacts = {};

function init() {
  initBtn();
  getContacts();
}

function getBoxId(id) {
  const BOX_ID = document.getElementById(id);
  return BOX_ID;
}


function initBtn() {
  const ADD_BTN = document.getElementById("add");
  const EDIT_BTN = document.getElementById("edit");
  ADD_BTN.addEventListener("click", () => openDialog("add_contact"));
  // EDIT_BTN.addEventListener("click", () => openDialog("edit_contact"));
}

function generateId() {
  return (Date.now().toString(36) + Math.random().toString(36)).substring(0, 6);
}

function openDialog(el) {
  const DIALOG_REF = document.getElementById(el);
  DIALOG_REF.showModal();
}

// class contact {
//   constructor(data = {}) {
//     this.id = data.id || this.generateId();
//     this.firstName = data.firstName || "";
//     this.lastName = data.lastName || "";
//     this.email = data.email || "";
//     this.phone = data.phone || "";

//     this.createdAt = data.createdAt || new Date();
//     this.updatedAt = new Date();
//   }
// }

async function getContacts() {
  URL = "https://join-3135-default-rtdb.europe-west1.firebasedatabase.app/contacts.json";
  let response = await fetch(URL);
  contacts = await response.json();
  
  contactList();
}


function contactList() {

  

  
};





