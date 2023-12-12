import VerifyCodeEmail from "@/emails/verifyCode";
import { getTransporter } from "@/utils/Transporter";
import { render } from "@react-email/render";
import { NextRequest, NextResponse } from "next/server";
import speakeasy from "@levminer/speakeasy";
import ms from "ms";
import { cookies } from "next/headers";
import { createServerClient, type CookieOptions } from "@supabase/ssr";
import { Database } from "@/lib/database.types";

export async function POST(request: NextRequest) {
  const { email, date } = await request.json();
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

  const { count } = await supabase
    .from("schedule")
    .select("*", { count: "exact", head: true })
    .eq("date", date);

  if (count && count > 0) {
    return NextResponse.json(
      { error: "This time slot is already scheduled!" },
      { status: 400 }
    );
  }

  const step = ms("5m") / 1000; // 300,000ms / 1000ms = 300s

  const secret = speakeasy.generateSecret({ length: 20 });
  const code = speakeasy.totp({
    secret: secret.base32,
    encoding: "base32",
    step,
  });

  const transporter = getTransporter();
  const emailHtml = render(VerifyCodeEmail({ validationCode: code }));
  const { response } = await transporter.sendMail({
    from: process.env.ZOHOMAIL_EMAIL,
    to: email,
    subject: "Confirm your email!",
    html: emailHtml,
  });

  return NextResponse.json({
    secret,
    status: +response.split(" ")[0],
    response: response.split(" ")[1],
    step,
  });
}
