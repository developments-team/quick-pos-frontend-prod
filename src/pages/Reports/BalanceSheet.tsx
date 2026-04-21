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
  ReportTableSection,
  type ReportTableColumn,
} from "../../components/ui/ReportTable";
import { formatDateToISO, type ReportLineItem } from "./types";
import { useReactToPrint } from "react-to-print";

export function BalanceSheet() {
  const { getBalanceSheet } = useProvider();
  const componentRef = useRef<HTMLDivElement>(null);
  const handlePrint = useReactToPrint({
    contentRef: componentRef,
  });

  const [asOfDate, setAsOfDate] = useState<Date>(new Date());

  const { data, isLoading, refetch, isFetching } = useQuery({
    queryKey: ["balance-sheet", asOfDate],
    queryFn: () =>
      getBalanceSheet({
        asOfDate: formatDateToISO(asOfDate),
      }),
    enabled: !!asOfDate,
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

  const assets: ReportLineItem[] = data?.assets?.items || [];
  const liabilities: ReportLineItem[] = data?.liabilities?.items || [];
  const equity: ReportLineItem[] = data?.equity?.items || [];
  const totalAssets = data?.assets?.total || 0;
  const totalLiabilities = data?.liabilities?.total || 0;
  const totalEquity = data?.equity?.total || 0;
  const totalLiabilitiesAndEquity = data?.totalLiabilitiesAndEquity || 0;

  const createSectionColumns = (
    totalLabel: string,
    total: number,
    totalColorClass: string,
  ): ReportTableColumn<ReportLineItem>[] => [
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
      footer: `Total ${totalLabel}`,
    },
    {
      key: "balance",
      header: "Balance",
      width: "w-40",
      align: "right",
      render: (item) => (
        <span className="font-medium">
          {formatCurrency(item.balance || item.amount)}
        </span>
      ),
      footer: (
        <span className={`font-bold ${totalColorClass}`}>
          {formatCurrency(total)}
        </span>
      ),
      footerClassName: "text-right",
    },
  ];

  const assetsColumns = useMemo(
    () => createSectionColumns("Assets", totalAssets, "text-(--primary)"),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [totalAssets],
  );
  const liabilitiesColumns = useMemo(
    () => createSectionColumns("Liabilities", totalLiabilities, "text-red-600"),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [totalLiabilities],
  );
  const equityColumns = useMemo(
    () => createSectionColumns("Owner's Equity", totalEquity, "text-green-600"),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [totalEquity],
  );

  return (
    <PageContainer>
      <PageHeader title="Balance Sheet" />

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
          disabled={isLoading || assets.length === 0}
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
            <h1 className="text-2xl font-bold mb-2">Balance Sheet</h1>
            <p className="text-sm">As of {formatDate(asOfDate)}</p>
          </div>

          <div>
            <ReportTableSection title="Assets">
              <ReportTable
                columns={assetsColumns}
                data={assets}
                getRowKey={(item, index) => item.id || index}
                emptyMessage="No items"
              />
            </ReportTableSection>

            <ReportTableSection title="Liabilities">
              <ReportTable
                columns={liabilitiesColumns}
                data={liabilities}
                getRowKey={(item, index) => item.id || index}
                emptyMessage="No items"
              />
            </ReportTableSection>

            <ReportTableSection title="Owner's Equity">
              <ReportTable
                columns={equityColumns}
                data={equity}
                getRowKey={(item, index) => item.id || index}
                emptyMessage="No items"
              />
            </ReportTableSection>

            {/* Balance Check */}
            <div className="border-t-2 border-(--border) pt-4 mt-6">
              <table className="w-full">
                <tbody>
                  <tr>
                    <td className="py-2 px-3 text-sm">Liabilities + Equity</td>
                    <td className="py-2 px-3 text-right text-base font-bold w-40">
                      {formatCurrency(totalLiabilitiesAndEquity)}
                    </td>
                  </tr>
                  <tr className="bg-(--primary)/10">
                    <td className="py-2 px-3 text-base font-bold">
                      Total Assets
                    </td>
                    <td className="py-2 px-3 text-right text-lg font-bold text-(--primary) w-40">
                      {formatCurrency(totalAssets)}
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
