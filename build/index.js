#!/usr/bin/env node
import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import { CallToolRequestSchema, ErrorCode, ListToolsRequestSchema, McpError, } from '@modelcontextprotocol/sdk/types.js';
import { BinanceAPI } from './binance-api.js';
// Get API credentials from environment variables
const API_KEY = process.env.BINANCE_API_KEY;
const API_SECRET = process.env.BINANCE_API_SECRET;
if (!API_KEY || !API_SECRET) {
    throw new Error('BINANCE_API_KEY and BINANCE_API_SECRET environment variables are required');
}
const credentials = {
    apiKey: API_KEY,
    apiSecret: API_SECRET,
};
class BinanceServer {
    constructor() {
        this.server = new Server({
            name: 'binance-server',
            version: '1.0.0',
        }, {
            capabilities: {
                tools: {},
            },
        });
        this.binanceApi = new BinanceAPI(credentials);
        this.setupToolHandlers();
        // Error handling
        this.server.onerror = (error) => console.error('[MCP Error]', error);
        process.on('SIGINT', async () => {
            await this.server.close();
            process.exit(0);
        });
    }
    setupToolHandlers() {
        this.server.setRequestHandler(ListToolsRequestSchema, async () => ({
            tools: [
                // Market Data Tools
                {
                    name: 'get_price',
                    description: 'Get the current price of a cryptocurrency',
                    inputSchema: {
                        type: 'object',
                        properties: {
                            symbol: {
                                type: 'string',
                                description: 'Trading pair symbol (e.g., BTCUSDT, ETHUSDT)',
                            },
                        },
                        required: ['symbol'],
                    },
                },
                {
                    name: 'get_24hr_ticker',
                    description: 'Get 24hr ticker price change statistics',
                    inputSchema: {
                        type: 'object',
                        properties: {
                            symbol: {
                                type: 'string',
                                description: 'Trading pair symbol (e.g., BTCUSDT, ETHUSDT)',
                            },
                        },
                        required: [],
                    },
                },
                {
                    name: 'get_klines',
                    description: 'Get candlestick data (klines)',
                    inputSchema: {
                        type: 'object',
                        properties: {
                            symbol: {
                                type: 'string',
                                description: 'Trading pair symbol (e.g., BTCUSDT, ETHUSDT)',
                            },
                            interval: {
                                type: 'string',
                                description: 'Kline interval (e.g., 1m, 3m, 5m, 15m, 30m, 1h, 2h, 4h, 6h, 8h, 12h, 1d, 3d, 1w, 1M)',
                            },
                            limit: {
                                type: 'number',
                                description: 'Number of entries to return (default 500, max 1000)',
                            },
                            startTime: {
                                type: 'number',
                                description: 'Start time in milliseconds',
                            },
                            endTime: {
                                type: 'number',
                                description: 'End time in milliseconds',
                            },
                        },
                        required: ['symbol', 'interval'],
                    },
                },
                {
                    name: 'get_order_book',
                    description: 'Get order book for a symbol',
                    inputSchema: {
                        type: 'object',
                        properties: {
                            symbol: {
                                type: 'string',
                                description: 'Trading pair symbol (e.g., BTCUSDT, ETHUSDT)',
                            },
                            limit: {
                                type: 'number',
                                description: 'Depth of the order book (default 100, max 5000)',
                            },
                        },
                        required: ['symbol'],
                    },
                },
                {
                    name: 'get_recent_trades',
                    description: 'Get recent trades for a symbol',
                    inputSchema: {
                        type: 'object',
                        properties: {
                            symbol: {
                                type: 'string',
                                description: 'Trading pair symbol (e.g., BTCUSDT, ETHUSDT)',
                            },
                            limit: {
                                type: 'number',
                                description: 'Number of trades to return (default 500, max 1000)',
                            },
                        },
                        required: ['symbol'],
                    },
                },
                // Account Tools
                {
                    name: 'get_account',
                    description: 'Get account information including balances',
                    inputSchema: {
                        type: 'object',
                        properties: {},
                        required: [],
                    },
                },
                {
                    name: 'get_wallet_balances',
                    description: 'Get the BTC-valued balance summary for all Binance Global wallets (read-only)',
                    inputSchema: {
                        type: 'object',
                        properties: {},
                        required: [],
                    },
                },
                {
                    name: 'get_api_restrictions',
                    description: 'Get permissions enabled for the connected Binance Global API key (read-only)',
                    inputSchema: {
                        type: 'object',
                        properties: {},
                        required: [],
                    },
                },
                {
                    name: 'get_funding_wallet',
                    description: 'Get Funding wallet asset balances (read-only)',
                    inputSchema: {
                        type: 'object',
                        properties: {
                            asset: {
                                type: 'string',
                                description: 'Optional asset symbol, e.g. USDT',
                            },
                            needBtcValuation: {
                                type: 'boolean',
                                description: 'Include BTC valuation (default true)',
                            },
                        },
                        required: [],
                    },
                },
                {
                    name: 'get_simple_earn_account',
                    description: 'Get aggregate Simple Earn balances (read-only)',
                    inputSchema: {
                        type: 'object',
                        properties: {},
                        required: [],
                    },
                },
                {
                    name: 'get_simple_earn_flexible_positions',
                    description: 'Get Simple Earn flexible positions (read-only)',
                    inputSchema: {
                        type: 'object',
                        properties: {
                            asset: { type: 'string', description: 'Optional asset symbol' },
                            productId: { type: 'string', description: 'Optional product ID' },
                            current: { type: 'number', description: 'Page number (default 1)' },
                            size: { type: 'number', description: 'Page size (max 100)' },
                        },
                        required: [],
                    },
                },
                {
                    name: 'get_simple_earn_locked_positions',
                    description: 'Get Simple Earn locked positions (read-only)',
                    inputSchema: {
                        type: 'object',
                        properties: {
                            asset: { type: 'string', description: 'Optional asset symbol' },
                            positionId: { type: 'string', description: 'Optional position ID' },
                            projectId: { type: 'string', description: 'Optional project ID' },
                            current: { type: 'number', description: 'Page number (default 1)' },
                            size: { type: 'number', description: 'Page size (max 100)' },
                        },
                        required: [],
                    },
                },
                {
                    name: 'get_usdm_futures_balances',
                    description: 'Get USD-margined futures balances (read-only)',
                    inputSchema: {
                        type: 'object',
                        properties: {},
                        required: [],
                    },
                },
                {
                    name: 'get_coinm_futures_balances',
                    description: 'Get COIN-margined futures balances (read-only)',
                    inputSchema: {
                        type: 'object',
                        properties: {},
                        required: [],
                    },
                },
                {
                    name: 'get_cross_margin_account',
                    description: 'Get cross-margin balances and liabilities (read-only)',
                    inputSchema: {
                        type: 'object',
                        properties: {},
                        required: [],
                    },
                },
                {
                    name: 'get_isolated_margin_account',
                    description: 'Get isolated-margin balances and liabilities (read-only)',
                    inputSchema: {
                        type: 'object',
                        properties: {
                            symbols: {
                                type: 'string',
                                description: 'Optional comma-separated symbols, e.g. BTCUSDT,ETHUSDT',
                            },
                        },
                        required: [],
                    },
                },
                {
                    name: 'get_my_trades',
                    description: 'Get trades for a specific symbol',
                    inputSchema: {
                        type: 'object',
                        properties: {
                            symbol: {
                                type: 'string',
                                description: 'Trading pair symbol (e.g., BTCUSDT, ETHUSDT)',
                            },
                            orderId: {
                                type: 'number',
                                description: 'Order ID to filter trades',
                            },
                            startTime: {
                                type: 'number',
                                description: 'Start time in milliseconds',
                            },
                            endTime: {
                                type: 'number',
                                description: 'End time in milliseconds',
                            },
                            fromId: {
                                type: 'number',
                                description: 'Trade ID to fetch from',
                            },
                            limit: {
                                type: 'number',
                                description: 'Number of trades to return (default 500, max 1000)',
                            },
                        },
                        required: ['symbol'],
                    },
                },
                {
                    name: 'get_open_orders',
                    description: 'Get current open orders for a symbol or all symbols',
                    inputSchema: {
                        type: 'object',
                        properties: {
                            symbol: {
                                type: 'string',
                                description: 'Trading pair symbol (e.g., BTCUSDT, ETHUSDT)',
                            },
                        },
                        required: [],
                    },
                },
                {
                    name: 'get_all_orders',
                    description: 'Get all orders for a symbol (active, canceled, or filled)',
                    inputSchema: {
                        type: 'object',
                        properties: {
                            symbol: {
                                type: 'string',
                                description: 'Trading pair symbol (e.g., BTCUSDT, ETHUSDT)',
                            },
                            orderId: {
                                type: 'number',
                                description: 'Order ID to start from',
                            },
                            startTime: {
                                type: 'number',
                                description: 'Start time in milliseconds',
                            },
                            endTime: {
                                type: 'number',
                                description: 'End time in milliseconds',
                            },
                            limit: {
                                type: 'number',
                                description: 'Number of entries to return (default 500, max 1000)',
                            },
                        },
                        required: ['symbol'],
                    },
                },
                // Trading Tools
                {
                    name: 'place_order',
                    description: 'Place a buy or sell order',
                    inputSchema: {
                        type: 'object',
                        properties: {
                            symbol: {
                                type: 'string',
                                description: 'Trading pair symbol (e.g., BTCUSDT, ETHUSDT)',
                            },
                            side: {
                                type: 'string',
                                enum: ['BUY', 'SELL'],
                                description: 'Order side (BUY or SELL)',
                            },
                            type: {
                                type: 'string',
                                enum: ['LIMIT', 'MARKET', 'STOP_LOSS', 'STOP_LOSS_LIMIT', 'TAKE_PROFIT', 'TAKE_PROFIT_LIMIT', 'LIMIT_MAKER'],
                                description: 'Order type',
                            },
                            quantity: {
                                type: 'string',
                                description: 'Order quantity',
                            },
                            price: {
                                type: 'string',
                                description: 'Order price (required for LIMIT orders)',
                            },
                            timeInForce: {
                                type: 'string',
                                enum: ['GTC', 'IOC', 'FOK'],
                                description: 'Time in force (required for LIMIT orders)',
                            },
                            newClientOrderId: {
                                type: 'string',
                                description: 'A unique ID for the order (automatically generated if not sent)',
                            },
                            stopPrice: {
                                type: 'string',
                                description: 'Stop price (required for STOP_LOSS, STOP_LOSS_LIMIT, TAKE_PROFIT, and TAKE_PROFIT_LIMIT orders)',
                            },
                            icebergQty: {
                                type: 'string',
                                description: 'Used with LIMIT, STOP_LOSS_LIMIT, and TAKE_PROFIT_LIMIT to create an iceberg order',
                            },
                            newOrderRespType: {
                                type: 'string',
                                enum: ['ACK', 'RESULT', 'FULL'],
                                description: 'Set the response JSON (ACK, RESULT, or FULL)',
                            },
                        },
                        required: ['symbol', 'side', 'type', 'quantity'],
                    },
                },
                {
                    name: 'cancel_order',
                    description: 'Cancel an active order',
                    inputSchema: {
                        type: 'object',
                        properties: {
                            symbol: {
                                type: 'string',
                                description: 'Trading pair symbol (e.g., BTCUSDT, ETHUSDT)',
                            },
                            orderId: {
                                type: 'number',
                                description: 'Order ID',
                            },
                            clientOrderId: {
                                type: 'string',
                                description: 'Client order ID',
                            },
                        },
                        required: ['symbol'],
                    },
                },
                {
                    name: 'cancel_all_orders',
                    description: 'Cancel all open orders on a symbol',
                    inputSchema: {
                        type: 'object',
                        properties: {
                            symbol: {
                                type: 'string',
                                description: 'Trading pair symbol (e.g., BTCUSDT, ETHUSDT)',
                            },
                        },
                        required: ['symbol'],
                    },
                },
                {
                    name: 'get_order',
                    description: 'Check an order\'s status',
                    inputSchema: {
                        type: 'object',
                        properties: {
                            symbol: {
                                type: 'string',
                                description: 'Trading pair symbol (e.g., BTCUSDT, ETHUSDT)',
                            },
                            orderId: {
                                type: 'number',
                                description: 'Order ID',
                            },
                            clientOrderId: {
                                type: 'string',
                                description: 'Client order ID',
                            },
                        },
                        required: ['symbol'],
                    },
                },
                // Wallet Tools
                {
                    name: 'get_deposit_address',
                    description: 'Get deposit address for a coin',
                    inputSchema: {
                        type: 'object',
                        properties: {
                            coin: {
                                type: 'string',
                                description: 'Coin symbol (e.g., BTC, ETH)',
                            },
                            network: {
                                type: 'string',
                                description: 'Network (e.g., BSC, ETH)',
                            },
                        },
                        required: ['coin'],
                    },
                },
                {
                    name: 'get_deposit_history',
                    description: 'Get deposit history',
                    inputSchema: {
                        type: 'object',
                        properties: {
                            coin: {
                                type: 'string',
                                description: 'Coin symbol (e.g., BTC, ETH)',
                            },
                            status: {
                                type: 'number',
                                description: 'Status (0: pending, 1: success)',
                            },
                            startTime: {
                                type: 'number',
                                description: 'Start time in milliseconds',
                            },
                            endTime: {
                                type: 'number',
                                description: 'End time in milliseconds',
                            },
                            offset: {
                                type: 'number',
                                description: 'Offset',
                            },
                            limit: {
                                type: 'number',
                                description: 'Limit',
                            },
                        },
                        required: [],
                    },
                },
                {
                    name: 'get_withdraw_history',
                    description: 'Get withdrawal history',
                    inputSchema: {
                        type: 'object',
                        properties: {
                            coin: {
                                type: 'string',
                                description: 'Coin symbol (e.g., BTC, ETH)',
                            },
                            status: {
                                type: 'number',
                                description: 'Status (0: Email Sent, 1: Cancelled, 2: Awaiting Approval, 3: Rejected, 4: Processing, 5: Failure, 6: Completed)',
                            },
                            startTime: {
                                type: 'number',
                                description: 'Start time in milliseconds',
                            },
                            endTime: {
                                type: 'number',
                                description: 'End time in milliseconds',
                            },
                            offset: {
                                type: 'number',
                                description: 'Offset',
                            },
                            limit: {
                                type: 'number',
                                description: 'Limit',
                            },
                        },
                        required: [],
                    },
                },
                {
                    name: 'withdraw',
                    description: 'Submit a withdrawal request',
                    inputSchema: {
                        type: 'object',
                        properties: {
                            coin: {
                                type: 'string',
                                description: 'Coin symbol (e.g., BTC, ETH)',
                            },
                            address: {
                                type: 'string',
                                description: 'Withdrawal address',
                            },
                            amount: {
                                type: 'string',
                                description: 'Withdrawal amount',
                            },
                            network: {
                                type: 'string',
                                description: 'Network (e.g., BSC, ETH)',
                            },
                            name: {
                                type: 'string',
                                description: 'Description of the address',
                            },
                            addressTag: {
                                type: 'string',
                                description: 'Secondary address identifier for coins like XRP, XMR, etc.',
                            },
                        },
                        required: ['coin', 'address', 'amount'],
                    },
                },
            ],
        }));
        this.server.setRequestHandler(CallToolRequestSchema, async (request) => {
            try {
                switch (request.params.name) {
                    // Market Data Tools
                    case 'get_price': {
                        const { symbol } = request.params.arguments;
                        const priceInfo = await this.binanceApi.getPrice(symbol);
                        return {
                            content: [
                                {
                                    type: 'text',
                                    text: JSON.stringify(priceInfo, null, 2),
                                },
                            ],
                        };
                    }
                    case 'get_24hr_ticker': {
                        const { symbol } = request.params.arguments;
                        const tickerInfo = await this.binanceApi.get24hrTicker(symbol);
                        return {
                            content: [
                                {
                                    type: 'text',
                                    text: JSON.stringify(tickerInfo, null, 2),
                                },
                            ],
                        };
                    }
                    case 'get_klines': {
                        const { symbol, interval, limit, startTime, endTime } = request.params.arguments;
                        const klineData = await this.binanceApi.getKlines(symbol, interval, limit, startTime, endTime);
                        return {
                            content: [
                                {
                                    type: 'text',
                                    text: JSON.stringify(klineData, null, 2),
                                },
                            ],
                        };
                    }
                    case 'get_order_book': {
                        const { symbol, limit } = request.params.arguments;
                        const orderBook = await this.binanceApi.getOrderBook(symbol, limit);
                        return {
                            content: [
                                {
                                    type: 'text',
                                    text: JSON.stringify(orderBook, null, 2),
                                },
                            ],
                        };
                    }
                    case 'get_recent_trades': {
                        const { symbol, limit } = request.params.arguments;
                        const trades = await this.binanceApi.getRecentTrades(symbol, limit);
                        return {
                            content: [
                                {
                                    type: 'text',
                                    text: JSON.stringify(trades, null, 2),
                                },
                            ],
                        };
                    }
                    // Account Tools
                    case 'get_account': {
                        const accountInfo = await this.binanceApi.getAccountInfo();
                        return {
                            content: [
                                {
                                    type: 'text',
                                    text: JSON.stringify(accountInfo, null, 2),
                                },
                            ],
                        };
                    }
                    case 'get_wallet_balances': {
                        const walletBalances = await this.binanceApi.getWalletBalances();
                        return {
                            content: [{ type: 'text', text: JSON.stringify(walletBalances, null, 2) }],
                        };
                    }
                    case 'get_api_restrictions': {
                        const restrictions = await this.binanceApi.getApiRestrictions();
                        return {
                            content: [{ type: 'text', text: JSON.stringify(restrictions, null, 2) }],
                        };
                    }
                    case 'get_funding_wallet': {
                        const { asset, needBtcValuation } = request.params.arguments;
                        const fundingAssets = await this.binanceApi.getFundingWallet(asset, needBtcValuation);
                        return {
                            content: [{ type: 'text', text: JSON.stringify(fundingAssets, null, 2) }],
                        };
                    }
                    case 'get_simple_earn_account': {
                        const earnAccount = await this.binanceApi.getSimpleEarnAccount();
                        return {
                            content: [{ type: 'text', text: JSON.stringify(earnAccount, null, 2) }],
                        };
                    }
                    case 'get_simple_earn_flexible_positions': {
                        const positions = await this.binanceApi.getSimpleEarnFlexiblePositions(request.params.arguments);
                        return {
                            content: [{ type: 'text', text: JSON.stringify(positions, null, 2) }],
                        };
                    }
                    case 'get_simple_earn_locked_positions': {
                        const positions = await this.binanceApi.getSimpleEarnLockedPositions(request.params.arguments);
                        return {
                            content: [{ type: 'text', text: JSON.stringify(positions, null, 2) }],
                        };
                    }
                    case 'get_usdm_futures_balances': {
                        const balances = await this.binanceApi.getUsdmFuturesBalances();
                        return {
                            content: [{ type: 'text', text: JSON.stringify(balances, null, 2) }],
                        };
                    }
                    case 'get_coinm_futures_balances': {
                        const balances = await this.binanceApi.getCoinmFuturesBalances();
                        return {
                            content: [{ type: 'text', text: JSON.stringify(balances, null, 2) }],
                        };
                    }
                    case 'get_cross_margin_account': {
                        const account = await this.binanceApi.getCrossMarginAccount();
                        return {
                            content: [{ type: 'text', text: JSON.stringify(account, null, 2) }],
                        };
                    }
                    case 'get_isolated_margin_account': {
                        const { symbols } = request.params.arguments;
                        const account = await this.binanceApi.getIsolatedMarginAccount(symbols);
                        return {
                            content: [{ type: 'text', text: JSON.stringify(account, null, 2) }],
                        };
                    }
                    case 'get_my_trades': {
                        const tradeParams = request.params.arguments;
                        const trades = await this.binanceApi.getMyTrades(tradeParams);
                        return {
                            content: [
                                {
                                    type: 'text',
                                    text: JSON.stringify(trades, null, 2),
                                },
                            ],
                        };
                    }
                    case 'get_open_orders': {
                        const { symbol } = request.params.arguments;
                        const openOrders = await this.binanceApi.getOpenOrders(symbol);
                        return {
                            content: [
                                {
                                    type: 'text',
                                    text: JSON.stringify(openOrders, null, 2),
                                },
                            ],
                        };
                    }
                    case 'get_all_orders': {
                        const { symbol, orderId, startTime, endTime, limit } = request.params.arguments;
                        const orders = await this.binanceApi.getAllOrders(symbol, orderId, startTime, endTime, limit);
                        return {
                            content: [
                                {
                                    type: 'text',
                                    text: JSON.stringify(orders, null, 2),
                                },
                            ],
                        };
                    }
                    // Trading Tools
                    case 'place_order': {
                        const orderParams = request.params.arguments;
                        const orderResult = await this.binanceApi.placeOrder(orderParams);
                        return {
                            content: [
                                {
                                    type: 'text',
                                    text: JSON.stringify(orderResult, null, 2),
                                },
                            ],
                        };
                    }
                    case 'cancel_order': {
                        const cancelParams = request.params.arguments;
                        const cancelResult = await this.binanceApi.cancelOrder(cancelParams);
                        return {
                            content: [
                                {
                                    type: 'text',
                                    text: JSON.stringify(cancelResult, null, 2),
                                },
                            ],
                        };
                    }
                    case 'cancel_all_orders': {
                        const { symbol } = request.params.arguments;
                        const cancelResult = await this.binanceApi.cancelAllOrders(symbol);
                        return {
                            content: [
                                {
                                    type: 'text',
                                    text: JSON.stringify(cancelResult, null, 2),
                                },
                            ],
                        };
                    }
                    case 'get_order': {
                        const { symbol, orderId, clientOrderId } = request.params.arguments;
                        const orderInfo = await this.binanceApi.getOrder(symbol, orderId, clientOrderId);
                        return {
                            content: [
                                {
                                    type: 'text',
                                    text: JSON.stringify(orderInfo, null, 2),
                                },
                            ],
                        };
                    }
                    // Wallet Tools
                    case 'get_deposit_address': {
                        const depositParams = request.params.arguments;
                        const addressInfo = await this.binanceApi.getDepositAddress(depositParams);
                        return {
                            content: [
                                {
                                    type: 'text',
                                    text: JSON.stringify(addressInfo, null, 2),
                                },
                            ],
                        };
                    }
                    case 'get_deposit_history': {
                        const { coin, status, startTime, endTime, offset, limit } = request.params.arguments;
                        const depositHistory = await this.binanceApi.getDepositHistory(coin, status, startTime, endTime, offset, limit);
                        return {
                            content: [
                                {
                                    type: 'text',
                                    text: JSON.stringify(depositHistory, null, 2),
                                },
                            ],
                        };
                    }
                    case 'get_withdraw_history': {
                        const { coin, status, startTime, endTime, offset, limit } = request.params.arguments;
                        const withdrawHistory = await this.binanceApi.getWithdrawHistory(coin, status, startTime, endTime, offset, limit);
                        return {
                            content: [
                                {
                                    type: 'text',
                                    text: JSON.stringify(withdrawHistory, null, 2),
                                },
                            ],
                        };
                    }
                    case 'withdraw': {
                        const withdrawParams = request.params.arguments;
                        const withdrawResult = await this.binanceApi.withdraw(withdrawParams);
                        return {
                            content: [
                                {
                                    type: 'text',
                                    text: JSON.stringify(withdrawResult, null, 2),
                                },
                            ],
                        };
                    }
                    default:
                        throw new McpError(ErrorCode.MethodNotFound, `Unknown tool: ${request.params.name}`);
                }
            }
            catch (error) {
                return {
                    content: [
                        {
                            type: 'text',
                            text: `Error: ${error.message || 'Unknown error'}`,
                        },
                    ],
                    isError: true,
                };
            }
        });
    }
    async run() {
        const transport = new StdioServerTransport();
        await this.server.connect(transport);
        console.error('Binance MCP server running on stdio');
    }
}
const server = new BinanceServer();
server.run().catch(console.error);
