const Binance = require('node-binance-api');
const binance = new Binance().options({
  APIKEY: '',
  APISECRET: '',
  useServerTime: true,
  test: true, // Set to true for Binance testnet
});

// Strategy parameters
const emaShortPeriod = 9;
const emaLongPeriod = 21;
const rsiPeriod = 14;
const overboughtThreshold = 70;
const oversoldThreshold = 30;

const symbol = 'ETHUSDT'; // Change the symbol as needed
const interval = '15m';
const limit = 100;

let inPosition = false; // Flag to track current position

// Function to calculate Exponential Moving Average (EMA)
const calculateEMA = (data, period) => {
  let sum = data.slice(0, period).reduce((acc, val) => acc + val, 0);
  return sum / period;
};

// Function to calculate Relative Strength Index (RSI)
const calculateRSI = (closes, period) => {
  const changes = closes.map((close, i) => (i === 0 ? 0 : close - closes[i - 1]));
  const gains = changes.map((change) => (change > 0 ? change : 0));
  const losses = changes.map((change) => (change < 0 ? Math.abs(change) : 0));

  const averageGain = gains.slice(0, period).reduce((acc, val) => acc + val, 0) / period;
  const averageLoss = losses.slice(0, period).reduce((acc, val) => acc + val, 0) / period;

  const relativeStrength = averageGain / averageLoss;
  return 100 - (100 / (1 + relativeStrength));
};

// Function to fetch and log open positions
const getOpenPositions = async () => {
  try {
    const data = await binance.futuresAccount();
    return data.positions.filter((position) => parseFloat(position.positionAmt) !== 0).length;
  } catch (error) {
    console.error('Error fetching account information:', error.body);
  }
};

// Function to check trading signals
const checkTradingSignal = async (candles) => {
  const closes = candles.map((candle) => parseFloat(candle[4]));

  const emaShort = calculateEMA(closes, emaShortPeriod);
  const emaLong = calculateEMA(closes, emaLongPeriod);

  const rsi = calculateRSI(closes, rsiPeriod);

  console.log('Running');
  let totalPositions = await getOpenPositions();
  console.log(inPosition, totalPositions);
  if (!inPosition && totalPositions === 0) {
    console.log('a');
    // Check for a buy signal
    if (emaShort > emaLong && rsi < oversoldThreshold) {
      console.log('pening long position, emaShort='+emaShort+', emaLong='+emaLong);
      // Implement your logic to open a long position here
      binance.futuresMarketBuy(symbol, 0.5);
      inPosition = true;
    }

    // Check for a sell signal
    if (emaShort < emaLong && rsi > overboughtThreshold) {
      console.log('Opening short position, emaShort='+emaShort+', emaLong='+emaLong);
      // Implement your logic to open a short position here
      binance.futuresMarketSell(symbol, 0.5); 
      inPosition = true;
    }
  } else {
    console.log('b');
    // Check for a sell signal to close the position
    if (emaShort < emaLong || rsi > overboughtThreshold) {
      console.log('Closing long position, emaShort='+emaShort+', emaLong='+emaLong);
      // Implement your logic to close the position here
      binance.futuresMarketSell(symbol, 0.5);
      inPosition = false;
    }

    // Check for a buy signal to close the short position
    if (emaShort > emaLong || rsi < oversoldThreshold) {
      console.log('Closing short position, emaShort='+emaShort+', emaLong='+emaLong);
      // Implement your logic to close the short position here
      binance.futuresMarketBuy(symbol, 0.5);
      inPosition = false;
    }
  }
  console.log('Finished');
};

// Function to fetch historical candlestick data
const fetchCandlestickData = () => {
  binance.candlesticks(symbol, interval, (error, ticks) => {
    if (error) throw new Error(error);

    // Use only the last 'limit' number of candles
    const candles = ticks.slice(-limit);
    binance.futuresLeverage( symbol, 10 );
    binance.futuresMarginType( symbol, 'ISOLATED' );

    // Check trading signals based on the strategy
    checkTradingSignal(candles);
  }, { limit });
};

// Fetch candlestick data and check signals every 5 minutes
setInterval(fetchCandlestickData, 1 * 60 * 1000);
