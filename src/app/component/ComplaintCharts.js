"use client";

import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  Legend,
  ResponsiveContainer,
} from "recharts";
import { useEffect, useState } from "react";
import { fetchData, fetchDataAuth } from "../utils/apiHelper";

const complaintsByStatus = [
  { name: "قيد المعالجة", value: 40 },
  { name: "تم الحل", value: 40 },
  { name: "عاجلة", value: 60 },
  { name: "معلقة", value: 60 },
];

const COLORS = ["#8884d8", "#82ca9d", "#ffc658", "#ff8042"];

export default function ComplaintCharts() {
  const [complaintsPerMonth, setComplaintsPerMonth] = useState([]);
  const [complaintsByStatus, setcomplaintsByStatus] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchComplaints = async () => {
      try {
        const data = await fetchDataAuth("/requests/complaints-per-month");
        console.log(data);
        
        setComplaintsPerMonth(data);
      } catch (err) {
        console.error("فشل في جلب بيانات الشكاوى:", err);
      } finally {
        setLoading(false);
      }
    };
    const fetchcomplaintsByStatus = async () => {
      try {
        const data = await fetchDataAuth("/requests/count");
        console.log(data);
        
        setcomplaintsByStatus(data.data);
      } catch (err) {
        console.error("فشل في جلب بيانات الشكاوى:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchComplaints();
    fetchcomplaintsByStatus();
  }, []);

  if (loading) {
    return <div className="text-center py-10 text-gray-500">جاري تحميل البيانات...</div>;
  }

  return (
    <div className="p-6 space-y-10">
      <h2 className="text-xl font-bold text-center">إحصائيات الشكاوى</h2>

      <div className="bg-white p-4 rounded shadow w-full">
        <h3 className="text-lg mb-2">عدد الشكاوى شهرياً (مخطط خطي)</h3>
        <div className="w-full h-80">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={complaintsPerMonth}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" />
              <YAxis />
              <Tooltip />
              <Line type="monotone" dataKey="count" stroke="#8884d8" />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="bg-white p-4 rounded shadow w-full">
        <h3 className="text-lg mb-2">عدد الشكاوى شهرياً (أعمدة)</h3>
        <div className="w-full h-80">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={complaintsPerMonth}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="count" fill="#82ca9d" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="bg-white p-4 rounded shadow mt-6 w-fit mx-auto">
        <h3 className="text-lg mb-2">حالة الشكاوى</h3>
        <PieChart width={400} height={300}>
          <Pie
            data={complaintsByStatus}
            cx="50%"
            cy="50%"
            labelLine={false}
            label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
            outerRadius={100}
            fill="#8884d8"
            dataKey="value"
          >
            {complaintsByStatus.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
            ))}
          </Pie>
          <Legend />
        </PieChart>
      </div>
    </div>
  );
}
