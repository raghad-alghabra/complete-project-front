'use client';

import { Dialog } from '@headlessui/react';
import { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import { checkUserRole, fetchData } from '../../utils/apiHelper';
import logofull from '../../../images/logofull.jpg'
import Image from 'next/image';
import dynamic from 'next/dynamic';

const DownloadPDF = dynamic(() => import('../../component/DownloadPDF'), {
  ssr: false,
});

export default function Reportts() {
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [isViewOpen, setIsViewOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState(null);
  const [filterGovernorate, setFilterGovernorate] = useState();
  const [provinces, setprovinces] = useState([]);
  const [data, setData] = useState([]);
  const [pagination, setPagination] = useState({ current_page: 1, last_page: 1 });

  const loadRequests = async (page = 1) => {
    try {
      let endpoint = '';
      if (checkUserRole('المدير العام')) {
        endpoint = `/requests?request_type=1&page=${page}`;
      } else if (
        checkUserRole('مدير الفرع') ||
        checkUserRole('مدير العلاقات العامة') ||
        checkUserRole('الدائرة المركزية')
      ) {
        const branch = localStorage.getItem('branch');
        endpoint = `/requests?request_type=1&branch=${branch}&page=${page}`;
      } else {
        endpoint = `/requests?request_type=0&page=${page}`;
      }

      const dummyData = await fetchData(endpoint);
      console.log(dummyData.data);
      setData(dummyData.data);
      setPagination({ current_page: dummyData.current_page, last_page: dummyData.last_page });

      const response2 = await fetchData('branches/withoutPaginate');
      setprovinces(response2.data);
    } catch (error) {
      console.error('خطأ أثناء جلب الطلبات:', error);
    }
  };

  useEffect(() => {
    loadRequests();
  }, []);

  const formatDate = (dateString) => {
    const options = { year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit', hour12: true };
    return new Date(dateString).toLocaleDateString('ar-EG', options);
  };

  const handleDeleteConfirm = (item) => {
    setSelectedItem(item);
    setIsDeleteOpen(true);
  };

  const handleDelete = () => {
    if (!selectedItem) return;
    setData((prev) => prev.filter((item) => item.id !== selectedItem.id));
    setIsDeleteOpen(false);
    toast.error('تم حذف الشكوى');
  };

  const handleStatusChange = (id, newStatus) => {
    setData((prev) =>
      prev.map((item) => (item.id === id ? { ...item, status: newStatus } : item))
    );
    toast.success('تم تغيير الحالة');
  };

  const filteredData = filterGovernorate
    ? data.filter((item) => item.branch_id == filterGovernorate)
    : data;

  const handlePageChange = (page) => {
    loadRequests(page);
  };

  return (
    <div className="flex flex-col items-center justify-start min-h-[70vh] p-4">
      <h2 className="text-xl font-bold mb-4">عرض البلاغات</h2>
      <div className="mb-4 w-full max-w-3xl">
        <select className="w-full p-2 border rounded" onChange={(e) => setFilterGovernorate(e.target.value)} value={filterGovernorate}>
          <option value="">عرض جميع البلاغات</option>
          {provinces.map((gov, i) => <option key={i} value={gov.id}>{gov.branch_name}</option>)}
        </select>
      </div>
      <div className="flex justify-center items-center w-full overflow-x-auto">
        <div className="w-full max-w-6xl overflow-x-auto">
          <table className="bg-white shadow-md rounded-lg w-full table-fixed">
            <thead className="bg-[#3da67e] text-white font-bold sticky top-0 z-10">
              <tr>
                <th className="px-4 py-2">#</th>
                <th className="px-4 py-2">الوصف</th>
                <th className="px-4 py-2">التصنيف</th>
                <th className="px-4 py-2">المحافظة</th>
                <th className="px-4 py-2">النوع</th>
                <th className="px-4 py-2">التاريخ</th>
                <th className="px-4 py-2">الحالة</th>
                <th className="px-4 py-2">الوكيل</th>
                <th className="px-4 py-2">الجهة</th>
                <th className="px-4 py-2">تم الاستلام</th>
                <th className="px-4 py-2">الإجراءات</th>
              </tr>
            </thead>
          </table>
          <div className="max-h-[400px] overflow-y-auto">
            <table className="w-full table-fixed">
              <tbody>
                {filteredData.map((item, index) => (
                  <tr key={index} className="border-b hover:bg-gray-100 transition-all">
                    <td className="px-4 py-2 text-center">{index + 1}</td>
                    <td className="px-4 py-2 text-center">{item.description.slice(0, 30)}...</td>
                    <td className="px-4 py-2 text-center">{item.category.category_name}</td>
                    <td className="px-4 py-2 text-center">{item.branch.branch_name}</td>
                    <td className="px-4 py-2 text-center">{item.request_type.type_name}</td>
                    <td className="px-4 py-2 text-center">{formatDate(item.created_at)}</td>
                    <td className="px-4 py-2 text-center">
                      <select value={item.request_status} onChange={(e) => handleStatusChange(item.id, e.target.value)} className="border p-1 rounded">
                        <option value={1}>جديدة</option>
                        <option value={2}>قيد المعالجة</option>
                        <option value={3}>تم الحل</option>
                      </select>
                    </td>
                    <td className="px-4 py-2 text-center">{item.user.name}</td>
                    <td className="px-4 py-2 text-center">{item.concerned_entities}</td>
                    <td className="px-4 py-2 text-center">
                      {item.is_received == 0
                        ? <p className='text-[#e1767a]'>غير مستلم</p>
                        : <p className='text-[#55dea9]'>تم الاستلام</p>}
                    </td>
                    <td className="px-4 py-2 text-center flex justify-center gap-2">
                      <button className="bg-gradient-to-t from-[#296f55] to-[#55dea9] text-white px-2 py-1 rounded" onClick={() => { setSelectedItem(item); setIsViewOpen(true); }}>تفاصيل</button>
                      <button className="bg-gradient-to-t from-[#6e292b] to-[#e1767a] text-white px-2 py-1 rounded" onClick={() => handleDeleteConfirm(item)}>حذف</button>
                    </td>
                  </tr>
                ))}
                {filteredData.length === 0 && (
                  <tr>
                    <td colSpan={8} className="text-center py-6 text-gray-500">لا توجد طلبات</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      <div className="mt-4 flex gap-2">
        {Array.from({ length: pagination.last_page }, (_, i) => i + 1).map((pageNum) => (
          <button
            key={pageNum}
            onClick={() => handlePageChange(pageNum)}
            className={`px-3 py-1 rounded ${pagination.current_page === pageNum ? 'bg-green-600 text-white' : 'bg-gray-200'}`}
          >
            {pageNum}
          </button>
        ))}
      </div>
      {/* نافذة عرض التفاصيل */}
      <Dialog open={isViewOpen} onClose={() => setIsViewOpen(false)} className="relative z-50">
        <div className="fixed inset-0 bg-black/30" aria-hidden="true" />
        <div className="fixed inset-0 flex items-center justify-center p-4">
          <Dialog.Panel className="bg-white p-6 rounded-lg shadow-lg w-full max-w-md">
            <Dialog.Title className="text-lg font-bold mb-2">تفاصيل الشكوى</Dialog.Title>

            {selectedItem && (
              <div id="pdf-content" className="text-right space-y-2">
                <div className="flex justify-between items-center border-b pb-2 mb-4">
                  <div className="text-right text-sm leading-snug">
                    <p>الجمهورية العربية السورية</p>
                    <p>الجهاز المركزي للرقابة المالية</p>
                  </div>
                  <div className="flex-shrink-0">
                    <Image className='scale-125 mx-4' src={logofull} alt="logo" width={80} height={80} />
                  </div>
                  <div className="text-left text-sm leading-snug">
                    <p>Syrian Arab Republic</p>
                    <p>Central Organization For Financial Control</p>
                  </div>
                </div>
                <p><strong>الوصف:</strong> {selectedItem.description}</p>
                <p><strong>المحافظة:</strong> {selectedItem.branch.branch_name}</p>
                <p><strong>التصنيف:</strong> {selectedItem.category.category_name}</p>
                <p><strong>النوع:</strong> {selectedItem.request_type.type_name}</p>
                <p><strong>التاريخ:</strong> {formatDate(selectedItem.created_at)}</p>
                <p><strong>الحالة:</strong> {selectedItem.request_status.status_name}</p>
              </div>
            )}

            <div className="mt-4 flex justify-between">
              {selectedItem && <DownloadPDF selectedItem={selectedItem} />}
              <button onClick={() => setIsViewOpen(false)} className="bg-gray-500 text-white px-4 py-2 rounded">إغلاق</button>
            </div>
          </Dialog.Panel>
        </div>
      </Dialog>

      {/* نافذة تأكيد الحذف */}
      <Dialog open={isDeleteOpen} onClose={() => setIsDeleteOpen(false)} className="relative z-50">
        <div className="fixed inset-0 bg-black/30" aria-hidden="true" />
        <div className="fixed inset-0 flex items-center justify-center">
          <Dialog.Panel className="bg-white p-6 rounded-lg shadow-lg w-96">
            <Dialog.Title className="text-lg font-bold">تأكيد الحذف</Dialog.Title>
            <p className="mt-4">هل أنت متأكد من حذف هذه الشكوى؟</p>
            <div className="mt-6 flex justify-end gap-2">
              <button onClick={() => setIsDeleteOpen(false)} className="bg-gray-500 text-white px-4 py-2 rounded">إلغاء</button>
              <button onClick={handleDelete} className="bg-gradient-to-t from-[#6e292b] to-[#e1767a] text-white px-4 py-2 rounded">حذف</button>
            </div>
          </Dialog.Panel>
        </div>
      </Dialog>
    </div>
  );
}
