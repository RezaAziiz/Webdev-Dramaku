import React, { useMemo, useState } from "react";
import Cms from "../components/cms";
import UsersTable from "../components/cms/UsersTable";
import UsersPagination from "../components/cms/UsersPagination";
import { useCmsUsers } from "../hooks/useCmsUsers";
import { filterUsersByPrefix, paginateUsers } from "../lib/cms";

const ITEMS_PER_PAGE = 10;

const Users = () => {
  const {
    users,
    sortColumn,
    sortOrder,
    handleSort,
    changeRoleToAdmin,
    banUser,
  } = useCmsUsers();
  const [currentPage, setCurrentPage] = useState(1);
  const [searchQuery, setSearchQuery] = useState("");

  const filteredUsers = useMemo(
    () => filterUsersByPrefix(users, searchQuery),
    [users, searchQuery],
  );
  const {
    totalPages,
    startIndex,
    items: currentUsers,
  } = useMemo(
    () => paginateUsers(filteredUsers, currentPage, ITEMS_PER_PAGE),
    [filteredUsers, currentPage],
  );

  return (
    <Cms activePage="users">
      <div className="w-full p-4 mb-5 max-w-full mx-auto">
        <div className="flex justify-end mb-10">
          <input
            type="text"
            placeholder="Search user..."
            onChange={(event) => {
              setSearchQuery(event.target.value);
              setCurrentPage(1);
            }}
            className="p-1 rounded-md bg-gray-100 text-black focus:outline-none w-1/5"
          />
        </div>
        <UsersTable
          users={currentUsers}
          startIndex={startIndex}
          sortColumn={sortColumn}
          sortOrder={sortOrder}
          onSort={handleSort}
          onChangeRole={changeRoleToAdmin}
          onBan={banUser}
        />
        <UsersPagination
          currentPage={currentPage}
          totalPages={totalPages}
          onFirst={() => setCurrentPage(1)}
          onPrev={() => setCurrentPage((page) => Math.max(page - 1, 1))}
          onNext={() =>
            setCurrentPage((page) => Math.min(page + 1, totalPages))
          }
          onLast={() => setCurrentPage(totalPages)}
        />
      </div>
    </Cms>
  );
};

export default Users;
