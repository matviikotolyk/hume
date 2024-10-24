import "./_lib/polyfills";
import "~/styles/globals.css";
import "@radix-ui/themes/styles.css";
import { Theme } from "@radix-ui/themes";
import Providers from "./providers";

import { DM_Sans } from "next/font/google";
import { type Metadata } from "next";

const dm_sans = DM_Sans({
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Journova",
  description: "A therapist that uses AI to help you",
  icons: [{ rel: "icon", url: "/favicon_sun.ico" }],
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" className={`${dm_sans.className}`}>
      <body>
        <Providers>
          <Theme>{children}</Theme>
        </Providers>
      </body>
    </html>
  );
}
