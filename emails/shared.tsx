import * as React from "react";
import { Body, Container, Head, Heading, Hr, Html, Preview, Section, Text } from "@react-email/components";

import { APP_NAME } from "@/lib/constants";

export function EmailShell({
  preview,
  title,
  children
}: {
  preview: string;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <Html>
      <Head />
      <Preview>{preview}</Preview>
      <Body style={body}>
        <Container style={container}>
          <Text style={eyebrow}>{APP_NAME}</Text>
          <Heading style={heading}>{title}</Heading>
          <Section>{children}</Section>
          <Hr style={hr} />
          <Text style={footer}>
            Veloure sends transactional emails for account, cart, and order activity. Please keep this
            message for your records.
          </Text>
        </Container>
      </Body>
    </Html>
  );
}

export const body: React.CSSProperties = {
  backgroundColor: "#f6f1e9",
  color: "#201d19",
  fontFamily: "Arial, sans-serif",
  margin: 0
};

export const container: React.CSSProperties = {
  backgroundColor: "#ffffff",
  border: "1px solid #e8dfd2",
  margin: "32px auto",
  padding: "34px",
  width: "560px"
};

export const eyebrow: React.CSSProperties = {
  color: "#b38a5e",
  fontSize: "12px",
  fontWeight: 700,
  letterSpacing: "2px",
  textTransform: "uppercase"
};

export const heading: React.CSSProperties = {
  color: "#201d19",
  fontFamily: "Georgia, serif",
  fontSize: "28px",
  lineHeight: "34px",
  margin: "8px 0 20px"
};

export const paragraph: React.CSSProperties = {
  color: "#4f4942",
  fontSize: "15px",
  lineHeight: "24px"
};

export const tableText: React.CSSProperties = {
  color: "#2d2924",
  fontSize: "14px",
  lineHeight: "22px"
};

export const hr: React.CSSProperties = {
  borderColor: "#eee6dc",
  margin: "28px 0 18px"
};

export const footer: React.CSSProperties = {
  color: "#81786e",
  fontSize: "12px",
  lineHeight: "19px"
};
