/**
 * Check if the User can enter the side or not
 */
async function checkAuth() {
  const ID = sessionStorage.getItem("user_id");
  const BOOL = await checkUserId(ID);
  if (BOOL) {
    console.log("true");
  } else {
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
    const RESULT = await RESPONS.json();
    const ALLIDS = Object.values(RESULT).map((items) => items.id);
    return Object.values(RESULT).some((item) => item.id === id);
  } catch (er) {
    console.error(er);
  }
}
checkAuth();
