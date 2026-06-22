export interface User {
  id: number;
  studentNumber: number;
  email: string;
  name: string;
  role: "student" | "admin";
}