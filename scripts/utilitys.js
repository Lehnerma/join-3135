function checkAuth() {
  if (!sessionStorage.getItem("user_id")) {
    window.location.href = "../index.html";
  }
}

checkAuth();
