import api from "./axios";
import { AdminUsers, userRole } from "./types";

// Gets all registered users
export async function getUsers(): Promise<AdminUsers> {
  const response = await api.get("/admin/users");
  return response.data;
}

// Changes a user's role
export async function editUserRole(
  id: number,
  role: userRole
): Promise<AdminUsers> {
  const response = await api.patch(`/admin/users/${id}/role`, {role});
  return response.data;
}

// Generates a one-time password reset link
export async function resetPassword(id: number): Promise<AdminUsers> {
  const response = await api.post(`/admin/users/${id}/reset-password`);
  return response.data;
}

// Deletes a user account
export async function deleteUser(id: number): Promise<AdminUsers> {
  const response = await api.delete(`/admin/users/${id}`);
  return response.data;
}