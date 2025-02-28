import fetch from "node-fetch";
import {
  robinhoodApiBaseUrl,
  cryptoApiBaseUrl,
  endpoints,
  clientId,
} from "./constants.ts";
import {
  RobinhoodEarnings,
  RobinhoodOrder,
  RobinhoodOrdersOptions,
  RobinhoodResultResponse,
  RobinhoodUser,
  RobinhoodAccount,
  RobinhoodDividend,
  RobinhoodEarningsOptions,
  RobinhoodPosition,
  RobinhoodOrderOptions,
  RobinhoodFundamentals,
  RobinhoodPopularity,
  RobinhoodQuoteData,
  RobinhoodInvestmentProfile,
  RobinhoodInstrument,
  RobinhoodWatchlist,
} from "./types.ts";

export default class RobinhoodApi {
  private authToken: string;
  private headers: Record<string, string>;
  private refreshToken?: string;
  private account?: string;

  constructor(authToken: string) {
    this.authToken = authToken;
    this.headers = {
      Authorization: `Bearer ${authToken}`,
      "Content-Type": "application/json;charset=UTF-8",
    };
  }

  async accounts(): Promise<RobinhoodAccount[]> {
    const url = robinhoodApiBaseUrl + endpoints.accounts;
    const params = new URLSearchParams();
    return this._fetchList(url, params);
  }

  async user(): Promise<RobinhoodUser> {
    const url = robinhoodApiBaseUrl + endpoints.user;
    const params = new URLSearchParams();
    return this._fetch<RobinhoodUser>(url, params);
  }

  async dividends(): Promise<RobinhoodDividend[]> {
    const url = robinhoodApiBaseUrl + endpoints.dividends;
    const params = new URLSearchParams();
    return this._fetchList(url, params);
  }

  async earnings(
    options: RobinhoodEarningsOptions
  ): Promise<RobinhoodEarnings[]> {
    let url = robinhoodApiBaseUrl + endpoints.earnings;
    if (options.instrument) {
      url += "?instrument=" + options.instrument;
    } else if (options.symbol) {
      url += "?symbol=" + options.symbol;
    } else {
      url += "?range=" + (options.range || 1) + "day";
    }
    return await this._fetchList<RobinhoodEarnings>(url, new URLSearchParams());
  }

  async orders(options: RobinhoodOrdersOptions): Promise<RobinhoodOrder[]> {
    const url = robinhoodApiBaseUrl + endpoints.orders;
    const params = new URLSearchParams();
    if (options) {
      if (options.updated_at) {
        params.set("updated_at[gte]", options.updated_at);
        delete options.updated_at;
      }
    }
    return this._fetchList(url, params, options.fetchPagesNumber);
  }

  async positions(): Promise<RobinhoodPosition[]> {
    const url = robinhoodApiBaseUrl + endpoints.positions;
    const params = new URLSearchParams();
    return this._fetchList(url, params);
  }

  async nonzero_positions(): Promise<RobinhoodPosition[]> {
    const url = robinhoodApiBaseUrl + endpoints.positions;
    const params = new URLSearchParams();
    params.set("nonzero", "true");
    return this._fetchList(url, params);
  }

  async crypto_holdings() {
    const url = cryptoApiBaseUrl + endpoints.crypto_holdings;
    const params = new URLSearchParams();
    return this._fetchList(url, params);
  }

  async place_buy_order(
    options: RobinhoodOrderOptions
  ): Promise<RobinhoodOrder> {
    options.side = "buy";
    return this._place_order(options);
  }

  async place_sell_order(
    options: RobinhoodOrderOptions
  ): Promise<RobinhoodOrder> {
    options.side = "sell";
    return this._place_order(options);
  }

  async _place_order(options: RobinhoodOrderOptions): Promise<RobinhoodOrder> {
    const response = await fetch(robinhoodApiBaseUrl + endpoints.orders, {
      method: "POST",
      headers: this.headers,
      body: JSON.stringify({
        account: this.account,
        instrument: options.instrument.url,
        price: options.bid_price,
        stop_price: options.stop_price,
        quantity: options.quantity,
        side: options.side,
        symbol: options.instrument.symbol.toUpperCase(),
        time_in_force: options.time || "gfd",
        trigger: options.trigger || "immediate",
        type: options.type || "market",
      }),
    });
    if (!response.ok) {
      throw new Error("Failed to place order: " + JSON.stringify(response));
    }
    return response.json();
  }

  async fundamentals(ticker: string): Promise<RobinhoodFundamentals> {
    return this._fetch<RobinhoodFundamentals>(
      robinhoodApiBaseUrl +
        endpoints.fundamentals +
        String(ticker).toUpperCase() +
        "/"
    );
  }

  async popularity(symbol: string): Promise<RobinhoodPopularity> {
    const quote = await this.quote_data(symbol);
    const symbol_uuid = quote[0].instrument.split("/")[4];
    return this._fetch<RobinhoodPopularity>(
      robinhoodApiBaseUrl + endpoints.instruments + symbol_uuid + "/popularity/"
    );
  }

  async quote_data(symbol: string): Promise<RobinhoodQuoteData[]> {
    const symbols = Array.isArray(symbol) ? symbol.join(",") : symbol;
    return this._fetchList<RobinhoodQuoteData>(
      robinhoodApiBaseUrl +
        endpoints.quotes +
        `?symbols=${symbols.toUpperCase()}`
    );
  }

  async investment_profile(): Promise<RobinhoodInvestmentProfile> {
    return this._fetch<RobinhoodInvestmentProfile>(
      robinhoodApiBaseUrl + endpoints.investment_profile
    );
  }

  async instruments_by_id(id: string): Promise<RobinhoodInstrument> {
    return this._fetch<RobinhoodInstrument>(
      robinhoodApiBaseUrl + endpoints.instruments + id + "/"
    );
  }

  async instruments(symbol: string): Promise<RobinhoodInstrument[]> {
    return this._fetchList<RobinhoodInstrument>(
      robinhoodApiBaseUrl +
        endpoints.instruments +
        `?query=${symbol.toUpperCase()}`
    );
  }

  async cancel_order(order: string | RobinhoodOrder): Promise<RobinhoodOrder> {
    let cancelUrl;
    if (typeof order === "string") {
      cancelUrl =
        robinhoodApiBaseUrl + endpoints.cancel_order + order + "/cancel/";
    } else if (order.cancel) {
      cancelUrl = order.cancel;
    }
    if (cancelUrl) {
      return this._post<null, RobinhoodOrder>(cancelUrl, null);
    } else {
      if (typeof order === "string") {
        throw new Error("Order cannot be cancelled.");
      } else {
        if (order.state === "cancelled") {
          throw new Error("Order already cancelled.");
        } else {
          throw new Error("Order cannot be cancelled.");
        }
      }
    }
  }

  async watchlists(): Promise<RobinhoodWatchlist[]> {
    return this._fetchList<RobinhoodWatchlist>(
      robinhoodApiBaseUrl + endpoints.watchlists
    );
  }

  async create_watch_list(name: string): Promise<RobinhoodWatchlist> {
    return this._post<{ name: string }, RobinhoodWatchlist>(
      robinhoodApiBaseUrl + endpoints.watchlists,
      { name }
    );
  }

  async sp500_up(): Promise<any> {
    return this._fetchList<any>(robinhoodApiBaseUrl + endpoints.sp500_up);
  }

  async sp500_down(): Promise<any> {
    return this._fetchList<any>(robinhoodApiBaseUrl + endpoints.sp500_down);
  }

  async splits(instrument: string): Promise<any> {
    return this._fetch<any>(
      robinhoodApiBaseUrl +
        endpoints.instruments +
        "/" +
        instrument +
        "/splits/"
    );
  }

  async historicals(symbol: string, intv: string, span: string): Promise<any> {
    return this._fetch<any>(
      robinhoodApiBaseUrl +
        endpoints.quotes +
        "historicals/" +
        symbol +
        "/?interval=" +
        intv +
        "&span=" +
        span
    );
  }

  async url(url: string): Promise<any> {
    const response = await fetch(url, {
      headers: this.headers,
    });
    if (!response.ok) {
      throw new Error("Failed to fetch URL: " + JSON.stringify(response));
    }
    return response.json();
  }

  async news(symbol: string): Promise<any> {
    return this._fetch<any>(
      robinhoodApiBaseUrl + endpoints.news + "/" + symbol
    );
  }

  async tag(tag: string): Promise<any> {
    return this._fetch<any>(robinhoodApiBaseUrl + endpoints.tag + tag);
  }

  async get_currency_pairs(): Promise<any> {
    return this._fetch<any>(cryptoApiBaseUrl + endpoints.currency_pairs);
  }

  async get_crypto(symbol: string): Promise<any> {
    const currencyPairs = await this.get_currency_pairs();
    const assets = currencyPairs.results;
    const asset = assets.find(
      (a) => a.asset_currency.code.toLowerCase() === symbol.toLowerCase()
    );

    if (!asset) {
      const codes = assets.map((a) => a.asset_currency.code);
      throw new Error(
        "Symbol not found. Only these codes are allowed: " +
          JSON.stringify(codes)
      );
    }

    const response = await fetch(
      robinhoodApiBaseUrl + endpoints.crypto + asset.id + "/",
      {
        headers: this.headers,
      }
    );

    if (!response.ok) {
      throw new Error(
        "Failed to fetch crypto data: " + JSON.stringify(response)
      );
    }
    return response.json();
  }

  async options_positions(): Promise<any> {
    return this._fetch<any>(robinhoodApiBaseUrl + endpoints.options_positions);
  }

  async options_orders(): Promise<any> {
    return this._fetch<any>(robinhoodApiBaseUrl + endpoints.options_orders);
  }

  async options_dates(symbol: string): Promise<any> {
    const instruments = await this.instruments(symbol);
    const tradable_chain_id = instruments[0].tradable_chain_id;
    return this._fetch<any>(
      robinhoodApiBaseUrl + endpoints.options_chains + "/" + tradable_chain_id
    );
  }

  async options_available(
    chain_id: string,
    expiration_date: string,
    type = "put"
  ): Promise<any> {
    return this._fetch<any>(
      robinhoodApiBaseUrl +
        endpoints.options_instruments +
        `?chain_id=${chain_id}&type=${type}&expiration_date=${expiration_date}&state=active&tradability=tradable`
    );
  }

  async expire_token(): Promise<any> {
    const response = await fetch(robinhoodApiBaseUrl + endpoints.logout, {
      method: "POST",
      headers: this.headers,
      body: JSON.stringify({
        client_id: clientId,
        token: this.refreshToken,
      }),
    });
    if (!response.ok) {
      throw new Error("Failed to expire token: " + JSON.stringify(response));
    }
    return response.json();
  }

  async set_account(): Promise<void> {
    const accounts = await this.accounts();
    if (accounts.length > 0) {
      this.account = accounts[0].url;
    }
  }

  async refresh_token({ refreshToken, deviceToken }: { refreshToken: string; deviceToken: string }): Promise<any> {
    // Remove any existing Authorization header as shown in the Python code
    const headers = {
      "Content-Type": "application/x-www-form-urlencoded", // Changed to form-urlencoded
    };

    // Convert payload to URLSearchParams as it should be form data, not JSON
    const payload = new URLSearchParams({
      grant_type: "refresh_token",
      refresh_token: refreshToken,
      client_id: clientId,
      scope: "internal",
      expires_in: "86400",
      device_token: deviceToken,
    });

    try {
      const response = await fetch(robinhoodApiBaseUrl + endpoints.login, {
        method: "POST",
        headers: headers,
        body: payload,
      });

      if (!response.ok) {
        const body = await response.text();
        throw new Error(
          `Failed to refresh token: ${response.status} ${response.statusText}, Body: ${body}`
        );
      }

      const data = await response.json();
      return { device_token: deviceToken, ...data };
    } catch (error) {
      console.error("Error refreshing token:", error);
      throw error;
    }
  }

  private async _post<I, R>(url: string, body: I): Promise<R> {
    const response = await fetch(url, {
      method: "POST",
      headers: this.headers,
      body: JSON.stringify(body),
    });
    if (!response.ok) {
      throw new Error("Failed to post data: " + JSON.stringify(response));
    }
    return (await response.json()) as R;
  }

  /**
   * Fetches data from the API.
   * @param url The URL to fetch the data from.
   * @param params The parameters to pass to the API.
   * @returns A promise that resolves to the data.
   */
  private async _fetch<T>(url: string, params?: URLSearchParams): Promise<T> {
    const response = await fetch(url, {
      headers: this.headers,
      params,
    });
    if (!response.ok) {
      throw new Error("Failed to fetch data: " + JSON.stringify(response));
    }
    return (await response.json()) as T;
  }

  /**
   * Fetches a list of items from the API.
   * @param url The URL to fetch the list from.
   * @param params The parameters to pass to the API.
   * @param fetchPagesNumber The number of pages to fetch. If not provided, only the first page will be fetched.
   * @returns A promise that resolves to an array of items.
   */
  private async _fetchList<T>(
    url: string,
    params?: URLSearchParams,
    fetchPagesNumber?: number
  ): Promise<T[]> {
    const response = await this._fetch<RobinhoodResultResponse<T>>(url, params);
    let data = response.results;
    let nextPage = response.next;
    let pagesFetched = 0;
    if (fetchPagesNumber === undefined) {
      return data;
    }
    while (nextPage && pagesFetched < fetchPagesNumber) {
      const nextResponse = await this._fetch<RobinhoodResultResponse<T>>(
        nextPage,
        new URLSearchParams()
      );
      data = data.concat(nextResponse.results);
      nextPage = nextResponse.next;
      pagesFetched++;
    }
    return data;
  }
}
