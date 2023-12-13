export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      activity_log: {
        Row: {
          action: string
          comment: string | null
          created_at: string
          id: number
          role: string
          user_id: string | null
        }
        Insert: {
          action: string
          comment?: string | null
          created_at?: string
          id?: number
          role: string
          user_id?: string | null
        }
        Update: {
          action?: string
          comment?: string | null
          created_at?: string
          id?: number
          role?: string
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "activity_log_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "admin"
            referencedColumns: ["id"]
          }
        ]
      }
      admin: {
        Row: {
          account_status: boolean | null
          created_at: string | null
          deleted: boolean | null
          email: string
          first_name: string
          id: string
          last_login: string | null
          last_name: string
          last_updated: string | null
          mobile: string
        }
        Insert: {
          account_status?: boolean | null
          created_at?: string | null
          deleted?: boolean | null
          email: string
          first_name: string
          id: string
          last_login?: string | null
          last_name: string
          last_updated?: string | null
          mobile: string
        }
        Update: {
          account_status?: boolean | null
          created_at?: string | null
          deleted?: boolean | null
          email?: string
          first_name?: string
          id?: string
          last_login?: string | null
          last_name?: string
          last_updated?: string | null
          mobile?: string
        }
        Relationships: [
          {
            foreignKeyName: "admin_id_fkey"
            columns: ["id"]
            isOneToOne: true
            referencedRelation: "users"
            referencedColumns: ["id"]
          }
        ]
      }
      items: {
        Row: {
          archived: boolean | null
          code: string
          date_added: string
          description: string
          id: number
          img_url: string | null
          last_updated: string | null
          name: string
          ordered_items: number | null
          physical_count: number | null
          quantity: number
          received_items: number | null
          remarks: string | null
          sold_items: number | null
          unit_price: number
        }
        Insert: {
          archived?: boolean | null
          code: string
          date_added?: string
          description: string
          id?: number
          img_url?: string | null
          last_updated?: string | null
          name: string
          ordered_items?: number | null
          physical_count?: number | null
          quantity: number
          received_items?: number | null
          remarks?: string | null
          sold_items?: number | null
          unit_price: number
        }
        Update: {
          archived?: boolean | null
          code?: string
          date_added?: string
          description?: string
          id?: number
          img_url?: string | null
          last_updated?: string | null
          name?: string
          ordered_items?: number | null
          physical_count?: number | null
          quantity?: number
          received_items?: number | null
          remarks?: string | null
          sold_items?: number | null
          unit_price?: number
        }
        Relationships: []
      }
      schedule: {
        Row: {
          ac_type: string
          ac_unit: number | null
          address: string
          created_at: string
          customer: Json
          date: string
          id: number
          quantity: number | null
          service: string
          status: string
        }
        Insert: {
          ac_type: string
          ac_unit?: number | null
          address: string
          created_at?: string
          customer: Json
          date: string
          id?: number
          quantity?: number | null
          service: string
          status?: string
        }
        Update: {
          ac_type?: string
          ac_unit?: number | null
          address?: string
          created_at?: string
          customer?: Json
          date?: string
          id?: number
          quantity?: number | null
          service?: string
          status?: string
        }
        Relationships: [
          {
            foreignKeyName: "schedule_ac_unit_fkey"
            columns: ["ac_unit"]
            isOneToOne: false
            referencedRelation: "items"
            referencedColumns: ["id"]
          }
        ]
      }
      transactions: {
        Row: {
          ac_type: string | null
          additional: string | null
          created_at: string
          cust_address: string
          cust_name: string
          cust_phone: string
          discount_amount: number
          discount_percentage: number
          id: number
          item_code: string[] | null
          last_updated: string
          mode_of_payment: string
          quantity: number | null
          ref: string
          service: string | null
          service_price: string | null
          staff_id: number
          total_price: number
          trans_date: string
          trans_type: string | null
        }
        Insert: {
          ac_type?: string | null
          additional?: string | null
          created_at: string
          cust_address: string
          cust_name: string
          cust_phone: string
          discount_amount: number
          discount_percentage: number
          id?: number
          item_code?: string[] | null
          last_updated: string
          mode_of_payment: string
          quantity?: number | null
          ref: string
          service?: string | null
          service_price?: string | null
          staff_id: number
          total_price: number
          trans_date?: string
          trans_type?: string | null
        }
        Update: {
          ac_type?: string | null
          additional?: string | null
          created_at?: string
          cust_address?: string
          cust_name?: string
          cust_phone?: string
          discount_amount?: number
          discount_percentage?: number
          id?: number
          item_code?: string[] | null
          last_updated?: string
          mode_of_payment?: string
          quantity?: number | null
          ref?: string
          service?: string | null
          service_price?: string | null
          staff_id?: number
          total_price?: number
          trans_date?: string
          trans_type?: string | null
        }
        Relationships: []
      }
      verified_emails: {
        Row: {
          created_at: string
          email: string
          id: number
        }
        Insert: {
          created_at?: string
          email: string
          id?: number
        }
        Update: {
          created_at?: string
          email?: string
          id?: number
        }
        Relationships: []
      }
    }
    Views: {
      total_price_by_month: {
        Row: {
          month: number | null
          total_price: number | null
        }
        Relationships: []
      }
      total_price_by_month_last_year: {
        Row: {
          month: number | null
          total_price: number | null
        }
        Relationships: []
      }
      total_price_by_month_this_year: {
        Row: {
          month: number | null
          total_price: number | null
        }
        Relationships: []
      }
    }
    Functions: {
      delete_claim: {
        Args: {
          uid: string
          claim: string
        }
        Returns: string
      }
      get_claim: {
        Args: {
          uid: string
          claim: string
        }
        Returns: Json
      }
      get_claims: {
        Args: {
          uid: string
        }
        Returns: Json
      }
      get_my_claim: {
        Args: {
          claim: string
        }
        Returns: Json
      }
      get_my_claims: {
        Args: Record<PropertyKey, never>
        Returns: Json
      }
      is_claims_admin: {
        Args: Record<PropertyKey, never>
        Returns: boolean
      }
      set_claim: {
        Args: {
          uid: string
          claim: string
          value: Json
        }
        Returns: string
      }
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

export type Tables<
  PublicTableNameOrOptions extends
    | keyof (Database["public"]["Tables"] & Database["public"]["Views"])
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof (Database[PublicTableNameOrOptions["schema"]]["Tables"] &
        Database[PublicTableNameOrOptions["schema"]]["Views"])
    : never = never
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? (Database[PublicTableNameOrOptions["schema"]]["Tables"] &
      Database[PublicTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : PublicTableNameOrOptions extends keyof (Database["public"]["Tables"] &
      Database["public"]["Views"])
  ? (Database["public"]["Tables"] &
      Database["public"]["Views"])[PublicTableNameOrOptions] extends {
      Row: infer R
    }
    ? R
    : never
  : never

export type TablesInsert<
  PublicTableNameOrOptions extends
    | keyof Database["public"]["Tables"]
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicTableNameOrOptions["schema"]]["Tables"]
    : never = never
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? Database[PublicTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : PublicTableNameOrOptions extends keyof Database["public"]["Tables"]
  ? Database["public"]["Tables"][PublicTableNameOrOptions] extends {
      Insert: infer I
    }
    ? I
    : never
  : never

export type TablesUpdate<
  PublicTableNameOrOptions extends
    | keyof Database["public"]["Tables"]
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicTableNameOrOptions["schema"]]["Tables"]
    : never = never
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? Database[PublicTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : PublicTableNameOrOptions extends keyof Database["public"]["Tables"]
  ? Database["public"]["Tables"][PublicTableNameOrOptions] extends {
      Update: infer U
    }
    ? U
    : never
  : never

export type Enums<
  PublicEnumNameOrOptions extends
    | keyof Database["public"]["Enums"]
    | { schema: keyof Database },
  EnumName extends PublicEnumNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicEnumNameOrOptions["schema"]]["Enums"]
    : never = never
> = PublicEnumNameOrOptions extends { schema: keyof Database }
  ? Database[PublicEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : PublicEnumNameOrOptions extends keyof Database["public"]["Enums"]
  ? Database["public"]["Enums"][PublicEnumNameOrOptions]
  : never
