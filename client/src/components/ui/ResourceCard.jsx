import { useState, useEffect } from "react";
import { useUser } from "../../context/userContext";
import Button from "./Button";
import { Icon } from "@iconify/react";

function ResourceCard({ title, subject, fileUrl, uploadedBy }) {
  const { student } = useUser();
  const [open, setOpen] = useState(false);

  const previewUrl = fileUrl
    ? fileUrl.replace("/upload/", "/upload/f_jpg,pg_1/")
    : null;

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

  return (
    <>
      <div onClick={() => setOpen(true)} className="bg-white border border-gray-200 rounded-xl overflow-hidden cursor-pointer hover:shadow-md transition flex flex-col">
        <div className="h-40 bg-gray-100 border-b border-gray-200 flex items-center justify-center overflow-hidden">
          {previewUrl ? (
            <img src={previewUrl} alt={title} className="w-full h-full object-cover" />
          ) : (
            <p className="text-gray-400 text-xs">No preview</p>
          )}
        </div>
        <div className="p-4 flex flex-col gap-1">
          <p className="text-xs text-gray-500">{subject}</p>
          <p className="font-semibold text-md leading-tight">{title}</p>
          <p className="text-xs text-gray-400">{uploadedBy}</p>
        </div>
      </div>

      {open && (
        <div className="fixed inset-0 z-50 bg-black/70 flex items-center justify-center" onClick={() => setOpen(false)}>
          <div className="bg-white rounded-xl overflow-hidden w-[40vw] h-[90vh] flex flex-col" onClick={(e) => e.stopPropagation()}>
            <div className="flex justify-between items-center p-4 border-b">
              <div>
                <p className="font-semibold">{title}</p>
                <p className="text-xs text-gray-400">{subject} · {uploadedBy}</p>
              </div>
              <Button
                onClick={() => setOpen(false)}
                bgColor="bg-transparent"
                typography="text-gray-400 hover:text-gray-600"
                padding="p-1"
                dimensions="rounded-md"
                animation="active:scale-95 transition-all duration-100"
                text={<Icon icon="mdi:close" className="text-xl" />}
              />
            </div>
            <div className="w-full flex-1 overflow-y-auto flex flex-col items-center bg-gray-100 p-4 gap-4">
              {[1, 2, 3, 4, 5].map((page) => (
                <img
                  key={page}
                  src={fileUrl.replace("/upload/", `/upload/f_jpg,pg_${page - 1}/`)}
                  alt={`Page ${page}`}
                  className="w-full rounded shadow"
                  onError={(e) => (e.target.style.display = "none")}
                />
              ))}
            </div>
          </div>
        </div>
      )}
    </>
  );
}

export default ResourceCard;