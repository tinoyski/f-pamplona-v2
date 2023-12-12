"use client";

import { Navbar, Dropdown, Avatar, Button } from "flowbite-react";
import DarkThemeToggle from "./DarkThemeToggle";
import { PiSignOutBold } from "react-icons/pi";
import { User } from "@supabase/supabase-js";
import { redirect, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import Image from "next/image";

import type { Database } from "@/lib/database.types";
import { MdLogin } from "react-icons/md";
import LoginForm from "./LoginForm";
import { createBrowserClient } from "@supabase/ssr";
import { toast } from "react-toastify";
import _ from "lodash";
import { AiOutlineCloudDownload } from "react-icons/ai";
import { CiMenuBurger } from "react-icons/ci";
import { RxActivityLog } from "react-icons/rx";
import { Badge } from "@tremor/react";

export default function NavbarComponent() {
  const supabase = createBrowserClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );
  const [user, setUser] = useState<User | undefined>();
  const [role, setRole] = useState<string>("");
  const [openModal, setOpenModal] = useState<String | undefined>();
  const [loading, setLoading] = useState<boolean>(true);

  const props = { openModal, setOpenModal, isInstallation: false };

  useEffect(() => {
    const getUser = async () => {
      const { data } = await supabase.auth.getSession();
      const user = data.session?.user;
      setUser(user);
      setRole(user?.app_metadata.role);
      setLoading(false);
    };

    if (!user) {
      getUser();
    }
  }, [supabase.auth, user]);

  async function signOut() {
    const res = await fetch("/auth/logout", { method: "POST" });
    const data = await res.json();

    if (data.error) {
      console.log(data.error);
      toast.error(data.error.message);
      return;
    }

    setUser(undefined);
    window.location.reload();
  }
  return (
    <>
      <Navbar fluid className="fixed z-30 w-full drop-shadow-md bg-blue-600">
        <Navbar.Brand href={user ? "/admin/dashboard" : "/"}>
          <div className="ml-5">
            <Image
              src={"/ac_logo_transparent.svg"}
              alt="F. Pamplona"
              width={87}
              height={87}
            />
          </div>
        </Navbar.Brand>
        <div className="flex md:order-2 gap-4">
          {!loading && (
            <>
              {user == null || user.app_metadata.passwordRecovery ? null : (
                <Badge size={"xl"} color={"amber"} tooltip={user?.email}>
                  {_.startCase(role.toLowerCase())}
                </Badge>
              )}
              <DarkThemeToggle />
              {user == null ? (
                <div className="flex gap-3">
                  <Button
                    color="dark"
                    onClick={() => props.setOpenModal("login-form")}
                  >
                    <MdLogin className="mr-2 h-5 w-5" />
                    <p className="pr-2">Admin Login</p>
                  </Button>
                </div>
              ) : user.app_metadata.passwordRecovery ? null : (
                <div className="mr-4">
                  <Dropdown
                    label=""
                    dismissOnClick={false}
                    renderTrigger={() => (
                      <span>
                        <CiMenuBurger className="h-8 w-8 text-white" />
                      </span>
                    )}
                  >
                    <Dropdown.Header>
                      <span className="block text-sm">
                        {_.startCase(role.toLowerCase())}
                      </span>
                      <span className="block truncate text-sm font-medium">
                        {user.email}
                      </span>
                    </Dropdown.Header>
                    <Dropdown.Item></Dropdown.Item>
                    <Dropdown.Item
                      icon={AiOutlineCloudDownload}
                      className={role === "ADMIN" ? "" : "hidden"}
                    >
                      <a href="/backup.sql" download>
                        Download backup
                      </a>
                    </Dropdown.Item>
                    <Dropdown.Item
                      icon={RxActivityLog}
                      href="/admin/activity"
                      className={role === "ADMIN" ? "" : "hidden"}
                    >
                      Activity log
                    </Dropdown.Item>
                    <Dropdown.Item icon={PiSignOutBold} onClick={signOut}>
                      Sign out
                    </Dropdown.Item>
                  </Dropdown>
                </div>
              )}
            </>
          )}
        </div>
      </Navbar>

      {/* Login Form */}
      <LoginForm {...props} />
    </>
  );
}
