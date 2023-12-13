"use client";

import Loading from "@/components/Loading";
import { Item } from "@/interfaces/Items";
import { Schedule } from "@/interfaces/Schedule";
import { Transactions } from "@/interfaces/Transactions";
import { dataFormatter } from "@/utils/Formatters";
import {
  AreaChart,
  BadgeDelta,
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
    thisYear: Transactions[];
    lastYear: Transactions[];
    totalPriceByMonthLastYear: {
      month: number;
      total_price: number;
    }[];
    totalPriceByMonthThisYear: {
      month: number;
      total_price: number;
    }[];
    earnings: number;
    lastYearEarnings: number;
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

type AreaChartData = {
  [x: number]: number;
  name: string;
};

export default function Dashboard() {
  const [data, setData] = useState<AnalyticsData | null>(null);
  const [todaySales, setTodaySales] = useState<number>(0);
  const [totalEarning, setTotalEarnings] = useState<number>(0);
  const [chartData, setChartData] = useState<AreaChartData[]>([]);
  const [itemsChartData, setItemsChartData] = useState<ItemChatData[]>([]);
  const [paymentChartData, setPaymentChartData] = useState<PaymentChartData[]>(
    []
  );
  const [transactionsPercentage, setTransactionsPercentage] =
    useState<number>(0);
  const [earningsPercentage, setEarningsPercentage] = useState<number>(0);

  useEffect(() => {
    const fetchData = async () => {
      const res = await fetch("/api/dashboard");
      const body = (await res.json()) as AnalyticsData;

      // Destructure the object to be used by the chart data methods
      const {
        transactions,
        transactions: {
          totalPriceByMonthThisYear,
          totalPriceByMonthLastYear,
          paymentMethods,
        },
        items,
      } = body;

      setData(body);
      setTodaySales(transactions.todaySales);
      setTotalEarnings(transactions.earnings);

      // Calculate the percentage differentials
      setTransactionsPercentage(
        ((transactions.thisYear.length - transactions.lastYear.length) /
          transactions.lastYear.length) *
          100
      );
      setEarningsPercentage(
        ((transactions.earnings - transactions.lastYearEarnings) /
          transactions.lastYearEarnings) *
          100
      );

      /**
       * Dynamically generates an array containing:
       * {
       *    name: The month
       *    [currentYear]: The current year's data
       *    [lastYear]: Last year's data
       * }
       *
       * We then populate the data one by one.
       */
      const currentYear = new Date().getFullYear();
      const lastYear = currentYear - 1;
      const updatedChartData = Array.from({ length: 12 }, (_, i) => ({
        name: new Date(currentYear, i).toLocaleString("default", {
          month: "long",
        }),
        [currentYear]: 0,
        [lastYear]: 0,
      }));

      // This populates the current year's data
      totalPriceByMonthThisYear.forEach(
        (value) =>
          (updatedChartData[value.month - 1][currentYear] = value.total_price)
      );

      // This populates last year's data
      totalPriceByMonthLastYear.forEach(
        (value) =>
          (updatedChartData[value.month - 1][lastYear] = value.total_price)
      );

      setChartData(updatedChartData);

      // Uncomment this when you want to see the generated data
      console.log(updatedChartData);

      const itemsChartData = items
        .map(({ name, quantity }) => ({ name, value: quantity }))
        .sort((a, b) => a.value - b.value);

      setItemsChartData(itemsChartData);

      const paymentChartData = Object.entries(paymentMethods).map(
        ([key, value]) => ({
          name: _.startCase(key),
          value,
        })
      );

      setPaymentChartData(paymentChartData);
    };

    if (!data) {
      fetchData();
    }
  }, [data, chartData]);

  function getDeltaType(value: number) {
    let deltaType = "unchanged";
    if (value > 20) {
      deltaType = "increase";
    } else if (value > 10) {
      deltaType = "moderateIncrease";
    } else if (value < 0) {
      deltaType = "moderateDecrease";
    } else if (value < -10) {
      deltaType = "decrease";
    }

    return deltaType;
  }

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
              className="drop-shadow-md h-full"
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
                  <Metric className="mt-3">{data?.items.length || 0}</Metric>
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
                  <Metric className="mt-3">{todaySales}</Metric>
                </div>
              </div>
            </Card>
            <Card
              decoration="top"
              decorationColor="amber"
              className="drop-shadow-md"
            >
              <div className="flex gap-3">
                <Icon
                  icon={TbSwitchHorizontal}
                  color="amber"
                  variant="simple"
                  size="lg"
                  tooltip="This year's Transactions"
                />
                <div>
                  <Flex>
                    <Text>This year&apos;s Transactions</Text>
                    <BadgeDelta
                      className="ml-7"
                      deltaType={getDeltaType(transactionsPercentage)}
                      isIncreasePositive={true}
                      size="xs"
                    >
                      {`${
                        transactionsPercentage > 0 ? "+" : ""
                      }${transactionsPercentage.toFixed(2)}%`}
                    </BadgeDelta>
                  </Flex>
                  <Metric className="mt-1">{data?.transactions.thisYear.length || 0}</Metric>
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
                  <Flex>
                    <Text>This year&apos;s Sales</Text>
                    <BadgeDelta
                      className="ml-7"
                      deltaType={getDeltaType(earningsPercentage)}
                      isIncreasePositive={true}
                      size="xs"
                    >
                      {`${
                        earningsPercentage > 0 ? "+" : ""
                      }${earningsPercentage.toFixed(2)}%`}
                    </BadgeDelta>
                  </Flex>
                  <Metric className="mt-1">{dataFormatter(totalEarning).slice(1)}</Metric>
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
                categories={[
                  `${new Date().getFullYear()}`,
                  `${new Date().getFullYear() - 1}`,
                ]}
                colors={["blue", "red"]}
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
