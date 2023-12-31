import { Item } from "@/interfaces/Items";
import { Transactions } from "@/interfaces/Transactions";
import { dataFormatter, jsPDFReceiptTemplate } from "@/utils/Formatters";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeaderCell,
  TableRow,
} from "@tremor/react";
import { Button, Modal } from "flowbite-react";
import { useEffect, useState } from "react";
import { HiPrinter } from "react-icons/hi";
import Loading from "./Loading";
import _ from "lodash";

interface ReceiptProps {
  transaction: Transactions | null;
  openModal: string | undefined;
  setOpenModal: any;
}

interface TransactionItem {
  item: Item;
  quantity: number;
}

export default function Receipt({
  transaction,
  openModal,
  setOpenModal,
}: ReceiptProps) {
  const [items, setItems] = useState<TransactionItem[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  const fetchItems = async (
    code: string,
    quantity: number
  ): Promise<TransactionItem> => {
    const response = await fetch(`/api/items?code=${code}`);
    const data = await response.json();
    return {
      item: data,
      quantity: quantity,
    };
  };
  useEffect(() => {
    if (transaction?.item_code) {
      const promises: Promise<TransactionItem>[] = transaction?.item_code.map(
        (value) => {
          const json = JSON.parse(value);
          return fetchItems(json.item, json.quantity);
        }
      )!;

      if (promises) {
        Promise.all(promises).then((items) => {
          setLoading(false);
          setItems(items);
        });
      }
    } else {
      setLoading(false);
      console.log(transaction);
    }
  }, [transaction?.item_code, transaction]);

  function generateTemplate(
    transaction: Transactions | null,
    items: TransactionItem[]
  ) {
    const invoicePDF = jsPDFReceiptTemplate({
      returnJsPDFDocObject: true,
      fileName: `Receipt ${new Date().getFullYear()}`,
      orientationLandscape: false,
      compress: true,
      logo: {
        src: "https://i.imgur.com/xSkoPoi.png",
        width: 35, //aspect ratio = width/height
        height: 25,
        margin: {
          top: 0, //negative or positive num, from the current position
          left: 0, //negative or positive num, from the current position
        },
      },
      business: {
        name: "F. Pamplona's Refrigeration and\nAir Conditioning Services",
        address: "Zone 3 Borol 2nd, Balagtas Bulacan",
        phone: "(+63) 932 415 6997",
        email: "pampystrading@gmail.com",
        website: "https://www.facebook.com/fpamplonarefandaircon",
      },
      contact: {
        label: "Receipt issued for:",
        name: transaction?.cust_name,
        address: transaction?.cust_address,
        phone: `(+63) ${transaction?.cust_phone}`,
      },
      receipt: {
        label: "Receipt #: ",
        num: +transaction?.ref.split("-")[1]!,
        invGenDate: `Payment Date: ${new Date(
          transaction?.trans_date!
        ).toLocaleString("en-US", {
          timeZone: "Asia/Manila",
          timeStyle: "short",
          dateStyle: "short",
        })}`,
        headerBorder: true,
        tableBodyBorder: true,
        header: [
          {
            title: "QTY",
            style: {
              width: 15,
            },
          },
          {
            title: transaction?.service ? "AC TYPE" : "ITEM",
            style: {
              width: 80,
            },
          },
          {
            title: transaction?.service ? "SERVICE" : "UNIT PRICE",
          },
          {
            title: transaction?.service ? "PRICE" : "AMOUNT",
          },
        ],
        table: items.length
          ? items.map(({ item, quantity }) => [
              quantity,
              item.name,
              `Php ${dataFormatter(item.unit_price).slice(1)}`,
              `Php ${dataFormatter(item.unit_price * quantity).slice(1)}`,
            ])
          : [
              [
                transaction?.quantity,
                transaction?.ac_type,
                _.startCase(transaction?.service!),
                `Php ${dataFormatter(+transaction?.service_price!).slice(1)}`,
              ],
            ],
        additionalRows: [
          {
            col1: "SUB TOTAL:",
            col3: items.length
              ? `Php ${dataFormatter(
                  items.reduce(
                    (prev, curr) => prev + curr.item.unit_price * curr.quantity,
                    0
                  )
                ).slice(1)}`
              : `Php ${dataFormatter(+transaction?.service_price!).slice(1)}`,
            style: {
              fontSize: 10, //optional, default 12
            },
          },
          {
            col1: "ADDITIONAL:",
            col3: transaction?.additional!,
            style: {
              fontSize: 10, //optional, default 12
            },
          },
          {
            col1: "DISCOUNT:",
            col3: `Php ${dataFormatter(transaction?.discount_amount!).slice(
              1
            )} (${transaction?.discount_percentage!}%)`,
            style: {
              fontSize: 10, //optional, default 12
            },
          },
          {
            col1: "GRAND TOTAL:",
            col3: `Php ${dataFormatter(transaction?.total_price!).slice(1)}`,
            style: {
              fontSize: 14, //optional, default 12
            },
          },
        ],
      },
      footer: {
        text: "The invoice is created on a computer and is valid without the signature and stamp.",
      },
      pageEnable: true,
      pageLabel: "Page ",
    });

    invoicePDF.doc.autoPrint();
    invoicePDF.doc.output("dataurlnewwindow");
  }

  return (
    <Modal
      show={openModal === "open-invoice"}
      size={"3xl"}
      onClose={() => {
        setLoading(items.length ? true : false);
        setOpenModal(undefined);
        setItems([]);
      }}
    >
      <Modal.Header>Receipt</Modal.Header>
      <Modal.Body>
        {loading ? (
          <Loading />
        ) : (
          <div className="flex flex-col">
            <div className="mb-3">
              <Button
                size="sm"
                color="dark"
                className="bg-zinc-800 pr-2"
                onClick={() => generateTemplate(transaction, items)}
              >
                <HiPrinter className="w-5 h-5 mr-1" />
                <p>Print</p>
              </Button>
            </div>
            <div className="flex mb-5">
              <div className="flex flex-col">
                <strong>Bill to:</strong>
                <p className="font-light">{transaction?.cust_name}</p>
                <p>{transaction?.cust_address}</p>
                <p>{transaction?.cust_phone}</p>
              </div>
              <div className="ml-auto">
                <table>
                  <tbody className="text-right">
                    <tr>
                      <td className="pr-8">
                        <strong>Receipt #</strong>
                      </td>
                      <td>{transaction?.ref}</td>
                    </tr>
                    <tr>
                      <td className="pr-8">
                        <strong>Payment Date</strong>
                      </td>
                      <td>
                        {new Date(
                          transaction?.trans_date!
                        ).toLocaleDateString()}
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
            <Table>
              <TableHead>
                <TableRow className="bg-zinc-800">
                  <TableHeaderCell className="text-white text-center">
                    QTY
                  </TableHeaderCell>
                  <TableHeaderCell className="text-white">
                    {transaction?.service ? "AC TYPE" : "ITEM"}
                  </TableHeaderCell>
                  <TableHeaderCell className="text-white text-center">
                    {transaction?.service ? "SERVICE" : "UNIT PRICE"}
                  </TableHeaderCell>
                  <TableHeaderCell className="text-white text-center">
                    {transaction?.service ? "PRICE" : "AMOUNT"}
                  </TableHeaderCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {items.length ? (
                  items.map(({ item, quantity }) => (
                    <TableRow key={item.code}>
                      <TableCell className="border-x border-b text-center">
                        {quantity}
                      </TableCell>
                      <TableCell className="border-x border-b">
                        {item.name}
                      </TableCell>
                      <TableCell className="border-x border-b text-center">
                        {dataFormatter(item.unit_price)}
                      </TableCell>
                      <TableCell className="border-x border-b text-center">
                        {dataFormatter(item.unit_price * quantity)}
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell className="border-x border-b text-center">
                      {transaction?.quantity}
                    </TableCell>
                    <TableCell className="border-x border-b">
                      {transaction?.ac_type}
                    </TableCell>
                    <TableCell className="border-x border-b text-center">
                      {_.startCase(transaction?.service!)}
                    </TableCell>
                    <TableCell className="border-x border-b text-center">
                      {dataFormatter(+transaction?.service_price!)}
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
            <div className="flex pt-8">
              <Table className="ml-auto overflow-visible">
                <TableBody className="text-base">
                  <TableRow>
                    <TableCell className="py-0 pr-0 text-right ">
                      SUB TOTAL:
                    </TableCell>
                    <TableCell className="py-0 pr-0 text-right ">
                      {dataFormatter(
                        items.length
                          ? items.reduce(
                              (prev, curr) =>
                                prev + curr.item.unit_price * curr.quantity,
                              0
                            )
                          : +transaction?.service_price!
                      ).slice(1)}
                    </TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell className="py-0 pr-0 text-right ">
                      ADDITIONAL:
                    </TableCell>
                    <TableCell className="py-0 pr-0 text-right ">
                      {transaction?.additional}
                    </TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell className="py-0 pr-0 text-right ">
                      DISCOUNT:
                    </TableCell>
                    <TableCell className="py-0 pr-0 text-right ">
                      {dataFormatter(transaction?.discount_amount!)} (
                      {transaction?.discount_percentage!}
                      %)
                    </TableCell>
                  </TableRow>
                  <TableRow className="text-zinc-800 dark:text-zinc-100">
                    <TableCell className="py-0 pr-0 text-right ">
                      <h5>GRAND TOTAL:</h5>
                    </TableCell>
                    <TableCell className="py-0 pr-0 text-right ">
                      <h5>{dataFormatter(transaction?.total_price!)}</h5>
                    </TableCell>
                  </TableRow>
                </TableBody>
              </Table>
            </div>
          </div>
        )}
      </Modal.Body>
    </Modal>
  );
}
