import type { Metadata } from "next";
import type { ReactNode } from "react";
import "./globals.css";
import { Toaster } from "react-hot-toast";
import { getSessionUser } from "@/lib/auth/server";
import StaffChrome from "@/components/auth/StaffChrome";
export const metadata: Metadata = {
  title: "Bossque Cafe POS",
  description: "Cafe and retail point of sale",
};
export default async function RootLayout({
  children,
}: {
  children: ReactNode;
}) {
  const session = await getSessionUser();
  return (
    <html lang="en">
      <body>
        <StaffChrome user={session?.user ?? null}>{children}</StaffChrome>
        <Toaster position="top-center" />
      </body>
    </html>
  );
}
