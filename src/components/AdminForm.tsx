"use client";

import { Admin } from "@/interfaces/Admins";
import { Button, Label, Modal, Select, TextInput } from "flowbite-react";
import { Formik } from "formik";
import { useRef } from "react";
import { object, string } from "yup";
import { AiFillEye } from "react-icons/ai";
import { createBrowserClient } from "@supabase/ssr";
import { CustomClaims } from "@/utils/CustomClaims";

interface AdminFormValues {
  first_name: string;
  last_name: string;
  email: string;
  role: string;
  mobile: string;
  password: string;
}

export default function AdminFormModal({ ...props }) {
  const { admin } = props;
  const initialInputRef = useRef<HTMLInputElement>(null);

  const initialValues: AdminFormValues = {
    first_name: admin?.first_name || "",
    last_name: admin?.last_name || "",
    email: admin?.email || "",
    role: admin?.role || "NULL",
    mobile: admin?.mobile.slice(4) || "",
    password: admin?.password || "",
  };

  const validationSchema = object<AdminFormValues>({
    first_name: string().required("First name is required").label("First Name"),
    last_name: string().required("Last name is required").label("Last Name"),
    email: string().required("Email is required").label("Email"),
    role: string().required(),
    mobile: string()
      .test("is-number", "Must be a valid phone number", (value) => {
        if (typeof value != "string") return false; // we only process strings!
        return (
          !Number.isNaN(value) && // use type coercion to parse the _entirety_ of the string (`parseFloat` alone does not do this)...
          !Number.isNaN(Number.parseFloat(value)) // ...and ensure strings of whitespace fail
        );
      })
      .test(
        "is-ten",
        "Invalid number!",
        (value) =>
          value !== undefined && value.replaceAll(" ", "").length === 10
      )
      .required()
      .label("Mobile"),
    password: admin
      ? string().min(8).label("New Password")
      : string().min(8).required().label("Password"),
  });

  return (
    <Modal
      show={props.openModal === "admin-form"}
      size="md"
      popup
      onClose={() => props.setOpenModal(undefined)}
      initialFocus={initialInputRef}
    >
      <Modal.Header className="pl-4 pt-3">
        {admin ? "Edit Admin" : "Add New Admin"}
      </Modal.Header>
      <Modal.Body>
        <Formik
          initialValues={initialValues}
          validationSchema={validationSchema}
          onSubmit={props.formCallback}
        >
          {(formik) => (
            <form
              className="flex flex-col gap-4"
              onSubmit={formik.handleSubmit}
            >
              {/* Admin First Name input */}
              <div>
                <div className="mb-2 block">
                  <Label
                    color={
                      formik.touched.first_name && formik.errors.first_name
                        ? "failure"
                        : undefined
                    }
                    htmlFor="first_name"
                    value="First Name"
                  />
                </div>
                <TextInput
                  ref={initialInputRef}
                  color={
                    formik.touched.first_name && formik.errors.first_name
                      ? "failure"
                      : undefined
                  }
                  helperText={
                    formik.touched.first_name && formik.errors.first_name ? (
                      <span>{formik.errors.first_name}</span>
                    ) : null
                  }
                  id="first_name"
                  {...formik.getFieldProps("first_name")}
                />
              </div>

              {/* Admin Last Name input */}
              <div>
                <div className="mb-2 block">
                  <Label
                    color={
                      formik.touched.last_name && formik.errors.last_name
                        ? "failure"
                        : undefined
                    }
                    htmlFor="last_name"
                    value="Last Name"
                  />
                </div>
                <TextInput
                  color={
                    formik.touched.last_name && formik.errors.last_name
                      ? "failure"
                      : undefined
                  }
                  helperText={
                    formik.touched.last_name && formik.errors.last_name ? (
                      <span>{formik.errors.last_name}</span>
                    ) : null
                  }
                  id="last_name"
                  {...formik.getFieldProps("last_name")}
                />
              </div>

              {/* Admin email input */}
              <div>
                <div className="mb-2 block">
                  <Label
                    color={
                      formik.touched.email && formik.errors.email
                        ? "failure"
                        : undefined
                    }
                    htmlFor="description"
                    value="Email"
                  />
                </div>
                <TextInput
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
                  {...formik.getFieldProps("email")}
                />
              </div>

              {/* Role input */}
              <div>
                <div className="mb-2 block">
                  <Label
                    color={
                      formik.touched.role && formik.errors.role
                        ? "failure"
                        : undefined
                    }
                    htmlFor="role"
                    value="Role"
                  />
                </div>
                <Select
                  id="role"
                  color={
                    formik.touched.role && formik.errors.role
                      ? "failure"
                      : undefined
                  }
                  helperText={
                    formik.touched.role && formik.errors.role ? (
                      <span>{formik.errors.role}</span>
                    ) : null
                  }
                  {...formik.getFieldProps("role")}
                >
                  <option value="NULL" disabled>Choose a Role</option>
                  <option value="ADMIN">Admin</option>
                  <option value="STAFF">Staff</option>
                </Select>
              </div>

              {/* Mobile number input */}
              <div>
                <div className="mb-2 block">
                  <Label
                    color={
                      formik.touched.mobile && formik.errors.mobile
                        ? "failure"
                        : undefined
                    }
                    htmlFor="mobile"
                    value="Mobile"
                  />
                </div>
                <TextInput
                  id="mobile"
                  addon="+63"
                  maxLength={10}
                  color={
                    formik.touched.mobile && formik.errors.mobile
                      ? "failure"
                      : undefined
                  }
                  helperText={
                    formik.touched.mobile && formik.errors.mobile ? (
                      <span>{formik.errors.mobile}</span>
                    ) : null
                  }
                  onBlurCapture={() =>
                    (formik.values.mobile =
                      formik.values.mobile.replaceAll(" ", "").length === 10
                        ? formik.values.mobile.replace(
                            /(\d{3})(\d{3})(\d{4})/,
                            "$1 $2 $3"
                          )
                        : formik.values.mobile.replaceAll(" ", ""))
                  }
                  {...formik.getFieldProps("mobile")}
                />
              </div>

              {/* Password input */}
              <div>
                <div className="mb-2 block">
                  <Label
                    color={
                      formik.touched.password && formik.errors.password
                        ? "failure"
                        : undefined
                    }
                    htmlFor="password"
                    value={admin ? "New Password" : "Password"}
                  />
                </div>
                <TextInput
                  id="password"
                  type="password"
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
                  {...formik.getFieldProps("password")}
                />
              </div>

              <div className="flex gap-2 ml-auto mt-2">
                <Button
                  color="failure"
                  onClick={() => props.setOpenModal(undefined)}
                >
                  Cancel
                </Button>
                <Button isProcessing={formik.isSubmitting} type="submit">
                  {admin ? "Save" : "Add"}
                </Button>
              </div>
            </form>
          )}
        </Formik>
      </Modal.Body>
    </Modal>
  );
}
