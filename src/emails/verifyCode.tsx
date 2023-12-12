import {
  Body,
  Container,
  Column,
  Head,
  Heading,
  Html,
  Img,
  Link,
  Preview,
  Row,
  Section,
  Text,
  Tailwind,
} from "@react-email/components";
import * as React from "react";

interface VerifyCodeEmailProps {
  validationCode?: string;
}

export const VerifyCodeEmail = ({
  validationCode = "DJZ-TLX",
}: VerifyCodeEmailProps) => (
  <Html>
    <Head />
    <Preview>Confirm your email address</Preview>
    <Tailwind>
      <Body className="bg-white mx-auto font-sans">
        <Container className="max-w-2xl mx-auto">
          <Section className="mt-8 mx-auto">
            <Img className="mx-auto" src={"https://i.imgur.com/jyuMQ0D.png"} width="300" />
          </Section>
          <Heading className="text-zinc-900 text-4xl font-bold my-8 mx-0 p-0 leading-10">
            Confirm your email address
          </Heading>
          <Text className="text-xl leading-7 mb-8">
            Your confirmation code is below - enter it in your open browser
            window and we&apos;ll help you get started. This code is valid for 5 minutes.
          </Text>

          <Section className="bg-zinc-100 rounded mr-12 mb-8 py-11 px-6">
            <Text className="text-3xl text-center align-middle">
              {validationCode}
            </Text>
          </Section>

          <Text className="text-black text-sm">
            If you didn&apos;t request this email, there&apos;s nothing to worry
            about - you can safely ignore it.
          </Text>
        </Container>
      </Body>
    </Tailwind>
  </Html>
);

export default VerifyCodeEmail;