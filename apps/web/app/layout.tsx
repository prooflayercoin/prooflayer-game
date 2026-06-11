import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Prooflayer",
  description:
    "Explore, gather, craft, and fight through an original isometric online world.",
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
