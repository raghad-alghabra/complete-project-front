// app/Dashboard/layout.js
"use client";

import Navbar from "../component/navbar";
import Baner from "../component/Baner";
import SidebarDashboard from "../component/SidebarDashboard";
import Footer from "../component/Footer";
import { usePathname } from "next/navigation";
import { Toaster } from "react-hot-toast";
import "../globals.css"; // <--- هذا هو المسار المصحح لـ globals.css

// دالة للحصول على اسم الصفحة من الـ URL
const getPageTitle = (pathname) => {
  const pageTitles = {
    "/Dashboard": "الرئيسية",
    "/Dashboard/Complaints": "إدارة الشكاوي",
    "/Dashboard/Reportts": "إدارة البلاغات",
    "/Dashboard/Appeats": "إدارة التظلمات",
    "/Dashboard/Praises": "إدارة الثناءات",
    "/Dashboard/Suggestions": "إدارة الاقتراحات",
    "/Dashboard/Inguiries": "إدارة الاستفسارات",
    "/Dashboard/User": "إدارة المستخدمين",
    "/Dashboard/Categories": "إدارة التصنيفات",
    "/Dashboard/Trash": "إدارة سلة المحذوفات",
    "/Dashboard/SiteSettings": "إعدادات الموقع",
  };
  return pageTitles[pathname] || "لوحة التحكم";
};

export default function DashboardLayout({ children }) {
  const pathname = usePathname();
  const title = getPageTitle(pathname);
  return (
    <div>
      <Toaster position="bottom-center" />
      <Navbar />
      <Baner titel={title} uptitle="لوحة التحكم" />
      <div style={{ display: "flex" }}>
        <SidebarDashboard />
        <div style={{ flex: 1, padding: "20px" }} className="overflow-x-auto">
          {children}
        </div>
      </div>
      <Footer />
    </div>
  );
}
