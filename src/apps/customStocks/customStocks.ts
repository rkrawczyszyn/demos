import yahooFinance from 'yahoo-finance2';
import fs from 'fs';
import https from 'https';
import path from 'path';
import { logDate } from '../../utils/logDate';
import { customCoinsToWatchList } from './config/customCoinsToWatchList';
import { customStocksToWatchList } from './config/customStocksToWatchList';
import { ShareType } from './types/ShareType';

const OUTPUT_FILE = path.resolve(__dirname, 'custom-stock-watch-results.json');

export interface StockData {
  date: Date;
  high: number;
  volume: number;
  open: number;
  low: number;
  close: number;
  adjClose?: number;
}

export interface StockAnalysisResult {
  stockCode: string;
  stockName: string;
  currentPrice: number;
  periodStart: string;
  periodEnd: string;
  attractivePriceStart: number;
  attractivePriceUberLow: number;
  percentageProgressToAttractivePriceStart: number;
  url: string;
  type: ShareType;
}

export interface StockInput {
  code: string;
  name: string;
  attractivePriceStart: number;
  attractivePriceUberLow: number;
  url: string;
  type: ShareType;
}

export interface CryptoData {
  date: Date;
  price: number;
}

interface CoinInput {
  code: string;
  name: string;
  attractivePriceStart: number;
  attractivePriceUberLow: number;
  url: string;
}

const calculateSafeDelay = (numRequests: number, maxRequestsPerMinute = 5) => {
  const delayPerRequest = Math.ceil(60 / maxRequestsPerMinute);
  const totalDelay = numRequests * delayPerRequest;
  return delayPerRequest * 1000;
};

function delay(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

const fetchCoinData = (coinCode: string): Promise<any> => {
  return new Promise((resolve, reject) => {
    const url = `https://api.coingecko.com/api/v3/coins/${coinCode}/market_chart?vs_currency=pln&days=90`;

    https
      .get(url, (res) => {
        let data = '';

        res.on('data', (chunk) => {
          data += chunk;
        });

        res.on('end', () => {
          resolve(JSON.parse(data));
        });
      })
      .on('error', (err) => {
        reject(err);
      });
  });
};

const getPercentageProgressToAttractivePriceStart = (coinDetails: StockAnalysisResult) => {
  return 100 - (coinDetails.currentPrice / coinDetails.attractivePriceStart) * 100;
};

const readStocksCoinsConfigData = () => ({ stocks: [...customStocksToWatchList], coins: [...customCoinsToWatchList] });

const processStock = async (stockInput: StockInput) => {
  const period2 = new Date();
  const now = new Date();

  const period1 = now;
  // 3 months ago
  period1.setDate(period1.getDate() - 90);

  const apiResults: StockData[] = await yahooFinance.historical(stockInput.code, {
    period1,
    period2,
  });

  const singleResult: StockAnalysisResult = {
    stockCode: stockInput.code,
    stockName: stockInput.name,
    currentPrice: apiResults[apiResults.length - 1].close,
    periodStart: period1.toLocaleDateString(),
    periodEnd: period2.toLocaleDateString(),
    attractivePriceUberLow: stockInput.attractivePriceUberLow,
    attractivePriceStart: stockInput.attractivePriceStart,
    percentageProgressToAttractivePriceStart: -1,
    url: stockInput.url,
    type: ShareType.Stock,
  };

  singleResult.percentageProgressToAttractivePriceStart = getPercentageProgressToAttractivePriceStart(singleResult);

  return singleResult;
};

const processCoin = async (coinInput: CoinInput): Promise<StockAnalysisResult> => {
  const period2 = new Date();
  const now = new Date();

  const period1 = new Date(now);
  period1.setDate(period1.getDate() - 90);

  const response = await fetchCoinData(coinInput.code);

  const apiResults: CryptoData[] = response.prices.map((price: [number, number]) => ({
    date: new Date(price[0]),
    price: price[1],
  }));

  const prices = apiResults.map((result) => result.price);

  const singleResult: StockAnalysisResult = {
    stockCode: coinInput.code,
    stockName: coinInput.name,
    currentPrice: prices[prices.length - 1],
    periodStart: period1.toLocaleDateString(),
    periodEnd: period2.toLocaleDateString(),
    attractivePriceStart: coinInput.attractivePriceStart,
    attractivePriceUberLow: coinInput.attractivePriceUberLow,
    percentageProgressToAttractivePriceStart: -1,
    url: coinInput.url,
    type: ShareType.Coin,
  };

  singleResult.percentageProgressToAttractivePriceStart = getPercentageProgressToAttractivePriceStart(singleResult);

  console.log(
    'show singleResult.percentageProgressToAttractivePriceStart',
    singleResult.percentageProgressToAttractivePriceStart
  );

  return singleResult;
};

async function processCoinsSequentially(coins: any[]) {
  const safeDelayTime = calculateSafeDelay(coins.length);
  // const safeDelayTime = 9000;
  console.log(`${logDate()}: Using a delay of ${safeDelayTime / 1000} seconds between each request.`);

  const results = [];

  for (const coin of coins) {
    try {
      const result = await processCoin(coin);
      results.push(result);
      console.log(`${logDate()}: Processed OK coin: ${coin.code} ${result.currentPrice}`);
    } catch (error) {
      console.error(`${logDate()}: Error processing coin: ${coin.code}`, error);
    }
    await delay(safeDelayTime);
  }

  return results;
}

const main = async () => {
  const fileReadResult = readStocksCoinsConfigData();

  if (!fileReadResult?.stocks || !fileReadResult?.coins) {
    return;
  }

  let stockResults = await Promise.all(fileReadResult.stocks.map(processStock));
  let coinResults = await processCoinsSequentially(fileReadResult.coins);

  const combined = [...stockResults, ...coinResults];

  try {
    fs.writeFileSync(OUTPUT_FILE, JSON.stringify(combined, null, 2));
    console.log(`${logDate()}: Stock results written to ${OUTPUT_FILE}`);
  } catch (error) {
    console.error(`${logDate()}: Error writing to file`, error);
  }
};

main();
