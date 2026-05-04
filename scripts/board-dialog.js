function initBoardTask() {
  document.getElementById('add_task_head').addEventListener('click', openAddTaskDialog);
  document.getElementById('add_task_dialog').addEventListener('click', closeDialogOnBackdropClick);
}


function openAddTaskDialog() {
  document.getElementById('add_task_dialog').showModal();
}

function closeDialogOnBackdropClick(event) {
  if (event.target === this) {
    this.close();
  }
}