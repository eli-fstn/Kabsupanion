import api from "./axios";
import type { User } from "./types";

interface AuthResponse {
  message: string;
  token: string;
  user: User;
}

// Register - Student will register if they don't have an acoount yet.
export async function registerAccount(
  email: string, 
  studentNumber: number, 
  password: string): Promise<AuthResponse> {
  const response = await api.post<AuthResponse>("/auth/register", {
    email,
    studentNumber,
    password
  });
  return response.data;
}

// Login - Posting a request to login
export async function verifyLogin(
  email: string, 
  password: string): Promise<AuthResponse> {
  const response = await api.post<AuthResponse>("/auth/login", {
    email,
    password
  });
  return response.data;
}

// Get user
export async function getMe() : Promise<User> {
  const response = await api.get<User>("/auth/me");
  return response.data;
}