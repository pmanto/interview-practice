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
        <div className="pagination">
            <button onClick={handlePrevious}>Previous</button>
            <span>Page {currentPage} of {totalPages}</span>
            <button onClick={handleNext}>Next</button>
        </div>
    );
}