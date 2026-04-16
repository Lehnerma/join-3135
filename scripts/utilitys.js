function checkAuth() {
  if (checkUserId(sessionStorage.getItem("user_id"))) {
    window.location.href = "../index.html";
  }
}

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
