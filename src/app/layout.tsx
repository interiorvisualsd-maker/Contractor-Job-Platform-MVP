import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Fixr — Find verified contractors",
  description: "Submit your home repair or renovation job and get matched with a verified local contractor.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
