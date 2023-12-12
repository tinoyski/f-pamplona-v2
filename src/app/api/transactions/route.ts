import { Database } from "@/lib/database.types";
import { Actions } from "@/utils/Actions";
import { createServerClient, type CookieOptions } from "@supabase/ssr";
import { cookies } from "next/headers";
import { NextRequest, NextResponse } from "next/server";

export async function GET() {
  const cookieStore = cookies();
  const supabase = createServerClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return cookieStore.get(name)?.value;
        },
        set(name: string, value: string, options: CookieOptions) {
          cookieStore.set({ name, value, ...options });
        },
        remove(name: string, options: CookieOptions) {
          cookieStore.set({ name, value: "", ...options });
        },
      },
    }
  );

  const { data, error } = await supabase
    .from("transactions")
    .select()
    .order("created_at", { ascending: false });

  if (error) {
    console.error(error);
    return NextResponse.json([], { status: 500 });
  }

  return NextResponse.json(data);
}

export async function POST(request: NextRequest) {
  const cookieStore = cookies();
  const supabase = createServerClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return cookieStore.get(name)?.value;
        },
        set(name: string, value: string, options: CookieOptions) {
          cookieStore.set({ name, value, ...options });
        },
        remove(name: string, options: CookieOptions) {
          cookieStore.set({ name, value: "", ...options });
        },
      },
    }
  );
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json([], { status: 401 });
  }

  const res = await supabase
    .from("transactions")
    .select("*", { count: "exact", head: true });

  let count = res.count || 0;

  const json = await request.json();

  json.itemCodes.forEach(
    async ({ item, quantity }: { item: string; quantity: number }) => {
      const { data } = await supabase
        .from("items")
        .select("quantity, sold_items")
        .eq("code", item)
        .single();

      if (data !== null) {
        const { error } = await supabase
          .from("items")
          .update({
            quantity: data.quantity - quantity,
            sold_items: (data.sold_items || 0) + quantity,
          })
          .eq("code", item);

        if (error) {
          console.error(error);
          return NextResponse.json([], { status: 500 });
        }
      }
    }
  );

  const transaction = {
    ref: `TRANS-${(count + 1)?.toLocaleString("en-PH", {
      minimumIntegerDigits: 4,
      useGrouping: false,
    })}`,
    additional: `${json.additional} ${json.price}`,
    created_at: new Date().toISOString(),
    cust_address: json.customerAddress,
    cust_name: json.customerName,
    cust_phone: json.customerContactNo,
    discount_amount: json.discountValue,
    discount_percentage: json.discount,
    item_code: json.itemCodes,
    last_updated: new Date().toISOString(),
    mode_of_payment: json.modeOfPayment,
    staff_id: 1,
    total_price: json.grandTotal,
    trans_date: new Date().toISOString(),
    trans_type: json.transactionType,
  };

  const { status, statusText, error } = await supabase
    .from("transactions")
    .insert(transaction);

  if (error) {
    console.error(error);
    return NextResponse.json({ error }, { status: 500 });
  }

  // Activity Log
  if (status === 201) {
    const { error } = await supabase.from("activity_log").insert({
      user_id: user.id,
      role: user.app_metadata.role,
      action: Actions.ADD,
      comment: `Added transaction: ${transaction.ref}`,
    });

    if (error) {
      console.error("ACTIVITY_LOG", error);
    }
  }

  return NextResponse.json({ status, statusText });
}
