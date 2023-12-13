"use client";

import Receipt from "@/components/Receipt";
import Loading from "@/components/Loading";
import TransactionsForm, {
  TransactionFormValues,
} from "@/components/TransactionsForm";
import { Item } from "@/interfaces/Items";
import { Transactions } from "@/interfaces/Transactions";
import { Database } from "@/lib/database.types";
import { dataFormatter } from "@/utils/Formatters";
import { createBrowserClient } from "@supabase/ssr";
import { User } from "@supabase/supabase-js";
import {
  Accordion,
  AccordionBody,
  AccordionHeader,
  Badge,
  Card,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeaderCell,
  TableRow,
  Text,
  Title,
} from "@tremor/react";
import {
  Button,
  Datepicker,
  Dropdown,
  Label,
  Modal,
  Pagination,
  Select,
  TextInput,
} from "flowbite-react";
import { FormikHelpers } from "formik";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import { useEffect, useState } from "react";
import { GrDocumentPdf, GrTransaction } from "react-icons/gr";
import { HiOutlinePlus, HiOutlineSearch } from "react-icons/hi";
import { toast } from "react-toastify";
import { MdCleaningServices } from "react-icons/md";
import ServiceForm, { ServiceFormValues } from "@/components/ServiceForm";

// export const metadata: Metadata = {
//   title: "Transactions",
// };

export default function TransactionsPage() {
  const [transactionList, setTransactionList] = useState<Transactions[]>([]);
  const [transaction, setTransaction] = useState<Transactions | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [items, setItems] = useState<Item[]>([]);
  const [filteredItems, setFilteredItems] = useState<Transactions[]>([]);
  const [openModal, setOpenModal] = useState<string | undefined>();
  const [searchTerm, setSearchTerm] = useState("");
  const [dates, setDates] = useState<Date[]>([new Date(), new Date()]);
  const [user, setUser] = useState<User | null>();
  const [searchCategory, setSearchCategory] = useState<"ref" | "cust_name">(
    "ref"
  );

  // For pagination
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [itemOffset, setItemOffset] = useState(0);
  const [pageCount, setPageCount] = useState(0);
  const [currentItems, setCurrentItems] = useState<Transactions[]>([]);

  useEffect(() => {
    const getTransactionList = async () => {
      const res = await fetch("/api/transactions");
      const data = await res.json();

      setTransactionList(data);
      console.log(data);
      setFilteredItems(data);
    };

    const getItems = async () => {
      const res = await fetch("/api/items");
      const items = await res.json();
      const supabase = createBrowserClient<Database>(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
      );
      const { data } = await supabase.auth.getUser();

      setUser(data.user);
      setItems(items);
      setLoading(false);
    };

    if (!transactionList.length) {
      getTransactionList();
      getItems();
    }
  }, [transactionList.length]);

  // useEffect for search bar
  useEffect(() => {
    const filteredItems = transactionList.filter((transaction) =>
      transaction[searchCategory]
        ?.toLowerCase()
        .includes(searchTerm.toLowerCase())
    );
    setFilteredItems(filteredItems);
  }, [searchCategory, searchTerm, transactionList]);

  // useEffect for item pagination
  useEffect(() => {
    const endOffset = itemOffset + itemsPerPage;
    setCurrentItems(filteredItems.slice(itemOffset, endOffset));
    setPageCount(Math.ceil(filteredItems.length / itemsPerPage));
  }, [filteredItems, itemOffset, itemsPerPage]);

  async function handleTransSubmit(
    values: TransactionFormValues,
    { setSubmitting }: FormikHelpers<TransactionFormValues>
  ) {
    setSubmitting(true);
    const itemCodes = values.items.map((item) => {
      return {
        item: items[item.code].code,
        quantity: item.quantity,
      };
    });

    const { status, statusText } = await fetch("/api/transactions", {
      method: "POST",
      body: JSON.stringify(
        { ...values, staffId: user?.id, itemCodes },
        null,
        2
      ),
    });

    if (status === 200) {
      toast.success("Transaction added!");
      setTransactionList([]);
      setItems([]);
    } else {
      toast.error(
        "Something went wrong! Please contact administrator for support!"
      );
    }
    setOpenModal(undefined);
  }

  async function handleServiceSubmit(
    values: ServiceFormValues,
    { setSubmitting }: FormikHelpers<ServiceFormValues>
  ) {
    setSubmitting(true);

    const { status } = await fetch("/api/transactions", {
      method: "POST",
      body: JSON.stringify({ ...values, staffId: user?.id }, null, 2),
    });

    if (status === 200) {
      toast.success("Service Transaction added!");
      setTransactionList([]);
    } else {
      toast.error(
        "Something went wrong! Please contact administrator for support!"
      );
    }
    setOpenModal(undefined);
  }

  // Add Transaction Form props
  const transactionFormProps = {
    openModal,
    setOpenModal,
    handleTransSubmit,
    items,
  };

  const serviceFormProps = { openModal, setOpenModal, handleServiceSubmit };

  const invoiceProps = { openModal, setOpenModal, transaction };

  // handleDateRangeClick
  async function handleDateRangeClick(value: Date, i: number) {
    const newDate = dates.map((v, idx) => {
      if (idx === i) {
        return (v = value);
      } else {
        return v;
      }
    });

    setDates(newDate);
  }

  async function generateReport() {
    const doc = new jsPDF({
      orientation: "l",
    });

    /**
     * ("2023-11-16T17:19:48.990Z").split("T")[0] = "2023-11-02"
     */
    const transactionRange = transactionList.filter(
      ({ trans_date }) =>
        new Date(trans_date.split("T")[0]).getTime() >=
          new Date(dates[0].toISOString().split("T")[0]).getTime() &&
        new Date(trans_date.split("T")[0]).getTime() <=
          new Date(dates[1].toISOString().split("T")[0]).getTime()
    );

    const totalEarning = transactionRange
      .map((value) => value.total_price)
      .reduce((accumulator, currentValue) => accumulator + currentValue, 0);

    const body: any[] = [];
    transactionRange.forEach((value) => {
      body.push({
        id: value.id,
        receiptNo: value.ref,
        totalItems: value.item_code
          .map((item) => JSON.parse(item).quantity)
          .reduce((accumulator, currentValue) => accumulator + currentValue, 0),
        totalAmount: `Php ${dataFormatter(value.total_price).slice(1)}`,
        modeOfPayment: value.mode_of_payment,
        customer: value.cust_name,
        date: new Date(value.trans_date).toLocaleString("en-US", {
          timeStyle: "short",
          dateStyle: "short",
        }),
        remarks: value.trans_type,
      });
    });

    autoTable(doc, {
      theme: "grid",
      head: [
        {
          id: "ID",
          receiptNo: "Receipt No.",
          totalItems: "Total Items",
          totalAmount: "Total Amount",
          modeOfPayment: "Mode of Payment",
          customer: "Customer",
          date: "Date",
          remarks: "Remarks",
        },
      ],
      body,
      willDrawPage: (data) => {
        // Header
        doc.setFontSize(20);
        doc.text(
          `Transaction Report - [${dates[0].toLocaleDateString("en-PH", {
            dateStyle: "medium",
          })} - ${dates[1].toLocaleDateString("en-PH", {
            dateStyle: "medium",
          })}]`,
          data.settings.margin.left,
          10
        );
      },
      didDrawPage: (data) => {
        // Footer
        doc.setFontSize(10);
        let pageSize = doc.internal.pageSize;
        let pageHeight = pageSize.getHeight();
        doc.text(
          `Generated by: ${user?.email}`,
          data.settings.margin.left,
          pageHeight - 10
        );
      },
    });

    doc.text(
      `Total Earning: Php ${dataFormatter(totalEarning).slice(1)}`,
      // @ts-ignore
      doc.lastAutoTable.settings.margin.right,
      // @ts-ignore
      doc.lastAutoTable.finalY + 10
    );

    if (process.env.NODE_ENV) {
      window.open(URL.createObjectURL(doc.output("blob")));
    } else {
      doc.save(
        `Transaction Report - [${dates[0].toLocaleDateString("en-PH", {
          dateStyle: "medium",
        })} - ${dates[1].toLocaleDateString("en-PH", {
          dateStyle: "medium",
        })}].pdf`
      );
    }
  }

  return (
    <div>
      <Card>
        <div className="flex items-center mb-4">
          <Title>Transactions</Title>
          {loading ? null : (
            <div className="flex gap-6 ml-auto items-center">
              <div className="flex items-center space-x-2">
                <p>Show</p>
                <Select
                  id="page-count"
                  defaultValue={"10"}
                  onChange={(event) => {
                    setItemOffset(0);
                    setItemsPerPage(Number(event.target.value));
                    setCurrentPage(1);
                  }}
                >
                  <option value="5">5</option>
                  <option value="10">10</option>
                  <option value="20">20</option>
                  <option value="50">50</option>
                  <option value="100">100</option>
                </Select>
                <p>per page</p>
              </div>
              <Select
                onChange={(event) =>
                  setSearchCategory(event.target.value as "ref" | "cust_name")
                }
              >
                <option value="ref">Transaction No.</option>
                <option value="cust_name">Customer Name</option>
              </Select>
              <TextInput
                icon={HiOutlineSearch}
                value={searchTerm}
                onChange={(event) => setSearchTerm(event.target.value)}
                placeholder="Search..."
              />
              <Button color="blue" onClick={() => setOpenModal("date-picker")}>
                <GrDocumentPdf className="h-5 w-5" />
                <p className="ml-2">Generate Report</p>
              </Button>
              <Dropdown
                color="success"
                label={
                  <>
                    <HiOutlinePlus className="h-5 w-5" />
                    <p className="ml-2">Add</p>
                  </>
                }
              >
                <Dropdown.Item
                  icon={GrTransaction}
                  onClick={() => {
                    transactionFormProps.setOpenModal("transaction-form");
                  }}
                >
                  Transaction
                </Dropdown.Item>
                <Dropdown.Item
                  icon={MdCleaningServices}
                  onClick={() => {
                    serviceFormProps.setOpenModal("service-form");
                  }}
                >
                  Service
                </Dropdown.Item>
              </Dropdown>
            </div>
          )}
        </div>
        <div>
          {loading ? (
            <Loading />
          ) : (
            <>
              <Table>
                <TableHead>
                  <TableRow className="border-b ">
                    <TableHeaderCell>ID</TableHeaderCell>
                    <TableHeaderCell>Transaction No.</TableHeaderCell>
                    <TableHeaderCell className="text-center">
                      Total Items
                    </TableHeaderCell>
                    <TableHeaderCell className="text-center">
                      Total Amount
                    </TableHeaderCell>
                    <TableHeaderCell className="text-center">
                      Mode of Payment
                    </TableHeaderCell>
                    <TableHeaderCell>Customer Info</TableHeaderCell>
                    <TableHeaderCell>Date</TableHeaderCell>
                    <TableHeaderCell className="text-center">
                      Transaction Type
                    </TableHeaderCell>
                    <TableHeaderCell className="text-center">
                      Remarks
                    </TableHeaderCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {currentItems.map((transaction) => (
                    <TableRow key={transaction.id}>
                      <TableCell>
                        <Text>{transaction.id}</Text>
                      </TableCell>
                      <TableCell>
                        <div
                          className="font-bold text-orange-400 hover:opacity-80 hover:underline hover:cursor-pointer"
                          onClick={() => {
                            setTransaction(transaction);
                            invoiceProps.setOpenModal("open-invoice");
                          }}
                        >
                          {transaction.ref}
                        </div>
                      </TableCell>
                      <TableCell>
                        <Text className="text-center">
                          {transaction.item_code
                            ? transaction.item_code
                                .map((item) => JSON.parse(item).quantity)
                                .reduce(
                                  (accumulator, currentValue) =>
                                    accumulator + currentValue,
                                  0
                                )
                            : transaction.quantity}
                        </Text>
                      </TableCell>
                      <TableCell>
                        <Text className="text-center">
                          {dataFormatter(transaction.total_price)}
                        </Text>
                      </TableCell>
                      <TableCell className="text-center">
                        <Badge
                          color={
                            transaction.mode_of_payment === "GCASH"
                              ? "blue"
                              : "green"
                          }
                        >
                          {transaction.mode_of_payment}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Accordion>
                          <AccordionHeader className="border-b dark:border-b-zinc-700">
                            <span className="font-bold">
                              {transaction.cust_name}
                            </span>
                          </AccordionHeader>
                          <AccordionBody className="flex flex-col mt-2 transition ease-out duration-500">
                            <table>
                              <tbody>
                                <tr>
                                  <td>
                                    <span className="font-bold">Address:</span>
                                  </td>
                                  <td>{transaction.cust_address}</td>
                                </tr>
                                <tr>
                                  <td>
                                    <span className="font-bold">
                                      Contact No.:
                                    </span>
                                  </td>
                                  <td>{transaction.cust_phone}</td>
                                </tr>
                              </tbody>
                            </table>
                          </AccordionBody>
                        </Accordion>
                      </TableCell>
                      <TableCell>
                        <Text>
                          {new Date(
                            transaction.trans_date
                          ).toLocaleDateString()}
                        </Text>
                      </TableCell>
                      <TableCell className="text-center">
                        <Text>
                          {transaction.service ? "Service" : "Transaction"}
                        </Text>
                      </TableCell>
                      <TableCell className="text-center">
                        <Text>{transaction.trans_type}</Text>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
              <div className="flex items-center justify-center text-center border-t pt-2">
                <Pagination
                  showIcons
                  currentPage={currentPage}
                  onPageChange={(page) => {
                    const newOffset =
                      ((page - 1) * itemsPerPage) % transactionList.length;
                    setCurrentPage(page);
                    setItemOffset(newOffset);
                  }}
                  totalPages={pageCount}
                />
              </div>
            </>
          )}
        </div>
      </Card>

      <Receipt {...invoiceProps} />

      {/* Transaction Form */}
      <TransactionsForm {...transactionFormProps} />

      {/* Service Form */}
      <ServiceForm {...serviceFormProps} />

      {/* Date Range Picker Modal */}
      <Modal
        show={openModal === "date-picker"}
        onClose={() => {
          setOpenModal(undefined);
          setDates([new Date(), new Date()]);
        }}
      >
        <Modal.Header>Select Date Range</Modal.Header>
        <Modal.Body className="overflow-visible">
          <div className="flex justify-around">
            <div>
              <div className="mb-2">
                <Label value="From" />
                <Datepicker
                  maxDate={new Date()}
                  onSelectedDateChanged={(date) => {
                    handleDateRangeClick(date, 0);
                  }}
                />
              </div>
            </div>
            <div>
              <div className="mb-2">
                <Label value="To" />
                <Datepicker
                  maxDate={new Date()}
                  onSelectedDateChanged={(date) =>
                    handleDateRangeClick(date, 1)
                  }
                />
              </div>
            </div>
          </div>
        </Modal.Body>
        <Modal.Footer>
          <Button onClick={() => generateReport()}>Generate</Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
}
