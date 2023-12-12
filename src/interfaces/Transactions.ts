import { Item } from "./Items";

export interface Transactions {
  id?: number;
  ref: string;
  item_code: string[];
  total_price: number;
  discount_percentage: number;
  discount_amount: number;
  additional: string | null;
  mode_of_payment: string;
  cust_address: string;
  cust_name: string;
  cust_phone: string;
  trans_type: string;
  staff_id: number;
  trans_date: string;
  created_at?: Date;
  cancelled: boolean;
  last_updated?: Date;
}

export interface TransactionItem {
  item: Item;
  quantity: number;
}