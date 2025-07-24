"use client";
import dynamic from 'next/dynamic';
import React, { useEffect, useState } from "react";
import { fetchData, addData, updateData, deleteData, setBaseUrl } from "../utils/apiHelper";
import 'aos/dist/aos.css';
import AOS from 'aos';
import "./Content.css"
 

const Content = ({ menuId, submenuId }) => {
  const [data, setData] = useState([]);
  useEffect(() => {
    AOS.init({
      duration: 1000,
      easing: 'ease-in-out',
      once: false,
    });
  }, [menuId]);
  useEffect(() => {
    if (submenuId) {
      getAllData();
    } else {
      getData();
    }
  }, [menuId, submenuId]);
  // جلب البيانات
  const getAllData = async () => {
    try {
      const result = await fetchData(`/service-details-sections-of/${submenuId}`);
      setData(result);
      console.log(result);

    } catch (error) {
      console.error("Failed to fetch data:", error);
    }
  };
  const getData = async () => {
    try {
      const result = await fetchData(`/citizen-service-type-details-of/${menuId}`);
      setData(result);
      console.log(result);

    } catch (error) {
      console.error("Failed to fetch data:", error);
    }
  };

  if (!menuId) {
    return(
    <div className="content-page" style={{ flex: 1, padding: "10px" }}>
      <p>اختر قائمة لعرض محتواها</p>
    </div>);
  }

  return (
    <div className="content-page" style={{ flex: 1, padding: "10px" }}>
      <div className="flex flex-wrap justify-center">
        {data.map((item, index) => (
          <div className="m-4 w-full sm:w-1/2 md:w-1/4 rounded-3xl" key={index}>
            <a  target="_blank" rel="noopener noreferrer" href={`${process.env.NEXT_PUBLIC_IMAGE_BASE_URL}${item.PDFLink}`} className="block w-full p-6 text-center card" >
              <div className="" >
                <p className="text-white">{submenuId ? item.ServiceDetailSection : item.ServiceTypeDetail}</p>
              </div>
            </a>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Content;
