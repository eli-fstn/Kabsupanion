import api from "./axios";

// Masterlist
// Gets the official masterlist of the section
export async function getMasterlist() {
  const response = await api.get("/admin/masterlist");
  return response.data
}
// Post a student in masterlist
export async function addToMasterlist(fullName, studentNumber) {
  const response = await api.post(`/admin/masterlist`, { studentNumber, fullName });
  return response.data;
}

// Editing of students' data in masterlist
export async function editMasterlist(studentNumber, fullName) {
  const response = await api.patch(`/admin/masterlist/${studentNumber}`, { fullName });
  return response.data;
}

// Deleting a student from masterlist
export async function deleteMasterlist(studentNumber) {
  const response = await api.delete(`/admin/masterlist/${studentNumber}`);
  return response.data;
}