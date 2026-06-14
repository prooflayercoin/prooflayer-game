import type { Metadata } from "next";
import Script from "next/script";
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
      <body>
        {children}
        <Script
          defer
          data-website-id="dfid_m24GrQYSiHfnILgRTstU3"
          data-domain="prooflayer.app"
          src="https://datafa.st/js/script.js"
          strategy="afterInteractive"
        />
      </body>
    </html>
  );
}
