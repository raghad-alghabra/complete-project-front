// app/layout.js
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css"; // المسار صحيح لـ globals.css من الجذر
import { ibmArabic } from "../fonts";
import { SettingsProvider } from "./context/SettingsContext"; // <--- تأكد من هذا الاستيراد

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata = {
  title: "الجهاز المركزي للرقابة المالية",
  description:
    "الموقع الرسمي لمنبر المواطن الخاص بالجهاو المركزي للرقابة المالية",
};

export default function RootLayout({ children }) {
  return (
    <html
      lang="ar"
      dir="rtl"
      className={`${geistSans.variable} ${geistMono.variable} ${ibmArabic.variable}`}
    >
      <head>
        <link rel="icon" href="/favicon.ico" sizes="any" />
      </head>
      <body className="font-ibm-arabic antialiased bg-white text-black">
        {/* <--- هنا نغلف الـ children بالـ SettingsProvider */}
        <SettingsProvider>{children}</SettingsProvider>
      </body>
    </html>
  );
}
