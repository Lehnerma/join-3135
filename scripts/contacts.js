function init() {
  initBtn();
}

function getBoxId(id) {
  const BOX_ID = document.getElementById(id);
  return BOX_ID;
}

function initBtn() {
  const ADD_BTN = document.getElementById("add");
  const EDIT_BTN = document.getElementById("edit");
  ADD_BTN.addEventListener("click", () => openDialog("add_contact"));
  EDIT_BTN.addEventListener("click", () => openDialog("edit_contact"));
}

function generateId() {
  return Date.now().toString(36) + Math.random().toString(36);
}

function openDialog(el) {
  const DIALOG_REF = document.getElementById(el);
  DIALOG_REF.showModal();
}

class contact {
  constructor(data = {}) {
    this.id = data.id || this.generateId();
    this.firstName = data.firstName || "";
    this.lastName = data.lastName || "";
    this.email = data.email || "";
    this.phone = data.phone || "";

    this.createdAt = data.createdAt || new Date();
    this.updatedAt = new Date();
  }
}
