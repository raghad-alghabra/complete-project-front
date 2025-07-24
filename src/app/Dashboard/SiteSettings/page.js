"use client";
import React, { useState, useEffect } from "react";
import toast from "react-hot-toast";
import { useSettings } from "../../context/SettingsContext";
import {
  FaEdit,
  FaSave,
  FaTimes,
  FaPhone,
  FaMapMarkerAlt,
  FaCopyright,
  FaCog, // إضافة أيقونة الترس للعناوين
} from "react-icons/fa"; // أيقونات جديدة
import { MdEmail } from "react-icons/md"; // أيقونة الإيميل

// Helper function to get auth token from cookies
function getAuthToken() {
  const name = "authToken=";
  const decodedCookie = decodeURIComponent(document.cookie);
  const ca = decodedCookie.split(";");
  for (let i = 0; i < ca.length; i++) {
    let c = ca[i];
    while (c.charAt(0) === " ") {
      c = c.substring(1);
    }
    if (c.indexOf(name) === 0) {
      return c.substring(name.length, c.length);
    }
  }
  return "";
}

const SiteSettingsPage = () => {
  const { settings, fetchSettings } = useSettings();
  const [formData, setFormData] = useState({
    email: "",
    phone: "",
    address: "",
    copyright: "",
  });
  const [loading, setLoading] = useState(false);
  const [isEditing, setIsEditing] = useState(false);

  useEffect(() => {
    if (settings) {
      setFormData({
        email: settings.email || "",
        phone: settings.phone || "",
        address: settings.address || "",
        copyright: settings.copyright || settings.copyright_text || "",
      });
    }
  }, [settings]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prevData) => ({
      ...prevData,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    const token = getAuthToken();

    try {
      const response = await fetch("/api/settings", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          email: formData.email,
          phone: formData.phone,
          address: formData.address,
          copyright_text: formData.copyright,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        toast.success(data.message || "تم تحديث الإعدادات بنجاح!");
        await fetchSettings();
        setIsEditing(false);
      } else {
        toast.error(data.message || "حدث خطأ أثناء حفظ الإعدادات!");
      }
    } catch (error) {
      console.error("Error:", error);
      toast.error("حدث خطأ في الاتصال، الرجاء المحاولة لاحقًا.");
    }
    setLoading(false);
  };

  const handleEdit = () => {
    setFormData({
      email: settings?.email || "",
      phone: settings?.phone || "",
      address: settings?.address || "",
      copyright: settings?.copyright || settings?.copyright_text || "",
    });
    setIsEditing(true);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleCancel = () => {
    setFormData({
      email: settings?.email || "",
      phone: settings?.phone || "",
      address: settings?.address || "",
      copyright: settings?.copyright || settings?.copyright_text || "",
    });
    setIsEditing(false);
    toast.info("تم التراجع عن التغييرات.");
  };

  return (
    <div
      className="flex flex-col items-center justify-start min-h-[70vh] p-4 bg-gray-50"
      dir="rtl"
    >
      {" "}
      {/* إضافة dir="rtl" */}
      <h2 className="text-3xl font-extrabold text-gray-800 mb-6 text-center">
        إعدادات الموقع
        {/* إضافة أيقونة الترس هنا */}
        <FaCog className="inline-block text-[#3da67e] mr-2" />
      </h2>
      {/* نموذج التعديل */}
      <form
        onSubmit={handleSubmit}
        className="w-full max-w-xl bg-white p-8 rounded-xl shadow-lg border border-gray-200 mb-8"
      >
        <h3 className="text-xl font-semibold text-gray-700 mb-6 text-center">
          {isEditing ? "تعديل معلومات الموقع" : "عرض معلومات الموقع"}
        </h3>

        {/* حقول الإدخال */}
        {[
          {
            label: "البريد الإلكتروني",
            name: "email",
            type: "email",
            icon: <MdEmail />,
          },
          { label: "الهاتف", name: "phone", type: "text", icon: <FaPhone /> },
          {
            label: "العنوان",
            name: "address",
            type: "text",
            icon: <FaMapMarkerAlt />,
          },
          {
            label: "حقوق النشر",
            name: "copyright",
            type: "text",
            icon: <FaCopyright />,
          },
        ].map((field, index) => (
          <div className="mb-5" key={index}>
            <label
              className="block text-gray-700 text-sm font-bold mb-2 flex items-center gap-2"
              htmlFor={field.name}
            >
              {field.icon}
              {field.label}
            </label>
            <input
              className={`shadow appearance-none border rounded-lg w-full py-2.5 px-4 text-gray-700 leading-tight
                          focus:outline-none focus:ring-2 focus:ring-[#3da67e] focus:border-transparent
                          transition-all duration-200 ease-in-out ${
                            !isEditing
                              ? "bg-gray-100 cursor-not-allowed"
                              : "bg-white"
                          }`}
              id={field.name}
              type={field.type}
              name={field.name}
              value={formData[field.name]}
              onChange={handleInputChange}
              disabled={!isEditing}
              dir="rtl"
            />
          </div>
        ))}

        {/* أزرار الحفظ والإلغاء تظهر فقط عند التعديل */}
        {isEditing && (
          <div className="flex items-center justify-center gap-4 mt-8">
            <button
              className="flex items-center justify-center gap-2 bg-green-600 hover:bg-green-700 text-white font-bold py-2.5 px-5 rounded-lg focus:outline-none focus:shadow-outline
                          transition ease-in-out duration-200 transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer shadow-md"
              type="submit"
              disabled={loading}
            >
              <FaSave />
              {loading ? "جاري الحفظ..." : "حفظ التغييرات"}
            </button>
            <button
              type="button"
              onClick={handleCancel}
              className="flex items-center justify-center gap-2 bg-gray-500 hover:bg-gray-600 text-white font-bold py-2.5 px-5 rounded-lg focus:outline-none focus:shadow-outline
                          transition ease-in-out duration-200 transform hover:scale-105 cursor-pointer shadow-md"
            >
              <FaTimes />
              إلغاء
            </button>
          </div>
        )}
      </form>
      {/* جدول عرض الإعدادات */}
      <div className="w-full max-w-6xl overflow-x-auto bg-white shadow-lg rounded-xl border border-gray-200 mt-8">
        <table className="min-w-full table-auto border-collapse">
          <thead className="bg-[#3da67e] text-white font-bold sticky top-0 z-10 shadow-sm">
            <tr>
              <th className="p-3 text-center w-[20%]">البريد الإلكتروني</th>
              <th className="p-3 text-center w-[15%]">الهاتف</th>
              <th className="p-3 text-center w-[35%]">العنوان</th>
              <th className="p-3 text-center w-[20%]">حقوق النشر</th>
              <th className="p-3 text-center w-[10%]">الإجراءات</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            <tr>
              <td className="px-6 py-4 text-sm text-gray-700 text-center">
                {settings?.email || "—"}
              </td>
              <td className="px-6 py-4 text-sm text-gray-700 text-center">
                {settings?.phone || "—"}
              </td>
              <td className="px-6 py-4 text-sm text-gray-700 text-center">
                {settings?.address || "—"}
              </td>
              <td className="px-6 py-4 text-sm text-gray-700 text-center">
                {settings?.copyright || settings?.copyright_text || "—"}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-center text-sm font-medium">
                {!isEditing && (
                  <button
                    onClick={handleEdit}
                    className="flex items-center justify-center bg-yellow-500 hover:bg-yellow-600 text-white px-3 py-1 rounded-md text-xs font-medium transition duration-150 ease-in-out shadow-sm cursor-pointer"
                    type="button"
                  >
                    {/* هنا أضفنا `gap-1` لإنشاء مسافة بين الأيقونة والنص */}
                    <span className="flex items-center gap-1">
                      <FaEdit className="text-sm" />
                      <span>تعديل الإعدادات</span>
                    </span>
                  </button>
                )}
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default SiteSettingsPage;
