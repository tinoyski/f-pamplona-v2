import { Admin } from "./Admins";

export interface ActivityLog {
  action: string;
  comment: string | null;
  created_at: string;
  id: number;
  role: string;
  user_id: string | null; 
  user: Admin;
}

export enum ActivityActions {
  ADD = "ADD",
  UPDATE = "UPDATE",
  DELETE = "DELETE",
}