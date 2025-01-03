import yahooFinance from 'yahoo-finance2';
import fs from 'fs';
import https from 'https';
import path from 'path';

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

enum ShareType {
  Stock,
  Coin,
}

export interface StockAnalysisResult {
  stockCode: string;
  stockName: string;
  absoluteMin: number;
  absoluteMax: number;
  currentPrice: number;
  periodStart: string;
  periodEnd: string;
  attractivePriceMin: number;
  attractivePriceMax: number;
  url: string;
  type: ShareType;
}

interface StockInput {
  code: string;
  name: string;
}

export interface CryptoData {
  date: Date;
  price: number;
}

interface CoinInput {
  code: string;
  name: string;
  attractivePriceMin: number;
  attractivePriceMax: number;
  url: string;
}

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

  const closePrices = apiResults.map((result) => result.close);

  const absoluteMin = Math.min(...closePrices);
  const absoluteMax = Math.max(...closePrices);

  const singleResult: StockAnalysisResult = {
    stockCode: stockInput.code,
    stockName: stockInput.name,
    absoluteMin,
    absoluteMax,
    currentPrice: apiResults[apiResults.length - 1].close,
    periodStart: period1.toLocaleDateString(),
    periodEnd: period2.toLocaleDateString(),
    attractivePriceMax: -1,
    attractivePriceMin: -1,
    url: '',
    type: ShareType.Stock,
  };

  return singleResult;
};

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

const processCoin = async (coinInput: CoinInput): Promise<StockAnalysisResult> => {
  const period2 = new Date();
  const now = new Date();

  const period1 = new Date(now);
  // 3 months ago
  period1.setDate(period1.getDate() - 90);

  const response = await fetchCoinData(coinInput.code);

  const apiResults: CryptoData[] = response.prices.map((price: [number, number]) => ({
    date: new Date(price[0]),
    price: price[1],
  }));

  const prices = apiResults.map((result) => result.price);

  const absoluteMin = Math.min(...prices);
  const absoluteMax = Math.max(...prices);

  const singleResult: StockAnalysisResult = {
    stockCode: coinInput.code,
    stockName: coinInput.name,
    absoluteMin,
    absoluteMax,
    currentPrice: prices[prices.length - 1],
    periodStart: period1.toLocaleDateString(),
    periodEnd: period2.toLocaleDateString(),
    attractivePriceMin: coinInput.attractivePriceMin,
    attractivePriceMax: coinInput.attractivePriceMax,
    url: coinInput.url,
    type: ShareType.Coin,
  };

  return singleResult;
};

const calculateSafeDelay = (numRequests: number, maxRequestsPerMinute = 5) => {
  const delayPerRequest = Math.ceil(60 / maxRequestsPerMinute);
  const totalDelay = numRequests * delayPerRequest;
  return delayPerRequest * 1000;
};

function delay(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function processCoinsSequentially(coins: any[]) {
  const safeDelayTime = calculateSafeDelay(coins.length);
  // const safeDelayTime = 5000;
  console.log(`Using a delay of ${safeDelayTime / 1000} seconds between each request.`);

  const results = [];

  for (const coin of coins) {
    try {
      const result = await processCoin(coin);
      results.push(result);
      console.log(`Processed OK coin: ${coin.code} ${result.currentPrice}`);
    } catch (error) {
      console.error(`Error processing coin: ${coin.code}`, error);
    }
    await delay(safeDelayTime);
  }

  return results;
}

const main = async () => {
  const stocks = [
    {
      code: 'SBUX',
      name: 'Starbucks',
      attractivePriceMin: 83,
      attractivePriceMax: 77,
      url: 'https://www.trading212.com/pl/trading-instruments/invest/SBUX.US',
      type: ShareType.Stock,
    },
    {
      code: 'IUSQ.DE',
      name: 'IShares MSCI ACWI (Acc)',
      attractivePriceMin: 84.5,
      attractivePriceMax: 80,
      url: 'https://www.trading212.com/pl/trading-instruments/invest/IUSQ.DE',
      type: ShareType.Stock,
    },
  ];

  const coins = [
    {
      code: 'stellar',
      name: 'Stellar',
      attractivePriceMin: 0.5,
      attractivePriceMax: 0.3,
      url: 'https://www.coingecko.com/pl/waluty/stellar',
      type: ShareType.Coin,
    },
    {
      code: 'polygon-ecosystem-token',
      name: 'POL (ex-MATIC) (POL)',
      attractivePriceMin: 2.37,
      attractivePriceMax: 1.7,
      url: 'https://www.coingecko.com/pl/waluty/pol-ex-matic',
      type: ShareType.Coin,
    },
    {
      code: 'eos',
      name: 'EOS (EOS)',
      attractivePriceMin: 2.3,
      attractivePriceMax: 1.8,
      url: 'https://www.coingecko.com/pl/waluty/eos',
      type: ShareType.Coin,
    },
    {
      code: 'stepn',
      name: 'GMT',
      attractivePriceMin: 0.4,
      attractivePriceMax: 0.61,
      url: 'https://www.coingecko.com/pl/waluty/stepn',
      type: ShareType.Coin,
    },
    {
      code: 'book-of-meme',
      name: 'BOOK OF MEME (BOME)',
      attractivePriceMin: 0.02,
      attractivePriceMax: 0.03,
      url: 'https://www.coingecko.com/pl/waluty/book-of-meme',
      type: ShareType.Coin,
    },
  ];

  let stockResults = await Promise.all(stocks.map(processStock));
  // let coinResults = await Promise.all(coins.map(processCoin));

  let coinResults = await processCoinsSequentially(coins);

  // extend stocks
  stockResults = stockResults.map((x) => {
    const stockDetail = stocks.find((s) => s.code === x.stockCode);

    if (!stockDetail) {
      return x;
    }

    return {
      ...x,
      attractivePriceMax: stockDetail.attractivePriceMax,
      attractivePriceMin: stockDetail.attractivePriceMin,
      url: stockDetail.url,
      type: stockDetail.type,
    };
  });

  // extend with coins
  coinResults = coinResults.map((x) => {
    const coinDetail = coins.find((s) => s.code === x.stockCode);

    if (!coinDetail) {
      return x;
    }

    return {
      ...x,
      attractivePriceMax: coinDetail.attractivePriceMax,
      attractivePriceMin: coinDetail.attractivePriceMin,
      url: coinDetail.url,
      type: coinDetail.type,
    };
  });

  const combined = [...stockResults, ...coinResults];

  try {
    fs.writeFileSync(OUTPUT_FILE, JSON.stringify(combined, null, 2));
    console.log(`Stock results written to ${OUTPUT_FILE}`);
  } catch (error) {
    console.error('Error writing to file', error);
  }
};

main();
