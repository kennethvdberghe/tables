import {
  createColumnHelper,
  flexRender,
  getCoreRowModel,
  useReactTable,
} from "@tanstack/react-table";
import { keepPreviousData, useQuery } from "@tanstack/react-query";
import { useMemo } from "react";
import { useSearchParams } from "react-router-dom";

const useVehicles = (page = 0) => {
  return useQuery({
    queryKey: ["vehicles", page],
    queryFn: async () => {
      const response = await fetch(`/vehicles?page=${page}`);
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

function App() {
  const [searchParams, setSearchParams] = useSearchParams();

  const pageIndex = Number(searchParams.get("page"));
  const pageSize = 10;

  const dataQuery = useVehicles(pageIndex);

  const pagination = useMemo(
    () => ({
      pageIndex,
      pageSize,
    }),
    [pageIndex, pageSize]
  );

  const table = useReactTable({
    columns,
    data: dataQuery.data || defaultData,
    getCoreRowModel: getCoreRowModel(),
    state: {
      pagination,
    },
    pageCount: 10,
    manualPagination: true,
    onPaginationChange: (updater) => {
      if (typeof updater === "function") {
        const { pageIndex } = updater(pagination);
        setSearchParams((prev) => {
          prev.set("page", pageIndex.toString());
          return prev;
        });
      } else {
        setSearchParams((prev) => {
          prev.set("page", updater.pageIndex.toString());
          return prev;
        });
      }
    },
  });

  return (
    <>
      <table>
        <thead>
          {table.getHeaderGroups().map((headerGroup) => (
            <tr key={headerGroup.id}>
              {headerGroup.headers.map((header) => (
                <th key={header.id}>
                  {header.isPlaceholder
                    ? null
                    : flexRender(
                        header.column.columnDef.header,
                        header.getContext()
                      )}
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
