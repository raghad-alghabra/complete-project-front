// app/context/SettingsContext.js
"use client";

import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
} from "react";

const SettingsContext = createContext(undefined);

export const SettingsProvider = ({ children }) => {
  const [settings, setSettings] = useState({
    email: "",
    phone: "",
    address: "",
    copyright: "",
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchSettings = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      // التأكد من أن مسار الـ API صحيح وأن الخادم يعمل
      const response = await fetch("/api/show", { cache: "no-store" });

      if (!response.ok) {
        // إذا لم تكن الاستجابة 200 OK، حاول قراءة الرسالة من الـ body إذا كانت موجودة
        const errorData = await response.json().catch(() => ({
          message: "Failed to fetch settings (non-JSON response)",
        }));
        throw new Error(
          errorData.message || `HTTP error! status: ${response.status}`
        );
      }

      const result = await response.json();

      // تأكد أن بنية البيانات المستلمة مطابقة لما تتوقعه
      const processedData = {
        email: result.data?.email || "", // استخدام ?. للتأكد من وجود data
        phone: result.data?.phone || "",
        address: result.data?.address || "",
        copyright: result.data?.copyright_text || "", // هذا هو الاسم الذي يأتيك من الـ Backend
      };
      setSettings(processedData);
    } catch (err) {
      console.error("Error fetching settings in context:", err);
      setError(err.message || "Failed to load settings.");
      // يمكنك هنا تعيين إعدادات افتراضية في حالة الفشل
      setSettings({
        email: "info@example.com",
        phone: "+963-000-0000",
        address: "Damascus, Syria",
        copyright: "© 2024 Your Organization. All rights reserved.",
      });
    } finally {
      setLoading(false);
    }
  }, []); // لا توجد تبعيات، الدالة ثابتة

  useEffect(() => {
    fetchSettings();
  }, [fetchSettings]); // يتم استدعاء fetchSettings مرة واحدة عند تحميل المزود

  const value = { settings, loading, error, fetchSettings };

  return (
    <SettingsContext.Provider value={value}>
      {children}
    </SettingsContext.Provider>
  );
};

export const useSettings = () => {
  const context = useContext(SettingsContext);
  if (context === undefined) {
    throw new Error("useSettings must be used within a SettingsProvider");
  }
  return context;
};
