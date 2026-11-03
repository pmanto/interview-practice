interface PaginationProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
}

export default function Paginatior({currentPage, totalPages, onPageChange}:PaginationProps) {    
    function handlePrevious(){
        if(currentPage > 1){
            onPageChange(currentPage - 1);
        }
    }

    function handleNext(){
        if(currentPage < totalPages){
            onPageChange(currentPage + 1);
        }
    }

    return (
        <nav className="pagination" aria-label="Pagination">
            <button type="button" onClick={handlePrevious} disabled={currentPage <= 1}>Previous</button>
            <span aria-live="polite">Page {currentPage} of {totalPages}</span>
            <button type="button" onClick={handleNext} disabled={currentPage >= totalPages}>Next</button>
        </nav>
    );
}