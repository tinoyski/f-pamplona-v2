export interface ItemValues {
  name: string;
  unit_price: number;
  description?: string;
  img_url?: string;
  ordered_items: number;
  quantity: number;
  physical_count: number;
  received_items: number;
  remarks: string;
}

export interface Item {
  id?: number;
  name: string;
  code: string;
  description: string;
  unit_price: number;
  ordered_items: number;
  quantity: number;
  physical_count: number;
  received_items: number;
  sold_items: number;
  date_added?: Date;
  last_updated?: Date;
  img_url?: string;
  remarks: string;
}

export enum ITEM_CONDITION {
  GOOD = "GOOD_CONDITION",
  DEFECT = "DEFECT",
}
