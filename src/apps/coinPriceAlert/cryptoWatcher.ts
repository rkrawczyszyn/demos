import { StockAnalysisResult } from '../customStocks/customStocks';
import { checkPrice } from './utils/priceChecker';
import * as path from 'path';
import * as fs from 'fs';
import { logDate } from '../../utils/logDate';
import { coinWatchConfig } from './config/coinWatchConfig';

const COIN_PRICES_PATH = path.resolve(__dirname, '../customStocks', 'custom-stock-watch-results.json');

(async () => {
  let currentCoinPrices: StockAnalysisResult[];

  try {
    const currentCoinJsonData = fs.readFileSync(COIN_PRICES_PATH, 'utf8');
    currentCoinPrices = JSON.parse(currentCoinJsonData);
  } catch (error) {
    console.log(`${logDate()}: Error reading coin prices:`, error);
  }

  coinWatchConfig.forEach(async (cwc) => {
    const coinToCheck = currentCoinPrices.find((x) => x.stockCode === cwc.coinCode);

    if (!coinToCheck) {
      return;
    }

    try {
      await checkPrice(cwc, coinToCheck.currentPrice);
    } catch (error) {
      console.log(`${logDate()}: Error executing program:`, error);
    }
  });
})();
