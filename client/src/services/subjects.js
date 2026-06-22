import api from "./axios";

// Subjects
// Uploading subjects
export async function uploadSubject(code, name, description) {
  const response = await api.post("/subjects", {
    code,
    name,
    description
  });

  return response.data;
}

// Get all subjects
export async function getSubjects() {
  const response = await api.get("/subjects");
  return response.data;
}

// Editing of subject
export async function editSubject(id, code, name, description) {
  const response = await api.patch(`/subjects/${id}`, { code, name, description });
  return response.data;
}

// Deleting of subject
export async function deleteSubject(id) {
  const response = await api.delete(`/subjects/${id}`);
  return response.data;
}