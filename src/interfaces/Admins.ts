export interface Admin {
  id?: string;
  first_name: string;
  last_name: string;
  email: string;
  mobile: string;
  account_status: boolean;
  role: string;
  last_login: string;
  last_updated?: string;
  deleted: boolean;
  created_at: string;
  password: string;
}
