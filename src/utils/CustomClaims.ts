import { Database } from "@/lib/database.types";
import { SupabaseClient } from "@supabase/supabase-js";

export class CustomClaims {
  private supabase: SupabaseClient;

  constructor(supabase: SupabaseClient<Database>) {
    this.supabase = supabase;
  }

  public get_claims = async (uid: string) => {
    const { data, error } = await this.supabase.rpc("get_claims", { uid });
    return { data, error };
  };

  public get_claim = async (uid: string, claim: string) => {
    const { data, error } = await this.supabase.rpc("get_claim", {
      uid,
      claim,
    });
    return { data, error };
  };

  public get_my_claims = async () => {
    const { data, error } = await this.supabase.rpc("get_my_claims");
    return { data, error };
  };

  public get_my_claim = async (claim: string) => {
    const { data, error } = await this.supabase.rpc("get_my_claim", {
      claim,
    });
    return { data, error };
  };

  public set_claim = async (uid: string, claim: string, value: object) => {
    const { data, error } = await this.supabase.rpc("set_claim", {
      uid,
      claim,
      value,
    });
    return { data, error };
  };

  public delete_claim = async (uid: string, claim: string) => {
    const { data, error } = await this.supabase.rpc("delete_claim", {
      uid,
      claim,
    });
    return { data, error };
  };
}
