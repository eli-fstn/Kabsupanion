export interface User {
  id: number;
  studentNumber: number;
  email: string;
  name: string;
  role: "student" | "admin";
}

export interface Masterlist {
  studentNumber: number;
  fullName: string;
  role: "student" | "admin";
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