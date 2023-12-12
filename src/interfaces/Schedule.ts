export enum ScheduleStatus {
  TODO = "TODO",
  DONE = "DONE",
  CANCELLED = "CANCELLED",
}

export interface Schedule {
  id: number;
  staff: string;
  customer: {
    name: string;
    email: string;
    contact_no: string;
  };
  address: string;
  ac_type: string;
  ac_unit: number | null;
  service: string;
  quantity: number;
  date: string;
  status: ScheduleStatus;
  created_at: Date;
}

export interface ScheduleResult {
  todo: Schedule[];
  done: Schedule[];
  cancelled: Schedule[];
}
