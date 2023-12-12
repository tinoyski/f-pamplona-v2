"use client";

import { Database } from "@/lib/database.types";
import { createBrowserClient } from "@supabase/ssr";
import { Card, Title } from "@tremor/react";
import { Button, Label, TextInput } from "flowbite-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { FaCircleCheck } from "react-icons/fa6";
import { toast } from "react-toastify";

export default function ResetPassword() {
  const [email, setEmail] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);
  const [isSent, setIsSent] = useState(false);
  const router = useRouter();

  async function sendResetPasswordEmail() {
    setIsProcessing(true);
    const supabase = createBrowserClient<Database>(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    );

    const BASE_URL =
      process.env.NODE_ENV === "development"
        ? "http://localhost:3000"
        : "https://f-pamplona.vercel.app";

    const res = await fetch(`/api/admin?email=${email}`);
    const data = await res.json();

    if (!data) {
      toast.error("Invalid email, Please try again!");
      setErrorMessage("Invalid email, Please try again!");
      setIsProcessing(false);
      return;
    }

    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${BASE_URL}`,
    });

    if (error) {
      console.log(error);
      return;
    }

    setIsProcessing(false);
    setIsSent(true);
  }

  return (
    <div className="flex items-center justify-center h-screen">
      <Card className="w-1/4">
        <Title>Reset your password</Title>
        <div className="flex flex-col space-y-4 items-center justify-center mt-4">
          {isSent ? (
            <>
              <FaCircleCheck className="w-12 h-12 text-green-500" />
              <p className="text-center">
                An email has been sent to{" "}
                <span className="font-bold">{email}</span>
              </p>
              <Button color="success" onClick={() => router.push("/")}>
                Close
              </Button>
            </>
          ) : (
            <>
              <div>
                <div className="mb-2">
                  <Label
                    htmlFor="email"
                    value="Please enter your account email address. We will send you a link to reset your password."
                  />
                </div>
                <TextInput
                  id="email"
                  type="email"
                  required
                  className="w-full"
                  color={errorMessage ? "failure" : ""}
                  helperText={errorMessage}
                  onChange={(event) => {
                    setErrorMessage("");
                    setEmail(event.target.value);
                  }}
                />
              </div>
              <div className="flex gap-3 mt-4 items-center justify-center">
                <Button color="light" onClick={() => router.back()}>
                  Cancel
                </Button>
                <Button
                  color="success"
                  isProcessing={isProcessing}
                  onClick={() => sendResetPasswordEmail()}
                >
                  Change Password
                </Button>
              </div>
            </>
          )}
        </div>
      </Card>
    </div>
  );
}
