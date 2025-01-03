"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const yahoo_finance2_1 = __importDefault(require("yahoo-finance2"));
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
const OUTPUT_FILE = path_1.default.resolve(__dirname, 'stock-results.json');
const findLocalMinima = (results) => {
    const prices = results.map((data) => data.low);
    const localMinima = [];
    for (let i = 1; i < prices.length - 1; i++) {
        if (prices[i] < prices[i - 1] && prices[i] < prices[i + 1]) {
            localMinima.push(results[i]);
        }
    }
    return localMinima;
};
const processStock = (stockInput) => __awaiter(void 0, void 0, void 0, function* () {
    const period2 = new Date();
    const now = new Date();
    const period1 = now;
    // 3 months ago
    period1.setDate(period1.getDate() - 90);
    const results = [];
    const apiResults = yield yahoo_finance2_1.default.historical(stockInput.code, {
        period1,
        period2,
    });
    const closePrices = apiResults.map((result) => result.close);
    const absoluteMin = Math.min(...closePrices);
    const absoluteMax = Math.max(...closePrices);
    const localMinimas = findLocalMinima(apiResults)
        .sort((a, b) => a.low - b.low)
        .slice(0, 3);
    const singleResult = {
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
});
const main = () => __awaiter(void 0, void 0, void 0, function* () {
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
    const results = yield Promise.all(stocks.map(processStock));
    try {
        fs_1.default.writeFileSync(OUTPUT_FILE, JSON.stringify(results, null, 2));
        console.log(`Stock results written to ${OUTPUT_FILE}`);
    }
    catch (error) {
        console.error('Error writing to file', error);
    }
});
main();
