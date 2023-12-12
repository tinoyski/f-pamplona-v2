import { Database } from "@/lib/database.types";
import { render } from "@react-email/render";
import { createServerClient, type CookieOptions } from "@supabase/ssr";
import { cookies } from "next/headers";
import { NextRequest, NextResponse } from "next/server";
import ConfirmationEmail from "@/emails/confirmationEmail";
import { getTransporter } from "@/utils/Transporter";
import _ from "lodash";
import { Schedule, ScheduleStatus } from "@/interfaces/Schedule";
import CancellationEmail from "@/emails/cancelEmail";

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

  const todoData = await supabase
    .from("schedule")
    .select("*")
    .eq("status", ScheduleStatus.TODO)
    .order("date", { ascending: true });

  if (todoData.error) {
    console.error(todoData.error);
    return NextResponse.json([], { status: 500 });
  }

  const doneData = await supabase
    .from("schedule")
    .select("*")
    .eq("status", ScheduleStatus.DONE);

  if (doneData.error) {
    console.error(doneData.error);
    return NextResponse.json([], { status: 500 });
  }

  const cancelledData = await supabase
    .from("schedule")
    .select("*")
    .eq("status", ScheduleStatus.CANCELLED);

  if (cancelledData.error) {
    console.error(cancelledData.error);
    return NextResponse.json([], { status: 500 });
  }

  const data = {
    todo: todoData.data || [],
    done: doneData.data || [],
    cancelled: cancelledData.data || [],
  };

  return NextResponse.json(data);
}

export async function POST(request: NextRequest) {
  const formData = await request.json();
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
    .eq("date", new Date(formData.date).toISOString());

  if (count && count > 0) {
    return NextResponse.json(
      { error: "This time slot is already scheduled!" },
      { status: 400 }
    );
  }

  const { error, status, statusText } = await supabase.from("schedule").insert({
    ac_type: formData.ac_type,
    address: `${formData.address1} ${formData.address2}`,
    customer: {
      name: formData.name,
      email: formData.email,
      contact_no: formData.contact,
    },
    date: new Date(formData.date).toISOString(),
    service: formData.service,
    quantity: formData.quantity,
    ac_unit: formData.item?.id || null,
  });

  if (error) {
    console.error(error);
    return NextResponse.json({ error }, { status, statusText });
  }

  // Actually send the email, get the email from /src/emails folder. Then pass the props(formData) to the email.

  // Create email transporter
  const transporter = getTransporter();

  const emailHtml = render(
    ConfirmationEmail({
      date: new Date(formData.date).toLocaleString("en-US", {
        timeZone: "Asia/Manila",
        timeStyle: "short",
        dateStyle: "full",
      }),
      name: formData.name,
      service: _.startCase(formData.service),
      quantity: formData.quantity,
      itemName: formData.item?.name || null,
      acType: formData.ac_type,
    })
  );

  await transporter.sendMail({
    from: process.env.ZOHOMAIL_EMAIL,
    to: formData.email,
    subject: "Schedule Confirmation!",
    html: emailHtml,
  });

  return NextResponse.json({ status, statusText });
}

export async function PUT(request: NextRequest) {
  const url = new URL(request.url);
  const status = url.searchParams.get("status");
  const id = Number(url.searchParams.get("id"));

  if (!status) {
    return NextResponse.json({ error: "Status is required!" }, { status: 400 });
  }

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
    data: schedData,
    error,
    status: dbStatus,
    statusText,
  } = await supabase
    .from("schedule")
    .update({ status })
    .eq("id", id)
    .select()
    .single();

  const { data: itemData } = await supabase
    .from("items")
    .select("name")
    .eq("id", +schedData?.ac_unit!)
    .single();

  if (status === ScheduleStatus.CANCELLED && schedData) {
    const transporter = getTransporter();
    const emailHtml = render(
      CancellationEmail({
        date: schedData.date,
        // @ts-ignore
        name: schedData.customer?.name,
        service: _.startCase(schedData.service),
        quantity: schedData.quantity!,
        itemName: itemData?.name,
        acType: schedData.ac_type,
      })
    );
    await transporter.sendMail({
      from: process.env.ZOHOMAIL_EMAIL,
      // @ts-ignore
      to: schedData.customer?.email,
      subject: "Schedule Cancelled!",
      html: emailHtml,
    });
  }

  if (error) {
    console.log(error);
    return NextResponse.json(
      { error: "An error has occurred!" },
      { status: 500 }
    );
  }

  return NextResponse.json({ status: dbStatus, statusText });
}
