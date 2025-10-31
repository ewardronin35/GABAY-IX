import * as React from "react";
import {
    Pagination as ShadPagination,
    PaginationContent,
    PaginationItem,
    PaginationLink,
    PaginationPrevious,
    PaginationNext,
    PaginationEllipsis,
// --- FIX: Corrected the relative path to your shadcn component ---
} from "./pagination"; 

interface ClientPaginationProps {
    currentPage: number;
    totalPages: number;
    onPageChange: (page: number) => void;
}

export function ClientPagination({ 
    currentPage, 
    totalPages, 
    onPageChange 
}: ClientPaginationProps) {
    if (totalPages <= 1) return null; // Don't show pagination if 1 page

    const handlePrevious = (e: React.MouseEvent) => {
        e.preventDefault();
        onPageChange(Math.max(1, currentPage - 1));
    };

    const handleNext = (e: React.MouseEvent) => {
        e.preventDefault();
        onPageChange(Math.min(totalPages, currentPage + 1));
    };

    const handlePageClick = (e: React.MouseEvent, page: number) => {
        e.preventDefault();
        onPageChange(page);
    };

    // --- Simple pagination logic (you can make this more complex) ---
    // Let's just show all page numbers for simplicity
    const pageNumbers = Array.from({ length: totalPages }, (_, i) => i + 1);
    // ---

    return (
        <ShadPagination className="mt-4">
            <PaginationContent>
                {/* Previous Button */}
                <PaginationItem>
                    <PaginationPrevious
                        href="#"
                        onClick={handlePrevious}
                        className={currentPage === 1 ? "pointer-events-none opacity-50" : ""}
                    />
                </PaginationItem>

                {/* Numbered Page Links */}
                {pageNumbers.map((page) => (
                    <PaginationItem key={page}>
                        <PaginationLink
                            href="#"
                            // --- FIX: Added type to the event parameter 'e' ---
                            onClick={(e: React.MouseEvent) => handlePageClick(e, page)}
                            isActive={currentPage === page}
                        >
                            {page}
                        </PaginationLink>
                    </PaginationItem>
                ))}

                {/* Next Button */}
                <PaginationItem>
                    <PaginationNext
                        href="#"
                        onClick={handleNext}
                        className={currentPage === totalPages ? "pointer-events-none opacity-50" : ""}
                    />
                </PaginationItem>
            </PaginationContent>
        </ShadPagination>
    );
}