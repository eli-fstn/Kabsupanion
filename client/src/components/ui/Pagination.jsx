import Button from "./Button";
import { Icon } from "@iconify/react";

function Pagination({ currentPage, totalPages, onPageChange }) {
  if (totalPages <= 1) return null;

  return (
    <div className="flex justify-between items-center mt-4">
      <p className="text-xs text-gray-400">
        Page {currentPage} of {totalPages}
      </p>
      <div className="flex gap-2">
        <Button
          text={<Icon icon="mdi:chevron-left" className="text-lg" />}
          onClick={() => onPageChange((p) => Math.max(p - 1, 1))}
          disabled={currentPage === 1}
          bgColor={currentPage === 1 ? "bg-gray-100" : "bg-white"}
          typography={currentPage === 1 ? "text-gray-300" : "text-gray-600"}
          padding="px-2 py-1"
          dimensions="rounded-md border border-gray-200"
          animation="active:scale-95 transition-all duration-100"
        />
        <Button
          text={<Icon icon="mdi:chevron-right" className="text-lg" />}
          onClick={() => onPageChange((p) => Math.min(p + 1, totalPages))}
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