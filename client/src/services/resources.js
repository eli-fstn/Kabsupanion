import api from "./axios";

// Resources
// Check if there's already an existing resources.
export async function getResources() {
  const response = await api.get("/notes");
  return response.data;
}

// Student can upload their own resources to share with anyone.
export async function uploadResource(title, subjectID, uploadedBy, file) {
  const formData = new FormData();
  formData.append("title", title);
  formData.append("subjectID", subjectID);
  formData.append("uploadedBy", uploadedBy);
  formData.append("file", file);

  const response = await api.post("/notes", formData, {
    headers: {
      "Content-Type": "multipart/form-data"
    }
  });
  return response.data;
}