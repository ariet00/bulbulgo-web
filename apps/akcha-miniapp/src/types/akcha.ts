export type TxType = 'income' | 'expense' | 'transfer'

export interface Wallet {
  id: number
  user_id: number
  name: string
  currency: string | null
  balance: number | null
  color: string | null
  icon: string | null
  source: string
}

export interface FinanceCategory {
  id: number
  user_id: number
  name: string
  type: 'income' | 'expense'
  icon: string | null
  color: string | null
  parent_id: number | null
}

export interface Transaction {
  id: number
  user_id: number
  wallet_id: number
  category_id: number | null
  debt_id: number | null
  amount: number
  type: TxType
  description: string | null
  date: string
  source: string
}

export type DebtType = 'i_owe' | 'they_owe'

export interface Contractor {
  id: number
  user_id: number | null
  company_id: number | null
  linked_user_id: number | null
  name: string
  phone: string | null
  created_at: string
}

export interface Debt {
  id: number
  user_id: number
  amount: number
  type: DebtType
  due_date: string | null
  description: string | null
  contractor_id: number | null
  contractor: Contractor | null
  remaining_amount: number | null
  is_closed: boolean
  created_at: string
}

export interface UserSettings {
  source: string
  currency_id: number | null
  currency_code: string | null
  timezone: string
  data: Record<string, any>
}

export interface AkchaMe {
  user: { id: number; name: string | null; surname: string | null; username: string | null }
  settings: UserSettings
  default_wallet: Wallet
  currency_code: string | null
  wallets_count: number
}

export interface DebtsSummary {
  i_owe_total: number
  they_owe_total: number
  net: number
}

export interface TxSummary {
  period: string
  from: string
  to: string
  income_total: number
  income_count: number
  expense_total: number
  expense_count: number
  net: number
}
