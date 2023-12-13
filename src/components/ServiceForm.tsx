import { Button, Label, Modal, Select, Table, TextInput } from "flowbite-react";
import { Formik, FormikProps, useFormikContext } from "formik";
import { useEffect, useRef, useState } from "react";
import { Divider } from "@tremor/react";
import { dataFormatter } from "@/utils/Formatters";
import { number, object, string } from "yup";
import _ from "lodash";

export interface ServiceFormValues {
  acType: string;
  quantity: number;
  service: string;
  servicePrice: number;
  additional: string;
  additionalPrice: number;
  discount: number;
  discountValue: number;
  subTotal: number;
  grandTotal: number;
  modeOfPayment: string;
  customerName: string;
  customerAddress: string;
  customerContactNo: string;
}

export default function ServiceForm({ ...props }) {
  const [price, setPrice] = useState(0);
  let [subTotal, setSubTotal] = useState(0);
  const [grandTotal, setGrandTotal] = useState(0);
  const [discountPercent, setDiscountPercent] = useState(0);
  const [discountValue, setDiscountValue] = useState(0);
  const formRef = useRef<FormikProps<ServiceFormValues>>();

  const initialValues: ServiceFormValues = {
    acType: "NONE",
    quantity: 0,
    service: "NONE",
    servicePrice: 0,
    additional: "NONE",
    additionalPrice: 0,
    discount: 0,
    discountValue: 0,
    subTotal: 0,
    grandTotal: 0,
    modeOfPayment: "NONE",
    customerName: "",
    customerAddress: "",
    customerContactNo: "",
  };

  const validationSchema = object().shape({
    acType: string()
      .test(
        "is-none",
        "Please choose a mode of payment!",
        (value) => value !== undefined && value !== "NONE"
      )
      .required()
      .label("AC Type"),
    quantity: number().min(1).required().label("Quantity"),
    service: string()
      .test(
        "is-none",
        "Please choose a mode of payment!",
        (value) => value !== undefined && value !== "NONE"
      )
      .required()
      .label("Service"),
    servicePrice: number().min(0).required().label("Quantity"),
    additional: string().label("Additional"),
    additionalPrice: number()
      .when("additional", {
        is: (field: string) => field || field.toLowerCase() !== "NONE",
        then: (schema) => schema.required().min(0),
      })
      .label("Price"),
    discount: number().min(0).required().label("Discount"),
    discountValue: number().required().label("Discount Value"),
    modeOfPayment: string()
      .test(
        "is-none",
        "Please choose a mode of payment!",
        (value) => value !== undefined && value !== "NONE"
      )
      .required()
      .label("Mode of Payment"),
    customerName: string().required().label("Customer Name"),
    customerAddress: string().required().label("Customer Address"),
    customerContactNo: string()
      .test("is-number", "Must be a valid phone number", (value) => {
        if (typeof value != "string") return false; // we only process strings!
        return (
          !Number.isNaN(value) && // use type coercion to parse the _entirety_ of the string (`parseFloat` alone does not do this)...
          !Number.isNaN(Number.parseFloat(value)) // ...and ensure strings of whitespace fail
        );
      })
      .test(
        "is-ten",
        "Contact number should be equal to 10 digits!",
        (value) =>
          value !== undefined && value.replaceAll(" ", "").length === 10
      )
      .required()
      .label("Customer Contact Number"),
  });

  const FormObserver: React.FC = () => {
    const { values, setFieldValue } = useFormikContext<ServiceFormValues>();

    useEffect(() => {
      if (values.additional === "NONE") {
        setFieldValue("additionalPrice", 0);
        setPrice(0);
      } else {
        setPrice(values.additionalPrice);
      }

      setSubTotal(values.servicePrice);
      setFieldValue("subTotal", values.servicePrice);
      setDiscountPercent(values.discount);
      setDiscountValue(values.servicePrice * (values.discount / 100));
      setFieldValue(
        "discountValue",
        values.servicePrice * (values.discount / 100)
      );
      setGrandTotal(subTotal + price - discountValue);
      setFieldValue("grandTotal", subTotal + price - discountValue);
    }, [values, setFieldValue]);

    return null;
  };
  return (
    <Modal
      show={props.openModal === "service-form"}
      size="6xl"
      onClose={() => {
        props.setOpenModal(undefined);
        formRef.current?.resetForm();
      }}
    >
      <Modal.Header>Add Service</Modal.Header>
      <Modal.Body>
        <Formik
          //@ts-ignore since it works hehe.
          innerRef={formRef}
          initialValues={initialValues}
          validationSchema={validationSchema}
          onSubmit={props.handleServiceSubmit}
        >
          {(formik) => (
            <form
              className="flex flex-col gap-4"
              onSubmit={formik.handleSubmit}
            >
              <FormObserver />
              <div className="flex gap-3">
                {/* AC Type Input */}
                <div className="basis-1/4">
                  <div className="mb-2 block">
                    <Label
                      color={
                        formik.touched.acType && formik.errors.acType
                          ? "failure"
                          : undefined
                      }
                      htmlFor="acType"
                      value="AC Type"
                    />
                  </div>
                  <Select
                    id="acType"
                    color={
                      formik.touched.acType && formik.errors.acType
                        ? "failure"
                        : undefined
                    }
                    helperText={
                      formik.touched.acType && formik.errors.acType ? (
                        <span>{formik.errors.acType}</span>
                      ) : null
                    }
                    {...formik.getFieldProps("acType")}
                  >
                    <option value={"NONE"} disabled>
                      Choose a type...
                    </option>
                    <option value={"Split Type"}>Split Type</option>
                    <option value={"Window Type"}>Window Type</option>
                  </Select>
                </div>

                {/* Quantity Input */}
                <div className="basis-1/4">
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
                    id="quantity"
                    type="number"
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
                    {...formik.getFieldProps("quantity")}
                  />
                </div>

                {/* Service Input */}
                <div className="basis-1/4">
                  <div className="mb-2 block">
                    <Label
                      color={
                        formik.touched.service && formik.errors.service
                          ? "failure"
                          : undefined
                      }
                      htmlFor="service"
                      value="Service"
                    />
                  </div>
                  <Select
                    id="service"
                    color={
                      formik.touched.service && formik.errors.service
                        ? "failure"
                        : undefined
                    }
                    helperText={
                      formik.touched.service && formik.errors.service ? (
                        <span>{formik.errors.service}</span>
                      ) : null
                    }
                    {...formik.getFieldProps("service")}
                  >
                    <option value={"NONE"} disabled>
                      Choose a service...
                    </option>
                    <option value={"cleaning"}>Cleaning</option>
                    <option value={"repair"}>Repair</option>
                    <option value={"installation"}>Installation</option>
                  </Select>
                </div>

                {/* Service Pice Input */}
                <div className="basis-1/4">
                  <div className="mb-2 block">
                    <Label
                      color={
                        formik.touched.servicePrice &&
                        formik.errors.servicePrice
                          ? "failure"
                          : undefined
                      }
                      htmlFor="servicePrice"
                      value="Price"
                    />
                  </div>
                  <TextInput
                    id="servicePrice"
                    type="number"
                    color={
                      formik.touched.servicePrice && formik.errors.servicePrice
                        ? "failure"
                        : undefined
                    }
                    helperText={
                      formik.touched.servicePrice &&
                      formik.errors.servicePrice ? (
                        <span>{formik.errors.servicePrice}</span>
                      ) : null
                    }
                    {...formik.getFieldProps("servicePrice")}
                  />
                </div>
              </div>

              <div className="flex gap-3">
                {/* Additional input */}
                <div className="basis-1/3">
                  <div className="mb-2 block">
                    <Label
                      color={
                        formik.touched.additional && formik.errors.additional
                          ? "failure"
                          : undefined
                      }
                      htmlFor="additional"
                      value="Additional"
                    />
                  </div>
                  <Select
                    id="additional"
                    color={
                      formik.touched.additional && formik.errors.additional
                        ? "failure"
                        : undefined
                    }
                    helperText={
                      formik.touched.additional && formik.errors.additional ? (
                        <span>{formik.errors.additional}</span>
                      ) : null
                    }
                    {...formik.getFieldProps("additional")}
                  >
                    <option value={"NONE"}>None</option>
                    <option>Tubings</option>
                    <option>Liquid Sosa</option>
                  </Select>
                </div>

                {/* Additional Input Price */}
                {formik.values.additional === "NONE" ? null : (
                  <div className="basis-1/3">
                    <div className="mb-2 block">
                      <Label
                        color={
                          formik.touched.additional && formik.errors.additional
                            ? "failure"
                            : undefined
                        }
                        htmlFor="Price"
                        value="Price"
                      />
                    </div>
                    <TextInput
                      id="price"
                      type="number"
                      color={
                        formik.touched.additionalPrice &&
                        formik.errors.additionalPrice
                          ? "failure"
                          : undefined
                      }
                      helperText={
                        formik.touched.additionalPrice &&
                        formik.errors.additionalPrice ? (
                          <span>{formik.errors.additionalPrice}</span>
                        ) : null
                      }
                      {...formik.getFieldProps("additionalPrice")}
                    />
                  </div>
                )}

                <div className="basis-1/3">
                  <div className="mb-2">
                    <Label
                      color={
                        formik.touched.discount && formik.errors.discount
                          ? "failure"
                          : undefined
                      }
                      htmlFor="discount"
                      value="Discount %"
                    />
                  </div>
                  <TextInput
                    id="discount"
                    type="number"
                    color={
                      formik.touched.discount && formik.errors.discount
                        ? "failure"
                        : undefined
                    }
                    helperText={
                      formik.touched.discount && formik.errors.discount ? (
                        <span>{formik.errors.discount}</span>
                      ) : null
                    }
                    {...formik.getFieldProps("discount")}
                  />
                </div>
                <div className="basis-1/3">
                  <div className="mb-2">
                    <Label
                      color={
                        formik.touched.modeOfPayment &&
                        formik.errors.modeOfPayment
                          ? "failure"
                          : undefined
                      }
                      htmlFor="modeOfPayment"
                      value="Mode of Payment"
                    />
                  </div>
                  <Select
                    id="modeOfPayment"
                    color={
                      formik.touched.modeOfPayment &&
                      formik.errors.modeOfPayment
                        ? "failure"
                        : undefined
                    }
                    helperText={
                      formik.touched.modeOfPayment &&
                      formik.errors.modeOfPayment ? (
                        <span>{formik.errors.modeOfPayment}</span>
                      ) : null
                    }
                    {...formik.getFieldProps("modeOfPayment")}
                  >
                    <option value={"NONE"} disabled>
                      Choose one...
                    </option>
                    <option>GCASH</option>
                    <option>CASH</option>
                  </Select>
                </div>
              </div>

              {/* Customer fields */}
              <div className="flex gap-3">
                <div className="basis-1/3">
                  <div className="mb-2">
                    <Label
                      color={
                        formik.touched.customerName &&
                        formik.errors.customerName
                          ? "failure"
                          : undefined
                      }
                      htmlFor="customerName"
                      value="Customer Name"
                    />
                  </div>
                  <TextInput
                    id="customerName"
                    color={
                      formik.touched.customerName && formik.errors.customerName
                        ? "failure"
                        : undefined
                    }
                    helperText={
                      formik.touched.customerName &&
                      formik.errors.customerName ? (
                        <span>{formik.errors.customerName}</span>
                      ) : null
                    }
                    {...formik.getFieldProps("customerName")}
                  />
                </div>
                <div className="basis-1/3">
                  <div className="mb-2">
                    <Label
                      color={
                        formik.touched.customerContactNo &&
                        formik.errors.customerContactNo
                          ? "failure"
                          : undefined
                      }
                      htmlFor="customerContactNo"
                      value="Customer Contact Number"
                    />
                  </div>
                  <TextInput
                    id="customerContactNo"
                    addon="+63"
                    maxLength={10}
                    color={
                      formik.touched.customerContactNo &&
                      formik.errors.customerContactNo
                        ? "failure"
                        : undefined
                    }
                    helperText={
                      formik.touched.customerContactNo &&
                      formik.errors.customerContactNo ? (
                        <span>{formik.errors.customerContactNo}</span>
                      ) : null
                    }
                    onBlurCapture={() =>
                      (formik.values.customerContactNo =
                        formik.values.customerContactNo.replaceAll(" ", "")
                          .length === 10
                          ? formik.values.customerContactNo.replace(
                              /(\d{3})(\d{3})(\d{4})/,
                              "$1 $2 $3"
                            )
                          : formik.values.customerContactNo.replaceAll(" ", ""))
                    }
                    {...formik.getFieldProps("customerContactNo")}
                  />
                </div>
                <div className="basis-1/3">
                  <div className="mb-2">
                    <Label
                      color={
                        formik.touched.customerAddress &&
                        formik.errors.customerAddress
                          ? "failure"
                          : undefined
                      }
                      htmlFor="customerAddress"
                      value="Customer Address"
                    />
                  </div>
                  <TextInput
                    id="customerAddress"
                    color={
                      formik.touched.customerAddress &&
                      formik.errors.customerAddress
                        ? "failure"
                        : undefined
                    }
                    helperText={
                      formik.touched.customerAddress &&
                      formik.errors.customerAddress ? (
                        <span>{formik.errors.customerAddress}</span>
                      ) : null
                    }
                    {...formik.getFieldProps("customerAddress")}
                  />
                </div>
              </div>
              <Divider className="my-3" />
              <div className="flex">
                <div className="basis-1/2">
                  <h5 className="mb-1">Customer</h5>
                  <Table>
                    <Table.Body className="text-left text-base">
                      <Table.Row>
                        <Table.Cell className="py-0 pl-0">Name:</Table.Cell>
                        <Table.Cell className="py-0 pl-0">
                          {formik.values.customerName}
                        </Table.Cell>
                      </Table.Row>
                      <Table.Row>
                        <Table.Cell className="py-0 pl-0">Email:</Table.Cell>
                        <Table.Cell className="py-0 pl-0">
                          {formik.values.customerAddress}
                        </Table.Cell>
                      </Table.Row>
                      <Table.Row>
                        <Table.Cell className="py-0 pl-0">Contact:</Table.Cell>
                        <Table.Cell className="py-0 pl-0">
                          {!formik.values.customerContactNo
                            ? null
                            : `+63 ${formik.values.customerContactNo}`}
                        </Table.Cell>
                      </Table.Row>
                      <Table.Row>
                        <Table.Cell className="py-0 pl-0">AC Type:</Table.Cell>
                        <Table.Cell className="py-0 pl-0">
                          {formik.values.acType === "NONE"
                            ? ""
                            : formik.values.acType}
                        </Table.Cell>
                      </Table.Row>
                      <Table.Row>
                        <Table.Cell className="py-0 pl-0">Quantity:</Table.Cell>
                        <Table.Cell className="py-0 pl-0">
                          {formik.values.quantity === 0
                            ? ""
                            : formik.values.quantity}
                        </Table.Cell>
                      </Table.Row>
                      <Table.Row>
                        <Table.Cell className="py-0 pl-0">Service:</Table.Cell>
                        <Table.Cell className="py-0 pl-0">
                          {formik.values.service === "NONE"
                            ? ""
                            : _.startCase(formik.values.service)}
                        </Table.Cell>
                      </Table.Row>
                    </Table.Body>
                  </Table>
                </div>
                <div className="basis-1/2 text-right mt-auto">
                  <Table>
                    <Table.Body className="text-right text-base">
                      <Table.Row>
                        <Table.Cell className="py-0 pr-0">SUBTOTAL:</Table.Cell>
                        <Table.Cell className="py-0 pr-0">
                          {dataFormatter(subTotal)}
                        </Table.Cell>
                      </Table.Row>
                      <Table.Row>
                        <Table.Cell className="py-0 pr-0">
                          ADDITIONAL:
                        </Table.Cell>
                        <Table.Cell className="py-0 pr-0">
                          {dataFormatter(formik.values.additionalPrice)}
                        </Table.Cell>
                      </Table.Row>
                      <Table.Row>
                        <Table.Cell className="py-0 pr-0">DISCOUNT:</Table.Cell>
                        <Table.Cell className="py-0 pr-0">
                          {dataFormatter(discountValue)} ({discountPercent}
                          %)
                        </Table.Cell>
                      </Table.Row>
                      <Table.Row className="text-zinc-800 dark:text-zinc-100">
                        <Table.Cell className="py-0 pr-0">
                          <h5>GRAND TOTAL:</h5>
                        </Table.Cell>
                        <Table.Cell className="py-0 pr-0">
                          <h5>{dataFormatter(grandTotal)}</h5>
                        </Table.Cell>
                      </Table.Row>
                    </Table.Body>
                  </Table>
                </div>
              </div>
              <Button
                color="success"
                type="submit"
                isProcessing={formik.isSubmitting}
              >
                Submit
              </Button>
            </form>
          )}
        </Formik>
      </Modal.Body>
    </Modal>
  );
}
