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
const https_1 = __importDefault(require("https"));
const path_1 = __importDefault(require("path"));
const logDate_1 = require("./utils/logDate");
const OUTPUT_FILE = path_1.default.resolve(__dirname, 'custom-stock-watch-results.json');
const CUSTOM_STOCKS_WATCH_FILE_PATH = path_1.default.resolve(__dirname, 'customStocksWatch.json');
const CUSTOM_COINS_WATCH_FILE_PATH = path_1.default.resolve(__dirname, 'customCoinsWatch.json');
var ShareType;
(function (ShareType) {
    ShareType[ShareType["Stock"] = 0] = "Stock";
    ShareType[ShareType["Coin"] = 1] = "Coin";
})(ShareType || (ShareType = {}));
const calculateSafeDelay = (numRequests, maxRequestsPerMinute = 5) => {
    const delayPerRequest = Math.ceil(60 / maxRequestsPerMinute);
    const totalDelay = numRequests * delayPerRequest;
    return delayPerRequest * 1000;
};
function delay(ms) {
    return new Promise((resolve) => setTimeout(resolve, ms));
}
const fetchCoinData = (coinCode) => {
    return new Promise((resolve, reject) => {
        const url = `https://api.coingecko.com/api/v3/coins/${coinCode}/market_chart?vs_currency=pln&days=90`;
        https_1.default
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
const getPercentageProgressToAttractivePriceStart = (coinDetails) => {
    return (((coinDetails.currentPrice - coinDetails.attractivePriceStart) /
        (coinDetails.absoluteMax - coinDetails.attractivePriceStart)) *
        100);
};
const readStocksCoinsConfigData = () => {
    try {
        const stocksString = fs_1.default.readFileSync(CUSTOM_STOCKS_WATCH_FILE_PATH, 'utf8');
        const coinsString = fs_1.default.readFileSync(CUSTOM_COINS_WATCH_FILE_PATH, 'utf8');
        const stocksRes = JSON.parse(stocksString);
        const coinsRes = JSON.parse(coinsString);
        return { stocks: [...stocksRes], coins: [...coinsRes] };
    }
    catch (error) {
        console.log(`${(0, logDate_1.logDate)()}: Error trying to read config`, error);
    }
};
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
        attractivePriceUberLow: stockInput.attractivePriceUberLow,
        attractivePriceStart: stockInput.attractivePriceStart,
        percentageProgressToAttractivePriceStart: -1,
        url: stockInput.url,
        type: ShareType.Stock,
    };
    singleResult.percentageProgressToAttractivePriceStart = getPercentageProgressToAttractivePriceStart(singleResult);
    return singleResult;
});
const processCoin = (coinInput) => __awaiter(void 0, void 0, void 0, function* () {
    const period2 = new Date();
    const now = new Date();
    const period1 = new Date(now);
    period1.setDate(period1.getDate() - 90);
    const response = yield fetchCoinData(coinInput.code);
    const apiResults = response.prices.map((price) => ({
        date: new Date(price[0]),
        price: price[1],
    }));
    const prices = apiResults.map((result) => result.price);
    const halfWayPrice = coinInput.max / 2;
    const attractivePriceStart = halfWayPrice < coinInput.min ? coinInput.min : halfWayPrice;
    const singleResult = {
        stockCode: coinInput.code,
        stockName: coinInput.name,
        absoluteMin: coinInput.min,
        absoluteMax: coinInput.max,
        currentPrice: prices[prices.length - 1],
        periodStart: period1.toLocaleDateString(),
        periodEnd: period2.toLocaleDateString(),
        attractivePriceStart: attractivePriceStart,
        attractivePriceUberLow: coinInput.min,
        percentageProgressToAttractivePriceStart: -1,
        url: coinInput.url,
        type: ShareType.Coin,
    };
    singleResult.percentageProgressToAttractivePriceStart = getPercentageProgressToAttractivePriceStart(singleResult);
    return singleResult;
});
function processCoinsSequentially(coins) {
    return __awaiter(this, void 0, void 0, function* () {
        const safeDelayTime = calculateSafeDelay(coins.length);
        // const safeDelayTime = 5000;
        console.log(`${(0, logDate_1.logDate)()}: Using a delay of ${safeDelayTime / 1000} seconds between each request.`);
        const results = [];
        for (const coin of coins) {
            try {
                const result = yield processCoin(coin);
                results.push(result);
                console.log(`${(0, logDate_1.logDate)()}: Processed OK coin: ${coin.code} ${result.currentPrice}`);
            }
            catch (error) {
                console.error(`${(0, logDate_1.logDate)()}: Error processing coin: ${coin.code}`, error);
            }
            yield delay(safeDelayTime);
        }
        return results;
    });
}
const main = () => __awaiter(void 0, void 0, void 0, function* () {
    const fileReadResult = readStocksCoinsConfigData();
    if (!(fileReadResult === null || fileReadResult === void 0 ? void 0 : fileReadResult.stocks) || !(fileReadResult === null || fileReadResult === void 0 ? void 0 : fileReadResult.coins)) {
        return;
    }
    let stockResults = yield Promise.all(fileReadResult.stocks.map(processStock));
    let coinResults = yield processCoinsSequentially(fileReadResult.coins);
    const combined = [...stockResults, ...coinResults];
    try {
        fs_1.default.writeFileSync(OUTPUT_FILE, JSON.stringify(combined, null, 2));
        console.log(`${(0, logDate_1.logDate)()}: Stock results written to ${OUTPUT_FILE}`);
    }
    catch (error) {
        console.error(`${(0, logDate_1.logDate)()}: Error writing to file`, error);
    }
});
main();
