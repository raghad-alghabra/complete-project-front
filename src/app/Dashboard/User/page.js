"use client";

import { Dialog } from "@headlessui/react";
import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { addData, deleteData, fetchData } from "../../utils/apiHelper";
import {
  FaPlus,
  FaUser,
  FaEnvelope,
  FaPhone,
  FaLock,
  FaBriefcase,
  FaBuilding,
  FaTrash,
  FaSpinner,
  FaUsers,
  FaAngleRight,
  FaAngleLeft,
  FaTimes,
} from "react-icons/fa";

export default function UserManagement() {
  const [users, setUsers] = useState([]);
  const [roles, setRoles] = useState([]);
  const [branches, setBranches] = useState([]);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [loading, setLoading] = useState(true); // إضافة حالة التحميل لجلب المستخدمين
  const [submitting, setSubmitting] = useState(false); // لحالة الإرسال في المودال (حذف/إضافة)

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    phone: "",
    role_id: "",
    branch_id: "",
  });

  const [pagination, setPagination] = useState({
    total: 0,
    per_page: 10,
    current_page: 1,
    last_page: 1,
  });

  // دالة لجلب المستخدمين مع دعم الترقيم
  const loadUsers = async (page = 1) => {
    setLoading(true); // ابدأ التحميل
    try {
      const response = await fetchData(`/users?page=${page}`);
      setUsers(response.data);
      setPagination({
        total: response.pagination.total,
        per_page: response.pagination.per_page,
        current_page: response.pagination.current_page,
        last_page: response.pagination.last_page,
      });
    } catch (error) {
      console.error("Error loading users:", error);
      toast.error("حدث خطأ أثناء تحميل المستخدمين.");
    } finally {
      setLoading(false); // أوقف التحميل سواء نجح أو فشل
    }
  };

  // دالة لجلب جميع الأدوار (بدون ترقيم)
  const getAllRoles = async () => {
    try {
      const response = await fetchData("/roles/withoutPaginate");
      setRoles(response.data);
    } catch (error) {
      console.error("Error loading roles:", error);
      toast.error("فشل تحميل الأدوار.");
    }
  };

  // دالة لجلب جميع الفروع (بدون ترقيم)
  const getAllBranches = async () => {
    try {
      const response = await fetchData("/branches/withoutPaginate");
      setBranches(response.data);
    } catch (error) {
      console.error("Error loading branches:", error);
      toast.error("فشل تحميل الفروع.");
    }
  };

  // useEffect لجلب البيانات عند تحميل المكون
  useEffect(() => {
    loadUsers();
    getAllRoles();
    getAllBranches();
  }, []);

  // فتح مودال تأكيد الحذف
  const handleDeleteConfirm = (user) => {
    setSelectedUser(user);
    setIsDeleteOpen(true);
  };

  // تنفيذ عملية الحذف
  const handleDelete = async () => {
    setSubmitting(true); // ابدأ التحميل لزر الحذف
    try {
      const response = await deleteData(`/delete/${selectedUser.id}`);
      setIsDeleteOpen(false);
      toast.success(response.message || "تم حذف المستخدم بنجاح!");
      loadUsers(pagination.current_page); // أعد تحميل المستخدمين بعد الحذف
    } catch (error) {
      console.error("Error deleting user:", error);
      toast.error(
        error.response?.data?.message || "حدث خطأ أثناء حذف المستخدم."
      );
    } finally {
      setSubmitting(false); // أوقف التحميل
    }
  };

  // تنفيذ عملية إضافة مستخدم جديد
  const handleAddUser = async () => {
    setSubmitting(true); // ابدأ التحميل لزر الإضافة
    try {
      const response = await addData("/store", formData);
      toast.success(response.message || "تمت إضافة المستخدم بنجاح!");
      setIsAddOpen(false);
      // إعادة تعيين بيانات الفورم
      setFormData({
        name: "",
        email: "",
        password: "",
        phone: "",
        role_id: "",
        branch_id: "",
      });
      loadUsers(pagination.current_page); // أعد تحميل المستخدمين بعد الإضافة
    } catch (error) {
      console.error("Error adding user:", error);
      toast.error(
        error.response?.data?.message ||
          "فشل في إضافة المستخدم. يرجى التحقق من البيانات."
      );
    } finally {
      setSubmitting(false); // أوقف التحميل
    }
  };

  return (
    <div
      className="flex flex-col items-center justify-start min-h-[70vh] p-4 bg-gray-50"
      dir="rtl"
    >
      <h2 className="text-3xl font-extrabold text-gray-800 mb-8 text-center">
        إدارة المستخدمين
        <FaUsers className="inline-block text-[#3da67e] mr-2" />{" "}
        {/* أيقونة بجانب العنوان */}
      </h2>

      {/* زر إضافة مستخدم */}
      <button
        onClick={() => {
          setIsAddOpen(true);
          setFormData({
            // تأكد من إعادة ضبط الفورم عند الفتح
            name: "",
            email: "",
            password: "",
            phone: "",
            role_id: "",
            branch_id: "",
          });
        }}
        className="self-end mb-6 bg-[#3da67e] hover:bg-[#2e8a6d] text-white font-bold py-2.5 px-6 rounded-lg transition duration-200 ease-in-out transform hover:scale-105 shadow-md flex items-center gap-2"
      >
        <FaPlus className="text-lg" />
        <span>إضافة مستخدم جديد</span>
      </button>

      {/* منطقة الجدول */}
      <div className="w-full max-w-6xl overflow-x-auto bg-white shadow-lg rounded-xl border border-gray-200">
        {loading ? ( // عرض رسالة التحميل إذا كانت البيانات قيد الجلب
          <div className="flex justify-center items-center h-64">
            <p className="text-gray-600 text-lg font-medium animate-pulse">
              جاري تحميل المستخدمين...
            </p>
          </div>
        ) : users.length === 0 ? ( // عرض رسالة لا يوجد بيانات إذا كانت القائمة فارغة
          <div className="flex flex-col justify-center items-center h-64">
            <p className="text-gray-600 text-lg font-medium mb-2">
              لا يوجد مستخدمون لعرضهم.
            </p>
            <p className="text-gray-500 text-sm">ابدأ بإضافة مستخدم جديد.</p>
          </div>
        ) : (
          <table className="min-w-full table-auto border-collapse">
            <thead className="bg-[#3da67e] text-white font-bold sticky top-0 z-10 shadow-sm">
              <tr>
                <th className="p-3 text-center w-[5%]">#</th>
                <th className="p-3 text-right">الاسم</th>
                <th className="p-3 text-right w-[200px]">البريد الإلكتروني</th>
                <th className="p-3 text-right">الفرع</th>
                <th className="p-3 text-right">الدور</th>
                <th className="p-3 text-center w-[120px]">تاريخ الإنشاء</th>
                <th className="p-3 text-center w-[120px]">إجراءات</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {users.map((user, index) => (
                <tr
                  key={user.id}
                  className="border-b border-gray-100 hover:bg-gray-50 transition-colors duration-150 ease-in-out group"
                >
                  <td className="px-3 py-2 whitespace-nowrap text-sm font-medium text-gray-900 text-center">
                    {(pagination.current_page - 1) * pagination.per_page +
                      index +
                      1}
                  </td>
                  <td className="px-3 py-2 text-sm text-gray-700 text-right">
                    {user.name}
                  </td>
                  <td className="px-3 py-2 text-sm text-gray-700 text-right">
                    {user.email}
                  </td>
                  <td className="px-3 py-2 text-sm text-gray-700 text-right">
                    {user.branch?.branch_name || "—"}
                  </td>
                  <td className="px-3 py-2 text-sm text-gray-700 text-right">
                    {user.role?.role_name || "—"}
                  </td>
                  <td className="px-3 py-2 whitespace-nowrap text-sm text-gray-700 text-center">
                    {new Date(user.created_at).toLocaleDateString("ar-EG")}
                  </td>
                  <td className="px-3 py-2 whitespace-nowrap text-center text-sm font-medium">
                    <div className="flex items-center justify-center gap-1">
                      {/* زر الحذف */}
                      <button
                        onClick={() => handleDeleteConfirm(user)}
                        className="flex items-center justify-center bg-red-600 hover:bg-red-700 text-white px-3 py-1.5 rounded-md text-xs font-medium transition duration-150 ease-in-out shadow-sm cursor-pointer"
                        title="حذف المستخدم"
                      >
                        <FaTrash /> {/* أيقونة حذف */}
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Pagination - يظهر فقط إذا كان هناك أكثر من صفحة واحدة */}
      {pagination.last_page > 1 && (
        <div className="mt-8 flex justify-center items-center gap-3">
          <button
            onClick={() => loadUsers(pagination.current_page - 1)}
            disabled={pagination.current_page === 1 || loading}
            className="px-4 py-2 rounded-lg border border-gray-300 bg-white text-gray-700 hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed transition duration-150 ease-in-out shadow-sm flex items-center gap-1"
          >
            <FaAngleRight className="text-sm" /> {/* أيقونة لزر السابق */}
            <span>السابق</span>
          </button>

          {[...Array(pagination.last_page)].map((_, i) => (
            <button
              key={i}
              onClick={() => loadUsers(i + 1)}
              disabled={loading}
              className={`px-4 py-2 rounded-lg border font-medium transition duration-150 ease-in-out shadow-sm disabled:opacity-50 disabled:cursor-not-allowed
                ${
                  pagination.current_page === i + 1
                    ? "bg-[#3da67e] text-white border-[#3da67e]"
                    : "bg-white text-gray-700 border-gray-300 hover:bg-gray-100"
                }`}
            >
              {i + 1}
            </button>
          ))}

          <button
            onClick={() => loadUsers(pagination.current_page + 1)}
            disabled={
              pagination.current_page === pagination.last_page || loading
            }
            className="px-4 py-2 rounded-lg border border-gray-300 bg-white text-gray-700 hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed transition duration-150 ease-in-out shadow-sm flex items-center gap-1"
          >
            <span>التالي</span>
            <FaAngleLeft className="text-sm" /> {/* أيقونة لزر التالي */}
          </button>
        </div>
      )}

      {/* Delete Confirmation Modal (Headless UI) */}
      <Dialog
        open={isDeleteOpen}
        onClose={() => setIsDeleteOpen(false)}
        className="relative z-50"
      >
        <div
          className="fixed inset-0 bg-black/50 backdrop-blur-sm"
          aria-hidden="true"
        />{" "}
        {/* خلفية شبه شفافة مع ضبابية */}
        <div className="fixed inset-0 flex items-center justify-center p-4">
          <Dialog.Panel
            className="bg-white p-8 rounded-xl shadow-2xl w-full max-w-sm transform transition-all duration-300 ease-out sm:w-96 text-center"
            dir="rtl"
          >
            <Dialog.Title className="text-2xl font-extrabold text-red-600 mb-4 flex items-center justify-center gap-2">
              <FaTrash className="text-3xl" />
              <span>تأكيد الحذف</span>
            </Dialog.Title>
            <p className="text-gray-700 text-lg mb-6">
              هل أنت متأكد من حذف المستخدم
              <span className="font-bold text-red-600">
                {" "}
                {selectedUser?.name}{" "}
              </span>
              بشكل نهائي؟
            </p>
            <div className="mt-6 flex justify-center gap-4">
              <button
                onClick={() => setIsDeleteOpen(false)}
                className="bg-gray-500 hover:bg-gray-600 text-white font-bold py-2.5 px-6 rounded-lg transition duration-200 ease-in-out shadow-md disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                disabled={submitting}
              >
                <FaTimes />
                <span>إلغاء</span>
              </button>
              <button
                onClick={handleDelete}
                className="bg-red-600 hover:bg-red-700 text-white font-bold py-2.5 px-6 rounded-lg transition duration-200 ease-in-out shadow-md disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                disabled={submitting}
              >
                {submitting ? (
                  <FaSpinner className="animate-spin" />
                ) : (
                  <FaTrash />
                )}
                <span>{submitting ? "جاري الحذف..." : "حذف"}</span>
              </button>
            </div>
          </Dialog.Panel>
        </div>
      </Dialog>

      {/* Add User Modal (Headless UI) */}
      <Dialog
        open={isAddOpen}
        onClose={() => setIsAddOpen(false)}
        className="relative z-50"
      >
        <div
          className="fixed inset-0 bg-black/50 backdrop-blur-sm"
          aria-hidden="true"
        />

        <div className="fixed inset-0 flex items-center justify-center p-4">
          <Dialog.Panel
            className="bg-white p-8 rounded-xl shadow-2xl w-full max-w-lg transform transition-all duration-300 ease-out"
            dir="rtl"
          >
            <Dialog.Title className="text-2xl font-extrabold text-[#3da67e] mb-6 text-center flex items-center justify-center gap-2">
              <FaUser className="text-3xl" />
              <span>إضافة مستخدم جديد</span>
            </Dialog.Title>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4">
              {/* حقل الاسم */}
              <div className="relative">
                <label htmlFor="name" className="sr-only">
                  الاسم
                </label>
                <FaUser className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400" />
                <input
                  id="name"
                  type="text"
                  placeholder="الاسم"
                  value={formData.name}
                  onChange={(e) =>
                    setFormData({ ...formData, name: e.target.value })
                  }
                  className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#3da67e] focus:border-transparent text-gray-700"
                  required
                  autocomplete="off" // تم إضافة هذه الخاصية
                />
              </div>

              {/* حقل البريد الإلكتروني */}
              <div className="relative">
                <label htmlFor="email" className="sr-only">
                  البريد الإلكتروني
                </label>
                <FaEnvelope className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400" />
                <input
                  id="email"
                  type="email"
                  placeholder="البريد الإلكتروني"
                  value={formData.email}
                  onChange={(e) =>
                    setFormData({ ...formData, email: e.target.value })
                  }
                  className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#3da67e] focus:border-transparent text-gray-700"
                  required
                  autocomplete="off" // تم إضافة هذه الخاصية
                />
              </div>

              {/* حقل كلمة المرور */}
              <div className="relative">
                <label htmlFor="password" className="sr-only">
                  كلمة المرور
                </label>
                <FaLock className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400" />
                <input
                  id="password"
                  type="password"
                  placeholder="كلمة المرور"
                  value={formData.password}
                  onChange={(e) =>
                    setFormData({ ...formData, password: e.target.value })
                  }
                  className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#3da67e] focus:border-transparent text-gray-700"
                  required
                  autocomplete="new-password" // تم إضافة هذه الخاصية
                />
              </div>

              {/* حقل رقم الهاتف */}
              <div className="relative">
                <label htmlFor="phone" className="sr-only">
                  رقم الهاتف
                </label>
                <FaPhone className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400" />
                <input
                  id="phone"
                  type="tel"
                  placeholder="رقم الهاتف"
                  value={formData.phone}
                  onChange={(e) =>
                    setFormData({ ...formData, phone: e.target.value })
                  }
                  className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#3da67e] focus:border-transparent text-gray-700"
                  autocomplete="off" // تم إضافة هذه الخاصية
                />
              </div>

              {/* اختيار الدور */}
              <div className="relative">
                <label htmlFor="role_id" className="sr-only">
                  الدور
                </label>
                <FaBriefcase className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400" />
                <select
                  id="role_id"
                  value={formData.role_id}
                  onChange={(e) =>
                    setFormData({ ...formData, role_id: e.target.value })
                  }
                  className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#3da67e] focus:border-transparent text-gray-700 appearance-none"
                  required
                  autocomplete="off" // تم إضافة هذه الخاصية
                >
                  <option value="">اختر الدور</option>
                  {roles.map((r) => (
                    <option key={r.id} value={r.id}>
                      {r.role_name}
                    </option>
                  ))}
                </select>
                {/* سهم مخصص للاختيار */}
                <div className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
                  <svg
                    className="fill-current h-4 w-4"
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 20 20"
                  >
                    <path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 6.757 7.586 5.343 9z" />
                  </svg>
                </div>
              </div>

              {/* اختيار الفرع */}
              <div className="relative">
                <label htmlFor="branch_id" className="sr-only">
                  الفرع
                </label>
                <FaBuilding className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400" />
                <select
                  id="branch_id"
                  value={formData.branch_id}
                  onChange={(e) =>
                    setFormData({ ...formData, branch_id: e.target.value })
                  }
                  className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#3da67e] focus:border-transparent text-gray-700 appearance-none"
                  required
                  autocomplete="off" // تم إضافة هذه الخاصية
                >
                  <option value="">اختر الفرع</option>
                  {branches.map((b) => (
                    <option key={b.id} value={b.id}>
                      {b.branch_name}
                    </option>
                  ))}
                </select>
                {/* سهم مخصص للاختيار */}
                <div className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
                  <svg
                    className="fill-current h-4 w-4"
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 20 20"
                  >
                    <path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 6.757 7.586 5.343 9z" />
                  </svg>
                </div>
              </div>
            </div>

            {/* أزرار الإجراءات في المودال */}
            <div className="flex justify-end gap-4 mt-8">
              <button
                onClick={() => {
                  setIsAddOpen(false);
                  setFormData({
                    // إعادة ضبط الفورم عند الإلغاء
                    name: "",
                    email: "",
                    password: "",
                    phone: "",
                    role_id: "",
                    branch_id: "",
                  });
                }}
                className="bg-gray-500 hover:bg-gray-600 text-white font-bold py-2.5 px-6 rounded-lg transition duration-200 ease-in-out shadow-md flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                disabled={submitting}
              >
                <FaTimes />
                <span>إلغاء</span>
              </button>
              <button
                onClick={handleAddUser}
                className="bg-[#3da67e] hover:bg-[#2e8a6d] text-white font-bold py-2.5 px-6 rounded-lg transition duration-200 ease-in-out shadow-md flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                disabled={submitting}
              >
                {submitting ? (
                  <FaSpinner className="animate-spin" />
                ) : (
                  <FaPlus />
                )}
                <span>{submitting ? "جاري الإضافة..." : "إضافة مستخدم"}</span>
              </button>
            </div>
          </Dialog.Panel>
        </div>
      </Dialog>
    </div>
  );
}
