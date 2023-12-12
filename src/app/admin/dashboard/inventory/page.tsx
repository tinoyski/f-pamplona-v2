"use client";

import ConfirmModal from "@/components/ConfirmModal";
import ItemFormModal from "@/components/ItemForm";
import Loading from "@/components/Loading";
import { Item, ItemValues } from "@/interfaces/Items";
import { CustomClaims } from "@/utils/CustomClaims";
import { dataFormatter } from "@/utils/Formatters";
import { createBrowserClient } from "@supabase/ssr";
import {
  Badge,
  Bold,
  Legend,
  TableBody,
  TableCell,
  TableHead,
  TableHeaderCell,
  TableRow,
  Text,
  Title
} from "@tremor/react";
import {
  Button,
  Card,
  Dropdown,
  Pagination,
  Select,
  Table,
  TextInput
} from "flowbite-react";
import { FormikHelpers } from "formik";
import { jsPDF } from "jspdf";
import autoTable from "jspdf-autotable";
import _ from "lodash";
import { useEffect, useState } from "react";
import { BsThreeDotsVertical } from "react-icons/bs";
import { GrDocumentPdf } from "react-icons/gr";
import {
  HiOutlinePlus,
  HiOutlineSearch,
  HiPencil,
  HiTrash,
} from "react-icons/hi";
import { toast } from "react-toastify";

// export const metadata: Metadata = {
//   title: "Inventory",
// };

export default function Inventory() {
  const [items, setItems] = useState<Item[]>([]);
  const [filteredItems, setFilteredItems] = useState<Item[]>([]);
  const [item, setItem] = useState<Item | null>(null);
  const [openModal, setOpenModal] = useState<string | undefined>();
  const [searchTerm, setSearchTerm] = useState("");
  const [email, setEmail] = useState<string>();

  // For pagination
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [itemOffset, setItemOffset] = useState(0);
  const [pageCount, setPageCount] = useState(0);
  const [currentItems, setCurrentItems] = useState<Item[]>([]);

  // For Custom claims
  const [role, setRole] = useState<string>("");

  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );

  /**
   * This function is a callback for a form submission. It sends a POST or PUT request to the
   * server with the form values and updates the state accordingly. It also closes the modal and
   * clears the items array.
   *
   * @param {ItemValues} values - The values submitted in the form.
   * @param {FormikHelpers<ItemValues>} formikHelpers - Formik helpers for the form.
   */
  const formCallback = async (
    values: ItemValues,
    { setSubmitting, setErrors }: FormikHelpers<ItemValues>
  ) => {
    const method = item ? "PUT" : "POST";

    if (item) {
      const originalValues: ItemValues = {
        name: item.name,
        description: item.description,
        img_url: item.img_url,
        quantity: item.quantity,
        unit_price: item.unit_price,
        ordered_items: item.ordered_items,
        physical_count: item.physical_count,
        received_items: item.received_items,
        remarks: item.remarks,
      };

      // Essentially this only becomes true if the values object was not changed
      if (method === "PUT" && _.isEqual(originalValues, values)) {
        setErrors({
          name: "Value cannot be the same!",
          description: "Value cannot be the same!",
          unit_price: "Value cannot be the same!",
          quantity: "Value cannot be the same!",
          img_url: "Value cannot be the same!",
          ordered_items: "Value cannot be the same!",
          physical_count: "Value cannot be the same!",
          received_items: "Value cannot be the same!",
          remarks: "Value cannot be the same!",
        });
        return;
      }
    }

    const url = `/api/items${method === "POST" ? "" : `?id=${item?.id}`}`;
    await fetch(url, {
      method,
      body: JSON.stringify({
        item: {
          code: method === "POST" ? "" : item?.code,
          ...values,
          last_updated: method === "POST" ? null : item?.last_updated,
        },
        role,
      }),
    });

    const toastMsg =
      method === "PUT"
        ? `${item?.name} has been edited!`
        : "Successfully added!";

    setSubmitting(false);
    setOpenModal(undefined);
    toast.success(toastMsg);
    setItems([]);
  };

  // The props to send to ItemFormModal
  const props = { openModal, setOpenModal, formCallback, item, role };

  // Form callback for delete function
  const deleteCallback = async (toDelete: boolean) => {
    if (toDelete) {
      const res = await fetch(`/api/items?id=${item?.id}`, {
        method: "DELETE",
      });

      const data = await res.json();

      if (data.status === 201 || data.status === 204) {
        setItems([]);
        toast.success(`${item?.name} deleted!`);
      } else {
        toast.error(`Error occurred: ${data.statusText}`);
      }
    }
  };

  // Pros to send to ConfirmModal
  const confirmProps = {
    openModal,
    setOpenModal,
    message: "Are you sure you wish to delete this item?",
    deleteCallback,
  };

  // Calculate the number of pages for table data, defaults to 10 pages. Can be changed by user using selection menu

  /**
   * The useEffect function is used to synchronize the data on mount and if items.length is changed.
   * Refer to: @link https://react.dev/learn/synchronizing-with-effects
   */
  useEffect(() => {
    const fetchData = async () => {
      // console.log("fetchData is fired!");
      const res = await fetch("/api/items");
      const data = await res.json();

      setItems(data);
      setFilteredItems(data);
    };

    async function getRole() {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (user) {
        const customClaims = new CustomClaims(supabase);
        const { data, error } = await customClaims.get_my_claim("role");

        if (error) {
          console.log(error);
          return;
        }

        setEmail(user.email);
        setRole(data);
      }
    }

    if (!role.length) {
      getRole();
    }

    if (!items.length) {
      fetchData();
    }
  }, [items.length, role.length, supabase]);

  // Use effect for item pagination
  useEffect(() => {
    const endOffset = itemOffset + itemsPerPage;
    setCurrentItems(filteredItems.slice(itemOffset, endOffset));
    setPageCount(Math.ceil(filteredItems.length / itemsPerPage));
  }, [filteredItems, itemOffset, itemsPerPage]);

  // useEffect for filtering items
  useEffect(() => {
    const filteredItems = items.filter((item) =>
      item.name.toLowerCase().includes(searchTerm.toLowerCase())
    );
    setFilteredItems(filteredItems);
  }, [searchTerm, items]);

  // Generate report
  async function generateReport() {
    const doc = new jsPDF({
      orientation: "landscape",
    });
    const res = await fetch("/api/items?archived=true");
    const archivedItems = await res.json();

    const body: any[] = [];
    items.forEach((item, i) => {
      body.push({
        id: i + 1,
        code: item.code,
        name: item.name,
        description: item.description,
        unit_price: `Php ${dataFormatter(item.unit_price).slice(1)}`,
        ordered_items: item.ordered_items,
        received_items: item.received_items,
        sold_items: item.sold_items,
        quantity: item.quantity,
        physical_count: item.physical_count,
        discrepancy: Math.abs(item.quantity - item.physical_count), // Absolute Value +/- e.g. Input: -3 Output: 3
        remarks: _.startCase(
          item.remarks.replace("_", " ").toLocaleLowerCase()
        ),
      });
    });

    autoTable(doc, {
      theme: "grid",
      head: [
        {
          id: "ID",
          code: "Item Code",
          name: "Item Name",
          description: "Description",
          unit_price: "Unit Price",
          ordered_items: "Ordered Items",
          received_items: "Received Items",
          sold_items: "Total Sold",
          quantity: "In Stock",
          physical_count: "Physical Count",
          discrepancy: "Discrepancy",
          remarks: "remarks",
        },
      ],
      body,
      willDrawPage: (data) => {
        // Header
        doc.setFontSize(20);
        doc.text(
          `Inventory Report - [${new Date().toLocaleDateString("en-PH", {
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
          `Generated by: ${email}`,
          data.settings.margin.left,
          pageHeight - 10
        );
      },
    });

    // Archived page
    doc.addPage("a4", "landscape");

    archivedItems.forEach((item: Item, i: number) => {
      body.push({
        id: i + 1,
        code: item.code,
        name: item.name,
        description: item.description,
        unit_price: `Php ${dataFormatter(item.unit_price).slice(1)}`,
      });
    });

    autoTable(doc, {
      theme: "grid",
      head: [
        {
          id: "ID",
          code: "Item Code",
          name: "Item Name",
          description: "Description",
          unit_price: "Unit Price",
        },
      ],
      body,
      willDrawPage: (data) => {
        // Header
        doc.setFontSize(20);
        doc.text("Archived", data.settings.margin.left, 10);
      },
      didDrawPage: (data) => {
        // Footer
        doc.setFontSize(10);
        let pageSize = doc.internal.pageSize;
        let pageHeight = pageSize.getHeight();
        doc.text(
          `Generated by: ${email}`,
          data.settings.margin.left,
          pageHeight - 10
        );
      },
    });

    if (process.env.NODE_ENV === "development") {
      window.open(URL.createObjectURL(doc.output("blob")));
    } else {
      doc.save(
        `${new Date()
          .toLocaleString("en-PH", { timeStyle: "short", dateStyle: "short" })
          .replace(", ", "")}-inventory.pdf`
      );
    }
  }

  /**
   * Returns the CSS class name based on the quantity of an item.
   *
   * @param {number} quantity - The quantity of the item.
   * @return {string} The CSS class name based on the quantity.
   */
  function getItemLevelClassName(quantity: number): string {
    return quantity > 3
      ? "bg-blue-500 dark:bg-blue-600/90"
      : "bg-red-500 dark:bg-red-600";
  }

  return (
    <div>
      <Card>
        <div className="flex items-center">
          <Title>Items</Title>
          <div className="flex gap-6 ml-auto items-center">
            <Legend
              categories={["Normal Stock", "Low Stock"]}
              colors={["blue", "red"]}
            />
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
            <TextInput
              icon={HiOutlineSearch}
              value={searchTerm}
              onChange={(event) => setSearchTerm(event.target.value)}
              placeholder="Search..."
            />
            <Button
              color="blue"
              className={`${role === "ADMIN" ? "" : "hidden"}`}
              onClick={() => generateReport()}
            >
              <GrDocumentPdf className="h-5 w-5" />
              <p className="ml-2">Generate Report</p>
            </Button>
            <Button
              color="success"
              className={role === "ADMIN" ? "" : "hidden"}
              onClick={() => {
                setItem(null);
                props.setOpenModal("item-form");
              }}
            >
              <HiOutlinePlus className="h-5 w-5" />
              <p className="ml-2">Add</p>
            </Button>
          </div>
        </div>
        {!items.length ? (
          <Loading />
        ) : (
          <>
            <Table>
              <TableHead>
                <TableRow className="border-b">
                  <TableHeaderCell>ID</TableHeaderCell>
                  <TableHeaderCell>Item Code</TableHeaderCell>
                  <TableHeaderCell>Item Name</TableHeaderCell>
                  <TableHeaderCell className="text-center">
                    Condition
                  </TableHeaderCell>
                  <TableHeaderCell>Description</TableHeaderCell>
                  <TableHeaderCell
                    className={`${
                      role === "ADMIN" ? "" : "hidden"
                    } text-center`}
                  >
                    Unit Price
                  </TableHeaderCell>
                  <TableHeaderCell
                    className={`${
                      role === "ADMIN" ? "" : "hidden"
                    } text-center`}
                  >
                    Ordered Items
                  </TableHeaderCell>
                  <TableHeaderCell
                    className={`${
                      role === "ADMIN" ? "" : "hidden"
                    } text-center`}
                  >
                    Received Items
                  </TableHeaderCell>
                  <TableHeaderCell
                    className={`${
                      role === "ADMIN" ? "" : "hidden"
                    } text-center`}
                  >
                    Total Sold
                  </TableHeaderCell>
                  {role === "ADMIN" ? (
                    <TableHeaderCell className="text-center">
                      In Stock
                    </TableHeaderCell>
                  ) : (
                    <TableHeaderCell className="text-center">
                      Physical Count
                    </TableHeaderCell>
                  )}
                  <TableHeaderCell>
                    <span className="sr-only">Menu</span>
                  </TableHeaderCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {currentItems.map((item) => (
                  <TableRow
                    key={item.id}
                    className="hover:bg-slate-100 dark:hover:bg-slate-700 hover:cursor-pointer"
                  >
                    <TableCell>
                      <Text>{item.id}</Text>
                    </TableCell>
                    <TableCell>
                      <Text>{item.code}</Text>
                    </TableCell>
                    <TableCell className="flex gap-4">
                      <Text>{item.name}</Text>
                    </TableCell>
                    <TableCell className="text-center">
                      <Badge
                        className="m-auto"
                        color={
                          item.remarks === "GOOD_CONDITION" ? "green" : "red"
                        }
                      >
                        {_.startCase(item.remarks.toLocaleLowerCase())}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Text>{item.description}</Text>
                    </TableCell>
                    <TableCell
                      className={`${
                        role === "ADMIN" ? "" : "hidden"
                      } text-center`}
                    >
                      <Text>{dataFormatter(item.unit_price)}</Text>
                    </TableCell>
                    <TableCell
                      className={`${
                        role === "ADMIN" ? "" : "hidden"
                      } text-center`}
                    >
                      <Text>{item.ordered_items}</Text>
                    </TableCell>
                    <TableCell
                      className={`${
                        role === "ADMIN" ? "" : "hidden"
                      } text-center`}
                    >
                      <Text>{item.received_items}</Text>
                    </TableCell>
                    <TableCell
                      className={`${
                        role === "ADMIN" ? "" : "hidden"
                      } text-center`}
                    >
                      <Text>{item.sold_items}</Text>
                    </TableCell>
                    <TableCell
                      className={`text-center text-white ${getItemLevelClassName(
                        role === "ADMIN" ? item.quantity : item.physical_count
                      )}`}
                    >
                      <Bold>
                        {role === "ADMIN" ? item.quantity : item.physical_count}
                      </Bold>
                    </TableCell>

                    <TableCell className="flex items-center justify-center">
                      <Dropdown
                        label
                        renderTrigger={() => (
                          <Button color="gray" size="xs">
                            <BsThreeDotsVertical />
                          </Button>
                        )}
                      >
                        <Dropdown.Item
                          icon={HiPencil}
                          onClick={() => {
                            props.setOpenModal("item-form");
                            setItem(item);
                          }}
                        >
                          Edit
                        </Dropdown.Item>
                        <Dropdown.Item
                          icon={HiTrash}
                          className={role === "ADMIN" ? "" : "hidden"}
                          onClick={() => {
                            confirmProps.setOpenModal("confirm-modal");
                            setItem(item);
                          }}
                        >
                          Delete
                        </Dropdown.Item>
                      </Dropdown>
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
                  const newOffset = ((page - 1) * itemsPerPage) % items.length;
                  setCurrentPage(page);
                  setItemOffset(newOffset);
                }}
                totalPages={pageCount}
              />
            </div>
          </>
        )}
      </Card>

      {/* Item Form Modal */}
      <ItemFormModal {...props} />

      {/* Confirm Modal */}
      <ConfirmModal {...confirmProps} />
    </div>
  );
}
