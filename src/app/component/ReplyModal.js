"use client";

import { useEffect, useState } from "react";
import { Dialog } from "@headlessui/react";
import { addData, fetchData } from "../utils/apiHelper";
import { m } from "framer-motion";
import toast from "react-hot-toast";

export default function ReplyModal({ isOpen, onClose, requestId }) {
  const [replyText, setReplyText] = useState("");
  const [files, setFiles] = useState([]);
  const [previousReplies, setPreviousReplies] = useState([]);
  const [systemAttachments, setSystemAttachments] = useState([]);
  useEffect(() => {
    if (requestId) {
      fetchReplies();
    }
  }, [requestId]);
  const fetchReplies = async () => {
    try {
      const res = await fetchData(`/requests/${requestId}`);
      console.log(res.data);

      setPreviousReplies(res.data.trackings ?? []);
      setSystemAttachments(res.data.system_attachments ?? []);
    } catch (err) {
      console.error("فشل في جلب البيانات", err);
    }
  };

  const handleFileChange = (e) => {
    if (e.target.files) {
      setFiles(Array.from(e.target.files));
    }
  };

  const handleSubmit = async () => {
    if (replyText) {
      await addData("/trakings", {
        request_id: requestId,
        comment: replyText,
      });
      toast.success("تم إرسال الرد بنحاح");
      fetchReplies();
    }
    if (files) {
      await addData(`/systemFiles/${requestId}`, {
        systemFiles: files,
      });
      toast.success("تم إرسال الملف بنحاح");
      fetchReplies();
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
          className="mb-4 block"
        />

        <button
          onClick={handleSubmit}
          className="bg-green-600 text-white px-4 py-2 rounded mb-6"
        >
          إرسال الرد
        </button>

        <h3 className="text-lg font-semibold mb-2">الردود السابقة</h3>
        <table className="w-full text-sm border">
          <thead>
            <tr className="bg-gray-100 text-right">
              <th className="p-2 border">الرد</th>
              <th className="p-2 border">التاريخ</th>
              <th className="p-2 border">تم بواسطة</th>
            </tr>
          </thead>
          <tbody>
            {previousReplies.map((reply) => (
              <tr key={reply.id}>
                <td className="p-2 border">{reply.comment}</td>
                <td className="p-2 border">{reply.created_at}</td>
                <td className="p-2 border">
                  {reply.updated_by?.name ?? "غير معروف"}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        <h3 className="text-lg font-semibold mt-6 mb-2">الملفات المرفقة</h3>
        <ul className="list-disc pr-5 space-y-1">
          {systemAttachments.length > 0 ? (
            systemAttachments.map((file, idx) => (
              <li key={idx}>
                <a
                  href={file.file_path}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-600 underline"
                >
                  {file.original_name ?? `ملف ${idx + 1}`}
                </a>
              </li>
            ))
          ) : (
            <li className="text-gray-500">لا يوجد ملفات مرفقة.</li>
          )}
        </ul>
      </div>
    </Dialog>
  );
}
