# Binance MCP Server

A Model Context Protocol (MCP) server that provides tools for interacting with the Binance cryptocurrency exchange API. This server allows AI assistants like Claude to access real-time cryptocurrency data and execute trading operations on your behalf.

## Table of Contents

- [Overview](#overview)
- [Prerequisites](#prerequisites)
- [Installation](#installation)
- [Configuration](#configuration)
- [Usage](#usage)
  - [Using with Cline](#using-with-cline)
  - [Using with Claude Desktop](#using-with-claude-desktop)
- [Available Tools](#available-tools)
- [Deployment Options](#deployment-options)
- [Security Considerations](#security-considerations)
- [Troubleshooting](#troubleshooting)

## Overview

This MCP server acts as a bridge between AI assistants and the Binance cryptocurrency exchange. It provides tools that allow AI assistants to:

- Check current cryptocurrency prices
- View account balances and information
- Place buy and sell orders

The server implements the Model Context Protocol, making it compatible with Cline and Claude Desktop.

## Prerequisites

- Node.js (v16 or higher)
- npm or yarn
- A Binance account with API access
- Cline CLI or Claude Desktop

## Installation

1. Clone this repository:

```bash
git clone https://github.com/py7hagoras/binance-mcp.git
cd binance-mcp
```

2. Install dependencies:

```bash
npm install
```

3. Build the project:

```bash
npm run build
```

## Configuration

The server requires Binance API credentials to function. You need to set these as environment variables:

- `BINANCE_API_KEY`: Your Binance API key
- `BINANCE_API_SECRET`: Your Binance API secret

### Creating Binance API Keys

1. Log in to your Binance account
2. Navigate to API Management
3. Create a new API key (consider enabling trading permissions if you want to use the `place_order` tool)
4. Save your API key and secret securely

## Usage

### Using with Cline

[Cline](https://github.com/cline-ai/cline) is a command-line interface for interacting with AI models like Claude.

1. Install Cline if you haven't already:

```bash
npm install -g @cline-ai/cline
```

2. Set your Binance API credentials as environment variables:

```bash
# On Windows (Command Prompt)
set BINANCE_API_KEY=your_api_key
set BINANCE_API_SECRET=your_api_secret

# On Windows (PowerShell)
$env:BINANCE_API_KEY="your_api_key"
$env:BINANCE_API_SECRET="your_api_secret"

# On macOS/Linux
export BINANCE_API_KEY=your_api_key
export BINANCE_API_SECRET=your_api_secret
```

3. Start Cline with the Binance MCP server:

```bash
cline --mcp-server "node path/to/binance-server/build/index.js"
```

4. In your Cline session, you can now use the Binance tools. For example:

```
You can now check the price of Bitcoin by using the get_price tool from the binance-server.
```

### Using with Claude Desktop

[Claude Desktop](https://claude.ai/desktop) is the desktop application for Claude.

1. Set your Binance API credentials as environment variables (see above)

2. Configure Claude Desktop to use the Binance MCP server:

   a. Open Claude Desktop
   
   b. Go to Settings > MCP Servers
   
   c. Click "Add Server"
   
   d. Enter a name (e.g., "Binance Server")
   
   e. For the command, enter: `node path/to/binance-server/build/index.js`
   
   f. Click "Save"

3. Start a new conversation in Claude Desktop and enable the Binance Server from the MCP Servers menu

4. You can now ask Claude to use the Binance tools. For example:

```
Can you check the current price of Ethereum using the Binance API?
```

## Available Tools

The server provides a comprehensive set of tools for interacting with the Binance API, organized into the following categories:

### Market Data Tools

#### get_price

Get the current price of a cryptocurrency.

**Parameters:**
- `symbol`: Trading pair symbol (e.g., "BTCUSDT", "ETHUSDT")

**Example response:**
```json
{
  "symbol": "BTCUSDT",
  "price": "50123.45"
}
```

#### get_24hr_ticker

Get 24-hour ticker price change statistics.

**Parameters:**
- `symbol` (optional): Trading pair symbol (e.g., "BTCUSDT", "ETHUSDT"). If not provided, returns data for all symbols.

**Example response:**
```json
{
  "symbol": "BTCUSDT",
  "priceChange": "100.00",
  "priceChangePercent": "0.2",
  "weightedAvgPrice": "50150.25",
  "prevClosePrice": "50050.00",
  "lastPrice": "50150.00",
  "lastQty": "0.5",
  "bidPrice": "50145.00",
  "bidQty": "2.5",
  "askPrice": "50155.00",
  "askQty": "1.8",
  "openPrice": "50050.00",
  "highPrice": "50200.00",
  "lowPrice": "49900.00",
  "volume": "10000.5",
  "quoteVolume": "500750000.25",
  "openTime": 1619712000000,
  "closeTime": 1619798400000,
  "firstId": 100000,
  "lastId": 100500,
  "count": 500
}
```

#### get_klines

Get candlestick data (klines).

**Parameters:**
- `symbol`: Trading pair symbol (e.g., "BTCUSDT", "ETHUSDT")
- `interval`: Kline interval (e.g., "1m", "3m", "5m", "15m", "30m", "1h", "2h", "4h", "6h", "8h", "12h", "1d", "3d", "1w", "1M")
- `limit` (optional): Number of entries to return (default 500, max 1000)
- `startTime` (optional): Start time in milliseconds
- `endTime` (optional): End time in milliseconds

**Example response:**
```json
[
  {
    "openTime": 1619712000000,
    "open": "50050.00",
    "high": "50100.00",
    "low": "50000.00",
    "close": "50080.00",
    "volume": "100.5",
    "closeTime": 1619715600000,
    "quoteAssetVolume": "5030000.00",
    "numberOfTrades": 1000,
    "takerBuyBaseAssetVolume": "60.5",
    "takerBuyQuoteAssetVolume": "3030000.00"
  },
  // Additional klines...
]
```

#### get_order_book

Get order book for a symbol.

**Parameters:**
- `symbol`: Trading pair symbol (e.g., "BTCUSDT", "ETHUSDT")
- `limit` (optional): Depth of the order book (default 100, max 5000)

**Example response:**
```json
{
  "lastUpdateId": 1027024,
  "bids": [
    {
      "price": "50145.00",
      "quantity": "2.5"
    },
    {
      "price": "50140.00",
      "quantity": "3.2"
    }
  ],
  "asks": [
    {
      "price": "50155.00",
      "quantity": "1.8"
    },
    {
      "price": "50160.00",
      "quantity": "2.1"
    }
  ]
}
```

#### get_recent_trades

Get recent trades for a symbol.

**Parameters:**
- `symbol`: Trading pair symbol (e.g., "BTCUSDT", "ETHUSDT")
- `limit` (optional): Number of trades to return (default 500, max 1000)

**Example response:**
```json
[
  {
    "id": 28457,
    "price": "50145.00",
    "qty": "0.1",
    "quoteQty": "5014.50",
    "time": 1619712000000,
    "isBuyerMaker": false,
    "isBestMatch": true
  },
  // Additional trades...
]
```

### Account Tools

#### get_account

Get account information including balances.

**Parameters:** None

**Example response:**
```json
{
  "makerCommission": 10,
  "takerCommission": 10,
  "buyerCommission": 0,
  "sellerCommission": 0,
  "canTrade": true,
  "canWithdraw": true,
  "canDeposit": true,
  "updateTime": 1619712000000,
  "accountType": "SPOT",
  "balances": [
    {
      "asset": "BTC",
      "free": "0.001",
      "locked": "0.0"
    },
    {
      "asset": "ETH",
      "free": "0.05",
      "locked": "0.0"
    }
  ],
  "permissions": ["SPOT"]
}
```

#### get_my_trades

Get trades for a specific symbol.

**Parameters:**
- `symbol`: Trading pair symbol (e.g., "BTCUSDT", "ETHUSDT")
- `orderId` (optional): Order ID to filter trades
- `startTime` (optional): Start time in milliseconds
- `endTime` (optional): End time in milliseconds
- `fromId` (optional): Trade ID to fetch from
- `limit` (optional): Number of trades to return (default 500, max 1000)

**Example response:**
```json
[
  {
    "id": 28457,
    "orderId": 100234,
    "price": "50145.00",
    "qty": "0.1",
    "quoteQty": "5014.50",
    "commission": "5.01",
    "commissionAsset": "USDT",
    "time": 1619712000000,
    "isBuyer": true,
    "isMaker": false,
    "isBestMatch": true
  },
  // Additional trades...
]
```

#### get_open_orders

Get current open orders for a symbol or all symbols.

**Parameters:**
- `symbol` (optional): Trading pair symbol (e.g., "BTCUSDT", "ETHUSDT"). If not provided, returns open orders for all symbols.

**Example response:**
```json
[
  {
    "symbol": "BTCUSDT",
    "orderId": 100234,
    "orderListId": -1,
    "clientOrderId": "myOrder1",
    "price": "50000.00",
    "origQty": "0.1",
    "executedQty": "0.0",
    "cummulativeQuoteQty": "0.0",
    "status": "NEW",
    "timeInForce": "GTC",
    "type": "LIMIT",
    "side": "BUY",
    "stopPrice": "0.0",
    "icebergQty": "0.0",
    "time": 1619712000000,
    "updateTime": 1619712000000,
    "isWorking": true,
    "origQuoteOrderQty": "0.0"
  },
  // Additional orders...
]
```

#### get_all_orders

Get all orders for a symbol (active, canceled, or filled).

**Parameters:**
- `symbol`: Trading pair symbol (e.g., "BTCUSDT", "ETHUSDT")
- `orderId` (optional): Order ID to start from
- `startTime` (optional): Start time in milliseconds
- `endTime` (optional): End time in milliseconds
- `limit` (optional): Number of entries to return (default 500, max 1000)

**Example response:**
```json
[
  {
    "symbol": "BTCUSDT",
    "orderId": 100234,
    "orderListId": -1,
    "clientOrderId": "myOrder1",
    "price": "50000.00",
    "origQty": "0.1",
    "executedQty": "0.1",
    "cummulativeQuoteQty": "5000.00",
    "status": "FILLED",
    "timeInForce": "GTC",
    "type": "LIMIT",
    "side": "BUY",
    "stopPrice": "0.0",
    "icebergQty": "0.0",
    "time": 1619712000000,
    "updateTime": 1619712100000,
    "isWorking": true,
    "origQuoteOrderQty": "0.0"
  },
  // Additional orders...
]
```

### Trading Tools

#### place_order

Place a buy or sell order.

**Parameters:**
- `symbol`: Trading pair symbol (e.g., "BTCUSDT", "ETHUSDT")
- `side`: Order side ("BUY" or "SELL")
- `type`: Order type ("LIMIT", "MARKET", "STOP_LOSS", "STOP_LOSS_LIMIT", "TAKE_PROFIT", "TAKE_PROFIT_LIMIT", "LIMIT_MAKER")
- `quantity`: Order quantity
- `price` (optional): Order price (required for LIMIT orders)
- `timeInForce` (optional): Time in force (required for LIMIT orders, one of "GTC", "IOC", "FOK")
- `newClientOrderId` (optional): A unique ID for the order (automatically generated if not sent)
- `stopPrice` (optional): Stop price (required for STOP_LOSS, STOP_LOSS_LIMIT, TAKE_PROFIT, and TAKE_PROFIT_LIMIT orders)
- `icebergQty` (optional): Used with LIMIT, STOP_LOSS_LIMIT, and TAKE_PROFIT_LIMIT to create an iceberg order
- `newOrderRespType` (optional): Set the response JSON ("ACK", "RESULT", or "FULL")

**Example request:**
```json
{
  "symbol": "BTCUSDT",
  "side": "BUY",
  "type": "LIMIT",
  "quantity": "0.001",
  "price": "50000",
  "timeInForce": "GTC"
}
```

**Example response:**
```json
{
  "symbol": "BTCUSDT",
  "orderId": 100234,
  "orderListId": -1,
  "clientOrderId": "myOrder1",
  "transactTime": 1619712000000,
  "price": "50000.00",
  "origQty": "0.001",
  "executedQty": "0.0",
  "cummulativeQuoteQty": "0.0",
  "status": "NEW",
  "timeInForce": "GTC",
  "type": "LIMIT",
  "side": "BUY"
}
```

#### cancel_order

Cancel an active order.

**Parameters:**
- `symbol`: Trading pair symbol (e.g., "BTCUSDT", "ETHUSDT")
- `orderId` (optional): Order ID
- `clientOrderId` (optional): Client order ID

**Example response:**
```json
{
  "symbol": "BTCUSDT",
  "origClientOrderId": "myOrder1",
  "orderId": 100234,
  "orderListId": -1,
  "clientOrderId": "cancelMyOrder1",
  "price": "50000.00",
  "origQty": "0.001",
  "executedQty": "0.0",
  "cummulativeQuoteQty": "0.0",
  "status": "CANCELED",
  "timeInForce": "GTC",
  "type": "LIMIT",
  "side": "BUY"
}
```

#### cancel_all_orders

Cancel all open orders on a symbol.

**Parameters:**
- `symbol`: Trading pair symbol (e.g., "BTCUSDT", "ETHUSDT")

**Example response:**
```json
[
  {
    "symbol": "BTCUSDT",
    "origClientOrderId": "myOrder1",
    "orderId": 100234,
    "orderListId": -1,
    "clientOrderId": "cancelMyOrder1",
    "price": "50000.00",
    "origQty": "0.001",
    "executedQty": "0.0",
    "cummulativeQuoteQty": "0.0",
    "status": "CANCELED",
    "timeInForce": "GTC",
    "type": "LIMIT",
    "side": "BUY"
  },
  // Additional canceled orders...
]
```

#### get_order

Check an order's status.

**Parameters:**
- `symbol`: Trading pair symbol (e.g., "BTCUSDT", "ETHUSDT")
- `orderId` (optional): Order ID
- `clientOrderId` (optional): Client order ID

**Example response:**
```json
{
  "symbol": "BTCUSDT",
  "orderId": 100234,
  "orderListId": -1,
  "clientOrderId": "myOrder1",
  "price": "50000.00",
  "origQty": "0.001",
  "executedQty": "0.0",
  "cummulativeQuoteQty": "0.0",
  "status": "NEW",
  "timeInForce": "GTC",
  "type": "LIMIT",
  "side": "BUY",
  "stopPrice": "0.0",
  "icebergQty": "0.0",
  "time": 1619712000000,
  "updateTime": 1619712000000,
  "isWorking": true,
  "origQuoteOrderQty": "0.0"
}
```

### Wallet Tools

#### get_deposit_address

Get deposit address for a coin.

**Parameters:**
- `coin`: Coin symbol (e.g., "BTC", "ETH")
- `network` (optional): Network (e.g., "BSC", "ETH")

**Example response:**
```json
{
  "address": "1A1zP1eP5QGefi2DMPTfTL5SLmv7DivfNa",
  "coin": "BTC",
  "tag": "",
  "url": "",
  "network": "BTC"
}
```

#### get_deposit_history

Get deposit history.

**Parameters:**
- `coin` (optional): Coin symbol (e.g., "BTC", "ETH")
- `status` (optional): Status (0: pending, 1: success)
- `startTime` (optional): Start time in milliseconds
- `endTime` (optional): End time in milliseconds
- `offset` (optional): Offset
- `limit` (optional): Limit

**Example response:**
```json
[
  {
    "amount": "0.001",
    "coin": "BTC",
    "network": "BTC",
    "status": 1,
    "address": "1A1zP1eP5QGefi2DMPTfTL5SLmv7DivfNa",
    "addressTag": "",
    "txId": "b3c6219639cf0d8e56a47bf1c57a124a256a0379c79cc72c6a341b4ce6f32626",
    "insertTime": 1619712000000,
    "transferType": 0,
    "confirmTimes": "1/1"
  },
  // Additional deposits...
]
```

#### get_withdraw_history

Get withdrawal history.

**Parameters:**
- `coin` (optional): Coin symbol (e.g., "BTC", "ETH")
- `status` (optional): Status (0: Email Sent, 1: Cancelled, 2: Awaiting Approval, 3: Rejected, 4: Processing, 5: Failure, 6: Completed)
- `startTime` (optional): Start time in milliseconds
- `endTime` (optional): End time in milliseconds
- `offset` (optional): Offset
- `limit` (optional): Limit

**Example response:**
```json
[
  {
    "id": "b3c6219639cf0d8e56a47bf1c57a124a",
    "amount": "0.001",
    "transactionFee": "0.0005",
    "coin": "BTC",
    "status": 6,
    "address": "1A1zP1eP5QGefi2DMPTfTL5SLmv7DivfNa",
    "txId": "b3c6219639cf0d8e56a47bf1c57a124a256a0379c79cc72c6a341b4ce6f32626",
    "applyTime": 1619712000000,
    "network": "BTC",
    "transferType": 0,
    "info": "Withdrawal completed successfully"
  },
  // Additional withdrawals...
]
```

#### withdraw

Submit a withdrawal request.

**Parameters:**
- `coin`: Coin symbol (e.g., "BTC", "ETH")
- `address`: Withdrawal address
- `amount`: Withdrawal amount
- `network` (optional): Network (e.g., "BSC", "ETH")
- `name` (optional): Description of the address
- `addressTag` (optional): Secondary address identifier for coins like XRP, XMR, etc.

**Example response:**
```json
{
  "id": "b3c6219639cf0d8e56a47bf1c57a124a"
}
```

## Deployment Options

### Local Deployment

The simplest way to use the server is to run it locally as described in the Usage section.

### Persistent Deployment

For a more persistent setup:

1. Create a startup script or service that sets the environment variables and starts the server

2. For Windows, you can create a batch file:

```batch
@echo off
set BINANCE_API_KEY=your_api_key
set BINANCE_API_SECRET=your_api_secret
node path/to/binance-server/build/index.js
```

3. For macOS/Linux, you can create a shell script:

```bash
#!/bin/bash
export BINANCE_API_KEY=your_api_key
export BINANCE_API_SECRET=your_api_secret
node /path/to/binance-server/build/index.js
```

### Docker Deployment

You can also containerize the server using Docker:

1. Create a Dockerfile:

```dockerfile
FROM node:18-alpine

WORKDIR /app

COPY package*.json ./
RUN npm install

COPY . .
RUN npm run build

CMD ["node", "build/index.js"]
```

2. Build and run the Docker container:

```bash
docker build -t binance-mcp-server .
docker run -e BINANCE_API_KEY=your_api_key -e BINANCE_API_SECRET=your_api_secret binance-mcp-server
```

## Security Considerations

### API Key Security

- **Never** share your API keys or include them directly in your code
- Use environment variables or secure secret management solutions
- Consider using API keys with restricted permissions (e.g., read-only if you don't need trading)
- Set IP restrictions on your Binance API keys when possible

### Trading Risks

- Be cautious when enabling the `place_order` tool, as it can execute real trades
- Consider testing with a Binance testnet account first
- Set appropriate trading limits on your Binance account
- Monitor your account regularly for unexpected activity

## Troubleshooting

### Common Issues

1. **"BINANCE_API_KEY and BINANCE_API_SECRET environment variables are required"**
   - Ensure you've set both environment variables correctly

2. **API key errors**
   - Verify your API key has the necessary permissions
   - Check if your API key has IP restrictions that might be blocking requests

3. **Connection issues**
   - Ensure you have a stable internet connection
   - Check if Binance API is accessible from your location (you might need a VPN)

### Logs

The server logs errors to the console. Check these logs for troubleshooting information.

---

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

This project is licensed under the ISC License - see the LICENSE file for details.
