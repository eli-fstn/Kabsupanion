import api from "./axios";
import { Masterlist } from "./types";

// Masterlist
// Gets the official masterlist of the section
export async function getMasterlist() : Promise<Masterlist> {
  const response = await api.get<Masterlist>("/admin/masterlist");
  return response.data
}
// Post a student in masterlist
export async function addToMasterlist(
  fullName: string, 
  studentNumber: number
) : Promise<Masterlist> {
  const response = await api.post<Masterlist>(`/admin/masterlist`, { 
    studentNumber, 
    fullName });
  return response.data;
}

// Editing of students' data in masterlist
export async function editMasterlist(
  studentNumber: number, 
  fullName: string,
) : Promise<Masterlist> {
  const response = await api.patch<Masterlist>(`/admin/masterlist/
    ${studentNumber}`, 
    { fullName });
  return response.data;
}

// Deleting a student from masterlist
export async function deleteMasterlist(
  studentNumber: number
) : Promise<Masterlist> {
  const response = await api.delete<Masterlist>(`/admin/masterlist/
    ${studentNumber}`);
  return response.data;
}