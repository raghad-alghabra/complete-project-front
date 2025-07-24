// app/page.js
"use client";
import Image from "next/image";
import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import Slider from "react-slick";
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";
import Navbar from "./component/navbar";
import Footer from "./component/Footer"; // تأكد من المسار الصحيح لمكون Footer
import { FaChevronLeft, FaChevronRight } from "react-icons/fa";

// هذا السطر يضمن أن الصفحة لا تُخزّن مؤقتًا وتُعرض دائمًا بأحدث البيانات
export const dynamic = "force-dynamic";

// مكون السهم التالي (اليمين)
function SampleNextArrow(props) {
  const { className, onClick } = props;
  return (
    <div className={`${className} arrow-next`} onClick={onClick}>
      <FaChevronRight size={20} color="white" />
    </div>
  );
}

// مكون السهم السابق (الشمال)
function SamplePrevArrow(props) {
  const { className, onClick } = props;
  return (
    <div className={`${className} arrow-prev`} onClick={onClick}>
      <FaChevronLeft size={20} color="white" />
    </div>
  );
}

export default function LandingPage() {
  const [stats, setStats] = useState({
    complaints: 0,
    requests: 0,
    visitors: 0,
  });
  const [target, setTarget] = useState({
    complaints: 0,
    requests: 0,
    visitors: 0,
  });
  const [loading, setLoading] = useState(true);
  const API_URL = process.env.NEXT_PUBLIC_PUBLIC_API_URL;

  useEffect(() => {
    fetchStats();
  }, []);

  useEffect(() => {
    if (!loading) {
      const interval = setInterval(() => {
        setStats((prev) => {
          const updated = { ...prev };
          let done = true;

          for (let key in target) {
            if (updated[key] < target[key]) {
              updated[key] += Math.ceil((target[key] - updated[key]) / 10);
              done = false;
            }
          }

          if (done) clearInterval(interval);
          return updated;
        });
      }, 80);
      return () => clearInterval(interval);
    }
  }, [target, loading]);

  const fetchStats = async () => {
    try {
      const [requestsRes, complaintsRes, resolvedRes] = await Promise.all([
        fetch(API_URL + "/requests/total"),
        fetch(API_URL + "/requests/complaints/count"),
        fetch(API_URL + "/requests/resolved/count"),
      ]);

      const requestsData = await requestsRes.json();
      const complaintsData = await complaintsRes.json();
      const resolvedData = await resolvedRes.json();

      setTarget({
        complaints: complaintsData.complaints_count || 0,
        requests: requestsData.total_requests || 0,
        visitors: resolvedData.Resolved_count || 0,
      });
    } catch (error) {
      console.error("Error fetching stats:", error);
    } finally {
      setLoading(false);
    }
  };
  const slides = [
    {
      image: "/slider/1.jpg",
      title: "معاً لمكافحة الفساد الإداري والمالي",
      description:
        "ساهم بتقديم شكوى أو بلاغ لمساعدتنا في تعزيز النزاهة والشفافية.",
      buttonText: "قدّم شكوى الآن",
      buttonUrl: "/complaints",
    },
    {
      image: "/slider/3.jpg",
      title: "صوتك يحدث فرقاً",
      description: "نستقبل شكواك وتظلماتك بسرية تامة وبمتابعة دقيقة.",
      buttonText: "ابدأ الآن",
      buttonUrl: "/submit",
    },
    {
      image: "/slider/4.jpg",
      title: "لنحتفل بالموظف النزيه",
      description: "يمكنك إرسال رسالة شكر لمن قدم أداءً مميزاً.",
      buttonText: "أرسل ثناء",
      buttonUrl: "/praise",
    },
    {
      image: "/slider/5.jpg",
      title: "خصوصيتك أولويتنا",
      description: "كل البلاغات والبيانات تعامل بسرية تامة.",
      buttonText: "اقرأ عن الخصوصية",
      buttonUrl: "/privacy",
    },
    {
      image: "/slider/7.jpg",
      title: "رقابة فعالة لخدمة أفضل",
      description: "نعمل بجد لحماية المال العام وتحسين الأداء الإداري.",
      buttonText: "تعرّف على مهامنا",
      buttonUrl: "/about",
    },
  ];

  const sliderSettings = {
    dots: true,
    infinite: true,
    speed: 500,
    slidesToShow: 1,
    slidesToScroll: 1,
    autoplay: true,
    autoplaySpeed: 3000,
    arrows: true,
    nextArrow: <SampleNextArrow />,
    prevArrow: <SamplePrevArrow />,
  };

  if (loading) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-transparent">
        <div className="animate-spin rounded-full h-20 w-20 border-t-2 border-b-2 border-[#3da67e]"></div>
      </div>
    );
  }

  return (
    <>
      <Navbar />
      <div className="font-sans bg-gray-100">
        <div className="relative h-[95vh]">
          <Slider {...sliderSettings}>
            {slides.map((slide, index) => (
              <div key={index} className="h-[95vh] w-full relative">
                <Image
                  src={slide.image}
                  layout="fill"
                  objectFit="cover"
                  alt={`slider-${index}`}
                  className="brightness-[0.6]"
                />
                <div className="absolute inset-0 flex flex-col items-center justify-center text-center px-4">
                  <h2 className="text-4xl md:text-5xl font-bold text-white mb-4">
                    {slide.title}
                  </h2>
                  <p className="text-lg md:text-xl text-white mb-6 max-w-2xl">
                    {slide.description}
                  </p>
                  <a
                    href={slide.buttonUrl}
                    className="bg-gradient-to-t from-[#296f55] to-[#55dea9] text-white px-6 py-3 rounded-xl text-lg transition duration-300"
                  >
                    {slide.buttonText}
                  </a>
                </div>
              </div>
            ))}
          </Slider>
        </div>

        <div className="bg-gray-100 py-2 px-4 text-sm font-medium overflow-hidden whitespace-nowrap">
          <marquee behavior="scroll" direction="right">
            📰 خبر 1 - خبر 2 - خبر 3 - تابع آخر المستجدات هنا
          </marquee>
        </div>

        <div className="py-10 bg-[#3da67e] text-white text-center">
          <h2 className="text-2xl font-bold mb-6">إحصائيات المنصة</h2>
          <div className="flex justify-center gap-10 flex-wrap">
            <StatCard label="عدد الشكاوى" value={stats.complaints} />
            <StatCard label="عدد الطلبات" value={stats.requests} />
            <StatCard label="الطلبات المنتهية" value={stats.visitors} />
          </div>
        </div>
        {/* Services Section */}
        <div className="py-10 bg-gray-50 text-center">
          <h2 className="text-2xl font-bold mb-6">الخدمات المقدمة</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6 px-4 md:px-20">
            <div className="bg-white p-6 rounded-xl shadow">
              <h3 className="text-lg font-semibold text-[#3da67e] mb-2">
                شكاوى المواطنين
              </h3>
              <p className="text-sm text-gray-600">
                تتيح هذه الخدمة للمواطنين تقديم الشكاوى المتعلقة بالخدمات العامة
                أو التجاوزات الإدارية بشكل سهل وآمن، ليتم النظر فيها من قبل
                الجهات المختصة.
              </p>
            </div>

            <div className="bg-white p-6 rounded-xl shadow">
              <h3 className="text-lg font-semibold text-[#3da67e] mb-2">
                طلبات خدمية
              </h3>
              <p className="text-sm text-gray-600">
                يمكن من خلال هذه الخدمة تقديم طلبات متعلقة بالحصول على خدمات
                إدارية أو تنظيمية مثل الصيانة، التوثيق، إصدار الأوراق الرسمية
                وغيرها.
              </p>
            </div>

            <div className="bg-white p-6 rounded-xl shadow">
              <h3 className="text-lg font-semibold text-[#3da67e] mb-2">
                استشارات قانونية
              </h3>
              <p className="text-sm text-gray-600">
                توفر هذه الخدمة إمكانية التواصل مع مختصين للحصول على استشارات
                قانونية تتعلق بالشكاوى أو المعاملات الإدارية لضمان حقوق
                المواطنين.
              </p>
            </div>
          </div>
        </div>
      </div>
      {/* هنا لا نمرر أي props، الفوتر سيجلب بياناته بنفسه */}
      <Footer />
    </>
  );
}

function StatCard({ label, value }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="bg-white text-[#3da67e] w-40 h-40 rounded-full flex flex-col items-center justify-center text-xl font-bold shadow"
    >
      <div>{value}</div>
      <div className="text-sm mt-1">{label}</div>
    </motion.div>
  );
}
