import {
  Html,
  Tailwind,
  Container,
  Heading,
  Section,
  Img,
  Hr,
  Head,
  Preview,
  Body,
  Text,
  Link,
  Row,
  Column,
} from "@react-email/components";
import * as React from "react";

interface ConfirmationEmailProps {
  date: string;
  name: string;
  service: string;
  quantity: number;
  itemName?: string;
  acType?: string;
}

export default function ConfirmationEmail(props: ConfirmationEmailProps) {
  return (
    <Html>
      <Head />
      <Preview>Your schedule is confirmed!</Preview>
      <Tailwind>
        <Body className="bg-white my-auto mx-auto ">
          <Container className="border border-solid border-[#eaeaea] rounded my-[40px] mx-auto p-[20px] w-[465px] font-sans">
            <Section>
              <Img
                width={300}
                className="mx-auto mt-10 mb-5"
                src={"https://i.imgur.com/jyuMQ0D.png"}
              />
            </Section>
            <Hr />
            <Container className="text-center mb-5">
              <Section className="mb-3">
                <Heading>Hi {props.name},</Heading>
                <Heading as="h2">Your schedule is confirmed!</Heading>
              </Section>
              <Section className="text-left text-lg">
                <table>
                  <tr>
                    <td className="font-bold">Time:</td>
                    <td>
                      {props.date}
                    </td>
                  </tr>
                  <tr>
                    <td className="font-bold">Service:</td>
                    <td>{props.service}</td>
                  </tr>
                  {props.itemName ? (
                    <tr>
                      <td className="font-bold">Item:</td>
                      <td>{props.itemName}</td>
                    </tr>
                  ) : (
                    <tr>
                      <td className="font-bold">AC Type:</td>
                      <td>{props.acType}</td>
                    </tr>
                  )}
                  <tr>
                    <td className="font-bold">Quantity:</td>
                    <td>{props.quantity}</td>
                  </tr>
                </table>
              </Section>
              <Hr />
              <Section className="text-center">
                <Text>If you have any concerns please reach out through:</Text>
                <Row>
                  <Column className="text-center">
                    <Link href="tel:+639324156997">Phone</Link>
                  </Column>
                  <Column className="text-center">
                    <Link href="mailto:pampystrading@gmail.com">E-Mail</Link>
                  </Column>
                  <Column className="text-center">
                    <Link href="https://www.facebook.com/fpamplonarefandaircon?mibextid=LQQJ4d">
                      Facebook
                    </Link>
                  </Column>
                </Row>
              </Section>
            </Container>
          </Container>
        </Body>
      </Tailwind>
    </Html>
  );
}
