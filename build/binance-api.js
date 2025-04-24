import axios from 'axios';
import crypto from 'crypto-js';
export class BinanceAPI {
    constructor(credentials) {
        this.baseUrl = 'https://api.binance.com';
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
    async getPrice(symbol) {
        try {
            const params = symbol ? { symbol } : {};
            const response = await this.client.get('/api/v3/ticker/price', { params });
            return response.data;
        }
        catch (error) {
            console.error('Error getting price:', error);
            throw error;
        }
    }
    /**
     * Get 24hr ticker price change statistics
     * @param symbol Optional symbol (e.g., 'BTCUSDT')
     * @returns Ticker information
     */
    async get24hrTicker(symbol) {
        try {
            const params = symbol ? { symbol } : {};
            const response = await this.client.get('/api/v3/ticker/24hr', { params });
            return response.data;
        }
        catch (error) {
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
    async getKlines(symbol, interval, limit, startTime, endTime) {
        try {
            const params = { symbol, interval };
            if (limit)
                params.limit = limit;
            if (startTime)
                params.startTime = startTime;
            if (endTime)
                params.endTime = endTime;
            const response = await this.client.get('/api/v3/klines', { params });
            // Transform the response to a more usable format
            return response.data.map((kline) => ({
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
        }
        catch (error) {
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
    async getOrderBook(symbol, limit) {
        try {
            const params = { symbol };
            if (limit)
                params.limit = limit;
            const response = await this.client.get('/api/v3/depth', { params });
            // Transform the response to a more usable format
            return {
                lastUpdateId: response.data.lastUpdateId,
                bids: response.data.bids.map((bid) => ({
                    price: bid[0],
                    quantity: bid[1],
                })),
                asks: response.data.asks.map((ask) => ({
                    price: ask[0],
                    quantity: ask[1],
                })),
            };
        }
        catch (error) {
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
    async getRecentTrades(symbol, limit) {
        try {
            const params = { symbol };
            if (limit)
                params.limit = limit;
            const response = await this.client.get('/api/v3/trades', { params });
            return response.data;
        }
        catch (error) {
            console.error('Error getting recent trades:', error);
            throw error;
        }
    }
    // ======== ACCOUNT ENDPOINTS ========
    /**
     * Get account information including balances
     * @returns Account information
     */
    async getAccountInfo() {
        try {
            const timestamp = Date.now();
            const params = { timestamp };
            const signature = this.generateSignature(params);
            const response = await this.client.get('/api/v3/account', {
                params: { ...params, signature },
            });
            return response.data;
        }
        catch (error) {
            console.error('Error getting account info:', error);
            throw error;
        }
    }
    /**
     * Get trades for a specific symbol
     * @param params Trade list parameters
     * @returns Trade information
     */
    async getMyTrades(params) {
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
        }
        catch (error) {
            console.error('Error getting trades:', error);
            throw error;
        }
    }
    /**
     * Get current open orders for a symbol or all symbols
     * @param symbol Optional symbol (e.g., 'BTCUSDT')
     * @returns Open orders
     */
    async getOpenOrders(symbol) {
        try {
            const timestamp = Date.now();
            const params = { timestamp };
            if (symbol)
                params.symbol = symbol;
            const signature = this.generateSignature(params);
            const response = await this.client.get('/api/v3/openOrders', {
                params: { ...params, signature },
            });
            return response.data;
        }
        catch (error) {
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
    async getAllOrders(symbol, orderId, startTime, endTime, limit) {
        try {
            const timestamp = Date.now();
            const params = { symbol, timestamp };
            if (orderId)
                params.orderId = orderId;
            if (startTime)
                params.startTime = startTime;
            if (endTime)
                params.endTime = endTime;
            if (limit)
                params.limit = limit;
            const signature = this.generateSignature(params);
            const response = await this.client.get('/api/v3/allOrders', {
                params: { ...params, signature },
            });
            return response.data;
        }
        catch (error) {
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
    async placeOrder(orderParams) {
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
        }
        catch (error) {
            console.error('Error placing order:', error);
            throw error;
        }
    }
    /**
     * Cancel an active order
     * @param params Cancel order parameters
     * @returns Canceled order information
     */
    async cancelOrder(params) {
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
        }
        catch (error) {
            console.error('Error canceling order:', error);
            throw error;
        }
    }
    /**
     * Cancel all open orders on a symbol
     * @param symbol Symbol (e.g., 'BTCUSDT')
     * @returns Canceled orders information
     */
    async cancelAllOrders(symbol) {
        try {
            const timestamp = Date.now();
            const params = { symbol, timestamp };
            const signature = this.generateSignature(params);
            const response = await this.client.delete('/api/v3/openOrders', {
                params: { ...params, signature },
            });
            return response.data;
        }
        catch (error) {
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
    async getOrder(symbol, orderId, clientOrderId) {
        try {
            const timestamp = Date.now();
            const params = { symbol, timestamp };
            if (orderId)
                params.orderId = orderId;
            if (clientOrderId)
                params.clientOrderId = clientOrderId;
            const signature = this.generateSignature(params);
            const response = await this.client.get('/api/v3/order', {
                params: { ...params, signature },
            });
            return response.data;
        }
        catch (error) {
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
    async getDepositAddress(params) {
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
        }
        catch (error) {
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
    async getDepositHistory(coin, status, startTime, endTime, offset, limit) {
        try {
            const timestamp = Date.now();
            const params = { timestamp };
            if (coin)
                params.coin = coin;
            if (status !== undefined)
                params.status = status;
            if (startTime)
                params.startTime = startTime;
            if (endTime)
                params.endTime = endTime;
            if (offset)
                params.offset = offset;
            if (limit)
                params.limit = limit;
            const signature = this.generateSignature(params);
            const response = await this.client.get('/sapi/v1/capital/deposit/hisrec', {
                params: { ...params, signature },
            });
            return response.data;
        }
        catch (error) {
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
    async getWithdrawHistory(coin, status, startTime, endTime, offset, limit) {
        try {
            const timestamp = Date.now();
            const params = { timestamp };
            if (coin)
                params.coin = coin;
            if (status !== undefined)
                params.status = status;
            if (startTime)
                params.startTime = startTime;
            if (endTime)
                params.endTime = endTime;
            if (offset)
                params.offset = offset;
            if (limit)
                params.limit = limit;
            const signature = this.generateSignature(params);
            const response = await this.client.get('/sapi/v1/capital/withdraw/history', {
                params: { ...params, signature },
            });
            return response.data;
        }
        catch (error) {
            console.error('Error getting withdrawal history:', error);
            throw error;
        }
    }
    /**
     * Submit a withdrawal request
     * @param params Withdrawal parameters
     * @returns Withdrawal response
     */
    async withdraw(params) {
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
        }
        catch (error) {
            console.error('Error submitting withdrawal:', error);
            throw error;
        }
    }
    /**
     * Generate HMAC SHA256 signature for API request
     * @param params Request parameters
     * @returns Signature string
     */
    generateSignature(params) {
        const queryString = Object.keys(params)
            .map(key => `${key}=${params[key]}`)
            .join('&');
        return crypto.HmacSHA256(queryString, this.apiSecret).toString();
    }
}
