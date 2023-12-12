"use client";

import Loading from "@/components/Loading";
import { CustomClaims } from "@/utils/CustomClaims";
import { createBrowserClient } from "@supabase/ssr";
import { Session } from "@supabase/supabase-js";
import { Title, TextInput } from "@tremor/react";
import { Button, Card, Label, Progress } from "flowbite-react";
import { Formik, FormikHelpers } from "formik";
import ms from "ms";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { FaCircleCheck } from "react-icons/fa6";
import { HiOutlineEye, HiOutlineEyeOff } from "react-icons/hi";
import { object, string } from "yup";

interface FormValues {
  newPassword: string;
  retypePassword: string;
}

export default function UpdatePassword(params: any) {
  const [updated, setUpdated] = useState(false);
  const [session, setSession] = useState<Session | null>(null);
  const [progress, setProgress] = useState(0);
  const [color, setColor] = useState("");
  const [textLabel, setTextLabel] = useState("");
  const router = useRouter();

  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );

  // Password strength regex
  const upperCaseRegex = new RegExp("(?=.*[A-Z])");
  const lowerCaseRegex = new RegExp("(?=.*[a-z])");
  const numericRegex = new RegExp("(?=.*[0-9])");
  const specialCharacterRegex = new RegExp("(?=.*[!@#$%^&*])");

  // Password checks
  const [hasUppercase, setHasUppercase] = useState(false);
  const [hasLowercase, setHasLowercase] = useState(false);
  const [hasNumericalCharacter, setHasNumericalCharacter] = useState(false);
  const [hasSpecialCharacter, setHasSpecialCharacter] = useState(false);

  // Password Strength Meter
  async function checkPasswordStrength(value: string) {
    const hasUppercase = upperCaseRegex.test(value);
    const hasLowercase = lowerCaseRegex.test(value);
    const hasNumericalCharacter = numericRegex.test(value);
    const hasSpecialCharacter = specialCharacterRegex.test(value);

    // if (hasUppercase) {
    //   setProgress((prev) => prev + 25);
    // } else {
    //   setProgress((prev) => prev - 25);
    // }

    // if (hasLowercase) {
    //   setProgress((prev) => prev + 25);
    // } else {
    //   setProgress((prev) => prev - 25);
    // }

    // if (hasNumericalCharacter) {
    //   setProgress((prev) => prev + 25);
    // } else {
    //   setProgress((prev) => prev - 25);
    // }

    // if (hasSpecialCharacter) {
    //   setProgress((prev) => prev + 25);
    // } else {
    //   setProgress((prev) => prev - 25);
    // }

    // switch (progress) {
    //   case 25: {
    //     setColor("red");
    //     setTextLabel("Very Weak");
    //     break;
    //   }
    //   case 50: {
    //     setColor("yellow");
    //     setTextLabel("Weak");
    //     break;
    //   }
    //   case 75: {
    //     setColor("cyan");
    //     setTextLabel("Good");
    //     break;
    //   }
    //   case 100: {
    //     setColor("green");
    //     setTextLabel("Very Strong");
    //     break;
    //   }
    //   default:
    //     break;
    // }

    // setHasUppercase(hasUppercase);
    // setHasLowercase(hasLowercase);
    // setHasNumericalCharacter(hasNumericalCharacter);
    // setHasSpecialCharacter(hasSpecialCharacter);

    return (
      hasUppercase &&
      hasLowercase &&
      hasNumericalCharacter &&
      hasSpecialCharacter
    );
  }

  const initialValues: FormValues = {
    newPassword: "",
    retypePassword: "",
  };

  const validationSchema = object({
    newPassword: string()
      .min(8)
      .required()
      .test(
        "is-strong-password",
        "For security purposes, password should have at least 1 uppercase, lowercase, number and special character!",
        (value) => checkPasswordStrength(value)
      )
      .label("Password"),
    retypePassword: string()
      .required()
      .test(
        "is-same-password",
        "Passwords must match!",
        (value, context) => context.parent.newPassword === value
      )
      .label("Retype Password"),
  });

  useEffect(() => {
    async function getSession() {
      const { data, error } = await supabase.auth.getSession();

      if (error) {
        console.log(error);
        return;
      }

      if (!data.session) {
        router.push("/");
        return;
      }

      const customClaims = new CustomClaims(supabase);

      const claimResult = await customClaims.set_claim(
        data.session.user.id,
        "passwordRecovery",
        JSON.parse(JSON.stringify(true))
      );

      if (claimResult.error) {
        console.log(claimResult.error);
        return;
      }

      console.log(claimResult.data);

      setSession(data.session);
    }

    if (!session) {
      getSession();
    }
  }, [router, session, supabase]);

  async function cancelProcess() {
    await supabase.auth.signOut();
    window.location.reload();
  }

  async function changePassword(
    values: FormValues,
    { setSubmitting }: FormikHelpers<FormValues>
  ) {
    setSubmitting(true);
    await supabase.auth.updateUser({ password: values.newPassword });

    const customClaims = new CustomClaims(supabase);

    const { data } = await supabase.auth.getUser();

    if (data.user) {
      await customClaims.set_claim(
        data.user.id,
        "passwordRecovery",
        JSON.parse(JSON.stringify(false))
      );
    }
    setSubmitting(false);
    setUpdated(true);
    await supabase.auth.signOut();
    setTimeout(() => {
      router.push("/");
    }, ms("5s"));
  }

  return (
    <div className="flex items-center justify-center h-screen">
      {!session ? (
        <Loading />
      ) : (
        <>
          <Card className="w-2/5">
            <Title>Change your password</Title>
            <div className="mt-4">
              {updated ? (
                <div className="flex flex-col items-center space-y-4">
                  <FaCircleCheck className="w-12 h-12 text-green-600" />
                  <div className="text-center">
                    <p>Account&apos;s Password successfully updated!</p>
                    <p>
                      You&apos;ll be redirected to the home page after 5
                      seconds.
                    </p>
                  </div>
                  <Button color="success" onClick={() => router.push("/")}>
                    Go back
                  </Button>
                </div>
              ) : (
                <Formik
                  initialValues={initialValues}
                  validationSchema={validationSchema}
                  onSubmit={changePassword}
                >
                  {(formik) => (
                    <form onSubmit={formik.handleSubmit}>
                      <div className="mb-2">
                        <Label
                          htmlFor="password"
                          value="Please enter your new password. We suggest you choose a strong password and update it regularly."
                        />
                      </div>
                      <TextInput
                        id="password"
                        type="password"
                        placeholder="New Password"
                        className="w-full mb-2"
                        error={
                          formik.touched.newPassword &&
                          formik.errors.newPassword
                            ? true
                            : false
                        }
                        errorMessage={formik.errors.newPassword}
                        {...formik.getFieldProps("newPassword")}
                      />
                      {/* TODO: finish this */}
                      {/* <Progress
                      progress={progress}
                      textLabel={textLabel}
                      color={color}
                      textLabelPosition="inside"
                      size="lg"
                      labelText
                    /> */}

                      <div className="mb-2 mt-3">
                        <Label
                          htmlFor="retype-password"
                          value="Re-enter password"
                        />
                      </div>
                      <TextInput
                        id="retype-password"
                        type="password"
                        placeholder="Confirm Password"
                        className="w-full mb-2"
                        error={
                          formik.touched.retypePassword &&
                          formik.errors.retypePassword
                            ? true
                            : false
                        }
                        errorMessage={formik.errors.retypePassword}
                        {...formik.getFieldProps("retypePassword")}
                      />
                      <div className="flex gap-3 mt-4 items-center justify-center">
                        <Button color="light" onClick={() => cancelProcess()}>
                          Cancel
                        </Button>
                        <Button
                          color="success"
                          isProcessing={formik.isSubmitting}
                          type="submit"
                        >
                          Change Password
                        </Button>
                      </div>
                    </form>
                  )}
                </Formik>
              )}
            </div>
          </Card>
        </>
      )}
    </div>
  );
}
