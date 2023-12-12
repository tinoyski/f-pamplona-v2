"use client";

import AdminFormModal from "@/components/AdminForm";
import ConfirmModal from "@/components/ConfirmModal";
import Loading from "@/components/Loading";
import { Admin } from "@/interfaces/Admins";
import { Database } from "@/lib/database.types";
import { createBrowserClient } from "@supabase/ssr";
import {
  Card,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeaderCell,
  TableRow,
  Title,
} from "@tremor/react";
import {
  Button,
  Dropdown,
  Pagination,
  Select,
  TextInput,
} from "flowbite-react";
import { FormikHelpers } from "formik";
import { Metadata } from "next";
import { ReactNode, useEffect, useState } from "react";
import { BsThreeDotsVertical } from "react-icons/bs";
import {
  HiOutlineSearch,
  HiPencil,
  HiTrash,
  HiOutlinePlus,
} from "react-icons/hi";
import { toast } from "react-toastify";

// export const metadata: Metadata = {
//   title: "Admin",
// };

export default function ManageAdmin() {
  const [adminList, setAdminList] = useState<Admin[]>([]);
  const [filteredAdmins, setFilteredAdmins] = useState<Admin[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(true);
  const [admin, setAdmin] = useState<Admin | null>(null);
  const [message, setMessage] = useState<ReactNode>();
  const [openModal, setOpenModal] = useState<string | undefined>();

  // For pagination
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [itemOffset, setItemOffset] = useState(0);
  const [pageCount, setPageCount] = useState(0);
  const [currentItems, setCurrentItems] = useState<Admin[]>([]);

  // useEffect for initial array fetch
  useEffect(() => {
    const getAdminList = async () => {
      const res = await fetch("/api/admin");
      const data = await res.json();

      setAdminList(data);
      setFilteredAdmins(data);
      setLoading(false);
    };

    if (!adminList.length) {
      getAdminList();
    }
  }, [adminList.length]);

  // useEffect for search bar
  useEffect(() => {
    const filteredItems = adminList.filter(
      (item) =>
        item.first_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.last_name.toLowerCase().includes(searchTerm.toLowerCase())
    );
    setFilteredAdmins(filteredItems);
  }, [adminList, searchTerm]);

  // Use effect for item pagination
  useEffect(() => {
    const endOffset = itemOffset + itemsPerPage;
    setCurrentItems(filteredAdmins.slice(itemOffset, endOffset));
    setPageCount(Math.ceil(filteredAdmins.length / itemsPerPage));
  }, [filteredAdmins, itemOffset, itemsPerPage]);

  async function formCallback(
    values: Admin,
    { setSubmitting, setErrors }: FormikHelpers<Admin>
  ) {
    setSubmitting(true);

    const supabase = createBrowserClient<Database>(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    );

    const { count } = await supabase
      .from("admin")
      .select("*", { count: "exact", head: true })
      .eq("email", values.email);

    if (count && !admin) {
      toast.error("Email already exists!");
      setErrors({ email: "Email already exists!" });
      return;
    }

    const url = `/api/admin${admin ? `?id=${admin.id}` : ""}`;
    const res = await fetch(url, {
      method: admin ? "PUT" : "POST",
      body: JSON.stringify(values),
    });

    const data = await res.json();

    if (data.status === 201 || data.status === 204) {
      setAdminList([]);
      if (admin) {
        setAdmin(null);
      }
      setOpenModal(undefined);
      setSubmitting(false);
      toast.success(admin ? "Updated successfully!" : "Added successfully!Í");
    }
  }

  async function deleteCallback(toDelete: boolean) {
    if (toDelete) {
      const res = await fetch(
        `/api/admin?id=${admin?.id}&email=${admin?.email}`,
        {
          method: "DELETE",
        }
      );
      const data = await res.json();

      if (data.status === 200 || data.status === 204) {
        setAdminList([]);
        toast.success(`${admin?.first_name} ${admin?.last_name} deleted!`);
      } else {
        toast.error(`Error occurred: ${data.statusText}`);
      }
    }
  }

  const props = { openModal, setOpenModal, admin, formCallback };
  const confirmProps = { openModal, setOpenModal, message, deleteCallback };

  return (
    <div>
      <Card>
        <div className="flex items-center">
          <Title>Manage Admins</Title>
          <div className="flex gap-6 ml-auto">
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
              color="success"
              size="sm"
              onClick={() => {
                setAdmin(null);
                props.setOpenModal("admin-form");
              }}
            >
              <HiOutlinePlus className="h-5 w-5" />
              <p>Add</p>
            </Button>
          </div>
        </div>
        {loading ? (
          <Loading />
        ) : (
          <>
            <Table>
              <TableHead>
                <TableRow className="border-b-2">
                  <TableHeaderCell>ID</TableHeaderCell>
                  <TableHeaderCell>Name</TableHeaderCell>
                  <TableHeaderCell>Email</TableHeaderCell>
                  <TableHeaderCell>Mobile</TableHeaderCell>
                  <TableHeaderCell className="text-center">
                    Role
                  </TableHeaderCell>
                  <TableHeaderCell className="text-center">
                    Last Login
                  </TableHeaderCell>
                  <TableHeaderCell className="text-center">
                    Last Updated
                  </TableHeaderCell>
                  <TableHeaderCell className="text-center">
                    Status
                  </TableHeaderCell>
                  <TableHeaderCell>
                    <span className="sr-only">Menu</span>
                  </TableHeaderCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {currentItems.map((admin, i) => (
                  <TableRow
                    key={admin.id}
                    className="hover:bg-slate-100 dark:hover:bg-slate-700 hover:cursor-pointer"
                  >
                    <TableCell>{i + 1}</TableCell>
                    <TableCell>
                      {`${admin.first_name} ${admin.last_name}`}
                    </TableCell>
                    <TableCell>{admin.email}</TableCell>
                    <TableCell>{admin.mobile}</TableCell>
                    <TableCell className="bg-blue-600 text-center font-bold text-white">
                      {admin.role}
                    </TableCell>
                    <TableCell className="text-center">
                      {admin.last_login
                        ? new Date(admin.last_login).toLocaleString()
                        : "NONE"}
                    </TableCell>
                    <TableCell className="text-center">
                      {admin.last_updated
                        ? new Date(admin.last_updated).toLocaleString()
                        : "NONE"}
                    </TableCell>
                    <TableCell
                      className={`${
                        admin.account_status ? "bg-green-500" : "bg-gray-700"
                      } text-center font-bold text-white`}
                    >
                      {admin.account_status ? "ACTIVE" : "OFFLINE"}
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
                            props.setOpenModal("admin-form");
                            setAdmin(admin);
                          }}
                        >
                          Edit
                        </Dropdown.Item>
                        <Dropdown.Item
                          icon={HiTrash}
                          onClick={() => {
                            confirmProps.setOpenModal("confirm-modal");
                            setMessage(
                              <div className="break-words text-base">
                                Are you sure you want to delete <br />
                                <span className="bg-slate-200 dark:bg-slate-600 p-1 rounded w-fit mx-auto text-blue-500 text-base">
                                  {admin.first_name} {admin.last_name}
                                </span>
                                ?
                              </div>
                            );
                            setAdmin(admin);
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
                  const newOffset =
                    ((page - 1) * itemsPerPage) % adminList.length;
                  setCurrentPage(page);
                  setItemOffset(newOffset);
                }}
                totalPages={pageCount}
              />
            </div>
          </>
        )}
      </Card>

      {/* Add/Edit Form Modal */}
      <AdminFormModal {...props} />

      {/* Confirm Delete Modal */}
      <ConfirmModal {...confirmProps} />
    </div>
  );
}
