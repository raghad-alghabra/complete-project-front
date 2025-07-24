"use client";
import React, { useState, useRef, useEffect } from "react";
import axios from "axios";
import Navbar from "../component/navbar";
import Footer from "../component/Footer";
import Baner from "../component/Baner";
import { QRCodeCanvas } from "qrcode.react";
import { addData, fetchData } from "../utils/apiHelper";

export default function Complaint() {
  // State variables to manage form data, UI state, and errors
  const [submitted, setSubmitted] = useState(false);
  const [trackingCode, setTrackingCode] = useState("");
  const [showPopup, setShowPopup] = useState(false);
  const [Attachments, setAttachments] = useState([]);
  const [errors, setErrors] = useState({}); // For field-specific validation errors
  const [globalNotification, setGlobalNotification] = useState({
    message: "",
    type: "",
  }); // For general success/error messages
  const [requestTypes, setRequestTypes] = useState([]);
  const [provinces, setProvinces] = useState([]);

  // Form data state, initialized with default values
  const [formData, setFormData] = useState({
    applicant: {
      full_name: "",
      national_id: "",
      mobile_phone: "",
      email: "",
      phone: "",
      address: "",
    },
    request: {
      category_id: 1, // Default category ID
      city_id: 1, // Default city ID
      branch_id: "", // Changed to empty string to enforce selection
      request_type_id: "",
      request_status_id: 1, // Default request status ID
      description: "",
      reference_code: "",
      concerned_entities: "",
    },
  });

  // Ref for the file input to clear it after submission
  const fileRef = useRef(null);

  // Determine if attachment fields should be shown based on request type
  const showAttachments =
    formData.request.request_type_id == 1 ||
    formData.request.request_type_id == 3;

  // useEffect hook to load initial data (request types and provinces) when the component mounts
  useEffect(() => {
    loadRequestTypesAndProvinces();
  }, []);

  // Function to fetch request types and provinces from the API
  const loadRequestTypesAndProvinces = async () => {
    try {
      const typesResponse = await fetchData("/requestTypes");
      setRequestTypes(typesResponse.data);

      const branchesResponse = await fetchData(`/branches/withoutPaginate`);
      setProvinces(branchesResponse.data);
    } catch (error) {
      console.error("خطأ أثناء جلب البيانات:", error);
      // Set global error notification for data loading failure
      setGlobalNotification({
        message: "فشل في تحميل البيانات الأساسية.",
        type: "error",
      });
      // Clear after 5 seconds
      setTimeout(() => setGlobalNotification({ message: "", type: "" }), 5000);
    }
  };

  // Handler for input and select field changes
  const handleChange = (e) => {
    const { name, value } = e.target;

    // تم تعديل هذه الكتلة لتطبيق التصفية على الرقم الوطني والهاتف المحمول والأرضي
    if (["national_id", "mobile_phone", "phone"].includes(name)) {
      const filteredValue = value.replace(/[^0-9]/g, ""); // تصفية أي أحرف غير رقمية
      setFormData((prev) => ({
        ...prev,
        applicant: {
          ...prev.applicant,
          [name]: filteredValue, // استخدام القيمة المصفاة
        },
      }));
    } else if (["full_name", "email", "address"].includes(name)) {
      setFormData((prev) => ({
        ...prev,
        applicant: {
          ...prev.applicant,
          [name]: value,
        },
      }));
    } else if (
      [
        "request_type_id",
        "category_id",
        "branch_id",
        "request_status_id",
        "concerned_entities",
      ].includes(name)
    ) {
      setFormData((prev) => ({
        ...prev,
        request: {
          ...prev.request,
          [name]: value,
        },
      }));
    } else if (name === "description") {
      setFormData((prev) => ({
        ...prev,
        request: {
          ...prev.request,
          [name]: value,
        },
      }));
      // Generate a tracking code when the description is typed
      const code = `C-${Date.now().toString().slice(-6)}-${Math.floor(
        1000 + Math.random() * 9000
      )}`;
      setTrackingCode(code);
      setFormData((prev) => ({
        ...prev,
        request: {
          ...prev.request,
          reference_code: code,
        },
      }));
    }
    // Clear any existing error for the changed field
    setErrors((prev) => ({ ...prev, [name]: "" }));
    // Clear global notification when user starts typing again
    setGlobalNotification({ message: "", type: "" });
  };

  // Handler for file input changes
  const handleFilesChange = (e) => {
    const files = Array.from(e.target.files);
    setAttachments(files);
    // Clear any existing error for attachments when files are selected
    setErrors((prev) => ({ ...prev, attachments: "" }));
  };

  // Function to validate form fields
  const validateForm = () => {
    const newErrors = {};

    // Validate applicant information
    if (!formData.applicant.full_name.trim()) {
      newErrors.full_name = "الاسم الكامل مطلوب";
    }
    if (!formData.applicant.national_id.trim()) {
      newErrors.national_id = "الرقم الوطني مطلوب";
    } else if (!/^\d{11}$/.test(formData.applicant.national_id)) {
      newErrors.national_id =
        "الرقم الوطني يجب أن يكون 11 رقمًا فقط ويحتوي على أرقام";
    }
    if (!formData.applicant.mobile_phone.trim()) {
      newErrors.mobile_phone = "رقم الهاتف المحمول مطلوب";
    } else if (!/^\d{9,10}$/.test(formData.applicant.mobile_phone)) {
      newErrors.mobile_phone = "رقم الهاتف المحمول غير صالح (9 أو 10 أرقام)";
    }
    // إضافة التحقق لرقم الهاتف الأرضي إذا كان مطلوبًا
    if (
      formData.applicant.phone.trim() &&
      !/^\d{7}$/.test(formData.applicant.phone)
    ) {
      newErrors.phone = "رقم الهاتف الأرضي يجب أن يكون 7 أرقام";
    }
    if (!formData.applicant.email.trim()) {
      newErrors.email = "البريد الإلكتروني مطلوب";
    } else if (!/\S+@\S+\.\S+/.test(formData.applicant.email)) {
      newErrors.email = "البريد الإلكتروني غير صالح";
    }

    // Validate request information
    if (!formData.request.description.trim()) {
      newErrors.description = "وصف الطلب مطلوب";
    }
    if (!formData.request.request_type_id) {
      newErrors.request_type_id = "يرجى اختيار نوع الطلب";
    }
    if (!formData.request.branch_id) {
      newErrors.branch_id = "يرجى اختيار المحافظة";
    }
    if (showAttachments && !formData.request.concerned_entities) {
      newErrors.concerned_entities = "يرجى اختيار الجهة المقصودة";
    }
    // Validate attachments if required by request type
    if (showAttachments && Attachments.length === 0) {
      newErrors.attachments =
        "يجب إرفاق ملف واحد على الأقل لهذا النوع من الطلب";
    }

    return newErrors;
  };

  // Handler for form submission
const handleSubmit = async (e) => {
    e.preventDefault();
    setGlobalNotification({ message: "", type: "" }); // Clear any previous global notification

    const newErrors = validateForm();

    // If there are validation errors, set them and stop submission
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      // Optional: Scroll to the first error
      const firstErrorField = Object.keys(newErrors)[0];
      const element = document.getElementsByName(firstErrorField)[0];
      if (element) {
        element.scrollIntoView({ behavior: "smooth", block: "center" });
      }
      return;
    }

    // Clear previous errors
    setErrors({});

    try {
      // **الخطوة الأولى: إنشاء نسخة من بيانات الطلب لتعديلها**
      let requestDataToSend = { ...formData.request };

      // **الخطوة الثانية: التحقق من نوع الطلب وحذف concerned_entities إذا لم يكن مطلوبًا**
      // في حالتك، أنواع الطلبات 1 و 3 هي التي تتطلب هذا الحقل.
      const requiresConcernedEntities = ["1", "3"].includes(
        requestDataToSend.request_type_id
      );

      if (!requiresConcernedEntities) {
        delete requestDataToSend.concerned_entities;
      }

      // **الخطوة الثالثة: تجهيز البيانات النهائية للإرسال**
      const finalFormData = {
        applicant: formData.applicant,
        request: requestDataToSend, // استخدام الكائن المعدل هنا
      };

      // Prepare data for API call
      const arr = {
        data: JSON.stringify(finalFormData),
        attachments: Attachments,
      };

      // Send data to the API
      await addData("/requests/store", arr);

      // On successful submission, update state to show success popup and reset form
      setSubmitted(true);
      setShowPopup(true);
      setGlobalNotification({ message: "تم الأمر بنجاح.", type: "success" }); // Show success message
      // Clear global notification after 5 seconds
      setTimeout(() => setGlobalNotification({ message: "", type: "" }), 5000);

      setFormData({
        applicant: {
          full_name: "",
          national_id: "",
          mobile_phone: "",
          email: "",
          phone: "",
          address: "",
        },
        request: {
          category_id: 1,
          city_id: 1,
          branch_id: "", // Reset to empty string
          request_type_id: "",
          request_status_id: 1,
          description: "",
          reference_code: "",
          concerned_entities: "",
        },
      });
      setAttachments([]);
      if (fileRef.current) fileRef.current.value = ""; // Clear file input
    } catch (error) {
      console.error("فشل في إرسال الشكوى:", error);
      // Handle Axios-specific errors, particularly validation errors (status 422)
      if (
        axios.isAxiosError(error) &&
        error.response &&
        error.response.status === 422
      ) {
        const backendErrors = error.response.data.errors;
        const mappedErrors = {};
        // Map backend errors to the frontend error state structure
        // This handles cases where backend sends "applicant.full_name" or "request.description"
        for (const key in backendErrors) {
          if (backendErrors.hasOwnProperty(key)) {
            let fieldName = key;
            if (key.startsWith("applicant.")) {
              fieldName = key.replace("applicant.", "");
            } else if (key.startsWith("request.")) {
              fieldName = key.replace("request.", "");
            }
            mappedErrors[fieldName] = backendErrors[key][0];
          }
          console.log(
            "Mapped error for",
            fieldName,
            ":",
            mappedErrors[fieldName]
          );
        }
        setErrors(mappedErrors);
        // Optional: Scroll to the first backend error field
        const firstBackendErrorField = Object.keys(mappedErrors)[0];
        const element = document.getElementsByName(firstBackendErrorField)[0];
        if (element) {
          element.scrollIntoView({ behavior: "smooth", block: "center" });
        }
      } else {
        // Handle other unexpected errors (network issues, server errors, etc.)
        setGlobalNotification({
          message: "لم يتم إرسال الشكوى. يرجى المحاولة لاحقاً.",
          type: "error",
        }); // Show general error message
        // Clear global notification after 5 seconds
        setTimeout(
          () => setGlobalNotification({ message: "", type: "" }),
          5000
        );
        console.error("حدث خطأ غير متوقع أثناء إرسال الشكوى:", error.message);
      }
    }
};

  return (
    <div>
      <Navbar />
      <Baner titel="منبر المواطن" uptitle="تواصل معنا" />
      <main className="page container p-6 mx-auto text-center">
        <p className="mb-6 text-gray-700 font-medium font-ibm-arabic">
          نؤكد أن جميع البيانات المقدمة من خلال هذا النموذج آمنة وتخضع لحماية
          عالية، ويتم التعامل معها بسرية تامة بما يحفظ خصوصية صاحب الطلب.
        </p>
        <form
          onSubmit={handleSubmit}
          className="form-up flex flex-col items-center"
        >
          {/* تم إزالة عرض global API error من هنا، وسيعرض الآن تحت الفورم */}

          {/* قسم المعلومات الشخصية (Personal Information Section) */}
          <div className="form1 w-full max-w-4xl form-body">
            <label className="form-label">المعلومات الشخصية</label>

            {/* الصف الأول: الاسم الكامل والرقم الوطني (Full Name and National ID) */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              <div className="flex flex-col">
                <label
                  htmlFor="full_name"
                  className="text-gray-700 text-right mb-1"
                >
                  الاسم الكامل <span className="text-red-500">*</span>
                </label>
                <input
                  id="full_name"
                  className="item-input w-full placeholder-gray-500 placeholder-italic"
                  type="text"
                  name="full_name"
                  placeholder="أدخل الاسم الكامل"
                  onChange={handleChange}
                  value={formData.applicant.full_name}
                />
                {errors.full_name && (
                  <p
                    dir="rtl"
                    className="mt-1 text-red-800 bg-red-100 p-2 rounded-lg border border-red-300 text-sm font-semibold shadow-sm flex items-center justify-start"
                  >
                    {errors.full_name}
                    <svg
                      className="w-4 h-4 mr-2 text-red-600 flex-shrink-0"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                      ></path>
                    </svg>
                  </p>
                )}
              </div>
              <div className="flex flex-col">
                <label
                  htmlFor="national_id"
                  className="text-gray-700 text-right mb-1"
                >
                  الرقم الوطني <span className="text-red-500">*</span>
                </label>
                <input
                  id="national_id"
                  className="item-input w-full placeholder-gray-500 placeholder-italic"
                  type="text"
                  inputMode="numeric"
                  pattern="[0-9]*"
                  name="national_id"
                  placeholder="أدخل الرقم الوطني"
                  onChange={handleChange}
                  value={formData.applicant.national_id}
                />
                {errors.national_id && (
                  <p
                    dir="rtl"
                    className="mt-1 text-red-800 bg-red-100 p-2 rounded-lg border border-red-300 text-sm font-semibold shadow-sm flex items-center justify-start"
                  >
                    {errors.national_id}
                    <svg
                      className="w-4 h-4 mr-2 text-red-600 flex-shrink-0"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                      ></path>
                    </svg>
                  </p>
                )}
              </div>
            </div>

            {/* الصف الثاني: الهاتف المحمول والبريد الإلكتروني (Mobile Phone and Email) */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              <div className="flex flex-col">
                <label
                  htmlFor="mobile_phone"
                  className="text-gray-700 text-right mb-1"
                >
                  الهاتف المحمول <span className="text-red-500">*</span>
                </label>
                <input
                  id="mobile_phone"
                  className="item-input w-full placeholder-gray-500 placeholder-italic"
                  type="text"
                  inputMode="numeric"
                  pattern="[0-9]*"
                  name="mobile_phone"
                  placeholder="أدخل رقم الهاتف المحمول"
                  onChange={handleChange}
                  value={formData.applicant.mobile_phone}
                />
                {errors.mobile_phone && (
                  <p
                    dir="rtl"
                    className="mt-1 text-red-800 bg-red-100 p-2 rounded-lg border border-red-300 text-sm font-semibold shadow-sm flex items-center justify-start"
                  >
                    {errors.mobile_phone}
                    <svg
                      className="w-4 h-4 mr-2 text-red-600 flex-shrink-0"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                      ></path>
                    </svg>
                  </p>
                )}
              </div>
              <div className="flex flex-col">
                <label
                  htmlFor="email"
                  className="text-gray-700 text-right mb-1"
                >
                  البريد الإلكتروني <span className="text-red-500">*</span>
                </label>
                <input
                  id="email"
                  className="item-input w-full placeholder-gray-500 placeholder-italic"
                  type="email"
                  name="email"
                  placeholder="أدخل البريد الإلكتروني"
                  onChange={handleChange}
                  value={formData.applicant.email}
                />
                {errors.email && (
                  <p
                    dir="rtl"
                    className="mt-1 text-red-800 bg-red-100 p-2 rounded-lg border border-red-300 text-sm font-semibold shadow-sm flex items-center justify-start"
                  >
                    {errors.email}
                    <svg
                      className="w-4 h-4 mr-2 text-red-600 flex-shrink-0"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                      ></path>
                    </svg>
                  </p>
                )}
              </div>
            </div>

            {/* الصف الثالث: عنوان المنزل ورقم الهاتف الأرضي (Home Address and Landline Phone) */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              <div className="flex flex-col">
                <label
                  htmlFor="address"
                  className="text-gray-700 text-right mb-1"
                >
                  عنوان المنزل
                </label>
                <input
                  id="address"
                  className="item-input w-full placeholder-gray-500 placeholder-italic"
                  type="text"
                  name="address"
                  placeholder="أدخل عنوان المنزل"
                  onChange={handleChange}
                  value={formData.applicant.address}
                />
                {errors.address && (
                  <p
                    dir="rtl"
                    className="mt-1 text-red-800 bg-red-100 p-2 rounded-lg border border-red-300 text-sm font-semibold shadow-sm flex items-center justify-start"
                  >
                    {errors.address}
                    <svg
                      className="w-4 h-4 mr-2 text-red-600 flex-shrink-0"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                      ></path>
                    </svg>
                  </p>
                )}
              </div>
              <div className="flex flex-col">
                <label
                  htmlFor="phone"
                  className="text-gray-700 text-right mb-1"
                >
                  رقم الهاتف الأرضي
                </label>
                <input
                  id="phone"
                  className="item-input w-full placeholder-gray-500 placeholder-italic"
                  type="text"
                  inputMode="numeric"
                  pattern="[0-9]*"
                  name="phone"
                  placeholder="أدخل رقم الهاتف الأرضي"
                  onChange={handleChange}
                  value={formData.applicant.phone}
                />
                {errors.phone && (
                  <p
                    dir="rtl"
                    className="mt-1 text-red-800 bg-red-100 p-2 rounded-lg border border-red-300 text-sm font-semibold shadow-sm flex items-center justify-start"
                  >
                    {errors.phone}
                    <svg
                      className="w-4 h-4 mr-2 text-red-600 flex-shrink-0"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                      ></path>
                    </svg>
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* قسم معلومات الطلب (Request Information Section) */}
          <div className="form1 w-full max-w-4xl form-body">
            <label className="form-label">معلومات الطلب</label>

            {/* الصف الأول: المحافظة ونوع الطلب (Province and Request Type) */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              <div className="flex flex-col">
                <label
                  htmlFor="branch_id"
                  className="text-gray-700 text-right mb-1"
                >
                  المحافظة <span className="text-red-500">*</span>
                </label>
                <select
                  id="branch_id"
                  name="branch_id"
                  className="item-input w-full placeholder-gray-500 placeholder-italic"
                  onChange={handleChange}
                  value={formData.request.branch_id}
                >
                  <option value="">اختر المحافظة</option>{" "}
                  {/* النجمة تم نقلها إلى الـ label */}
                  {provinces.map((gov, i) => (
                    <option key={i} value={gov.id}>
                      {gov.branch_name}
                    </option>
                  ))}
                </select>
                {errors.branch_id && (
                  <p
                    dir="rtl"
                    className="mt-1 text-red-800 bg-red-100 p-2 rounded-lg border border-red-300 text-sm font-semibold shadow-sm flex items-center justify-start"
                  >
                    {errors.branch_id}
                    <svg
                      className="w-4 h-4 mr-2 text-red-600 flex-shrink-0"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                      ></path>
                    </svg>
                  </p>
                )}
              </div>
              <div className="flex flex-col">
                <label
                  htmlFor="request_type_id"
                  className="text-gray-700 text-right mb-1"
                >
                  نوع الطلب <span className="text-red-500">*</span>
                </label>
                <select
                  id="request_type_id"
                  name="request_type_id"
                  className="item-input w-full placeholder-gray-500 placeholder-italic"
                  onChange={handleChange}
                  value={formData.request.request_type_id}
                >
                  <option value="">اختر نوع الطلب</option>{" "}
                  {/* النجمة تم نقلها إلى الـ label */}
                  {requestTypes.map((type) => (
                    <option key={type.id} value={type.id}>
                      {type.type_name}
                    </option>
                  ))}
                </select>
                {errors.request_type_id && (
                  <p
                    dir="rtl"
                    className="mt-1 text-red-800 bg-red-100 p-2 rounded-lg border border-red-300 text-sm font-semibold shadow-sm flex items-center justify-start"
                  >
                    {errors.request_type_id}
                    <svg
                      className="w-4 h-4 mr-2 text-red-600 flex-shrink-0"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                      ></path>
                    </svg>
                  </p>
                )}
              </div>
            </div>

            {/* جهة العمل (تظهر فقط عند اختيار الشكوى أو البلاغ) (Concerned Entities - shows for Complaint or Report) */}
            {showAttachments && (
              <>
                <p className="mb-6 text-gray-700 font-medium font-ibm-arabic col-span-full">
                  عند اختيار الشكوى او البلاغ ضد الجهاز الفرعي نؤكد بانه سيتم
                  توجيه الطلب الى المركزية لمتابعة الموضوع والسرية التامة في
                  العمل
                </p>
                <div className="grid grid-cols-1 gap-4 mb-4">
                  <div className="flex flex-col col-span-full">
                    <label
                      htmlFor="concerned_entities"
                      className="text-gray-700 text-right mb-1"
                    >
                      الجهة المقصودة <span className="text-red-500">*</span>
                    </label>
                    <select
                      id="concerned_entities"
                      name="concerned_entities"
                      className="item-input w-full placeholder-gray-500 placeholder-italic"
                      onChange={handleChange}
                      value={formData.request.concerned_entities}
                    >
                      <option value="">اختر الجهة المقصودة</option>{" "}
                      {/* النجمة تم نقلها إلى الـ label */}
                      <option value="الجهاز المركزي">الجهاز</option>
                      <option value="غير ذلك">غير ذلك</option>
                    </select>
                    {errors.concerned_entities && (
                      <p
                        dir="rtl"
                        className="mt-1 text-red-800 bg-red-100 p-2 rounded-lg border border-red-300 text-sm font-semibold shadow-sm flex items-center justify-start"
                      >
                        {errors.concerned_entities}
                        <svg
                          className="w-4 h-4 mr-2 text-red-600 flex-shrink-0"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                          xmlns="http://www.w3.org/2000/svg"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth="2"
                            d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                          ></path>
                        </svg>
                      </p>
                    )}
                  </div>
                </div>
              </>
            )}

            {/* الوصف (Description) */}
            <div className="grid grid-cols-1 gap-4 mb-4">
              <div className="flex flex-col col-span-full">
                <label
                  htmlFor="description"
                  className="text-gray-700 text-right mb-1"
                >
                  وصف الطلب <span className="text-red-500">*</span>
                </label>
                <textarea
                  id="description"
                  name="description"
                  className="item-textarea h-[200px] w-full placeholder-gray-500 placeholder-italic"
                  placeholder="أدخل وصف الطلب"
                  onChange={handleChange}
                  value={formData.request.description}
                ></textarea>
                {errors.description && (
                  <p
                    dir="rtl"
                    className="mt-1 text-red-800 bg-red-100 p-2 rounded-lg border border-red-300 text-sm font-semibold shadow-sm flex items-center justify-start"
                  >
                    {errors.description}
                    <svg
                      className="w-4 h-4 mr-2 text-red-600 flex-shrink-0"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                      ></path>
                    </svg>
                  </p>
                )}
              </div>
            </div>

            {/* المرفقات (Attachments) */}
            {showAttachments && (
              <div className="grid grid-cols-1 gap-4 mb-4">
                <div className="flex flex-col col-span-full">
                  <label
                    htmlFor="attachments"
                    className="text-gray-700 text-right mb-1"
                  >
                    المرفقات <span className="text-red-500">*</span> (مطلوبة
                    للشكاوى والبلاغات)
                  </label>
                  <input
                    id="attachments"
                    className="item-input w-full placeholder-gray-500 placeholder-italic"
                    type="file"
                    name="attachments"
                    ref={fileRef}
                    multiple
                    onChange={handleFilesChange}
                  />
                  {errors.attachments && (
                    <p
                      dir="rtl"
                      className="mt-1 text-red-800 bg-red-100 p-2 rounded-lg border border-red-300 text-sm font-semibold shadow-sm flex items-center justify-start"
                    >
                      {errors.attachments}
                      <svg
                        className="w-4 h-4 mr-2 text-red-600 flex-shrink-0"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                        xmlns="http://www.w3.org/2000/svg"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth="2"
                          d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                        ></path>
                      </svg>
                    </p>
                  )}
                </div>
              </div>
            )}
          </div>
          {/* زر الإرسال (Submit Button) */}
          <div className="group-item col-span-full flex justify-center">
            <button type="submit" className="text-black px-6 py-2 rounded">
              إرسال
            </button>
          </div>
        </form>

        {/* عرض رسائل النجاح/الخطأ العامة تحت الفورم */}
        {globalNotification.message && (
          <p
            dir="rtl"
            className={`mt-6 mb-4 p-3 rounded-lg border text-base font-semibold shadow-sm flex items-center justify-center w-full max-w-4xl mx-auto
              ${
                globalNotification.type === "success"
                  ? "text-green-800 bg-green-100 border-green-300"
                  : "text-red-800 bg-red-100 border-red-300"
              }`}
          >
            <svg
              className={`w-5 h-5 ml-2 flex-shrink-0 ${
                globalNotification.type === "success"
                  ? "text-green-600"
                  : "text-red-600"
              }`}
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
            >
              {globalNotification.type === "success" ? (
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                ></path>
              ) : (
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                ></path>
              )}
            </svg>
            {globalNotification.message}
          </p>
        )}

        {/* Pop-up لرمز التتبع (يظهر بعد الإرسال الناجح) (Tracking Code Pop-up - displays after successful submission) */}
        {showPopup && (
          <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center">
            <div className="bg-white rounded-lg p-6 shadow-xl w-[90%] max-w-sm text-center relative">
              <h2 className="text-lg font-bold text-green-700 mb-4">
                تم استلام الشكوى
              </h2>
              <p className="text-sm text-gray-700">رمز التتبع الخاص بك:</p>
              <div className="text-base font-mono bg-gray-100 px-4 py-2 rounded border mt-2">
                {trackingCode}
              </div>

              <div className="flex justify-center my-4">
                <QRCodeCanvas value={trackingCode} size={160} />
              </div>

              <button
                onClick={() => navigator.clipboard.writeText(trackingCode)}
                className="text-sm text-blue-600 hover:underline mb-4"
              >
                نسخ رمز التتبع
              </button>

              <button
                onClick={() => setShowPopup(false)}
                className="mt-4 bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-4 rounded"
              >
                إغلاق
              </button>
            </div>
          </div>
        )}
      </main>
      <Footer />
    </div>
  );
}
