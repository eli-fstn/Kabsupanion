import { useState, useEffect } from "react";
import { useUser } from "../../context/userContext";
import Button from "./Button";
import { Icon } from "@iconify/react";

function ResourceCard({ title, subject, fileUrl, uploadedBy }) {
  const { student } = useUser();
  const [open, setOpen] = useState(false);
  const [pages, setPages] = useState([1]);

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

  const extension = fileUrl?.split(".").pop()?.toLowerCase();

  const isPdf = extension === "pdf";
  const isImage = ["png", "jpg", "jpeg", "webp"].includes(extension);
  const isDocx = extension === "docx";
  const isPptx = extension === "pptx";

  const toPageUrl = (url, page) =>
    url
      .replace("/upload/", `/upload/f_jpg,pg_${page}/`)
      .replace(".pdf", ".jpg");

  let previewUrl = null;

  if (isPdf) {
    previewUrl = toPageUrl(fileUrl, 1);
  } else if (isImage) {
    previewUrl = fileUrl;
  }

  const handleClose = () => {
    setOpen(false);
    setPages([1]);
  };

  const handlePageLoad = (page) => {
    setPages((prev) =>
      prev.includes(page + 1) ? prev : [...prev, page + 1]
    );
  };

  return (
    <>
      <div
        onClick={() => setOpen(true)}
        className="bg-white border border-gray-200 rounded-xl overflow-hidden cursor-pointer hover:shadow-md transition flex flex-col h-full"
      >
        <div className="h-32 sm:h-36 md:h-40 bg-gray-100 border-b border-gray-200 flex items-center justify-center overflow-hidden shrink-0">
          {isPdf && (
            <img
              src={previewUrl}
              alt={title}
              className="w-full h-full object-cover"
            />
          )}

          {isImage && (
            <img
              src={fileUrl}
              alt={title}
              className="w-full h-full object-cover"
            />
          )}

          {isDocx && (
            <div className="flex flex-col items-center justify-center">
              <Icon icon="vscode-icons:file-type-word" className="text-6xl" />
              <p className="text-xs mt-2">Word Document</p>
            </div>
          )}

          {isPptx && (
            <div className="flex flex-col items-center justify-center">
              <Icon icon="vscode-icons:file-type-powerpoint" className="text-6xl" />
              <p className="text-xs mt-2">PowerPoint</p>
            </div>
          )}
        </div>
        <div className="p-3 sm:p-4 flex flex-col gap-1 min-w-0">
          <p className="text-xs text-gray-500 truncate">{subject}</p>
          <p className="font-semibold text-sm sm:text-base leading-tight line-clamp-1">{title}</p>
          <p className="text-xs text-gray-400 truncate">{uploadedBy}</p>
        </div>
      </div>

      {open && (
        <div
          className="fixed inset-0 z-50 bg-black/70 flex items-center justify-center p-3 sm:p-6"
          onClick={handleClose}
        >
          <div
            className="bg-white rounded-xl overflow-hidden w-full max-w-md sm:max-w-lg md:max-w-2xl lg:max-w-3xl h-[85vh] sm:h-[88vh] md:h-[90vh] flex flex-col"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex justify-between items-start sm:items-center gap-3 p-3 sm:p-4 border-b">
              <div className="min-w-0">
                <p className="font-semibold text-sm sm:text-base truncate">{title}</p>
                <p className="text-xs text-gray-400 truncate">{subject} · {uploadedBy}</p>
              </div>
              <Button
                onClick={handleClose}
                bgColor="bg-transparent"
                typography="text-gray-400 hover:text-gray-600"
                padding="p-1"
                dimensions="rounded-md shrink-0"
                animation="active:scale-95 transition-all duration-100"
                text={<Icon icon="mdi:close" className="text-2xl" />}
              />
            </div>
            <div className="w-full flex-1 overflow-y-auto flex flex-col items-center bg-gray-100 p-2 sm:p-4 gap-3 sm:gap-4">
              {isPdf &&
                pages.map((page) => (
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

              {isImage && (
                <img
                  src={fileUrl}
                  alt={title}
                  className="max-w-full rounded shadow"
                />
              )}

              {(isDocx || isPptx) && (
                <iframe
                  src={`https://view.officeapps.live.com/op/embed.aspx?src=${encodeURIComponent(fileUrl)}`}
                  className="w-full h-full"
                  title={title}
                />
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
}

export default ResourceCard;