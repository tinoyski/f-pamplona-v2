import type { Database } from "@/lib/database.types";
import { Actions } from "@/utils/Actions";
import { createServerClient, type CookieOptions } from "@supabase/ssr";
import { cookies } from "next/headers";
import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  const requestUrl = new URL(request.url);
  const archived = Boolean(requestUrl.searchParams.get("archived"));
  const id = requestUrl.searchParams.get("code");

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

  let result = {};

  if (id) {
    const { data, error } = await supabase
      .from("items")
      .select()
      .eq("code", id)
      .single();

    if (error) {
      console.error(error);
      return NextResponse.json([], { status: 500 });
    }

    result = data;
  } else {
    const { data, error } = await supabase
      .from("items")
      .select()
      .eq("archived", archived)
      .order("id", { ascending: true })

    if (error) {
      console.error(error);
      return NextResponse.json([], { status: 500 });
    }

    result = data;
  }

  return NextResponse.json(result);
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
    .from("items")
    .select("*", { count: "exact", head: true });

  let count = res.count || 0;

  const { item } = await request.json();

  item.code = `${new Date().getFullYear()}${(count + 1)?.toLocaleString(
    "en-PH",
    {
      minimumIntegerDigits: 4,
      useGrouping: false,
    }
  )}`;

  // console.log(json);

  const { status, statusText } = await supabase.from("items").insert(item);

  // Activity Log
  if (status === 201) {
    const { error } = await supabase.from("activity_log").insert({
      user_id: user.id,
      role: user.app_metadata.role,
      action: Actions.ADD,
      comment: `Added item: ${item.name}`,
    });

    if (error) {
      console.error("ACTIVITY_LOG", error);
    }
  }

  return NextResponse.json({ status, statusText });
}

export async function PUT(request: NextRequest) {
  const requestUrl = new URL(request.url);
  const id = Number(requestUrl.searchParams.get("id"));

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

  const { item } = await request.json();

  item.last_updated = new Date().toISOString();

  const { error, status, statusText } = await supabase
    .from("items")
    .update(item)
    .eq("id", id);

  if (error) {
    console.error(error);
  }

  // Activity Log
  if (status === 204) {
    const { error } = await supabase.from("activity_log").insert({
      user_id: user.id,
      role: user.app_metadata.role,
      action: Actions.UPDATE,
      comment: `Updated item: ${item.name}`,
    });

    if (error) {
      console.error("ACTIVITY_LOG", error);
    }
  }

  return NextResponse.json({ status, statusText });
}

export async function DELETE(request: NextRequest) {
  const requestUrl = new URL(request.url);
  const id = Number(requestUrl.searchParams.get("id"));

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

  const { error, status, statusText } = await supabase
    .from("items")
    .update({ archived: true })
    .eq("id", id);

  if (error) {
    console.error(error);
  }

  // Activity Log
  if (status === 204) {
    const { error } = await supabase.from("activity_log").insert({
      user_id: user.id,
      role: user.app_metadata.role,
      action: Actions.DELETE,
      comment: `Deleted item: ${id}`,
    });

    if (error) {
      console.error("ACTIVITY_LOG", error);
    }
  }

  return NextResponse.json({ status, statusText });
}
