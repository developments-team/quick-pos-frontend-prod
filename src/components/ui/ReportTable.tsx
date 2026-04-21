import { type ReactNode } from "react";
import { cn } from "../../lib/utils";

/**
 * Column definition for ReportTable
 */
export interface ReportTableColumn<T> {
  /** Unique key for the column */
  key: string;
  /** Header label */
  header: string;
  /** Column width class (e.g., 'w-28', 'w-40') */
  width?: string;
  /** Text alignment: 'left' | 'right' | 'center' */
  align?: "left" | "right" | "center";
  /** Cell renderer function */
  render: (item: T, index: number) => ReactNode;
  /** Footer cell content (optional) */
  footer?: ReactNode;
  /** Footer cell class override */
  footerClassName?: string;
}

/**
 * Props for ReportTable component
 */
export interface ReportTableProps<T> {
  /** Array of column definitions */
  columns: ReportTableColumn<T>[];
  /** Data to render */
  data: T[];
  /** Function to get unique key for each row */
  getRowKey: (item: T, index: number) => string | number;
  /** Message shown when data is empty */
  emptyMessage?: string;
  /** Optional footer row(s) - if provided, footers from columns are ignored */
  footer?: ReactNode;
  /** Optional className for the table */
  className?: string;
  /** Optional row className or function returning className */
  rowClassName?: string | ((item: T, index: number) => string);
}

/**
 * A reusable table component for reports with consistent styling.
 * Handles headers, body rows, empty states, and footers.
 */
export function ReportTable<T>({
  columns,
  data,
  getRowKey,
  emptyMessage = "No data available",
  footer,
  className,
  rowClassName,
}: ReportTableProps<T>) {
  const alignmentClass = (align?: "left" | "right" | "center") => {
    switch (align) {
      case "right":
        return "text-right";
      case "center":
        return "text-center";
      default:
        return "text-left";
    }
  };

  const getRowClassName = (item: T, index: number): string => {
    const baseClass = "border-b border-(--border)";
    if (typeof rowClassName === "function") {
      return cn(baseClass, rowClassName(item, index));
    }
    return cn(baseClass, rowClassName);
  };

  // Check if any column has a footer defined
  const hasColumnFooters = columns.some((col) => col.footer !== undefined);

  return (
    <table className={cn("w-full border-collapse", className)}>
      <thead>
        <tr className="border-b-2 border-(--border)">
          {columns.map((col) => (
            <th
              key={col.key}
              className={cn(
                "py-2 px-3 text-sm font-semibold text-(--text-primary)",
                alignmentClass(col.align),
                col.width,
              )}
            >
              {col.header}
            </th>
          ))}
        </tr>
      </thead>
      <tbody>
        {data.length > 0 ? (
          data.map((item, index) => (
            <tr
              key={getRowKey(item, index)}
              className={getRowClassName(item, index)}
            >
              {columns.map((col) => (
                <td
                  key={col.key}
                  className={cn("py-2 px-3 text-sm", alignmentClass(col.align))}
                >
                  {col.render(item, index)}
                </td>
              ))}
            </tr>
          ))
        ) : (
          <tr>
            <td colSpan={columns.length} className="py-4 text-center text-sm">
              {emptyMessage}
            </td>
          </tr>
        )}
      </tbody>
      {(footer || hasColumnFooters) && (
        <tfoot>
          {footer ? (
            footer
          ) : (
            <tr className="border-t-2 border-(--border) bg-(--bg-muted)/30">
              {columns.map((col) => (
                <td
                  key={col.key}
                  className={cn(
                    "py-3 px-3 text-sm font-bold",
                    alignmentClass(col.align),
                    col.footerClassName,
                  )}
                >
                  {col.footer}
                </td>
              ))}
            </tr>
          )}
        </tfoot>
      )}
    </table>
  );
}

/**
 * Section wrapper for report tables with a title
 */
export interface ReportTableSectionProps {
  /** Section title */
  title: string;
  /** Children content */
  children: ReactNode;
  /** Optional className */
  className?: string;
}

export function ReportTableSection({
  title,
  children,
  className,
}: ReportTableSectionProps) {
  return (
    <div className={cn("mb-6", className)}>
      <h2 className="text-lg font-semibold mb-3 text-(--text-primary)">
        {title}
      </h2>
      {children}
    </div>
  );
}
