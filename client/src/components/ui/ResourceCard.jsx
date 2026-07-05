import { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import { useUser } from "../../context/userContext";
import Button from "./Button";
import { Icon } from "@iconify/react";
import jsPDF from "jspdf";

function ResourceCard({ title, subject, fileUrl, uploadedBy }) {
  const { student } = useUser();
  const [open, setOpen] = useState(false);
  const [pages, setPages] = useState([1]);
  const [downloading, setDownloading] = useState(false);

  useEffect(() => {
    if (open) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  const DOCUMENT_EXTENSIONS = ["pdf", "docx", "pptx", "doc", "ppt"];
  const IMAGE_EXTENSIONS = ["png", "jpg", "jpeg"];

  const getExtension = (url) => {
    if (!url) return "";
    const clean = url.split("?")[0].split("#")[0];
    return clean.split(".").pop().toLowerCase();
  };

  const fileExtension = getExtension(fileUrl);
  const isDocument = DOCUMENT_EXTENSIONS.includes(fileExtension);
  const isImage = IMAGE_EXTENSIONS.includes(fileExtension);

  const toPageUrl = (url, page) => {
    if (!isDocument) return url;
    return url
      .replace("/upload/", `/upload/f_jpg,pg_${page}/`)
      .replace(/\.(pdf|docx|pptx|doc|ppt)$/i, ".jpg");
  };

  const previewUrl = fileUrl ? toPageUrl(fileUrl, 1) : null;

  const handleClose = () => {
    setOpen(false);
    setPages([1]);
  };

  const handlePageLoad = (page) => {
    if (!isDocument) return;
    setPages((prev) =>
      prev.includes(page + 1) ? prev : [...prev, page + 1]
    );
  };

  const handleDownload = async () => {
    if (!fileUrl) return;

    if (isDocument) {
      setDownloading(true);
      try {
        const pageImages = [];
        let page = 1;

        while (true) {
          const res = await fetch(toPageUrl(fileUrl, page));
          if (!res.ok) break;

          const blob = await res.blob();
          const dataUrl = await new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = () => resolve(reader.result);
            reader.onerror = reject;
            reader.readAsDataURL(blob);
          });
          const { w, h } = await new Promise((resolve) => {
            const img = new Image();
            img.onload = () => resolve({ w: img.width, h: img.height });
            img.src = dataUrl;
          });

          pageImages.push({ dataUrl, w, h });
          page++;
        }

        if (pageImages.length === 0) throw new Error("No pages found");

        const pdf = new jsPDF({
          unit: "px",
          format: [pageImages[0].w, pageImages[0].h],
        });

        pageImages.forEach((img, i) => {
          if (i > 0) pdf.addPage([img.w, img.h]);
          pdf.addImage(img.dataUrl, "JPEG", 0, 0, img.w, img.h);
        });

        pdf.save(title.toLowerCase().endsWith(".pdf") ? title : `${title}.pdf`);
      } catch (error) {
        console.log(error);
      } finally {
        setDownloading(false);
      }
      return;
    }

    const downloadUrl = fileUrl.replace(
      "/upload/",
      `/upload/fl_attachment:${encodeURIComponent(title)}/`
    );
    const link = document.createElement("a");
    link.href = downloadUrl;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <>
      <div
        onClick={() => setOpen(true)}
        className="bg-white dark:bg-[#1a1a1a] border border-gray-200 dark:border-[#444444] rounded-xl overflow-hidden cursor-pointer hover:shadow-md dark:hover:shadow-black/40 duration-300 ease-out hover:-translate-y-1 hover:border-[#7a7a7a] transition flex flex-col h-full"
      >
        <div className="h-36 md:h-40 bg-gray-100 dark:bg-[#1a1a1a] border-b border-gray-200 dark:border-[#1a1a1a] flex items-center justify-center overflow-hidden shrink-0">
          {previewUrl ? (
            <img src={previewUrl} alt={title} className="w-full h-full object-cover" />
          ) : (
            <p className="text-gray-400 dark:text-[#E0E0E0] text-xs">No preview</p>
          )}
        </div>
        <div className="p-3 sm:p-4 flex flex-col gap-1 min-w-0">
          <p className="text-xs text-gray-500 dark:text-gray-400 truncate">{subject}</p>
          <p className="font-semibold text-sm sm:text-base leading-tight line-clamp-1 text-gray-900 dark:text-gray-100">{title}</p>
          <p className="text-xs text-gray-400 dark:text-[#E0E0E0] truncate">{uploadedBy}</p>
        </div>
      </div>

      {open && createPortal(
        <div
          className="fixed inset-0 z-50 bg-black/70 dark:bg-black/80 flex items-center justify-center p-3 sm:p-6"
          onClick={handleClose}
        >
          <div
            className="bg-white dark:bg-[#1a1a1a] rounded-xl overflow-hidden w-full max-w-md sm:max-w-lg md:max-w-2xl lg:max-w-3xl h-[85vh] sm:h-[88vh] md:h-[90vh] flex flex-col"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex justify-between items-start sm:items-center gap-3 p-3 sm:p-4 border-b border-gray-200 dark:border-[#1a1a1a]">
              <div className="min-w-0">
                <p className="font-semibold text-sm sm:text-base truncate text-gray-900 dark:text-gray-100">{title}</p>
                <p className="text-xs text-gray-400 dark:text-[#E0E0E0] truncate">{subject} · {uploadedBy}</p>
              </div>
              <Button
                onClick={handleClose}
                bgColor="bg-transparent"
                typography="text-gray-400 dark:text-[#E0E0E0] hover:text-gray-600 dark:hover:text-white"
                padding="p-1"
                dimensions="rounded-md shrink-0"
                animation="active:scale-95 transition-all duration-100"
                text={<Icon icon="mdi:close" className="text-2xl" />}
              />
            </div>
            <div className="w-full flex-1 overflow-y-auto flex flex-col items-center bg-gray-100 dark:bg-[#121212] p-2 sm:p-4 gap-3 sm:gap-4">
              {pages.map((page) => (
                <img
                  key={page}
                  src={toPageUrl(fileUrl, page)}
                  alt={`Page ${page}`}
                  className="w-full rounded shadow"
                  onLoad={() => handlePageLoad(page)}
                  onError={(e) => {
                    e.target.style.display = "none";
                  }}
                />
              ))}
            </div>
            <div className="flex items-center justify-center my-3">
              <Button
                text="Download"
                onClick={handleDownload}
                disabled={downloading}
                bgColor="bg-[#1B651B]"
                typography="text-white font-bold text-xs whitespace-nowrap"
                padding="px-4 py-2"
                dimensions="w-fit rounded-md"
                animation="active:scale-95 transition-all duration-100 hover:bg-[#288a28]"
              />
            </div>
          </div>
        </div>,
        document.body
      )}
    </>
  );
}

export default ResourceCard;