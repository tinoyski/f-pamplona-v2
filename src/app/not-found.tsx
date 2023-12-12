"use client";

import { Button } from "flowbite-react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";

export default function NotFound() {
  const pathname = usePathname();
  const router = useRouter();
  return (
    <div className="flex flex-col items-center justify-center min-h-screen">
      <div>
        <div className=" flex divide-x-2 divide-slate-800">
          <div className="pr-3">
            <h4>404</h4>
          </div>
          <div className="pl-3">
            <p className="text-2xl font-light">
              <code className="rounded-md bg-gray-200 dark:bg-gray-800 p-1">{pathname}</code> Not
              Found
            </p>
          </div>
        </div>
        <Button
          color="dark"
          onClick={() => router.back()}
          className="w-full mt-3"
        >
          Back to Home
        </Button>
      </div>
    </div>
  );
}
