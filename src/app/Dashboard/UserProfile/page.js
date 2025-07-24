"use client";
import React, { useState, useEffect } from "react";
import toast from "react-hot-toast";
import { useRouter } from "next/navigation";
// استيراد أيقونات جميلة
import {
  FaUser,
  FaEnvelope,
  FaPhone,
  FaBriefcase,
  FaBuilding,
  FaEdit,
  FaSave,
  FaTimes,
  FaSpinner,
} from "react-icons/fa";
import { RiEditBoxFill } from "react-icons/ri"; // أيقونة لعنوان الصفحة

// دالة جلب التوكن الأصلية (لم يتم تغييرها بناءً على طلبك)
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

const UserProfilePage = () => {
  const [userData, setUserData] = useState({
    id: null,
    name: "",
    email: "",
    phone: "",
    role_name: "",
    branch_name: "",
  });
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
  });
  const [loading, setLoading] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const router = useRouter();

  // تعريف الـ API_URL الأصلي (لم يتم تغييره بناءً على طلبك)
  const API_URL = "http://127.0.0.1:8000/api/";

  useEffect(() => {
    fetchUserProfile();
  }, []);

  const fetchUserProfile = async () => {
    setLoading(true); // بدء التحميل
    const token = getAuthToken();
    if (!token) {
      router.push("/login");
      setLoading(false); // إيقاف التحميل إذا لم يكن هناك توكن
      return;
    }

    try {
      const response = await fetch(`${API_URL}user/profile`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await response.json();

      if (response.ok && data.status === "success") {
        setUserData({
          id: data.data.id,
          name: data.data.name,
          email: data.data.email,
          phone: data.data.phone,
          role_name: data.data.role?.role_name || "—",
          branch_name: data.data.branch?.branch_name || "—",
        });
        setFormData({
          name: data.data.name,
          email: data.data.email,
          phone: data.data.phone,
        });
      } else {
        toast.error(data.message || "فشل في جلب بيانات المستخدم");
        if (response.status === 401) {
          router.push("/login");
        }
      }
    } catch (error) {
      console.error("Error fetching user profile:", error); // رسالة خطأ أوضح
      toast.error("حدث خطأ في الاتصال أو جلب البيانات."); // رسالة للمستخدم
    } finally {
      setLoading(false); // إيقاف التحميل دائمًا في النهاية
    }
  };

  const handleSubmit = async (e) => {
    if (e && e.preventDefault) {
      e.preventDefault();
    }

    setLoading(true); // بدء التحميل
    const token = getAuthToken();

    const userId = userData.id;
    if (!userId) {
      toast.error("معرف المستخدم غير متوفر للتحديث.");
      setLoading(false); // إيقاف التحميل
      return;
    }

    try {
      const response = await fetch(`${API_URL}edit/${userId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          name: formData.name,
          email: formData.email,
          phone: formData.phone,
        }),
      });

      const data = await response.json();

      if (response.ok && data.status === "success") {
        toast.success("تم تحديث الملف الشخصي بنجاح!"); // رسالة toast أفضل
        await fetchUserProfile();
        setIsEditing(false);
      } else {
        toast.error(data.message || "حدث خطأ أثناء الحفظ.");
        setFormData({
          name: userData.name,
          email: userData.email,
          phone: userData.phone,
        });
      }
    } catch (error) {
      console.error("Error updating user profile:", error); // رسالة خطأ أوضح
      toast.error("حدث خطأ في الاتصال أثناء الحفظ."); // رسالة للمستخدم
      setFormData({
        name: userData.name,
        email: userData.email,
        phone: userData.phone,
      });
    } finally {
      setLoading(false); // إيقاف التحميل دائمًا في النهاية
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prevData) => ({
      ...prevData,
      [name]: value,
    }));
  };

  const handleToggleEdit = async () => {
    if (isEditing) {
      await handleSubmit();
    } else {
      setIsEditing(true);
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  const handleCancel = () => {
    setFormData({
      name: userData.name,
      email: userData.email,
      phone: userData.phone,
    });
    setIsEditing(false);
    toast.info("تم التراجع عن التغييرات.");
  };

  // حالة التحميل الأولية لعرض رسالة "جاري التحميل"
  if (loading && !userData.id) {
    // عرض التحميل فقط إذا لم يتم تحميل بيانات المستخدم بعد
    return (
      <div className="flex justify-center items-center min-h-[70vh] bg-gray-50">
        <p className="text-gray-600 text-xl font-medium animate-pulse">
          جاري تحميل بيانات الملف الشخصي...
        </p>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center justify-start min-h-[70vh] p-4 bg-gray-50">
      <h2 className="text-3xl font-extrabold text-gray-800 mb-8 text-center">
        الملف الشخصي
        <RiEditBoxFill className="inline-block text-[#3da67e] mr-2" />{" "}
        {/* أيقونة بجانب العنوان */}
      </h2>

      <form
        onSubmit={isEditing ? handleSubmit : (e) => e.preventDefault()}
        className="w-full max-w-xl bg-white p-8 rounded-xl shadow-lg border border-gray-200 mb-8"
        dir="rtl"
      >
        <h3 className="text-xl font-semibold text-gray-700 mb-6 text-center">
          {isEditing ? "تعديل معلومات الملف الشخصي" : "معلوماتك الشخصية"}
        </h3>

        {/* حقل الاسم الكامل */}
        <div className="mb-5">
          <label
            className="block text-gray-700 text-sm font-bold mb-2 flex items-center gap-2"
            htmlFor="name"
          >
            <FaUser className="text-lg" />
            الاسم الكامل
          </label>
          <input
            className={`shadow appearance-none border rounded-lg w-full py-2.5 px-4 text-gray-700 leading-tight
                       focus:outline-none focus:ring-2 focus:ring-[#3da67e] focus:border-transparent
                       transition-all duration-200 ease-in-out ${
                         isEditing
                           ? "bg-white"
                           : "bg-gray-100 cursor-not-allowed"
                       }`}
            id="name"
            type="text"
            name="name"
            value={formData.name}
            onChange={handleInputChange}
            readOnly={!isEditing}
            required
          />
        </div>

        {/* حقل البريد الإلكتروني */}
        <div className="mb-5">
          <label
            className="block text-gray-700 text-sm font-bold mb-2 flex items-center gap-2"
            htmlFor="email"
          >
            <FaEnvelope className="text-lg" />
            البريد الإلكتروني
          </label>
          <input
            className={`shadow appearance-none border rounded-lg w-full py-2.5 px-4 text-gray-700 leading-tight
                       focus:outline-none focus:ring-2 focus:ring-[#3da67e] focus:border-transparent
                       transition-all duration-200 ease-in-out ${
                         isEditing
                           ? "bg-white"
                           : "bg-gray-100 cursor-not-allowed"
                       }`}
            id="email"
            type="email"
            name="email"
            value={formData.email}
            onChange={handleInputChange}
            readOnly={!isEditing}
            required
          />
        </div>

        {/* حقل رقم الهاتف */}
        <div className="mb-5">
          <label
            className="block text-gray-700 text-sm font-bold mb-2 flex items-center gap-2"
            htmlFor="phone"
          >
            <FaPhone className="text-lg" />
            رقم الهاتف
          </label>
          <input
            className={`shadow appearance-none border rounded-lg w-full py-2.5 px-4 text-gray-700 leading-tight
                       focus:outline-none focus:ring-2 focus:ring-[#3da67e] focus:border-transparent
                       transition-all duration-200 ease-in-out ${
                         isEditing
                           ? "bg-white"
                           : "bg-gray-100 cursor-not-allowed"
                       }`}
            id="phone"
            type="tel"
            name="phone"
            value={formData.phone}
            onChange={handleInputChange}
            readOnly={!isEditing}
            required
          />
        </div>

        {/* حقل الدور (للعرض فقط) */}
        <div className="mb-5">
          <label
            className="block text-gray-700 text-sm font-bold mb-2 flex items-center gap-2"
            htmlFor="role_name"
          >
            <FaBriefcase className="text-lg" />
            الدور
          </label>
          <input
            className="shadow appearance-none border rounded-lg w-full py-2.5 px-4 text-gray-700 leading-tight
                       focus:outline-none focus:ring-2 focus:ring-gray-300 focus:border-transparent
                       bg-gray-100 cursor-not-allowed transition-all duration-200 ease-in-out"
            id="role_name"
            type="text"
            value={userData.role_name || "—"}
            disabled // Always disabled for display-only
          />
        </div>

        {/* حقل الفرع (للعرض فقط) */}
        <div className="mb-6">
          <label
            className="block text-gray-700 text-sm font-bold mb-2 flex items-center gap-2"
            htmlFor="branch_name"
          >
            <FaBuilding className="text-lg" />
            الفرع
          </label>
          <input
            className="shadow appearance-none border rounded-lg w-full py-2.5 px-4 text-gray-700 leading-tight
                       focus:outline-none focus:ring-2 focus:ring-gray-300 focus:border-transparent
                       bg-gray-100 cursor-not-allowed transition-all duration-200 ease-in-out"
            id="branch_name"
            type="text"
            value={userData.branch_name || "—"}
            disabled // Always disabled for display-only
          />
        </div>

        {/* أزرار الإجراءات */}
        <div className="flex items-center justify-center gap-4 mt-8">
          <button
            onClick={handleToggleEdit}
            className={`font-bold py-2.5 px-5 rounded-lg focus:outline-none focus:shadow-outline
                       transition ease-in-out duration-200 transform hover:scale-105 cursor-pointer shadow-md
                       flex items-center justify-center gap-2 ${
                         isEditing
                           ? "bg-green-600 hover:bg-green-700 text-white"
                           : "bg-yellow-500 hover:bg-yellow-600 text-white"
                       } disabled:opacity-50 disabled:cursor-not-allowed`}
            type="button"
            disabled={loading}
          >
            {loading ? (
              <>
                <FaSpinner className="animate-spin" />{" "}
                <span>جاري الحفظ...</span>
              </>
            ) : isEditing ? (
              <>
                <FaSave /> <span>حفظ التغييرات</span>
              </>
            ) : (
              <>
                <FaEdit /> <span>تعديل الملف الشخصي</span>
              </>
            )}
          </button>

          {isEditing && (
            <button
              type="button"
              onClick={handleCancel}
              className="bg-gray-500 hover:bg-gray-600 text-white font-bold py-2.5 px-5 rounded-lg focus:outline-none focus:shadow-outline
                         transition ease-in-out duration-200 transform hover:scale-105 cursor-pointer shadow-md
                         flex items-center justify-center gap-2"
              disabled={loading}
            >
              <FaTimes />
              <span>إلغاء</span>
            </button>
          )}
        </div>
      </form>
    </div>
  );
};

export default UserProfilePage;
