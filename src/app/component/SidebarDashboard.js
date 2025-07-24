"use client";
import dynamic from "next/dynamic";
import React, { useEffect, useState } from "react";
import "./Sidebar.css";
import arrow from "../../images/Arrow.svg";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { checkUserRole } from "../utils/apiHelper"; // تأكد من المسار الصحيح

const SidebarDashboard = () => {
  const [show, setShow] = useState(4); // ممكن تحتاج تعديل الـ ID الافتراضي هنا إذا كان يتعارض مع "إدارة الطلبات"

  const pathname = usePathname();

  const handleMenuClick = (id) => {
    setShow(id);
  };

  return (
    <div className="sid-bare min-h-[70vh]">
      <ul style={{ listStyle: "none", padding: 0 }}>
        <React.Fragment>
          {/* لوحة التحكم */}
          <li
            onClick={() => handleMenuClick(4)}
            style={{
              backgroundColor:
                pathname === "/Dashboard" ? "#0f5b3e" : "#3da67e",
            }}
            className="item-sidebar"
          >
            <Link href="/Dashboard">
              <div className="flex justify-between items-center">
                لوحةالتحكم
                <span
                  style={{
                    transform:
                      pathname === "/Dashboard"
                        ? "rotate(0deg)"
                        : "rotate(-90deg)",
                  }}
                >
                  <Image src={arrow} alt="arrow" width={30} height={30} />
                </span>
              </div>
            </Link>
          </li>

          {/* === إدارة الطلبات (الجديد - مرئي للكل) === */}
          <li
            onClick={() => handleMenuClick(5)} // أعطيتها ID جديد (مثلاً 5)
            style={{
              backgroundColor:
                pathname === "/Dashboard/Requests" ? "#0f5b3e" : "#3da67e", // مسار جديد لصفحة إدارة الطلبات
            }}
            className="item-sidebar"
          >
            <Link href="/Dashboard/Requests">
              {" "}
              {/* تأكد من هذا المسار */}
              <div className="flex justify-between items-center">
                إدارة الطلبات
                <span
                  style={{
                    transform:
                      pathname === "/Dashboard/Requests"
                        ? "rotate(0deg)"
                        : "rotate(-90deg)",
                  }}
                >
                  <Image src={arrow} alt="arrow" width={30} height={30} />
                </span>
              </div>
            </Link>
          </li>
          {/* ======================================= */}

          {/* ادارة الشكاوي */}
          <li
            onClick={() => handleMenuClick(1)}
            style={{
              backgroundColor:
                pathname === "/Dashboard/Complaints" ? "#0f5b3e" : "#3da67e",
            }}
            className="item-sidebar"
          >
            <Link href="/Dashboard/Complaints">
              <div className="flex justify-between items-center">
                ادارة الشكاوي
                <span
                  style={{
                    transform:
                      pathname === "/Dashboard/Complaints"
                        ? "rotate(0deg)"
                        : "rotate(-90deg)",
                  }}
                >
                  <Image src={arrow} alt="arrow" width={30} height={30} />
                </span>
              </div>
            </Link>
          </li>
          {/* ادارة الابلاغات */}
          <li
            onClick={() => handleMenuClick(1)}
            style={{
              backgroundColor:
                pathname === "/Dashboard/Reportts" ? "#0f5b3e" : "#3da67e",
            }}
            className="item-sidebar"
          >
            <Link href="/Dashboard/Reportts">
              <div className="flex justify-between items-center">
                ادارة الابلاغات
                <span
                  style={{
                    transform:
                      pathname === "/Dashboard/Reportts"
                        ? "rotate(0deg)"
                        : "rotate(-90deg)",
                  }}
                >
                  <Image src={arrow} alt="arrow" width={30} height={30} />
                </span>
              </div>
            </Link>
          </li>
          {/* ادارة التظلمات */}
          <li
            onClick={() => handleMenuClick(1)}
            style={{
              backgroundColor:
                pathname === "/Dashboard/Appeats" ? "#0f5b3e" : "#3da67e",
            }}
            className="item-sidebar"
          >
            <Link href="/Dashboard/Appeats">
              <div className="flex justify-between items-center">
                ادارة التظلمات
                <span
                  style={{
                    transform:
                      pathname === "/Dashboard/Appeats"
                        ? "rotate(0deg)"
                        : "rotate(-90deg)",
                  }}
                >
                  <Image src={arrow} alt="arrow" width={30} height={30} />
                </span>
              </div>
            </Link>
          </li>
          {/* ادارة الثناءات */}
          <li
            onClick={() => handleMenuClick(1)}
            style={{
              backgroundColor:
                pathname === "/Dashboard/Praises" ? "#0f5b3e" : "#3da67e",
            }}
            className="item-sidebar"
          >
            <Link href="/Dashboard/Praises">
              <div className="flex justify-between items-center">
                ادارة الثناءات
                <span
                  style={{
                    transform:
                      pathname === "/Dashboard/Praises"
                        ? "rotate(0deg)"
                        : "rotate(-90deg)",
                  }}
                >
                  <Image src={arrow} alt="arrow" width={30} height={30} />
                </span>
              </div>
            </Link>
          </li>
          {/* ادارة الاقتراحات */}
          <li
            onClick={() => handleMenuClick(1)}
            style={{
              backgroundColor:
                pathname === "/Dashboard/Suggestions" ? "#0f5b3e" : "#3da67e",
            }}
            className="item-sidebar"
          >
            <Link href="/Dashboard/Suggestions">
              <div className="flex justify-between items-center">
                ادارة الاقتراحات
                <span
                  style={{
                    transform:
                      pathname === "/Dashboard/Suggestions"
                        ? "rotate(0deg)"
                        : "rotate(-90deg)",
                  }}
                >
                  <Image src={arrow} alt="arrow" width={30} height={30} />
                </span>
              </div>
            </Link>
          </li>
          {/* ادارة الاستفسارات */}
          <li
            onClick={() => handleMenuClick(1)}
            style={{
              backgroundColor:
                pathname === "/Dashboard/Inguiries" ? "#0f5b3e" : "#3da67e",
            }}
            className="item-sidebar"
          >
            <Link href="/Dashboard/Inguiries">
              <div className="flex justify-between items-center">
                ادارة الاستفسارات
                <span
                  style={{
                    transform:
                      pathname === "/Dashboard/Inguiries"
                        ? "rotate(0deg)"
                        : "rotate(-90deg)",
                  }}
                >
                  <Image src={arrow} alt="arrow" width={30} height={30} />
                </span>
              </div>
            </Link>
          </li>

          {/* بداية الأزرار التي سيتم إظهارها أو إخفاؤها بناءً على الدور */}
          {
            // هذا الشرط يتحقق إذا كان المستخدم ليس واحدًا من الأدوار التي يجب أن تُخفى عنها الأزرار
            // (أي أنه المدير العام أو الدائرة المركزية أو أي دور آخر تريد إظهار الأزرار له)
            !(
              checkUserRole("مدير الفرع") ||
              checkUserRole("مدير العلاقات العامة") ||
              checkUserRole("وكيل اقتصادي") ||
              checkUserRole("وكيل إداري") ||
              checkUserRole("وكيل تحقيق") ||
              checkUserRole("وكيل تأشير")
            ) ? (
              // إذا كان الشرط صحيحًا (أي أن الدور ليس من الأدوار التي تخفى عنها الأزرار)، اعرض هذه الأزرار
              <>
                {/* ادارة المستخدمين */}
                <li
                  onClick={() => handleMenuClick(1)}
                  style={{
                    backgroundColor:
                      pathname === "/Dashboard/User" ? "#0f5b3e" : "#3da67e",
                  }}
                  className="item-sidebar"
                >
                  <Link href="/Dashboard/User">
                    <div className="flex justify-between items-center">
                      ادارة المستخدمين
                      <span
                        style={{
                          transform:
                            pathname === "/Dashboard/User"
                              ? "rotate(0deg)"
                              : "rotate(-90deg)",
                        }}
                      >
                        <Image src={arrow} alt="arrow" width={30} height={30} />
                      </span>
                    </div>
                  </Link>
                </li>
                {/* ادارة التصنيفات */}
                <li
                  onClick={() => handleMenuClick(1)}
                  style={{
                    backgroundColor:
                      pathname === "/Dashboard/Categories"
                        ? "#0f5b3e"
                        : "#3da67e",
                  }}
                  className="item-sidebar"
                >
                  <Link href="/Dashboard/Categories">
                    <div className="flex justify-between items-center">
                      ادارة التصنيفات
                      <span
                        style={{
                          transform:
                            pathname === "/Dashboard/Categories"
                              ? "rotate(0deg)"
                              : "rotate(-90deg)",
                        }}
                      >
                        <Image src={arrow} alt="arrow" width={30} height={30} />
                      </span>
                    </div>
                  </Link>
                </li>
                {/* إدارة إعدادات الموقع */}
                <li
                  onClick={() => handleMenuClick(1)}
                  style={{
                    backgroundColor:
                      pathname === "/Dashboard/SiteSettings"
                        ? "#0f5b3e"
                        : "#3da67e",
                  }}
                  className="item-sidebar"
                >
                  <Link href="/Dashboard/SiteSettings">
                    <div className="flex justify-between items-center">
                      إدارة إعدادات الموقع
                      <span
                        style={{
                          transform:
                            pathname === "/Dashboard/SiteSettings"
                              ? "rotate(0deg)"
                              : "rotate(-90deg)",
                        }}
                      >
                        <Image src={arrow} alt="arrow" width={30} height={30} />
                      </span>
                    </div>
                  </Link>
                </li>
                {/* ادارة سلة المحذوفات */}
                <li
                  onClick={() => handleMenuClick(1)}
                  style={{
                    backgroundColor:
                      pathname === "/Dashboard/Trash" ? "#0f5b3e" : "#3da67e",
                  }}
                  className="item-sidebar"
                >
                  <Link href="/Dashboard/Trash">
                    <div className="flex justify-between items-center">
                      ادارة سلة المحذوفات
                      <span
                        style={{
                          transform:
                            pathname === "/Dashboard/Trash"
                              ? "rotate(0deg)"
                              : "rotate(-90deg)",
                        }}
                      >
                        <Image src={arrow} alt="arrow" width={30} height={30} />
                      </span>
                    </div>
                  </Link>
                </li>
              </>
            ) : (
              // إذا كان الشرط خاطئًا (أي أن الدور هو أحد الأدوار التي يجب أن تخفى عنها الأزرار)، لا تعرض شيئًا
              ""
            )
          }
          {/* نهاية الأزرار التي سيتم إخفاؤها */}
        </React.Fragment>
      </ul>
    </div>
  );
};

export default SidebarDashboard;
