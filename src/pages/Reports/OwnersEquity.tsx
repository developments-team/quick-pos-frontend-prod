/* eslint-disable @typescript-eslint/no-explicit-any */
import { useRef, useState, useMemo } from "react";
import { useReactToPrint } from "react-to-print";
import { useQuery } from "@tanstack/react-query";
import { useProvider } from "../../context/Provider";
import { PageContainer, PageHeader } from "../../components/layout/Page";
import { DatePicker, type DateRange } from "../../components/ui/DatePicker";
import { Button } from "../../components/ui/Button";
import { FileText, Printer } from "lucide-react";
import { Spinner } from "../../components/ui/Spinner";
import {
  ReportTable,
  type ReportTableColumn,
} from "../../components/ui/ReportTable";
import { formatDateToISO, type ReportLineItem } from "./types";

export function OwnersEquity() {
  const { getOwnersEquity } = useProvider();
  const componentRef = useRef<HTMLDivElement>(null);
  const handlePrint = useReactToPrint({
    contentRef: componentRef,
  });

  // Default to current month
  const today = new Date();
  const firstOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);

  const [dateRange, setDateRange] = useState<DateRange>({
    from: firstOfMonth,
    to: today,
  });

  const { data, isLoading, refetch, isFetching } = useQuery({
    queryKey: ["owners-equity", dateRange],
    queryFn: () =>
      getOwnersEquity({
        startDate: dateRange.from ? formatDateToISO(dateRange.from) : "",
        endDate: dateRange.to ? formatDateToISO(dateRange.to) : "",
      }),
    enabled: !!(dateRange.from && dateRange.to),
    select: (res: any) => res?.data || res,
  });

  const formatCurrency = (amount: number | undefined) =>
    (amount || 0).toLocaleString("en-US", {
      style: "currency",
      currency: "USD",
    });

  const formatDate = (date: Date | undefined) =>
    date
      ? date.toLocaleDateString("en-US", {
          year: "numeric",
          month: "long",
          day: "numeric",
        })
      : "";

  const items: ReportLineItem[] = data?.items || [];
  const beginningBalance = data?.beginningBalance || 0;
  const netIncome = data?.netIncome || 0;
  const endingBalance = data?.endingBalance || 0;

  // Build a combined data array for the table display
  interface EquityRowItem extends ReportLineItem {
    isSpecialRow?: boolean;
    rowType?: "beginning" | "netIncome" | "item";
    displayAmount: number;
  }

  const tableRows: EquityRowItem[] = useMemo(() => {
    const rows: EquityRowItem[] = [];

    // Beginning balance row
    rows.push({
      id: "beginning",
      accountName: "Beginning Owner's Equity",
      displayAmount: beginningBalance,
      isSpecialRow: true,
      rowType: "beginning",
    });

    // Item rows
    items.forEach((item) => {
      rows.push({
        ...item,
        displayAmount: item.amount || 0,
        isSpecialRow: false,
        rowType: "item",
      });
    });

    // Net income row
    rows.push({
      id: "netIncome",
      accountName: "Net Income for Period",
      displayAmount: netIncome,
      isSpecialRow: true,
      rowType: "netIncome",
    });

    return rows;
  }, [beginningBalance, items, netIncome]);

  const columns: ReportTableColumn<EquityRowItem>[] = useMemo(
    () => [
      {
        key: "description",
        header: "Description",
        render: (item) => (
          <span
            className={
              item.isSpecialRow
                ? "font-medium"
                : item.accountNumber
                  ? ""
                  : "pl-3"
            }
          >
            {item.accountNumber && (
              <span className="mr-2">{item.accountNumber}</span>
            )}
            {item.accountName}
          </span>
        ),
        footer: "Ending Owner's Equity",
      },
      {
        key: "amount",
        header: "Amount",
        width: "w-48",
        align: "right",
        render: (item) => {
          if (item.rowType === "beginning") {
            return (
              <span className="font-semibold">
                {formatCurrency(item.displayAmount)}
              </span>
            );
          }
          if (item.rowType === "netIncome") {
            return (
              <span
                className={`font-semibold ${item.displayAmount >= 0 ? "text-green-600" : "text-red-600"}`}
              >
                {formatCurrency(item.displayAmount)}
              </span>
            );
          }
          return (
            <span
              className={`font-medium ${item.displayAmount >= 0 ? "text-green-600" : "text-red-600"}`}
            >
              {formatCurrency(item.displayAmount)}
            </span>
          );
        },
        footer: (
          <span className="text-lg font-bold text-(--primary)">
            {formatCurrency(endingBalance)}
          </span>
        ),
        footerClassName: "text-right",
      },
    ],
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [endingBalance],
  );

  return (
    <PageContainer>
      <PageHeader title="Statement of Owner's Equity" />

      {/* Filters */}
      <div className="flex items-center justify-center gap-3 mb-6">
        <DatePicker
          mode="range"
          value={dateRange}
          onChange={setDateRange}
          className="w-72"
        />
        <Button onClick={() => refetch()} disabled={isFetching}>
          {isFetching ? (
            <Spinner className="mr-2 h-4 w-4" />
          ) : (
            <FileText className="mr-2 h-4 w-4" />
          )}
          Generate
        </Button>
        <Button
          outline
          onClick={() => handlePrint()}
          disabled={isLoading || items.length === 0}
        >
          <Printer className="mr-2 h-4 w-4" />
          Print
        </Button>
      </div>

      {isLoading ? (
        <div className="flex justify-center py-12">
          <Spinner size="lg" />
        </div>
      ) : (
        <div ref={componentRef} className="print:p-8">
          {/* Print Header */}
          <div className="hidden print:block mb-8 text-center">
            <h1 className="text-2xl font-bold mb-2">
              Statement of Owner's Equity
            </h1>
            <p className="text-sm">
              {dateRange.from && dateRange.to
                ? `${formatDate(dateRange.from)} - ${formatDate(dateRange.to)}`
                : "Date Range Not Selected"}
            </p>
          </div>

          <div className="space-y-6">
            <ReportTable
              columns={columns}
              data={tableRows}
              getRowKey={(item) => item.id || item.accountName || ""}
              emptyMessage="No changes recorded"
              rowClassName={(item) =>
                item.isSpecialRow ? "bg-(--bg-muted)/30" : ""
              }
              footer={
                <tr className="border-t-2 border-(--border) bg-(--primary)/10">
                  <td className="py-3 px-3 text-base font-bold">
                    Ending Owner's Equity
                  </td>
                  <td className="py-3 px-3 text-right text-lg font-bold text-(--primary)">
                    {formatCurrency(endingBalance)}
                  </td>
                </tr>
              }
            />
          </div>
        </div>
      )}
    </PageContainer>
  );
}
