"use client";
import React, { useState, useRef } from "react";
import Navbar from "../component/navbar";
import Footer from "../component/Footer";
import Baner from "../component/Baner";
import toast, { Toaster } from "react-hot-toast";
import { BrowserQRCodeReader } from "@zxing/browser";
import { fetchData } from "../utils/apiHelper";

export default function Tracking() {
  const [errors, setErrors] = useState({});
  const [formData, setFormData] = useState({ code: "" });
  const [requestData, setRequestData] = useState(null);
  const [loading, setLoading] = useState(false);

  // تم إزالة useRef لـ fileInputRef لأنه لن يستخدم بعد الآن
  // const fileInputRef = useRef();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  // تم إزالة الدالة handleFileChange بالكامل
  /*
  const handleFileChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = async () => {
      const imageUrl = reader.result;
      try {
        const result = await new BrowserQRCodeReader().decodeFromImageUrl(
          imageUrl
        );
        if (result) {
          setFormData((prev) => ({
            ...prev,
            code: result.getText(),
          }));
          toast.success("تم قراءة رمز QR بنجاح");
        } else {
          toast.error("تعذر قراءة رمز QR");
        }
      } catch (err) {
        toast.error("فشل في قراءة رمز QR");
        console.error(err);
      }
    };
    reader.readAsDataURL(file);
  };
  */

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.code) {
      toast.error("يرجى إدخال الرمز أولاً");
      return;
    }

    setLoading(true);
    setRequestData(null); // Clear previous data

    try {
      const data = await fetchData(
        `/requests/getRequestByReferenceCode/${formData.code}`
      );

      console.log(data);
      if (data.success && data.data) {
        setRequestData(data.data);
        toast.success("تم جلب بيانات الطلب بنجاح");
      } else {
        toast.error("لم يتم العثور على طلب بهذا الرمز");
      }
    } catch (err) {
      console.error(err);
      toast.error("حدث خطأ أثناء جلب البيانات");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <Toaster position="bottom-center" />
      <Navbar />
      <Baner titel="متابعة الطلب" uptitle="منبر المواطن" />
      <main className="page container p-6 mx-auto text-center">
        <form
          onSubmit={handleSubmit}
          className="form-up flex flex-col items-center"
        >
          <div className="form1 grid-cols-1 md:grid-cols-2 gap-4 w-full max-w-4xl">
            <label
              className="w-full text-right font-semibold text-gray-700"
              htmlFor="code"
            >
              ادخل رمز الطلب أو اختر QR
            </label>
            <div className="w-full">
              <input
                id="code"
                className="item-input w-full placeholder-gray-500 placeholder-italic text-right"
                type="text"
                name="code"
                placeholder="أدخل الرمز يدوياً أو استخدم QR"
                onChange={handleChange}
                value={formData.code}
              />
              {/* تم إزالة سطر تحميل الملفات هنا */}
              {/* <input
                type="file"
                accept="image/*"
                onChange={handleFileChange}
                ref={fileInputRef}
                className="w-full py-4 text-right"
              />
              */}
              <button
                type="submit"
                className="bg-[#3da67e] text-white px-6 py-2 rounded mt-4 hover:bg-opacity-90 transition-opacity"
              >
                {loading ? "جاري البحث..." : "بحث"}
              </button>
            </div>
          </div>
        </form>

        {/* عرض البيانات المحسّن في تصميم شبكي (Grid Layout) */}
        {requestData && (
          <div className="mt-8 max-w-6xl mx-auto text-right">
            {/* الحاوية الرئيسية للشبكة (Grid Container) */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* قسم معلومات الطلب - سيكون في الصف الأول، العمود الأول */}
              <div className="bg-gradient-to-br from-white to-gray-50 p-6 rounded-lg shadow-md border border-gray-200 border-l-8 border-l-[#3da67e] transition-all duration-300 ease-in-out hover:shadow-lg hover:scale-[1.005]">
                <h2 className="text-3xl font-extrabold text-[#3da67e] border-b-2 border-gray-300 pb-3 mb-4 flex items-center justify-between">
                  معلومات الطلب
                  <svg
                    className="w-8 h-8 text-[#3da67e]"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01"
                    ></path>
                  </svg>
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4 text-lg text-gray-700">
                  <div>
                    <p className="font-bold text-gray-900">رمز المرجع:</p>
                    <p className="bg-gray-100 p-3 rounded-md shadow-inner text-gray-800">
                      {requestData.reference_code || "لا يوجد"}
                    </p>
                  </div>
                  <div>
                    <p className="font-bold text-gray-900">الوصف:</p>
                    <p className="bg-gray-100 p-3 rounded-md shadow-inner leading-relaxed text-gray-800">
                      {requestData.description || "لا يوجد"}
                    </p>
                  </div>
                  <div>
                    <p className="font-bold text-gray-900">التصنيف:</p>
                    <p className="bg-gray-100 p-3 rounded-md shadow-inner text-gray-800">
                      {requestData.category?.name || "لا يوجد"}
                    </p>
                  </div>
                  <div>
                    <p className="font-bold text-gray-900">نوع الطلب:</p>
                    <p className="bg-gray-100 p-3 rounded-md shadow-inner text-gray-800">
                      {requestData.request_type?.name || "لا يوجد"}
                    </p>
                  </div>
                  <div>
                    <p className="font-bold text-gray-900">الحالة:</p>
                    <span
                      className={`inline-block px-4 py-2 rounded-full text-white text-sm font-semibold w-full text-center tracking-wide shadow-md ${
                        requestData.request_status?.name === "تم الحل"
                          ? "bg-[#3da67e]" // أخضر
                          : requestData.request_status?.name === "قيد المعالجة"
                          ? "bg-blue-500" // أزرق
                          : requestData.request_status?.name === "عاجلة"
                          ? "bg-red-600" // أحمر داكن
                          : requestData.request_status?.name === "قيد الانتظار"
                          ? "bg-yellow-500" // أصفر/برتقالي
                          : requestData.request_status?.name === "متوقفة"
                          ? "bg-red-500" // أحمر
                          : requestData.request_status?.name === "ملغية"
                          ? "bg-gray-700" // رمادي داكن جداً
                          : requestData.request_status?.name === "إعادة التدقيق"
                          ? "bg-purple-600" // بنفسجي
                          : "bg-gray-500" // رمادي افتراضي لأي حالة أخرى
                      }`}
                    >
                      {requestData.request_status?.name || "غير محدد"}
                    </span>
                  </div>
                  <div>
                    <p className="font-bold text-gray-900">الفرع:</p>
                    <p className="bg-gray-100 p-3 rounded-md shadow-inner text-gray-800">
                      {requestData.branch?.name || "لا يوجد"}
                    </p>
                  </div>
                </div>
              </div>

              {/* قسم بيانات مقدم الطلب - سيكون في الصف الأول، العمود الثاني */}
              <div className="bg-gradient-to-br from-white to-gray-50 p-6 rounded-lg shadow-md border border-gray-200 border-l-8 border-l-[#3da67e] transition-all duration-300 ease-in-out hover:shadow-lg hover:scale-[1.005]">
                <h2 className="text-3xl font-extrabold text-[#3da67e] border-b-2 border-gray-300 pb-3 mb-4 flex items-center justify-between">
                  بيانات مقدم الطلب
                  <svg
                    className="w-8 h-8 text-[#3da67e]"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                    ></path>
                  </svg>
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4 text-lg text-gray-700">
                  <div>
                    <p className="font-bold text-gray-900">الاسم:</p>
                    <p className="bg-gray-100 p-3 rounded-md shadow-inner text-gray-800">
                      {requestData.applicant?.name || "لا يوجد"}
                    </p>{" "}
                  </div>
                  <div>
                    <p className="font-bold text-gray-900">الهاتف المحمول:</p>
                    <p className="bg-gray-100 p-3 rounded-md shadow-inner text-gray-800">
                      {requestData.applicant?.mobile_phone || "لا يوجد"}
                    </p>
                  </div>
                  <div>
                    <p className="font-bold text-gray-900">العنوان:</p>
                    <p className="bg-gray-100 p-3 rounded-md shadow-inner text-gray-800">
                      {requestData.applicant?.address || "لا يوجد"}
                    </p>
                  </div>
                </div>
              </div>

              {/* قسم الرد على الطلب - سيكون في الصف الثاني، العمود الأول */}
              <div className="bg-gradient-to-br from-white to-gray-50 p-6 rounded-lg shadow-md border border-gray-200 border-l-8 border-l-[#3da67e] transition-all duration-300 ease-in-out hover:shadow-lg hover:scale-[1.005]">
                <h2 className="text-3xl font-extrabold text-[#3da67e] border-b-2 border-gray-300 pb-3 mb-4 flex items-center justify-between">
                  الرد على الطلب
                  <svg
                    className="w-8 h-8 text-[#3da67e]"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
                    ></path>
                  </svg>
                </h2>
                {requestData.trackings && requestData.trackings.length > 0 ? (
                  <div className="grid grid-cols-1 gap-4 text-lg text-gray-700">
                    <div>
                      <p className="font-bold text-gray-900">الرد:</p>
                      <p className="bg-gray-100 p-3 rounded-md shadow-inner leading-relaxed text-gray-800">
                        {requestData.trackings[0]?.comment || "لا يوجد رد"}
                      </p>
                    </div>
                    <div>
                      <p className="font-bold text-gray-900">تاريخ الرد:</p>
                      <p className="bg-gray-100 p-3 rounded-md shadow-inner text-gray-800">
                        {requestData.trackings[0]?.created_at
                          ? new Date(
                              requestData.trackings[0].created_at
                            ).toLocaleDateString("ar-EG")
                          : "لا يوجد"}
                      </p>
                    </div>
                  </div>
                ) : (
                  <p className="text-gray-500 italic p-3 rounded-md bg-gray-100 shadow-inner">
                    لا يوجد ردود متاحة لهذا الطلب حتى الآن.
                  </p>
                )}
              </div>

              {/* قسم الملفات المرفقة - سيكون في الصف الثاني، العمود الثاني */}
              <div className="bg-gradient-to-br from-white to-gray-50 p-6 rounded-lg shadow-md border border-gray-200 border-l-8 border-l-[#3da67e] transition-all duration-300 ease-in-out hover:shadow-lg hover:scale-[1.005]">
                <h2 className="text-3xl font-extrabold text-[#3da67e] border-b-2 border-gray-300 pb-3 mb-4 flex items-center justify-between">
                  الملفات المرفقة
                  <svg
                    className="w-8 h-8 text-[#3da67e]"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13.5"
                    ></path>
                  </svg>
                </h2>
                {requestData.applicant_attachments &&
                requestData.applicant_attachments.length > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {requestData.applicant_attachments.map((file, idx) => (
                      <a
                        key={idx}
                        href={file.file_path}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center p-4 rounded-lg bg-gradient-to-r from-[#f2f8f6] to-[#e6f2ee] border border-[#6cd6af] shadow-md transform transition-all duration-300 ease-in-out hover:scale-105 hover:shadow-lg hover:from-[#e6f2ee] hover:to-[#d0ebe3] group"
                      >
                        <svg
                          className="w-8 h-8 text-[#3da67e] flex-shrink-0 ml-3 transition-transform duration-300 group-hover:rotate-6"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                          xmlns="http://www.w3.org/2000/svg"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth="2"
                            d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                          ></path>
                        </svg>
                        <span className="flex-grow text-right font-semibold text-gray-800 text-lg group-hover:text-[#2e7d5e] transition-colors duration-200">
                          {file.original_name || `ملف مرفق ${idx + 1}`}
                        </span>
                        <svg
                          className="w-6 h-6 text-gray-400 flex-shrink-0 mr-2 transition-transform duration-300 group-hover:text-[#3da67e] group-hover:translate-x-1"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                          xmlns="http://www.w3.org/2000/svg"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth="2"
                            d="M17 8l4 4m0 0l-4 4m4-4H3"
                          ></path>
                        </svg>
                      </a>
                    ))}
                  </div>
                ) : (
                  <p className="text-gray-500 italic p-3 rounded-md bg-gray-100 shadow-inner">
                    لا يوجد ملفات مرفقة لهذا الطلب.
                  </p>
                )}
              </div>
            </div>
          </div>
        )}
      </main>
      <Footer />
    </div>
  );
}
