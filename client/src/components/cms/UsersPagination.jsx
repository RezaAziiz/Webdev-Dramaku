import React from "react";

const UsersPagination = ({
  currentPage,
  totalPages,
  onFirst,
  onPrev,
  onNext,
  onLast,
}) => (
  <div className="flex justify-center space-x-2 mt-4">
    <button
      className="p-2 bg-gray-200 text-black rounded-md hover:bg-gray-100 font-bold"
      onClick={onFirst}
      disabled={currentPage === 1}
    >
      {"<<"}
    </button>
    <button
      className="p-2 bg-gray-200 text-black rounded-md hover:bg-gray-100 font-bold"
      onClick={onPrev}
      disabled={currentPage === 1}
    >
      {"<"}
    </button>
    <span className="flex items-center">
      {currentPage} of {totalPages}
    </span>
    <button
      className="p-2 bg-gray-200 text-black rounded-md hover:bg-gray-100 font-bold"
      onClick={onNext}
      disabled={currentPage === totalPages}
    >
      {">"}
    </button>
    <button
      className="p-2 bg-gray-200 text-black rounded-md hover:bg-gray-100 font-bold"
      onClick={onLast}
      disabled={currentPage === totalPages}
    >
      {">>"}
    </button>
  </div>
);

export default UsersPagination;
