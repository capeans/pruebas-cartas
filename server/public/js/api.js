const API_BASE = "http://localhost:3000/api";

function getToken() {
  return localStorage.getItem("token") || "";
}

async function apiRequest(path, options = {}) {
  const headers = options.headers || {};
  headers["Content-Type"] = "application/json";

  const token = getToken();
  if (token) {
    headers["Authorization"] = "Bearer " + token;
  }

  const res = await fetch(\`\${API_BASE}\${path}\`, {
    ...options,
    headers,
  });

  if (!res.ok) {
    const errText = await res.text();
    throw new Error(errText || "Error de red");
  }

  return res.json();
}
