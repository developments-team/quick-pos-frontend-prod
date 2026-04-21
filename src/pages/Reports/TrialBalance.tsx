/* eslint-disable @typescript-eslint/no-explicit-any */
import { useRef, useState, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { useProvider } from "../../context/Provider";
import { PageContainer, PageHeader } from "../../components/layout/Page";
import { DatePicker } from "../../components/ui/DatePicker";
import { Button } from "../../components/ui/Button";
import { FileText, Printer } from "lucide-react";
import { Spinner } from "../../components/ui/Spinner";
import {
  ReportTable,
  type ReportTableColumn,
} from "../../components/ui/ReportTable";
import { formatDateToISO } from "./types";
import { useReactToPrint } from "react-to-print";

interface TrialBalanceAccount {
  accountId: string;
  accountNumber?: string;
  accountName: string;
  accountGroup: string;
  debit: number;
  credit: number;
}

export function TrialBalance() {
  const { getTrialBalance } = useProvider();
  const componentRef = useRef<HTMLDivElement>(null);
  const handlePrint = useReactToPrint({
    contentRef: componentRef,
  });

  const [asOfDate, setAsOfDate] = useState<Date>(new Date());

  const { data, isLoading, refetch, isFetching } = useQuery({
    queryKey: ["trial-balance", asOfDate],
    queryFn: () =>
      getTrialBalance({
        asOfDate: formatDateToISO(asOfDate),
      }),
    enabled: !!asOfDate,
    select: (res: any) => res?.data || res,
  });

  const formatCurrency = (amount: number | undefined) =>
    amount
      ? amount.toLocaleString("en-US", {
          style: "currency",
          currency: "USD",
        })
      : "-";

  const formatDate = (date: Date | undefined) =>
    date
      ? date.toLocaleDateString("en-US", {
          year: "numeric",
          month: "long",
          day: "numeric",
        })
      : "";

  const accountsMap = data?.accounts || {};

  // Flatten accounts for display or keep them grouped
  // For now, let's just display them in order of Asset, Liability, Equity, Revenue, Expense
  const accountGroups = ["Asset", "Liability", "Equity", "Revenue", "Expense"];
  const allAccounts: TrialBalanceAccount[] = accountGroups.flatMap(
    (group) => accountsMap[group] || [],
  );

  const totalDebit = data?.totalDebits || 0;
  const totalCredit = data?.totalCredits || 0;
  const isBalanced =
    data?.isBalanced ?? Math.abs(totalDebit - totalCredit) < 0.01;

  const columns: ReportTableColumn<TrialBalanceAccount>[] = useMemo(
    () => [
      {
        key: "accountNumber",
        header: "Account #",
        width: "w-24",
        render: (item) => item.accountNumber || "-",
      },
      {
        key: "accountName",
        header: "Account Name",
        render: (item) => (
          <>
            {item.accountName}
            <span className="ml-2 text-xs px-2 py-0.5 bg-(--bg-muted) rounded-full">
              {item.accountGroup}
            </span>
          </>
        ),
      },
      {
        key: "debit",
        header: "Debit",
        width: "w-36",
        align: "right",
        render: (item) => (
          <span className="font-medium">
            {item.debit > 0 ? formatCurrency(item.debit) : "-"}
          </span>
        ),
      },
      {
        key: "credit",
        header: "Credit",
        width: "w-36",
        align: "right",
        render: (item) => (
          <span className="font-medium">
            {item.credit > 0 ? formatCurrency(item.credit) : "-"}
          </span>
        ),
      },
    ],
    [],
  );

  return (
    <PageContainer>
      <PageHeader title="Trial Balance" />

      {/* Filters */}
      <div className="flex items-center justify-center gap-3 mb-6">
        <DatePicker
          mode="single"
          value={asOfDate}
          onChange={setAsOfDate}
          className="w-48"
          placeholder="As of date"
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
          disabled={isLoading || allAccounts.length === 0}
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
            <h1 className="text-2xl font-bold mb-2">Trial Balance</h1>
            <p className="text-sm">As of {formatDate(asOfDate)}</p>
          </div>

          <div>
            <ReportTable
              columns={columns}
              data={allAccounts}
              getRowKey={(item, index) => item.accountId || index}
              emptyMessage="No accounts found"
              footer={
                <tr className="border-t-2 border-(--border) bg-(--bg-muted)/30">
                  <td colSpan={2} className="py-3 px-3 text-sm font-bold">
                    Totals
                  </td>
                  <td className="py-3 px-3 text-sm text-right font-bold">
                    {totalDebit.toLocaleString("en-US", {
                      style: "currency",
                      currency: "USD",
                    })}
                  </td>
                  <td className="py-3 px-3 text-sm text-right font-bold">
                    {totalCredit.toLocaleString("en-US", {
                      style: "currency",
                      currency: "USD",
                    })}
                  </td>
                </tr>
              }
            />

            {/* Balance Status */}
            <div className="flex justify-end mt-4">
              <span
                className={`px-4 py-2 rounded-full text-sm font-medium ${
                  isBalanced
                    ? "bg-green-100 text-green-800"
                    : "bg-red-100 text-red-800"
                }`}
              >
                {isBalanced ? "✓ Balanced" : "✗ Not Balanced"}
              </span>
            </div>
          </div>
        </div>
      )}
    </PageContainer>
  );
}
