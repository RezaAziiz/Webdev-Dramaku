import React from "react";
import { formatDate } from "../../lib/cms";

const UsersTable = ({
  users,
  startIndex,
  sortColumn,
  sortOrder,
  onSort,
  onChangeRole,
  onBan,
}) => (
  <table className="w-full text-left border-collapse p-4 mb-5 max-w-full mx-auto">
    <thead className="bg-gray-800 text-white">
      <tr>
        <th style={{ width: "100px" }} className="px-4 py-3">
          ID
        </th>
        <th style={{ width: "150px" }} className="px-4 py-3">
          Username
          <button onClick={() => onSort("username")} className="ml-2 text-xs">
            {sortColumn === "username" && sortOrder === "asc" ? "▲" : "▼"}
          </button>
        </th>
        <th style={{ width: "200px" }} className="px-4 py-3">
          Email
        </th>
        <th style={{ width: "150px" }} className="px-4 py-3 text-center">
          Role
        </th>
        <th style={{ width: "200px" }} className="px-4 py-3 text-center">
          Created At
          <button onClick={() => onSort("created_at")} className="ml-2 text-xs">
            {sortColumn === "created_at" && sortOrder === "asc" ? "▲" : "▼"}
          </button>
        </th>
        <th style={{ width: "100px" }} className="px-4 py-3"></th>
        <th
          style={{ width: "100px" }}
          className="py-3 text-center"
          colSpan="2"
        >
          Actions
        </th>
      </tr>
    </thead>
    <tbody>
      {users.map((user, index) => (
        <tr key={user.id} className="bg-white">
          <td className="py-3 px-4 border-b border-gray-300 text-gray-800">
            {startIndex + index + 1}
          </td>
          <td className="py-3 px-4 border-b border-gray-300 text-gray-800">
            {user.username}
          </td>
          <td className="py-3 px-4 border-b border-gray-300 text-gray-800">
            {user.email}
          </td>
          <td className="py-3 px-4 border-b border-gray-300 text-gray-800 text-center">
            {user.role_id}
          </td>
          <td className="py-3 px-4 border-b border-gray-300 text-gray-800 text-center">
            {formatDate(user.created_at)}
          </td>
          <td className="py-3 px-4 border-b border-gray-300 text-gray-800"></td>
          <td className="py-3 px-4 border-b border-gray-300 text-gray-800 text-center">
            <button
              className="bg-blue-500 text-white px-2 py-1 rounded-md hover:bg-blue-600"
              onClick={() => onChangeRole(user.username)}
            >
              To Admin
            </button>
            <button
              className="bg-red-500 text-white px-2 py-1 rounded-md hover:bg-red-600 ml-2"
              onClick={() => onBan(user.username)}
            >
              Banned
            </button>
          </td>
        </tr>
      ))}
    </tbody>
  </table>
);

export default UsersTable;
