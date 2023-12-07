import {
  SortingState,
  createColumnHelper,
  flexRender,
  getCoreRowModel,
  useReactTable,
} from "@tanstack/react-table";
import { keepPreviousData, useQuery } from "@tanstack/react-query";
import { useMemo } from "react";
import { useSearchParams } from "react-router-dom";

const useVehicles = (page = 0, sort = "", sortDirection = "") => {
  return useQuery({
    queryKey: ["vehicles", page, sort, sortDirection],
    queryFn: async () => {
      const search = new URLSearchParams({
        page: page.toString(),
        sort,
        sortDirection,
      });

      const response = await fetch(`/vehicles?${search.toString()}`);
      const { data } = await response.json();
      return data;
    },
    placeholderData: keepPreviousData,
  });
};

type Car = {
  id: string;
  name: string;
  type: string;
  fuel: string;
};

const columnHelper = createColumnHelper<Car>();

const columns = [
  columnHelper.accessor("name", {
    header: "Name",
  }),
  columnHelper.accessor("type", {
    header: "Type",
  }),
  columnHelper.accessor("fuel", {
    header: "Fuel",
  }),
];

const defaultData: Car[] = [];
const pageSize = 10;

function App() {
  const [searchParams, setSearchParams] = useSearchParams();

  const pageIndex = Number(searchParams.get("page"));
  const sortId = searchParams.get("sort") ?? "";
  const sortDirection = searchParams.get("direction") ?? "";

  const dataQuery = useVehicles(pageIndex, sortId, sortDirection);

  const pagination = useMemo(
    () => ({
      pageIndex,
      pageSize,
    }),
    [pageIndex]
  );

  const sorting = useMemo<SortingState>(() => {
    if (!sortId) return [];
    return [{ id: sortId, desc: sortDirection === "desc" }];
  }, [sortId, sortDirection]);

  const table = useReactTable({
    columns,
    data: dataQuery.data || defaultData,
    getCoreRowModel: getCoreRowModel(),
    state: {
      pagination,
      sorting,
    },
    pageCount: 10,
    manualSorting: true,
    manualPagination: true,
    onSortingChange: (updater) => {
      const [sortInfo] =
        typeof updater === "function" ? updater(sorting) : updater;
      if (!sortInfo) {
        return setSearchParams((prev) => {
          prev.delete("sort");
          prev.delete("direction");
          return prev;
        });
      }
      setSearchParams((prev) => {
        prev.set("sort", sortInfo.id);
        prev.set("direction", sortInfo.desc ? "desc" : "asc");
        return prev;
      });
    },
    onPaginationChange: (updater) => {
      const { pageIndex } =
        typeof updater === "function" ? updater(pagination) : updater;
      setSearchParams((prev) => {
        prev.set("page", pageIndex.toString());
        return prev;
      });
    },
  });

  return (
    <>
      <table>
        <thead>
          {table.getHeaderGroups().map((headerGroup) => (
            <tr key={headerGroup.id}>
              {headerGroup.headers.map((header) => (
                <th
                  key={header.id}
                  onClick={header.column.getToggleSortingHandler()}
                >
                  {header.isPlaceholder
                    ? null
                    : flexRender(
                        header.column.columnDef.header,
                        header.getContext()
                      )}
                  {{ asc: "🔼", desc: "🔽" }[
                    header.column.getIsSorted() as string
                  ] ?? null}
                </th>
              ))}
            </tr>
          ))}
        </thead>
        <tbody>
          {table.getRowModel().rows.map((row) => (
            <tr key={row.id}>
              {row.getVisibleCells().map((cell) => (
                <td key={cell.id}>
                  {flexRender(cell.column.columnDef.cell, cell.getContext())}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
      <div className="flex items-center gap-2">
        <button
          className="border rounded p-1"
          onClick={() => table.setPageIndex(0)}
          disabled={!table.getCanPreviousPage()}
        >
          {"<<"}
        </button>
        <button
          className="border rounded p-1"
          onClick={() => table.previousPage()}
          disabled={!table.getCanPreviousPage()}
        >
          {"<"}
        </button>
        <button
          className="border rounded p-1"
          onClick={() => table.nextPage()}
          disabled={!table.getCanNextPage()}
        >
          {">"}
        </button>
        <button
          className="border rounded p-1"
          onClick={() => table.setPageIndex(table.getPageCount() - 1)}
          disabled={!table.getCanNextPage()}
        >
          {">>"}
        </button>
        <span className="flex items-center gap-1">
          <div>Page</div>
          <strong>
            {table.getState().pagination.pageIndex + 1} of{" "}
            {table.getPageCount()}
          </strong>
        </span>
        {dataQuery.isFetching ? "Loading..." : null}
      </div>
    </>
  );
}

export default App;
