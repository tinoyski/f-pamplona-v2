import { Database } from "@/lib/database.types";
import { createServerClient, type CookieOptions } from "@supabase/ssr";
import { cookies } from "next/headers";
import { NextRequest, NextResponse } from "next/server";

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
    data: { session },
  } = await supabase.auth.getSession();

  if (!session) {
    return NextResponse.json({ error: "Not logged in" }, { status: 401 });
  }

  if (session.user) {
    const { error, status, statusText } = await supabase
      .from("admin")
      .update({
        account_status: false,
      })
      .eq("id", session.user.id);

    if (error) {
      console.log(error);
      return NextResponse.json({}, { status, statusText });
    }
  }

  const { error } = await supabase.auth.signOut();

  return NextResponse.json({ error });
}
