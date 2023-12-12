"use client";

import { Sidebar } from "flowbite-react";
import { HiChartPie, HiUser } from "react-icons/hi";
import { PiCalendarDuotone } from "react-icons/pi";
import { MdInventory2 } from "react-icons/md";
import { TbSwitchHorizontal } from "react-icons/tb";
import Link from "next/link";
import { createBrowserClient } from "@supabase/ssr";
import { CustomClaims } from "@/utils/CustomClaims";
import { useEffect, useState } from "react";

export default function DashboardSidebar() {
  const [role, setRole] = useState<string>("");

  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );

  useEffect(() => {
    async function getRole() {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (user) {
        const customClaims = new CustomClaims(supabase);

        const { data, error } = await customClaims.get_claim(user.id, "role");

        if (error) {
          console.log(error);
          return;
        }
        
        setRole(data);
      }
    }

    if (!role.length) {
      getRole();
    }
  }, [role.length, supabase]);

  return (
    <Sidebar
      aria-label="Dashboard Sidebar"
      theme={{
        root: {
          inner:
            "h-full overflow-y-auto overflow-x-hidden bg-gray-50 drop-shadow-md py-4 px-3 dark:bg-gray-800",
        },
      }}
      className="fixed z-40"
    >
      <Sidebar.Items>
        <Sidebar.ItemGroup>
          <Sidebar.Item
            as={Link}
            href="/admin/dashboard"
            icon={HiChartPie}
            className={role === "ADMIN" ? "" : "hidden"}
          >
            <p>Dashboard</p>
          </Sidebar.Item>
          <Sidebar.Item
            as={Link}
            href="/admin/dashboard/inventory"
            icon={MdInventory2}
          >
            <p>Inventory</p>
          </Sidebar.Item>
          <Sidebar.Item
            as={Link}
            href="/admin/dashboard/transactions"
            icon={TbSwitchHorizontal}
            className={role === "ADMIN" ? "" : "hidden"}
          >
            <p>Transactions</p>
          </Sidebar.Item>
          <Sidebar.Item
            as={Link}
            href="/admin/dashboard/scheduling"
            icon={PiCalendarDuotone}
            className={role === "ADMIN" ? "" : "hidden"}
          >
            <p>Scheduling</p>
          </Sidebar.Item>
          <Sidebar.Item
            as={Link}
            href="/admin/manage"
            icon={HiUser}
            className={role === "ADMIN" ? "" : "hidden"}
          >
            <p>Admin Management</p>
          </Sidebar.Item>
        </Sidebar.ItemGroup>
      </Sidebar.Items>
    </Sidebar>
  );
}
