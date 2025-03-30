import React from "react";
import { LeftPagination, RightPagination } from "@/components/icons";
import { PaginationButton } from "@/components/common/PaginationButton";

interface PaginationProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
}

export default function Pagination3({
  currentPage,
  totalPages,
  onPageChange,
}: PaginationProps) {
  const getPaginationRange = () => {
    const totalNumbers = 5; // max buttons (excluding prev/next)
    const totalBlocks = totalNumbers + 2; // including first and last

    if (totalPages <= totalBlocks) {
      return Array.from({ length: totalPages }, (_, i) => i + 1);
    }

    const leftSibling = Math.max(currentPage - 1, 2);
    const rightSibling = Math.min(currentPage + 1, totalPages - 1);

    const showLeftDots = leftSibling > 2;
    const showRightDots = rightSibling < totalPages - 1;

    const pages: (number | string)[] = [1];

    if (showLeftDots) pages.push("...");
    for (let i = leftSibling; i <= rightSibling; i++) pages.push(i);
    if (showRightDots) pages.push("...");

    pages.push(totalPages);
    return pages;
  };

  return (
    <div className="bg-white py-0 text-center dark:bg-dark">
      <div className="mb-0 inline-flex justify-center rounded bg-white p-3 shadow-[0px_1px_3px_0px_rgba(0,0,0,0.13)] dark:bg-dark-2">
        <ul className="inline-flex overflow-hidden rounded-lg border border-stroke dark:border-white/5">
          <li>
            <PaginationButton
              onClick={() => onPageChange(currentPage - 1)}
              disabled={currentPage === 1}
            >
              <LeftPagination />
            </PaginationButton>
          </li>

          {getPaginationRange().map((page, idx) => (
            <li key={idx}>
              {typeof page === "string" ? (
                <span className="flex h-10 min-w-10 items-center justify-center border-r border-stroke px-2 text-base font-medium text-dark dark:text-white">
                  ...
                </span>
              ) : (
                <PaginationButton
                  key={page}
                  onClick={() => onPageChange(page)}
                  isActive={page === currentPage}
                >
                  {page}
                </PaginationButton>
              )}
            </li>
          ))}

          <li>
            <PaginationButton
              onClick={() => onPageChange(currentPage + 1)}
              disabled={currentPage === totalPages}
            >
              <RightPagination />
            </PaginationButton>
          </li>
        </ul>
      </div>
    </div>
  );
}
