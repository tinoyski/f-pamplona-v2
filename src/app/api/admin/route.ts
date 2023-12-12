import { Database } from "@/lib/database.types";
import { Actions } from "@/utils/Actions";
import { CustomClaims } from "@/utils/CustomClaims";
import { createServerClient, type CookieOptions } from "@supabase/ssr";
import { AdminUserAttributes, createClient } from "@supabase/supabase-js";
import { cookies } from "next/headers";
import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  const requestUrl = new URL(request.url);
  const email = requestUrl.searchParams.get("email");

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
  const customClaims = new CustomClaims(supabase);

  let result: any;
  if (email) {
    const supabaseAdmin = createClient<Database>(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_KEY!
    );

    const { count, error } = await supabaseAdmin
      .from("admin")
      .select("*", { count: "exact", head: true })
      .eq("email", email);

    if (error) {
      console.error(error);
      return NextResponse.json([], { status: 500 });
    }

    result = count;
  } else {
    const { data, error } = await supabase
      .from("admin")
      .select()
      .eq("deleted", false)
      .order("account_status", { ascending: false });

    if (error) {
      console.error(error);
      return NextResponse.json([], { status: 500 });
    }

    result = await Promise.all(
      data.map(async (admin) => {
        const { data, error } = await customClaims.get_claim(admin.id, "role");

        if (error) {
          console.error(error);
          return NextResponse.json([], { status: 500 });
        }

        return { ...admin, role: data };
      })
    );
  }

  return NextResponse.json(result);
}

export async function POST(request: NextRequest) {
  const formData = await request.json();

  // Server Client for user session
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

  // Super Service Client for admin purposes
  const supabaseAdmin = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_KEY!
  );

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ status: 401, statusText: "Unauthorized" });
  }

  // [1] Create new admin/staff in the auth table along with app and user metadata
  const { data, error } = await supabaseAdmin.auth.admin.createUser({
    email: formData.email,
    password: formData.password,
    email_confirm: true,
    user_metadata: {
      first_name: formData.first_name,
      last_name: formData.last_name,
      mobile: `+63 ${formData.mobile}`,
    },
    app_metadata: {
      claims_admin: formData.role === "ADMIN",
      role: formData.role,
      passwordRecovery: true,
    },
  });

  let res = {
    status: 0,
    statusText: "",
  };
  // [2] Add admin/staff to admin table
  if (data.user) {
    const { status, statusText } = await supabaseAdmin.from("admin").insert([
      {
        id: data.user.id,
        email: formData.email,
        first_name: formData.first_name,
        last_name: formData.last_name,
        mobile: `+63 ${formData.mobile}`,
      },
    ]);

    res = {
      status,
      statusText,
    };
  }

  if (error) {
    console.error(error);
    return NextResponse.json([], {
      status: error.status,
      statusText: error.message,
    });
  }

  // Activity Log
  if (res.status === 201) {
    const { error } = await supabaseAdmin.from("activity_log").insert({
      user_id: user.id,
      role: user.app_metadata.role,
      action: Actions.ADD,
      comment: `Added user: ${formData.email}`,
    });

    if (error) {
      console.error("ACTIVITY_LOG", error);
    }
  }

  return NextResponse.json(res);
}

export async function PUT(request: NextRequest) {
  const formData = await request.json();
  const requestUrl = new URL(request.url);
  const id = requestUrl.searchParams.get("id")!;

  // Server Client for user session
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

  // Super Service Client for admin purposes
  const supabaseAdmin = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_KEY!
  );
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ status: 401, statusText: "Unauthorized" });
  }

  let data: AdminUserAttributes = {
    email: formData.email,
    user_metadata: {
      first_name: formData.first_name,
      last_name: formData.last_name,
      mobile: `+63 ${formData.mobile}`,
    },
    app_metadata: {
      role: formData.role,
      claims_admin: formData.role === "ADMIN",
    },
  };

  if (formData.password) {
    data = {
      ...data,
      password: formData.password,
    };
  }

  const { error } = await supabaseAdmin.auth.admin.updateUserById(id, data);

  if (error) {
    console.log(error);
    return NextResponse.json({ status: 500, statusText: error.message });
  }

  const { status, statusText } = await supabaseAdmin
    .from("admin")
    .update({
      email: formData.email,
      first_name: formData.first_name,
      last_name: formData.last_name,
      mobile: `+63 ${formData.mobile}`,
      last_updated: new Date().toISOString(),
    })
    .eq("id", id);

  // Activity Log
  if (status === 204) {
    const { error } = await supabaseAdmin.from("activity_log").insert({
      user_id: user.id,
      role: user.app_metadata.role,
      action: Actions.UPDATE,
      comment: `Updated user: ${formData.email}`,
    });

    if (error) {
      console.error("ACTIVITY_LOG", error);
    }
  }

  return NextResponse.json({ status, statusText });
}

export async function DELETE(request: NextRequest) {
  const requestUrl = new URL(request.url);
  const id = requestUrl.searchParams.get("id")!;
  const email = requestUrl.searchParams.get("email")!;

  // Server Client for user session
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

  // Super Service Client for admin purposes
  const supabaseAdmin = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_KEY!
  );

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ status: 401, statusText: "Unauthorized" });
  }

  const { error } = await supabaseAdmin.auth.admin.deleteUser(id);

  if (error) {
    console.error(error);
    return NextResponse.json({ status: 500, statusText: error.message });
  }

  // Activity Log
  const { error: actLogErr } = await supabaseAdmin.from("activity_log").insert({
    user_id: user.id,
    role: user.app_metadata.role,
    action: Actions.DELETE,
    comment: `Deleted user: ${email}`,
  });

  if (actLogErr) {
    console.error("ACTIVITY_LOG", error);
  }

  return NextResponse.json({ status: 200, statusText: "OK" });
}
