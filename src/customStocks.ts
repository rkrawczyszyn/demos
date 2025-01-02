import yahooFinance from 'yahoo-finance2';
import fs from 'fs';
import https from 'https';

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
      code: 'hedera',
      name: 'Hedera (HBAR)',
      attractivePriceMin: 1.13,
      attractivePriceMax: 1.08,
      url: 'https://www.binance.com/pl/price/hedera',
      type: ShareType.Coin,
    },
    {
      code: 'polygon-ecosystem-token',
      name: 'POL (ex-MATIC) (POL)',
      attractivePriceMin: 1.9,
      attractivePriceMax: 1.8,
      url: 'https://www.binance.com/pl/price/polygon-ecosystem-token',
      type: ShareType.Coin,
    },
    {
      code: 'eos',
      name: 'EOS (EOS)',
      attractivePriceMin: 3.25,
      attractivePriceMax: 3.13,
      url: 'https://www.binance.com/pl/price/eos',
      type: ShareType.Coin,
    },
    {
      code: 'stepn',
      name: 'GMT',
      attractivePriceMin: 0.62,
      attractivePriceMax: 0.61,
      url: 'https://www.binance.com/pl/price/green-metaverse-token',
      type: ShareType.Coin,
    },
    {
      code: 'book-of-meme',
      name: 'BOOK OF MEME (BOME)',
      attractivePriceMin: 0.0267,
      attractivePriceMax: 0.025,
      url: 'https://www.binance.com/pl/price/book-of-meme',
      type: ShareType.Coin,
    },
  ];

  let stockResults = await Promise.all(stocks.map(processStock));
  let coinResults = await Promise.all(coins.map(processCoin));

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

  fs.writeFile('custom-stock-watch-results.json', JSON.stringify(combined, null, 2), (err) => {
    if (err) {
      console.error('Error writing to file', err);
    } else {
      console.log('Stock results written to custom-stock-crypto-watch-results.json');
    }
  });
};

main();
