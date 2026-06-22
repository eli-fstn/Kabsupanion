import api from "./axios";
import { Tasks } from "./types";

// Tasklist
// Getting the current tasks list 
export async function getTasks() : Promise<Tasks> {
  const response = await api.get<Tasks>("/tasks");
  return response.data;
}

// For uploading new tasks in the list
export async function uploadTask(
  task: string, 
  subjectId: string, 
  dueDate: string,
) : Promise<Tasks> {
  const response = await api.post<Tasks>("/tasks", {
    title: task,
    subjectId,
    dueDate,
  });
  return response.data;
}

// Editing of tasklist
export async function editTask(
  id: number, 
  title: string, 
  subjectId: string, 
  dueDate: string
) : Promise<Tasks> {
  const response = await api.patch<Tasks>(`/tasks/
    ${id}`, 
    { title, 
      subjectId, 
      dueDate 
    });
  return response.data;
}

// Deleting of tasklist
export async function deleteTask(id: number) : Promise<Tasks> {
  const response = await api.delete<Tasks>(`/tasks/${id}`);
  return response.data;
}