// Touch drag-and-drop for the Kanban board (active below 900 px).
// Reuses DRAG_ID / DRAG_HEIGHT / DRAG_OLD_STATUS from board.js.

const TOUCH_THRESHOLD = 8;

let touchGhost = null;
let touchOffsetX = 0;
let touchOffsetY = 0;
let touchStartX = 0;
let touchStartY = 0;
let touchDragActive = false;
let touchLastColumn = null;
let touchTaskEl = null;

function initTouchDrag() {
  document.addEventListener("touchstart", onTaskTouchStart, { passive: true });
  document.addEventListener("touchmove", onTaskTouchMove, { passive: false });
  document.addEventListener("touchend", onTaskTouchEnd, { passive: true });
}

function onTaskTouchStart(ev) {
  if (window.innerWidth >= 900) return;
  const task = ev.target.closest(".task");
  if (!task) return;

  const touch = ev.touches[0];
  touchStartX = touch.clientX;
  touchStartY = touch.clientY;
  touchDragActive = false;
  touchTaskEl = task;

  const id = parseInt(task.dataset.id, 10);
  const rect = task.getBoundingClientRect();
  touchOffsetX = touch.clientX - rect.left;
  touchOffsetY = touch.clientY - rect.top;

  DRAG_HEIGHT = task.offsetHeight;
  DRAG_ID = id;
  const allTasks = JSON.parse(sessionStorage.tasks);
  DRAG_OLD_STATUS = allTasks.find((el) => el.id === id)?.status;
}

function onTaskTouchMove(ev) {
  if (window.innerWidth >= 900 || DRAG_ID == null) return;

  const touch = ev.touches[0];
  const dx = touch.clientX - touchStartX;
  const dy = touch.clientY - touchStartY;

  if (!touchDragActive) {
    if (Math.hypot(dx, dy) < TOUCH_THRESHOLD) return;
    touchDragActive = true;
    touchGhost = createTouchGhost(touchTaskEl, touch);
  }

  ev.preventDefault();
  moveTouchGhost(touch);
  updateTouchDropTarget(touch.clientX, touch.clientY);
}

function onTaskTouchEnd(ev) {
  if (!touchDragActive || !touchGhost) {
    resetTouchState();
    return;
  }

  const touch = ev.changedTouches[0];
  touchGhost.style.visibility = "hidden";
  const el = document.elementFromPoint(touch.clientX, touch.clientY);
  removeTouchGhost();

  const column = el?.closest(".kanban-column");
  if (column) {
    const status = getStatusFromColumn(column);
    if (status) taskDragDrop(status);
  }

  cleanupTouchColumns();
  resetTouchState();
}

function createTouchGhost(task, touch) {
  const ghost = task.cloneNode(true);
  ghost.style.cssText = `
    position: fixed;
    z-index: 9999;
    pointer-events: none;
    opacity: 0.85;
    width: ${task.offsetWidth}px;
    left: ${touch.clientX - touchOffsetX}px;
    top: ${touch.clientY - touchOffsetY}px;
    transform: rotate(2deg) scale(1.03);
    box-shadow: 0 8px 24px rgba(0,0,0,0.25);
    list-style: none;
    border-radius: 24px;
  `;
  document.body.appendChild(ghost);
  return ghost;
}

function moveTouchGhost(touch) {
  touchGhost.style.left = `${touch.clientX - touchOffsetX}px`;
  touchGhost.style.top = `${touch.clientY - touchOffsetY}px`;
}

function updateTouchDropTarget(x, y) {
  touchGhost.style.visibility = "hidden";
  const el = document.elementFromPoint(x, y);
  touchGhost.style.visibility = "visible";

  const column = el?.closest(".kanban-column");
  if (!column) return;

  if (touchLastColumn && touchLastColumn !== column) {
    clearTouchColumnHighlight(touchLastColumn);
  }
  touchLastColumn = column;

  const list = column.querySelector("ul");
  if (!list) return;
  list.querySelector(".no-task")?.style.setProperty("display", "none");

  let placeholder = list.querySelector(".drag-placeholder");
  if (!placeholder) {
    placeholder = document.createElement("li");
    placeholder.classList.add("drag-placeholder");
    if (DRAG_HEIGHT) placeholder.style.height = `${DRAG_HEIGHT}px`;
  }

  const afterEl = getDragAfterElement(list, y);
  afterEl ? list.insertBefore(placeholder, afterEl) : list.appendChild(placeholder);
}

function clearTouchColumnHighlight(column) {
  const list = column.querySelector("ul");
  if (!list) return;
  list.querySelector(".drag-placeholder")?.remove();
  list.querySelector(".no-task")?.style.removeProperty("display");
}

function getStatusFromColumn(column) {
  const attr = column.getAttribute("ondrop");
  return attr?.match(/taskDragDrop\('(.+?)'\)/)?.[1] ?? null;
}

function removeTouchGhost() {
  touchGhost?.remove();
  touchGhost = null;
}

function cleanupTouchColumns() {
  document.querySelectorAll(".drag-placeholder").forEach((p) => p.remove());
  document.querySelectorAll(".kanban-column .no-task").forEach((el) => el.style.removeProperty("display"));
}

function resetTouchState() {
  touchDragActive = false;
  touchLastColumn = null;
  touchTaskEl = null;
  DRAG_ID = null;
}
