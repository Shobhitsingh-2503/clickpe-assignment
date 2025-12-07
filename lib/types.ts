export interface Product {
  id: string;
  name: string;
  bank: string;

  type:
    | "personal"
    | "education"
    | "vehicle"
    | "home"
    | "credit_line"
    | "debt_consolidation "
    | null;

  rate_apr: number;
  min_income: number;
  min_credit_score: number;

  tenure_min_months?: number | null;
  tenure_max_months?: number | null;

  processing_fee_pct?: number | null;
  prepayment_allowed?: boolean | null;

  disbursal_speed?: "instant" | "fast" | "standard" | null;
  docs_level?: "minimal" | "standard" | "high" | null;

  summary?: string | null;

  faq?: any[] | null;
  terms?: Record<string, any> | null;
}
