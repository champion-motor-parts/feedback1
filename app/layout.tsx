import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Champion Motor Feedback",
  description: "QR feedback and service data collection MVP"
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
