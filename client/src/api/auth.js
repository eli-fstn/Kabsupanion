import api from "./axios";

// Register
export async function registerAccount(email, studentNumber, password) {
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

// Tasklist
export async function getTasks() {
  const response = await api.get("/");
  return response.data;
}

// Resources
export async function getResources() {
  const response = await api.get("/");
  return response.data;
}

export async function uploadResource(title, subject, uploadedBy, fileURL) {
  const response = await api.post("/", { title, subject, uploadedBy, fileURL });
  return response.data;
}

// Masterlist
// export async function getMasterList(task, subject, dueDate) {
//   const response = await api.get("", {
//     task,
//     subject,
//     dueDate
//   });
//   return response.data;
// }

// Get current user
export async function getMe() {
  const response = await api.get("/auth/me");
  return response.data;
}