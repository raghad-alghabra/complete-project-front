"use client";
import { useEffect, useState } from "react";
import { addData, deleteData, fetchData, UpData } from "../../utils/apiHelper"; // تأكد أن UpData ترجع البيانات المحدثة أو مؤشر للنجاح
import toast from "react-hot-toast";
import {
  FaPlus,
  FaEdit,
  FaTrash,
  FaTimes,
  FaSave,
  FaListAlt,
  FaExclamationTriangle, // أيقونة للتحذير
} from "react-icons/fa";
import { BiCategory } from "react-icons/bi"; // أيقونة الفئة للتصنيف
import { MdDescription } from "react-icons/md";

export default function CategoryManagementPage() {
  const [categories, setCategories] = useState([]);
  const [form, setForm] = useState({ category_name: "", description: "" });
  const [loading, setLoading] = useState(false);
  const [editingId, setEditingId] = useState(null);

  const loadCategories = async () => {
    try {
      // هذه الدالة يجب أن تجلب أحدث البيانات دائماً
      const res = await fetchData("/categories");
      setCategories(res.data || []);
    } catch (err) {
      console.error("خطأ في تحميل التصنيفات:", err);
      toast.error("فشل في تحميل التصنيفات.");
    }
  };

  useEffect(() => {
    loadCategories();
  }, []);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (editingId) {
        // **التعديل هنا:** التأكد من إرسال البيانات كـ JSON لـ PUT
        // هذا يفترض أن دالة UpData في apiHelper تتعامل مع JSON body
        const url = `/categories/${editingId}`;
        const updatedCategoryData = {
          category_name: form.category_name,
          description: form.description,
        };

        // يجب أن تتحقق من أن دالة UpData في apiHelper ترسل بـ Content-Type: application/json
        // وتنتظر استجابة JSON من السيرفر.
        // وإذا كان السيرفر لا يرجع الكائن المحدث، فإن loadCategories() هي الحل الوحيد.
        await UpData(url, updatedCategoryData); // إرسال كائن JSON مباشرة

        toast.success("تم تعديل التصنيف بنجاح!");
      } else {
        // إضافة جديدة باستخدام FormData (كما كان)
        const formData = new FormData();
        formData.append("category_name", form.category_name);
        formData.append("description", form.description);
        await addData("/categories", formData);
        toast.success("تمت إضافة التصنيف بنجاح!");
      }

      setForm({ category_name: "", description: "" });
      setEditingId(null);
      await loadCategories(); // إعادة تحميل البيانات بعد كل عملية نجاح (إضافة أو تعديل)
    } catch (err) {
      toast.error("فشل العملية. الرجاء التأكد من البيانات والمحاولة مجدداً.");
      console.error("خطأ في handleSubmit:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    toast(
      (t) => (
        <div className="flex flex-col items-center gap-2 p-3">
          <FaExclamationTriangle className="text-red-500 text-3xl mb-2" />
          <p className="text-gray-800 text-lg font-semibold text-center mb-3">
            هل أنت متأكد من حذف هذا التصنيف نهائياً؟
          </p>
          <div className="flex gap-3">
            <button
              className="bg-red-600 hover:bg-red-700 text-white font-bold py-2 px-4 rounded-lg transition duration-200 shadow-md"
              onClick={async () => {
                toast.dismiss(t.id); // إغلاق رسالة التأكيد
                try {
                  await deleteData(`/categories/${id}`);
                  toast.error("تم حذف التصنيف بنجاح!");
                  await loadCategories(); // إعادة تحميل التصنيفات بعد الحذف
                } catch (err) {
                  console.error(err);
                  toast.error("فشل في الحذف. الرجاء المحاولة مرة أخرى.");
                }
              }}
            >
              نعم، احذف
            </button>
            <button
              className="bg-gray-400 hover:bg-gray-500 text-white font-bold py-2 px-4 rounded-lg transition duration-200 shadow-md"
              onClick={() => toast.dismiss(t.id)} // إغلاق رسالة التأكيد فقط
            >
              إلغاء
            </button>
          </div>
        </div>
      ),
      {
        duration: Infinity,
        position: "top-center",
        style: {
          background: "#fff",
          color: "#333",
          borderRadius: "10px",
          padding: "15px",
          maxWidth: "400px",
          width: "90%",
          boxShadow: "0 4px 15px rgba(0,0,0,0.2)",
        },
        ariaProps: {
          role: "status",
          "aria-live": "polite",
        },
      }
    );
  };

  const handleEdit = (category) => {
    setEditingId(category.id);
    setForm({
      category_name: category.category_name,
      description: category.description,
    });
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleCancelEdit = () => {
    setEditingId(null);
    setForm({ category_name: "", description: "" });
    toast.info("تم إلغاء عملية التعديل.");
  };

  return (
    <div
      className="flex flex-col items-center justify-start min-h-[70vh] p-4 bg-gray-50"
      dir="rtl"
    >
      <h2 className="text-3xl font-extrabold text-gray-800 mb-6 text-center">
        إدارة التصنيفات
        {/* إضافة أيقونة الفئة هنا */}
        <BiCategory className="inline-block text-[#3da67e] mr-2" />
      </h2>

      {/* نموذج الإضافة / التعديل */}
      <form
        onSubmit={handleSubmit}
        className="w-full max-w-xl bg-white p-8 rounded-xl shadow-lg border border-gray-200 mb-8"
      >
        <h3 className="text-xl font-semibold text-gray-700 mb-6 text-center">
          {editingId ? "تعديل تصنيف موجود" : "إضافة تصنيف جديد"}
        </h3>

        {/* حقل اسم التصنيف */}
        <div className="mb-5">
          <label
            className="block text-gray-700 text-sm font-bold mb-2 flex items-center gap-2"
            htmlFor="category_name"
          >
            <BiCategory className="text-lg" />
            اسم التصنيف
          </label>
          <input
            type="text"
            name="category_name"
            id="category_name"
            value={form.category_name}
            onChange={handleChange}
            className="shadow appearance-none border rounded-lg w-full py-2.5 px-4 text-gray-700 leading-tight
                       focus:outline-none focus:ring-2 focus:ring-[#3da67e] focus:border-transparent
                       transition-all duration-200 ease-in-out bg-white"
            required
            dir="rtl"
          />
        </div>

        {/* حقل الوصف */}
        <div className="mb-6">
          <label
            className="block text-gray-700 text-sm font-bold mb-2 flex items-center gap-2"
            htmlFor="description"
          >
            <MdDescription className="text-lg" />
            الوصف
          </label>
          <textarea
            name="description"
            id="description"
            value={form.description}
            onChange={handleChange}
            className="shadow appearance-none border rounded-lg w-full py-2.5 px-4 text-gray-700 leading-tight
                       focus:outline-none focus:ring-2 focus:ring-[#3da67e] focus:border-transparent
                       transition-all duration-200 ease-in-out bg-white resize-y"
            rows="4"
            dir="rtl"
          />
        </div>

        {/* أزرار الإجراءات للنموذج */}
        <div className="flex items-center justify-center gap-4 mt-8">
          <button
            type="submit"
            className="flex items-center justify-center gap-2 bg-green-600 hover:bg-green-700 text-white font-bold py-2.5 px-5 rounded-lg focus:outline-none focus:shadow-outline
                       transition ease-in-out duration-200 transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer shadow-md"
            disabled={loading}
          >
            {loading ? (
              "جاري الحفظ..."
            ) : editingId ? (
              <>
                <FaSave /> <span>حفظ التعديلات</span>
              </>
            ) : (
              <>
                <FaPlus /> <span>إضافة تصنيف</span>
              </>
            )}
          </button>
          {editingId && (
            <button
              type="button"
              onClick={handleCancelEdit}
              className="flex items-center justify-center gap-2 bg-gray-500 hover:bg-gray-600 text-white font-bold py-2.5 px-5 rounded-lg focus:outline-none focus:shadow-outline
                          transition ease-in-out duration-200 transform hover:scale-105 cursor-pointer shadow-md"
            >
              <FaTimes />
              إلغاء
            </button>
          )}
        </div>
      </form>

      {/* جدول التصنيفات */}
      <div className="w-full max-w-6xl overflow-x-hidden bg-white shadow-lg rounded-xl border border-gray-200">
        <table className="min-w-full table-auto border-collapse">
          <thead className="bg-[#3da67e] text-white font-bold sticky top-0 z-10 shadow-sm">
            <tr>
              <th className="p-3 text-center w-[5%]">#</th>
              <th className="p-3 text-right w-[30%]">اسم التصنيف</th>
              <th className="p-3 text-right w-[45%]">الوصف</th>
              <th className="p-3 text-center w-[20%]">الإجراءات</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {categories.length === 0 ? (
              <tr>
                <td
                  colSpan="4"
                  className="text-center py-6 text-gray-500 text-lg font-medium"
                >
                  <div className="flex flex-col items-center justify-center gap-2">
                    <FaListAlt className="text-4xl text-gray-400" />
                    <span>لا توجد تصنيفات حاليًا.</span>
                    <span className="text-sm text-gray-400">
                      ابدأ بإضافة تصنيف جديد من الأعلى.
                    </span>
                  </div>
                </td>
              </tr>
            ) : (
              categories.map((cat, i) => (
                <tr
                  key={cat.id}
                  className="border-b border-gray-100 hover:bg-gray-50 transition-colors duration-150 ease-in-out group"
                >
                  <td className="px-3 py-2 whitespace-nowrap text-sm font-medium text-gray-900 text-center">
                    {i + 1}
                  </td>
                  <td className="px-3 py-2 text-sm text-gray-700 text-right whitespace-nowrap overflow-hidden text-ellipsis">
                    {cat.category_name}
                  </td>
                  <td className="px-3 py-2 text-sm text-gray-700 text-right relative z-20">
                    <span className="block overflow-hidden text-ellipsis whitespace-nowrap cursor-pointer">
                      {cat.description
                        ? cat.description.substring(0, 40) +
                          (cat.description.length > 40 ? "..." : "")
                        : "لا يوجد وصف"}
                    </span>
                    {cat.description && cat.description.length > 40 && (
                      <div
                        className={`absolute hidden group-hover:block right-1/2 translate-x-1/2 p-3 bg-gray-800 text-white text-xs rounded-lg border border-gray-600 shadow-2xl z-30 whitespace-normal break-words
                                   max-w-xs sm:max-w-sm md:max-w-md lg:max-w-lg xl:max-w-xl
                                   opacity-0 group-hover:opacity-100 transform scale-95 group-hover:scale-100 transition-all duration-300 ease-in-out delay-100 origin-bottom
                                   ${
                                     i === 0
                                       ? "top-full mt-2"
                                       : "bottom-full mb-2"
                                   }`}
                      >
                        {cat.description}
                      </div>
                    )}
                  </td>
                  <td className="px-3 py-2 whitespace-nowrap text-center text-sm font-medium">
                    <div className="flex items-center justify-center gap-1.5">
                      <button
                        onClick={() => handleEdit(cat)}
                        className="flex items-center justify-center gap-0.5 bg-yellow-500 hover:bg-yellow-600 text-white px-2 py-1 rounded-md text-xs font-medium transition duration-150 ease-in-out shadow-sm cursor-pointer"
                        title="تعديل التصنيف"
                      >
                        <FaEdit className="text-sm" />
                        <span>تعديل</span>
                      </button>
                      <button
                        onClick={() => handleDelete(cat.id)}
                        className="flex items-center justify-center gap-0.5 bg-red-600 hover:bg-red-700 text-white px-2 py-1 rounded-md text-xs font-medium transition duration-150 ease-in-out shadow-sm cursor-pointer"
                        title="حذف التصنيف"
                      >
                        <FaTrash className="text-sm" />
                        <span>حذف</span>
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
