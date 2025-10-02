import React from "react";
import type { Metadata } from "next";
import "./globals.css";

export const metadata = {
  title: "my-portfolio",
  description: "This is the my-portfolio project",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
