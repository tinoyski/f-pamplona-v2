import { Database } from "@/lib/database.types";
import { createServerClient, type CookieOptions } from "@supabase/ssr";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";

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

  const transactions = await supabase
    .from("transactions")
    .select("trans_date, total_price, mode_of_payment")
    .order("trans_date", { ascending: true });
  const totalPriceByMonthLastYear = await supabase
    .from("total_price_by_month_last_year")
    .select();
  const totalPriceByMonthThisYear = await supabase
    .from("total_price_by_month_this_year")
    .select();
  const earnings = transactions.data
    ?.filter(
      (value) =>
        new Date(value.trans_date).getFullYear() === new Date().getFullYear()
    )
    .map(({ total_price }) => total_price)
    .reduce((a, b) => a + b, 0);
  const lastYearEarnings = transactions.data
    ?.filter(
      (value) =>
        new Date(value.trans_date).getFullYear() ===
        new Date().getFullYear() - 1
    )
    .map(({ total_price }) => total_price)
    .reduce((a, b) => a + b, 0);
  const items = await supabase
    .from("items")
    .select(
      "name, unit_price, img_url, ordered_items, sold_items, received_items, quantity"
    )
    .eq("archived", false)
    .order("id", { ascending: true });
  const schedule = await supabase
    .from("schedule")
    .select("*")
    .order("date", { ascending: true });

  return NextResponse.json({
    transactions: {
      thisYear: transactions.data?.filter(
        ({ trans_date }) =>
          new Date(trans_date).getFullYear() === new Date().getFullYear()
      ),
      lastYear: transactions.data?.filter(
        ({ trans_date }) =>
          new Date(trans_date).getFullYear() === new Date().getFullYear() - 1
      ),
      totalPriceByMonthLastYear: totalPriceByMonthLastYear.data,
      totalPriceByMonthThisYear: totalPriceByMonthThisYear.data,
      todaySales: transactions.data?.filter(
        (value) =>
          value.trans_date.split("T")[0] ===
          new Date().toISOString().split("T")[0]
      ).length,
      earnings: earnings,
      lastYearEarnings: lastYearEarnings,
      paymentMethods: {
        cash: transactions.data?.filter(
          ({ mode_of_payment }) => mode_of_payment === "CASH"
        ).length,
        gcash: transactions.data?.filter(
          ({ mode_of_payment }) => mode_of_payment === "GCASH"
        ).length,
      },
    },
    items: items.data,
    schedule: schedule.data?.filter(
      ({ date }) => new Date(date).getTime() >= new Date().getTime()
    ),
  });
}
