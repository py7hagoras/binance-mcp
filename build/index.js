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
                    name: 'get_account',
                    description: 'Get account information including balances',
                    inputSchema: {
                        type: 'object',
                        properties: {},
                        required: [],
                    },
                },
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
                                enum: ['LIMIT', 'MARKET'],
                                description: 'Order type (LIMIT or MARKET)',
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
                        },
                        required: ['symbol', 'side', 'type', 'quantity'],
                    },
                },
            ],
        }));
        this.server.setRequestHandler(CallToolRequestSchema, async (request) => {
            try {
                switch (request.params.name) {
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
