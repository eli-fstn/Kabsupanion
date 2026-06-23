import api from "./axios";

// Activity Tracker - Gets the existing activities
export async function getActivity() {
  const response = await api.get("/");
  return response.data;
}