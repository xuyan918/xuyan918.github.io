import type { Metadata, Viewport } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "小熊工作台",
  description: "离线优先的个人日程、待办与备忘工作台",
  manifest: "/manifest.webmanifest",
  icons: { icon: "/bears/app-bear.jpg", apple: "/bears/app-bear.jpg" },
  appleWebApp: { capable: true, statusBarStyle: "default", title: "小熊工作台" },
  openGraph: {
    title: "小熊工作台",
    description: "认真生活，也要拥抱自己",
    type: "website",
    images: [{ url: "/og.png", width: 1200, height: 630, alt: "小熊工作台" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "小熊工作台",
    description: "认真生活，也要拥抱自己",
    images: ["/og.png"],
  },
};

export const viewport: Viewport = {
  themeColor: "#f7c9cf",
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="zh-CN"><body>{children}</body></html>;
}
