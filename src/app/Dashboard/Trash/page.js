"use client";
import toast from "react-hot-toast";
import { addData, deleteData, fetchDataAuth } from "../../utils/apiHelper";
import { useEffect, useState } from "react";
// استيراد أيقونات عصرية
import { MdRestoreFromTrash, MdDeleteForever } from "react-icons/md";
// إضافة أيقونة التحذير وسلة المهملات للعنوا
import { FaExclamationTriangle, FaTrash } from "react-icons/fa";

export default function TrashPage() {
  const [deletedRequests, setDeletedRequests] = useState([]);
  const [loading, setLoading] = useState(false);

  const loadDeletedRequests = async () => {
    setLoading(true);
    try {
      const response = await fetchDataAuth("/requests/trashed");
      console.log(response.data.data);
      setDeletedRequests(response.data.data || []);
    } catch (error) {
      console.error("فشل تحميل الطلبات المحذوفة:", error);
      toast.error("فشل في تحميل الطلبات المحذوفة. الرجاء المحاولة مرة أخرى.");
    }
    setLoading(false);
  };

  const handleRestore = async (id) => {
    try {
      const response = await addData(`/requests/restore/${id}`);
      toast.success(response.message || "تمت استعادة الطلب بنجاح!");
      loadDeletedRequests();
    } catch (error) {
      console.error("فشل في استعادة الطلب:", error);
      toast.error(error.message || "فشل في استعادة الطلب. حدث خطأ.");
    }
  };

  const handleForceDelete = async (id) => {
    toast(
      (t) => (
        <div className="flex flex-col items-center gap-2 p-3 text-center">
          <FaExclamationTriangle className="text-red-500 text-4xl mb-3 animate-pulse" />
          <p className="text-gray-800 text-xl font-bold mb-2">
            تأكيد الحذف النهائي!
          </p>
          <p className="text-gray-700 text-base mb-4">
            هل أنت متأكد تمامًا من حذف هذا الطلب بشكل نهائي؟
            <br />
            لا يمكن التراجع عن هذا الإجراء!
          </p>
          <div className="flex gap-4">
            <button
              className="bg-red-700 hover:bg-red-800 text-white font-bold py-2.5 px-6 rounded-lg transition duration-200 shadow-lg flex items-center gap-2"
              onClick={async () => {
                toast.dismiss(t.id); // إغلاق رسالة التأكيد
                try {
                  const response = await deleteData(`/requests/force/${id}`);
                  toast.success(
                    response.message || "تم حذف الطلب بشكل نهائي بنجاح!"
                  );
                  loadDeletedRequests(); // إعادة تحميل الطلبات
                } catch (error) {
                  console.error("فشل الحذف النهائي:", error);
                  toast.error(
                    error.message || "فشل الحذف النهائي. يرجى التحقق."
                  );
                }
              }}
            >
              <MdDeleteForever className="text-xl" />
              <span>نعم، احذف نهائيًا</span>
            </button>
            <button
              className="bg-gray-500 hover:bg-gray-600 text-white font-bold py-2.5 px-6 rounded-lg transition duration-200 shadow-lg flex items-center gap-2"
              onClick={() => toast.dismiss(t.id)} // إغلاق رسالة التأكيد فقط
            >
              <span>إلغاء</span>
            </button>
          </div>
        </div>
      ),
      {
        duration: Infinity, // اجعل الرسالة تظل حتى يتم اتخاذ إجراء
        position: "top-center",
        style: {
          background: "#fff",
          color: "#333",
          borderRadius: "15px",
          padding: "25px",
          maxWidth: "450px",
          width: "90%",
          boxShadow: "0 8px 30px rgba(0,0,0,0.25)",
          border: "2px solid #ef4444", // حدود حمراء للتأكيد
        },
        ariaProps: {
          role: "status",
          "aria-live": "polite",
        },
      }
    );
  };

  useEffect(() => {
    loadDeletedRequests();
  }, []);

  return (
    <div
      className="flex flex-col items-center justify-start min-h-[70vh] p-4 bg-gray-50"
      dir="rtl"
    >
      {" "}
      {/* إضافة dir="rtl" لتنسيق أفضل */}
      <h2 className="text-3xl font-extrabold text-gray-800 mb-6 text-center">
        سلة المحذوفات
        {/* إضافة أيقونة سلة المهملات هنا */}
        <FaTrash className="inline-block text-gray-600 mr-2" />
      </h2>
      {loading ? (
        <div className="flex justify-center items-center h-64 bg-white rounded-lg shadow-md w-full max-w-5xl">
          <p className="text-gray-600 text-lg font-medium animate-pulse">
            جاري تحميل الطلبات...
          </p>
        </div>
      ) : deletedRequests.length === 0 ? (
        <div className="flex flex-col justify-center items-center h-64 bg-white rounded-lg shadow-md w-full max-w-5xl">
          <p className="text-gray-600 text-lg font-medium mb-2">
            سلة المحذوفات فارغة حاليًا.
          </p>
          <p className="text-gray-500 text-sm">لا توجد طلبات هنا.</p>
        </div>
      ) : (
        <div className="w-full max-w-6xl overflow-x-hidden bg-white shadow-lg rounded-xl border border-gray-200">
          <table className="min-w-full table-auto border-collapse">
            <thead className="bg-[#3da67e] text-white font-bold sticky top-0 z-10 shadow-sm">
              <tr>
                <th className="p-3 text-center w-[5%]">ID</th>
                <th className="p-3 text-right w-[75%]">الوصف</th>
                <th className="p-3 text-center w-[20%]">الإجراءات</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {deletedRequests.map((req) => (
                <tr
                  key={req.id}
                  className="border-b border-gray-100 hover:bg-gray-50 transition-colors duration-150 ease-in-out group"
                >
                  <td className="px-3 py-2 whitespace-nowrap text-sm font-medium text-gray-900 text-center">
                    {req.id}
                  </td>
                  <td className="px-3 py-2 text-sm text-gray-700 text-right">
                    <div className="relative w-full h-full flex items-center">
                      <span className="block overflow-hidden text-ellipsis whitespace-nowrap cursor-pointer">
                        {req.description
                          ? req.description.substring(0, 40) +
                            (req.description.length > 40 ? "..." : "")
                          : "لا يوجد وصف"}
                      </span>
                      {req.description && req.description.length > 40 && (
                        <div
                          className="absolute hidden group-hover:block bottom-full left-1/2 -translate-x-1/2 mb-2 p-3 bg-gray-800 text-white text-xs rounded-lg border border-gray-600 shadow-2xl z-30 whitespace-normal break-words
                                   max-w-xs sm:max-w-sm md:max-w-md lg:max-w-lg xl:max-w-xl
                                   opacity-0 group-hover:opacity-100 transform scale-95 group-hover:scale-100 transition-all duration-300 ease-in-out delay-100 origin-bottom"
                        >
                          {req.description}
                        </div>
                      )}
                    </div>
                  </td>
                  <td className="px-3 py-2 whitespace-nowrap text-center text-sm font-medium">
                    <div className="flex items-center justify-center gap-1">
                      <button
                        onClick={() => handleRestore(req.id)}
                        className="flex items-center justify-center bg-green-600 hover:bg-green-700 text-white px-2 py-1 rounded-md text-xs font-medium transition duration-150 ease-in-out shadow-sm cursor-pointer"
                        title="استعادة"
                      >
                        <span className="flex items-center gap-x-0.5">
                          <MdRestoreFromTrash /> <span>استعادة</span>
                        </span>
                      </button>
                      <button
                        onClick={() => handleForceDelete(req.id)}
                        className="flex items-center justify-center bg-red-600 hover:bg-red-700 text-white px-2 py-1 rounded-md text-xs font-medium transition duration-150 ease-in-out shadow-sm cursor-pointer"
                        title="حذف نهائي"
                      >
                        <span className="flex items-center gap-x-0.5">
                          <MdDeleteForever /> <span>حذف نهائي</span>
                        </span>
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
