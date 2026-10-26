import { useCallback, useEffect, useState } from "react";
import { apiUrl } from "../config/api";
import { sortUsersBy } from "../lib/cms";

export const useCmsUsers = () => {
  const [users, setUsers] = useState([]);
  const [sortOrder, setSortOrder] = useState("asc");
  const [sortColumn, setSortColumn] = useState("username");

  useEffect(() => {
    let current = true;

    const fetchUsers = async () => {
      try {
        const response = await fetch(apiUrl("/api/users"));
        if (!response.ok) {
          throw new Error("Network response was not ok");
        }
        const usersData = await response.json();
        if (current) {
          setUsers(Array.isArray(usersData) ? usersData : []);
        }
      } catch (error) {
        console.error("Failed to fetch users:", error);
      }
    };

    fetchUsers();

    return () => {
      current = false;
    };
  }, []);

  const handleSort = useCallback(
    (column) => {
      const nextOrder =
        sortColumn === column && sortOrder === "asc" ? "desc" : "asc";
      setUsers((currentUsers) => sortUsersBy(currentUsers, column, nextOrder));
      setSortOrder(nextOrder);
      setSortColumn(column);
    },
    [sortColumn, sortOrder],
  );

  const changeRoleToAdmin = useCallback(async (username) => {
    if (
      !window.confirm(
        `Are you sure you want to change the role of ${username} to Admin?`,
      )
    ) {
      return;
    }

    try {
      const response = await fetch(apiUrl(`/api/users/${username}/role`), {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ role: "Admin" }),
      });

      if (response.ok) {
        window.alert(
          `${username} has been successfully change role to Admin.`,
        );
        setUsers((currentUsers) =>
          currentUsers.map((user) =>
            user.username === username ? { ...user, role_id: "Admin" } : user,
          ),
        );
      }
    } catch (error) {
      console.error("Failed to change user role:", error);
    }
  }, []);

  const banUser = useCallback(async (username) => {
    if (!window.confirm(`Are you sure you want to ban ${username}?`)) {
      return;
    }

    try {
      const response = await fetch(apiUrl(`/api/users/${username}/ban`), {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ banned: true }),
      });

      if (response.ok) {
        window.alert(`${username} has been successfully banned.`);
        setUsers((currentUsers) =>
          currentUsers.filter((user) => user.username !== username),
        );
      } else {
        console.error("Failed to ban user:", response.statusText);
      }
    } catch (error) {
      console.error("Failed to ban user:", error);
    }
  }, []);

  return {
    users,
    sortColumn,
    sortOrder,
    handleSort,
    changeRoleToAdmin,
    banUser,
  };
};
