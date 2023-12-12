"use client";

import { ItemValues } from "@/interfaces/Items";
import { Button, Label, Modal, Select, TextInput } from "flowbite-react";
import { Formik } from "formik";
import { useRef } from "react";
import { number, object, string } from "yup";

export default function ItemFormModal({ ...props }) {
  const { item, role } = props;
  const initialInputRef = useRef<HTMLInputElement>(null);

  const initialValues: ItemValues = {
    name: item?.name || "",
    description: item?.description || "",
    quantity: item?.quantity || 0,
    img_url: item?.img_url || "",
    physical_count: item?.physical_count || 0,
    unit_price: item?.unit_price || 0,
    ordered_items: item?.ordered_items || 1,
    received_items: item?.received_items || 1,
    remarks: item?.remarks || "NONE",
  };

  const validationSchema = object({
    name: string().required("Item name is required").label("Item Name"),
    description: string()
      .required("Description is required")
      .label("Description"),
    img_url: string().required().label("Image URL"),
    unit_price:
      role === "ADMIN"
        ? number()
            .required("Unit Price is required")
            .min(20_000)
            .label("Unit price")
        : number(),
    quantity:
      role === "ADMIN"
        ? number()
            .required("Quantity is required")
            .label("Quantity")
            .min(1)
            .test(
              "is-equal",
              "Quantity cannot be greater than Received Items",
              (value, context) => value <= context.parent.received_items
            )
        : number(),
    physical_count:
      role === "STAFF"
        ? number()
            .required("Physical Count is required")
            .min(0)
            .label("Physical Count")
        : number(),
    ordered_items:
      role === "ADMIN"
        ? number()
            .required("Ordered Items is required")
            .min(1)
            .label("Ordered Items")
        : number(),
    received_items:
      role === "ADMIN"
        ? number()
            .required("Received Items is required")
            .min(1)
            .test(
              "is-equal",
              "Received Items cannot be greater than Ordered Items",
              (value, context) => value <= context.parent.ordered_items
            )
            .label("Received Items")
        : number(),
    remarks: role === "STAFF" ? string().required().label("Remarks") : string(),
  });

  return (
    <Modal
      show={props.openModal === "item-form"}
      size="xl"
      onClose={() => props.setOpenModal(undefined)}
      initialFocus={role === "ADMIN" ? initialInputRef : undefined}
    >
      <Modal.Header>{item ? "Edit Item" : "Add Item"}</Modal.Header>
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
              {/* Item Name input */}
              <div>
                <div className="mb-2 block">
                  <Label
                    color={
                      formik.touched.name && formik.errors.name
                        ? "failure"
                        : undefined
                    }
                    htmlFor="name"
                    value="Item Name"
                  />
                </div>
                <TextInput
                  ref={initialInputRef}
                  readOnly={role !== "ADMIN"}
                  color={
                    formik.touched.name && formik.errors.name
                      ? "failure"
                      : undefined
                  }
                  helperText={
                    formik.touched.name && formik.errors.name ? (
                      <span>{formik.errors.name}</span>
                    ) : null
                  }
                  id="name"
                  {...formik.getFieldProps("name")}
                />
              </div>

              {/* Description input */}
              <div>
                <div className="mb-2 block">
                  <Label
                    color={
                      formik.touched.description && formik.errors.description
                        ? "failure"
                        : undefined
                    }
                    htmlFor="description"
                    value="Item Description"
                  />
                </div>
                <TextInput
                  id="description"
                  readOnly={role !== "ADMIN"}
                  color={
                    formik.touched.description && formik.errors.description
                      ? "failure"
                      : undefined
                  }
                  helperText={
                    formik.touched.description && formik.errors.description ? (
                      <span>{formik.errors.description}</span>
                    ) : null
                  }
                  {...formik.getFieldProps("description")}
                />
              </div>

              {/* Image URL input */}
              <div>
                <div className="mb-2 block">
                  <Label
                    color={
                      formik.touched.img_url && formik.errors.img_url
                        ? "failure"
                        : undefined
                    }
                    htmlFor="img_url"
                    value="Item image URL"
                  />
                </div>
                <TextInput
                  id="img_url"
                  readOnly={role !== "ADMIN"}
                  color={
                    formik.touched.img_url && formik.errors.img_url
                      ? "failure"
                      : undefined
                  }
                  helperText={
                    formik.touched.img_url && formik.errors.img_url ? (
                      <span>{formik.errors.img_url}</span>
                    ) : null
                  }
                  {...formik.getFieldProps("img_url")}
                />
              </div>

              {/* Unit Price input */}
              <div className={role === "ADMIN" ? "" : "hidden"}>
                <div className="mb-2 block">
                  <Label
                    color={
                      formik.touched.unit_price && formik.errors.unit_price
                        ? "failure"
                        : undefined
                    }
                    htmlFor="unit_price"
                    value="Unit Price"
                  />
                </div>
                <TextInput
                  id="unit_price"
                  type="number"
                  color={
                    formik.touched.unit_price && formik.errors.unit_price
                      ? "failure"
                      : undefined
                  }
                  helperText={
                    formik.touched.unit_price && formik.errors.unit_price ? (
                      <span>{formik.errors.unit_price}</span>
                    ) : null
                  }
                  {...formik.getFieldProps("unit_price")}
                />
              </div>

              {role === "ADMIN" ? (
                <>
                  {/* Quantity input */}
                  <div>
                    <div className="mb-2 block">
                      <Label
                        color={
                          formik.touched.quantity && formik.errors.quantity
                            ? "failure"
                            : undefined
                        }
                        htmlFor="quantity"
                        value="Quantity"
                      />
                    </div>
                    <TextInput
                      color={
                        formik.touched.quantity && formik.errors.quantity
                          ? "failure"
                          : undefined
                      }
                      helperText={
                        formik.touched.quantity && formik.errors.quantity ? (
                          <span>{formik.errors.quantity}</span>
                        ) : null
                      }
                      id="quantity"
                      type="number"
                      {...formik.getFieldProps("quantity")}
                    />
                  </div>
                </>
              ) : (
                <>
                  {/* Physical Count input */}
                  <div>
                    <div className="mb-2 block">
                      <Label
                        color={
                          formik.touched.physical_count &&
                          formik.errors.physical_count
                            ? "failure"
                            : undefined
                        }
                        htmlFor="physical_count"
                        value="Physical Count"
                      />
                    </div>
                    <TextInput
                      color={
                        formik.touched.physical_count &&
                        formik.errors.physical_count
                          ? "failure"
                          : undefined
                      }
                      helperText={
                        formik.touched.physical_count &&
                        formik.errors.physical_count ? (
                          <span>{formik.errors.physical_count}</span>
                        ) : null
                      }
                      id="physical_count"
                      type="number"
                      {...formik.getFieldProps("physical_count")}
                    />
                  </div>

                  {/* Item Condition input */}
                  <div>
                    <div className="mb-2 block">
                      <Label
                        color={
                          formik.touched.remarks && formik.errors.remarks
                            ? "failure"
                            : undefined
                        }
                        htmlFor="remarks"
                        value="Remarks"
                      />
                    </div>
                    <Select
                      id="remarks"
                      color={
                        formik.touched.remarks && formik.errors.remarks
                          ? "failure"
                          : undefined
                      }
                      helperText={
                        formik.touched.remarks && formik.errors.remarks ? (
                          <span>{formik.errors.remarks}</span>
                        ) : null
                      }
                      {...formik.getFieldProps("remarks")}
                    >
                      <option value={"NONE"} disabled>
                        Remarks
                      </option>
                      <option value={"GOOD_CONDITION"}>Good Condition</option>
                      <option value={"DEFECT"}>Defect</option>
                    </Select>
                  </div>
                </>
              )}

              {/* Ordered Items input */}
              <div className={role === "ADMIN" ? "" : "hidden"}>
                <div className="mb-2 block">
                  <Label
                    color={
                      formik.touched.ordered_items &&
                      formik.errors.ordered_items
                        ? "failure"
                        : undefined
                    }
                    htmlFor="ordered_items"
                    value="Ordered Items"
                  />
                </div>
                <TextInput
                  id="ordered_items"
                  type="number"
                  color={
                    formik.touched.ordered_items && formik.errors.ordered_items
                      ? "failure"
                      : undefined
                  }
                  helperText={
                    formik.touched.ordered_items &&
                    formik.errors.ordered_items ? (
                      <span>{formik.errors.ordered_items}</span>
                    ) : null
                  }
                  min={0}
                  {...formik.getFieldProps("ordered_items")}
                />
              </div>

              {/* Received Items input */}
              <div className={role === "ADMIN" ? "" : "hidden"}>
                <div className="mb-2 block">
                  <Label
                    color={
                      formik.touched.received_items &&
                      formik.errors.ordered_items
                        ? "failure"
                        : undefined
                    }
                    htmlFor="received_items"
                    value="Received Items"
                  />
                </div>
                <TextInput
                  id="received_items"
                  type="number"
                  color={
                    formik.touched.received_items &&
                    formik.errors.received_items
                      ? "failure"
                      : undefined
                  }
                  helperText={
                    formik.touched.received_items &&
                    formik.errors.received_items ? (
                      <span>{formik.errors.received_items}</span>
                    ) : null
                  }
                  min={0}
                  {...formik.getFieldProps("received_items")}
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
                  {item ? "Save" : "Add"}
                </Button>
              </div>
            </form>
          )}
        </Formik>
      </Modal.Body>
    </Modal>
  );
}
