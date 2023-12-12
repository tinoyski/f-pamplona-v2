import { Database } from "@/lib/database.types";
import { createServerClient, type CookieOptions } from "@supabase/ssr";
import { cookies } from "next/headers";
import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  const formData = await request.json();
  const email = String(formData.email);
  const password = String(formData.password);
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

  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (data.user) {
    const { user } = data;
    const { error, status, statusText } = await supabase
      .from("admin")
      .update({
        last_login: new Date().toISOString(),
        account_status: true,
      })
      .eq("id", user.id);

    if (error) {
      console.log(error);
      return NextResponse.json({}, { status, statusText });
    }
  }

  return NextResponse.json({ user: data.user, error }, { status: 200 });
}
