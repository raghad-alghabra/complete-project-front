'use client';
import { useState } from 'react';
import html2pdf from 'html2pdf.js';

export default function DownloadPDF({ selectedItem }) {
  const [loading, setLoading] = useState(false);

  const handleDownload = async () => {
    try {
      setLoading(true);
      console.log('Selected item:', selectedItem);

      // 1. Generate local PDF
      const element = document.getElementById('pdf-content');
      const opt = {
        margin: 0.5,
        filename: `complaint-details-${selectedItem.id}.pdf`,
        image: { type: 'jpeg', quality: 0.98 },
        html2canvas: { scale: 2 },
        jsPDF: { unit: 'in', format: 'a4', orientation: 'portrait' },
      };
      await html2pdf().set(opt).from(element).save();

      // 2. Fetch attachments from server
      const response = await fetch(`https://test.cofc-sy.com/api/requests/attachments/by-id/${selectedItem.id}`);
      const json = await response.json();
      const attachments = json.data;
      console.log(attachments);
      

      // 3. Download each attachment
      for (const attachment of attachments) {
        const link = document.createElement('a');
        link.href = attachment.file_url;
        link.download = attachment.file_url.split('/').pop(); // Extract file name
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
      }
    } catch (error) {
      console.error('Download failed:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <button
      onClick={handleDownload}
      className="bg-gradient-to-t from-[#296f55] to-[#55dea9] text-white px-4 py-2 rounded disabled:opacity-50"
      disabled={loading}
    >
      {loading ? 'جارٍ التحميل...' : 'تحميل PDF والمرفقات'}
    </button>
  );
}
