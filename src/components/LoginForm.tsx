"use client";

import { Alert, Button, Label, Modal, TextInput } from "flowbite-react";
import { Formik, FormikHelpers } from "formik";
import { RedirectType, redirect, useRouter } from "next/navigation";
import { object, string } from "yup";

import Link from "next/link";
import { useRef, useState } from "react";
import { MdOutlineError } from "react-icons/md";

interface LoginValues {
  email: string;
  password: string;
}

export default function LoginForm({ ...props }) {
  const initialInputRef = useRef<HTMLInputElement>(null);
  const initialValues: LoginValues = {
    email: "",
    password: "",
  };
  const [attempts, setAttempts] = useState(5);
  const [showAlert, setShowAlert] = useState(false);

  const validationSchema = object({
    email: string().required("Email is required!").email().label("Email"),
    password: string()
      .required("Password is required!")
      .min(8)
      .label("Password"),
  });

  async function handleSignIn(
    values: LoginValues,
    { setFieldError }: FormikHelpers<LoginValues>
  ) {
    if (attempts === 0) {
      // TODO: Disable field for a certain amount of time (make it persistent)
      /**
       * Proposed Idea:
       * Make a table called login_attempts containing the email and time (the time the fields should be re-enabled again i.e "1hr", "5hrs", etc.).
       * Trigger the comparison here in the handle submit button when the page is refreshed.
       * Do the comparison by the Date object from the table and today, subtract it by the seconds.
       * If the time column is less than today, then they are still unable to login.
       * Else, proceed to login then delete the record from the table.
       */
    }

    const res = await fetch("/auth/login", {
      method: "POST",
      body: JSON.stringify(values),
    });

    const data = await res.json();

    if (!data.user && data.error?.message === "Invalid login credentials") {
      setFieldError("email", data.error.message);
      setFieldError("password", data.error.message);
      setAttempts((num) => num - 1);
      setShowAlert(true);
      return;
    }

    props.setOpenModal(undefined);
    window.location.reload();
  }

  return (
    <Modal
      show={props.openModal === "login-form"}
      size="xl"
      popup
      onClose={() => {
        props.setOpenModal(undefined);
        setShowAlert(false);
        setAttempts(5);
      }}
      initialFocus={initialInputRef}
    >
      <Modal.Header className="mr-2 flex items-center justify-center">
        <p className="pl-4 mt-2">Admin Login</p>
      </Modal.Header>
      <Modal.Body>
        {/* TODO: Add alert to display number of attempts left (disable field if attempts is 0) */}
        <Alert
          color="failure"
          icon={MdOutlineError}
          className={`${showAlert ? "block" : "hidden"} mb-2`}
          onDismiss={() => setShowAlert(false)}
        >
          <p>
            <span className="font-medium">ERROR:</span> Invalid login
            credentials!
          </p>
          {attempts === 0 ? (
            <p>
              This account has been <span className="font-medium">locked</span>,
              Please try again after a while!
            </p>
          ) : (
            <p>
              <span className="font-medium">{attempts}</span> attempts left.
            </p>
          )}
        </Alert>
        <Formik
          initialValues={initialValues}
          validationSchema={validationSchema}
          onSubmit={handleSignIn}
        >
          {(formik) => (
            <form
              className="flex flex-col gap-4"
              onSubmit={formik.handleSubmit}
            >
              {/* Email input */}
              <div>
                <div className="mb-2 block">
                  <Label
                    color={
                      formik.touched.email && formik.errors.email
                        ? "failure"
                        : undefined
                    }
                    htmlFor="email"
                    value="Email"
                  />
                </div>
                <TextInput
                  ref={initialInputRef}
                  disabled={attempts === 0}
                  color={
                    formik.touched.email && formik.errors.email
                      ? "failure"
                      : undefined
                  }
                  helperText={
                    formik.touched.email && formik.errors.email ? (
                      <span>{formik.errors.email}</span>
                    ) : null
                  }
                  id="email"
                  type="email"
                  {...formik.getFieldProps("email")}
                />
              </div>

              {/* Password Input */}
              <div>
                <div className="mb-2 block">
                  <Label
                    color={
                      formik.touched.password && formik.errors.password
                        ? "failure"
                        : undefined
                    }
                    htmlFor="password"
                    value="Password"
                  />
                </div>
                <TextInput
                  disabled={attempts === 0}
                  color={
                    formik.touched.password && formik.errors.password
                      ? "failure"
                      : undefined
                  }
                  helperText={
                    formik.touched.password && formik.errors.password ? (
                      <span>{formik.errors.password}</span>
                    ) : null
                  }
                  id="password"
                  type="password"
                  {...formik.getFieldProps("password")}
                />
              </div>
              <Link
                href="/reset-password"
                className="text-sm text-blue-500 ml-1 w-fit hover:underline cursor-pointer"
                onClick={() => {
                  props.setOpenModal(undefined);
                  setShowAlert(false);
                  setAttempts(5);
                }}
              >
                Forgot Password?
              </Link>
              <Button
                disabled={attempts === 0}
                isProcessing={formik.isSubmitting}
                type="submit"
              >
                Login
              </Button>
            </form>
          )}
        </Formik>
      </Modal.Body>
    </Modal>
  );
}
