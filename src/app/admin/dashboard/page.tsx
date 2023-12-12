"use client";

import Loading from "@/components/Loading";
import { Item } from "@/interfaces/Items";
import { Schedule } from "@/interfaces/Schedule";
import { Transactions } from "@/interfaces/Transactions";
import { dataFormatter } from "@/utils/Formatters";
import {
  AreaChart,
  BarList,
  Bold,
  Card,
  DonutChart,
  Flex,
  Icon,
  LineChart,
  List,
  ListItem,
  Metric,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeaderCell,
  TableRow,
  Text,
  Title,
} from "@tremor/react";
import _ from "lodash";
import { useEffect, useState } from "react";
import { BsBox2Fill } from "react-icons/bs";
import { TbCoins, TbCurrencyPeso, TbSwitchHorizontal } from "react-icons/tb";

interface AnalyticsData {
  transactions: {
    data: Transactions[];
    totalPriceByMonth: {
      month: number;
      total_price: number;
    }[];
    earnings: number;
    todaySales: number;
    paymentMethods: {
      cash: number;
      gcash: number;
    };
  };
  schedule: Schedule[];
  items: Item[];
}

type ItemChatData = {
  name: string;
  value: number;
};

type PaymentChartData = {
  name: string;
  value: number;
};

export default function Dashboard() {
  const [data, setData] = useState<AnalyticsData | null>(null);
  const [todaySales, setTodaySales] = useState<number>(0);
  const [totalEarning, setTotalEarnings] = useState<number>(0);
  const [chartData, setChartData] = useState([
    {
      name: "January",
      Sales2023: 0,
      Sales2022: 0,
    },
    {
      name: "February",
      Sales2023: 0,
      Sales2022: 0,
    },
    {
      name: "March",
      Sales2023: 0,
      Sales2022: 0,
    },
    {
      name: "April",
      Sales2023: 0,
      Sales2022: 0,
    },
    {
      name: "May",
      Sales2023: 0,
      Sales2022: 0,
    },
    {
      name: "June",
      Sales2023: 0,
      Sales2022: 0,
    },
    {
      name: "July",
      Sales2023: 0,
      Sales2022: 0,
    },
    {
      name: "August",
      Sales2023: 0,
      Sales2022: 0,
    },
    {
      name: "September",
      Sales2023: 0,
      Sales2022: 0,
    },
    {
      name: "October",
      Sales2023: 0,
      Sales2022: 0,
    },
    {
      name: "November",
      Sales2023: 0,
      Sales2022: 0,
    },
    {
      name: "December",
      Sales2023: 0,
      Sales2022: 0,
    },
  ]);
  const [itemsChartData, setItemsChartData] = useState<ItemChatData[]>([]);
  const [paymentChartData, setPaymentChartData] = useState<PaymentChartData[]>(
    []
  );

  useEffect(() => {
    const fetchData = async () => {
      const res = await fetch("/api/dashboard");
      const body = (await res.json()) as AnalyticsData;
      setData(body);
      setTodaySales(body.transactions.todaySales);
      setTotalEarnings(body.transactions.earnings);
      body.transactions.totalPriceByMonth.forEach(
        (value) => (chartData[value.month - 1].Sales2023 = value.total_price)
      );
      setChartData(chartData);

      // Item Chart Data
      const icd = body.items
        .map(({ name, quantity }) => {
          return { name, value: quantity };
        })
        .sort((a, b) => a.value - b.value);
      setItemsChartData(icd);

      // Payment Chart Data
      const pcd = Object.entries(body.transactions.paymentMethods).map(
        ([key, value]) => {
          return {
            name: _.startCase(key),
            value,
          };
        }
      );
      setPaymentChartData(pcd);
    };

    if (!data) {
      fetchData();
    }
  }, [data, chartData]);

  return (
    <div className="flex flex-col gap-5 ">
      {data == null ? (
        <Loading />
      ) : (
        <>
          {/* Cards */}
          <Flex className="flex gap-6">
            <Card
              decoration="top"
              decorationColor="blue"
              className="drop-shadow-md"
            >
              <div className="flex gap-5">
                <Icon
                  icon={BsBox2Fill}
                  color="blue"
                  variant="simple"
                  size="sm"
                  tooltip="Items in stock"
                />
                <div>
                  <Text>Items in stock</Text>
                  <Metric>{data?.items.length || 0}</Metric>
                </div>
              </div>
            </Card>
            <Card
              decoration="top"
              decorationColor="green"
              className="drop-shadow-md"
            >
              <div className="flex gap-5">
                <Icon
                  icon={TbCoins}
                  color="green"
                  variant="simple"
                  size="lg"
                  tooltip="Today's total sales"
                />
                <div>
                  <Text>Today&apos;s total sales</Text>
                  <Metric>{todaySales}</Metric>
                </div>
              </div>
            </Card>
            <Card
              decoration="top"
              decorationColor="amber"
              className="drop-shadow-md"
            >
              <div className="flex gap-5">
                <Icon
                  icon={TbSwitchHorizontal}
                  color="amber"
                  variant="simple"
                  size="lg"
                  tooltip="This year's Transactions"
                />
                <div>
                  <Text>This year&apos;s Transactions</Text>
                  <Metric>{data?.transactions.data.length || 0}</Metric>
                </div>
              </div>
            </Card>
            <Card
              decoration="top"
              decorationColor="rose"
              className="drop-shadow-md -z-10"
            >
              <div className="flex gap-3">
                <Icon
                  icon={TbCurrencyPeso}
                  color="rose"
                  variant="simple"
                  size="lg"
                  tooltip="This year's Sales"
                />
                <div>
                  <Text>This year&apos;s Sales</Text>
                  <Metric>{dataFormatter(totalEarning).slice(1)}</Metric>
                </div>
              </div>
            </Card>
          </Flex>

          {/* Middle Area */}
          <div className="flex gap-5">
            <Card className="drop-shadow-md basis-3/4">
              <Title>This year&apos;s sales</Title>
              <AreaChart
                className="mt-6 h-96"
                data={chartData}
                index="name"
                categories={["Sales2022", "Sales2023"]}
                colors={["cyan", "blue"]}
                intervalType="preserveStartEnd"
                valueFormatter={dataFormatter}
                yAxisWidth={93}
                showAnimation
              />
            </Card>

            {/* Payment Method Card */}
            <Card className="drop-shadow-md basis-[24%] overflow-y-auto">
              <Title>Payment Methods</Title>
              <div className="flex flex-col items-center mt-12 space-y-5">
                <DonutChart
                  data={paymentChartData}
                  colors={["green", "sky"]}
                  showAnimation
                  className="h-72"
                />
                <List className="w-5/12 flex">
                  {Object.keys(data.transactions.paymentMethods!).map(
                    (value, i) => (
                      <ListItem key={i}>
                        <div className="flex items-center space-x-2 truncate mx-auto">
                          <span
                            className={`${
                              value === "cash" ? "bg-green-500" : "bg-blue-500"
                            } h-2.5 w-2.5 rounded-sm flex-shrink-0`}
                          />
                          <span>{_.startCase(value)}</span>
                        </div>
                      </ListItem>
                    )
                  )}
                </List>
              </div>
            </Card>
          </div>

          {/* Lower Cards */}
          <div className="flex gap-5">
            {/* Item Quantity Card */}
            <Card className="drop-shadow-md p-4 basis-1/2 max-h-96 overflow-y-auto">
              <Title className="sticky">Items Quantities</Title>
              <Flex className="my-2 max-h-96 overflow-y-auto">
                <Text>
                  <Bold>Name</Bold>
                </Text>
                <Text>
                  <Bold>Quantity</Bold>
                </Text>
              </Flex>
              <BarList data={itemsChartData} showAnimation />
            </Card>

            {/* Upcoming Schedule List */}
            <Card className="drop-shadow-md p-4 basis-1/2 max-h-96 overflow-y-auto">
              <Title>Upcoming Schedules</Title>
              <Table className="w-full truncate my-2">
                <TableHead>
                  <TableRow>
                    <TableHeaderCell>Date</TableHeaderCell>
                    <TableHeaderCell>Service</TableHeaderCell>
                    <TableHeaderCell>Location</TableHeaderCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {data?.schedule.map((value) => (
                    <TableRow key={value.id}>
                      <TableCell>
                        <Title>
                          {new Date(value.date).toLocaleString("en-US", {
                            dateStyle: "short",
                            timeStyle: "short",
                          })}
                        </Title>
                      </TableCell>
                      <TableCell>{_.startCase(value.service)}</TableCell>
                      <TableCell>{value.address}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </Card>
          </div>
        </>
      )}
    </div>
  );
}
