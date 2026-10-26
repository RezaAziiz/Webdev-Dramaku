export const formatDate = (dateString) => {
  const date = new Date(dateString);
  const options = {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  };
  return date.toLocaleString("en-GB", options).replace(",", "");
};

export const sortUsersBy = (users, column, order) => {
  const sorted = [...users];
  sorted.sort((a, b) => {
    if (column === "created_at") {
      return order === "asc"
        ? new Date(a.created_at) - new Date(b.created_at)
        : new Date(b.created_at) - new Date(a.created_at);
    }
    return order === "asc"
      ? a[column].localeCompare(b[column])
      : b[column].localeCompare(a[column]);
  });
  return sorted;
};

export const filterUsersByPrefix = (users, query) =>
  users.filter((user) =>
    user.username.toLowerCase().startsWith(query.toLowerCase()),
  );

export const paginateUsers = (users, page, perPage) => {
  const totalPages = Math.ceil(users.length / perPage);
  const startIndex = (page - 1) * perPage;

  return {
    totalPages,
    startIndex,
    items: users.slice(startIndex, startIndex + perPage),
  };
};
