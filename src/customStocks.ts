import yahooFinance from 'yahoo-finance2';
import fs from 'fs';

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
  absoluteMin: number;
  absoluteMax: number;
  currentPrice: number;
  periodStart: string;
  periodEnd: string;
  attractivePriceMin: number;
  attractivePriceMax: number;
  url: string;
}

interface StockInput {
  code: string;
  name: string;
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
    },
    {
      code: 'IUSQ.DE',
      name: 'IShares MSCI ACWI (Acc)',
      attractivePriceMin: 84.5,
      attractivePriceMax: 80,
      url: 'https://www.trading212.com/pl/trading-instruments/invest/IUSQ.DE',
    },
  ];

  let results = await Promise.all(stocks.map(processStock));

  // extend stocks
  results = results.map((x) => {
    const stockDetail = stocks.find((s) => s.code === x.stockCode);

    if (!stockDetail) {
      return x;
    }

    return {
      ...x,
      attractivePriceMax: stockDetail.attractivePriceMax,
      attractivePriceMin: stockDetail.attractivePriceMin,
      url: stockDetail.url,
    };
  });

  fs.writeFile('custom-stock-watch-results.json', JSON.stringify(results, null, 2), (err) => {
    if (err) {
      console.error('Error writing to file', err);
    } else {
      console.log('Stock results written to custom-stock-watch-results.json');
    }
  });
};

main();
