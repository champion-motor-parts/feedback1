import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Champion Motor Complaint",
  description: "QR complaint and customer service data collection MVP"
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
