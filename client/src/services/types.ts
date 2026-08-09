export type userRole = "student" | "admin";

export interface User {
  id: number;
  studentNumber: number;
  email: string;
  name: string;
  role: userRole;
}

export interface Masterlist {
  studentNumber: number;
  fullName: string;
  role: userRole;
  status: string;
}

export interface Tasks {
  id: number;
  subjectID: string;
  title: string;
  description: string;
  dueDate: string;
}

export interface Subjects {
  id: number;
  code: string;
  name: string;
  description: string;
  day: string;
  startTime: number;
  endTime: number;
  room: string;
}

export interface Resources {
  id: number;
  subjectID: string;
  title: string;
  description: string;
  file: File | null;
}

export interface AdminUsers {
  id: number;
  name: string;
  email: string;
  role: userRole;
}