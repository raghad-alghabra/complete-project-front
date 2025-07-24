"use client";

import { useEffect, useState, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import toast from "react-hot-toast";
import { Dialog } from "@headlessui/react";
import dynamic from "next/dynamic";
import {
  fetchDataAuth,
  checkUserRole,
  addData,
} from "../../../utils/apiHelper"; // ضبط المسار حسب الحاجة
import { FaInfoCircle, FaReply, FaEdit, FaTrashAlt } from "react-icons/fa";

// استيراد المكونات القابلة لإعادة الاستخدام
import { ReplyModal } from "../../page"; // ضبط المسار إذا كان page.js في دليل مختلف
import { EditRequestModal } from "../../page"; // ضبط المسار إذا كان page.js في دليل مختلف

const DownloadPDF = dynamic(() => import("../../../component/DownloadPDF"), {
  ssr: false,
});

const REQUEST_TYPES = {
  REPORT: { id: 1, name: "البلاغات", singleName: "بلاغ" },
  GRIEVANCE: { id: 2, name: "التظلمات", singleName: "تظلم" },
  COMPLAINT: { id: 3, name: "الشكاوى", singleName: "شكوى" },
  PRAISE: { id: 4, name: "الثناءات", singleName: "ثناء" },
  SUGGESTION: { id: 5, name: "الاقتراحات", singleName: "اقتراح" },
  INQUIRY: { id: 6, name: "الاستفسارات", singleName: "استفسار" },
};

const getRequestConfig = (typeId, userRoles) => {
  const isGeneralManager = checkUserRole("المدير العام", userRoles);
  const isCentralDepartment = checkUserRole("الدائرة المركزية", userRoles);
  const isBranchManager = checkUserRole("مدير الفرع", userRoles);
  const isPublicRelationsManager = checkUserRole(
    "مدير العلاقات العامة",
    userRoles
  );
  const isEconomicAgent = checkUserRole("الوكيل الاقتصادي", userRoles);
  const isAdminAgent = checkUserRole("الوكيل الإداري", userRoles);
  const isInvestigationAgent = checkUserRole("وكيل تحقيق", userRoles);
  const isEndorsementAgent = checkUserRole("وكيل تأشير", userRoles);
  const isAnyAgent =
    isEconomicAgent ||
    isAdminAgent ||
    isInvestigationAgent ||
    isEndorsementAgent;

  const baseConfig = {
    viewModalTitle: `تفاصيل ${
      REQUEST_TYPES[
        Object.keys(REQUEST_TYPES).find(
          (key) => REQUEST_TYPES[key].id === typeId
        )
      ]?.singleName || "الطلب"
    }`,
    deleteConfirmMessage: `هل أنت متأكد من حذف هذا ${
      REQUEST_TYPES[
        Object.keys(REQUEST_TYPES).find(
          (key) => REQUEST_TYPES[key].id === typeId
        )
      ]?.singleName || "الطلب"
    }؟`,
    toastDeleteMessage: `تم نقل ${
      REQUEST_TYPES[
        Object.keys(REQUEST_TYPES).find(
          (key) => REQUEST_TYPES[key].id === typeId
        )
      ]?.singleName || "الطلب"
    } إلى سلة المحذوفات.`, // رسالة الحذف المحدثة
    showDownloadPdf: true,
    canAddResponse: isPublicRelationsManager || isGeneralManager || isAnyAgent,
    canEdit: isBranchManager || isGeneralManager || isAnyAgent,
    canDelete: isGeneralManager || isCentralDepartment,
  };

  return baseConfig;
};

export default function RequestDetailsPage() {
  const { id } = useParams(); // الحصول على المعرف من URL
  const router = useRouter();
  const [requestData, setRequestData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [isAddResponseOpen, setIsAddResponseOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);

  const [userRoles, setUserRoles] = useState([]);
  const [categories, setCategories] = useState([]);
  const [requestStatuses, setRequestStatuses] = useState([]);
  const [agents, setAgents] = useState([]);

  // حالة تحميل الردود في ReplyModal
  const [isLoadingReplies, setIsLoadingReplies] = useState(false);

  useEffect(() => {
    const storedRoles = JSON.parse(localStorage.getItem("userRoles") || "[]");
    setUserRoles(storedRoles);
  }, []);

  const fetchRequestDetails = useCallback(async () => {
    if (!id) return;
    setIsLoading(true);
    setError(null);
    try {
      const response = await fetchDataAuth(`/requests/${id}`);
      if (response.success) {
        setRequestData(response.data);
      } else {
        setError(response.message || "فشل جلب تفاصيل الطلب.");
        toast.error(response.message || "فشل جلب تفاصيل الطلب.");
      }
    } catch (err) {
      console.error("خطأ أثناء جلب تفاصيل الطلب:", err);
      setError("حدث خطأ أثناء جلب تفاصيل الطلب.");
      toast.error("حدث خطأ أثناء جلب تفاصيل الطلب.");
    } finally {
      setIsLoading(false);
    }
  }, [id]);

  // جلب بيانات القوائم المنسدلة (التصنيفات، الحالات، الوكلاء) عند تحميل المكون
  useEffect(() => {
    const fetchDropdownData = async () => {
      try {
        const categoriesRes = await fetchDataAuth("categories/withoutPaginate");
        setCategories(categoriesRes.data);
        const statusesRes = await fetchDataAuth(
          "requestStatus/withoutPaginate"
        );
        setRequestStatuses(statusesRes.data);
        const agentsRes = await fetchDataAuth("Agents");
        setAgents(agentsRes.data);
      } catch (error) {
        console.error("خطأ أثناء جلب بيانات القوائم المنسدلة:", error);
        toast.error("حدث خطأ أثناء جلب بيانات القوائم المنسدلة.");
      }
    };
    fetchDropdownData();
  }, []);

  useEffect(() => {
    fetchRequestDetails();
  }, [fetchRequestDetails]);

  const formatDate = (dateString) => {
    if (!dateString) return "غير متوفر";
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

  const formatDateOnly = (dateString) => {
    if (!dateString) return "غير متوفر";
    const options = {
      year: "numeric",
      month: "long",
      day: "numeric",
    };
    return new Date(dateString).toLocaleDateString("ar-EG", options);
  };

  const currentRequestConfig = requestData
    ? getRequestConfig(requestData.request_type_id, userRoles)
    : {};

  const handleDelete = async () => {
    if (!requestData) return;
    try {
      await fetchDataAuth(`/requests/${requestData.id}`, {
        method: "DELETE",
      });
      toast.success(currentRequestConfig.toastDeleteMessage);
      setIsDeleteOpen(false);
      router.push("/requests-management"); // إعادة التوجيه إلى الجدول الرئيسي
    } catch (error) {
      console.error("خطأ أثناء حذف الطلب عبر API:", error);
      toast.error("فشل حذف الطلب.");
    }
  };

  const handleEditSubmit = async (updatedData) => {
    if (!requestData || !updatedData) return;
    try {
      await fetchDataAuth(`/requests/${requestData.id}`, {
        method: "PUT",
        body: updatedData,
      });
      toast.success("تم تعديل الطلب بنجاح.");
      setIsEditOpen(false);
      fetchRequestDetails(); // إعادة جلب البيانات لعرض التفاصيل المحدثة
    } catch (error) {
      console.error("خطأ أثناء تعديل الطلب:", error);
      toast.error("فشل تعديل الطلب.");
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-[70vh]">
        <div className="text-center text-gray-500 text-lg">
          جاري تحميل تفاصيل الطلب...
          <div className="flex justify-center items-center mt-4">
            <svg
              className="animate-spin -ml-1 mr-3 h-8 w-8 text-green-500"
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
            >
              <circle
                className="opacity-25"
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                strokeWidth="4"
              ></circle>
              <path
                className="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
              ></path>
            </svg>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center text-red-500 text-lg min-h-[70vh] flex items-center justify-center">
        <p>خطأ: {error}</p>
      </div>
    );
  }

  if (!requestData) {
    return (
      <div className="text-center text-gray-500 text-lg min-h-[70vh] flex items-center justify-center">
        <p>لم يتم العثور على تفاصيل الطلب.</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center justify-start min-h-[70vh] p-4 bg-gray-50">
      <h2 className="text-3xl font-extrabold text-gray-800 mb-6 text-center">
        تفاصيل الطلب #{requestData.id}
      </h2>

      <div className="w-full max-w-2xl bg-white shadow-lg rounded-xl border border-gray-200 p-6 text-right">
        <div className="space-y-3 text-gray-700">
          <p>
            <strong>كود الطلب:</strong> {requestData.reference_code}
          </p>
          <p>
            <strong>النوع:</strong>{" "}
            {requestData.request_type?.type_name || "غير متوفر"}
          </p>
          <p>
            <strong>الوصف:</strong> {requestData.description}
          </p>
          <p>
            <strong>التصنيف:</strong>{" "}
            {requestData.category?.category_name || "غير متوفر"}
          </p>
          <p>
            <strong>الفرع:</strong>{" "}
            {requestData.branch?.branch_name || "غير متوفر"}
          </p>
          <p>
            <strong>اسم مقدم الطلب:</strong> {requestData.applicant_name}
          </p>
          <p>
            <strong>البريد الإلكتروني:</strong> {requestData.email}
          </p>
          <p>
            <strong>رقم الموبايل:</strong> {requestData.mobile_number}
          </p>
          <p>
            <strong>الجهة المعنية:</strong>{" "}
            {requestData.concerned_entities || "غير متوفر"}
          </p>
          <p>
            <strong>الحالة:</strong>{" "}
            {requestData.request_status?.status_name || "غير معروف"}
          </p>
          {requestData.user && (
            <p>
              <strong>الوكيل المسؤول:</strong> {requestData.user.name}
            </p>
          )}
          <p>
            <strong>تاريخ الإنشاء:</strong> {formatDate(requestData.created_at)}
          </p>
          {/* عرض الردود السابقة هنا أيضًا، ولكن ReplyModal ستدير جلب بياناتها الخاصة */}
          <h4 className="font-bold mt-4 border-t pt-3">الردود السابقة:</h4>
          {requestData.trakings && requestData.trakings.length > 0 ? (
            requestData.trakings.map((tracking, idx) => (
              <div
                key={tracking.id || idx}
                className="bg-gray-100 p-3 rounded-lg mb-2"
              >
                <p className="text-sm">
                  <strong>الرد:</strong> {tracking.comment}
                </p>
                <p className="text-xs text-gray-500">
                  بتاريخ: {formatDate(tracking.created_at)}
                </p>
              </div>
            ))
          ) : (
            <p>لا توجد ردود سابقة.</p>
          )}

          <h4 className="font-bold mt-4 border-t pt-3">الملفات المرفقة:</h4>
          {requestData.system_files && requestData.system_files.length > 0 ? (
            <ul>
              {requestData.system_files.map((file, idx) => (
                <li
                  key={file.id || idx}
                  className="text-blue-600 hover:underline"
                >
                  <a
                    href={file.file_path}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    {file.file_name || `ملف ${idx + 1}`}
                  </a>
                </li>
              ))}
            </ul>
          ) : (
            <p>لا توجد ملفات مرفقة.</p>
          )}
          {currentRequestConfig.showDownloadPdf && (
            <div className="mt-4 text-center">
              <DownloadPDF requestData={requestData} />
            </div>
          )}
        </div>

        <div className="mt-6 flex justify-center gap-4">
          {currentRequestConfig.canAddResponse && (
            <button
              className="flex items-center justify-center bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md text-sm font-medium transition duration-150 ease-in-out shadow-sm cursor-pointer"
              onClick={() => setIsAddResponseOpen(true)}
              title="إضافة رد"
            >
              <span className="flex items-center gap-x-1.5">
                {" "}
                <FaReply /> <span>إضافة رد</span>{" "}
              </span>
            </button>
          )}
          {currentRequestConfig.canEdit && (
            <button
              className="flex items-center justify-center bg-yellow-600 hover:bg-yellow-700 text-white px-4 py-2 rounded-md text-sm font-medium transition duration-150 ease-in-out shadow-sm cursor-pointer"
              onClick={() => setIsEditOpen(true)}
              title="تعديل"
            >
              <span className="flex items-center gap-x-1.5">
                {" "}
                <FaEdit /> <span>تعديل</span>{" "}
              </span>
            </button>
          )}
          {currentRequestConfig.canDelete && (
            <button
              className="flex items-center justify-center bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-md text-sm font-medium transition duration-150 ease-in-out shadow-sm cursor-pointer"
              onClick={() => setIsDeleteOpen(true)}
              title="حذف"
            >
              <span className="flex items-center gap-x-1.5">
                {" "}
                <FaTrashAlt /> <span>حذف</span>{" "}
              </span>
            </button>
          )}
        </div>
      </div>

      {/* نافذة تأكيد الحذف */}
      <Dialog
        open={isDeleteOpen}
        onClose={() => setIsDeleteOpen(false)}
        className="relative z-50"
      >
        <div className="fixed inset-0 bg-black/30" aria-hidden="true" />
        <div className="fixed inset-0 flex items-center justify-center p-4">
          <Dialog.Panel className="w-full max-w-sm rounded-2xl bg-white p-6 shadow-xl text-center">
            <Dialog.Title className="text-lg font-bold text-gray-900 mb-4">
              تأكيد الحذف
            </Dialog.Title>
            <p className="text-gray-700 mb-6">
              {currentRequestConfig.deleteConfirmMessage}
            </p>
            <div className="flex justify-center gap-4">
              <button
                type="button"
                onClick={handleDelete}
                className="px-5 py-2 bg-red-600 text-white rounded-lg shadow hover:bg-red-700 transition-colors"
              >
                تأكيد الحذف
              </button>
              <button
                type="button"
                onClick={() => setIsDeleteOpen(false)}
                className="px-5 py-2 bg-gray-300 text-gray-700 rounded-lg shadow hover:bg-gray-400 transition-colors"
              >
                إلغاء
              </button>
            </div>
          </Dialog.Panel>
        </div>
      </Dialog>

      {/* نافذة إضافة رد */}
      <ReplyModal
        isOpen={isAddResponseOpen}
        onClose={() => {
          setIsAddResponseOpen(false);
          fetchRequestDetails(); // إعادة جلب التفاصيل بعد إضافة الرد/المرفقات
        }}
        requestId={requestData.id}
        isLoadingReplies={isLoadingReplies}
        setIsLoadingReplies={setIsLoadingReplies}
      />

      {/* نافذة تعديل الطلب */}
      <Dialog
        open={isEditOpen}
        onClose={() => setIsEditOpen(false)}
        className="relative z-50"
      >
        <div className="fixed inset-0 bg-black/30" aria-hidden="true" />
        <div className="fixed inset-0 flex items-center justify-center p-4">
          <Dialog.Panel className="w-full max-w-md rounded-2xl bg-white p-6 shadow-xl">
            <Dialog.Title className="text-xl font-bold text-gray-900 mb-4 text-center border-b pb-2">
              تعديل الطلب
            </Dialog.Title>
            {requestData && (
              <EditRequestModal
                request={requestData}
                categories={categories}
                requestStatuses={requestStatuses}
                agents={agents}
                onClose={() => setIsEditOpen(false)}
                onSubmit={handleEditSubmit}
                formatDateOnly={formatDateOnly}
              />
            )}
          </Dialog.Panel>
        </div>
      </Dialog>
    </div>
  );
}
