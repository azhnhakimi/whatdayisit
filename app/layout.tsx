import type { Metadata } from "next";
import { spaceGrotesk } from "@/utils/fonts";
import "./globals.css";

export const metadata: Metadata = {
  title: {
    default: "WDII",
    template: "%s | WDII",
  },
  icons: {
    icon: [
      {
        url: "/icons/app-icon.png",
        type: "image/png",
      },
    ],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${spaceGrotesk.variable} h-full antialiased`}>
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}
