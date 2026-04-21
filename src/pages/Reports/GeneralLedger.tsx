/* eslint-disable @typescript-eslint/no-explicit-any */
import { useRef, useState, useMemo } from "react";
import { useReactToPrint } from "react-to-print";
import { useQuery } from "@tanstack/react-query";
import { useProvider } from "../../context/Provider";
import { PageContainer, PageHeader } from "../../components/layout/Page";
import { DatePicker, type DateRange } from "../../components/ui/DatePicker";
import { Combobox } from "../../components/ui/Combobox";
import { Button } from "../../components/ui/Button";
import { FileText, Printer } from "lucide-react";
import { Spinner } from "../../components/ui/Spinner";
import {
  ReportTable,
  type ReportTableColumn,
} from "../../components/ui/ReportTable";
import { formatDateToISO, type GeneralLedgerEntry } from "./types";

export function GeneralLedger() {
  const { getGeneralLedger, getChartOfAccounts } = useProvider();
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
  const [selectedAccountId, setSelectedAccountId] = useState<string>("");

  // Fetch accounts for filter dropdown
  const { data: accountsData } = useQuery({
    queryKey: ["chart-of-accounts-list"],
    queryFn: () => getChartOfAccounts({}),
    select: (res: any) => {
      const accounts = Array.isArray(res) ? res : res?.data || [];
      return accounts.map((acc: any) => ({
        value: acc.id,
        label: `${acc.accountNumber} - ${acc.accountName}`,
      }));
    },
  });

  const { data, isLoading, refetch, isFetching } = useQuery({
    queryKey: ["general-ledger", dateRange, selectedAccountId],
    queryFn: () =>
      getGeneralLedger({
        startDate: dateRange.from ? formatDateToISO(dateRange.from) : "",
        endDate: dateRange.to ? formatDateToISO(dateRange.to) : "",
        ...(selectedAccountId && { accountId: selectedAccountId }),
      }),
    enabled: !!(dateRange.from && dateRange.to),
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

  const formatDateStr = (dateStr: string) =>
    new Date(dateStr).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });

  const accounts = data?.accounts || [];
  const accountOptions = [
    { value: "", label: "All Accounts" },
    ...(accountsData || []),
  ];

  const entryColumns: ReportTableColumn<GeneralLedgerEntry>[] = useMemo(
    () => [
      {
        key: "date",
        header: "Date",
        width: "w-28",
        render: (entry) => (entry.date ? formatDateStr(entry.date) : "-"),
      },
      {
        key: "description",
        header: "Description",
        render: (entry) => entry.description,
      },
      {
        key: "reference",
        header: "Reference",
        width: "w-24",
        render: (entry) => entry.reference || "-",
      },
      {
        key: "debit",
        header: "Debit",
        width: "w-28",
        align: "right",
        render: (entry) => (
          <span className="font-medium">{formatCurrency(entry.debit)}</span>
        ),
      },
      {
        key: "credit",
        header: "Credit",
        width: "w-28",
        align: "right",
        render: (entry) => (
          <span className="font-medium">{formatCurrency(entry.credit)}</span>
        ),
      },
      {
        key: "balance",
        header: "Balance",
        width: "w-32",
        align: "right",
        render: (entry) => (
          <span
            className={`font-semibold ${
              entry.balance >= 0 ? "text-green-600" : "text-red-600"
            }`}
          >
            {entry?.balance?.toLocaleString("en-US", {
              style: "currency",
              currency: "USD",
            })}
          </span>
        ),
      },
    ],
    [],
  );

  return (
    <PageContainer>
      <PageHeader title="General Ledger" />

      {/* Filters */}
      <div className="flex items-center justify-center gap-3 mb-6 flex-wrap">
        <Combobox
          options={accountOptions}
          value={selectedAccountId}
          onChange={setSelectedAccountId}
          placeholder="Filter by account"
          className="w-64"
        />
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
          disabled={isLoading || accounts.length === 0}
        >
          <Printer className="mr-2 h-4 w-4" />
          Print
        </Button>
      </div>

      {isLoading ? (
        <div className="flex justify-center py-12">
          <Spinner size="lg" />
        </div>
      ) : accounts.length === 0 ? (
        <div className="text-center py-12">
          No ledger entries found for the selected criteria.
        </div>
      ) : (
        <div ref={componentRef} className="print:p-8">
          {/* Print Header */}
          <div className="hidden print:block mb-8 text-center">
            <h1 className="text-2xl font-bold mb-2">General Ledger</h1>
            <p className="text-sm">
              {dateRange.from && dateRange.to
                ? `${formatDate(dateRange.from)} - ${formatDate(dateRange.to)}`
                : "Date Range Not Selected"}
            </p>
            {selectedAccountId && (
              <p className="text-sm font-medium mt-1">Account Filter Applied</p>
            )}
          </div>

          <div className="space-y-8">
            {accounts.map((account: any) => (
              <div key={account.accountId}>
                {/* Account Header */}
                <div className="flex justify-between items-center mb-3 p-3 bg-(--bg-muted) rounded-lg">
                  <span className="font-semibold text-lg">
                    {account.accountNumber} - {account.accountName}
                  </span>
                  <div className="flex gap-6 text-sm">
                    <span>
                      Opening:{" "}
                      <span className="font-medium">
                        {formatCurrency(account.openingBalance)}
                      </span>
                    </span>
                    <span>
                      Closing:{" "}
                      <span className="font-semibold text-(--primary)">
                        {formatCurrency(account.closingBalance)}
                      </span>
                    </span>
                  </div>
                </div>

                {/* Account Entries Table */}
                <ReportTable
                  columns={entryColumns}
                  data={(account.entries || []) as GeneralLedgerEntry[]}
                  getRowKey={(entry, index) => entry.id || index}
                  emptyMessage="No entries for this account"
                />
              </div>
            ))}
          </div>
        </div>
      )}
    </PageContainer>
  );
}
