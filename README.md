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

The server provides the following tools:

### get_price

Get the current price of a cryptocurrency.

**Parameters:**
- `symbol`: Trading pair symbol (e.g., "BTCUSDT", "ETHUSDT")

**Example:**
```json
{
  "symbol": "BTCUSDT",
  "price": "50123.45"
}
```

### get_account

Get account information including balances.

**Parameters:** None

**Example response:**
```json
{
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
  ]
}
```

### place_order

Place a buy or sell order.

**Parameters:**
- `symbol`: Trading pair symbol (e.g., "BTCUSDT", "ETHUSDT")
- `side`: Order side ("BUY" or "SELL")
- `type`: Order type ("LIMIT" or "MARKET")
- `quantity`: Order quantity
- `price`: Order price (required for LIMIT orders)
- `timeInForce`: Time in force (required for LIMIT orders, one of "GTC", "IOC", "FOK")

**Example:**
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
