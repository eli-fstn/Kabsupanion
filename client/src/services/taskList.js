import api from "./axios";

// Tasklist
// Getting the current tasks list 
export async function getTasks() {
  const response = await api.get("/tasks");
  return response.data;
}

// For uploading new tasks in the list
export async function uploadTask(task, subjectId, dueDate) {
  const response = await api.post("/tasks", {
    title: task,
    subjectId,
    dueDate,
  });
  return response.data;
}

// Editing of tasklist
export async function editTask(id, title, subjectId, dueDate) {
  const response = await api.patch(`/tasks/${id}`, { title, subjectId, dueDate });
  return response.data;
}

// Deleting of tasklist
export async function deleteTask(id) {
  const response = await api.delete(`/tasks/${id}`);
  return response.data;
}