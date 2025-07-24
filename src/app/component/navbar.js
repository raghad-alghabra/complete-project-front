"use client";
import Link from "next/link";
import Image from "next/image";
import React, { useState, useEffect, useRef } from "react";
import logob from "../../images/logob.png";
import "./style.css";
import "aos/dist/aos.css";
import AOS from "aos";
import { getCookie } from "../utils/apiHelper";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import axios from "axios";
import { Bell, User, LogOut, Settings } from "lucide-react";

export default function Navbar() {
  const router = useRouter();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [token, setToken] = useState(null);
  const [notifications, setNotifications] = useState([]);
  const [showNotificationDropdown, setShowNotificationDropdown] = useState(false);
  const [showProfileDropdown, setShowProfileDropdown] = useState(false);
  const profileDropdownRef = useRef(null);

  const API_URL = process.env.NEXT_PUBLIC_API_URL;

  useEffect(() => {
    const getCookie = (name) => {
      const match = document.cookie.match(
        new RegExp("(^| )" + name + "=([^;]+)")
      );
      return match ? match[2] : null;
    };

    const userToken = getCookie("authToken");
    setToken(userToken);
  }, []);

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  useEffect(() => {
    if (!token) return;

    const fetchNotifications = () => {
      fetch(API_URL + "workflow/Agents/Notification", {
        headers: {
          Authorization: `Bearer ${token}`,
          Accept: "application/json",
        },
      })
        .then(async (res) => {
          const contentType = res.headers.get("content-type");
          if (!res.ok) {
            const text = await res.text();
            throw new Error(`HTTP ${res.status} - ${text}`);
          }
          if (!contentType.includes("application/json")) {
            const html = await res.text();
            throw new Error("Response is not JSON:\n" + html);
          }
          return res.json();
        })
        .then((data) => {
          setNotifications(data.notifications);
        })
        .catch((err) => console.error("فشل تحميل الإشعارات:", err));
    };

    fetchNotifications();

    const interval = setInterval(fetchNotifications, 10000);

    return () => clearInterval(interval);
  }, [token, API_URL]);

  const logout = async () => {
    const token = getCookie("authToken");

    if (!token) {
      toast.error("لم يتم العثور على رمز المصادقة");
      return;
    }

    const headers = {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    };

    try {
      const res = await axios.post(API_URL + "logout", {}, { headers });

      if (res.data.status === "success") {
        localStorage.removeItem("role");
        localStorage.removeItem("branch");
        localStorage.clear();
        document.cookie = "authToken=; path=/; max-age=0;";
        router.push("/");
        toast.success("تم تسجيل الخروج بنجاح");
      } else {
        toast.error("حدث خطأ أثناء تسجيل الخروج");
      }
    } catch (error) {
      console.error("خطأ أثناء تسجيل الخروج:", error);
      toast.error("حدث خطأ أثناء تسجيل الخروج");
    }
  };

  const toggleNotificationDropdown = () => {
    setShowNotificationDropdown(!showNotificationDropdown);
    setShowProfileDropdown(false);
  };

  const toggleProfileDropdown = () => {
    setShowProfileDropdown(!showProfileDropdown);
    setShowNotificationDropdown(false);
  };

  useEffect(() => {
    AOS.init({
      duration: 500,
      easing: "ease-in-out",
      once: true,
    });
  }, []);

  const markAllAsRead = () => {
    fetch(API_URL + "workflow/notifications/mark-as-read", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
        Accept: "application/json",
      },
    })
      .then((res) => {
        if (!res.ok) throw new Error("فشل تعليم الإشعارات كمقروءة");
        return res.json();
      })
      .then(() => {
        console.log("تم تعليم الإشعارات");
        setNotifications([]);
        setShowNotificationDropdown(false);
      })
      .catch((err) => console.error(err));
  };

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (profileDropdownRef.current && !profileDropdownRef.current.contains(event.target)) {
        setShowProfileDropdown(false);
        setShowNotificationDropdown(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [profileDropdownRef]);

  return (
    <header data-aos="fade" className={`header-default text-white`}>
      <nav className={`z-50 flex items-center justify-between w-full px-8 py-4 mx-auto bg-white text-black shadow-lg`}>
        <div className="flex items-center justify-between">
          <div className="flex items-center justify-between px-8">
            <Link href="/">
              <Image
                className="scale-125 mx-4"
                src={logob}
                alt="logo"
                width={250}
                height={100}
              />
            </Link>
          </div>
        </div>
        <div className="hidden md:flex justify-center md:justify-between">
          <ul className="flex gap-4 font-bold">
            <li>
              <Link href="/" className="navbar-link">
                الرئيسية
              </Link>
            </li>
            {token && (
              <li>
                <Link href="/Dashboard" className="navbar-link">
                  لوحة التحكم
                </Link>
              </li>
            )}
            <li>
              <Link href="/Complaint" className="navbar-link">
                منبر المواطن
              </Link>
            </li>
            <li>
              <Link href="/Tracking" className="navbar-link">
                تتبع الطلب
              </Link>
            </li>
          </ul>
        </div>
        <ul className="hidden md:flex justify-center md:justify-between items-center gap-4">
          {token && (
            <>
              <li className="relative">
                <button
                  onClick={toggleNotificationDropdown}
                  className="relative p-2 rounded-full bg-white hover:bg-gray-200"
                >
                  <Bell className="w-6 h-6 text-green-700" />
                  {notifications.length > 0 && (
                    <span className="absolute top-0 right-0 bg-red-500 text-white text-xs rounded-full px-1">
                      {notifications.length}
                    </span>
                  )}
                </button>

                {showNotificationDropdown && (
                    <div className="absolute right-0 mt-2 w-80 bg-white border border-gray-300 rounded-lg shadow-lg z-10">
                    <div className="p-2 max-h-96 overflow-y-auto text-right">
                      <button
                        onClick={markAllAsRead}
                        className="w-full text-sm text-blue-600 hover:underline mb-2 text-left"
                      >
                        تعليم الكل كمقروء
                      </button>

                      {notifications.map((notif) => (
                        <div key={notif.id} className="border-b py-2">
                          <p className="text-sm text-gray-700">{notif.comment}</p>
                          <p className="text-xs text-gray-500">
                            {new Date(notif.created_at).toLocaleString("ar-EG")}
                          </p>
                        </div>
                      ))}

                      {notifications.length === 0 && (
                        <p className="text-center text-sm text-gray-500 py-4">
                          لا توجد إشعارات حالياً
                        </p>
                      )}
                    </div>
                  </div>
                )}
              </li>
              <li className="relative" ref={profileDropdownRef}>
                <button
                  onClick={toggleProfileDropdown}
                  className="relative p-2 rounded-full bg-white hover:bg-gray-200"
                >
                  <User className="w-6 h-6 text-green-700" />
                </button>

                {showProfileDropdown && (
                  <div className="absolute end-0 mt-2 w-48 bg-white border border-gray-300 rounded-lg shadow-lg z-10">
                    <div className="p-2 text-right">
                      <Link href="/Dashboard/UserProfile" className="block px-4 py-2 text-gray-800 hover:bg-gray-100 flex items-center gap-2">
                        <Settings className="w-4 h-4" />
                        <span>استعراض الملف الشخصي</span>
                      </Link>
                      <button
                        onClick={logout}
                        className="w-full text-right px-4 py-2 text-gray-800 hover:bg-gray-100 flex items-center gap-2"
                      >
                        <LogOut className="w-4 h-4" />
                        <span>تسجيل الخروج</span>
                      </button>
                    </div>
                  </div>
                )}
              </li>
            </>
          )}

          {!token && (
            <li>
              <Link href="/login">
                <button className="bg-[#3da67e] text-white border-2 border-[#3da67e] p-3 rounded-lg transition-all duration-300 ease-in-out hover:bg-white hover:text-[#3da67e] cursor-pointer">
                  تسجيل الدخول
                </button>
              </Link>
            </li>
          )}
        </ul>
        <div className="md:hidden">
          <button
            onClick={toggleMenu}
            className="text-[#3da67e] text-2xl transition-all duration-300 ease-in-out hover:text-[#2b8264]"
          >
            {isMenuOpen ? "X" : "☰"}
          </button>
        </div>
      </nav>
      <div
        className={`md:hidden mobile-menu-container ${
          isMenuOpen ? "open" : ""
        }`}
      >
        <ul className="mobile-menu-list">
          <li>
            <Link href="/" className="navbar-link-mobile" onClick={toggleMenu}>
              الرئيسية
            </Link>
          </li>
          {token && (
            <li>
              <Link href="/Dashboard" className="navbar-link-mobile" onClick={toggleMenu}>
                لوحة التحكم
              </Link>
            </li>
          )}
          <li>
            <Link href="/Complaint" className="navbar-link-mobile" onClick={toggleMenu}>
              منبر المواطن
            </Link>
          </li>
          <li>
            <Link href="/Tracking" className="navbar-link-mobile" onClick={toggleMenu}>
              تتبع الطلب
            </Link>
          </li>
          {token ? (
            <>
              <li>
                <Link href="/Dashboard/UserProfile" className="navbar-link-mobile" onClick={toggleMenu}>
                  استعراض الملف الشخصي
                </Link>
              </li>
              <li>
                <button
                  onClick={() => {
                    logout();
                    toggleMenu();
                  }}
                  className="navbar-link-mobile w-full text-right"
                >
                  تسجيل الخروج
                </button>
              </li>
            </>
          ) : (
            <li>
              <Link href="/login" className="navbar-link-mobile" onClick={toggleMenu}>
                تسجيل الدخول
              </Link>
            </li>
          )}
        </ul>
      </div>
    </header>
  );
}