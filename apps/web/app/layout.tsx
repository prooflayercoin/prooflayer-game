import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Prooflayer",
  description:
    "An idle skilling game in a world held together by layered sigils.",
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
