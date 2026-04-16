/**
 * Check if the User can enter the side or not
 */
function checkAuth() {
  if (checkUserId(sessionStorage.getItem("user_id"))) {
    window.location.href = "../index.html";
  }
}

/**
 *Function to check if the user id is available in the backend
 * @param {string} id
 * @returns Bool if the id is true ore false
 */
async function checkUserId(id) {
  try {
    const RESPONS = await fetch("https://join-3135-default-rtdb.europe-west1.firebasedatabase.app/users.json");
    if (!RESPONS.ok) {
      throw new Error(RESPONS.status);
    }
    const RESULT = RESPONS.json;
    const ALLIDS = Object.values(RESULT).map((items) => items.id);
    return Object.values(RESULT).some((item) => item.id === id);
  } catch (er) {
    console.error(er);
  }
}

checkAuth();
