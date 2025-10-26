function isLoggedIn() {
  return !!localStorage.getItem("token");
}

function saveSession(token, user) {
  localStorage.setItem("token", token);
  localStorage.setItem("userEmail", user.email);
}

function logout() {
  localStorage.removeItem("token");
  localStorage.removeItem("userEmail");
  window.location.href = "index.html";
}

async function registerUser(email, password, name) {
  const body = { email, password, name };
  const data = await apiRequest("/register", {
    method: "POST",
    body: JSON.stringify(body),
  });
  saveSession(data.token, data.user);
  return data;
}

async function loginUser(email, password) {
  const body = { email, password };
  const data = await apiRequest("/login", {
    method: "POST",
    body: JSON.stringify(body),
  });
  saveSession(data.token, data.user);
  return data;
}

async function getProfile() {
  return apiRequest("/me", { method: "GET" });
}
