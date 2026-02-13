import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Talents Hill Inc - Intelligent Analytics. Intelligently Delivered.",
  description:
    "Talents Hill Inc provides marketing analytics, customer analytics, and data integration services to help businesses maximize their potential.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="antialiased">{children}</body>
    </html>
  );
}
