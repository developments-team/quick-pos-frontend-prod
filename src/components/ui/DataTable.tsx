import React, { useState } from "react";
import {
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
  Search,
  ArrowUpDown,
  ArrowUp,
  ArrowDown,
} from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "./Table";
import { Button } from "./Button";
import { Input } from "./Input";
import { cn } from "../../lib/utils";
import { Spinner } from "./Spinner";
import { Combobox } from "./Combobox";
// import { Select } from "./Select";

export interface Column<T> {
  header: string;
  accessorKey: keyof T;
  cell?: (item: T, index: number) => React.ReactNode;
  sortable?: boolean;
  searchable?: boolean;
  className?: string;
}

interface DataTableProps<T> {
  data: T[];
  columns: Column<T>[];
  pageSizeOptions?: { value: string; label: string }[];
  isLoading?: boolean;
  prependRows?: React.ReactNode;
}

export function DataTable<T extends { id: string | number }>({
  data,
  columns,
  pageSizeOptions = [
    {
      value: "5",
      label: "5",
    },
    {
      value: "10",
      label: "10",
    },
    {
      value: "20",
      label: "20",
    },
    {
      value: "50",
      label: "50",
    },
    {
      value: "100",
      label: "100",
    },
  ],
  isLoading,
  prependRows,
}: DataTableProps<T>) {
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(Number(pageSizeOptions[1].value));
  const [sortConfig, setSortConfig] = useState<{
    key: keyof T | null;
    direction: "asc" | "desc";
  }>({ key: null, direction: "asc" });
  const [searchQuery, setSearchQuery] = useState("");
  const [hoveredRowId, setHoveredRowId] = useState<string | number | null>(
    null
  );

  // Filter
  const filteredData = React.useMemo(() => {
    if (!searchQuery) return data;

    const searchableColumns = columns.filter((col) => col.searchable);
    if (searchableColumns.length === 0) return data;

    return data.filter((item) => {
      return searchableColumns.some((col) => {
        const value = item[col.accessorKey];
        return String(value).toLowerCase().includes(searchQuery.toLowerCase());
      });
    });
  }, [data, searchQuery, columns]);

  // Sort
  const sortedData = React.useMemo(() => {
    if (!sortConfig.key) return filteredData;
    return [...filteredData].sort((a, b) => {
      const aValue = a[sortConfig.key!];
      const bValue = b[sortConfig.key!];

      if (aValue < bValue) return sortConfig.direction === "asc" ? -1 : 1;
      if (aValue > bValue) return sortConfig.direction === "asc" ? 1 : -1;
      return 0;
    });
  }, [filteredData, sortConfig]);

  // Pagination
  const totalPages = Math.ceil(sortedData.length / pageSize);
  const paginatedData = sortedData.slice(
    (currentPage - 1) * pageSize,
    currentPage * pageSize
  );

  const handleSort = (key: keyof T) => {
    setSortConfig((current) => ({
      key,
      direction:
        current.key === key && current.direction === "asc" ? "desc" : "asc",
    }));
  };

  const showSearch = columns.some((col) => col.searchable);

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mx-0.5">
        <div className="flex items-center gap-2">
          <span className="text-sm text-(--text-muted)">Show</span>
          <Combobox
            options={pageSizeOptions}
            value={String(pageSize)}
            onChange={(value: string) => setPageSize(Number(value))}
            isMini
            allowClear={false}
            searchable={false}
            className="h-9 w-[85px]"
          />
          {/* <Select
            value={pageSize}
            onChange={(e) => {
              setPageSize(Number(e.target.value));
              setCurrentPage(1);
            }}
            className="h-9 w-[85px]"
          >
            {pageSizeOptions.map((size) => (
              <option key={size.value} value={size.value}>
                {size.label}
              </option>
            ))}
          </Select> */}
          <span className="text-sm text-(--text-muted)">entries</span>
        </div>
        {showSearch && (
          <div className="w-full sm:max-w-xs">
            <Input
              placeholder="Search..."
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setCurrentPage(1);
              }}
              leftIcon={<Search size={16} />}
            />
          </div>
        )}
      </div>

      <div className="rounded-lg border border-(--table-border) overflow-hidden">
        <Table>
          <TableHeader className="bg-(--primary) text-(--primary-foreground)">
            <TableRow className="hover:bg-(--primary) hover:text-(--primary-foreground)">
              {columns.map((column, colIndex) => (
                <TableHead
                  key={`${colIndex}-${String(column.accessorKey)}`}
                  className={cn(
                    column.sortable && "cursor-pointer select-none",
                    column.className
                  )}
                  onClick={() =>
                    column.sortable && handleSort(column.accessorKey)
                  }
                >
                  <div
                    className={cn(
                      "flex items-center gap-2",
                      column.className?.includes("text-right") && "justify-end"
                    )}
                  >
                    {column.header}
                    {column.sortable && (
                      <span className="text-(--primary-foreground)/70">
                        {sortConfig.key === column.accessorKey ? (
                          sortConfig.direction === "desc" ? (
                            <ArrowDown size={14} />
                          ) : (
                            <ArrowUp size={14} />
                          )
                        ) : (
                          <ArrowUpDown size={14} className="opacity-50" />
                        )}
                      </span>
                    )}
                  </div>
                </TableHead>
              ))}
            </TableRow>
          </TableHeader>
          <TableBody>
            {prependRows}
            {isLoading ? (
              <TableRow>
                <TableCell
                  colSpan={columns.length}
                  className="h-16 text-center"
                >
                  <Spinner
                    size="xl"
                    variant="gradient-ring"
                    color="standard"
                    className="mx-auto"
                    strokeWidth={4}
                  />
                </TableCell>
              </TableRow>
            ) : paginatedData.length > 0 ? (
              paginatedData.map((item, index) => (
                <React.Fragment key={item.id || index}>
                  <TableRow
                    onMouseEnter={() => setHoveredRowId(item.id || index)}
                    onMouseLeave={() => setHoveredRowId(null)}
                    className={cn(
                      ((item as { subRows?: T[] }).subRows?.length || 0) > 0 &&
                        "border-(--table-border)/30",
                      hoveredRowId === (item.id || index) && "bg-(--border)"
                    )}
                  >
                    {columns.map((column, colIndex) => (
                      <TableCell
                        key={`${item.id || index}-${colIndex}-${String(
                          column.accessorKey
                        )}`}
                        className={column.className}
                      >
                        {column.cell
                          ? column.cell(
                              item,
                              (currentPage - 1) * pageSize + index
                            )
                          : (item[column.accessorKey] as React.ReactNode)}
                      </TableCell>
                    ))}
                  </TableRow>
                  {/* Sub-rows rendering */}
                  {(item as { subRows?: T[] }).subRows &&
                    ((item as { subRows?: T[] }).subRows?.length || 0) > 0 &&
                    (item as { subRows?: T[] }).subRows?.map(
                      (subItem: T, subIndex: number) => (
                        <TableRow
                          key={`sub-${item.id || index}-${subIndex}`}
                          onMouseEnter={() => setHoveredRowId(item.id || index)}
                          onMouseLeave={() => setHoveredRowId(null)}
                          className={cn(
                            // "bg-(--muted)/30 hover:bg-(--muted)/50",
                            // Add a left border to indicate it's a child
                            // "border-l-4 border-l-(--primary)",
                            // Remove bottom border for all except the last one to group them
                            subIndex !==
                              ((item as { subRows?: T[] }).subRows?.length ||
                                0) -
                                1 && "border-(--table-border)/30",
                            hoveredRowId === (item.id || index) &&
                              "bg-(--border)"
                          )}
                        >
                          {columns.map((column, colIndex) => (
                            <TableCell
                              key={`sub-${
                                item.id || index
                              }-${subIndex}-${colIndex}`}
                              className={cn(column.className, "text-sm")}
                            >
                              {/* For sub-rows, if value is missing/empty, just show it - typically empty for parent fields */}
                              {column.cell
                                ? column.cell(subItem, subIndex)
                                : (subItem[
                                    column.accessorKey
                                  ] as React.ReactNode)}
                            </TableCell>
                          ))}
                        </TableRow>
                      )
                    )}
                </React.Fragment>
              ))
            ) : (
              <TableRow>
                <TableCell
                  colSpan={columns.length}
                  className="h-16 text-center text-(--text-muted)"
                >
                  No results found.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      <div className="flex flex-col sm:flex-row items-center justify-between px-2 gap-4">
        <div className="text-sm text-(--text-muted)">
          Showing {(currentPage - 1) * pageSize + 1} to{" "}
          {Math.min(currentPage * pageSize, sortedData.length)} of{" "}
          {sortedData.length} entries
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="secondary"
            outline
            size="icon"
            className="h-8 w-8"
            onClick={() => setCurrentPage(1)}
            disabled={currentPage === 1}
          >
            <ChevronsLeft size={16} />
          </Button>
          <Button
            variant="secondary"
            outline
            size="icon"
            className="h-8 w-8"
            onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
            disabled={currentPage === 1}
          >
            <ChevronLeft size={16} />
          </Button>
          <div className="text-sm font-medium text-(--text-standard) min-w-12 text-center">
            Page {currentPage} of {totalPages}
          </div>
          <Button
            variant="secondary"
            outline
            size="icon"
            className="h-8 w-8"
            onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
            disabled={currentPage === totalPages}
          >
            <ChevronRight size={16} />
          </Button>
          <Button
            variant="secondary"
            outline
            size="icon"
            className="h-8 w-8"
            onClick={() => setCurrentPage(totalPages)}
            disabled={currentPage === totalPages}
          >
            <ChevronsRight size={16} />
          </Button>
        </div>
      </div>
    </div>
  );
}
