import type { Metadata, Viewport } from "next";
import { Barlow_Condensed, Plus_Jakarta_Sans } from "next/font/google";
import Providers from "@/components/Providers";
import DemoAutofill from "@/components/DemoAutofill";
import { DataProvider } from "@/lib/store";
import { initialData } from "@/lib/server/initial";
import "./globals.css";

const display = Barlow_Condensed({ subsets: ["latin"], weight: ["600", "800"], style: ["italic"], variable: "--font-display" });
const body = Plus_Jakarta_Sans({ subsets: ["latin"], weight: ["300", "400", "500", "600", "700"], variable: "--font-body" });

export const metadata: Metadata = {
  title: { default: "LCTC Foundation", template: "%s · LCTC Foundation" },
  description: "The Lake County Tech Campus Foundation supports career and technical education students in Lake County, Illinois. Skills, success, future.",
  icons: {
    icon: [{ url: "/favicon.ico", sizes: "any" }, { url: "/assets/favicon-32.png", sizes: "32x32", type: "image/png" }, { url: "/assets/icon-512.png", sizes: "512x512", type: "image/png" }],
    apple: "/assets/apple-touch-icon.png",
  },
};

export const viewport: Viewport = { themeColor: "#015998" };

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const { data, viewer } = await initialData();
  return (
    <html lang="en" className={`${display.variable} ${body.variable}`}>
      <body>
        <DataProvider data={data} viewer={viewer}>
          <Providers>{children}<DemoAutofill /></Providers>
        </DataProvider>
      </body>
    </html>
  );
}
