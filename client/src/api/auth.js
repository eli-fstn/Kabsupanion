import api from "./axios";

// Register - TEMPORARY
// export async function register(studentNumber, email, password) {
//   const response = await api.post("/auth/register", {
//     studentNumber,
//     email,
//     password
//   });
//   return response.data; // { user, token }
// }

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