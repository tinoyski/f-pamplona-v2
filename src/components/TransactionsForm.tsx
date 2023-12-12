import { Item } from "@/interfaces/Items";
import { dataFormatter } from "@/utils/Formatters";
import { Divider } from "@tremor/react";
import { Button, Label, Modal, Select, Table, TextInput } from "flowbite-react";
import { FieldArray, Formik, FormikProps, useFormikContext } from "formik";
import React, { useEffect, useRef, useState } from "react";
import { HiOutlinePlus, HiOutlineX } from "react-icons/hi";
import { array, number, object, string } from "yup";

export interface TransactionFormValues {
  items: [
    {
      code: number;
      quantity: number;
    }
  ];
  additional: string;
  price: number;
  discount: number;
  discountValue: number;
  subTotal: number;
  grandTotal: number;
  modeOfPayment: string;
  customerName: string;
  customerAddress: string;
  customerContactNo: string;
  transactionType: string;
}

export default function TransactionsForm({ ...props }) {
  const items = props.items as Item[];
  // const [transactionList, setTransactionList] = useState<Transactions[]>([]);
  const [price, setPrice] = useState(0);
  let [subTotal, setSubTotal] = useState(0);
  const [grandTotal, setGrandTotal] = useState(0);
  const [discountPercent, setDiscountPercent] = useState(0);
  const [discountValue, setDiscountValue] = useState(0);

  const formRef = useRef<FormikProps<TransactionFormValues>>();

  const initialValues: TransactionFormValues = {
    items: [
      {
        code: 0,
        quantity: 1,
      },
    ],
    additional: "NONE",
    price: 0,
    discount: 0,
    discountValue: 0,
    subTotal: 0,
    grandTotal: 0,
    modeOfPayment: "NONE",
    customerName: "",
    customerAddress: "",
    customerContactNo: "",
    transactionType: "NONE",
  };

  const validationSchema = object().shape({
    additional: string().label("Additional"),
    price: number()
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
    transactionType: string().required().label("Remarks"),
  });

  // Create observer for formik additional value
  const FormObserver: React.FC = () => {
    const { values, setFieldValue } = useFormikContext<TransactionFormValues>();

    useEffect(() => {
      if (values.additional === "NONE") {
        setFieldValue("price", 0);
        setPrice(0);
      } else {
        setPrice(values.price);
      }

      let filteredItems = [];
      // TODO: filter items by index
      // Calculate the sum
      let sum = 0;
      values.items.map(({ code: item, quantity }) => {
        sum += items[item].unit_price * quantity;
      });

      setSubTotal(sum);
      setFieldValue("subTotal", sum);
      setDiscountPercent(values.discount);
      setDiscountValue(sum * (values.discount / 100));
      setFieldValue("discountValue", sum * (values.discount / 100));
      setGrandTotal(subTotal + price - discountValue);
      setFieldValue("grandTotal", subTotal + price - discountValue);
    }, [values, setFieldValue]);

    return null;
  };

  return (
    <Modal
      show={props.openModal === "transaction-form"}
      size="6xl"
      popup
      onClose={() => {
        props.setOpenModal(undefined);
        formRef.current?.resetForm();
      }}
    >
      <Modal.Header className="mr-2 flex items-center justify-center">
        <p className="pl-4 mt-2">Add Transaction</p>
      </Modal.Header>
      <Modal.Body>
        <div className="mt-3">
          <Formik
            //@ts-ignore since it works hehe.
            innerRef={formRef}
            initialValues={initialValues}
            validationSchema={validationSchema}
            onSubmit={props.handleTransSubmit}
          >
            {(formik) => (
              <form
                className="flex flex-col gap-4"
                onSubmit={formik.handleSubmit}
              >
                <FormObserver />
                <div>
                  {/* Items Input */}
                  <FieldArray name="items">
                    {(arrayHelper) => (
                      <div className="flex flex-col gap-3">
                        {formik.values.items.length > 0 &&
                          formik.values.items.map((item, i) => (
                            <div key={i} className="flex gap-3 group">
                              <div className="basis-1/2">
                                <div className="mb-2">
                                  <Label
                                    htmlFor={`items.${i}.code`}
                                    value={`Item ${i + 1}`}
                                  />
                                </div>
                                <Select
                                  id={`items.${i}.code`}
                                  {...formik.getFieldProps(`items.${i}.code`)}
                                >
                                  {items.map((item, i) => (
                                    <option key={item.id} value={i}>
                                      {item.name}
                                    </option>
                                  ))}
                                </Select>
                              </div>
                              {!formik.values.items[i] ? null : (
                                <div className="flex gap-3 w-full">
                                  <div className="basis-1/3">
                                    <div className="mb-2 block">
                                      <Label
                                        htmlFor="availableQuantity"
                                        value="Available Quantity"
                                      />
                                    </div>
                                    <TextInput
                                      id="availableQuantity"
                                      readOnly
                                      value={
                                        items[formik.values.items[i].code]
                                          .quantity
                                      }
                                    />
                                  </div>

                                  <div className="basis-1/3">
                                    <div className="mb-2 block">
                                      <Label
                                        htmlFor="unitPrice"
                                        value="Unit Price"
                                      />
                                    </div>
                                    <TextInput
                                      id="unitPrice"
                                      readOnly
                                      value={
                                        items[formik.values.items[i].code]
                                          .unit_price
                                      }
                                    />
                                  </div>
                                  <div className="basis-1/3">
                                    <div className="mb-2 block">
                                      <Label
                                        htmlFor={`items.${i}.quantity`}
                                        value="Quantity"
                                      />
                                    </div>
                                    <TextInput
                                      id={`items.${i}.quantity`}
                                      type="number"
                                      className="w-full"
                                      max={
                                        items[formik.values.items[i].code]
                                          .quantity
                                      }
                                      min={1}
                                      {...formik.getFieldProps(
                                        `items.${i}.quantity`
                                      )}
                                    />
                                  </div>
                                </div>
                              )}
                              {i === 0 ? null : (
                                <Button
                                  color="failure"
                                  className="hidden group-hover:block mt-auto"
                                  onClick={() => arrayHelper.remove(i)}
                                >
                                  <p>Delete</p>
                                </Button>
                              )}
                            </div>
                          ))}
                        <Button
                          color="success"
                          className="w-fit"
                          onClick={() =>
                            arrayHelper.push({
                              code: formik.values.items.length,
                              quantity: 1,
                            })
                          }
                        >
                          <HiOutlinePlus className="h-5 w-5" />
                          <p>Add</p>
                        </Button>
                      </div>
                    )}
                  </FieldArray>
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
                        formik.touched.additional &&
                        formik.errors.additional ? (
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
                            formik.touched.additional &&
                            formik.errors.additional
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
                          formik.touched.price && formik.errors.price
                            ? "failure"
                            : undefined
                        }
                        helperText={
                          formik.touched.price && formik.errors.price ? (
                            <span>{formik.errors.price}</span>
                          ) : null
                        }
                        {...formik.getFieldProps("price")}
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
                  <div className="basis-1/4">
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
                        formik.touched.customerName &&
                        formik.errors.customerName
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
                  <div className="basis-1/4">
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
                            : formik.values.customerContactNo.replaceAll(
                                " ",
                                ""
                              ))
                      }
                      {...formik.getFieldProps("customerContactNo")}
                    />
                  </div>
                  <div className="basis-1/4">
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
                  <div className="basis-1/4">
                    <div className="mb-2">
                      <Label
                        color={
                          formik.touched.transactionType &&
                          formik.errors.transactionType
                            ? "failure"
                            : undefined
                        }
                        htmlFor="transactionType"
                        value="Remarks"
                      />
                    </div>
                    <Select
                      id="transactionType"
                      color={
                        formik.touched.transactionType &&
                        formik.errors.transactionType
                          ? "failure"
                          : undefined
                      }
                      helperText={
                        formik.touched.transactionType &&
                        formik.errors.transactionType ? (
                          <span>{formik.errors.transactionType}</span>
                        ) : null
                      }
                      {...formik.getFieldProps("transactionType")}
                    >
                      <option value={"NONE"} disabled>
                        Choose one...
                      </option>
                      <option value="ONLINE">Online</option>
                      <option value="WALK-IN">Walk-In</option>
                    </Select>
                  </div>
                </div>
                <Divider />
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
                          <Table.Cell className="py-0 pl-0">
                            Contact:
                          </Table.Cell>
                          <Table.Cell className="py-0 pl-0">
                            {!formik.values.customerContactNo
                              ? null
                              : `+63 ${formik.values.customerContactNo}`}
                          </Table.Cell>
                        </Table.Row>
                      </Table.Body>
                    </Table>
                  </div>
                  <div className="basis-1/2 text-right">
                    <Table>
                      <Table.Body className="text-right text-base">
                        <Table.Row>
                          <Table.Cell className="py-0 pr-0">
                            SUBTOTAL:
                          </Table.Cell>
                          <Table.Cell className="py-0 pr-0">
                            {dataFormatter(subTotal)}
                          </Table.Cell>
                        </Table.Row>
                        <Table.Row>
                          <Table.Cell className="py-0 pr-0">
                            ADDITIONAL:
                          </Table.Cell>
                          <Table.Cell className="py-0 pr-0">
                            {dataFormatter(formik.values.price)}
                          </Table.Cell>
                        </Table.Row>
                        <Table.Row>
                          <Table.Cell className="py-0 pr-0">
                            DISCOUNT:
                          </Table.Cell>
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
        </div>
      </Modal.Body>
    </Modal>
  );
}
