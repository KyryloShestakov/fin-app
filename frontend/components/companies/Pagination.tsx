type PaginationProps = {
    total: number;
    limit: number;
    offset: number;
    onPageChange: (page: number) => void;
};

export default function Pagination({
                                       total,
                                       limit,
                                       offset,
                                       onPageChange,
                                   }: PaginationProps) {
    const currentPage = Math.floor(offset / limit) + 1;
    const totalPages = Math.max(1, Math.ceil(total / limit));

    if (total === 0) {
        return null;
    }

    const start = offset + 1;
    const end = Math.min(offset + limit, total);

    return (
        <div className="pagination">
            <div className="pagination-info">
                Showing <strong>{start}</strong>–<strong>{end}</strong> of{" "}
                <strong>{total.toLocaleString()}</strong>
            </div>

            <div className="pagination-controls">
                <button
                    className="pagination-button"
                    disabled={currentPage === 1}
                    onClick={() => onPageChange(currentPage - 1)}
                >
                    ←
                </button>

                <div className="pagination-page">
                    {currentPage} / {totalPages}
                </div>

                <button
                    className="pagination-button"
                    disabled={currentPage === totalPages}
                    onClick={() => onPageChange(currentPage + 1)}
                >
                    →
                </button>
            </div>
        </div>
    );
}