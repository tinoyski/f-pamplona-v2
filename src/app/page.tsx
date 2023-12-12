"use client";

import Loading from "@/components/Loading";
import ScheduleForm from "@/components/ScheduleForm";
import { Item } from "@/interfaces/Items";
import { dataFormatter } from "@/utils/Formatters";
import { Divider } from "@tremor/react";
import { Button, Card } from "flowbite-react";
import Image from "next/image";
import { useEffect, useState } from "react";

export default function Home() {
  const [items, setItems] = useState<Item[]>([]);
  const [item, setItem] = useState<Item>();
  const [openModal, setOpenModal] = useState<String | undefined>();

  const props = {
    openModal,
    setOpenModal,
    item,
    setItem,
  };

  useEffect(() => {
    const fetchData = async () => {
      // console.log("fetchData is fired!");
      const res = await fetch("/api/items");
      const data = await res.json();

      setItems(data);
    };

    if (!items.length) {
      fetchData();
    }
  }, [items.length]);

  return (
    <>
      <main className="flex flex-col items-center justify-center gap-8 pt-20 p-6">
        <div className="mt-14 md:mt-36">
          <Image
            src="/ac_logo_transparent.svg"
            alt="Aircon Logo"
            width={480}
            height={480}
            priority={true}
          />
        </div>
        <p className="text-lg text-center w-full sm:w-2/5">
          We offer <span className="font-bold">FREE INSTALLATION</span> for all
          the items, as well as{" "}
          <span className="font-bold">FREE 1st CLEANING</span> of your
          Air-Conditioning units. For{" "}
          <span className="underline underline-offset-2">
            cleaning and repair
          </span>
          , click the <span className="font-bold">Schedule now</span> button.
          For <span className="underline underline-offset-2">installation</span>
          , click the <span className="font-bold">See products</span> button to
          choose your preferred Air-Conditioning Unit, then click{" "}
          <span className="font-bold">Book now</span> button to schedule your
          installation.
        </p>
        <div className="flex space-x-2">
          <Button onClick={() => props.setOpenModal("schedule-form")}>
            {/* <PiCalendarDuotone className="mr-2 h-5 w-5" /> */}
            <p className="">Schedule Now</p>
          </Button>
          <Button href="/#products" color="light">
            <p className="">See products</p>
          </Button>
        </div>
        <div
          id="products"
          className="flex flex-wrap gap-10 mt-32 mb-10 pt-32 justify-center"
        >
          {!items.length ? (
            <Loading />
          ) : (
            items.map((item) => (
              <Card key={item.id}>
                <Image
                  src={item.img_url!}
                  alt={item.name}
                  width={400}
                  height={400}
                />
                <Divider />
                <div className="mt-auto">
                  <div className="mb-3">
                    <h6 className="text-lg font-medium">{item.name}</h6>
                    <p className="mb-3 font-light">
                      Items in stock: {item.quantity}
                    </p>
                    <h5>{dataFormatter(item.unit_price)}</h5>
                  </div>
                  <Button
                    className="w-full"
                    disabled={item.quantity <= 0}
                    onClick={() => {
                      props.setOpenModal("schedule-form");
                      setItem(item);
                    }}
                  >
                    {item.quantity > 0 ? "Book now" : "Sold out"}
                  </Button>
                </div>
              </Card>
            ))
          )}
        </div>

        {/* Schedule Form */}
        <ScheduleForm {...props} />
      </main>
    </>
  );
}
