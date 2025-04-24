import axios, { AxiosInstance, AxiosRequestConfig } from 'axios';
import crypto from 'crypto-js';

export interface BinanceCredentials {
  apiKey: string;
  apiSecret: string;
}

export interface PriceInfo {
  symbol: string;
  price: string;
}

export interface OrderParams {
  symbol: string;
  side: 'BUY' | 'SELL';
  type: 'LIMIT' | 'MARKET';
  quantity: string;
  price?: string; // Required for LIMIT orders
  timeInForce?: 'GTC' | 'IOC' | 'FOK'; // Required for LIMIT orders
}

export interface AccountInfo {
  balances: Array<{
    asset: string;
    free: string;
    locked: string;
  }>;
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
   * Place a new order
   * @param orderParams Order parameters
   * @returns Order response
   */
  async placeOrder(orderParams: OrderParams): Promise<any> {
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
