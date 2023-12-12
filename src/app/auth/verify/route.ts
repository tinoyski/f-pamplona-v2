import speakeasy from "@levminer/speakeasy";
import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  const { secret, code, step } = await request.json();

  const valid = speakeasy.totp.verify({
    secret: secret.base32,
    encoding: "base32",
    token: code,
    window: 6,
    step,
  });

  return NextResponse.json({ valid }, { status: 200 });
}
