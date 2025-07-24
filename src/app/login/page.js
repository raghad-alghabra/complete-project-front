"use client";
import React, { useEffect } from "react";
import "./style.css";
import logo from "../../images/logob1.png";
import Image from "next/image";
import "aos/dist/aos.css";
import AOS from "aos";
import { useState } from "react";
import { useRouter } from "next/navigation";
import toast, { Toaster } from "react-hot-toast";
import CryptoJS from "crypto-js";
import { env } from "process";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const SECRET_KEY = "19494490304";
  const API_URL = process.env.NEXT_PUBLIC_API_URL;

  // دالة التشفير
  function encryptData(data) {
    return CryptoJS.AES.encrypt(data, SECRET_KEY).toString();
  }

  const handleSubmit = async (e) => {
    e.preventDefault();

    console.log(JSON.stringify({ email, password }));
    setLoading(true); // تعطيل الزر
    try {
      const res = await fetch(API_URL + "login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });
      console.log(res);

      if (res.ok) {
        const data = await res.json();
        console.log(data);
        // تشفير وتخزين في localStorage
        const encrypted = encryptData(data.user.role.role_name);
        localStorage.setItem("role", encrypted);
        localStorage.setItem("branch", data.user.branch.id);
        localStorage.setItem("id", data.user.id);
        document.cookie = `authToken=${data.authorisation.token}; path=/; max-age=86400;`;
        router.push("/Dashboard");
        toast.success("تم تسجيل الدخول بنجاح");
        toast("أهلاً بك: " + data.user.name);
      } else {
        const error = await res.json();
        setError(error.message || "حدث خطأ");
        toast.error(error.error);
        console.log(error);
      }
    } catch (err) {
      console.error("Error:", err);
      setError("حدث خطأ أثناء تسجيل الدخول");
    } finally {
      setLoading(false); // إعادة تمكين الزر
    }
  };

  useEffect(() => {
    AOS.init({
      duration: 500,
      easing: "ease-in-out",
      once: true,
    });
  }, []);

  return (
    <div className="body-login">
      <Toaster position="bottom-center" />
      <div
        data-aos="fade-left"
        className="p-6 up-form flex justify-center items-center flex-col bg-white rounded shadow-lg w-96 h-[100vh]"
      >
        <Image className="p-4" src={logo} alt="logo" data-aos="fade" />
        <h2
          className="my-4 text-2xl font-bold text-center text-[#3da67e]"
          data-aos="fade"
        >
          تسجيل الدخول
        </h2>
        <form className="p-4 w-full" data-aos="fade" onSubmit={handleSubmit}>
          <div className="mb-4">
            {error && <p className="text-red-500">{error}</p>}
            <input
              type="email"
              id="email"
              className="input-form focus:outline-none focus:ring-2 focus:ring-[#3da67e]"
              placeholder="أدخل بريدك الإلكتروني"
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>
          <div className="mb-4">
            <input
              type="password"
              id="password"
              className="input-form focus:outline-none focus:ring-2 focus:ring-[#3da67e]"
              placeholder="أدخل كلمة المرور"
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>
          <button
            type="submit"
            className="btn-login disabled:opacity-50"
            disabled={loading}
          >
            {loading ? "جاري التحقق..." : "تسجيل الدخول"}
          </button>
        </form>
      </div>
    </div>
  );
}
