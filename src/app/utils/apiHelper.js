import axios from "axios";
import CryptoJS from "crypto-js";
import toast from "react-hot-toast";

const SECRET_KEY = "19494490304";

// تأكد من أن الـ API_URL ينتهي بـ /api/
// إذا كان متغير البيئة NEXT_PUBLIC_API_URL لا يتضمن /api/، سيتم إضافته هنا.
let API_BASE_URL = process.env.NEXT_PUBLIC_API_URL;
if (API_BASE_URL && !API_BASE_URL.endsWith("/api/")) {
  // نضيف /api/ فقط إذا لم يكن موجوداً
  if (API_BASE_URL.endsWith("/")) {
    API_BASE_URL += "api/";
  } else {
    API_BASE_URL += "/api/";
  }
}
// إذا كان متغير البيئة فارغاً، يمكن تعيين قيمة افتراضية هنا
if (!API_BASE_URL) {
  API_BASE_URL = "http://localhost:8000/api/"; // قيمة افتراضية آمنة
}

// لغرض التحقق، سنقوم بطباعة القيمة النهائية لـ baseURL
console.log("Actual API Base URL used by Axios:", API_BASE_URL);

function encryptData(data) {
  return CryptoJS.AES.encrypt(data, SECRET_KEY).toString();
}

function decryptData(encryptedData) {
  try {
    const bytes = CryptoJS.AES.decrypt(encryptedData, SECRET_KEY);
    return bytes.toString(CryptoJS.enc.Utf8);
  } catch (e) {
    return null;
  }
}

export function storeUserRole(roleName) {
  const encrypted = encryptData(roleName);
  localStorage.setItem("role", encrypted);
}

export function checkUserRole(role) {
  if (typeof window === "undefined") return false;
  const encrypted = localStorage.getItem("role");
  if (!encrypted) return false;
  const decrypted = decryptData(encrypted);
  return decrypted === role;
}

export const getCookie = (name) => {
  if (typeof document === "undefined") return null;
  const match = document.cookie.match(new RegExp("(^| )" + name + "=([^;]+)"));
  if (match) return match[2];
  return null;
};

const apiClient = axios.create({
  baseURL: API_BASE_URL, // استخدام المتغير الجديد هنا
  headers: {
    "Content-Type": "application/json",
    Accept: "application/json",
  },
});

apiClient.interceptors.request.use(
  (config) => {
    const authToken = getCookie("authToken");
    if (authToken) {
      config.headers.Authorization = `Bearer ${authToken}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

export const fetchData = async (url) => {
  try {
    const response = await apiClient.get(url);
    return response.data;
  } catch (error) {
    console.error(
      "Error fetching data:",
      error.response?.data || error.message
    );
    throw error;
  }
};

export const fetchDataAuth = async (url) => {
  try {
    // إزالة Content-Type: multipart/form-data من هنا لـ GET requests
    // لأنها لا تستخدم لطلبات الجلب، وقد تسبب مشاكل
    const headers = {
      Accept: "application/json",
    };
    const response = await apiClient.get(url, { headers });
    return response.data;
  } catch (error) {
    console.error(
      "Error fetching data:",
      error.response?.data || error.message
    );
    throw error;
  }
};

export const addData = async (url, data, isFormData = false) => {
  try {
    let headers = {
      Accept: "application/json",
    };
    if (isFormData) {
      headers["Content-Type"] = "multipart/form-data";
    } else {
      headers["Content-Type"] = "application/json";
    }

    const response = await apiClient.post(url, data, { headers });
    return response.data;
  } catch (error) {
    console.error("Error adding data:", error.response?.data || error.message);
    throw error;
  }
};

export const UpData = async (url, data) => {
  try {
    const headers = {
      "Content-Type": "application/json",
      Accept: "application/json",
    };
    const response = await apiClient.patch(url, data, { headers });
    return response.data;
  } catch (error) {
    console.error(
      "Error updating data:",
      error.response?.data || error.message
    );
    throw error;
  }
};

export const PutData = async (url, data) => {
  try {
    const headers = {
      "Content-Type": "application/json",
      Accept: "application/json",
    };
    const response = await apiClient.put(url, data, { headers });
    return response.data;
  } catch (error) {
    console.error(
      "Error updating data:",
      error.response?.data || error.message
    );
    throw error;
  }
};

export const deleteData = async (url) => {
  try {
    const response = await apiClient.delete(url);
    return response.data;
  } catch (error) {
    console.error(
      "Error deleting data:",
      error.response?.data || error.message
    );
    throw error;
  }
};

export const setBaseUrl = (url) => {
  apiClient.defaults.baseURL = url;
};
