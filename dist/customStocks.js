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
const processStock = (stockInput) => __awaiter(void 0, void 0, void 0, function* () {
    const period2 = new Date();
    const now = new Date();
    const period1 = now;
    // 3 months ago
    period1.setDate(period1.getDate() - 90);
    const apiResults = yield yahoo_finance2_1.default.historical(stockInput.code, {
        period1,
        period2,
    });
    const closePrices = apiResults.map((result) => result.close);
    const absoluteMin = Math.min(...closePrices);
    const absoluteMax = Math.max(...closePrices);
    const singleResult = {
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
});
const main = () => __awaiter(void 0, void 0, void 0, function* () {
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
    let results = yield Promise.all(stocks.map(processStock));
    results = results.map((x) => {
        const stockDetail = stocks.find((s) => s.code === x.stockCode);
        if (!stockDetail) {
            return x;
        }
        return Object.assign(Object.assign({}, x), { attractivePriceMax: stockDetail.attractivePriceMax, attractivePriceMin: stockDetail.attractivePriceMin, url: stockDetail.url });
    });
    fs_1.default.writeFile('custom-stock-watch-results.json', JSON.stringify(results, null, 2), (err) => {
        if (err) {
            console.error('Error writing to file', err);
        }
        else {
            console.log('Stock results written to custom-stock-watch-results.json');
        }
    });
});
main();
