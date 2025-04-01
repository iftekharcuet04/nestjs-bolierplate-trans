export const prepareCommonQueryParams = (
  data: any
): {
  skip: number;
  take: number;
  currentPage: number;
  orderBy: Record<string, "asc" | "desc">;
  searchKey?: string;
  needTotal: boolean;
} => {
  const {
    currentPage = 1,
    perPage = 10,
    sortDirection,
    sortOn,
    searchKey,
    needTotal = false
  } = data || {};

  const skip = Math.max(0, currentPage - 1) * perPage;

  let orderBy: Record<string, "asc" | "desc"> = { id: "desc" };

  if (sortDirection && sortOn) {
    orderBy = { [sortOn]: sortDirection };
  }

  return {
    skip,
    take: perPage,
    currentPage,
    orderBy,
    searchKey,
    needTotal
  };
};
