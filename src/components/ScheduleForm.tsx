import { Item } from "@/interfaces/Items";
import { ScheduleResult } from "@/interfaces/Schedule";
import {
  CalendarApi,
  EventSourceApi
} from "@fullcalendar/core/index.js";
import dayGridPlugin from "@fullcalendar/daygrid";
import interactionPlugin, { DateClickArg } from "@fullcalendar/interaction";
import FullCalendar from "@fullcalendar/react";
import { Button, Label, Modal, Select, TextInput } from "flowbite-react";
import { Formik, FormikHelpers } from "formik";
import _ from "lodash";
import ms from "ms";
import { createRef, useEffect, useRef, useState } from "react";
import { AiFillCheckCircle } from "react-icons/ai";
import { toast } from "react-toastify";
import { number, object, string } from "yup";

interface CalendarEvent {
  id: string;
  title: string;
  start: string;
  end: string;
}

interface ExistingEvent {
  title: string;
  date: Date;
}

/**
 * 
 * Schedule Form: 
   - Name
   - Address
   - Email - > confirmation
   - Contact -> Contact point of personnel upon arriving 
   - Unit/Item
   - Select Service: Installation/Cleaning
   - Calendar - > use this: [FullCalendar](https://fullcalendar.io/docs/react)
 */
export interface ScheduleFormValues {
  name: string;
  address1: string;
  address2: string;
  email: string;
  contact: string;
  ac_type: "split" | "window" | "NONE";
  quantity: number | null;
}

export default function ScheduleForm({ ...props }) {
  const initialInputRef = useRef<HTMLInputElement>(null);
  const [openModal, setOpenModal] = useState<string | undefined>("");
  const [events, setEvents] = useState<CalendarEvent[]>([]);
  const [event, setEvent] = useState<CalendarEvent>();
  const [existingEvents, setExistingEvents] = useState<ExistingEvent[]>([]);
  const [date, setDate] = useState<Date>();
  const [modalSize, setModalSize] = useState<string>("4xl");
  const [service, setService] = useState<
    "installation" | "cleaning" | "repair" | "NONE" | string
  >("");
  const [serviceInputError, setServiceInputErrors] = useState("");
  const [modalTitle, setModalTitle] = useState(
    "Schedule (Click date to select time slot)"
  );
  const [values, setValues] = useState<ScheduleFormValues>();
  const [resend, setResend] = useState<boolean>(false);
  const [resending, setResending] = useState<boolean>(false);

  const [code, setCode] = useState<string>();
  const [isVerifying, setIsVerifying] = useState<boolean>(false);
  const [isValid, setIsValid] = useState<boolean>(false);
  const [isExpired, setIsExpired] = useState<boolean>(false);
  const [payload, setPayload] = useState<any>({});
  const [errorMessage, setErrorMessage] = useState("");

  const item: Item = props.item;
  const calendarRef = createRef<FullCalendar>();
  const initialValues: ScheduleFormValues = {
    name: "",
    address1: "",
    address2: "",
    email: "",
    contact: "",
    ac_type: "NONE",
    quantity: 1,
  };

  useEffect(() => {
    const fetchSchedules = async () => {
      const schedRes = await fetch("/api/schedule");
      const { todo } = (await schedRes.json()) as ScheduleResult;

      const existingEvents = todo.map((value) => {
        return { title: value.service, date: new Date(value.date) };
      });
      setExistingEvents(existingEvents);

      const events: CalendarEvent[] = todo.map((value, i) => {
        return {
          id: `${i}`,
          title: _.startCase(value.service),
          start: value.date,
          end: new Date(
            new Date(value.date).setHours(
              new Date(value.date).getHours() + 2,
              0,
              0,
              0
            )
          ).toISOString(),
        };
      });
      setEvents(events);
    };

    if (!existingEvents.length) {
      fetchSchedules();
    }
  }, [existingEvents.length]);

  const validationSchema = object({
    name: string().required().label("Name"),
    address1: string().required().label("Address"),
    address2: string(),
    email: string().required().email().label("Email"),
    contact: string()
      .test("is-number", "Must be a valid phone number", (value) => {
        if (typeof value != "string") return false; // we only process strings!
        return (
          !Number.isNaN(value) && // use type coercion to parse the _entirety_ of the string (`parseFloat` alone does not do this)...
          !Number.isNaN(Number.parseFloat(value)) // ...and ensure strings of whitespace fail
        );
      })
      .test(
        "is-ten",
        "Invalid number!",
        (value) =>
          value !== undefined && value.replaceAll(" ", "").length === 10
      )
      .required()
      .label("Contact"),
    ac_type: item
      ? string().label("AC Type")
      : string()
          .test(
            "is-none",
            "AC Type is required",
            (value) => value !== undefined && value !== "NONE"
          )
          .required()
          .label("AC Type"),
    quantity: number()
      .required()
      .min(1)
      .max(2, "Maximum of 2 units per time slot only!")
      .label("Quantity"),
  });

  async function handleSubmit(
    values: ScheduleFormValues,
    { setSubmitting }: FormikHelpers<ScheduleFormValues>
  ) {
    setValues(values);
    // setSubmitting(true);
    const res = await fetch("/auth/send", {
      method: "POST",
      body: JSON.stringify({ email: values.email, date: date?.toISOString() }),
    });

    const data = await res.json();

    if (data.error) {
      toast.error(data.error);
      return;
    }

    if (data.status === 250) {
      setSubmitting(false);
      setResend(false);
      props.setOpenModal(undefined);
      setOpenModal("confirm-modal");
      setPayload({
        ...values,
        service,
        item: item || null,
        date: date?.getTime(),
        secret: data.secret,
        step: data.step,
      });
      setTimeout(() => {
        setIsExpired(true);
        setErrorMessage(
          "The code has expired, click on the button below to send another one!"
        );
      }, ms(`${data.step}s`));
    }
  }

  async function verifyCode() {
    if (!code) {
      setErrorMessage("Code is required!");
      return;
    }

    setIsVerifying(true);
    const res = await fetch("/auth/verify", {
      method: "POST",
      body: JSON.stringify({
        secret: payload.secret,
        code,
        step: payload.step,
      }),
    });

    const data = await res.json();

    if (data.valid) {
      const scheduleResult = await fetch("/api/schedule", {
        method: "POST",
        body: JSON.stringify(payload),
      });
      const scheduleData = await scheduleResult.json();

      if (scheduleData.error) {
        toast.error(scheduleData.error);
        return;
      }

      if (scheduleData.status === 201) {
        setCode(undefined);
        setPayload({});
        setIsVerifying(false);
        setIsValid(true);
        toast.success("Event scheduled!");
      }
    } else {
      setIsValid(false);
      setIsVerifying(false);
      setErrorMessage("Invalid code! Please try again");
    }
  }

  async function resendCode() {
    setResending(true);
    setErrorMessage("");
    const res = await fetch("/auth/send", {
      method: "POST",
      body: JSON.stringify({ email: values?.email }),
    });
    const data = await res.json();

    if (data.status === 250) {
      toast.success("Email re-sent!", { position: "top-center" });
      setResend(true);
      setResending(false);
      setIsExpired(false);
      setPayload({
        ...values,
        service,
        item: item || null,
        date: date?.getTime(),
        secret: data.secret,
        step: data.step,
      });
      setTimeout(() => {
        setIsExpired(true);
        setErrorMessage(
          "The code has expired, click on the button below to send another one!"
        );
      }, ms(`${data.step}s`));
    }
  }

  function handleDateClick(arg: DateClickArg) {
    // Signifies the events of the date selected
    const todayEvents = existingEvents
      .filter((event) => event.date.toDateString() === arg.date.toDateString())
      .sort((a, b) => a.date.getTime() - b.date.getTime());

    if (arg.date.getDay() === 0) {
      // It's sunday so don't proceed
      toast.warn("Our operating hours is from Monday to Saturday only!");
      return;
    }

    // If the date selected is lower than the current date, don't proceed
    if (arg.date < new Date()) {
      toast.error("Invalid Date!");
      return;
    }

    if (todayEvents.length >= 4) {
      toast.error("That day is fully booked!");
      return;
    }

    const hours = [7, 9, 13, 15].filter(
      (hour) => !todayEvents.map(({ date }) => date.getHours()).includes(hour)
    );

    // Set initial time to be based on the most recent available time
    arg.date.setHours(hours[0], 0, 0, 0);

    setService(item ? "installation" : "NONE");
    setDate(arg.date);
    setOpenModal("select-time-modal");
  }

  async function createEvent(calendarApi: CalendarApi) {
    if (!date) return;

    if (service === "NONE") {
      setServiceInputErrors("Service is required!");
      return;
    }

    const newEvent = {
      id: `${events.length + 1}`,
      title: _.startCase(service),
      start: date.toISOString(),
      end: new Date(
        new Date(date).setHours(date.getHours() + 2, 0, 0, 0)
      ).toISOString(),
    };

    console.log(newEvent);

    if (!event) {
      calendarApi.addEvent(newEvent, events as unknown as EventSourceApi);
      setEvents([...events, newEvent]);
    } else {
      const newEvents = events.map((value) => {
        if (value.id === event.id) {
          return (value = newEvent);
        } else {
          return value;
        }
      });
      setEvents(newEvents);
    }

    setEvent(newEvent);
    setOpenModal(undefined);
    nextPage();
    toast.success("Event scheduled!");
  }

  useEffect(() => {
    console.log(date);
  }, [date]);

  // Form page navigation functions
  function nextPage() {
    const calendar = document.getElementById("calendar");
    const form = document.getElementById("form");

    calendar?.classList.add("hidden");
    form?.classList.remove("hidden");
    setModalSize("2xl");
    setModalTitle("Schedule");
  }

  function prevPage() {
    const calendar = document.getElementById("calendar");
    const form = document.getElementById("form");

    calendar?.classList.remove("hidden");
    form?.classList.add("hidden");
    setModalSize("4xl");
    setModalTitle("Schedule (Click date to select time slot)");
  }

  return (
    <>
      {/* Select Time Slot Modal */}
      <Modal
        show={openModal === "select-time-modal"}
        position="bottom-center"
        onClose={() => setOpenModal(undefined)}
      >
        <Modal.Header>Select Time Slot</Modal.Header>
        <Modal.Body>
          <div className="mb-2">
            <div className="mb-2">
              <Label
                htmlFor="select_time"
                value={date?.toLocaleString("en-US", {
                  timeStyle: "short",
                  dateStyle: "full",
                })}
              />
            </div>
            <Select
              id="select_time"
              required
              onChange={(event) => {
                // Parse the string to number using shorthand "+" operator. Alternative is Number.parseInt(string)
                // Update the date to the chosen time
                setDate(
                  (d) => d && new Date(d.setHours(+event.target.value, 0, 0, 0))
                );
              }}
            >
              <option
                value={7}
                disabled={existingEvents.some(
                  (event) =>
                    event.date.getTime() ===
                    new Date(new Date(date!).setHours(7)).getTime()
                )}
              >
                7AM
              </option>
              <option
                value={9}
                disabled={existingEvents.some(
                  (event) =>
                    event.date.getTime() ===
                    new Date(new Date(date!).setHours(9)).getTime()
                )}
              >
                9AM
              </option>
              <option
                value={13}
                disabled={existingEvents.some(
                  (event) =>
                    event.date.getTime() ===
                    new Date(new Date(date!).setHours(13)).getTime()
                )}
              >
                1PM
              </option>
              <option
                value={15}
                disabled={existingEvents.some(
                  (event) =>
                    event.date.getTime() ===
                    new Date(new Date(date!).setHours(15)).getTime()
                )}
              >
                3PM
              </option>
            </Select>
          </div>

          {/* Service input */}
          <div>
            <div className="mb-2">
              <Label
                color={serviceInputError ? "failure" : undefined}
                htmlFor="service"
                value="Service"
              />
            </div>
            <Select
              id="service"
              required
              disabled={item ? true : false}
              defaultValue={item ? "installation" : "NONE"}
              color={serviceInputError ? "failure" : undefined}
              helperText={serviceInputError || undefined}
              onChange={(event) => {
                setService(event.target.value);
                setServiceInputErrors("");
              }}
            >
              <option value={"NONE"} disabled>
                Select a service
              </option>
              <option value={"cleaning"}>Cleaning</option>
              <option value={"repair"}>Repair</option>
              <option value={"installation"} className="hidden">
                Installation
              </option>
            </Select>
          </div>
        </Modal.Body>
        <Modal.Footer>
          <Button
            onClick={() =>
              calendarRef.current && createEvent(calendarRef.current.getApi())
            }
          >
            Select
          </Button>
          {/* <Button color="grey" onClick={() => setOpenModal("confirm-modal")}>
            Test
          </Button> */}
          <Button color="failure" onClick={() => setOpenModal(undefined)}>
            Cancel
          </Button>
        </Modal.Footer>
      </Modal>

      {/* Confirmation & Verify Modal */}
      <Modal show={openModal === "confirm-modal"} size="2xl" popup>
        <Modal.Body>
          <div className="text-center pt-8 pb-2">
            {isValid ? (
              // Success part
              <div className="flex flex-col gap-3 justify-center items-center">
                <h4 className="mb-4 flex justify-center">
                  <AiFillCheckCircle className="w-10 h-10 text-green-500 mr-1" />{" "}
                  Success!
                </h4>
                <div className="mb-4">
                  <p>You have successfully verified your email!</p>
                  <p>
                    We sent you another email confirming your schedule with us!
                  </p>
                </div>
                <Button
                  className="w-fit"
                  onClick={() => window.location.reload()}
                >
                  Great, Thanks!
                </Button>
              </div>
            ) : (
              // OTP Part
              <div className="flex flex-col gap-3 items-center justify-center">
                <h4 className="mb-4">Verify your email address</h4>
                <div className="mb-4">
                  <p>
                    We&apos;ve {resend ? "re-sent" : "sent"} you a 6-digit code
                    to <span className="font-bold">{payload?.email}</span>.
                  </p>
                  <p>Enter the code below to confirm your email address.</p>
                </div>
                <TextInput
                  id="code-input"
                  className="w-full"
                  disabled={isExpired}
                  maxLength={6}
                  color={errorMessage ? "failure" : undefined}
                  helperText={<span>{errorMessage}</span>}
                  onChange={(e) => {
                    setErrorMessage("");
                    setCode(e.target.value);
                  }}
                />
                {isExpired ? (
                  <Button
                    color="success"
                    className="w-fit px-3"
                    isProcessing={resending}
                    onClick={() => resendCode()}
                  >
                    Resend Code
                  </Button>
                ) : (
                  <Button
                    color="success"
                    className="w-fit px-3"
                    disabled={code?.length !== 6}
                    isProcessing={isVerifying}
                    onClick={() => verifyCode()}
                  >
                    Verify
                  </Button>
                )}
              </div>
            )}
          </div>
        </Modal.Body>
      </Modal>

      {/* Main Modal */}
      <Modal
        show={props.openModal === "schedule-form"}
        size={modalSize}
        popup
        onClose={() => {
          setModalSize("4xl");
          setEvents(events.filter((e) => e.id !== event?.id));
          setEvent(undefined);
          props.setOpenModal(undefined);
          props.setItem(null);
        }}
        initialFocus={initialInputRef}
      >
        <Modal.Header className="mr-2 flex items-center justify-center">
          <p className="pl-4 mt-2">{modalTitle}</p>
        </Modal.Header>
        <Modal.Body>
          <div id="calendar">
            <FullCalendar
              ref={calendarRef}
              plugins={[dayGridPlugin, interactionPlugin]}
              initialView="dayGridMonth"
              selectable={true}
              events={events}
              eventDisplay="block"
              eventColor="#3b82f6"
              eventTimeFormat={{
                hour: "numeric",
                meridiem: "short",
              }}
              businessHours={{
                // days of week. an array of zero-based day of week integers (0=Sunday)
                daysOfWeek: [1, 2, 3, 4, 5, 6], // Monday - Saturday
                startTime: "8:00", // a start time (8am)
                endTime: "15:00", // an end time (3pm)
              }}
              dateClick={handleDateClick}
              views={{
                dayGrid: {
                  dayMaxEventRows: 2,
                },
              }}
            />
            <Button
              onClick={nextPage}
              disabled={!event}
              className="mt-3 ml-auto"
            >
              Next
            </Button>
          </div>
          <div id="form" className="hidden">
            <Formik
              initialValues={initialValues}
              validationSchema={validationSchema}
              onSubmit={handleSubmit}
            >
              {(formik) => (
                <form
                  className="flex flex-col gap-4"
                  onSubmit={formik.handleSubmit}
                >
                  {/* Name input */}
                  <div>
                    <Label
                      color={
                        formik.touched.name && formik.errors.name
                          ? "failure"
                          : undefined
                      }
                      htmlFor="name"
                      value="Name"
                    />
                    <TextInput
                      id="name"
                      placeholder="Name"
                      ref={initialInputRef}
                      color={
                        formik.touched.name && formik.errors.name
                          ? "failure"
                          : undefined
                      }
                      helperText={
                        formik.touched.name && formik.errors.name ? (
                          <span>{formik.errors.name}</span>
                        ) : null
                      }
                      {...formik.getFieldProps("name")}
                    />
                  </div>

                  {/* Address line 1 input */}
                  <div>
                    <Label
                      color={
                        formik.touched.address1 && formik.errors.address1
                          ? "failure"
                          : undefined
                      }
                      htmlFor="address1"
                      value="Address Line 1"
                    />
                    <TextInput
                      id="address1"
                      placeholder="Address Line 1"
                      color={
                        formik.touched.address1 && formik.errors.address1
                          ? "failure"
                          : undefined
                      }
                      helperText={
                        formik.touched.address1 && formik.errors.address1 ? (
                          <span>{formik.errors.address1}</span>
                        ) : null
                      }
                      {...formik.getFieldProps("address1")}
                    />
                  </div>

                  {/* Address line 2 input */}
                  <div>
                    <Label
                      color={
                        formik.touched.address2 && formik.errors.address2
                          ? "failure"
                          : undefined
                      }
                      htmlFor="address2"
                      value="Address Line 2"
                    />
                    <TextInput
                      id="address2"
                      placeholder="Address Line 2 (Optional)"
                      color={
                        formik.touched.address2 && formik.errors.address2
                          ? "failure"
                          : undefined
                      }
                      helperText={
                        formik.touched.address2 && formik.errors.address2 ? (
                          <span>{formik.errors.address2}</span>
                        ) : null
                      }
                      {...formik.getFieldProps("address2")}
                    />
                  </div>

                  {/* Email input */}
                  <div>
                    <Label
                      color={
                        formik.touched.email && formik.errors.email
                          ? "failure"
                          : undefined
                      }
                      htmlFor="email"
                      value="Email"
                    />
                    <TextInput
                      id="email"
                      type="email"
                      placeholder="e.g. johndoe@email.com"
                      color={
                        formik.touched.email && formik.errors.email
                          ? "failure"
                          : undefined
                      }
                      helperText={
                        formik.touched.email && formik.errors.email ? (
                          <span>{formik.errors.email}</span>
                        ) : null
                      }
                      {...formik.getFieldProps("email")}
                    />
                  </div>

                  {/* Contact input */}
                  <div>
                    <Label
                      color={
                        formik.touched.contact && formik.errors.contact
                          ? "failure"
                          : undefined
                      }
                      htmlFor="contact"
                      value="Contact"
                    />
                    <TextInput
                      id="contact"
                      addon="+63"
                      placeholder="e.g. 9123456789"
                      maxLength={10}
                      color={
                        formik.touched.contact && formik.errors.contact
                          ? "failure"
                          : undefined
                      }
                      helperText={
                        formik.touched.contact && formik.errors.contact ? (
                          <span>{formik.errors.contact}</span>
                        ) : null
                      }
                      onBlurCapture={() =>
                        (formik.values.contact =
                          formik.values.contact.replaceAll(" ", "").length ===
                          10
                            ? formik.values.contact.replace(
                                /(\d{3})(\d{3})(\d{4})/,
                                "$1 $2 $3"
                              )
                            : formik.values.contact.replaceAll(" ", ""))
                      }
                      {...formik.getFieldProps("contact")}
                    />
                  </div>

                  {/* Date input */}
                  <div>
                    <Label htmlFor="date" value="Scheduled Date" />
                    <TextInput
                      id="date"
                      readOnly
                      value={date?.toLocaleString("en-US", {
                        timeStyle: "short",
                        dateStyle: "full",
                      })}
                    />
                  </div>

                  {/* Service input */}
                  <div>
                    <Label htmlFor="service" value="Service" />
                    <TextInput
                      id="service"
                      readOnly
                      value={_.startCase(service)}
                    />
                  </div>

                  {!item ? (
                    <>
                      {/* AC Type input */}
                      <div>
                        <Label
                          color={
                            formik.touched.ac_type && formik.errors.ac_type
                              ? "failure"
                              : undefined
                          }
                          htmlFor="ac_type"
                          value="AC Type"
                        />
                        <Select
                          id="ac_type"
                          color={
                            formik.touched.ac_type && formik.errors.ac_type
                              ? "failure"
                              : undefined
                          }
                          helperText={
                            formik.touched.ac_type && formik.errors.ac_type ? (
                              <span>{formik.errors.ac_type}</span>
                            ) : null
                          }
                          {...formik.getFieldProps("ac_type")}
                        >
                          <option value={"NONE"} disabled>
                            Choose a type
                          </option>
                          <option>Split Type</option>
                          <option>Window Type</option>
                        </Select>
                      </div>
                    </>
                  ) : (
                    <>
                      {/* AC Unit */}
                      <div>
                        <Label htmlFor="ac_unit" value="AC Unit" />
                        <TextInput id="ac_unit" readOnly value={item.name} />
                      </div>
                    </>
                  )}

                  {/* Quantity input */}
                  <div>
                    <div className="mt-2 block">
                      <Label
                        color={
                          formik.touched.quantity && formik.errors.quantity
                            ? "failure"
                            : undefined
                        }
                        htmlFor="quantity"
                        value="Quantity (Maximum of 2 units per time slot only)"
                      />
                    </div>
                    <TextInput
                      id="quantity"
                      type="number"
                      min={1}
                      max={item?.quantity || undefined}
                      color={
                        formik.touched.quantity && formik.errors.quantity
                          ? "failure"
                          : undefined
                      }
                      helperText={
                        formik.touched.quantity && formik.errors.quantity ? (
                          <span>{formik.errors.quantity}</span>
                        ) : null
                      }
                      {...formik.getFieldProps("quantity")}
                    />
                  </div>

                  <div className="flex mt-3">
                    <Button onClick={() => prevPage()}>Prev</Button>
                    <Button
                      type="submit"
                      isProcessing={formik.isSubmitting}
                      className="ml-auto"
                    >
                      Submit
                    </Button>
                  </div>
                </form>
              )}
            </Formik>
          </div>
        </Modal.Body>
      </Modal>
    </>
  );
}
