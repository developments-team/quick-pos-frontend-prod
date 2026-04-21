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
  ReportTableSection,
  type ReportTableColumn,
} from "../../components/ui/ReportTable";
import { formatDateToISO, type ReportLineItem } from "./types";

export function IncomeStatement() {
  const { getIncomeStatement } = useProvider();
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
    queryKey: ["income-statement", dateRange],
    queryFn: () =>
      getIncomeStatement({
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

  const revenues: ReportLineItem[] = data?.revenues?.items || [];
  const expenses: ReportLineItem[] = data?.expenses?.items || [];
  const totalRevenue = data?.revenues?.total || 0;
  const totalExpenses = data?.expenses?.total || 0;
  const netIncome = data?.netIncome || 0;

  const revenueColumns: ReportTableColumn<ReportLineItem>[] = useMemo(
    () => [
      {
        key: "account",
        header: "Account",
        render: (item) => (
          <>
            {item.accountNumber && (
              <span className="mr-2">{item.accountNumber}</span>
            )}
            {item.accountName}
          </>
        ),
        footer: "Total Revenue",
      },
      {
        key: "amount",
        header: "Amount",
        width: "w-40",
        align: "right",
        render: (item) => (
          <span className="font-medium text-green-600">
            {formatCurrency(item.amount)}
          </span>
        ),
        footer: (
          <span className="font-bold text-green-600">
            {formatCurrency(totalRevenue)}
          </span>
        ),
        footerClassName: "text-right",
      },
    ],
    [totalRevenue],
  );

  const expenseColumns: ReportTableColumn<ReportLineItem>[] = useMemo(
    () => [
      {
        key: "account",
        header: "Account",
        render: (item) => (
          <>
            {item.accountNumber && (
              <span className="mr-2">{item.accountNumber}</span>
            )}
            {item.accountName}
          </>
        ),
        footer: "Total Expenses",
      },
      {
        key: "amount",
        header: "Amount",
        width: "w-40",
        align: "right",
        render: (item) => (
          <span className="font-medium text-red-600">
            {formatCurrency(item.amount)}
          </span>
        ),
        footer: (
          <span className="font-bold text-red-600">
            {formatCurrency(totalExpenses)}
          </span>
        ),
        footerClassName: "text-right",
      },
    ],
    [totalExpenses],
  );

  return (
    <PageContainer>
      <PageHeader title="Income Statement" />

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
          disabled={isLoading || revenues.length === 0}
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
            <h1 className="text-2xl font-bold mb-2">Income Statement</h1>
            <p className="text-sm">
              {dateRange.from && dateRange.to
                ? `${formatDate(dateRange.from)} - ${formatDate(dateRange.to)}`
                : "Date Range Not Selected"}
            </p>
          </div>

          <div className="space-y-8">
            {/* Revenue Section */}
            <ReportTableSection title="Revenue">
              <ReportTable
                columns={revenueColumns}
                data={revenues}
                getRowKey={(item, index) => item.id || index}
                emptyMessage="No revenue items"
              />
            </ReportTableSection>

            {/* Expenses Section */}
            <ReportTableSection title="Expenses">
              <ReportTable
                columns={expenseColumns}
                data={expenses}
                getRowKey={(item, index) => item.id || index}
                emptyMessage="No expense items"
              />
            </ReportTableSection>

            {/* Net Income Summary */}
            <div className="border-t-2 border-(--border) pt-4">
              <table className="w-full">
                <tbody>
                  <tr className="bg-(--primary)/10 rounded-lg">
                    <td className="py-3 px-3 text-lg font-bold">Net Income</td>
                    <td
                      className={`py-3 px-3 text-right text-xl font-bold w-40 ${
                        netIncome >= 0 ? "text-green-600" : "text-red-600"
                      }`}
                    >
                      {formatCurrency(netIncome)}
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </PageContainer>
  );
}
