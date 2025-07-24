"use client";

import { Dialog } from "@headlessui/react";
import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import {
  checkUserRole,
  deleteData,
  fetchData,
  fetchDataAuth,
  PutData,
  UpData,
} from "../../utils/apiHelper";
import logofull from "../../../images/logofull.jpg";
import ReplyModal from "../../component/ReplyModal";
import Image from "next/image";
import dynamic from "next/dynamic";

const DownloadPDF = dynamic(() => import("../../component/DownloadPDF"), {
  ssr: false, // تعطيل السيرفر سايد ريندر لهذا المكون
});

export default function Complaints() {
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [isViewOpen, setIsViewOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState(null);
  const [filterGovernorate, setFilterGovernorate] = useState();
  const [provinces, setprovinces] = useState([]);
  const [user, setUser] = useState([]);
  const [status, setStatus] = useState([]);
  const [categories, setCategories] = useState([]);
  const [data, setData] = useState([]);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editData, setEditData] = useState(null);
  const [isReplyModalOpen, setIsReplyModalOpen] = useState(false);
  const [pagination, setPagination] = useState({
    current_page: 1,
    last_page: 1,
    per_page: 10,
  });

  const loadRequests = async (page = 1) => {
    try {
      let endpoint = "";
      if (checkUserRole("المدير العام")) {
        endpoint = `/requests?request_type=3&page=${page}`;
      } else if (
        checkUserRole("مدير الفرع") ||
        checkUserRole("مدير العلاقات العامة") ||
        checkUserRole("الإدارة المركزية")
      ) {
        const branch = localStorage.getItem("branch");
        endpoint = `/requests?request_type=3&branch=${branch}&concerned_entities=غير ذلك&page=${page}`;
      } else if (
        checkUserRole("الوكيل الاقتصادي") ||
        checkUserRole("الوكيل الإداري") ||
        checkUserRole("وكيل تحقيق") ||
        checkUserRole("وكيل تأشير")
      ) {
        const id = localStorage.getItem("id");
        endpoint = `/requests?request_type=3&user=${id}&page=${page}`;
      } else {
        endpoint = `/requests?request_type=0&page=${page}`;
      }
      const response = await fetchDataAuth(endpoint);
      const requests = response.data;
      console.log(response);
      console.log(endpoint);

      if (
        checkUserRole("الوكيل الاقتصادي") ||
        checkUserRole("الوكيل الإداري") ||
        checkUserRole("وكيل تحقيق") ||
        checkUserRole("وكيل تأشير")
      ) {
        const newItems = requests.filter((item) => item.is_received === 0);
        if (newItems.length > 0) {
          const confirmReceive = window.confirm(
            "يوجد طلبات جديدة لم يتم استلامها. هل تريد استلامها الآن؟"
          );
          if (confirmReceive) {
            await Promise.all(
              newItems.map((item) => {
                updateRequest(item.id, { is_received: 1 });
              })
            );
            return loadRequests(page);
          }
        }
      }
      console.log(requests);

      setData(requests);
      setPagination({
        current_page: response.current_page,
        last_page: response.last_page,
        per_page: response.per_page,
      });

      const response2 = await fetchData("branches/withoutPaginate");
      setprovinces(response2.data);
    } catch (error) {
      console.error("خطأ أثناء جلب الطلبات:", error);
    }
  };

  const getUser = async () => {
    try {
      const response = await fetchData("agents");
      console.log(response.data);
      setUser(response.data);
    } catch (error) {
      console.error("خطأ أثناء جلب الطلبات:", error);
    }
  };
  const getCategories = async () => {
    try {
      const response = await fetchData("categories/withoutPaginate");
      setCategories(response.data);
    } catch (error) {
      console.error("خطأ أثناء جلب الطلبات:", error);
    }
  };
  const getStatus = async () => {
    try {
      const response = await fetchData("requestStatus/withoutPaginate");
      setStatus(response.data);
    } catch (error) {
      console.error("خطأ أثناء جلب الطلبات:", error);
    }
  };

  useEffect(() => {
    loadRequests();
    getUser();
    getStatus();
    getCategories();
  }, []);

  const formatDate = (dateString) => {
    const options = {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,
    };
    return new Date(dateString).toLocaleDateString("ar-EG", options);
  };

  const handleDeleteConfirm = (item) => {
    setSelectedItem(item);
    setIsDeleteOpen(true);
  };

  const handleDelete = async () => {
    try {
      const response = await deleteData(`/requests/${selectedItem.id}`);
      console.log(response);
      loadRequests();
      toast.error(response.message);
    } catch (error) {
      console.error("خطأ أثناء حذف الطلبات:", error);
    }
    setIsDeleteOpen(false);
  };

  const filteredData = filterGovernorate
    ? data.filter((item) => item.branch_id == filterGovernorate)
    : data;

  const renderPagination = () => {
    const pages = [];
    for (let i = 1; i <= pagination.last_page; i++) {
      pages.push(
        <button
          key={i}
          onClick={() => loadRequests(i)}
          className={`px-3 py-1 mx-1 rounded ${
            pagination.current_page === i
              ? "bg-green-600 text-white"
              : "bg-gray-200"
          }`}
        >
          {i}
        </button>
      );
    }
    return pages;
  };

  const updateRequest = async (requestId, data) => {
    try {
      if (data.request_status_id == 4) {
        const response = await PutData(
          `workflow/requests/${requestId}/send-to-admin`
        );
        toast.success(response.message);
      } else if (data.request_status_id == 6) {
        const response = await PutData(
          `workflow/requests/${requestId}/return-to-agent`
        );
        toast.success(response.message);
      } else if (data.request_status_id == 2) {
        const response = await PutData(
          `workflow/requests/${requestId}/approve`
        );
        toast.success(response.message);
      }
      const query = new URLSearchParams(data).toString();
      console.log(query);
      const response = await UpData(
        `/requests/${requestId}/update-request-only?${query}`
      );
      console.log(response);
      if (response.data) {
        loadRequests();
        toast.success("تم التحديث بنجاح");
      } else {
        toast.error("فشلت العملية");
        toast.error(response.message);
      }
    } catch (error) {
      console.error("خطأ في الاتصال:", error);
      toast.error(error.response.data.message);
    }
  };

  const handleCategoryChange = (requestId, newCategory) => {
    updateRequest(requestId, { category_id: newCategory });
  };

  const handleStatusChange = (requestId, newStatus) => {
    updateRequest(requestId, { request_status_id: newStatus });
  };

  const handleUserChange = (requestId, userId) => {
    updateRequest(requestId, { user_id: userId });
  };

  return (
    <div className="flex flex-col items-center justify-start min-h-[70vh] p-4">
      <h2 className="text-xl font-bold mb-4">عرض الشكاوى</h2>
      {checkUserRole("مدير الفرع") || checkUserRole("مدير العلاقات العامة") ? (
        ""
      ) : (
        <div className="mb-4 w-full max-w-3xl">
          <select
            className="w-full p-2 border rounded"
            onChange={(e) => setFilterGovernorate(e.target.value)}
            value={filterGovernorate}
          >
            <option value="">عرض جميع الشكاوى</option>
            {provinces.map((gov, i) => (
              <option key={i} value={gov.id}>
                {gov.branch_name}
              </option>
            ))}
          </select>
        </div>
      )}
      <div className="flex justify-center items-center w-full overflow-x-auto">
        <div className="overflow-y-auto w-full">
          <div className="min-w-[1000px]">
            <table className="bg-white shadow-md rounded-lg w-full table-fixed">
              <thead className="bg-[#3da67e] text-white font-bold sticky top-0 z-10">
                <tr>
                  <th className="px-4 py-2 w-[50px]">#</th>
                  <th className="px-4 py-2 w-[300px]">الوصف</th>
                  <th className="px-4 py-2 w-[150px]">التصنيف</th>
                  <th className="px-4 py-2 w-[150px]">المحافظة</th>
                  <th className="px-4 py-2 w-[80px]">النوع</th>
                  <th className="px-4 py-2 w-[300px]">الرد</th>
                  <th className="px-4 py-2 w-[200px]">التاريخ</th>
                  <th className="px-4 py-2 w-[150px]">الحالة</th>
                  <th className="px-4 py-2 w-[150px]">الوكيل</th>
                  {checkUserRole("مدير الفرع") ||
                  checkUserRole("مدير العلاقات العامة") ? (
                    ""
                  ) : (
                    <>
                      <th className="px-4 py-2 w-[150px]">الجهة</th>
                      <th className="px-4 py-2 w-[150px]">تم الاستلام</th>
                    </>
                  )}
                  <th className="px-4 py-2 w-[300px]">الإجراءات</th>
                </tr>
              </thead>
              <tbody>
                {filteredData.map((item, index) => (
                  <tr
                    key={index}
                    className="border-b hover:bg-gray-100 transition-all"
                  >
                    <td className="px-4 py-2  text-center">
                      {(pagination.current_page - 1) * pagination.per_page +
                        index +
                        1}
                    </td>
                    <td className="px-4 py-2  text-center">
                      {item.description.slice(0, 30)}...
                    </td>
                    <td className="px-4 py-2 text-center">
                      {item.category.category_name}
                    </td>
                    <td className="px-4 py-2  text-center">
                      {item.branch.branch_name}
                    </td>
                    <td className="px-4 py-2  text-center">
                      {item.request_type.type_name}
                    </td>
                    <td
                      className="px-4 py-2 ] text-center"
                      title={item.trackings[0]?.comment || ""}
                    >
                      {item.trackings[0]?.comment
                        ? item.trackings[0].comment.length > 30
                          ? item.trackings[0].comment.slice(0, 30) + "..."
                          : item.trackings[0].comment
                        : "-"}
                    </td>
                    <td className="px-4 py-2  text-center">
                      {formatDate(item.created_at)}
                    </td>
                    <td className="px-4 py-2  text-center">
                      {item.request_status.status_name}
                    </td>
                    <td className="px-4 py-2  text-center">{item.user.name}</td>
                    {checkUserRole("مدير الفرع") ||
                    checkUserRole("مدير العلاقات العامة") ? (
                      ""
                    ) : (
                      <>
                        <td className="px-4 py-2  text-center">
                          {item.concerned_entities}
                        </td>
                        <td className="px-4 py-2  text-center">
                          {item.is_received == 0 ? (
                            <p className="text-[#e1767a]">غير مستلم</p>
                          ) : (
                            <p className="text-[#55dea9]">تم الاستلام</p>
                          )}
                        </td>
                      </>
                    )}
                    <td className="px-4 py-2  text-center  gap-2">
                      <button
                        className="bg-gradient-to-t from-[#296f55] to-[#55dea9] text-white px-2 py-1 rounded"
                        onClick={() => {
                          setSelectedItem(item);
                          setIsViewOpen(true);
                        }}
                      >
                        تفاصيل
                      </button>
                      <button
                        className="bg-gradient-to-t from-[#5e3d92] to-[#a58bde] text-white px-2 py-1 rounded"
                        onClick={() => {
                          setSelectedItem(item);
                          setIsReplyModalOpen(true);
                        }}
                      >
                        إضافة رد
                      </button>
                      <button
                        className="bg-gradient-to-t from-yellow-600 to-yellow-400 text-white px-2 py-1 rounded mt-1"
                        onClick={() => {
                          setEditData(item);
                          setIsEditModalOpen(true);
                        }}
                      >
                        تعديل
                      </button>

                      {checkUserRole("المدير العام") ||
                      checkUserRole("الإدارة المركزية") ? (
                        <button
                          className="bg-gradient-to-t from-[#6e292b] to-[#e1767a] text-white px-2 py-1 rounded"
                          onClick={() => handleDeleteConfirm(item)}
                        >
                          حذف
                        </button>
                      ) : (
                        ""
                      )}
                    </td>
                  </tr>
                ))}
                {filteredData.length === 0 && (
                  <tr>
                    <td colSpan={11} className="text-center py-6 text-gray-500">
                      لا توجد شكاوى
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      <div className="mt-4 flex flex-wrap justify-center">
        {renderPagination()}
      </div>

      <Dialog
        open={isViewOpen}
        onClose={() => setIsViewOpen(false)}
        className="relative z-50"
      >
        <div className="fixed inset-0 bg-black/50" aria-hidden="true" />
        <div className="fixed inset-0 flex items-center justify-center p-4">
          <Dialog.Panel className="bg-white p-6 rounded-lg shadow-lg w-full max-w-md">
            <Dialog.Title className="text-lg font-bold mb-2">
              تفاصيل الشكوى
            </Dialog.Title>

            {selectedItem && (
              <div id="pdf-content" className="text-right space-y-2">
                <div className="flex justify-between items-center border-b pb-2 mb-4">
                  <div className="text-right text-sm leading-snug">
                    <p>الجمهورية العربية السورية</p>
                    <p>الجهاز المركزي للرقابة المالية</p>
                  </div>
                  <div className="flex-shrink-0">
                    <Image
                      className="scale-125 mx-4"
                      src={logofull}
                      alt="logo"
                      width={80}
                      height={80}
                    />
                  </div>
                  <div className="text-left text-sm leading-snug">
                    <p>Syrian Arab Republic</p>
                    <p>Central Organization For Financial Control</p>
                  </div>
                </div>
                <p>
                  <strong>الوصف:</strong> {selectedItem.description}
                </p>
                <p>
                  <strong>المحافظة:</strong> {selectedItem.branch.branch_name}
                </p>
                <p>
                  <strong>التصنيف:</strong>{" "}
                  {selectedItem.category.category_name}
                </p>
                <p>
                  <strong>النوع:</strong> {selectedItem.request_type.type_name}
                </p>
                <p>
                  <strong>التاريخ:</strong>{" "}
                  {formatDate(selectedItem.created_at)}
                </p>
                <p>
                  <strong>الحالة:</strong>{" "}
                  {selectedItem.request_status.status_name}
                </p>
              </div>
            )}

            <div className="mt-4 flex justify-between">
              {selectedItem && <DownloadPDF selectedItem={selectedItem} />}
              <button
                onClick={() => setIsViewOpen(false)}
                className="bg-gray-500 text-white px-4 py-2 rounded"
              >
                إغلاق
              </button>
            </div>
          </Dialog.Panel>
        </div>
      </Dialog>

      <Dialog
        open={isDeleteOpen}
        onClose={() => setIsDeleteOpen(false)}
        className="relative z-50"
      >
        <div className="fixed inset-0 bg-black/30" aria-hidden="true" />
        <div className="fixed inset-0 flex items-center justify-center">
          <Dialog.Panel className="bg-white p-6 rounded-lg shadow-lg w-96">
            <Dialog.Title className="text-lg font-bold">
              تأكيد الحذف
            </Dialog.Title>
            <p className="mt-4">هل أنت متأكد من حذف هذه الشكوى؟</p>
            <div className="mt-6 flex justify-end gap-2">
              <button
                onClick={() => setIsDeleteOpen(false)}
                className="bg-gray-500 text-white px-4 py-2 rounded"
              >
                إلغاء
              </button>
              <button
                onClick={handleDelete}
                className=" bg-gradient-to-t from-[#6e292b] to-[#e1767a]  text-white px-4 py-2 rounded"
              >
                حذف
              </button>
            </div>
          </Dialog.Panel>
        </div>
      </Dialog>
      {isEditModalOpen && editData && (
        <div className="fixed inset-0 bg-black/50 bg-opacity-50 z-[100] flex items-center justify-center">
          <div className="bg-white p-6 rounded-lg w-[800px] shadow-lg relative">
            <h2 className="text-2xl font-bold mb-6 text-center text-gray-800">
              تعديل بيانات الشكوى #{editData.id}
            </h2>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block mb-1 font-semibold text-gray-700">
                  الوصف
                </label>
                <p>{editData.description}</p>
              </div>
              <div>
                <label className="block mb-1 font-semibold text-gray-700">
                  المحافظة
                </label>
                <p>{editData.branch.branch_name}</p>
              </div>
              <div>
                <label className="block mb-1 font-semibold text-gray-700">
                  النوع
                </label>
                <p>{editData.request_type.type_name}</p>
              </div>
              <div>
                <label className="block mb-1 font-semibold text-gray-700">
                  الرد
                </label>
                <p>
                  {editData.trackings[0]?.comment
                    ? editData.trackings[0].comment.length > 30
                      ? editData.trackings[0].comment.slice(0, 30) + "..."
                      : editData.trackings[0].comment
                    : "-"}
                </p>
              </div>
              <div>
                <label className="block mb-1 font-semibold text-gray-700">
                  التاريخ
                </label>
                <p>{formatDate(editData.created_at)}</p>
              </div>
              <div>
                <label className="block mb-1 font-semibold text-gray-700">
                  الجهة
                </label>
                <p>{editData.concerned_entities}</p>
              </div>
              <div>
                <label className="block mb-1 font-semibold text-gray-700">
                  تم الاستلام
                </label>
                <p>
                  {editData.is_received == 0 ? (
                    <p className="text-[#e1767a]">غير مستلم</p>
                  ) : (
                    <p className="text-[#55dea9]">تم الاستلام</p>
                  )}
                </p>
              </div>
              <div>
                <label className="block mb-1 font-semibold text-gray-700">
                  التصنيف
                </label>
                <select
                  value={editData.category_id}
                  onChange={(e) =>
                    setEditData({ ...editData, category_id: e.target.value })
                  }
                  className="w-full p-2 border rounded"
                >
                  {categories.map((cat) => (
                    <option key={cat.id} value={cat.id}>
                      {cat.category_name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block mb-1 font-semibold text-gray-700">
                  الحالة
                </label>
                <select
                  value={editData.request_status_id}
                  onChange={(e) =>
                    setEditData({
                      ...editData,
                      request_status_id: e.target.value,
                    })
                  }
                  className="w-full p-2 border rounded"
                >
                  {status.map((st) => (
                    <option key={st.id} value={st.id}>
                      {st.status_name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block mb-1 font-semibold text-gray-700">
                  الوكيل
                </label>
                <select
                  value={editData.user.id}
                  onChange={(e) =>
                    setEditData({
                      ...editData,
                      user: { ...editData.user, id: e.target.value },
                    })
                  }
                  className="w-full p-2 border rounded"
                >
                  {user.map((u) => (
                    <option key={u.id} value={u.id}>
                      {u.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block mb-1 font-semibold text-gray-700">
                  الوصف
                </label>
                <textarea
                  value={editData.description}
                  readOnly
                  rows={3}
                  className="w-full p-2 border rounded bg-gray-100 text-gray-600"
                />
              </div>
            </div>

            <div className="flex justify-between mt-6">
              <button
                className="bg-gray-500 text-white px-6 py-2 rounded hover:bg-gray-600 transition"
                onClick={() => setIsEditModalOpen(false)}
              >
                إلغاء
              </button>
              <button
                className="bg-green-600 text-white px-6 py-2 rounded hover:bg-green-700 transition"
                onClick={() => {
                  updateRequest(editData.id, {
                    category_id: editData.category_id,
                    request_status_id: editData.request_status_id,
                    user_id: editData.user.id,
                  });
                  setIsEditModalOpen(false);
                }}
              >
                حفظ التغييرات
              </button>
            </div>
          </div>
        </div>
      )}

      <ReplyModal
        isOpen={isReplyModalOpen}
        onClose={() => setIsReplyModalOpen(false)}
        requestId={selectedItem?.id}
      />
    </div>
  );
}
