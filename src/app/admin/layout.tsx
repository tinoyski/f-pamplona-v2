"use client";

import FooterComponent from "@/components/FooterComponent";
import DashboardSidebar from "@/components/Sidebar";
import { Metadata } from "next";
import React from "react";
import "react-toastify/ReactToastify.css";

// export const metadata: Metadata = {
//   title: "Dashboard",
// };

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div>
      <div className="flex -z-20 pt-20">
        <DashboardSidebar />
        <div className="ml-64 p-6 w-full">{children}</div>
      </div>
    </div>
  );
}
