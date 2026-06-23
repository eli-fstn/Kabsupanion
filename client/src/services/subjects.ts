import api from "./axios";
import { Subjects } from "./types";

// Subjects
// Uploading subjects
export async function uploadSubject(
  code: string, 
  name: string, 
  description: string
) : Promise<Subjects> {
  const response = await api.post<Subjects>("/subjects", {
    code,
    name,
    description
  });

  return response.data;
}

// Get all subjects
export async function getSubjects() : Promise<Subjects> {
  const response = await api.get<Subjects>("/subjects");
  return response.data;
}

// Editing of subject
export async function editSubject(
  id: number, 
  code: string, 
  name: string, 
  description: string
) : Promise<Subjects> {
  const response = await api.patch<Subjects>(`/subjects/${id}`, { code, name, description });
  return response.data;
}

// Deleting of subject
export async function deleteSubject(id: number) : Promise<Subjects> {
  const response = await api.delete<Subjects>(`/subjects/${id}`);
  return response.data;
}