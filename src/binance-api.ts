import axios, { AxiosInstance, AxiosRequestConfig } from 'axios';
import crypto from 'crypto-js';

export interface BinanceCredentials {
  apiKey: string;
  apiSecret: string;
}

// Market Data Interfaces
export interface PriceInfo {
  symbol: string;
  price: string;
}

export interface TickerInfo {
  symbol: string;
  priceChange: string;
  priceChangePercent: string;
  weightedAvgPrice: string;
  prevClosePrice: string;
  lastPrice: string;
  lastQty: string;
  bidPrice: string;
  bidQty: string;
  askPrice: string;
  askQty: string;
  openPrice: string;
  highPrice: string;
  lowPrice: string;
  volume: string;
  quoteVolume: string;
  openTime: number;
  closeTime: number;
  firstId: number;
  lastId: number;
  count: number;
}

export interface KlineData {
  openTime: number;
  open: string;
  high: string;
  low: string;
  close: string;
  volume: string;
  closeTime: number;
  quoteAssetVolume: string;
  numberOfTrades: number;
  takerBuyBaseAssetVolume: string;
  takerBuyQuoteAssetVolume: string;
}

export interface OrderBookEntry {
  price: string;
  quantity: string;
}

export interface OrderBook {
  lastUpdateId: number;
  bids: OrderBookEntry[];
  asks: OrderBookEntry[];
}

// Trading Interfaces
export interface OrderParams {
  symbol: string;
  side: 'BUY' | 'SELL';
  type: 'LIMIT' | 'MARKET' | 'STOP_LOSS' | 'STOP_LOSS_LIMIT' | 'TAKE_PROFIT' | 'TAKE_PROFIT_LIMIT' | 'LIMIT_MAKER';
  quantity: string;
  price?: string;
  timeInForce?: 'GTC' | 'IOC' | 'FOK';
  newClientOrderId?: string;
  stopPrice?: string;
  icebergQty?: string;
  newOrderRespType?: 'ACK' | 'RESULT' | 'FULL';
}

export interface OrderResponse {
  symbol: string;
  orderId: number;
  orderListId: number;
  clientOrderId: string;
  transactTime: number;
  price: string;
  origQty: string;
  executedQty: string;
  cummulativeQuoteQty: string;
  status: string;
  timeInForce: string;
  type: string;
  side: string;
}

export interface CancelOrderParams {
  symbol: string;
  orderId?: number;
  clientOrderId?: string;
}

// Account Interfaces
export interface AccountInfo {
  makerCommission: number;
  takerCommission: number;
  buyerCommission: number;
  sellerCommission: number;
  canTrade: boolean;
  canWithdraw: boolean;
  canDeposit: boolean;
  updateTime: number;
  accountType: string;
  balances: Array<{
    asset: string;
    free: string;
    locked: string;
  }>;
  permissions: string[];
}

export interface TradeListParams {
  symbol: string;
  orderId?: number;
  startTime?: number;
  endTime?: number;
  fromId?: number;
  limit?: number;
}

export interface TradeInfo {
  id: number;
  orderId: number;
  price: string;
  qty: string;
  quoteQty: string;
  commission: string;
  commissionAsset: string;
  time: number;
  isBuyer: boolean;
  isMaker: boolean;
  isBestMatch: boolean;
}

// Wallet Interfaces
export interface DepositAddressParams {
  coin: string;
  network?: string;
}

export interface DepositAddress {
  address: string;
  coin: string;
  tag?: string;
  url?: string;
  network?: string;
}

export interface WithdrawParams {
  coin: string;
  address: string;
  amount: string;
  network?: string;
  name?: string;
  addressTag?: string;
}

export interface WithdrawResponse {
  id: string;
}

export class BinanceAPI {
  private baseUrl = 'https://api.binance.com';
  private apiKey: string;
  private apiSecret: string;
  private client: AxiosInstance;

  constructor(credentials: BinanceCredentials) {
    this.apiKey = credentials.apiKey;
    this.apiSecret = credentials.apiSecret;
    this.client = axios.create({
      baseURL: this.baseUrl,
      headers: {
        'X-MBX-APIKEY': this.apiKey,
      },
    });
  }

  // ======== MARKET DATA ENDPOINTS ========

  /**
   * Get the current price for a symbol or all symbols
   * @param symbol Optional symbol (e.g., 'BTCUSDT')
   * @returns Price information
   */
  async getPrice(symbol?: string): Promise<PriceInfo | PriceInfo[]> {
    try {
      const params = symbol ? { symbol } : {};
      const response = await this.client.get('/api/v3/ticker/price', { params });
      return response.data;
    } catch (error) {
      console.error('Error getting price:', error);
      throw error;
    }
  }

  /**
   * Get 24hr ticker price change statistics
   * @param symbol Optional symbol (e.g., 'BTCUSDT')
   * @returns Ticker information
   */
  async get24hrTicker(symbol?: string): Promise<TickerInfo | TickerInfo[]> {
    try {
      const params = symbol ? { symbol } : {};
      const response = await this.client.get('/api/v3/ticker/24hr', { params });
      return response.data;
    } catch (error) {
      console.error('Error getting 24hr ticker:', error);
      throw error;
    }
  }

  /**
   * Get candlestick data (klines)
   * @param symbol Symbol (e.g., 'BTCUSDT')
   * @param interval Interval (e.g., '1m', '1h', '1d')
   * @param limit Optional number of entries to return (default 500, max 1000)
   * @param startTime Optional start time in milliseconds
   * @param endTime Optional end time in milliseconds
   * @returns Kline data
   */
  async getKlines(
    symbol: string,
    interval: string,
    limit?: number,
    startTime?: number,
    endTime?: number
  ): Promise<KlineData[]> {
    try {
      const params: any = { symbol, interval };
      if (limit) params.limit = limit;
      if (startTime) params.startTime = startTime;
      if (endTime) params.endTime = endTime;

      const response = await this.client.get('/api/v3/klines', { params });
      
      // Transform the response to a more usable format
      return response.data.map((kline: any[]) => ({
        openTime: kline[0],
        open: kline[1],
        high: kline[2],
        low: kline[3],
        close: kline[4],
        volume: kline[5],
        closeTime: kline[6],
        quoteAssetVolume: kline[7],
        numberOfTrades: kline[8],
        takerBuyBaseAssetVolume: kline[9],
        takerBuyQuoteAssetVolume: kline[10],
      }));
    } catch (error) {
      console.error('Error getting klines:', error);
      throw error;
    }
  }

  /**
   * Get order book for a symbol
   * @param symbol Symbol (e.g., 'BTCUSDT')
   * @param limit Optional depth of the order book (default 100, max 5000)
   * @returns Order book
   */
  async getOrderBook(symbol: string, limit?: number): Promise<OrderBook> {
    try {
      const params: any = { symbol };
      if (limit) params.limit = limit;

      const response = await this.client.get('/api/v3/depth', { params });
      
      // Transform the response to a more usable format
      return {
        lastUpdateId: response.data.lastUpdateId,
        bids: response.data.bids.map((bid: string[]) => ({
          price: bid[0],
          quantity: bid[1],
        })),
        asks: response.data.asks.map((ask: string[]) => ({
          price: ask[0],
          quantity: ask[1],
        })),
      };
    } catch (error) {
      console.error('Error getting order book:', error);
      throw error;
    }
  }

  /**
   * Get recent trades for a symbol
   * @param symbol Symbol (e.g., 'BTCUSDT')
   * @param limit Optional number of trades to return (default 500, max 1000)
   * @returns Recent trades
   */
  async getRecentTrades(symbol: string, limit?: number): Promise<any[]> {
    try {
      const params: any = { symbol };
      if (limit) params.limit = limit;

      const response = await this.client.get('/api/v3/trades', { params });
      return response.data;
    } catch (error) {
      console.error('Error getting recent trades:', error);
      throw error;
    }
  }

  // ======== ACCOUNT ENDPOINTS ========

  /**
   * Get account information including balances
   * @returns Account information
   */
  async getAccountInfo(): Promise<AccountInfo> {
    try {
      const timestamp = Date.now();
      const params = { timestamp };
      const signature = this.generateSignature(params);
      
      const response = await this.client.get('/api/v3/account', {
        params: { ...params, signature },
      });
      
      return response.data;
    } catch (error) {
      console.error('Error getting account info:', error);
      throw error;
    }
  }

  /**
   * Get trades for a specific symbol
   * @param params Trade list parameters
   * @returns Trade information
   */
  async getMyTrades(params: TradeListParams): Promise<TradeInfo[]> {
    try {
      const timestamp = Date.now();
      const requestParams = {
        ...params,
        timestamp,
      };
      
      const signature = this.generateSignature(requestParams);
      
      const response = await this.client.get('/api/v3/myTrades', {
        params: { ...requestParams, signature },
      });
      
      return response.data;
    } catch (error) {
      console.error('Error getting trades:', error);
      throw error;
    }
  }

  /**
   * Get current open orders for a symbol or all symbols
   * @param symbol Optional symbol (e.g., 'BTCUSDT')
   * @returns Open orders
   */
  async getOpenOrders(symbol?: string): Promise<any[]> {
    try {
      const timestamp = Date.now();
      const params: any = { timestamp };
      if (symbol) params.symbol = symbol;
      
      const signature = this.generateSignature(params);
      
      const response = await this.client.get('/api/v3/openOrders', {
        params: { ...params, signature },
      });
      
      return response.data;
    } catch (error) {
      console.error('Error getting open orders:', error);
      throw error;
    }
  }

  /**
   * Get all orders for a symbol (active, canceled, or filled)
   * @param symbol Symbol (e.g., 'BTCUSDT')
   * @param orderId Optional order ID to start from
   * @param startTime Optional start time in milliseconds
   * @param endTime Optional end time in milliseconds
   * @param limit Optional number of entries to return (default 500, max 1000)
   * @returns Order information
   */
  async getAllOrders(
    symbol: string,
    orderId?: number,
    startTime?: number,
    endTime?: number,
    limit?: number
  ): Promise<any[]> {
    try {
      const timestamp = Date.now();
      const params: any = { symbol, timestamp };
      
      if (orderId) params.orderId = orderId;
      if (startTime) params.startTime = startTime;
      if (endTime) params.endTime = endTime;
      if (limit) params.limit = limit;
      
      const signature = this.generateSignature(params);
      
      const response = await this.client.get('/api/v3/allOrders', {
        params: { ...params, signature },
      });
      
      return response.data;
    } catch (error) {
      console.error('Error getting all orders:', error);
      throw error;
    }
  }

  // ======== TRADING ENDPOINTS ========

  /**
   * Place a new order
   * @param orderParams Order parameters
   * @returns Order response
   */
  async placeOrder(orderParams: OrderParams): Promise<OrderResponse> {
    try {
      const timestamp = Date.now();
      const params = {
        ...orderParams,
        timestamp,
      };
      
      const signature = this.generateSignature(params);
      
      const response = await this.client.post('/api/v3/order', null, {
        params: { ...params, signature },
      });
      
      return response.data;
    } catch (error) {
      console.error('Error placing order:', error);
      throw error;
    }
  }

  /**
   * Cancel an active order
   * @param params Cancel order parameters
   * @returns Canceled order information
   */
  async cancelOrder(params: CancelOrderParams): Promise<any> {
    try {
      const timestamp = Date.now();
      const requestParams = {
        ...params,
        timestamp,
      };
      
      const signature = this.generateSignature(requestParams);
      
      const response = await this.client.delete('/api/v3/order', {
        params: { ...requestParams, signature },
      });
      
      return response.data;
    } catch (error) {
      console.error('Error canceling order:', error);
      throw error;
    }
  }

  /**
   * Cancel all open orders on a symbol
   * @param symbol Symbol (e.g., 'BTCUSDT')
   * @returns Canceled orders information
   */
  async cancelAllOrders(symbol: string): Promise<any[]> {
    try {
      const timestamp = Date.now();
      const params = { symbol, timestamp };
      
      const signature = this.generateSignature(params);
      
      const response = await this.client.delete('/api/v3/openOrders', {
        params: { ...params, signature },
      });
      
      return response.data;
    } catch (error) {
      console.error('Error canceling all orders:', error);
      throw error;
    }
  }

  /**
   * Check an order's status
   * @param symbol Symbol (e.g., 'BTCUSDT')
   * @param orderId Optional order ID
   * @param clientOrderId Optional client order ID
   * @returns Order status
   */
  async getOrder(symbol: string, orderId?: number, clientOrderId?: string): Promise<any> {
    try {
      const timestamp = Date.now();
      const params: any = { symbol, timestamp };
      
      if (orderId) params.orderId = orderId;
      if (clientOrderId) params.clientOrderId = clientOrderId;
      
      const signature = this.generateSignature(params);
      
      const response = await this.client.get('/api/v3/order', {
        params: { ...params, signature },
      });
      
      return response.data;
    } catch (error) {
      console.error('Error getting order:', error);
      throw error;
    }
  }

  // ======== WALLET ENDPOINTS ========

  /**
   * Get deposit address for a coin
   * @param params Deposit address parameters
   * @returns Deposit address information
   */
  async getDepositAddress(params: DepositAddressParams): Promise<DepositAddress> {
    try {
      const timestamp = Date.now();
      const requestParams = {
        ...params,
        timestamp,
      };
      
      const signature = this.generateSignature(requestParams);
      
      const response = await this.client.get('/sapi/v1/capital/deposit/address', {
        params: { ...requestParams, signature },
      });
      
      return response.data;
    } catch (error) {
      console.error('Error getting deposit address:', error);
      throw error;
    }
  }

  /**
   * Get deposit history
   * @param coin Optional coin (e.g., 'BTC')
   * @param status Optional status (0: pending, 1: success)
   * @param startTime Optional start time in milliseconds
   * @param endTime Optional end time in milliseconds
   * @param offset Optional offset
   * @param limit Optional limit
   * @returns Deposit history
   */
  async getDepositHistory(
    coin?: string,
    status?: number,
    startTime?: number,
    endTime?: number,
    offset?: number,
    limit?: number
  ): Promise<any[]> {
    try {
      const timestamp = Date.now();
      const params: any = { timestamp };
      
      if (coin) params.coin = coin;
      if (status !== undefined) params.status = status;
      if (startTime) params.startTime = startTime;
      if (endTime) params.endTime = endTime;
      if (offset) params.offset = offset;
      if (limit) params.limit = limit;
      
      const signature = this.generateSignature(params);
      
      const response = await this.client.get('/sapi/v1/capital/deposit/hisrec', {
        params: { ...params, signature },
      });
      
      return response.data;
    } catch (error) {
      console.error('Error getting deposit history:', error);
      throw error;
    }
  }

  /**
   * Get withdrawal history
   * @param coin Optional coin (e.g., 'BTC')
   * @param status Optional status (0: Email Sent, 1: Cancelled, 2: Awaiting Approval, 3: Rejected, 4: Processing, 5: Failure, 6: Completed)
   * @param startTime Optional start time in milliseconds
   * @param endTime Optional end time in milliseconds
   * @param offset Optional offset
   * @param limit Optional limit
   * @returns Withdrawal history
   */
  async getWithdrawHistory(
    coin?: string,
    status?: number,
    startTime?: number,
    endTime?: number,
    offset?: number,
    limit?: number
  ): Promise<any[]> {
    try {
      const timestamp = Date.now();
      const params: any = { timestamp };
      
      if (coin) params.coin = coin;
      if (status !== undefined) params.status = status;
      if (startTime) params.startTime = startTime;
      if (endTime) params.endTime = endTime;
      if (offset) params.offset = offset;
      if (limit) params.limit = limit;
      
      const signature = this.generateSignature(params);
      
      const response = await this.client.get('/sapi/v1/capital/withdraw/history', {
        params: { ...params, signature },
      });
      
      return response.data;
    } catch (error) {
      console.error('Error getting withdrawal history:', error);
      throw error;
    }
  }

  /**
   * Submit a withdrawal request
   * @param params Withdrawal parameters
   * @returns Withdrawal response
   */
  async withdraw(params: WithdrawParams): Promise<WithdrawResponse> {
    try {
      const timestamp = Date.now();
      const requestParams = {
        ...params,
        timestamp,
      };
      
      const signature = this.generateSignature(requestParams);
      
      const response = await this.client.post('/sapi/v1/capital/withdraw/apply', null, {
        params: { ...requestParams, signature },
      });
      
      return response.data;
    } catch (error) {
      console.error('Error submitting withdrawal:', error);
      throw error;
    }
  }

  /**
   * Generate HMAC SHA256 signature for API request
   * @param params Request parameters
   * @returns Signature string
   */
  private generateSignature(params: any): string {
    const queryString = Object.keys(params)
      .map(key => `${key}=${params[key]}`)
      .join('&');
    
    return crypto.HmacSHA256(queryString, this.apiSecret).toString();
  }
}
