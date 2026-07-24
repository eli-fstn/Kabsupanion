import Button from "./Button";
import { Icon } from "@iconify/react";

function Pagination({ currentPage, totalPages, onPageChange }) {
  if (totalPages <= 1) return null;

  const getPageNumbers = () => {
    const pages = [];
    const delta = 1; // how many neighbors to show around currentPage

    const start = Math.max(2, currentPage - delta);
    const end = Math.min(totalPages - 1, currentPage + delta);

    pages.push(1);
    if (start > 2) pages.push("ellipsis-start");
    for (let i = start; i <= end; i++) pages.push(i);
    if (end < totalPages - 1) pages.push("ellipsis-end");
    if (totalPages > 1) pages.push(totalPages);

    return pages;
  };

  const pageNumbers = getPageNumbers();

  return (
    <div className="flex flex-col justify-center items-center mt-4">
      <div className="flex gap-1 items-center">
        <Button
          text={
            <span className="text-xs flex flex-row font-medium items-center">
              <Icon icon="mdi:chevron-left" className="text-lg" />
              Previous
            </span>
            }
          onClick={() => onPageChange(Math.max(currentPage - 1, 1))}
          disabled={currentPage === 1}
          bgColor={currentPage === 1 ? "bg-gray-100" : "bg-white"}
          typography={currentPage === 1 ? "text-gray-300" : "text-gray-600"}
          padding="px-2 py-1"
          dimensions="rounded-md border border-gray-200"
          animation="active:scale-95 transition-all duration-100"
        />

        {pageNumbers.map((page, idx) =>
          typeof page === "number" ? (
            <Button
              key={page}
              text={page}
              onClick={() => onPageChange(page)}
              bgColor={currentPage === page ? "bg-[#1B651B]" : "bg-white"}
              typography={
                currentPage === page
                  ? "text-white font-bold text-xs"
                  : "text-gray-600 text-xs"
              }
              padding="px-2.5 py-1"
              dimensions="rounded-md border border-gray-200"
              animation="active:scale-95 transition-all duration-100"
            />
          ) : (
            <span key={page + idx} className="px-1 text-gray-300 text-xs">
              …
            </span>
          )
        )}

        <Button
          text={
            <span className="text-xs flex flex-row font-medium items-center">
              Next
              <Icon icon="mdi:chevron-right" className="text-lg" />
            </span>
            }
          onClick={() => onPageChange(Math.min(currentPage + 1, totalPages))}
          disabled={currentPage === totalPages}
          bgColor={currentPage === totalPages ? "bg-gray-100" : "bg-white"}
          typography={currentPage === totalPages ? "text-gray-300" : "text-gray-600"}
          padding="px-2 py-1"
          dimensions="rounded-md border border-gray-200"
          animation="active:scale-95 transition-all duration-100"
        />
      </div>
    </div>
  );
}

export default Pagination;