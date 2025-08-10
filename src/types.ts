import RobinhoodApi from "./api.js";

export interface RobinhoodOrdersOptions {
  fetchAfter?: string;
  fetchMaxPages?: number;
}

export interface RobinhoodEarningsOptions {
  instrument?: string;
  symbol?: string;
  range?: number;
}

export interface RobinhoodOrderOptions {
  instrument: { url: string; symbol: string };
  bid_price: number;
  quantity: number;
  side: "buy" | "sell";
  type: "limit" | "market";
  stop_price?: number;
  time?: "gfd" | "gtc";
  trigger?: "immediate" | "stop";
  market_hours: "extended_hours" | "all_day_hours" | "regular_hours";
}

export interface RobinhoodWatchlist {}
export interface RobinhoodInvestmentProfile {}
export interface RobinhoodFundamentals {}
export interface RobinhoodPopularity {}
export interface RobinhoodQuoteData {
  instrument: string;
}

export interface RobinhoodOrder {
  id: string;
  account: string;
  user_uuid: string;
  side: "buy" | "sell";
  type: "limit" | "market";
  trigger: "immediate" | "stop";
  state: "pending" | "filled" | "partially_filled" | "cancelled";
  quantity: number;
  price: string;
  time_in_force: string;
  instrument_id: string;
  tax_lot_selection_type: string;
  created_at: string;
  cancel: string | null;
  reject_reason: string | null;
  market_hours: "extended_hours" | "all_day_hours" | "regular_hours";
  extended_hours: boolean;
  user_cancel_request_state: string;
}

export interface RobinhoodUser {}
export interface RobinhoodDividend {}
export interface RobinhoodTransfer {
  id: string;
  ref_id: string;
  url: string;
  cancel: string | null;
  ach_relationship: string;
  account: string;
  amount: string;
  direction: "deposit" | "withdraw";
  state: "completed" | string;
  fees: string;
  status_description: string;
  scheduled: boolean;
  expected_landing_date: string;
  early_access_amount: string;
  created_at: string;
  updated_at: string;
  rhs_state: string;
  expected_sweep_at: string | null;
  expected_landing_datetime: string;
  investment_schedule_id: string | null;
  managed_by_ph: boolean;
  instant_limit_to_grant: string;
}

export interface RobinhoodInstrument {
  symbol: string;
  id: string;
  url: string;
  name: string;
  tradable_chain_id: string;
}

export interface RobinhoodAccount {
  account_number: string;
  url: string;
  portfolio_cash: string;
  unsettled_funds: string;
  buying_power: string;
  deactivated: boolean;
  state: "active" | "closed" | "inactive";
}

export interface RobinhoodCryptoHolding {
  id: string;
  quantity: string;
  currency_pair_id: string;
  currency: {
    code: string;
    name: string;
  };
  cost_bases: {
    direct_quantity: string;
    direct_cost_basis: string;
  }[];
}

export interface RobinhoodPosition {
  url: string;
  instrument: string;
  instrument_id: string;
  symbol: string;
  account: string;
  account_number: string;
  brokerage_account_type: string;
  average_buy_price: string;
  pending_average_buy_price: string;
  quantity: string;
  intraday_average_buy_price: string;
  intraday_quantity: string;
  shares_available_for_exercise: string;
  shares_available_for_sells: string;
  shares_held_for_buys: string;
  shares_held_for_sells: string;
  shares_held_for_stock_grants: string;
  shares_held_for_options_collateral: string;
  shares_held_for_options_events: string;
  shares_pending_from_options_events: string;
  shares_available_for_closing_short_position: string;
  ipo_allocated_quantity: string;
  ipo_dsp_allocated_quantity: string;
  avg_cost_affected: boolean;
  avg_cost_affected_reason: string | null;
  is_primary_account: boolean;
  updated_at: string;
  created_at: string;
  instrument_is_halted: boolean;
  clearing_cost_basis: string;
  clearing_average_cost: string;
  clearing_running_quantity: string;
  clearing_intraday_cost_basis: string;
  clearing_intraday_running_quantity: string;
  custom_tax_lot_selection_eligible: boolean;
  has_selectable_lots: boolean;
  fetch_tax_lot_related_info: boolean;
}

export interface RobinhoodResultResponse<T> {
  results: T[];
  next?: string;
  previous?: string;
}

export interface RobinhoodEarnings {}

export type AuthResponse =
  | AuthResponseError
  | AuthResponseAwaitingInput
  | AuthResponseSuccess;

export interface AuthResponseError {
  status: string;
  message: string;
}

export interface AuthResponseAwaitingInput {
  status: string;
  message: string;
  workflow_id: string;
  authType: string;
}

export interface TokenData {
  access_token: string;
}

export interface AuthResponseSuccess {
  status: string;
  tokenData: TokenData;
  api: RobinhoodApi;
}

export type RobinhoodCredentials = {
  username?: string;
  password?: string;
  token?: string;
  deviceToken?: string;
};
