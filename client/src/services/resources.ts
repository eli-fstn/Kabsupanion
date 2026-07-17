import api from "./axios";
import { Resources } from "./types";

// Resources
// Check if there's already an existing resources.
export async function getResources() : Promise<Resources> {
  const response = await api.get<Resources>("/notes");
  return response.data;
}

// Student can upload their own resources to share with anyone.
export async function uploadResource(
  title: string, 
  subjectId: string, 
  uploadedBy: string, 
  file: File
) : Promise<Resources> {
  const formData = new FormData();
  formData.append("title", title);
  formData.append("subjectId", subjectId);
  formData.append("uploadedBy", uploadedBy);
  formData.append("file", file);
  const response = await api.post<Resources>("/notes", formData);
  return response.data;
}

// Admins can delete a resources
export async function deleteResources( id: number ) : Promise<Resources>{
  const response = await api.delete<Resources>(`/notes/${id}`)
  return response.data;
}

// Admins shall approve the pending resources
export async function approvedResources( id: number ) : Promise<Resources>{
  const response = await api.patch(`/admin/notes/${id}/approve`);
  return response.data;
}

// Admins can reject resources that aren't academic realated
export async function rejectedResources( id: number ) : Promise<Resources>{
  const response = await api.post(`/admin/notes/${id}/reject`);
  return response.data;
}