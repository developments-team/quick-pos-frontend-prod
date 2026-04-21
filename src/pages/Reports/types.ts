// Types for accounting reports

// Common report item interface - id is required for DataTable compatibility
export interface ReportLineItem {
  id: string | number;
  accountId?: string;
  accountNumber?: string;
  accountName: string;
  amount?: number;
  debit?: number;
  credit?: number;
  balance?: number;
  description?: string;
}

// Income Statement types
export interface IncomeStatementData {
  startDate: string;
  endDate: string;
  revenues: {
    items: ReportLineItem[];
    total: number;
  };
  expenses: {
    items: ReportLineItem[];
    total: number;
  };
  netIncome: number;
}

// Balance Sheet types
export interface BalanceSheetData {
  asOfDate: string;
  assets: {
    items: ReportLineItem[];
    total: number;
  };
  liabilities: {
    items: ReportLineItem[];
    total: number;
  };
  equity: {
    items: ReportLineItem[];
    total: number;
  };
  totalLiabilitiesAndEquity: number;
  isBalanced: boolean;
}

// Owners Equity types
export interface OwnersEquityData {
  startDate: string;
  endDate: string;
  beginningEquity: number;
  addNetIncome: number;
  addInvestments: number;
  lessWithdrawals: number;
  endingEquity: number;
}

// Trial Balance types
export interface TrialBalanceAccount extends ReportLineItem {
  accountId: string;
  accountGroup: string;
}

export interface TrialBalanceData {
  asOfDate: string;
  accounts: {
    Asset: TrialBalanceAccount[];
    Liability: TrialBalanceAccount[];
    Equity: TrialBalanceAccount[];
    Revenue: TrialBalanceAccount[];
    Expense: TrialBalanceAccount[];
  };
  totalDebits: number;
  totalCredits: number;
  isBalanced: boolean;
}

// General Ledger types
export interface GeneralLedgerEntry {
  id: string | number;
  date: string;
  description: string;
  debit: number;
  credit: number;
  balance: number;
  reference?: string;
}

export interface GeneralLedgerAccount {
  accountId: string;
  accountNumber: string;
  accountName: string;
  openingBalance: number;
  closingBalance: number;
  entries: GeneralLedgerEntry[];
}

export interface GeneralLedgerData {
  accounts: GeneralLedgerAccount[];
}

// Date formatting helper
export const formatDateToISO = (date: Date): string => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
};
