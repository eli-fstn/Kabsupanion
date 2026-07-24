import api from "./axios";
import { Subjects } from "./types";

// Get exisiting schedule
export async function getSchedule() : Promise<Subjects> {
  const response = await api.get<Subjects>("/subjects");
  return response.data;
}

// Post a schedule
export async function uploadSchedule(
  id: string,
  day: string,
  startTime: string,
  endTime: string,
  room: string
): Promise<Subjects> {
  const response = await api.post<Subjects>(`/subjects/${id}/schedules`, { day, startTime, endTime, room });
  return response.data;
}

// Edit a schedule
export async function editSchedule(
  id: string,
  scheduleID: string,
  day: string,
  startTime: string,
  endTime: string,
  room: string
) : Promise<Subjects> {
  const response = await api.patch<Subjects>(`/subjects/${id}/schedules/${scheduleID}`, {day, startTime, endTime, room});
  return response.data;
}

// Delete a schedule
export async function deleteSchedule(id: string, scheduleID: string) : Promise<Subjects> {
  const response = await api.delete<Subjects>(`/subjects/${id}/schedules/${scheduleID}`);
  return response.data;
}