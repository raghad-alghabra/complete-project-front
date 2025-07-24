// app/component/Footer.js
"use client";
import React, { useEffect } from "react";
import "aos/dist/aos.css";
import AOS from "aos";
import icon1 from "../../images/icon/facebook.png";
import icon2 from "../../images/icon/instagram.png";
import icon3 from "../../images/icon/telegram.png";
import icon4 from "../../images/icon/twitter.png";
import icon5 from "../../images/icon/whatsapp.png";
import Image from "next/image";
import logo from "../../images/logo.png";
import Link from "next/link";
import { useSettings } from "../context/SettingsContext"; // <--- استيراد useSettings

export default function Footer() {
  const { settings, loading, error } = useSettings(); // <--- استخدام useSettings لجلب الإعدادات

  useEffect(() => {
    AOS.init({
      duration: 1000,
      easing: "ease-in-out",
      once: true,
    });
  }, []);

  // هذا الكونسول لوج الذي أكد لنا وصول البيانات
  useEffect(() => {
    console.log("Footer Component: Current settings:", settings);
    console.log("Footer Component: Loading state:", loading);
    console.log("Footer Component: Error state:", error);
  }, [settings, loading, error]);

  // إذا كان لا يزال يحمل، يظهر نص التحميل
  if (loading) {
    return (
      <footer className="bg-[#3da67e] text-white py-8 text-center">
        جاري تحميل الإعدادات...
      </footer>
    );
  }

  // إذا كان هناك خطأ، يظهر رسالة الخطأ
  if (error) {
    return (
      <footer className="bg-[#3da67e] text-white py-8 text-center">
        خطأ في تحميل إعدادات الفوتر: {error}.
      </footer>
    );
  }

  // في حال عدم وجود خطأ والتحميل انتهى، يتم عرض الفوتر بالبيانات
  return (
    <footer className="bg-[#3da67e] text-white py-8">
      <div className="container mx-auto grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        <div className="flex flex-col items-start px-4" data-aos="zoom-in">
          <Image
            src={logo}
            alt="شعار الموقع"
            width={250}
            height={100}
            className="mb-2"
          />
          <h2 className="text-l font-bold mb-6">
            هذا الموقع الرسمي للجهاز المركزي للرقابة المالية، يهدف لتقديم
            الخدمات والمعلومات للمواطنين بطريقة سهلة وآمنة.
          </h2>
          <div>
            <p className="text-base">تابعنا على:</p>
            <div className="flex justify-center items-start my-4">
              <span className="icon w-[30px] h-[30px] m-2 flex justify-center items-center">
                <Image src={icon1} alt="icon" />
              </span>
              <span className="icon w-[30px] h-[30px] m-2 flex justify-center items-center">
                <Image src={icon2} alt="icon" />
              </span>
              <span className="icon w-[30px] h-[30px] m-2 flex justify-center items-center">
                <Image src={icon3} alt="icon" />
              </span>
              <span className="icon w-[30px] h-[30px] m-2 flex justify-center items-center">
                <Image src={icon4} alt="icon" />
              </span>
              <span className="icon w-[30px] h-[30px] m-2 flex justify-center items-center">
                <Image src={icon5} alt="icon" />
              </span>
            </div>
          </div>
        </div>

        <div className="px-4" data-aos="zoom-in">
          <h4 className="text-lg font-bold mb-4">معلومات التواصل</h4>
          <ul>
            <li>
              <Link
                href=""
                className="text-white hover:text-[#fcc347] hover:pr-1"
              >
                <p>البريد الإلكتروني: {settings.email || "N/A"}</p>
              </Link>
            </li>
            <li>
              <Link
                href=""
                className="text-white hover:text-[#fcc347] hover:pr-1"
              >
                <p>الهاتف: {settings.phone || "N/A"}</p>
              </Link>
            </li>
            <li>
              <Link
                href=""
                className="text-white hover:text-[#fcc347] hover:pr-1"
              >
                <p>العنوان: {settings.address || "N/A"}</p>
              </Link>
            </li>
          </ul>
        </div>

        <div className="px-4" data-aos="zoom-in">
          <h4 className="text-lg font-bold mb-4">روابط سريعة</h4>
          <ul>
            <li>
              <Link
                href=""
                className="text-white hover:text-[#fcc347] hover:pr-1"
              >
                قائمة الأخبار
              </Link>
            </li>
            <li>
              <Link
                href=""
                className="text-white hover:text-[#fcc347] hover:pr-1"
              >
                الشكاوي
              </Link>
            </li>
            <li>
              <Link
                href=""
                className="text-white hover:text-[#fcc347] hover:pr-1"
              >
                الاقتراحات
              </Link>
            </li>
            <li>
              <Link
                href=""
                className="text-white hover:text-[#fcc347] hover:pr-1"
              >
                الأسئلة الشائعة
              </Link>
            </li>
          </ul>
        </div>
      </div>
      <p className="text-center text-white pt-6">
        {settings.copyright || "N/A"}
      </p>
    </footer>
  );
}
