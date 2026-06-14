import api from "./axios";

export async function registerAccount(studentNumber, email, password) {
  const response = await api.post("/auth/register", {
    studentNumber,
    email,
    password
  });
  return response.data;
}

// Login
export async function verifyLogin(email, password) {
  const response = await api.post("/auth/login", {
    email,
    password
  });
  return response.data;
}

// Get current user
export async function getMe() {
  const response = await api.get("/auth/me");
  return response.data;
}