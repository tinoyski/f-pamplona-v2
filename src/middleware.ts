import { createServerClient, type CookieOptions } from "@supabase/ssr";
import { NextResponse } from "next/server";

import type { NextRequest } from "next/server";
import { Database } from "./lib/database.types";

export async function middleware(request: NextRequest) {
  let response = NextResponse.next({
    request: {
      headers: request.headers,
    },
  });
  const supabase = createServerClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return request.cookies.get(name)?.value;
        },
        set(name: string, value: string, options: CookieOptions) {
          request.cookies.set({
            name,
            value,
            ...options,
          });
          response = NextResponse.next({
            request: {
              headers: request.headers,
            },
          });
          response.cookies.set({
            name,
            value,
            ...options,
          });
        },
        remove(name: string, options: CookieOptions) {
          request.cookies.set({
            name,
            value: "",
            ...options,
          });
          response = NextResponse.next({
            request: {
              headers: request.headers,
            },
          });
          response.cookies.set({
            name,
            value: "",
            ...options,
          });
        },
      },
    }
  );

  const { data, error } = await supabase.auth.getSession();

  if (error) {
    console.error(error);
  }

  const user = data.session?.user;

  // if user is signed in and the current path is / redirect the user to /dashboard
  if (user && request.nextUrl.pathname === "/") {
    return NextResponse.redirect(new URL("/admin/dashboard", request.url));
  }

  // if the user is signed in and the role is "STAFF" deny all permissions except inventory
  if (
    user &&
    user.app_metadata.role === "STAFF" &&
    request.nextUrl.pathname !== "/admin/dashboard/inventory"
  ) {
    return NextResponse.redirect(
      new URL("/admin/dashboard/inventory", request.url)
    );
  }

  if (
    user &&
    user.app_metadata.passwordRecovery &&
    request.nextUrl.pathname !== "/update-password"
  ) {
    return NextResponse.redirect(new URL("/update-password", request.url));
  }

  if (
    user &&
    !user.app_metadata.passwordRecovery &&
    request.nextUrl.pathname === "/update-password"
  ) {
    return NextResponse.redirect(new URL("/", request.url));
  }

  // if user is not signed in and the current path is not / redirect the user to /
  if (
    !user &&
    request.nextUrl.pathname !== "/" &&
    request.nextUrl.pathname !== "/update-password"
  ) {
    return NextResponse.redirect(new URL("/", request.url));
  }

  return response;
}

export const config = {
  matcher: ["/", "/admin/:path*", "/update-password"],
};
