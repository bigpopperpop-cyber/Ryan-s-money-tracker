
export enum AccountType {
  CHECKING = 'Checking',
  SAVINGS = 'Savings'
}

export enum TransactionType {
  DEPOSIT = 'Deposit',
  WITHDRAWAL = 'Withdrawal'
}

export enum Category {
  FOOD = 'Food',
  GAMES = 'Games',
  SAVINGS = 'Savings Goal',
  GIFTS = 'Gifts',
  ENTERTAINMENT = 'Entertainment',
  ALLOWANCE = 'Allowance',
  OTHER = 'Other'
}

export interface Transaction {
  id: string;
  date: string;
  amount: number;
  type: TransactionType;
  account: AccountType;
  comment: string;
  category: Category;
}

export interface ChartDataPoint {
  date: string;
  balance: number;
}
