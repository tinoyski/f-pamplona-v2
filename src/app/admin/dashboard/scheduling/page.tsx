"use client";

import ConfirmModal from "@/components/ConfirmModal";
import Loading from "@/components/Loading";
import { Item } from "@/interfaces/Items";
import {
  Schedule,
  ScheduleResult,
  ScheduleStatus,
} from "@/interfaces/Schedule";
import {
  Accordion,
  AccordionBody,
  AccordionHeader,
  Card,
  Tab,
  TabGroup,
  TabList,
  TabPanel,
  TabPanels,
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
  Modal,
  Pagination,
  Select,
  TextInput,
} from "flowbite-react";
import { Dispatch, SetStateAction, useEffect, useState } from "react";
import { HiChevronDown, HiOutlineSearch } from "react-icons/hi";
import { FaCircleCheck, FaCircleXmark } from "react-icons/fa6";
import { LuListTodo } from "react-icons/lu";
import { toast } from "react-toastify";
import { useRouter } from "next/navigation";
// import { Metadata } from "next";

// export const metadata: Metadata = {
//   title: "Scheduling",
// };

export default function Scheduling() {
  const [scheduleList, setScheduleList] = useState<Schedule[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [todoScheduleList, setTodoScheduleList] = useState<Schedule[]>([]);
  const [todoFilteredList, setTodoFilteredList] = useState<Schedule[]>([]);
  const [doneScheduleList, setDoneScheduleList] = useState<Schedule[]>([]);
  const [doneFilteredList, setDoneFilteredList] = useState<Schedule[]>([]);
  const [cancelledScheduleList, setCancelledScheduleList] = useState<
    Schedule[]
  >([]);
  const [cancelledFilteredList, setCancelFilteredList] = useState<Schedule[]>(
    []
  );
  const [tabIndex, setTabIndex] = useState<number>(0);
  const [status, setStatus] = useState<string>();
  const [id, setId] = useState<number>();
  const [items, setItems] = useState<Item[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [openModal, setOpenModal] = useState<string | undefined>();

  // For Pagination
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemOffset, setItemOffset] = useState(0);

  const props = {
    openModal,
    setOpenModal,
    message: "Are you sure you want to cancel?",
    deleteCallback,
  };

  useEffect(() => {
    const getScheduleList = async () => {
      const itemRes = await fetch("/api/items");
      const itemData = await itemRes.json();
      const res = await fetch("/api/schedule");
      const { todo, done, cancelled } = (await res.json()) as ScheduleResult;

      setScheduleList([...todo, ...done, ...cancelled]);
      setItems(itemData);
      setDoneScheduleList(done);
      setTodoScheduleList(todo);
      setCancelledScheduleList(cancelled);
    };

    if (!scheduleList.length) {
      getScheduleList();
    }
  }, [scheduleList.length]);

  // useEffect for search bar
  useEffect(() => {
    let filteredItems = [];
    switch (tabIndex) {
      case 0:
        filteredItems = todoScheduleList.filter((schedule) =>
          schedule.customer.name
            .toLowerCase()
            .includes(searchTerm.toLowerCase())
        );
        setTodoFilteredList(filteredItems);
        break;
      case 1:
        filteredItems = doneScheduleList.filter((schedule) =>
          schedule.customer.name
            .toLowerCase()
            .includes(searchTerm.toLowerCase())
        );
        setDoneFilteredList(filteredItems);
        break;
      case 2:
        filteredItems = cancelledScheduleList.filter((schedule) =>
          schedule.customer.name
            .toLowerCase()
            .includes(searchTerm.toLowerCase())
        );
        setCancelFilteredList(filteredItems);
        break;
      default:
        break;
    }
  }, [
    cancelledScheduleList,
    doneScheduleList,
    searchTerm,
    tabIndex,
    todoScheduleList,
  ]);

  async function editStatus(status: string, id: number) {
    setLoading(true);
    const response = await fetch(`/api/schedule?status=${status}&id=${id}`, {
      method: "PUT",
    });
    const data = await response.json();

    const isSuccessStatus = [204, 200].includes(data.status);
    if (isSuccessStatus) {
      setLoading(false);
      toast.success("Updated!");
      if (status === ScheduleStatus.CANCELLED) {
        setOpenModal("cancel-email");
      }
      setScheduleList([]);
    }
  }

  // Callback from confirm modal :>
  function deleteCallback(toCancel: boolean) {
    if (toCancel && status && id) {
      editStatus(status, id);
    }
  }

  return (
    <div>
      <Card>
        <div className="flex items-center mb-4">
          <Title>Customer Schedules</Title>
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
          </div>
        </div>
        <div>
          {!scheduleList.length ? (
            <Loading />
          ) : (
            <TabGroup defaultIndex={0} onIndexChange={(i) => setTabIndex(i)}>
              <TabList color="blue">
                <Tab icon={LuListTodo}>To-Do</Tab>
                <Tab icon={FaCircleCheck}>Done</Tab>
                <Tab icon={FaCircleXmark}>Cancelled</Tab>
              </TabList>
              <TabPanels>
                <TabPanel>
                  <TableComponent
                    scheduleArray={todoFilteredList}
                    items={items}
                    setStatus={setStatus}
                    setId={setId}
                    editStatus={editStatus}
                    itemsPerPage={itemsPerPage}
                    currentPage={currentPage}
                    setCurrentPage={setCurrentPage}
                    itemOffset={itemOffset}
                    setItemOffset={setItemOffset}
                    props={props}
                  />
                </TabPanel>
                <TabPanel>
                  <TableComponent
                    scheduleArray={doneFilteredList}
                    items={items}
                    setStatus={setStatus}
                    setId={setId}
                    editStatus={editStatus}
                    itemsPerPage={itemsPerPage}
                    currentPage={currentPage}
                    setCurrentPage={setCurrentPage}
                    itemOffset={itemOffset}
                    setItemOffset={setItemOffset}
                    props={props}
                  />
                </TabPanel>
                <TabPanel>
                  <TableComponent
                    scheduleArray={cancelledFilteredList}
                    items={items}
                    setStatus={setStatus}
                    setId={setId}
                    editStatus={editStatus}
                    itemsPerPage={itemsPerPage}
                    currentPage={currentPage}
                    setCurrentPage={setCurrentPage}
                    itemOffset={itemOffset}
                    setItemOffset={setItemOffset}
                    props={props}
                  />
                </TabPanel>
              </TabPanels>
            </TabGroup>
          )}
        </div>
      </Card>

      <ConfirmModal {...props} />

      {/* Send email success upon cancelation */}
      <Modal
        show={openModal === "cancel-email"}
        size="md"
        onClose={() => setOpenModal(undefined)}
        popup
      >
        <Modal.Header />
        <Modal.Body>
          <div className="text-center">
            <FaCircleCheck className="mx-auto mb-4 h-14 w-14 text-green-600 dark:text-green-500" />
            <h3 className="mb-5 text-lg font-normal text-gray-500 dark:text-gray-400">
              Sent cancellation email to user!
            </h3>
            <Button
              color="success"
              className="mx-auto"
              onClick={() => setOpenModal(undefined)}
            >
              Okay!
            </Button>
          </div>
        </Modal.Body>
      </Modal>

      {/* Loading Modal */}
      <Modal
        show={loading}
        size="sm"
        popup
        theme={{ content: { base: "relative h-full w-fit p-4 md:h-auto" } }}
      >
        <Modal.Body>
          <div className="pt-6">
            <Loading />
          </div>
        </Modal.Body>
      </Modal>
    </div>
  );
}

// Table Component
function TableComponent({
  scheduleArray,
  items,
  setStatus,
  setId,
  itemsPerPage,
  itemOffset,
  setItemOffset,
  currentPage,
  setCurrentPage,
  editStatus,
  props,
}: {
  scheduleArray: Schedule[];
  items: Item[];
  setStatus: Dispatch<SetStateAction<string | undefined>>;
  setId: Dispatch<SetStateAction<number | undefined>>;
  editStatus: Function;
  itemsPerPage: number;
  itemOffset: number;
  setItemOffset: Dispatch<SetStateAction<number>>;
  currentPage: number;
  setCurrentPage: Dispatch<SetStateAction<number>>;
  props: any;
}) {
  // For pagination
  const [pageCount, setPageCount] = useState(0);
  const [currentItems, setCurrentItems] = useState<Schedule[]>([]);

  // Use effect for item pagination
  useEffect(() => {
    const endOffset = itemOffset + itemsPerPage;
    setCurrentItems(scheduleArray.slice(itemOffset, endOffset));
    setPageCount(Math.ceil(scheduleArray.length / itemsPerPage));
  }, [scheduleArray, itemOffset, itemsPerPage]);
  return (
    <>
      <Table>
        <TableHead>
          <TableRow className="border-b-2">
            <TableHeaderCell>ID</TableHeaderCell>
            {/* TODO: Put customer info in one column */}
            <TableHeaderCell>Customer</TableHeaderCell>
            <TableHeaderCell>AC Unit</TableHeaderCell>
            <TableHeaderCell>AC Type</TableHeaderCell>
            <TableHeaderCell>Service</TableHeaderCell>
            <TableHeaderCell>Qty</TableHeaderCell>
            <TableHeaderCell>Date</TableHeaderCell>
            <TableHeaderCell className="text-center">Status</TableHeaderCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {currentItems.map((schedule) => {
            let color = "";

            switch (schedule.status) {
              case ScheduleStatus.TODO:
                color = "bg-yellow-400";
                break;
              case ScheduleStatus.DONE:
                color = "bg-green-500";
                break;
              case ScheduleStatus.CANCELLED:
                color = "bg-red-500";
                break;
            }

            return (
              <TableRow key={schedule.id}>
                <TableCell>{schedule.id}</TableCell>
                <TableCell>
                  <Accordion>
                    <AccordionHeader className="border-b dark:border-b-zinc-700">
                      <span className="font-bold">
                        {schedule.customer.name}
                      </span>
                    </AccordionHeader>
                    <AccordionBody className="flex flex-col mt-2">
                      <table>
                        <tbody>
                          <tr>
                            <td>
                              <span className="font-bold">Address:</span>
                            </td>
                            <td>{schedule.address}</td>
                          </tr>
                          <tr>
                            <td>
                              <span className="font-bold">Email:</span>
                            </td>
                            <td>{schedule.customer.email}</td>
                          </tr>
                          <tr>
                            <td>
                              <span className="font-bold">Contact No.:</span>
                            </td>
                            <td>{schedule.customer.contact_no}</td>
                          </tr>
                        </tbody>
                      </table>
                    </AccordionBody>
                  </Accordion>
                </TableCell>
                <TableCell className="w-32">
                  <span>
                    {schedule.ac_unit
                      ? items?.find(({ id }) => id === schedule.ac_unit)?.name
                      : "NONE"}
                  </span>
                </TableCell>
                <TableCell>{schedule.ac_type}</TableCell>
                <TableCell>{schedule.service}</TableCell>
                <TableCell>{schedule.quantity}</TableCell>
                <TableCell>
                  {new Date(schedule.date).toLocaleString()}
                </TableCell>
                <TableCell
                  className={`${color} font-bold text-center text-white`}
                >
                  {schedule.status === ScheduleStatus.TODO ? (
                    <Dropdown
                      label=""
                      dismissOnClick={false}
                      renderTrigger={() => (
                        <div className="select-none hover:cursor-pointer">
                          <div className="flex items-center justify-center">
                            <p>{schedule.status}</p>
                            <HiChevronDown className="w-5 h-5" />
                          </div>
                        </div>
                      )}
                    >
                      {Object.keys(ScheduleStatus)
                        .filter((value) => value !== schedule.status)
                        .map((status, i) => (
                          <Dropdown.Item
                            key={i}
                            onClick={() => {
                              setStatus(status);
                              setId(schedule.id);
                              status === ScheduleStatus.CANCELLED
                                ? props.setOpenModal("confirm-modal")
                                : editStatus(status, schedule.id);
                            }}
                          >
                            {status}
                          </Dropdown.Item>
                        ))}
                    </Dropdown>
                  ) : (
                    schedule.status
                  )}
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
      <div className="flex items-center justify-center text-center border-t pt-2">
        <Pagination
          showIcons
          currentPage={currentPage}
          onPageChange={(page) => {
            const newOffset =
              ((page - 1) * itemsPerPage) % scheduleArray.length;
            setCurrentPage(page);
            setItemOffset(newOffset);
          }}
          totalPages={pageCount}
        />
      </div>
    </>
  );
}
