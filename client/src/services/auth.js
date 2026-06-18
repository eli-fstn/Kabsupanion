import api from "./axios";

// Register - Student will register if they don't have an acoount yet.
export async function registerAccount(email, studentNumber, password) {
  const response = await api.post("/auth/register", {
    studentNumber,
    email,
    password
  });
  return response.data;
}

// Login - Posting a request to login
export async function verifyLogin(email, password) {
  const response = await api.post("/auth/login", {
    email,
    password
  });
  return response.data;
}

// Tasklist - Getting the current tasks list 
export async function getTasks() {
  const response = await api.get("/");
  return response.data;
}

// Resources
// Check if there's already an existing resources.
export async function getResources() {
  const response = await api.get("/");
  return response.data;
}

// Student can upload their own resources to share with anyone.
export async function uploadResource(title, subject, uploadedBy, fileURL) {
  const response = await api.post("/", { title, subject, uploadedBy, fileURL });
  return response.data;
}

// Activity Tracker - Gets the existing activities
export async function getActivity() {
  const response = await api.get("/");
  return response.data;
}

// Masterlist - Gets the official masterlist of the section
export async function getMasterlist() {
  const response = await api.get("/");
  return response.data
}

// Get current user - validate if the user is actually them.
export async function getMe() {
  const response = await api.get("/auth/me");
  return response.data;
}