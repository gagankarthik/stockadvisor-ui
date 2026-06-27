// Types mirroring the MarketDesk FastAPI responses.

export interface Health {
  status: string;
  version: string;
  snapshot_available: boolean;
  snapshot_age_seconds: number | null;
  snapshot_stale: boolean;
  data_through: string | null;
}

export interface ModelCard {
  trained_at?: string | null;
  data_through?: string | null;
  horizon_days?: number | null;
  n_stocks?: number | null;
  test_auc?: number | null;
  test_accuracy?: number | null;
  test_ic?: number | null;
  cv_auc?: number | null;
  cv_ic?: number | null;
  model_name?: string | null;
  sklearn_version?: string | null;
  feature_importances?: Record<string, number>;
}

export interface ModelHistoryEntry {
  trained_at: string;
  data_through: string;
  auc: number;
  accuracy: number;
  ic?: number;
  cv_auc?: number;
  cv_ic?: number;
  n_stocks: number;
  train_samples: number;
}

export interface Breadth {
  above_200dma: number;
  above_50dma: number;
  advancing_today: number;
  uptrend_share: number;
}

export interface SectorRow {
  Sector: string;
  "1D %": number;
  "1M %": number;
  "3M %": number;
  "6M %": number;
  Stocks: number;
}

export interface MoverRow {
  Ticker: string;
  Name: string;
  Price: number;
  "1D %": number;
  "1M %": number;
}

export interface EtfRow {
  ticker: string;
  name: string;
  sector: string;
  price: number;
  change_pct: number;
}

export interface Dashboard {
  generated_at: string;
  data_through: string;
  regime: "RISK-ON" | "NEUTRAL" | "RISK-OFF" | string;
  vix: number | null;
  breadth: Breadth;
  sectors: SectorRow[];
  movers: { gainers: MoverRow[]; losers: MoverRow[] };
  etfs: EtfRow[];
  ics: Record<string, number>;
  model: ModelCard | null;
}

export interface StockRow {
  ticker: string;
  name: string | null;
  sector: string | null;
  price: number | null;
  score: number | null;
  ml_pct: number | null;
  confidence_pct: number | null;
  lean: string | null;
  signal: "BUY" | "HOLD" | "SELL" | null;
  rsi: number | null;
  volatility_pct: number | null;
  ret_1m_pct: number | null;
  ret_12_1m_pct: number | null;
  reasons: string | null;
}

export interface Screener {
  profile: string;
  adaptive: boolean;
  use_ml: boolean;
  count: number;
  data_through: string;
  stocks: StockRow[];
}

export interface Validation {
  status: string;
  icon: string;
  spread_pct?: number;
  detail: string;
  sources: Record<string, number>;
}

export interface NewsItem {
  title: string;
  url: string;
  provider: string;
  date: string;
}

export interface PriceBar {
  date: string;
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
}

export interface StockDetail {
  ticker: string;
  quote: { price: number; change_pct: number } | null;
  validation: Validation;
  profile: Record<string, unknown> | null;
  recommendations: Record<string, number> | null;
  news: NewsItem[];
  snapshot: StockRow | null;
  history: PriceBar[];
}

export interface AllocationRow {
  Ticker: string;
  Name: string;
  Type: string;
  Sector: string;
  "Allocation $": number;
  "Weight %": number;
  Price: number;
  Shares: number;
}

export interface RiskAnalysis {
  ann_vol_pct: number;
  risk_level: "LOW" | "MEDIUM" | "HIGH" | string;
  max_drawdown_pct: number;
  max_drawdown_usd: number;
  bad_month_usd: number;
  best_month_usd: number;
  backtest_return_pct: number;
  largest_position_pct: number;
  n_sectors: number;
  avg_correlation: number | null;
  etf_pct: number;
}

export interface Allocation {
  amount: number;
  profile: string;
  spy_price: number | null;
  allocation: AllocationRow[];
  risk: RiskAnalysis;
}

export interface PlanRow {
  index: number;
  saved_at: string;
  days_held: number;
  review: string;
  profile: string;
  invested_usd: number;
  value_now_usd: number;
  pnl_usd: number;
  pnl_pct: number;
  spy_same_day_pct: number;
  vs_market: "BEATING" | "TRAILING" | string;
}

export type RiskProfile = "Conservative" | "Balanced" | "Aggressive";

export interface DeskNote {
  headline: string;
  summary: string;
  risks: string;
  source: "openai" | "fallback";
  model: string | null;
  generated_at: string;
  disclaimer: string;
  cached?: boolean;
}
