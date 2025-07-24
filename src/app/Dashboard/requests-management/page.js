"use client";

import { Dialog } from "@headlessui/react";
import { useEffect, useState, useCallback } from "react";
import toast from "react-hot-toast";
import {
  checkUserRole,
  fetchData,
  fetchDataAuth,
  addData,
} from "../../utils/apiHelper";
import logofull from "../../../images/logofull.jpg"; // تأكد من المسار الصحيح لشعارك
import Image from "next/image";
import dynamic from "next/dynamic";
import { useRouter } from "next/navigation"; // استيراد useRouter

import { FaInfoCircle, FaReply, FaEdit, FaTrashAlt } from "react-icons/fa"; // أيقونات جميلة

// تحميل مكون DownloadPDF ديناميكياً لأنه يستخدم `window`
const DownloadPDF = dynamic(() => import("../../component/DownloadPDF"), {
  ssr: false,
});

// تعريف أنواع الطلبات لسهولة الإدارة
const REQUEST_TYPES = {
  REPORT: { id: 1, name: "البلاغات", singleName: "بلاغ" },
  GRIEVANCE: { id: 2, name: "التظلمات", singleName: "تظلم" },
  COMPLAINT: { id: 3, name: "الشكاوى", singleName: "شكوى" },
  PRAISE: { id: 4, name: "الثناءات", singleName: "ثناء" },
  SUGGESTION: { id: 5, name: "الاقتراحات", singleName: "اقتراح" },
  INQUIRY: { id: 6, name: "الاستفسارات", singleName: "استفسار" },
};

// دالة مساعدة لتحديد إعدادات الجدول والأذونات بناءً على نوع الطلب ودور المستخدم
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
    toastDeleteMessage: `تم حذف ${
      REQUEST_TYPES[
        Object.keys(REQUEST_TYPES).find(
          (key) => REQUEST_TYPES[key].id === typeId
        )
      ]?.singleName || "الطلب"
    }`,
    showDownloadPdf: true,
    apiHandlesDelete: true,
    apiHandlesStatusChange: true,

    canViewDetails: true, // سيتم التعامل مع هذا الآن عن طريق النقر على السطر
    canAddResponse: isPublicRelationsManager || isGeneralManager || isAnyAgent,
    canEdit: isBranchManager || isGeneralManager || isAnyAgent,
    canDelete: isGeneralManager || isCentralDepartment,
    canChangeStatus:
      isBranchManager ||
      isPublicRelationsManager ||
      isCentralDepartment ||
      isGeneralManager ||
      isAnyAgent,
    showGovernorateFilter: true, // افتراضي

    // **** التعديل هنا ليعرض الأعمدة المطلوبة فقط ****
    columns: [
      { key: "#", label: "#" },
      { key: "request_type_name", label: "النوع" },
      { key: "branch_name", label: "المحافظة" },
      { key: "created_at", label: "التاريخ" },
      { key: "request_status_name", label: "الحالة" },
      { key: "user_name", label: "الوكيل" },
      { key: "is_received", label: "تم الاستلام" },
      // { key: "actions", label: "الإجراءات" }, // تم إزالته بناءً على الطلب
    ],
  };

  // إعدادات محددة لأنواع الطلبات (إذا كانت تختلف في الأعمدة أو غيرها)
  const specificConfig = {
    [REQUEST_TYPES.REPORT.id]: {
      ...baseConfig,
      columns: baseConfig.columns.filter((col) => col.key !== "user_name"),
    },
    [REQUEST_TYPES.GRIEVANCE.id]: {
      ...baseConfig,
      columns: baseConfig.columns.filter((col) => col.key !== "user_name"),
    },
    [REQUEST_TYPES.COMPLAINT.id]: {
      ...baseConfig,
      // الشكاوى تظهر جميع الأعمدة المطلوبة
    },
    [REQUEST_TYPES.PRAISE.id]: {
      ...baseConfig,
      columns: baseConfig.columns.filter((col) => col.key !== "user_name"),
    },
    [REQUEST_TYPES.SUGGESTION.id]: {
      ...baseConfig,
      columns: baseConfig.columns.filter((col) => col.key !== "user_name"),
    },
    [REQUEST_TYPES.INQUIRY.id]: {
      ...baseConfig,
      columns: baseConfig.columns.filter((col) => col.key !== "user_name"),
    },
  };

  let config = specificConfig[typeId] || baseConfig;

  // تعديل الأذونات والأعمدة بناءً على دور المستخدم
  if (isGeneralManager || isCentralDepartment) {
    config.canViewDetails = true;
    config.canAddResponse = true;
    config.canEdit = true;
    config.canDelete = true;
    config.canChangeStatus = true;
    config.showGovernorateFilter = true;
  } else if (isBranchManager || isPublicRelationsManager) {
    config.canViewDetails = true;
    config.canAddResponse = true;
    config.canEdit = true;
    config.canDelete = false; // لا يمكن لمدير الفرع أو العلاقات العامة الحذف
    config.canChangeStatus = true;
    config.showGovernorateFilter = false; // لا يظهر فلتر المحافظات لهم
  } else if (isAnyAgent) {
    config.canViewDetails = true;
    config.canAddResponse = true;
    config.canEdit = true;
    config.canDelete = false; // لا يمكن للوكلاء الحذف
    config.canChangeStatus = true;
    config.showGovernorateFilter = true;
  } else {
    // أي حساب آخر (دور افتراضي) - إخفاء الأعمدة والإجراءات الحساسة
    config.canViewDetails = true;
    config.canAddResponse = false;
    config.canEdit = false;
    config.canDelete = false;
    config.canChangeStatus = false;
    config.showGovernorateFilter = true;
    // هنا يجب أن نعيد تحديد الأعمدة لتناسب المستخدم العادي (الذي ليس لديه أذونات خاصة)
    config.columns = [
      { key: "#", label: "#" },
      { key: "request_type_name", label: "النوع" },
      { key: "branch_name", label: "المحافظة" },
      { key: "created_at", label: "التاريخ" },
      { key: "request_status_name", label: "الحالة" },
      // لا يرى الوكيل أو حالة الاستلام أو الإجراءات
    ];
  }

  return config;
};

export default function RequestsManagement() {
  const router = useRouter(); // تهيئة useRouter

  // حالات إدارة النوافذ المنبثقة (سيتم نقل هذه إلى صفحة التفاصيل)
  // const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  // const [isViewOpen, setIsViewOpen] = useState(false);
  // const [isAddResponseOpen, setIsAddResponseOpen] = useState(false);
  // const [isEditOpen, setIsEditOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState(null); // العنصر المحدد للعمليات (عرض/حذف/تعديل/رد) - لم يعد مطلوبًا هنا مباشرة للنوافذ المنبثقة

  // حالات الفلاتر والبيانات
  const [selectedRequestType, setSelectedRequestType] = useState(
    REQUEST_TYPES.COMPLAINT.id
  );
  const [filterGovernorate, setFilterGovernorate] = useState("");
  const [provinces, setProvinces] = useState([]);
  const [data, setData] = useState([]);
  const [pagination, setPagination] = useState({
    currentPage: 1,
    lastPage: 1,
    perPage: 10,
  });

  // حالات لأدوار المستخدم وبياناته
  const [userRoles, setUserRoles] = useState([]);
  const [currentUserId, setCurrentUserId] = useState(null);
  const [currentUserBranch, setCurrentUserBranch] = useState(null);

  // حالات لبيانات القوائم المنسدلة في نافذة التعديل (قد تكون مفيدة إذا تم التعديل في نفس المكان لبعض الحقول الأساسية، ولكن للتعديلات المعقدة، من الأفضل إعادة الجلب في صفحة التفاصيل)
  const [categories, setCategories] = useState([]);
  const [requestStatuses, setRequestStatuses] = useState([]);
  const [agents, setAgents] = useState([]); // الوكلاء

  // حالة التحميل
  const [isLoadingRequests, setIsLoadingRequests] = useState(false); // <--- إضافة هذه الحالة
  // const [isLoadingReplies, setIsLoadingReplies] = useState(false); // حالة تحميل الردود - تم نقلها إلى ReplyModal/Details Page

  // جلب أدوار المستخدم عند تحميل المكون
  useEffect(() => {
    const storedRoles = JSON.parse(localStorage.getItem("userRoles") || "[]");
    setUserRoles(storedRoles);
    setCurrentUserId(localStorage.getItem("id"));
    setCurrentUserBranch(localStorage.getItem("branch"));
  }, []);

  // جلب بيانات القوائم المنسدلة (التصنيفات، الحالات، الوكلاء) - لا تزال مطلوبة إذا كانت الفلاتر تعتمد عليها أو لعرض البيانات الأولية
  useEffect(() => {
    const fetchDropdownData = async () => {
      try {
        const categoriesRes = await fetchDataAuth("categories/withoutPaginate"); // جلب التصنيفات
        setCategories(categoriesRes.data);
        const statusesRes = await fetchDataAuth(
          "requestStatus/withoutPaginate" // تم تغيير الاسم ليتوافق مع الباك إند
        ); // جلب حالات الطلبات
        setRequestStatuses(statusesRes.data);
        const agentsRes = await fetchDataAuth("Agents"); // تم تغيير الاسم ليتوافق مع الباك إند
        setAgents(agentsRes.data);
      } catch (error) {
        console.error("خطأ أثناء جلب بيانات القوائم المنسدلة:", error);
        toast.error("حدث خطأ أثناء جلب بيانات القوائم المنسدلة.");
      }
    };
    fetchDropdownData();
  }, []); // تشغيل مرة واحدة عند التحميل

  // دالة لجلب الطلبات بناءً على الفلاتر والصفحة
  const loadRequests = useCallback(
    async (
      page = 1,
      typeId = selectedRequestType,
      governorateId = filterGovernorate
    ) => {
      setIsLoadingRequests(true); // <--- ابدأ التحميل

      // تأكد من وجود معرف المستخدم
      if (
        !currentUserId &&
        (checkUserRole("وكيل اقتصادي", userRoles) ||
          checkUserRole("وكيل إداري", userRoles) ||
          checkUserRole("وكيل تأشير", userRoles) ||
          checkUserRole("وكيل تحقيق", userRoles))
      ) {
        console.warn("User ID is not available for agent role.");
        setIsLoadingRequests(false); // <--- أوقف التحميل إذا لم يتوفر ID
        return;
      }
      // تأكد من وجود فرع للمستخدمين ذوي أدوار الفرع
      if (
        !currentUserBranch &&
        (checkUserRole("مدير الفرع", userRoles) ||
          checkUserRole("مدير علاقات عامة", userRoles))
      ) {
        console.warn("Branch ID is not available for branch manager role.");
        setIsLoadingRequests(false); // <--- أوقف التحميل
        return;
      }

      try {
        const isGeneralManager = checkUserRole("المدير العام", userRoles);
        const isCentralDepartment = checkUserRole(
          "الدائرة المركزية",
          userRoles
        );
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

        let endpoint = `/requests?request_type=${typeId}&page=${page}`;

        if (isGeneralManager || isCentralDepartment) {
          if (governorateId) {
            endpoint += `&branch=${governorateId}`;
          }
        } else if (isBranchManager || isPublicRelationsManager) {
          if (currentUserBranch) {
            endpoint += `&branch=${currentUserBranch}&concerned_entities=غير ذلك`;
          } else {
            setData([]);
            setPagination({ currentPage: 1, lastPage: 1, perPage: 10 });
            toast.error("لا يوجد فرع محدد لهذا المستخدم.");
            return;
          }
        } else if (isAnyAgent) {
          if (currentUserId) {
            endpoint += `&user=${currentUserId}`;
            if (governorateId) {
              endpoint += `&branch=${governorateId}`;
            }
          } else {
            setData([]);
            setPagination({ currentPage: 1, lastPage: 1, perPage: 10 });
            toast.error("لا يوجد معرف مستخدم لهذا الوكيل.");
            return;
          }
        } else {
          // للمستخدمين الذين لا يمتلكون أذونات خاصة، يتم جلب البيانات بدون فلتر نوع الطلب
          endpoint = `/requests?request_type=0&page=${page}`; // افتراضي لجلب كل شيء أو لا شيء
          if (governorateId) {
            endpoint += `&branch=${govergateId}`;
          }
        }

        const response = await fetchDataAuth(endpoint);
        console.log("البيانات التي تم جلبها:", response);
        setData(response.data);
        setPagination({
          currentPage: response.current_page,
          lastPage: response.last_page,
          perPage: response.per_page || 10,
        });

        // جلب المحافظات إذا لم تكن موجودة بالفعل
        if (provinces.length === 0) {
          const provincesResponse = await fetchDataAuth(
            "branches/withoutPaginate"
          );
          setProvinces(provincesResponse.data);
        }

        // منطق تأكيد الاستلام للوكلاء
        if (isAnyAgent && response.data.length > 0) {
          const newUnreceivedRequests = response.data.filter(
            (item) => item.is_received === 0 && item.user_id == currentUserId
          );

          if (newUnreceivedRequests.length > 0) {
            const confirmReceipt = window.confirm(
              "هل ترغب في تأكيد استلام الشكاوى الجديدة المعينة لك الآن؟"
            );
            if (confirmReceipt) {
              for (const request of newUnreceivedRequests) {
                await fetchDataAuth(
                  `/workflow/requests/${request.id}/receive`,
                  {
                    method: "PUT",
                  }
                );
              }
              toast.success("تم تأكيد استلام الشكاوى الجديدة.");
              loadRequests(page, typeId, governorateId); // إعادة تحميل البيانات بعد التأكيد
            }
          }
        }
      } catch (error) {
        console.error("خطأ أثناء جلب الطلبات:", error);
        toast.error("حدث خطأ أثناء جلب الطلبات.");
      } finally {
        setIsLoadingRequests(false); // <--- أوقف التحميل دائماً في النهاية
      }
    },
    [
      selectedRequestType,
      filterGovernorate,
      provinces.length,
      userRoles,
      currentUserId,
      currentUserBranch,
    ]
  );

  // تأثير لجلب البيانات عند تغيير الصفحة أو نوع الطلب أو فلتر المحافظة أو أدوار المستخدم
  useEffect(() => {
    // التأكد من أن أدوار المستخدم قد تم تحميلها أو أنه لا يوجد توكن لتجنب الجلب المبكر
    if (userRoles.length > 0 || !localStorage.getItem("token")) {
      loadRequests(pagination.currentPage);
    }
  }, [
    pagination.currentPage,
    selectedRequestType,
    filterGovernorate,
    loadRequests,
    userRoles,
  ]);

  // دالة لتنسيق التاريخ مع الوقت
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

  // دالة لتنسيق التاريخ بدون وقت
  const formatDateOnly = (dateString) => {
    const options = {
      year: "numeric",
      month: "long",
      day: "numeric",
    };
    return new Date(dateString).toLocaleDateString("ar-EG", options);
  };

  // معالج للانتقال إلى صفحة التفاصيل
  const handleRowClick = (item) => {
    router.push(`/requests-management/${item.id}`);
  };

  // الحصول على إعدادات الطلب الحالية لعرض الأعمدة والأذونات
  const currentRequestConfig = getRequestConfig(selectedRequestType, userRoles);
  // تصفية عمود 'actions' إذا كان موجودًا في التكوين، حيث لم يعد مطلوبًا في الجدول الرئيسي
  const visibleColumns =
    currentRequestConfig.columns.filter((col) => col.key !== "actions") || [];

  return (
    <div className="flex flex-col items-center justify-start min-h-[70vh] p-4 bg-gray-50">
      <h2 className="text-3xl font-extrabold text-gray-800 mb-6 text-center">
        إدارة{" "}
        {REQUEST_TYPES[
          Object.keys(REQUEST_TYPES).find(
            (key) => REQUEST_TYPES[key].id === selectedRequestType
          )
        ]?.name || "الطلبات"}
      </h2>

      {/* فلاتر نوع الطلب والمحافظة */}
      <div className="flex flex-col md:flex-row gap-4 mb-6 w-full max-w-4xl">
        <div className="flex-1">
          <label
            htmlFor="requestType"
            className="block text-sm font-medium text-gray-700 mb-1"
          >
            اختر نوع الطلب:
          </label>
          <select
            id="requestType"
            className="w-full p-3 border border-gray-300 rounded-lg shadow-sm focus:ring-green-500 focus:border-green-500"
            onChange={(e) => {
              setSelectedRequestType(Number(e.target.value));
              setPagination((prev) => ({ ...prev, currentPage: 1 }));
              setFilterGovernorate(""); // إعادة تعيين فلتر المحافظة عند تغيير نوع الطلب
            }}
            value={selectedRequestType}
          >
            {Object.values(REQUEST_TYPES).map((type) => (
              <option key={type.id} value={type.id}>
                {type.name}
              </option>
            ))}
          </select>
        </div>

        {currentRequestConfig.showGovernorateFilter && (
          <div className="flex-1">
            <label
              htmlFor="filterGovernorate"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              اختر المحافظة:
            </label>
            <select
              id="filterGovernorate"
              className="w-full p-3 border border-gray-300 rounded-lg shadow-sm focus:ring-green-500 focus:border-green-500"
              onChange={(e) => {
                setFilterGovernorate(e.target.value);
                setPagination((prev) => ({ ...prev, currentPage: 1 }));
              }}
              value={filterGovernorate}
            >
              <option value="">جميع المحافظات</option>
              {provinces.map((gov) => (
                <option key={gov.id} value={gov.id}>
                  {gov.branch_name}
                </option>
              ))}
            </select>
          </div>
        )}
      </div>

      {/* جدول عرض الطلبات */}
      <div className="w-full max-w-6xl overflow-x-auto bg-white shadow-lg rounded-xl border border-gray-200">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-[#3da67e] text-white sticky top-0 z-10">
            <tr>
              {visibleColumns.map((header) => (
                <th
                  key={header.key}
                  scope="col"
                  className="px-6 py-3 text-center text-xs font-bold uppercase tracking-wider"
                >
                  {header.label}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {isLoadingRequests ? ( // <--- عرض رسالة التحميل هنا
              <tr>
                <td
                  colSpan={visibleColumns.length}
                  className="px-6 py-10 text-center text-gray-500 text-lg"
                >
                  جاري تحميل الطلبات... يرجى الانتظار
                  <div className="flex justify-center items-center mt-4">
                    {/* يمكنك إضافة أيقونة تحميل (spinner) هنا */}
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
                </td>
              </tr>
            ) : data.length > 0 ? (
              data.map((item, index) => (
                <tr
                  key={item.id || index}
                  className="hover:bg-green-50 transition-colors duration-200 cursor-pointer" // إضافة مؤشر اليد
                  onClick={() => handleRowClick(item)} // معالج النقر على السطر
                  title="اضغط هنا للحصول على تفاصيل الطلب" // مربع نص التحويم
                >
                  {visibleColumns.map((column) => {
                    switch (column.key) {
                      case "#":
                        return (
                          <td
                            key={column.key}
                            className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 text-center"
                          >
                            {index +
                              1 +
                              (pagination.currentPage - 1) * pagination.perPage}
                          </td>
                        );
                      case "description":
                        return (
                          <td
                            key={column.key}
                            className="px-6 py-4 whitespace-normal text-sm text-gray-700 text-right max-w-xs overflow-hidden text-ellipsis"
                          >
                            {item.description?.slice(0, 50)}{" "}
                            {item.description?.length > 50 ? "..." : ""}
                          </td>
                        );
                      case "category_name":
                        return (
                          <td
                            key={column.key}
                            className="px-6 py-4 whitespace-nowrap text-sm text-gray-700 text-center"
                          >
                            {item.category?.category_name || "غير متوفر"}
                          </td>
                        );
                      case "branch_name":
                        return (
                          <td
                            key={column.key}
                            className="px-6 py-4 whitespace-nowrap text-sm text-gray-700 text-center"
                          >
                            {item.branch?.branch_name || "غير متوفر"}
                          </td>
                        );
                      case "request_type_name":
                        return (
                          <td
                            key={column.key}
                            className="px-6 py-4 whitespace-nowrap text-sm text-gray-700 text-center"
                          >
                            {item.request_type?.type_name || "غير متوفر"}
                          </td>
                        );
                      case "created_at":
                        return (
                          <td
                            key={column.key}
                            className="px-6 py-4 whitespace-nowrap text-sm text-gray-700 text-center"
                          >
                            {/* **** استخدام formatDateOnly هنا **** */}
                            {formatDateOnly(item.created_at)}
                          </td>
                        );
                      case "request_status_name":
                        const statusText =
                          item.request_status?.status_name ||
                          getStatusNameById(item.status) ||
                          "غير معروف";
                        let statusColor = "text-gray-700";
                        if (statusText === "جديدة")
                          statusColor = "text-blue-600 font-semibold";
                        else if (statusText === "قيد المعالجة")
                          statusColor = "text-yellow-600 font-semibold";
                        else if (statusText === "تم الحل")
                          statusColor = "text-green-600 font-semibold";
                        return (
                          <td
                            key={column.key}
                            className={`px-6 py-4 whitespace-nowrap text-sm text-center ${statusColor}`}
                          >
                            {statusText}
                          </td>
                        );
                      case "user_name":
                        return (
                          <td
                            key={column.key}
                            className="px-6 py-4 whitespace-nowrap text-sm text-gray-700 text-center"
                          >
                            {item.user?.name || "غير معين"}
                          </td>
                        );
                      case "concerned_entities":
                        return (
                          <td
                            key={column.key}
                            className="px-6 py-4 whitespace-nowrap text-sm text-gray-700 text-center"
                          >
                            {item.concerned_entities || "غير متوفر"}
                          </td>
                        );
                      case "is_received":
                        const receivedStatus =
                          item.is_received === 0 ? "غير مستلم" : "تم الاستلام";
                        const receivedColor =
                          item.is_received === 0
                            ? "text-red-500"
                            : "text-green-500";
                        return (
                          <td
                            key={column.key}
                            className={`px-6 py-4 whitespace-nowrap text-sm text-center font-medium ${receivedColor}`}
                          >
                            {receivedStatus}
                          </td>
                        );
                      default:
                        return (
                          <td
                            key={column.key}
                            className="px-6 py-4 whitespace-nowrap text-sm text-gray-700 text-center"
                          >
                            {"غير متوفر"}
                          </td>
                        );
                    }
                  })}
                </tr>
              ))
            ) : (
              <tr>
                <td
                  colSpan={visibleColumns.length}
                  className="px-6 py-10 text-center text-gray-500 text-lg"
                >
                  لا توجد طلبات لعرضها.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* التنقل (Pagination) */}
      <div className="flex items-center justify-between gap-4 mt-8">
        <button
          disabled={pagination.currentPage === 1}
          onClick={() =>
            setPagination((prev) => ({
              ...prev,
              currentPage: prev.currentPage - 1,
            }))
          }
          className="px-5 py-2 bg-gray-300 text-gray-700 rounded-lg shadow hover:bg-gray-400 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          السابق
        </button>
        <span className="text-gray-700 text-lg font-semibold">
          صفحة {pagination.currentPage} من {pagination.lastPage}
        </span>
        <button
          disabled={pagination.currentPage === pagination.lastPage}
          onClick={() =>
            setPagination((prev) => ({
              ...prev,
              currentPage: prev.currentPage + 1,
            }))
          }
          className="px-5 py-2 bg-gray-300 text-gray-700 rounded-lg shadow hover:bg-gray-400 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          التالي
        </button>
      </div>

      {/*
        تمت إزالة جميع مربعات الحوار (View, Delete, Add Response, Edit) من هنا.
        سيتم التعامل معها في صفحة تفاصيل الطلب الجديدة.
      */}
    </div>
  );
}

// حافظ على هذه المكونات حيث سيتم إعادة استخدامها في صفحة التفاصيل الجديدة
// مكونات ReplyModal و EditRequestModal تظل كما هي من الكود الذي قدمه المستخدم.
// سيتم استيرادها واستخدامها في ملف requests-management/[id]/page.js الجديد

const ReplyModal = ({
  isOpen,
  onClose,
  requestId,
  isLoadingReplies,
  setIsLoadingReplies,
}) => {
  const [replyText, setReplyText] = useState("");
  const [files, setFiles] = useState([]);
  const [previousReplies, setPreviousReplies] = useState([]);
  const [systemAttachments, setSystemAttachments] = useState([]);

  const formatDateWithTime = (dateString) => {
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

  const fetchReplies = useCallback(async () => {
    if (!requestId) return; // تأكد من وجود requestId
    setIsLoadingReplies(true);
    try {
      const res = await fetchDataAuth(`requests/${requestId}/replies`);
      if (res.success) {
        setPreviousReplies(res.data.trackings ?? []);
        setSystemAttachments(res.data.system_files ?? []);
      } else {
        console.error("Failed to fetch replies:", res.message);
        toast.error("فشل جلب الردود السابقة.");
      }
    } catch (error) {
      console.error("Error fetching replies:", error);
      toast.error("حدث خطأ أثناء جلب الردود السابقة.");
    } finally {
      setIsLoadingReplies(false);
    }
  }, [requestId, setIsLoadingReplies]);

  useEffect(() => {
    if (isOpen && requestId) {
      // جلب البيانات فقط عندما تكون النافذة مفتوحة ومعرف الطلب متاح
      fetchReplies();
    } else {
      // مسح البيانات عند إغلاق النافذة
      setPreviousReplies([]);
      setSystemAttachments([]);
      setReplyText("");
      setFiles([]);
    }
  }, [isOpen, requestId, fetchReplies]); // تمت إضافة fetchReplies إلى مصفوفة الاعتماديات

  const handleFileChange = (e) => {
    if (e.target.files) {
      setFiles(Array.from(e.target.files));
    }
  };

  const handleSubmit = async () => {
    if (!requestId) {
      toast.error("لا يوجد طلب محدد لإرسال الرد أو الملفات.");
      return;
    }

    if (!replyText && files.length === 0) {
      toast.error("الرجاء كتابة رد أو إرفاق ملف واحد على الأقل.");
      return;
    }

    try {
      if (replyText) {
        await addData("/trakings", {
          request_id: requestId,
          comment: replyText,
        });
        toast.success("تم إرسال الرد بنجاح");
        setReplyText(""); // مسح حقل نص الرد
      }

      if (files.length > 0) {
        const formData = new FormData();
        formData.append("request_id", requestId);
        files.forEach((file) => {
          formData.append("systemFiles[]", file); // تأكد من مطابقة هذا لتوقعات الـ API
        });
        await addData(`/systemFiles/${requestId}`, formData, true); // true لـ FormData
        toast.success("تم إرسال الملفات بنجاح");
        setFiles([]); // مسح الملفات المختارة
      }

      fetchReplies(); // إعادة جلب جميع البيانات بعد الإرسال
    } catch (error) {
      console.error("خطأ أثناء إرسال الرد أو الملفات:", error);
      toast.error("فشل إرسال الرد أو الملفات.");
    }
  };

  return (
    <Dialog
      open={isOpen}
      onClose={onClose}
      className="fixed inset-0 z-50 flex items-center justify-center"
    >
      <div className=" bg-black/50 fixed inset-0" />
      <div className="bg-white p-6 rounded-md z-50 w-[90%] md:w-[600px] max-h-[90vh] overflow-y-auto relative">
        <div className="flex justify-between items-center mb-4">
          <Dialog.Title className="text-xl font-bold">
            إضافة رد على الطلب #{requestId}
          </Dialog.Title>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-red-600 text-xl font-bold"
            title="إغلاق"
          >
            ×
          </button>
        </div>
        <textarea
          className="w-full p-2 border rounded mb-4"
          rows={4}
          placeholder="اكتب الرد هنا..."
          value={replyText}
          onChange={(e) => setReplyText(e.target.value)}
        />

        <input
          type="file"
          multiple
          onChange={handleFileChange}
          className="mb-4 block text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-green-50 file:text-green-700 hover:file:bg-green-100"
        />

        <button
          onClick={handleSubmit}
          className="bg-green-600 text-white px-4 py-2 rounded mb-6"
        >
          إرسال الرد
        </button>

        <h3 className="text-lg font-semibold mb-2">الردود السابقة</h3>
        {isLoadingReplies ? (
          <p className="text-center text-gray-500">جاري تحميل الردود...</p>
        ) : (
          <table className="w-full text-sm border">
            <thead>
              <tr className="bg-gray-100 text-right">
                <th className="p-2 border">الرد</th>
                <th className="p-2 border">التاريخ</th>
                <th className="p-2 border">تم بواسطة</th>
              </tr>
            </thead>
            <tbody>
              {previousReplies.length > 0 ? (
                previousReplies.map((reply) => (
                  <tr key={reply.id}>
                    <td className="p-2 border">{reply.comment}</td>
                    <td className="p-2 border">
                      {formatDateWithTime(reply.created_at)}
                    </td>
                    <td className="p-2 border">
                      {reply.user?.name ?? "غير معروف"}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td
                    colSpan="3"
                    className="p-2 border text-center text-gray-500"
                  >
                    لا توجد ردود سابقة.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        )}
        <h3 className="text-lg font-semibold mt-6 mb-2">الملفات المرفقة</h3>
        {isLoadingReplies ? (
          <p className="text-center text-gray-500">جاري تحميل الملفات...</p>
        ) : (
          <ul className="list-disc pr-5 space-y-1">
            {systemAttachments.length > 0 ? (
              systemAttachments.map((file, idx) => (
                <li key={file.id || idx}>
                  <a
                    href={file.file_path}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-600 underline"
                  >
                    {file.file_name ?? `ملف ${idx + 1}`}
                  </a>
                </li>
              ))
            ) : (
              <li className="text-gray-500">لا يوجد ملفات مرفقة.</li>
            )}
          </ul>
        )}
      </div>
    </Dialog>
  );
};

const EditRequestModal = ({
  request,
  categories,
  requestStatuses,
  agents,
  onClose,
  onSubmit,
  formatDateOnly,
}) => {
  const [editedRequest, setEditedRequest] = useState({
    description: request.description || "",
    category_id: request.category?.id || "",
    request_status_id: request.request_status?.id || "",
    user_id: request.user?.id || "", // الوكيل المسؤول
    concerned_entities: request.concerned_entities || "",
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setEditedRequest((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit(editedRequest);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4 text-right">
      <div>
        <label
          htmlFor="description"
          className="block text-sm font-medium text-gray-700"
        >
          الوصف:
        </label>
        <textarea
          id="description"
          name="description"
          rows="3"
          className="mt-1 block w-full p-2 border border-gray-300 rounded-md shadow-sm focus:ring-green-500 focus:border-green-500"
          value={editedRequest.description}
          onChange={handleChange}
        ></textarea>
      </div>

      <div>
        <p className="block text-sm font-medium text-gray-700">
          <strong>النوع:</strong>{" "}
          {request.request_type?.type_name || "غير متوفر"}
        </p>
      </div>

      <div>
        <p className="block text-sm font-medium text-gray-700">
          <strong>التاريخ:</strong> {formatDateOnly(request.created_at)}
        </p>
      </div>

      <div>
        <p className="block text-sm font-medium text-gray-700">
          <strong>تم الاستلام:</strong>{" "}
          {request.is_received === 1 ? "نعم" : "لا"}
        </p>
      </div>

      <div>
        <p className="block text-sm font-medium text-gray-700">
          <strong>المحافظة:</strong>{" "}
          {request.branch?.branch_name || "غير متوفر"}
        </p>
      </div>

      <div>
        <label
          htmlFor="concerned_entities"
          className="block text-sm font-medium text-gray-700"
        >
          الجهة المعنية:
        </label>
        <input
          type="text"
          id="concerned_entities"
          name="concerned_entities"
          className="mt-1 block w-full p-2 border border-gray-300 rounded-md shadow-sm focus:ring-green-500 focus:border-green-500"
          value={editedRequest.concerned_entities}
          onChange={handleChange}
        />
      </div>

      <div>
        <label
          htmlFor="category_id"
          className="block text-sm font-medium text-gray-700"
        >
          التصنيف:
        </label>
        <select
          id="category_id"
          name="category_id"
          className="mt-1 block w-full p-2 border border-gray-300 rounded-md shadow-sm focus:ring-green-500 focus:border-green-500"
          value={editedRequest.category_id}
          onChange={handleChange}
        >
          <option value="">اختر تصنيف</option>
          {categories.map((cat) => (
            <option key={cat.id} value={cat.id}>
              {cat.category_name}
            </option>
          ))}
        </select>
      </div>

      <div>
        <label
          htmlFor="request_status_id"
          className="block text-sm font-medium text-gray-700"
        >
          الحالة:
        </label>
        <select
          id="request_status_id"
          name="request_status_id"
          className="mt-1 block w-full p-2 border border-gray-300 rounded-md shadow-sm focus:ring-green-500 focus:border-green-500"
          value={editedRequest.request_status_id}
          onChange={handleChange}
        >
          <option value="">اختر حالة</option>
          {requestStatuses.map((status) => (
            <option key={status.id} value={status.id}>
              {status.status_name}
            </option>
          ))}
        </select>
      </div>

      <div>
        <label
          htmlFor="user_id"
          className="block text-sm font-medium text-gray-700"
        >
          الوكيل المسؤول:
        </label>
        <select
          id="user_id"
          name="user_id"
          className="mt-1 block w-full p-2 border border-gray-300 rounded-md shadow-sm focus:ring-green-500 focus:border-green-500"
          value={editedRequest.user_id}
          onChange={handleChange}
        >
          <option value="">اختر وكيل</option>
          {agents.map((agent) => (
            <option key={agent.id} value={agent.id}>
              {agent.name}
            </option>
          ))}
        </select>
      </div>

      {/* عرض الردود السابقة في نافذة التعديل */}
      {request.trakings && request.trakings.length > 0 && (
        <div className="bg-gray-50 p-3 rounded-md border border-gray-200">
          <h5 className="font-semibold text-gray-800 mb-2">الردود السابقة:</h5>
          {request.trakings.map((tracking) => (
            <p key={tracking.id} className="text-sm text-gray-600">
              - {tracking.comment} (بتاريخ:{" "}
              {formatDateOnly(tracking.created_at)})
            </p>
          ))}
        </div>
      )}

      <div className="flex justify-end gap-3">
        <button
          type="submit"
          className="px-5 py-2 bg-green-600 text-white rounded-lg shadow hover:bg-green-700 transition-colors"
        >
          حفظ التعديلات
        </button>
        <button
          type="button"
          onClick={onClose}
          className="px-5 py-2 bg-gray-300 text-gray-700 rounded-lg shadow hover:bg-gray-400 transition-colors"
        >
          إلغاء
        </button>
      </div>
    </form>
  );
};
