"use client";

import Loading from "@/components/Loading";
import { ActivityActions, ActivityLog } from "@/interfaces/ActivityLog";
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
import { Badge, Pagination, Select, TextInput } from "flowbite-react";
import _ from "lodash";
import { useEffect, useMemo, useState } from "react";
import { HiOutlineSearch } from "react-icons/hi";

export default function ActivityLogPage() {
  const [activityLog, setActivityLog] = useState<ActivityLog[]>([]);
  const [filteredItems, setFilteredItems] = useState<ActivityLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [actionFilter, setActionFilter] = useState("");
  const [roleFilter, setRoleFilter] = useState("");

  // For pagination
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [itemOffset, setItemOffset] = useState(0);
  const [pageCount, setPageCount] = useState(0);
  const [currentItems, setCurrentItems] = useState<ActivityLog[]>([]);

  useEffect(() => {
    const fetchActivityLogs = async () => {
      const res = await fetch("/api/activity");
      const data = await res.json();

      setActivityLog(data);
      setFilteredItems(data);
      setLoading(false);
    };

    if (!activityLog.length) {
      fetchActivityLogs();
    }
  }, [activityLog.length]);

  // Use effect for item pagination
  useEffect(() => {
    const endOffset = itemOffset + itemsPerPage;
    setCurrentItems(filteredItems.slice(itemOffset, endOffset));
    setPageCount(Math.ceil(filteredItems.length / itemsPerPage));
  }, [filteredItems, itemOffset, itemsPerPage]);

  // useEffect for search
  const newFilteredItems = useMemo(() => {
    return activityLog.filter((activity) => {
      const email = activity.user.email.toLowerCase();
      const searchTermLower = searchTerm.toLowerCase();

      if (actionFilter && roleFilter) {
        return (
          email.includes(searchTermLower) &&
          activity.action.includes(actionFilter) &&
          activity.role.includes(roleFilter)
        );
      } else if (actionFilter) {
        return (
          email.includes(searchTermLower) &&
          activity.action.includes(actionFilter)
        );
      } else if (roleFilter) {
        return (
          email.includes(searchTermLower) && activity.role.includes(roleFilter)
        );
      } else {
        return email.includes(searchTermLower);
      }
    });
  }, [activityLog, searchTerm, actionFilter, roleFilter]);

  useEffect(() => {
    setFilteredItems(newFilteredItems);
  }, [newFilteredItems]);

  return (
    <div>
      <Card>
        <div className="flex items-center mb-4">
          <Title>Activity Log</Title>
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
            <TextInput
              icon={HiOutlineSearch}
              value={searchTerm}
              onChange={(event) => setSearchTerm(event.target.value)}
              placeholder="Search email..."
            />
            <Select
              id="filter-by-role"
              defaultValue={""}
              onChange={(event) => setRoleFilter(event.target.value)}
            >
              <option value="">Filter by role...</option>
              <option value={"ADMIN"}>Admin</option>
              <option value={"STAFF"}>Staff</option>
            </Select>
            <Select
              id="filter-by-action"
              defaultValue={""}
              onChange={(event) => setActionFilter(event.target.value)}
            >
              <option value="">All Actions</option>
              <option value={ActivityActions.ADD}>Add</option>
              <option value={ActivityActions.DELETE}>Delete</option>
              <option value={ActivityActions.UPDATE}>Update</option>
            </Select>
          </div>
        </div>
        {loading ? (
          <Loading />
        ) : (
          <>
            <Table>
              <TableHead>
                <TableRow className="border-b">
                  <TableHeaderCell>ID</TableHeaderCell>
                  <TableHeaderCell>User</TableHeaderCell>
                  <TableHeaderCell className="text-center">
                    Date
                  </TableHeaderCell>
                  <TableHeaderCell className="text-center">
                    Time
                  </TableHeaderCell>
                  <TableHeaderCell className="text-center">
                    Action
                  </TableHeaderCell>
                  <TableHeaderCell>Description</TableHeaderCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {currentItems.map((activity) => {
                  let badgeColor = "";

                  switch (activity.action) {
                    case ActivityActions.ADD:
                      badgeColor = "success";
                      break;
                    case ActivityActions.DELETE:
                      badgeColor = "failure";
                      break;
                    case ActivityActions.UPDATE:
                      badgeColor = "warning";
                      break;
                    default:
                      break;
                  }

                  return (
                    <TableRow key={activity.id}>
                      <TableCell>{activity.id}</TableCell>
                      <TableCell>
                        <div className="flex flex-col">
                          <p>{activity.user.email}</p>
                          <Badge color="gray" className="w-fit">
                            {_.startCase(activity.role.toLowerCase())}
                          </Badge>
                        </div>
                      </TableCell>
                      <TableCell className="text-center">
                        {new Date(activity.created_at).toLocaleDateString(
                          "en-PH",
                          {
                            dateStyle: "medium",
                          }
                        )}
                      </TableCell>
                      <TableCell className="text-center">
                        {new Date(activity.created_at).toLocaleTimeString(
                          "en-PH",
                          {
                            timeStyle: "short",
                          }
                        )}
                      </TableCell>
                      <TableCell>
                        <Badge
                          color={badgeColor}
                          size="sm"
                          className="w-fit mx-auto"
                        >
                          {_.startCase(activity.action.toLowerCase())}
                        </Badge>
                      </TableCell>
                      <TableCell>{activity.comment || "NONE"}</TableCell>
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
                    ((page - 1) * itemsPerPage) % activityLog.length;
                  setCurrentPage(page);
                  setItemOffset(newOffset);
                }}
                totalPages={pageCount}
              />
            </div>
          </>
        )}
      </Card>
    </div>
  );
}
