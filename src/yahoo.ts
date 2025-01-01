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
  localMinimas: StockData[];
  absoluteMin: number;
  absoluteMax: number;
  currentPrice: number;
  periodStart: string;
  periodEnd: string;
}

interface StockInput {
  code: string;
  name: string;
}

const findLocalMinima = (results: StockData[]): StockData[] => {
  const prices = results.map((data) => data.low);
  const localMinima: any[] = [];

  for (let i = 1; i < prices.length - 1; i++) {
    if (prices[i] < prices[i - 1] && prices[i] < prices[i + 1]) {
      localMinima.push(results[i]);
    }
  }

  return localMinima;
};

const processStock = async (stockInput: StockInput) => {
  const period2 = new Date();
  const now = new Date();

  const period1 = now;
  // 3 months ago
  period1.setDate(period1.getDate() - 90);

  const results: StockAnalysisResult[] = [];

  const apiResults: StockData[] = await yahooFinance.historical(stockInput.code, {
    period1,
    period2,
  });

  const closePrices = apiResults.map((result) => result.close);

  const absoluteMin = Math.min(...closePrices);
  const absoluteMax = Math.max(...closePrices);

  const localMinimas = findLocalMinima(apiResults)
    .sort((a: StockData, b: StockData) => a.low - b.low)
    .slice(0, 3);

  const singleResult: StockAnalysisResult = {
    stockCode: stockInput.code,
    stockName: stockInput.name,
    localMinimas,
    absoluteMin,
    absoluteMax,
    currentPrice: apiResults[apiResults.length - 1].close,
    periodStart: period1.toLocaleDateString(),
    periodEnd: period2.toLocaleDateString(),
  };

  console.log(`show pushing result
        ${JSON.stringify(singleResult)},
    `);
  return singleResult;
};

const main = async () => {
  const stocks = [
    { code: 'MSFT', name: 'Microsoft' },
    { code: 'GOOG', name: 'Google' },
    { code: 'AAPL', name: 'Apple' },
    { code: 'NVDA', name: 'Nvidia' },
    { code: 'TSLA', name: 'Tesla' },
    { code: 'AMZN', name: 'Amazon' },
    { code: 'KO', name: 'Coca-Cola' },
    { code: 'O', name: 'Reality Income' },
    { code: 'MCD', name: "McDonald's" },
    { code: 'JNJ', name: 'Johnson & Johnson' },
    { code: 'SBUX', name: 'Starbucks' },
    { code: 'PEP', name: 'PepsiCo' },
    { code: 'CVX', name: 'Chevron' },
    { code: 'CSCO', name: 'Cisco' },
    { code: 'INTC', name: 'Intel' },
    { code: 'NFLX', name: 'Netflix' },
  ];

  const results = await Promise.all(stocks.map(processStock));

  fs.writeFile('stock-results.json', JSON.stringify(results, null, 2), (err) => {
    if (err) {
      console.error('Error writing to file', err);
    } else {
      console.log('Stock results written to stock-results.json');
    }
  });
};

main();
