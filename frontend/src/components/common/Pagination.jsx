import { ChevronLeft, ChevronRight, Settings2 } from "lucide-react";
import Button from "./Button";

export default function Pagination({
  currentPage,
  totalPages,
  onPageChange,
  pageSize,
  onPageSizeChange,
  pageSizeOptions = [9, 18, 27, 50],
}) {
  if (totalPages <= 1 && (!pageSizeOptions || pageSizeOptions.length === 0)) return null;

  const pages = [];
  // For simplicity, showing all pages if totalPages is small,
  // else we could implement a more complex sliding window logic.
  let startPage = Math.max(1, currentPage - 2);
  let endPage = Math.min(totalPages, currentPage + 2);

  if (startPage > 1) {
    pages.push(1);
    if (startPage > 2) pages.push("...");
  }
  for (let i = startPage; i <= endPage; i++) {
    pages.push(i);
  }
  if (endPage < totalPages) {
    if (endPage < totalPages - 1) pages.push("...");
    pages.push(totalPages);
  }

  return (
    <div className="flex flex-col sm:flex-row items-center justify-between mt-6 fade-in gap-4">
      {/* Page Size Selector */}
      {onPageSizeChange && (
        <div className="flex items-center gap-2 text-sm opacity-70">
          <Settings2 className="w-4 h-4" />
          <span>Show:</span>
          <select
            className="select select-bordered select-xs w-20"
            value={pageSize}
            onChange={(e) => onPageSizeChange(Number(e.target.value))}
          >
            {pageSizeOptions.map((opt) => (
              <option key={opt} value={opt}>
                {opt}
              </option>
            ))}
          </select>
        </div>
      )}

      {/* Pages */}
      <div className="flex items-center space-x-2">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => onPageChange(currentPage - 1)}
          disabled={currentPage === 1}
        >
          <ChevronLeft className="w-4 h-4" />
        </Button>

      {pages.map((page, index) => {
        if (page === "...") {
          return (
            <span key={`dots-${index}`} className="opacity-50 px-2">
              ...
            </span>
          );
        }
        return (
          <Button
            key={index}
            variant={page === currentPage ? "primary" : "ghost"}
            size="sm"
            onClick={() => typeof page === 'number' ? onPageChange(page) : null}
            disabled={page === "..."}
          >
            {page}
          </Button>
        );
      })}

        <Button
          variant="ghost"
          size="sm"
          onClick={() => onPageChange(currentPage + 1)}
          disabled={currentPage === totalPages}
        >
          <ChevronRight className="w-4 h-4" />
        </Button>
      </div>
    </div>
  );
}
