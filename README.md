# Binance Futures Trading Script

This Node.js script connects to the Binance Futures API and implements a basic trading strategy based on Exponential Moving Averages (EMA) and Relative Strength Index (RSI).

## Prerequisites

- Node.js installed on your machine.
- Binance API key and secret (replace 'your-api-key' and 'your-api-secret' in the script).

## Installation

1. Clone the repository:

    ```bash
    git clone https://github.com/mtrosin/binance-trading.git
    ```

2. Navigate to the project directory:

    ```bash
    cd binance-futures
    ```

3. Install dependencies:

    ```bash
    npm install
    ```

## Configuration

Update the Binance API key and secret in the script:

```javascript
const binance = new Binance().options({
  APIKEY: 'your-api-key',
  APISECRET: 'your-api-secret',
  useServerTime: true,
  test: true, // Set to true for Binance testnet
});
```

## Running

Run the script: node binance-trading-script.js